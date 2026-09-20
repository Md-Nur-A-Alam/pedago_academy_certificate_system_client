/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pedagoacademy.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/auth/:path*`,
      },
      {
        source: "/api/competitions/:path*",
        destination: `${backendUrl}/api/competitions/:path*`,
      },
      {
        source: "/api/participants/:path*",
        destination: `${backendUrl}/api/participants/:path*`,
      },
      {
        source: "/api/certificates/:path*",
        destination: `${backendUrl}/api/certificates/:path*`,
      },
      {
        source: "/api/posters/:path*",
        destination: `${backendUrl}/api/posters/:path*`,
      },
      {
        source: "/api/admins/:path*",
        destination: `${backendUrl}/api/admins/:path*`,
      },
      {
        source: "/api/settings/:path*",
        destination: `${backendUrl}/api/settings/:path*`,
      },
      {
        source: "/api/upload/:path*",
        destination: `${backendUrl}/api/upload/:path*`,
      },
    ];
  },
};

export default nextConfig;
