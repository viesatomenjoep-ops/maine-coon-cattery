const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Er staat een verdwaald package-lock.json in de homedir, waardoor Next
  // anders de verkeerde workspace-root raadt (breekt Turbopack's module-
  // resolutie). Dit pint de root altijd op deze projectmap.
  turbopack: {
    root: __dirname,
  },
};
module.exports = nextConfig;
