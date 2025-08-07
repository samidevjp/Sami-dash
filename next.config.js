/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
        port: '',
        pathname: '/links/**'
      },
      {
        protocol: 'https',
        hostname: 'wabi-staging.s3.ap-southeast-2.amazonaws.com',
        port: '',
        pathname: '/**/**'
      },
      {
        protocol: 'https',
        hostname: 'image.wabify.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

module.exports = nextConfig;
