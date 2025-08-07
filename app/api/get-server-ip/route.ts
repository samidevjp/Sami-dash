import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const requestIp = request.ip;

  console.log('X-Forwarded-For:', forwardedFor);
  console.log('X-Real-IP:', realIp);
  console.log('CF-Connecting-IP:', cfConnectingIp);
  console.log('Request IP:', requestIp);

  let clientIP = 'Unknown';

  if (forwardedFor) {
    console.log('Forwarded For:', forwardedFor);
    clientIP = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIP = realIp;
  } else if (cfConnectingIp) {
    clientIP = cfConnectingIp;
  } else if (requestIp) {
    clientIP = requestIp;
  }

  console.log('Determined Client IP:', clientIP);

  // Check if the IP is a private or loopback address
  const isPrivateOrLoopback = (ip: string) => {
    return /^(::1|fe80::|fc00::|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(
      ip
    );
  };

  if (isPrivateOrLoopback(clientIP)) {
    console.log('Warning: Detected private or loopback address');
  }

  return NextResponse.json({ ip: clientIP }, { status: 200 });
}
