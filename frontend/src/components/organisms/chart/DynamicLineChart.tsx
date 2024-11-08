import { useEffect, useRef, useState } from 'react';

import { CartesianGrid, Legend, Line, LineChart, Tooltip, YAxis } from 'recharts';

function Chart() {
    const [time] = useState('');
    const [arr, setArr] = useState([
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 5 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 },
        { X: 0 }
    ]);
    const timeoutRef = useRef<any>(null);

    function validate() {
        setArr((prevState) =>
            [...prevState, { X: Math.random() >= 0.5 ? 5 : 0 }].slice(1)
        );
    }

    useEffect(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }
        const interval = 6000;
        const speed = 100;
        for (let i = 0; i < interval; i++) {
            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null;
                validate();
            }, i * speed);
        }
    }, []);
    return (
        <div>
            <h1>{time}</h1>
            <LineChart
                width={730}
                height={250}
                data={arr}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="X" stroke="#8884d8" />
            </LineChart>
        </div>
    );
}

export default Chart;
