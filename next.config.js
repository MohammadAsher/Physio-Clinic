/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ye line saare TypeScript errors ignore kar degi build ke waqt
    ignoreBuildErrors: true, 
  },
  eslint: {
    // Ye line ESLint ke warnings ignore kar degi
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig