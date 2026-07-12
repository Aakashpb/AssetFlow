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
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
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
        btn: '14px',
        card: '20px',
        input: '12px',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.08)',
        softDark: '0 10px 30px rgba(0,0,0,0.3)',
        glow: 'var(--shadow-glow)',
      }
    },
  },
  plugins: [],
}
