import React from 'react';

export default function LogsIcon(props: React.SVGAttributes<any>) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                fill="currentColor"
                d="M17.8 20c-.4 1.2-1.5 2-2.8 2H5c-1.7 0-3-1.3-3-3v-1h12.2c.4 1.2 1.5 2 2.8 2zM19 2c1.7 0 3 1.3 3 3v1h-2V5c0-.6-.4-1-1-1s-1 .4-1 1v13h-1c-.6 0-1-.4-1-1v-1H5V5c0-1.7 1.3-3 3-3zM8 6v2h7V6zm0 4v2h6v-2z"
            />
        </svg>
    );
}
