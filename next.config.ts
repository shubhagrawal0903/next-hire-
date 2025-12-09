import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Deployment ke liye ESLint errors ignore kar rahe hain (Option 1 jo humne discuss kiya tha)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com', // Google/YouTube profile images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com', // Clerk profile images
        port: '',
        pathname: '/**',
      },
      // Future mein agar Cloudinary images use karoge toh yeh uncomment karna:
      // {
      //   protocol: 'https',
      //   hostname: 'res.cloudinary.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;