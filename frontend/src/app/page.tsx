'use client';

import React from 'react';

import DashboardChart from '@app/components/Chart/DashboardChart';

import DashboardCards from './components/DashboardCards';

export default function Home() {
    return (
        <div
            className={
                'flex h-full w-full flex-col gap-y-4 overflow-y-auto md:flex-col-reverse md:justify-end  2xl:gap-y-6'
            }
        >
            <DashboardChart className={'h-fit px-1 py-4 md:h-[calc(100vh-300px)] md:gap-y-8 md:p-8'} />
            <DashboardCards
                className={'flex h-full grid-cols-2 flex-col gap-4 md:grid md:h-72 md:w-full lg:h-36 lg:grid-cols-4'}
            />
        </div>
    );
}
