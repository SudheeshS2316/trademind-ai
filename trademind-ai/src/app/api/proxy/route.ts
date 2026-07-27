import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  
  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Validate target domain
  try {
    const parsedUrl = new URL(targetUrl);
    if (!parsedUrl.hostname.endsWith('finance.yahoo.com') && !parsedUrl.hostname.endsWith('yahoo.com')) {
      return NextResponse.json({ error: 'Forbidden: Only Yahoo Finance domains are allowed' }, { status: 403 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid target URL' }, { status: 400 });
  }

  // Secure authorization check using JWT_SECRET
  const authHeader = request.headers.get('x-proxy-secret');
  const expectedSecret = process.env.JWT_SECRET;
  
  if (expectedSecret && authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Collect headers from Render request to forward to Yahoo (including cookies)
    const forwardHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Exclude host and proxy auth secret
      if (key !== 'host' && key !== 'x-proxy-secret' && key !== 'connection') {
        forwardHeaders[key] = value;
      }
    });

    // Enforce a realistic browser user-agent
    forwardHeaders['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: forwardHeaders,
      next: { revalidate: 0 } // Disable Vercel caching
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    
    // Read the response body as text first to handle any response type
    const responseText = await response.text();

    // Prepare response headers to send back to Render
    const responseHeaders = new Headers();
    responseHeaders.set('content-type', contentType);

    // Forward Yahoo's set-cookie headers back to Render so its cookie jar works
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie);
    }

    return new Response(responseText, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error: any) {
    console.error('Proxy request to Yahoo Finance failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch from Yahoo Finance' }, { status: 500 });
  }
}
