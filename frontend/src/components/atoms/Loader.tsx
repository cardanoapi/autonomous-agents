import React from 'react';

import { CircularProgress } from '@mui/material';

export default function Loader() {
    return (
        <div className="flex h-[100%] w-[100%] items-center justify-center">
            <CircularProgress />
        </div>
    );
}
