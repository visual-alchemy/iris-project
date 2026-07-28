import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-data text-sm tracking-wider uppercase transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-sig-green disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-phos-white text-crt-bg hover:bg-phos-dim',
        destructive: 'bg-sig-red text-phos-white hover:bg-sig-red/80',
        outline: 'border border-grid-strong bg-transparent text-phos-white hover:bg-crt-field',
        secondary: 'bg-crt-field text-phos-white hover:bg-grid-strong',
        ghost: 'text-phos-dim hover:bg-crt-field hover:text-phos-white',
        link: 'text-phos-white underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2 text-xs',
        lg: 'h-10 px-5 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
