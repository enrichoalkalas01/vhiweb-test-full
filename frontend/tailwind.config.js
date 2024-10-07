/** @type {import('tailwindcss').Config} */
import flowbite from "flowbite-react/tailwind"
const withMT = require("@material-tailwind/react/utils/withMT")

module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        flowbite.content(),
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [
        flowbite.plugin(),
    ],
};
