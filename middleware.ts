import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Unauthenticated → login
  if (!user && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Authenticated on auth page → redirect to their dashboard
  if (user && pathname.startsWith('/auth')) {
    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single();
    const role = profile?.role?.toLowerCase() ?? 'worker';
    return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
  }

  // Role-based protection: prevent a worker from accessing /dashboard/admin etc.
  if (user && pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single();
    if (!profile) return NextResponse.redirect(new URL('/auth/login', request.url));
    const role = profile.role.toLowerCase();
    const segment = pathname.split('/')[2];
    if (segment && segment !== role) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|workbox).*)'],
};
