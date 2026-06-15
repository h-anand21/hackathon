import { NextRequest, NextResponse } from 'next/server';
import { corsair, ensureCorsairConfigured } from '@/lib/corsair';
import { processOAuthCallback } from 'corsair/oauth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state in OAuth callback' },
        { status: 400 }
      );
    }

    // Ensure credentials are configured
    await ensureCorsairConfigured();

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/corsair/auth/callback`;

    const result = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri,
    });

    // The callback succeeded, meaning the tokens are saved.
    // Now redirect the user to the onboarding steps.
    const frontendUrl = new URL('/onboarding', request.url);
    frontendUrl.searchParams.set('step', '3'); // Move to background sync step
    frontendUrl.searchParams.set('tenantId', result.tenantId);
    frontendUrl.searchParams.set('plugin', result.plugin);

    return NextResponse.redirect(frontendUrl.toString());
  } catch (error: any) {
    console.error('Error in Corsair OAuth Callback:', error);
    return NextResponse.json(
      { error: 'Internal server error during callback', details: error.message },
      { status: 500 }
    );
  }
}
