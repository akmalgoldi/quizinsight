'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Play, Calendar, HelpCircle, Loader2, ArrowRight, Award } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizCode, setQuizCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch session and quiz history
  useEffect(() => {
    async function initStudentDashboard() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error();
        const userData = await userRes.json();
        setUser(userData.user);

        const attemptsRes = await fetch('/api/student/attempts');
        if (attemptsRes.ok) {
          const attemptsData = await attemptsRes.json();
          setAttempts(attemptsData.attempts);
        }
      } catch (err) {
        console.error('Init student dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    initStudentDashboard();
  }, []);

  const handleJoinQuiz = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!quizCode.trim()) {
      setError('Harap masukkan kode kuis');
      return;
    }

    setJoinLoading(true);

    try {
      const res = await fetch('/api/quizzes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: quizCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal bergabung ke kuis');
      }

      if (data.alreadyAttempted) {
        // Redirect to results if already submitted
        router.push(`/dashboard/student/quiz/${data.quizId}/result?attemptId=${data.attemptId}`);
      } else {
        // Go to quiz session
        router.push(`/dashboard/student/quiz/${data.quizId}/session`);
      }
    } catch (err) {
      setError(err.message);
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Memuat Dashboard Mahasiswa...</p>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <main className="container animate-fade-in">
        <div className="grid-2">
          {/* Join Quiz Section */}
          <div>
            <div className="glass-panel" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={24} style={{ color: 'var(--primary)', fill: 'rgba(99, 102, 241, 0.2)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '24px' }}>Ikuti Kuis Baru</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Masukkan kode kuis dari dosen Anda</p>
                </div>
              </div>

              {error && (
                <div className="badge-error" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', width: '100%', textTransform: 'none', display: 'block' }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleJoinQuiz}>
                <div className="form-group">
                  <label className="form-label" htmlFor="quizCode">Kode Akses Kuis</label>
                  <input
                    id="quizCode"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: QZ-A12BC"
                    value={quizCode}
                    onChange={(e) => setQuizCode(e.target.value)}
                    required
                    style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '18px', textAlign: 'center', fontWeight: 'bold' }}
                    disabled={joinLoading}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px', marginTop: '12px' }} disabled={joinLoading}>
                  {joinLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      Gabung & Kerjakan Kuis
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Quiz History Section */}
          <div>
            <div className="glass-panel" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={24} style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '24px' }}>Riwayat Evaluasi</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Hasil pengerjaan kuis Anda sebelumnya</p>
                </div>
              </div>

              {attempts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', margin: 'auto 0', color: 'var(--text-muted)' }}>
                  <p>Anda belum pernah mengerjakan kuis apa pun.</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Hasil nilai kuis Anda akan muncul di sini setelah Anda mengerjakannya.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                  {attempts.map((attempt) => (
                    <div key={attempt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', color: 'white' }}>{attempt.quiz.title}</h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>Kode: {attempt.quiz.code}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {new Date(attempt.submittedAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Skor</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: attempt.score >= 80 ? 'var(--success)' : attempt.score >= 60 ? 'var(--warning)' : 'var(--error)' }}>
                          {attempt.score}
                        </div>
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
