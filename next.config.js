/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true
  },
  transpilePackages: [
    'react-chartjs-2', 
    'chart.js'
  ]
}

module.exports = nextConfig
