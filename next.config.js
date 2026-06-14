/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', 'pdfkit'],
  },
  images: {
    remotePatterns: {
      protocol: [],
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}

module.exports = nextConfig
