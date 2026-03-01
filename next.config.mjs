/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.109:3000",
    "https://fuzzy-fishstick-q7999v5rxx74269q6-3000.app.github.dev",
    "*.app.github.dev",
    "localhost:3000"
  ],

  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "fuzzy-fishstick-q7999v5rxx74269q6-3000.app.github.dev",
        "*.app.github.dev",
      ],
      bodySizeLimit: "2MB"
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },

  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;