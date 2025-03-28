import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'latest';
  
  // Proxy request to your backend
  const res = await fetch(`http://localhost:3005/posts?type=${type}`);
  
  if (!res.ok) {
    return NextResponse.error();
  }
  
  const data = await res.json();
  return NextResponse.json(data);
}
