import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Dosen.' }, { status: 403 });
    }

    const { questionId } = await params;
    const { questionText, topic, options } = await request.json();

    if (!questionText || !topic || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Input tidak valid. Soal, topik, dan minimal 2 opsi wajib disediakan.' },
        { status: 400 }
      );
    }

    const correctOptions = options.filter(o => o.isCorrect === true);
    if (correctOptions.length !== 1) {
      return NextResponse.json(
        { error: 'Harus ada tepat 1 pilihan jawaban yang benar.' },
        { status: 400 }
      );
    }

    const hasEmptyOption = options.some(o => !o.optionText || o.optionText.trim() === '');
    if (hasEmptyOption) {
      return NextResponse.json(
        { error: 'Opsi jawaban tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // Find the question and check ownership of the quiz
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 });
    }

    if (question.quiz.creatorId !== session.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Perform update in a transaction: delete old options and insert new ones
    const updatedQuestion = await prisma.$transaction(async (tx) => {
      // Delete old options
      await tx.option.deleteMany({
        where: { questionId },
      });

      // Update question text and topic, and recreate options
      return await tx.question.update({
        where: { id: questionId },
        data: {
          questionText,
          topic: topic.trim(),
          options: {
            create: options.map(o => ({
              optionText: o.optionText.trim(),
              isCorrect: o.isCorrect,
            })),
          },
        },
        include: {
          options: true,
        },
      });
    });

    return NextResponse.json({
      message: 'Soal berhasil diperbarui',
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Update Question Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui soal' }, { status: 500 });
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

    const { questionId } = await params;

    // Find the question and check ownership
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 });
    }

    if (question.quiz.creatorId !== session.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({
      message: 'Soal berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete Question Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus soal' }, { status: 500 });
  }
}
