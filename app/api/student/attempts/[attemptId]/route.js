import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { attemptId } = await params;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            title: true,
            code: true,
            description: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                questionText: true,
                topic: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Data pengerjaan tidak ditemukan' }, { status: 404 });
    }

    if (attempt.studentId !== session.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const correctCount = attempt.answers.filter(a => a.isCorrect).length;
    const totalCount = attempt.answers.length;

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        submittedAt: attempt.submittedAt,
        quizTitle: attempt.quiz.title,
        quizCode: attempt.quiz.code,
        correctCount,
        incorrectCount: totalCount - correctCount,
        totalCount,
        answers: attempt.answers.map(ans => ({
          id: ans.id,
          questionText: ans.question.questionText,
          topic: ans.question.topic,
          isCorrect: ans.isCorrect,
        })),
      },
    });
  } catch (error) {
    console.error('Fetch Attempt Detail Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail pengerjaan' }, { status: 500 });
  }
}
