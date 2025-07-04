import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    turbo: {
      rules: {
        "*.css": {
          loaders: ["css-loader"],
          as: "*.css",
        },
      },
    },
  },
};

export default nextConfig;
