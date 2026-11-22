/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        agentFeedback: true,
    },

    cacheComponents: false,
    partialPrefetching: false,
    reactCompiler: true,

    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;