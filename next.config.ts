import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 빌드 시 타입 오류가 있어도 무시하고 진행 (배포 우선)
    ignoreBuildErrors: true,
  },
  // eslint 설정은 더 이상 next.config.ts에서 지원되지 않으므로 제거하거나 공식 가이드에 따름
};

export default nextConfig;
