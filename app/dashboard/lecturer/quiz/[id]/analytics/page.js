'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Users, BarChart3, TrendingUp, Sparkles, Loader2, Calendar } from 'lucide-react';

export default function QuizAnalytics({ params }) {
  const { id: quizId } = use(params);

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error();
        const userData = await userRes.json();
        setUser(userData.user);

        const analyticsRes = await fetch(`/api/quizzes/${quizId}/analytics`);
        if (!analyticsRes.ok) throw new Error('Gagal memuat analisis kuis');
        const analyticsData = await analyticsRes.json();
        setData(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [quizId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Memuat Analisis Kuis & AI Insight...</p>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
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

  const { quiz, totalParticipants, averageScore, maxScore, minScore, topicAccuracy, frequentMistakes, aiInsight, attempts } = data;

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

        {/* Header Summary */}
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Hasil Evaluasi</span>
          <h2 style={{ fontSize: '30px', color: 'white' }}>{quiz.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{quiz.description || 'Tidak ada deskripsi.'}</p>
        </div>

        {totalParticipants === 0 ? (
          <div className="glass-panel" style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Users size={32} style={{ color: 'var(--warning)' }} />
            </div>
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Belum Ada Peserta</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto' }}>
              Kuis ini belum dikerjakan oleh mahasiswa Anda. Bagikan kode kuis <strong>{quiz.code}</strong> agar mahasiswa dapat mulai menjawab dan memicu visualisasi dashboard ini.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Stat Cards Row */}
            <div className="grid-3">
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '12px' }}>
                  <Users size={28} style={{ color: '#6366f1' }} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Total Peserta</div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', fontFamily: 'var(--font-outfit)' }}>{totalParticipants} <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-muted)' }}>Mhs</span></div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '16px', borderRadius: '12px' }}>
                  <BarChart3 size={28} style={{ color: '#0ea5e9' }} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Nilai Rata-rata Kelas</div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', fontFamily: 'var(--font-outfit)' }}>{averageScore} <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-muted)' }}>/ 100</span></div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px' }}>
                  <TrendingUp size={28} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Skor Tertinggi / Terendah</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'white', fontFamily: 'var(--font-outfit)' }}>
                    {maxScore} <span style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-muted)' }}>/ {minScore}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insight Widget */}
            <div className="ai-insight-box">
              <div className="ai-insight-title">
                <Sparkles size={20} />
                Analisis & Rekomendasi AI Insight
              </div>
              <div className="ai-insight-content">
                {/* Parse Markdown-like bold/list items for better presentation */}
                {aiInsight.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return null;
                  
                  // Format markdown bold (**text**)
                  let formattedText = paragraph;
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  let match;
                  const parts = [];
                  let lastIndex = 0;
                  
                  while ((match = boldRegex.exec(paragraph)) !== null) {
                    parts.push(paragraph.substring(lastIndex, match.index));
                    parts.push(<strong key={match.index}>{match[1]}</strong>);
                    lastIndex = boldRegex.lastIndex;
                  }
                  parts.push(paragraph.substring(lastIndex));

                  if (paragraph.startsWith('### ')) {
                    return <h4 key={index} style={{ fontSize: '16px', color: 'white', marginTop: '16px', marginBottom: '8px' }}>{paragraph.replace('### ', '')}</h4>;
                  }
                  if (paragraph.startsWith('- ')) {
                    return <li key={index} style={{ marginLeft: '20px', marginBottom: '6px' }}>{parts.map(p => p === '' ? null : p).slice(1)}</li>;
                  }
                  
                  return <p key={index}>{parts.length > 1 ? parts : paragraph}</p>;
                })}
              </div>
            </div>

            {/* Topic Performance & Frequent Mistakes Row */}
            <div className="grid-2">
              {/* Topic Performance Table */}
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'white' }}>Analisis Pemahaman Per Topik</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Topik</th>
                        <th>Akurasi</th>
                        <th>Tingkat Pemahaman</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topicAccuracy.map((stat, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '500', color: 'white' }}>{stat.topic}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ minWidth: '40px', fontWeight: 'bold' }}>{stat.accuracy}%</span>
                              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                <div 
                                  style={{ 
                                    width: `${stat.accuracy}%`, 
                                    height: '100%', 
                                    background: stat.accuracy >= 80 ? 'var(--success)' : stat.accuracy >= 60 ? 'var(--warning)' : 'var(--error)',
                                    borderRadius: '3px' 
                                  }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${stat.accuracy >= 80 ? 'badge-success' : stat.accuracy >= 60 ? 'badge-warning' : 'badge-error'}`}>
                              {stat.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Frequent Mistakes Section */}
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'white' }}>Soal yang Paling Banyak Salah</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {frequentMistakes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Tidak ada soal yang memiliki persentase salah tinggi.</p>
                  ) : (
                    frequentMistakes.map((mistake, idx) => (
                      <div key={idx} style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                          <span className="badge badge-error" style={{ fontSize: '10px' }}>
                            {mistake.incorrectPercentage}% Salah
                          </span>
                          <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                            Topik: {mistake.topic}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          "{mistake.questionText}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Students List Table */}
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'white' }}>Detail Partisipan Mahasiswa</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nama Mahasiswa</th>
                      <th>Email</th>
                      <th>Skor Hasil</th>
                      <th>Waktu Submit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((att) => (
                      <tr key={att.id}>
                        <td style={{ fontWeight: '500', color: 'white' }}>{att.studentName}</td>
                        <td>{att.studentEmail}</td>
                        <td style={{ fontWeight: 'bold', fontSize: '16px', color: att.score >= 80 ? 'var(--success)' : att.score >= 60 ? 'var(--warning)' : 'var(--error)' }}>
                          {att.score} / 100
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={12} />
                            {new Date(att.submittedAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
