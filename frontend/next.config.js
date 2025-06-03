

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    css: true, // ✅ 必须启用 Tailwind v4 的 CSS 支持
  },
};

module.exports = nextConfig;