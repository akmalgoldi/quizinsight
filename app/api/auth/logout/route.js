import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    
    return NextResponse.json({
      message: 'Logout berhasil',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat logout' },
      { status: 500 }
    );
  }
}
