import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === 'gnrnal1075') {
      const response = NextResponse.json({ success: true });
      
      // 쿠키 설정 보강 (SameSite: None 설정하여 iframe 내 크로스 도메인 쿠키 허용)
      response.cookies.set('admin_auth', 'true', {
        httpOnly: true,
        secure: true, // SameSite: None을 위해서는 반드시 true여야 함
        sameSite: 'none',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false, error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
