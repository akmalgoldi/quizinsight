import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Helper to generate unique 6-character alphanumeric code (e.g. QZ1092)
async function generateQuizCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = 'QZ-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { code },
    });

    if (!existingQuiz) {
      isUnique = true;
    }
  }

  return code;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Dosen.' }, { status: 403 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { creatorId: session.id },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Fetch Quizzes Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kuis' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Dosen.' }, { status: 403 });
    }

    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Judul kuis wajib diisi' }, { status: 400 });
    }

    const code = await generateQuizCode();

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        code,
        creatorId: session.id,
      },
    });

    return NextResponse.json({
      message: 'Kuis berhasil dibuat',
      quiz,
    }, { status: 201 });
  } catch (error) {
    console.error('Create Quiz Error:', error);
    return NextResponse.json({ error: 'Gagal membuat kuis baru' }, { status: 500 });
  }
}
