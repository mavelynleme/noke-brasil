import type { NextConfig } from "next";
const config: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "9mb" } },
  transpilePackages: [
    "@noke/domain",
    "@noke/design-tokens",
    "@noke/validation",
  ],
};
export default config;
