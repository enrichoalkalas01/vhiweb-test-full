/** @type {import('next').NextConfig} */
const nextConfig = {
    // Build as static HTML/CSS/JS — no Node.js server needed
    output: 'export',

    basePath: '/portofolio/show/vhiweb-test-full',

    // Required when using output: 'export'
    images: {
        unoptimized: true,
    },
}

export default nextConfig
