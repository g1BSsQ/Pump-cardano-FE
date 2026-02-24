import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io', // <--- Cho phép load ảnh từ IPFS
      },
      {
        protocol: 'https',
        hostname: 'cardano-preprod.blockfrost.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Cho ảnh mock data cũ (nếu còn dùng)
      }
    ],
  },
};

export default nextConfig;