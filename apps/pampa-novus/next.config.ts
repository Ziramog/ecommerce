import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@mercadal/shared-types',
    '@mercadal/commerce-core',
    '@mercadal/commerce-ui',
  ],
  env: {
    // Permite catálogo de resiliencia durante build estático cuando Medusa está en red privada (Tailscale)
    NEXT_PUBLIC_ALLOW_MOCK_FALLBACK:
      process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK ?? 'true',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: '100.124.132.48',
        port: '9000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
      },
    ],
  },
}

export default nextConfig
