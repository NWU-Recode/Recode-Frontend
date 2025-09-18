export const themes = [
  {
    name: 'neutral',
    label: 'Default Theme',
    activeColor: {
      light: '270 95.2% 75.3%', // purple-400
      dark: '270 95.2% 75.3%',
    },
    cssVars: {
      light: {
        /* core surface / text */
        'background': '0 0% 96.1%',       // neutral-100
        'foreground': '0 0% 25.1%',       // neutral-700
        'card': '0 0% 100%',
        'card-foreground': '0 0% 25.1%',
        'popover': '0 0% 100%',
        'popover-foreground': '0 0% 25.1%',

        /* brand colors */
        'primary': '270 95.2% 75.3%',     // purple-400
        'primary-foreground': '0 0% 25.1%',

        'secondary': '213.1 93.9% 67.8%', // blue-400
        'secondary-foreground': '0 0% 25.1%',

        'tertiary': '328.6 85.5% 70.2%',  // pink-400
        'tertiary-foreground': '0 0% 25.1%',

        /* neutral */
        'neutral': '0 0% 63.9%',          // neutral-400
        'neutral-foreground': '0 0% 25.1%',

        /* semantics */
        'success': '141.9 69.2% 58.0%',   // green-400
        'success-foreground': '0 0% 25.1%',

        'warning': '47.9 95.8% 53.1%',    // yellow-400
        'warning-foreground': '0 0% 25.1%',

        'destructive': '0 95.3% 74.7%',   // red-400
        'destructive-foreground': '0 0% 25.1%',

        /* utility */
        'muted': '0 0% 90%',
        'muted-foreground': '0 0% 45%',
        'accent': '328.6 85.5% 70.2%',
        'accent-foreground': '0 0% 25.1%',

        'border': '0 0% 89.8%',
        'input': '0 0% 89.8%',
        'ring': '270 95.2% 75.3%',
        'radius': '0.5rem',
      },
      dark: {
        /* core surface / text */
        'background': '0 0% 9.0%',        // neutral-900
        'foreground': '0 0% 96.1%',       // neutral-100
        'card': '0 0% 9.0%',
        'card-foreground': '0 0% 96.1%',
        'popover': '0 0% 9.0%',
        'popover-foreground': '0 0% 96.1%',

        /* brand colors */
        'primary': '270 95.2% 75.3%',     // purple-400
        'primary-foreground': '0 0% 96.1%',

        'secondary': '213.1 93.9% 67.8%', // blue-400
        'secondary-foreground': '0 0% 96.1%',

        'tertiary': '328.6 85.5% 70.2%',  // pink-400
        'tertiary-foreground': '0 0% 96.1%',

        /* neutral */
        'neutral': '0 0% 63.9%',          // neutral-400
        'neutral-foreground': '0 0% 96.1%',

        /* semantics */
        'success': '141.9 69.2% 58.0%',   // green-400
        'success-foreground': '0 0% 96.1%',

        'warning': '47.9 95.8% 53.1%',    // yellow-400
        'warning-foreground': '0 0% 96.1%',

        'destructive': '0 95.3% 74.7%',   // red-400
        'destructive-foreground': '0 0% 96.1%',

        /* utility */
        'muted': '0 0% 20%',
        'muted-foreground': '0 0% 60%',
        'accent': '328.6 85.5% 70.2%',
        'accent-foreground': '0 0% 96.1%',

        'border': '0 0% 14.9%',
        'input': '0 0% 14.9%',
        'ring': '270 95.2% 75.3%',
        'radius': '0.5rem',
      },
    },
  },
] as const

export type Theme = (typeof themes)[number]
