'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { UserPlus, Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registrasi gagal');
      }

      setSuccess('Registrasi berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)' }}>
        <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '480px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Buat Akun</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Daftarkan akun Dosen atau Mahasiswa Anda</p>
          </div>

          {error && (
            <div className="badge-error" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', width: '100%', textTransform: 'none', display: 'block' }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="badge-success" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', width: '100%', textTransform: 'none', display: 'block' }}>
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nama Lengkap</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Masukkan nama lengkap Anda"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="nama@kampus.ac.id"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Daftar Sebagai</label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="STUDENT">Mahasiswa</option>
                <option value="LECTURER">Dosen</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px', gap: '8px' }} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Memproses...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Daftar Akun
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              Masuk disini
            </Link>
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
