"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

const labelVariants = cva(
  "text-sm font-[500] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
      variants : {
        size : {
            small : 'text-[12px] leading-[18px]',
            medium :'text-[14px] leading-[21px]',
            large : 'text-[24px] leading-[24px] font-[600px]',
        },
      },
      defaultVariants : {
        size : 'small'
      }
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, size , ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants, className , size)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
