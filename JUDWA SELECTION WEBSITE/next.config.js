/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Lets phones on the same Wi-Fi load dev JS; otherwise the page never hydrates (no banners)
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*'],
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
    ],
  },
  // No customer login — old login/signup links go to the guest account page
  redirects: async () => [
    { source: '/auth/:path*', destination: '/account', permanent: false },
  ],
};

module.exports = nextConfig;
