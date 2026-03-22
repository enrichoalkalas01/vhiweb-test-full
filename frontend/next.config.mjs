/** @type {import('next').NextConfig} */
const nextConfig = {
    // Build as static HTML/CSS/JS — no Node.js server needed
    output: 'export',

    // basePath is set at build time via NEXT_BASE_PATH env var.
    // - Local Docker  : "" (empty, served at /)
    // - Kubernetes    : "/portofolio/show/vhiweb-test-full"
    // This prefixes ALL asset paths (_next/static/...) and Link hrefs
    // so the Ingress rewrite-target captures them correctly.
    basePath: process.env.NEXT_BASE_PATH || '',

    // Required when using output: 'export'
    images: {
        unoptimized: true,
    },
}

export default nextConfig
