import Link from 'next/link';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import InteractiveCardScript from '@/components/InteractiveCardScript';
import { ArrowRight, CheckCircle, BarChart3, Brain } from 'lucide-react';

export default async function Home() {
  const session = await getSession();

  return (
    <>
      <Navbar user={session} />
      <InteractiveCardScript />
      <main className="container animate-fade-in">
        <section className="hero">
          <div className="hero-badge">AI-Powered Evaluation</div>
          <h1 className="hero-title">
            Evaluasi Pemahaman Mahasiswa Lebih Cepat dengan <span>QuizInsight</span>
          </h1>
          <p className="hero-subtitle">
            Buat kuis topik-spesifik pilihan ganda untuk kelas Anda. Pantau hasil secara otomatis dan peroleh analisis mendalam berbasis AI untuk mengatasi kesenjangan belajar mahasiswa secara instan.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            {session ? (
              <Link 
                href={session.role === 'LECTURER' ? '/dashboard/lecturer' : '/dashboard/student'} 
                className="btn btn-primary"
              >
                Ke Dashboard Saya
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-primary">
                  Mulai Sekarang
                  <ArrowRight size={16} />
                </Link>
                <Link href="/register" className="btn btn-secondary">
                  Daftar Akun Baru
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid-3 glow-effect" style={{ marginTop: '40px' }}>
          <div className="interactive-card">
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Brain size={24} className="primary" style={{ color: '#6366f1' }} />
            </div>
            <h3 style={{ marginBottom: '8px' }}>Analisis Topik</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Kelompokkan setiap pertanyaan ke dalam topik bahasan (misalnya *Entropy*, *Information Gain*) untuk memetakan pemahaman mahasiswa secara modular.
            </p>
          </div>

          <div className="interactive-card">
            <div style={{ background: 'rgba(14, 165, 233, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <BarChart3 size={24} style={{ color: '#0ea5e9' }} />
            </div>
            <h3 style={{ marginBottom: '8px' }}>Dashboard Dosen</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Pantau total peserta kuis, nilai rata-rata kelas, skor tertinggi dan terendah, serta akurasi jawaban per topik secara real-time.
            </p>
          </div>

          <div className="interactive-card">
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle size={24} style={{ color: '#10b981' }} />
            </div>
            <h3 style={{ marginBottom: '8px' }}>Rekomendasi AI</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Dapatkan umpan balik naratif instan dari AI mengenai kelemahan kelas serta rekomendasi pedagogis untuk materi perkuliahan selanjutnya.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ marginTop: '120px', padding: '40px 0', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          <p>© 2026 QuizInsight. Proyek Capstone Evaluasi Pembelajaran Modern.</p>
        </footer>
      </main>
    </>
  );
}
