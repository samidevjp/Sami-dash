const { late } = require('zod');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  safelist: [
    'text-booking-seated',
    'text-booking-late',
    'text-booking-partiallySeated',
    'text-booking-billed',
    'text-booking-finished',
    'text-booking-unconfirmed',
    'text-booking-upcoming',
    'border-booking-seated',
    'border-booking-late',
    'border-booking-partiallySeated',
    'border-booking-billed',
    'border-booking-finished',
    'border-booking-unconfirmed',
    'border-booking-upcoming',
    'bg-booking-seated',
    'bg-booking-late',
    'bg-booking-partiallySeated',
    'bg-booking-billed',
    'bg-booking-finished',
    'bg-booking-unconfirmed',
    'bg-booking-upcoming',
    'stroke-booking-seated',
    'stroke-booking-late',
    'stroke-booking-partiallySeated',
    'stroke-booking-billed',
    'stroke-booking-finished',
    'stroke-booking-unconfirmed',
    'stroke-booking-upcoming',
    'stroke-bookingProgress-seated',
    'stroke-bookingProgress-late',
    'stroke-bookingProgress-partiallySeated',
    'stroke-bookingProgress-billed',
    'stroke-bookingProgress-finished',
    'stroke-bookingProgress-unconfirmed',
    'stroke-bookingProgress-upcoming',
    'bg-bookingProgress-seated',
    'bg-bookingProgress-late',
    'bg-bookingProgress-partiallySeated',
    'bg-bookingProgress-billed',
    'bg-bookingProgress-finished',
    'bg-bookingProgress-unconfirmed',
    'bg-bookingProgress-upcoming',
    'bg-orange-100',
    'border-orange-500'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/stairs.jpg')"
      },
      fontFamily: {
        invoice: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
      },
      fontSize: {
        tiny: '10px',
        mini: '8px'
      },
      boxShadow: {
        'custom-inset':
          'inset 5px 5px 10px #1a2024, inset -5px -5px 10px #2a343a'
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        backgroundPayment: 'hsl(var(--background-payment))',
        tertiary: 'hsl(var(--background-reservation-card))',
        background: 'hsl(var(--background))',
        backgroundForeground: 'hsl(var(--background-foreground))',
        reservationIcon: 'hsl(var(--reservation-icon))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--tertiary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        cancelled: {
          DEFAULT: 'hsl(var(--cancelled))'
        },
        hoverTable: {
          DEFAULT: 'hsl(var(--hover-table))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        gray: {
          DEFAULT: 'hsl(var(--gray))',
          light: 'hsl(var(--gray-light))',
          dark: 'hsl(var(--gray-dark))',
          darker: 'hsl(var(--gray-darker))',
          customGray: 'hsl(var(--custom-gray))',
          customGrayDark: 'hsl(var(--custom-gray-dark))',
          customGrayDarkForeground: 'hsl(var(--custom-gray-dark-foreground))'
        },
        green: {
          DEFAULT: 'hsl(var(--green))'
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))'
        },
        red: {
          DEFAULT: 'hsl(var(--red))'
        },

        green: {
          DEFAULT: 'hsl(var(--green))'
        },
        backgroundPos: {
          DEFAULT: 'hsl(var(--background-pos))'
        },

        backgroundReverse: {
          DEFAULT: 'hsl(var(--background-reverse))'
        },

        bezel: {
          DEFAULT: 'hsl(var(--bezel))'
        },
        booking: {
          DEFAULT: 'hsl(var(--primary))',
          seated: 'hsl(var(--booking-seated))',
          late: 'hsl(var(--booking-late))',
          overtime: 'hsl(var(--booking-late))',
          partiallySeated: 'hsl(var(--booking-partially-seated))',
          billed: 'hsl(var(--booking-billed))',
          finished: 'hsl(var(--booking-finished))',
          unconfirmed: 'hsl(var(--booking-unconfirmed))',
          upcoming: 'hsl(var(--booking-upcoming))'
        },
        bookingProgress: {
          DEFAULT: 'hsl(var(--booking-progress))',
          seated: 'hsl(var(--booking-progress-seated))',
          late: 'hsl(var(--booking-progress-late))',
          overtime: 'hsl(var(--booking-progress-late))',
          partiallySeated: 'hsl(var(--booking-progress-partially-seated))',
          billed: 'hsl(var(--booking-progress-billed))',
          finished: 'hsl(var(--booking-progress-finished))',
          unconfirmed: 'hsl(var(--booking-progress-unconfirmed))',
          upcoming: 'hsl(var(--booking-progress-upcoming))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
