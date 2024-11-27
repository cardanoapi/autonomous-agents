import React from 'react';

export default function ContentHeader({ children }: { children: React.ReactNode }) {
    return <div className="absolute top-0 z-[20] md:flex w-full pr-4 hidden  ">{children}</div>;
}
