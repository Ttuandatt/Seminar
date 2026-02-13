/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#2563EB", // --primary
                    dark: "#1D4ED8",    // --primary-dark
                    light: "#DBEAFE",   // --primary-light
                },
                secondary: {
                    DEFAULT: "#64748B", // --secondary
                },
                surface: "#F8FAFC",   // --surface
                border: "#E2E8F0",    // --border
                danger: "#EF4444",    // --error
                success: "#10B981",   // --success
                warning: "#F59E0B",   // --warning
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
