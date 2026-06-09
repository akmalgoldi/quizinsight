import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const attempts = await prisma.attempt.findMany({
      where: { studentId: session.id },
      include: {
        quiz: {
          select: {
            title: true,
            code: true,
            description: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error('Fetch Student Attempts Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat kuis' }, { status: 500 });
  }
}
