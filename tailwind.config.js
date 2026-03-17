/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './privacy.html', './terms.html'],
    safelist: [
        // Used via JS template literals: `bg-${item.color}`
        'bg-primary', 'bg-secondary', 'bg-accent',
        'text-white', 'text-dark'
    ],
    theme: {
        extend: {
            colors: {
                primary: "#256E91",
                secondary: "#20718E",
                accent: "#D9C8A1",
                light: "#F8F9FA",
                dark: "#2C3E50"
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'serif': ['Playfair Display', 'serif']
            },
            spacing: {
                'section': '5rem',
                'unit': '1rem'
            }
        }
    },
    plugins: [],
}
