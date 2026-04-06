import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  excludeFile: (str: string) => str.includes("kembuk-office") || str.includes("web-kembuk"),
};

export default nextConfig;
