/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				figma: {
					text: '#2C2C2C',
					bg: '#FFFFFF',
					primary: '#48E',
				}
			},
			fontFamily: {
				Montserrat: ['Montserrat', 'sans-serif'],
				roboto: ['Roboto', 'sans-serif'],
			},
		}
	},
	plugins: []
};
