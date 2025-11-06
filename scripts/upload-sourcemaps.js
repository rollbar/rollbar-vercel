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

const ROLLBAR_ACCESS_TOKEN = process.env.ROLLBAR_SERVER_TOKEN;
const ROLLBAR_ENV = process.env.NEXT_PUBLIC_ROLLBAR_ENV || 'development';
const CODE_VERSION = process.env.SOURCE_VERSION || 'latest';
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.BASE_URL || 'http://localhost:3000';

async function uploadSourceMap(mapFilePath, minifiedUrl) {
  if (!ROLLBAR_ACCESS_TOKEN) {
    console.warn('⚠️  ROLLBAR_SERVER_TOKEN not set. Skipping source map upload.');
    console.warn('   Set ROLLBAR_SERVER_TOKEN environment variable to upload source maps.');
    return;
  }

  const mapContent = await readFile(mapFilePath, 'utf8');
  const mapFileName = path.basename(mapFilePath);

  const boundary = `----WebKitFormBoundary${Date.now()}`;
  const formData = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="access_token"`,
    '',
    ROLLBAR_ACCESS_TOKEN,
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

  if (!ROLLBAR_ACCESS_TOKEN) {
    console.log('ℹ️  Source maps will not be uploaded (no ROLLBAR_SERVER_TOKEN)');
    console.log('   For development, this is optional.');
    console.log('   For production, set ROLLBAR_SERVER_TOKEN to enable source map uploads.\n');
    return;
  }

  try {
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

      uploads.push(uploadSourceMap(mapFile, minifiedUrl));
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
