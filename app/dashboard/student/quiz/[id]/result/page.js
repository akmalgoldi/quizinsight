'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Award, CheckCircle, XCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

function ResultContent({ params }) {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const { id: quizId } = params;

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadResult() {
      if (!attemptId) {
        setError('ID Pengerjaan (attemptId) tidak ditemukan di URL.');
        setLoading(false);
        return;
      }

      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error();
        const userData = await userRes.json();
        setUser(userData.user);

        const res = await fetch(`/api/student/attempts/${attemptId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Gagal memuat hasil kuis');
        }
        const attemptData = await res.json();
        setData(attemptData.attempt);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Menganalisis Lembar Jawaban Anda...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div className="badge-error" style={{ display: 'inline-block', padding: '12px 20px', borderRadius: '8px' }}>
          ⚠️ {error || 'Gagal memuat hasil'}
        </div>
        <div style={{ marginTop: '24px' }}>
          <Link href="/dashboard/student" className="btn btn-secondary">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
      {/* Score Summary Card */}
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div>
          <span className="badge badge-success" style={{ marginBottom: '8px' }}>Evaluasi Selesai</span>
          <h2 style={{ fontSize: '28px' }}>{data.quizTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Kode Kuis: {data.quizCode}</p>
        </div>

        {/* Circular score visualizer */}
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 70%)',
          border: '4px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Skor Anda</span>
          <span style={{ fontSize: '54px', fontWeight: '900', color: 'white', fontFamily: 'var(--font-outfit)', lineHeight: '1' }}>{data.score}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Skala 100</span>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Soal</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginTop: '4px' }}>{data.totalCount}</div>
          </div>
          
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 'bold' }}>Benar</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)', marginTop: '4px' }}>{data.correctCount}</div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--error)', textTransform: 'uppercase', fontWeight: 'bold' }}>Salah / Kosong</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--error)', marginTop: '4px' }}>{data.incorrectCount}</div>
          </div>
        </div>

        <Link href="/dashboard/student" className="btn btn-primary" style={{ width: '100%', gap: '8px', marginTop: '12px' }}>
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </Link>
      </div>

      {/* Question review list */}
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '20px', color: 'white' }}>Tinjauan Soal & Kategori</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.answers.map((ans, idx) => (
            <div key={ans.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.2)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '80%' }}>
                <span className="badge badge-primary" style={{ alignSelf: 'flex-start', fontSize: '9px' }}>Topik: {ans.topic}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {idx + 1}. {ans.questionText}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {ans.isCorrect ? (
                  <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                ) : (
                  <XCircle size={20} style={{ color: 'var(--error)' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentQuizResult({ params }) {
  const resolvedParams = use(params);
  return (
    <>
      <Navbar />
      <main className="container animate-fade-in">
        <Suspense fallback={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Memuat Halaman Hasil...</p>
          </div>
        }>
          <ResultContent params={resolvedParams} />
        </Suspense>
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
