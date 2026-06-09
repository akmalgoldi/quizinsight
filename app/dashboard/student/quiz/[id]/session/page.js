'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ChevronLeft, ChevronRight, CheckSquare, Loader2, AlertTriangle } from 'lucide-react';

export default function StudentQuizSession({ params }) {
  const router = useRouter();
  const { id: quizId } = use(params);

  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionId }
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function loadQuizSession() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error();
        const userData = await userRes.json();
        setUser(userData.user);

        const quizRes = await fetch(`/api/quizzes/${quizId}`);
        if (!quizRes.ok) {
          const data = await quizRes.json();
          throw new Error(data.error || 'Gagal memuat kuis');
        }
        const quizData = await quizRes.json();
        setQuiz(quizData.quiz);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuizSession();
  }, [quizId]);

  const selectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setError('');
    setSubmitting(true);
    setShowConfirm(false);

    try {
      // Map answers to backend format
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, oId]) => ({
        questionId: qId,
        selectedOptionId: oId,
      }));

      // Include empty answers for skipped questions
      quiz.questions.forEach(q => {
        if (!selectedAnswers[q.id]) {
          formattedAnswers.push({
            questionId: q.id,
            selectedOptionId: null,
          });
        }
      });

      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan kuis');
      }

      // Go to result page and pass statistics in query params or fetch it later
      router.push(`/dashboard/student/quiz/${quizId}/result?attemptId=${data.attemptId}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Membuka Lembar Soal Kuis...</p>
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
          <Link href="/dashboard/student" className="btn btn-secondary">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <>
      <Navbar user={user} />
      <main className="container animate-fade-in" style={{ maxWidth: '1000px' }}>
        {/* Main Quiz grid layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '28px', marginTop: '20px' }}>
          {/* Left panel: Current question & choices */}
          <div>
            <div className="glass-panel" style={{ padding: '32px', minHeight: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Question Info Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span className="badge badge-primary">
                    Soal {currentIdx + 1} dari {totalQuestions}
                  </span>
                  <span className="badge badge-success" style={{ textTransform: 'none' }}>
                    Topik: {currentQuestion.topic}
                  </span>
                </div>

                {/* Question Text */}
                <h3 style={{ fontSize: '20px', color: 'white', fontWeight: '600', lineHeight: '1.5', marginBottom: '28px' }}>
                  {currentQuestion.questionText}
                </h3>

                {/* Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => selectOption(currentQuestion.id, option.id)}
                        className="btn"
                        style={{
                          justifyContent: 'flex-start',
                          padding: '16px 20px',
                          textAlign: 'left',
                          background: isSelected 
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' 
                            : 'rgba(15, 23, 42, 0.4)',
                          border: isSelected 
                            ? '1px solid var(--primary)' 
                            : '1px solid var(--glass-border)',
                          color: isSelected ? 'white' : 'var(--text-secondary)',
                          fontSize: '15px',
                          borderRadius: '12px',
                        }}
                      >
                        <span 
                          style={{ 
                            background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                            color: isSelected ? 'white' : 'var(--text-muted)',
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '6px', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            marginRight: '12px',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {option.optionText}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '32px' }}>
                <button 
                  onClick={handlePrev} 
                  className="btn btn-secondary" 
                  disabled={currentIdx === 0}
                  style={{ gap: '6px' }}
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>
                
                {currentIdx === totalQuestions - 1 ? (
                  <button 
                    onClick={() => setShowConfirm(true)} 
                    className="btn btn-success" 
                    style={{ gap: '6px' }}
                    disabled={submitting}
                  >
                    <CheckSquare size={16} />
                    Kirim Kuis
                  </button>
                ) : (
                  <button 
                    onClick={handleNext} 
                    className="btn btn-secondary"
                    style={{ gap: '6px' }}
                  >
                    Selanjutnya
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Navigation sheet */}
          <div>
            <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'white' }}>Navigasi Soal</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                  Terjawab: <strong>{answeredCount}</strong> dari <strong>{totalQuestions}</strong>
                </p>

                {/* Grid of numbers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  {quiz.questions.map((q, idx) => {
                    const isCurrent = idx === currentIdx;
                    const isAnswered = !!selectedAnswers[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '8px',
                          border: isCurrent 
                            ? '2px solid var(--primary)' 
                            : '1px solid var(--glass-border)',
                          background: isCurrent 
                            ? 'rgba(99, 102, 241, 0.1)' 
                            : isAnswered 
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(10, 165, 233, 0.15) 100%)'
                              : 'rgba(15, 23, 42, 0.3)',
                          color: isCurrent 
                            ? 'white' 
                            : isAnswered 
                              ? 'var(--success)' 
                              : 'var(--text-secondary)',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit panel indicator */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '24px' }}>
                <button 
                  onClick={() => setShowConfirm(true)} 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={submitting}
                >
                  Kirim Lembar Jawaban
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirm && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertTriangle size={28} style={{ color: 'var(--warning)' }} />
              </div>
              <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Kirim Lembar Jawaban?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                {answeredCount < totalQuestions 
                  ? `Anda baru menjawab ${answeredCount} dari ${totalQuestions} soal. Apakah Anda yakin ingin mengirim kuis sekarang?`
                  : 'Apakah Anda yakin ingin mengirim semua jawaban Anda? Tindakan ini tidak dapat dibatalkan.'
                }
              </p>

              {error && (
                <div className="badge-error" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', width: '100%', textTransform: 'none', display: 'block' }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setShowConfirm(false)} className="btn btn-secondary" disabled={submitting}>
                  Kembali Periksa
                </button>
                <button onClick={handleSubmitQuiz} className="btn btn-success" disabled={submitting}>
                  {submitting ? 'Mengirim...' : 'Ya, Kirim'}
                </button>
              </div>
            </div>
          </div>
        )}
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
