'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Plus, Trash2, LayoutDashboard, FileQuestion, ArrowRight, Loader2, Clipboard } from 'lucide-react';

export default function LecturerDashboard() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Create quiz form state
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Fetch session & quizzes
  useEffect(() => {
    async function initDashboard() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error();
        const userData = await userRes.json();
        setUser(userData.user);

        const quizRes = await fetch('/api/quizzes');
        if (quizRes.ok) {
          const quizData = await quizRes.json();
          setQuizzes(quizData.quizzes);
        }
      } catch (err) {
        console.error('Init dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuiz),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal membuat kuis');

      setQuizzes((prev) => [data.quiz, ...prev]);
      setNewQuiz({ title: '', description: '' });
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kuis ini? Semua soal dan riwayat pengerjaan mahasiswa juga akan dihapus.')) return;

    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus kuis');
      }
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Memuat Dashboard Dosen...</p>
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
        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Dashboard Dosen</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Kelola kuis dan evaluasi pembelajaran mahasiswa Anda di sini.</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ gap: '8px' }}>
            <Plus size={18} />
            Buat Kuis Baru
          </button>
        </div>

        {/* Quiz Grid */}
        {quizzes.length === 0 ? (
          <div className="glass-panel" style={{ padding: '80px 40px', textAlign: 'center', marginTop: '20px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <FileQuestion size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Belum Ada Kuis</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 24px' }}>
              Anda belum membuat kuis apa pun. Buat kuis pertama Anda sekarang dan bagikan kodenya kepada mahasiswa Anda.
            </p>
            <button onClick={() => setModalOpen(true)} className="btn btn-primary">
              Mulai Buat Kuis
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '20px', color: 'white' }}>{quiz.title}</h3>
                    <button 
                      onClick={() => handleDeleteQuiz(quiz.id)} 
                      className="btn" 
                      style={{ padding: '6px', background: 'transparent', color: 'var(--text-muted)' }}
                      title="Hapus Kuis"
                    >
                      <Trash2 size={16} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', minHeight: '42px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {quiz.description || 'Tidak ada deskripsi.'}
                  </p>

                  {/* Share Code Widget */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Kode Akses Kuis</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--secondary)', letterSpacing: '1px' }}>{quiz.code}</div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(quiz.code)} 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                    >
                      <Clipboard size={12} />
                      {copiedCode === quiz.code ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>

                  {/* Stats Badges */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <span className="badge badge-primary">
                      {quiz._count?.questions || 0} Soal
                    </span>
                    <span className="badge badge-success">
                      {quiz._count?.attempts || 0} Partisipan
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                  <Link href={`/dashboard/lecturer/quiz/${quiz.id}/questions`} className="btn btn-secondary" style={{ flex: 1, fontSize: '14px', gap: '6px' }}>
                    <FileQuestion size={14} />
                    Kelola Soal
                  </Link>
                  <Link href={`/dashboard/lecturer/quiz/${quiz.id}/analytics`} className="btn btn-primary" style={{ flex: 1, fontSize: '14px', gap: '6px' }}>
                    <LayoutDashboard size={14} />
                    Analisis AI
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Quiz Modal Overlay */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '500px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Buat Kuis Baru</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Masukkan detail kuis yang akan Anda publikasikan.</p>

              {formError && (
                <div className="badge-error" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', width: '100%', textTransform: 'none', display: 'block' }}>
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleCreateQuiz}>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Judul Kuis</label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Kuis Pertemuan 5 - Algoritma dasar"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Deskripsi</label>
                  <textarea
                    id="description"
                    className="form-input"
                    placeholder="Masukkan deskripsi singkat cakupan kuis..."
                    rows={3}
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                    disabled={formLoading}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" disabled={formLoading}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Membuat...' : 'Buat Kuis'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
