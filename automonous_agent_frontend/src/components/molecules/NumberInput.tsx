'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input } from '../atoms/Input';
import { cn } from '../lib/utils'; // assuming cn is defined here
import PolygonIcon from '../icons/Polygon'; // Correct import path

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, defaultValue , ...props  }, ref) => {
    return (
      <Input
        className={cn(
          "h-8 w-24 border-2 focus-within:border-brand-Gray-100 active:border-none p-0 text-center",
          className
        )}
        type="number"
        defaultValue={defaultValue}
        ref={ref}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'Input';

export { NumberInput };
