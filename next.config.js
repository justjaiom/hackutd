/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig

