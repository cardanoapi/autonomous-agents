'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '../lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            'bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1',
            className
        )}
        {...props}
    />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            'underline-brand-Blue-200 inline-flex items-center justify-center whitespace-nowrap rounded-sm p-0 px-3 py-1.5 text-sm font-medium decoration-2 underline-offset-8 transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-brand-Blue-200 data-[state=active]:underline',
            className
        )}
        {...props}
    />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            'ring-offset-background focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            className
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
