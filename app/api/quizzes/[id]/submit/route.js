import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Mahasiswa.' }, { status: 403 });
    }

    const { id: quizId } = await params;
    const { answers } = await request.json(); // Array of { questionId, selectedOptionId }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Format jawaban tidak valid.' }, { status: 400 });
    }

    // Check if the quiz exists and has questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan.' }, { status: 404 });
    }

    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) {
      return NextResponse.json({ error: 'Kuis tidak memiliki pertanyaan.' }, { status: 400 });
    }

    // Check if student has already submitted
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        quizId,
        studentId: session.id,
      },
    });

    if (existingAttempt) {
      return NextResponse.json({ error: 'Anda sudah mengerjakan kuis ini.' }, { status: 400 });
    }

    // Evaluate answers
    let correctCount = 0;
    const processedAnswers = [];

    for (const question of quiz.questions) {
      const submittedAnswer = answers.find(a => a.questionId === question.id);
      const selectedOptionId = submittedAnswer?.selectedOptionId || null;

      let isCorrect = false;
      let selectedOption = null;

      if (selectedOptionId) {
        selectedOption = question.options.find(o => o.id === selectedOptionId);
        if (selectedOption && selectedOption.isCorrect) {
          isCorrect = true;
          correctCount++;
        }
      }

      processedAnswers.push({
        questionId: question.id,
        selectedOptionId,
        isCorrect,
      });
    }

    const score = (correctCount / totalQuestions) * 100;

    // Save attempt and answers inside transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.attempt.create({
        data: {
          quizId,
          studentId: session.id,
          score,
        },
      });

      // Insert answers
      await tx.answer.createMany({
        data: processedAnswers.map(ans => ({
          attemptId: newAttempt.id,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId || '', // fallback to empty if not answered
          isCorrect: ans.isCorrect,
        })),
      });

      return newAttempt;
    });

    return NextResponse.json({
      message: 'Kuis berhasil dikirim',
      attemptId: attempt.id,
      score,
      totalQuestions,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
    }, { status: 201 });
  } catch (error) {
    console.error('Submit Quiz Error:', error);
    return NextResponse.json({ error: 'Gagal memproses pengerjaan kuis' }, { status: 500 });
  }
}
