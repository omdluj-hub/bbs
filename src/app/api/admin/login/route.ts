import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // 요청하신 비밀번호 확인
    if (password === 'gnrnal1075') {
      const response = NextResponse.json({ success: true });
      
      // 간단한 인증 쿠키 설정 (7일간 유효)
      (await cookies()).set('admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
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
