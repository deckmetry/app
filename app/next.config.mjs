/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: "images.trex.com" },
      { hostname: "images.homedepot.ca" },
      { hostname: "keylinkonline.com" },
      { hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
    ],
  },
}

export default nextConfig
