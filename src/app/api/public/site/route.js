import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Openbare website van één cattery via de slug. Server-side (service role).
export async function GET(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Geen slug.' }, { status: 400 });

  const { data: tenant } = await db.from('tenants').select('id, name, slug').eq('slug', slug).single();
  if (!tenant) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: sc } = await db
    .from('site_content')
    .select('content')
    .eq('tenant_id', tenant.id)
    .eq('key', 'homepage_nl')
    .maybeSingle();

  return NextResponse.json({
    tenant: { name: tenant.name, slug: tenant.slug },
    content: sc?.content || {},
  });
}
