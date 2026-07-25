'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Droplet, Lock, User, AlertCircle, PhoneCall, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim() === 'bbms' && password === 'admin') {
      // Set simple auth session flag
      localStorage.setItem('bbms_authenticated', 'true');
      localStorage.setItem('bbms_role', 'admin');
      router.push('/dashboard');
    } else {
      setError('Incorrect username or password. Default credentials: bbms / admin');
    }
  };

  const handleHospitalLogin = () => {
    localStorage.setItem('bbms_authenticated', 'true');
    localStorage.setItem('bbms_role', 'hospital');
    router.push('/dashboard/hospital');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '850px',
        display: 'flex',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backgroundColor: 'var(--bg-color)'
      }}>
        {/* Left Branding Side */}
        <div style={{
          flex: '1.1',
          backgroundColor: '#cc0033',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #e60039 0%, #a30029 100%)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(4px)'
          }}>
            <Droplet size={48} color="#ffffff" fill="#ffffff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Blood Bank
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '260px' }}>
            Management System & Smart Donor Matching
          </p>
        </div>

        {/* Right Form Side */}
        <div style={{
          flex: '1.4',
          padding: '3.5rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '0.5rem' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Please sign in to access management dashboard
          </p>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Enter Username (default: bbms)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Enter Password (default: admin)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-danger" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginBottom: '1rem' }}>
              LOGIN
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (confirm('Do you really want to close the application window?')) {
                    window.close();
                  }
                }}
              >
                Close
              </button>
              <Link href="/emergency" className="btn btn-warning" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                <PhoneCall size={16} />
                Emergency
              </Link>
            </div>
            
            <button
              type="button"
              className="btn"
              style={{ width: '100%', padding: '0.875rem', fontSize: '0.9rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleHospitalLogin}
            >
              <Building2 size={18} style={{ marginRight: '0.5rem' }} />
              Hospital B2B Portal (Simulate Login)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
