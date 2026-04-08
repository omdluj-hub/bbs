import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // 인증 쿠키 삭제 (만료 시간을 과거로 설정)
  (await cookies()).set('admin_auth', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
