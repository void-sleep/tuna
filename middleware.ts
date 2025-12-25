import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";
import { locales, type Locale } from './lib/i18n-config';

/**
 * Detect locale from browser's Accept-Language header
 * Only checks the first (highest priority) language
 * Returns 'zh-CN' if user's primary language is Chinese, otherwise 'en'
 */
function getLocaleFromBrowser(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language') || '';

  // Get the first (highest priority) language
  // e.g., "zh-CN,zh;q=0.9,en;q=0.8" -> "zh-cn"
  const firstLang = acceptLanguage.split(',')[0]?.split(';')[0]?.trim().toLowerCase() || '';

  // Check if primary language is Chinese
  return firstLang.startsWith('zh') ? 'zh-CN' : 'en';
}

export async function middleware(request: NextRequest) {
  // Handle Supabase session
  const response = await updateSession(request);

  // Get locale from cookie (user preference takes priority)
  const localeCookie = request.cookies.get('NEXT_LOCALE');

  let locale: string;

  if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
    // User has explicitly set a preference
    locale = localeCookie.value;
  } else {
    // Auto-detect from browser language
    locale = getLocaleFromBrowser(request);
    // Set the cookie for future requests
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt (SEO files)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
