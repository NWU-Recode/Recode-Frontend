import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
    {
      variants: {
        variant: {
          default: `
          bg-[hsl(270_95.2%_75.3%)] text-[hsl(0_0%_25.1%)] shadow
          hover:bg-[hsl(270_95.2%_75.3%/_0.9)]
          focus-visible:ring-[hsl(270_95.2%_75.3%)]
          dark:bg-[hsl(270_95.2%_75.3%)] dark:text-[hsl(0_0%_96.1%)]
          dark:hover:bg-[hsl(270_95.2%_75.3%/_0.9)]
        `,
          destructive: `
          bg-[hsl(0_95.3%_74.7%)] text-[hsl(0_0%_25.1%)] shadow-sm
          hover:bg-[hsl(0_95.3%_74.7%/_0.9)]
          dark:bg-[hsl(0_95.3%_74.7%)] dark:text-[hsl(0_0%_96.1%)]
          dark:hover:bg-[hsl(0_95.3%_74.7%/_0.9)]
        `,
          secondary: `
          bg-[hsl(213.1_93.9%_67.8%)] text-[hsl(0_0%_25.1%)] shadow-sm
          hover:bg-[hsl(213.1_93.9%_67.8%/_0.8)]
          dark:bg-[hsl(213.1_93.9%_67.8%)] dark:text-[hsl(0_0%_96.1%)]
          dark:hover:bg-[hsl(213.1_93.9%_67.8%/_0.8)]
        `,
          outline: `
          bg-[hsl(0_0%_96.1%)] text-[hsl(0_0%_25.1%)] border-2 border-[hsl(270_95.2%_75.3%)] shadow-sm
          hover:bg-[hsl(270_95.2%_75.3%)] hover:text-[hsl(0_0%_96.1%)]
          dark:bg-[hsl(0_0%_9%)] dark:text-[hsl(0_0%_96.1%)] dark:border-[hsl(270_95.2%_75.3%)]
          dark:hover:bg-[hsl(270_95.2%_75.3%)] dark:hover:text-[hsl(0_0%_9%)]
        `,

          ghost: `
          hover:bg-[hsl(328.6_85.5%_70.2%)] hover:text-[hsl(0_0%_25.1%)]
          dark:hover:bg-[hsl(328.6_85.5%_70.2%)] dark:hover:text-[hsl(0_0%_96.1%)]
        `,
          link: `
          text-[hsl(270_95.2%_75.3%)] underline-offset-4 hover:underline
          dark:text-[hsl(270_95.2%_75.3%)]
        `,
        },
        size: {
          default: 'h-9 px-4 py-2',
          xs: 'h-7 rounded px-2 text-xs',
          sm: 'h-8 rounded-md px-3 text-xs',
          lg: 'h-10 rounded-md px-8',
          icon: 'h-9 w-9',
        },
      },
      defaultVariants: {
        variant: 'default',
        size: 'default',
      },
    }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>