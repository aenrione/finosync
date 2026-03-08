/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "src/app/**/*.{tsx,jsx,ts,js}",
    "src/components/**/*.{tsx,jsx,ts,js}",
    "src/design-system/**/*.{tsx,jsx,ts,js}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // FinoSync Brand Colors
        primary: {
          50: '#e6f7f7',
          100: '#b3e9e9',
          200: '#80dada',
          300: '#4dcccc',
          400: '#1abdbd',  // Main brand color
          500: '#15a3a3',
          600: '#108a8a',
          700: '#0c7070',
          800: '#075757',
          900: '#033d3d',
          950: '#012828',
          DEFAULT: '#1abdbd',
        },
        secondary: {
          50: '#fff8e6',
          100: '#ffedb3',
          200: '#ffe080',
          300: '#ffd44d',
          400: '#ffc71a',
          500: '#e6b010',
          600: '#cc9c0c',
          700: '#b38707',
          800: '#997303',
          900: '#805e00',
          950: '#664b00',
          DEFAULT: '#ffc71a',
        },
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#2a2a2a',
          950: '#1a1a1a',
          1000: '#000000',
          DEFAULT: '#9e9e9e',
        },
        
        // Semantic colors
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#d97706',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#dc2626',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          dark: '#1d4ed8',
        },
        
        // Financial-specific
        income: '#10b981',
        expense: '#ef4444',
        investment: '#8b5cf6',
        crypto: '#f59e0b',
        savings: '#06b6d4',
        
        // Aliases for compatibility
        background: '#ffffff',
        foreground: '#1a1a1a',
        border: '#e0e0e0',
        input: '#f5f5f5',
        ring: '#1abdbd',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f5f5f5',
          foreground: '#616161',
        },
        accent: {
          DEFAULT: '#ffc71a',
          foreground: '#1a1a1a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
      },
      
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'Monaco', 'monospace'],
        // Keep roboto for backwards compatibility
        roboto: ["Roboto", "sans-serif"],
      },
      
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '1' }],
      },
      
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        // Keep for compatibility
        extrablack: '950',
      },
      
      spacing: {
        0: '0',
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
      },
      
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 8px 0 rgba(0, 0, 0, 0.12)',
        lg: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
        xl: '0 12px 24px 0 rgba(0, 0, 0, 0.18)',
        // Keep old shadows for compatibility
        "hard-1": "-2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
        "hard-2": "0px 3px 10px 0px rgba(38, 38, 38, 0.20)",
        "hard-3": "2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
        "hard-4": "0px -3px 10px 0px rgba(38, 38, 38, 0.20)",
        "hard-5": "0px 2px 10px 0px rgba(38, 38, 38, 0.10)",
        "soft-1": "0px 0px 10px rgba(38, 38, 38, 0.1)",
        "soft-2": "0px 0px 20px rgba(38, 38, 38, 0.2)",
        "soft-3": "0px 0px 30px rgba(38, 38, 38, 0.1)",
        "soft-4": "0px 0px 40px rgba(38, 38, 38, 0.1)",
      },
    },
  },
  plugins: [],
}
