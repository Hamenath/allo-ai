import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "google-auth-library",
    "jose",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Disallow embedding in iframes — clickjacking protection
          { key: "X-Frame-Options", value: "DENY" },
          // Legacy XSS filter (defence-in-depth)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Limit Referer information leakage
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser API access
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS: enforce HTTPS for 1 year (production)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Cross-Origin policies for additional isolation
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
