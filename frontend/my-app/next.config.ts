import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Course/instructor images can come from anywhere (local /images, Unsplash
    // seed data, or arbitrary URLs an instructor pastes when authoring a course).
    // Allow any remote host so next/image never throws "unconfigured host".
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  // NOTE: Rewrites removed. The frontend calls backend APIs directly using
  // explicit base URLs (API_BASE_URLS in lib/api-config.ts) via apiFetch().
  // Rewrites on /courses, /quiz, /progress collided with Next.js page routes
  // and caused raw JSON to be returned instead of rendering the React pages.
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
