import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 관리자 페이지(/admin) 접근 시 인증 확인
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지는 예외 처리
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const authCookie = request.cookies.get('admin_auth');

    // 인증 쿠키가 없거나 값이 'true'가 아니면 로그인 페이지로 리다이렉트
    if (!authCookie || authCookie.value !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: ['/admin/:path*'],
};
