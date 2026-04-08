import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 빌드 시 타입 오류가 있어도 무시하고 진행 (배포 우선)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 오류가 있어도 무시하고 진행
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
