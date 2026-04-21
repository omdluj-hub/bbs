import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'omdluj@gmail.com';

  const debugInfo = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 7) : 'none',
    adminEmail: adminEmail,
    envNode: process.env.NODE_ENV
  };

  if (!apiKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'RESEND_API_KEY가 설정되지 않았습니다.',
      debugInfo 
    });
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail,
      subject: 'Resend 시스템 테스트 메일',
      html: '<p>이 메일이 보인다면 이메일 시스템이 정상 작동하는 것입니다.</p>'
    });

    return NextResponse.json({ 
      success: !result.error, 
      result, 
      debugInfo 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message, 
      debugInfo 
    });
  }
}
