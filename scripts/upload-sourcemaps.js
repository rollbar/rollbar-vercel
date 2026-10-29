#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const https = require('https');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

/**
 * Upload source maps to Rollbar
 * This script finds all .map files in the .next directory and uploads them to Rollbar
 */

const ROLLBAR_ENV = process.env.NEXT_PUBLIC_ROLLBAR_ENV || 'development';
const CODE_VERSION = process.env.SOURCE_VERSION || 'latest';
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.BASE_URL || 'http://localhost:3000';

const VERCEL_MINT_URL = 'https://api.vercel.com/v1/integrations/marketplace/resources';
const ROLLBAR_EXCHANGE_URL =
  process.env.ROLLBAR_VERCEL_EXCHANGE_URL || 'https://rollbar.com/vercel/v1/token/';
// The upload is optional, so a stalled mint or exchange must not hold up the build.
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Get a server token for the upload.
 *
 * ROLLBAR_SERVER_TOKEN wins when set. Otherwise, on a Vercel build with the Rollbar
 * integration, mint a five minute resource token from Vercel with the build's
 * VERCEL_OIDC_TOKEN and trade it at Rollbar for a server token that expires in an hour,
 * so no long-lived secret has to sit in the project's environment variables.
 */
async function getServerToken() {
  if (process.env.ROLLBAR_SERVER_TOKEN) {
    return process.env.ROLLBAR_SERVER_TOKEN;
  }

  const resourceId = process.env.ROLLBAR_VERCEL_RESOURCE_ID;
  if (!resourceId) {
    return null;
  }
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  if (!oidcToken) {
    throw new Error(
      'ROLLBAR_VERCEL_RESOURCE_ID is set but VERCEL_OIDC_TOKEN is not. Run the build on Vercel ' +
        'with OIDC enabled, or run `vercel env pull` to get a token for a local build.'
    );
  }

  const mint = await fetch(`${VERCEL_MINT_URL}/${encodeURIComponent(resourceId)}/token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${oidcToken}`, 'Content-Type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!mint.ok) {
    throw new Error(`Vercel did not mint a resource token: ${mint.status} ${await mint.text()}`);
  }
  const { token: resourceToken } = await mint.json();
  if (!resourceToken) {
    throw new Error('Vercel accepted the mint request but returned no token');
  }

  const exchange = await fetch(ROLLBAR_EXCHANGE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resourceToken}`,
      'Content-Type': 'application/json',
    },
    // ROLLBAR_PROJECT is only needed when the Rollbar resource has several connected projects.
    body: JSON.stringify(process.env.ROLLBAR_PROJECT ? { project: process.env.ROLLBAR_PROJECT } : {}),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!exchange.ok) {
    throw new Error(`Rollbar did not exchange the token: ${exchange.status} ${await exchange.text()}`);
  }
  const { access_token: accessToken } = await exchange.json();
  if (!accessToken) {
    throw new Error('Rollbar accepted the exchange but returned no access_token');
  }
  console.log('Got a one hour Rollbar server token through the Vercel OIDC exchange');
  return accessToken;
}

async function uploadSourceMap(mapFilePath, minifiedUrl, accessToken) {
  const mapContent = await readFile(mapFilePath, 'utf8');
  const mapFileName = path.basename(mapFilePath);

  const boundary = `----WebKitFormBoundary${Date.now()}`;
  const formData = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="access_token"`,
    '',
    accessToken,
    `--${boundary}`,
    `Content-Disposition: form-data; name="version"`,
    '',
    CODE_VERSION,
    `--${boundary}`,
    `Content-Disposition: form-data; name="minified_url"`,
    '',
    minifiedUrl,
    `--${boundary}`,
    `Content-Disposition: form-data; name="source_map"; filename="${mapFileName}"`,
    'Content-Type: application/json',
    '',
    mapContent,
    `--${boundary}--`,
    ''
  ].join('\r\n');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.rollbar.com',
      port: 443,
      path: '/api/1/sourcemap',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ Uploaded: ${mapFileName} -> ${minifiedUrl}`);
          resolve(data);
        } else {
          console.error(`✗ Failed to upload ${mapFileName}: ${res.statusCode} ${data}`);
          reject(new Error(`Upload failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`✗ Error uploading ${mapFileName}:`, error.message);
      reject(error);
    });

    req.write(formData);
    req.end();
  });
}

async function main() {
  console.log('\n🗺️  Uploading source maps to Rollbar...\n');
  console.log(`Environment: ${ROLLBAR_ENV}`);
  console.log(`Code Version: ${CODE_VERSION}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    const accessToken = await getServerToken();
    if (!accessToken) {
      console.log('ℹ️  Source maps will not be uploaded (no server token)');
      console.log('   For development, this is optional.');
      console.log('   Set ROLLBAR_VERCEL_RESOURCE_ID to use the Vercel OIDC exchange,');
      console.log('   or set ROLLBAR_SERVER_TOKEN.\n');
      return;
    }

    // Find all .map files in .next directory
    const mapFiles = await glob('.next/**/*.js.map', {
      ignore: ['**/node_modules/**', '.next/cache/**']
    });

    if (mapFiles.length === 0) {
      console.log('⚠️  No source map files found. Make sure productionBrowserSourceMaps is enabled in next.config.js\n');
      return;
    }

    console.log(`Found ${mapFiles.length} source map files\n`);

    // Upload each source map
    const uploads = [];
    for (const mapFile of mapFiles) {
      // Convert file path to URL path
      // .next/static/chunks/app/page-abc123.js.map -> /_next/static/chunks/app/page-abc123.js
      const relativePath = mapFile.replace('.next/', '_next/').replace('.map', '');
      const minifiedUrl = `${BASE_URL}${relativePath}`;

      uploads.push(uploadSourceMap(mapFile, minifiedUrl, accessToken));
    }

    await Promise.allSettled(uploads);

    console.log('\n✅ Source map upload complete!\n');
  } catch (error) {
    console.error('❌ Error during source map upload:', error);
    // Don't fail the build if source map upload fails
    process.exit(0);
  }
}

main();
