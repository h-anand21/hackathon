import { NextRequest, NextResponse } from 'next/server';
import { corsair } from '@/lib/corsair';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 });
    }

    let tenant = null;
    try {
      tenant = await corsair.manage.tenants.get(tenantId);
    } catch (e) {
      // If it doesn't exist, we'll return an empty list
    }

    const connectedPlugins = tenant ? tenant.connectedPlugins : [];

    return NextResponse.json({ success: true, connectedPlugins });
  } catch (error: any) {
    console.error('Error getting tenant status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
