/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable source maps in production builds
  productionBrowserSourceMaps: true,

  // Configure Rollbar
  webpack: (config, { isServer, dev }) => {
    // Only modify client-side production builds
    if (!isServer && !dev) {
      // Add source map configuration
      config.devtool = 'hidden-source-map';
    }
    return config;
  },
};

module.exports = nextConfig;
