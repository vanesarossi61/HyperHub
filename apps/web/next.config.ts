import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@hyperhub/db', '@hyperhub/shared', '@hyperhub/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  experimental: {
    // Prepared for future optimizations
  },
}

export default nextConfig
