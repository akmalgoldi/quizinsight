'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, BookOpen, User as UserIcon } from 'lucide-react';

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.refresh();
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">
        <BookOpen size={24} className="primary" />
        <span>QuizInsight</span>
      </Link>
      <div className="nav-links">
        {user ? (
          <div className="nav-user">
            <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <UserIcon size={12} />
              {user.role === 'LECTURER' ? 'Dosen' : 'Mahasiswa'}
            </span>
            <span className="nav-user-name">{user.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '13px' }}>
              <LogOut size={14} />
              Keluar
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Masuk
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Daftar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
