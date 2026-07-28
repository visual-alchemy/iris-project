import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center border px-2 py-0.5 text-xs font-data w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow]',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-phos-white text-crt-bg',
        secondary: 'border-transparent bg-crt-field text-phos-white',
        destructive: 'border-transparent bg-sig-red text-phos-white',
        outline: 'text-phos-white border-grid-line',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
