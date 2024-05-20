'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input } from '../atoms/Input';
import { cn } from '../lib/utils'; // assuming cn is defined here
import PolygonIcon from '../icons/Polygon'; // Correct import path

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, defaultValue ,onChange , ...props  }, ref) => {
    return (
      <Input
        className={cn(
          "h-8 w-24 border-[1px] focus:border-brand-Gray-100  p-0 text-center",
          className
        )}
        type="number"
        defaultValue={defaultValue}
        ref={ref}
        onChange={onChange}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'Input';

export { NumberInput };
