/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
        },
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        mainBg: 'var(--bg-main)',
        sidebarBg: 'var(--bg-sidebar)',
        cardBg: 'var(--bg-card)',
        inputBg: 'var(--bg-input)',
        borderCol: 'var(--border-color)',
        borderCardCol: 'var(--border-card)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        sidebarText: 'var(--sidebar-text)',
        sidebarActiveBg: 'var(--sidebar-active-bg)',
        sidebarActiveText: 'var(--sidebar-active-text)',
        hoverBg: 'var(--hover-bg)',
        tagBg: 'var(--tag-bg)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
      }
    },
  },
  plugins: [],
}
