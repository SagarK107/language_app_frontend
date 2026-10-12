import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  experimental: {
    // Limits the overhead of pulling entire heavy UI modules into the bundle
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@chakra-ui/react'],
  },

};

export default nextConfig;
