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
        const response = await fetch('https://umami.sireto.io/api/send', {
            method: 'POST',
            headers: {
                ...Object.fromEntries(headers) // Use all headers except cookie
            },
            body: reqBlob
        });
        // Get the response data
        const data = await response.text();

        const responseHeaders: HeadersInit = Object.fromEntries(response.headers);
        // remove content-encoding gzip
        delete responseHeaders['content-encoding'];

        return new NextResponse(data, {
            headers: responseHeaders,
            status: response.status
        });
    } catch (error: any) {
        console.error('Error calling Umami API:', error.message || error.error || error);
        return NextResponse.json({ error: 'Failed to call Umami API' }, { status: 500 });
    }
}
