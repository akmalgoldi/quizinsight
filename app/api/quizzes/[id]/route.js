import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    const { id } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
    }

    // If it's a student, remove the isCorrect attribute from options to prevent cheating!
    if (session.role === 'STUDENT') {
      const sanitizedQuestions = quiz.questions.map((question) => ({
        ...question,
        options: question.options.map((option) => ({
          id: option.id,
          optionText: option.optionText,
          questionId: option.questionId,
        })),
      }));

      return NextResponse.json({
        quiz: {
          ...quiz,
          questions: sanitizedQuestions,
        },
      });
    }

    // For LECTURER, return everything (with correct option info)
    if (quiz.creatorId !== session.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Fetch Single Quiz Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kuis' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Dosen.' }, { status: 403 });
    }

    const { id } = await params;
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Judul kuis wajib diisi' }, { status: 400 });
    }

    // Verify ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
    }

    if (quiz.creatorId !== session.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: { title, description },
    });

    return NextResponse.json({
      message: 'Kuis berhasil diupdate',
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error('Update Quiz Error:', error);
    return NextResponse.json({ error: 'Gagal mengupdate kuis' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Dosen.' }, { status: 403 });
    }

    const { id } = await params;

    // Verify ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
    }

    if (quiz.creatorId !== session.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Kuis berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete Quiz Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus kuis' }, { status: 500 });
  }
}
