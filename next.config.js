/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()'
          }
        ]
      }
    ]
  },
  // Webpack konfigūracija
  webpack: (config, { isServer }) => {
    // Optimizacijos
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  // Vaizdų optimizacija
  images: {
    domains: ['tkmmfykdnfghvrdeqksq.supabase.co'], // Jūsų Supabase projektas
    formats: ['image/avif', 'image/webp'],
  },
  // Strict mode
  reactStrictMode: true,
  // Powered by header pašalinimas (saugumo sumetimais)
  poweredByHeader: false,
  // Kompresija
  compress: true,
  // SWC minifikacija
  swcMinify: true,
}

module.exports = nextConfig
