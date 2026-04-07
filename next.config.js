/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress TypeScript errors during build (type-checks are run separately)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Images from Unsplash and other external domains used in landing page
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
