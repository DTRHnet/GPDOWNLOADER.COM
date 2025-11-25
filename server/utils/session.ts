import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function getSessionFromRequest(req: Request): Promise<any> {
  try {
    // Convert Request to NextRequest-like object for getToken
    const url = new URL(req.url);
    const nextReq = new NextRequest(url, {
      headers: req.headers,
    });

    const token = await getToken({
      req: nextReq as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return null;
    }

    // Return session-like object
    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role,
      },
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}
