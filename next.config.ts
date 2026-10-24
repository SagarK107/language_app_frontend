import type { NextConfig } from "next";

// Where Django runs. Set BACKEND_URL on Vercel, e.g. "https://myapp.onrender.com"
// (no trailing slash). Locally it falls back to the Django dev server.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  experimental: {
    // Limits the overhead of pulling entire heavy UI modules into the bundle
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@chakra-ui/react'],
  },

  // Django's URLs end in "/". By default Next.js redirects "/api/me/" to
  // "/api/me", and Django would then redirect back, so keep the slash as is.
  skipTrailingSlashRedirect: true,

  // The browser calls "/api/..." on the frontend's own domain and Next.js
  // forwards the request to Django. To the browser it is one site, so the
  // session cookie is first-party and no CORS is involved.
  async rewrites() {
    return [
      {
        source: "/api/:path*/",
        destination: `${backendUrl}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
