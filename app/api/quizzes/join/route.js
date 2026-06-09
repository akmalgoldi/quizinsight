import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Hanya mahasiswa yang dapat bergabung ke kuis' }, { status: 403 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Kode kuis wajib diisi' }, { status: 400 });
    }

    const formattedCode = code.trim().toUpperCase();

    // Find quiz by code
    const quiz = await prisma.quiz.findUnique({
      where: { code: formattedCode },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan. Silakan periksa kembali kode kuis Anda.' }, { status: 404 });
    }

    if (quiz._count.questions === 0) {
      return NextResponse.json({ error: 'Kuis ini belum memiliki soal dan belum siap dikerjakan.' }, { status: 400 });
    }

    // Check if the student has already attempted this quiz
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        quizId: quiz.id,
        studentId: session.id,
      },
    });

    if (existingAttempt) {
      return NextResponse.json({
        message: 'Anda sudah mengerjakan kuis ini sebelumnya.',
        alreadyAttempted: true,
        attemptId: existingAttempt.id,
        quizId: quiz.id,
      });
    }

    return NextResponse.json({
      message: 'Berhasil bergabung ke kuis',
      quizId: quiz.id,
      title: quiz.title,
    });
  } catch (error) {
    console.error('Join Quiz Error:', error);
    return NextResponse.json({ error: 'Gagal bergabung ke kuis' }, { status: 500 });
  }
}
