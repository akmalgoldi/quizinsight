import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (session.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Dosen.' }, { status: 403 });
    }

    const { id: quizId } = await params;

    // Verify quiz exists and belongs to lecturer
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
      return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
    }

    if (quiz.creatorId !== session.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Fetch all attempts for the quiz
    const attempts = await prisma.attempt.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    const totalParticipants = attempts.length;

    if (totalParticipants === 0) {
      return NextResponse.json({
        quiz,
        totalParticipants: 0,
        averageScore: 0,
        maxScore: 0,
        minScore: 0,
        topicAccuracy: [],
        aiInsight: 'Kuis ini belum memiliki peserta yang mengerjakan. Setelah ada mahasiswa yang submit, AI Insight akan otomatis dibuat.',
        attempts: [],
      });
    }

    // Calculate basic statistics
    const scores = attempts.map(a => a.score);
    const averageScore = Number((scores.reduce((sum, s) => sum + s, 0) / totalParticipants).toFixed(2));
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // Calculate performance per topic
    const topicStats = {}; // { topicName: { totalAnswers: 0, correctAnswers: 0 } }

    const allAnswers = await prisma.answer.findMany({
      where: {
        attempt: {
          quizId,
        },
      },
      include: {
        question: true,
      },
    });

    allAnswers.forEach(ans => {
      const topic = ans.question.topic || 'Umum';
      if (!topicStats[topic]) {
        topicStats[topic] = { totalAnswers: 0, correctAnswers: 0 };
      }
      topicStats[topic].totalAnswers++;
      if (ans.isCorrect) {
        topicStats[topic].correctAnswers++;
      }
    });

    const topicAccuracy = Object.entries(topicStats).map(([topic, stats]) => {
      const accuracy = Number(((stats.correctAnswers / stats.totalAnswers) * 100).toFixed(1));
      let status = 'Cukup (Sedang)';
      if (accuracy >= 80) status = 'Baik (Tinggi)';
      else if (accuracy < 60) status = 'Kurang (Rendah)';

      return {
        topic,
        accuracy,
        status,
        correctCount: stats.correctAnswers,
        totalCount: stats.totalAnswers,
      };
    });

    // Find questions with most mistakes
    const questionStats = {}; // { questionId: { text, topic, total: 0, incorrect: 0 } }
    allAnswers.forEach(ans => {
      const qId = ans.questionId;
      if (!questionStats[qId]) {
        questionStats[qId] = {
          text: ans.question.questionText,
          topic: ans.question.topic,
          total: 0,
          incorrect: 0,
        };
      }
      questionStats[qId].total++;
      if (!ans.isCorrect) {
        questionStats[qId].incorrect++;
      }
    });

    const frequentMistakes = Object.entries(questionStats)
      .map(([id, stats]) => ({
        questionId: id,
        questionText: stats.text,
        topic: stats.topic,
        incorrectPercentage: Number(((stats.incorrect / stats.total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.incorrectPercentage - a.incorrectPercentage)
      .slice(0, 3); // top 3 frequent mistakes

    // Generate AI Insight
    let aiInsight = '';
    const sortedTopics = [...topicAccuracy].sort((a, b) => b.accuracy - a.accuracy);
    const bestTopic = sortedTopics[0];
    const worstTopic = sortedTopics[sortedTopics.length - 1];
    
    // Check if OpenAI Key is configured and is not the mock key
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock_key') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Anda adalah QuizInsight AI, asisten analis data akademik yang cerdas dan objektif untuk dosen.',
              },
              {
                role: 'user',
                content: `Berikan rangkasan evaluasi hasil kuis "${quiz.title}" dalam Bahasa Indonesia.
Konteks data:
- Jumlah peserta: ${totalParticipants} mahasiswa.
- Nilai Rata-rata kelas: ${averageScore} (Skor tertinggi: ${maxScore}, terendah: ${minScore}).
- Performa akurasi topik: ${JSON.stringify(topicAccuracy)}.
- Soal yang paling banyak salah: ${JSON.stringify(frequentMistakes)}.

Berikan analisis yang padat, bahas topik yang dikuasai dengan baik (akurasi tinggi) vs topik yang masih kurang dipahami (akurasi rendah). Sebutkan soal spesifik yang banyak salah jika ada, lalu berikan saran pedagogis taktis untuk dosen agar dapat mengajarkan ulang bagian materi yang kurang tersebut.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 400,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiInsight = data.choices[0].message.content.trim();
        } else {
          console.warn('OpenAI API call failed, falling back to rule-based generation.');
        }
      } catch (err) {
        console.error('OpenAI fetch error:', err);
      }
    }

    // Fallback rule-based AI Insight (if OpenAI key not present or fails)
    if (!aiInsight) {
      const bestTopicText = bestTopic 
        ? `mahasiswa menunjukkan tingkat pemahaman yang paling baik pada topik **${bestTopic.topic}** dengan rata-rata tingkat keberhasilan mencapai **${bestTopic.accuracy}%**.`
        : '';
      const worstTopicText = worstTopic && worstTopic.topic !== bestTopic?.topic
        ? ` Namun, pemahaman pada topik **${worstTopic.topic}** terpantau masih rendah, dengan tingkat akurasi hanya sebesar **${worstTopic.accuracy}%**.`
        : '';
      
      const mistakeText = frequentMistakes.length > 0
        ? ` Kesulitan utama mahasiswa terdeteksi pada soal yang menguji konsep *"${frequentMistakes[0].questionText.substring(0, 60)}..."* di mana **${frequentMistakes[0].incorrectPercentage}%** peserta menjawab salah.`
        : '';

      const recommendationText = worstTopic
        ? ` Disarankan bagi Anda sebagai Dosen untuk menyempatkan waktu sekitar 10-15 menit di awal pertemuan berikutnya untuk mengulas kembali konsep dasar terkait **${worstTopic.topic}** menggunakan analogi visual atau latihan soal interaktif tambahan sebelum berlanjut ke bab baru.`
        : ' Secara keseluruhan performa kelas sudah stabil, disarankan tetap melanjutkan silabus pembelajaran.';

      aiInsight = `### 🤖 AI Insight (Rule-Based Fallback)
Berdasarkan hasil kuis *"${quiz.title}"* dengan total peserta sebanyak **${totalParticipants}** mahasiswa dan nilai rata-rata **${averageScore}/100**, ${bestTopicText}${worstTopicText}.${mistakeText}${recommendationText}`;
    }

    return NextResponse.json({
      quiz,
      totalParticipants,
      averageScore,
      maxScore,
      minScore,
      topicAccuracy,
      frequentMistakes,
      aiInsight,
      attempts: attempts.map(att => ({
        id: att.id,
        studentName: att.student.name,
        studentEmail: att.student.email,
        score: att.score,
        submittedAt: att.submittedAt,
      })),
    });
  } catch (error) {
    console.error('Fetch Analytics Error:', error);
    return NextResponse.json({ error: 'Gagal memproses analisis data kuis' }, { status: 500 });
  }
}
