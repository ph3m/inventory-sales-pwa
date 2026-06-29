import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, role, phone, shop_id } = await req.json();

    if (!full_name || !email || !password)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const supabase = createAdminClient();

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({ id: authUser.user.id, full_name, email, phone: phone || null, role, shop_id: shop_id || null, status: 'active' })
      .select('*, shops(name)')
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ user: profile });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
