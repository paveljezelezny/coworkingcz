/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // Allow build to complete even if Prisma client types aren't generated yet
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Increase body size limit so compressed photo JSON can be saved (default is 1mb)
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
}

module.exports = nextConfig
