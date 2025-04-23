import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Extract headers from the request
    const headers = new Headers(request.headers);

    // Remove the Cookie header
    headers.delete('cookie');

    // Extract the request body
    const reqBlob = await request.blob();

    try {
        // Call the APM API
        const response = await fetch('https://apm.sireto.io/intake/v2/rum/events', {
            method: 'POST',
            headers: {
                ...Object.fromEntries(headers) // Use all headers except cookie
            },
            body: reqBlob
        });
        // Get the response data
        const data = await response.text();

        // Return the response from the APM API
        return new NextResponse(data, {
            headers: response.headers,
            status: response.status
        });
    } catch (error: any) {
        console.error('Error calling APM API:', error.message || error.error || error);
        return NextResponse.json({ error: 'Failed to call APM API' }, { status: 500 });
    }
}
