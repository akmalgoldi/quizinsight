'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Trash2, Plus, Loader2, Save } from 'lucide-react';

export default function QuizQuestions({ params }) {
  const router = useRouter();
  const { id: quizId } = use(params);

  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // Question Form State
  const [questionText, setQuestionText] = useState('');
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState([
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]);

  // Fetch Session and Quiz Questions
  useEffect(() => {
    async function loadQuizData() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error();
        const userData = await userRes.json();
        setUser(userData.user);

        const quizRes = await fetch(`/api/quizzes/${quizId}`);
        if (!quizRes.ok) throw new Error('Kuis tidak ditemukan');
        const quizData = await quizRes.json();
        setQuiz(quizData.quiz);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [quizId]);

  const handleOptionTextChange = (index, value) => {
    setOptions(prev => {
      const copy = [...prev];
      copy[index].optionText = value;
      return copy;
    });
  };

  const handleCorrectOptionChange = (index) => {
    setOptions(prev => 
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === index
      }))
    );
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);

    try {
      // Validate inputs
      if (!questionText.trim()) throw new Error('Pertanyaan wajib diisi');
      if (!topic.trim()) throw new Error('Topik wajib diisi');
      
      const hasEmptyOption = options.some(opt => !opt.optionText.trim());
      if (hasEmptyOption) throw new Error('Semua opsi jawaban wajib diisi');

      const res = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText,
          topic,
          options,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan soal');

      // Append new question to list
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, data.question],
      }));

      // Reset form
      setQuestionText('');
      setTopic('');
      setOptions([
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus soal');
      }

      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId),
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Memuat Halaman Kelola Soal...</p>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '80px' }}>
        <div className="badge-error" style={{ display: 'inline-block', padding: '16px', borderRadius: '12px' }}>
          ⚠️ Error: {error}
        </div>
        <div style={{ marginTop: '24px' }}>
          <Link href="/dashboard/lecturer" className="btn btn-secondary">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <main className="container animate-fade-in">
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/dashboard/lecturer" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px', gap: '6px' }}>
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Quiz Title Header */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Kelola Soal</span>
              <h2 style={{ fontSize: '28px' }}>{quiz.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{quiz.description || 'Tidak ada deskripsi.'}</p>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px dashed rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Kode Kuis</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--secondary)' }}>{quiz.code}</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Add Question Column */}
          <div>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '22px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} style={{ color: 'var(--primary)' }} />
                Tambah Soal Baru
              </h3>

              {error && (
                <div className="badge-error" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', width: '100%', textTransform: 'none', display: 'block' }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleAddQuestion}>
                <div className="form-group">
                  <label className="form-label" htmlFor="questionText">Pertanyaan</label>
                  <textarea
                    id="questionText"
                    className="form-input"
                    placeholder="Tuliskan butir pertanyaan di sini..."
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    style={{ resize: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="topic">Topik Bahasan (Label)</label>
                  <input
                    id="topic"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Entropy, Information Gain, dll."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Topik ini akan dikelompokkan oleh AI untuk melacak akurasi pemahaman kelas.</small>
                </div>

                <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                  <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Pilihan Jawaban (Tandai Kunci Jawaban Benar)</label>
                  
                  {options.map((opt, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <input
                        type="radio"
                        name="correct-option"
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectOptionChange(index)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Opsi ${String.fromCharCode(65 + index)}`}
                        value={opt.optionText}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px', marginTop: '12px' }} disabled={adding}>
                  {adding ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Simpan Soal
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Questions List Column */}
          <div>
            <div className="glass-panel" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '22px', marginBottom: '20px' }}>
                Daftar Soal ({quiz.questions.length})
              </h3>

              {quiz.questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', margin: 'auto 0', color: 'var(--text-muted)' }}>
                  <p>Kuis ini belum memiliki soal.</p>
                  <p style={{ fontSize: '13px', marginTop: '6px' }}>Gunakan formulir di sebelah kiri untuk menambahkan soal pilihan ganda.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
                  {quiz.questions.map((q, qIndex) => (
                    <div key={q.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <span className="badge badge-primary" style={{ fontSize: '10px', marginBottom: '6px' }}>Topik: {q.topic}</span>
                          <h4 style={{ fontSize: '15px', color: 'white', lineHeight: '1.4' }}>{qIndex + 1}. {q.questionText}</h4>
                        </div>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)} 
                          className="btn" 
                          style={{ padding: '4px', background: 'transparent', color: 'var(--text-muted)' }}
                          title="Hapus Soal"
                        >
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </button>
                      </div>

                      {/* Options breakdown */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                        {q.options.map((opt, oIdx) => (
                          <div 
                            key={opt.id} 
                            style={{ 
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              background: opt.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.3)',
                              border: opt.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                              color: opt.isCorrect ? 'var(--success)' : 'var(--text-secondary)'
                            }}
                          >
                            <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt.optionText}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
