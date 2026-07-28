import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-phos-white placeholder:text-phos-faint flex h-9 w-full min-w-0 bg-crt-field border border-grid-strong px-2 py-1 font-data text-sm text-phos-white transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-sig-green disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
