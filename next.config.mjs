/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          port: ''
        }
      ]
    }
  };
  //res cloudinary is hosting out images therefore it shlould be mentioned in the next.js file 
  export default nextConfig;