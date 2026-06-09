import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Dosen.' }, { status: 403 });
    }

    const { id: quizId } = await params;
    const { questionText, topic, options } = await request.json();

    if (!questionText || !topic || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Input tidak valid. Soal, topik, dan minimal 2 opsi wajib disediakan.' },
        { status: 400 }
      );
    }

    // Verify at least one correct option and no empty options
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

    // Verify quiz ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
    }

    if (quiz.creatorId !== session.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Create question with options using nested write
    const question = await prisma.question.create({
      data: {
        quizId,
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

    return NextResponse.json({
      message: 'Soal berhasil ditambahkan',
      question,
    }, { status: 201 });
  } catch (error) {
    console.error('Create Question Error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan soal baru' }, { status: 500 });
  }
}
