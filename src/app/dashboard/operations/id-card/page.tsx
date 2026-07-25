'use client';

import React, { useState } from 'react';
import { CreditCard, Search, Printer, AlertCircle } from 'lucide-react';
import { getDonors, Donor } from '@/utils/dbManager';

export default function GenerateIDCardPage() {
  const [searchId, setSearchId] = useState('');
  const [loadedDonor, setLoadedDonor] = useState<Donor | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!searchId.trim()) {
      setError('Please enter a Donor ID.');
      return;
    }

    const idNum = parseInt(searchId.trim(), 10);
    if (isNaN(idNum)) {
      setError('Please enter a valid numeric Donor ID.');
      return;
    }

    setLoading(true);

    try {
      const allDonors = await getDonors();
      const donor = allDonors.find((d) => d.donorId === idNum);

      if (!donor) {
        setError(`Donor ID #${idNum} not found in database.`);
        setLoadedDonor(null);
      } else {
        setLoadedDonor(donor);
      }
    } catch (err: any) {
      setError(err.message || 'Error searching donor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="app-card">
        <h2 className="app-card-title">
          <CreditCard size={24} color="#6c63ff" />
          Generate Digital Donor ID Card
        </h2>
        <p className="app-card-subtitle">Search donor by ID to generate an official printable digital identity card</p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', backgroundColor: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Donor ID (e.g. 1)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={16} />
            {loading ? 'Searching...' : 'Generate Card'}
          </button>
        </form>

        {error && (
          <div style={{ backgroundColor: 'rgba(204, 0, 51, 0.15)', border: '1px solid #dc2626', color: '#dc2626', padding: '0.875rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ID Card Display */}
        {loadedDonor ? (
          <div>
            <div
              id="printable-id-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto 2rem auto',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                border: '2px solid #cc0033',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top Accent Band */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', backgroundColor: '#cc0033' }} />

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Blood Donor Card
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                    Official Member Badge
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#cc0033',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(204, 0, 51, 0.4)'
                }}>
                  {loadedDonor.bloodGroup}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Donor ID</span>
                  <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem' }}>#{loadedDonor.donorId}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Full Name</span>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{loadedDonor.name}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Phone</span>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{loadedDonor.Phone}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Gender</span>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{loadedDonor.gender}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>City / Area</span>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{loadedDonor.city}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Last Donated</span>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{loadedDonor.dateOfDonation || 'N/A'}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{ marginTop: '1.25rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Blood Bank Management System</span>
                <span>Verified ID Badge</span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                Print Donor Card
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <CreditCard size={36} color="#6c63ff" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Enter a Donor ID above to preview and print digital ID card</p>
          </div>
        )}
      </div>
    </div>
  );
}
