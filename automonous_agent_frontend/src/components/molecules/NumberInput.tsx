'use client';

import * as React from 'react';

import { Car } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import PolygonIcon from '../icons/Polygon';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
          <Card className='w-[138px] h-[38px] border-[2px] text-[16px] flex '>
              <Input className='w-[80% border-none active:border-none focus:outline-none text-center' defaultValue={0}>
              </Input>
              <>
              <PolygonIcon/>
              <PolygonIcon/>
              </>
          </Card>
        );
    }
);
NumberInput.displayName = 'Input';

export { NumberInput };
