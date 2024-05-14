/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'chillies-n-spices.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'chillyandspices.s3.amazonaws.com'
      }
    ]
  }
}

module.exports = nextConfig
