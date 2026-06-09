import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi' },
        { status: 401 }
      );
    }
    return NextResponse.json({ user: session });
  } catch (error) {
    console.error('Session Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mengecek sesi' },
      { status: 500 }
    );
  }
}
