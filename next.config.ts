import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  basePath: process.env.BASEPATH,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'is-crm-dev-privet.s3.amazonaws.com',
        port: '',
        pathname: '/data/**'
      }
    ]
  },

  redirects: async () => {
    return [
      // {
      //   source: '/',
      //   destination: '/en',
      //   permanent: true,
      //   locale: false
      // },
      // {
      //   source: '/:lang(en|fr|ar|es)',
      //   destination: '/:lang',
      //   permanent: true,
      //   locale: false
      // },
      {
        source: '/((?!(?:en|fr|ar|es|front-pages)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
