import { NextRequest, NextResponse } from 'next/server';
import { corsair, ensureCorsairConfigured } from '@/lib/corsair';
import { generateOAuthUrl } from 'corsair/oauth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const pluginId = searchParams.get('pluginId'); // 'gmail' or 'googlecalendar'

    if (!tenantId || !pluginId) {
      return NextResponse.json(
        { error: 'Missing tenantId or pluginId' },
        { status: 400 }
      );
    }

    // Ensure the Google client credentials are set in the database
    await ensureCorsairConfigured();

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/corsair/auth/callback`;

    const result = await generateOAuthUrl(corsair, pluginId, {
      tenantId,
      redirectUri,
    });

    // Redirect the user to the Google OAuth consent screen
    return NextResponse.redirect(result.url);
  } catch (error: any) {
    console.error('Error generating connect link:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
