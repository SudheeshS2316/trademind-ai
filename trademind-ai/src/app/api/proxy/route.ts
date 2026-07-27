import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  
  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Validate target domain to ensure we only proxy Yahoo Finance requests
  try {
    const parsedUrl = new URL(targetUrl);
    if (!parsedUrl.hostname.endsWith('finance.yahoo.com')) {
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
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 } // Disable caching on Vercel
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch from Yahoo Finance' }, { status: 500 });
  }
}
