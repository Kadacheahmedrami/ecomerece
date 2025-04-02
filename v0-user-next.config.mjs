/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'hkowrikvwngbcdactymh.supabase.co',
      'lh3.googleusercontent.com',
    ],
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;

