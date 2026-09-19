/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pedagoacademy.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
