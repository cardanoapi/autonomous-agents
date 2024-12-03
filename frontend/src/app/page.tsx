'use client';

import React from 'react';

import DashboardChart from '@app/components/Chart/DashboardChart';

import DashboardCards from './components/DashboardCards';

export default function Home() {
    return (
        <div className={'flex flex-col-reverse md:flex-col h-full w-full gap-y-4 2xl:gap-y-8 overflow-y-auto'}>
            <DashboardCards
                className={
                    'flex flex-col h-full md:grid grid-cols-2 md:h-72 lg:grid-cols-4 gap-4 lg:h-36 md:w-full'
                }
            />
            <DashboardChart className={'md:gap-y-8 py-4 md:p-8 md:h-[calc(100vh-300px)] px-1 h-fit'} />
        </div>
    );
}
