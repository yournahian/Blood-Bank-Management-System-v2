'use client';

import React, { useState } from 'react';
import { UserX, Search, Trash2, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDonors, deleteDonor, Donor } from '@/utils/dbManager';

export default function DeleteDonorPage() {
  const [searchId, setSearchId] = useState('');
  const [loadedDonor, setLoadedDonor] = useState<Donor | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!searchId.trim()) {
      setError('Please enter Donor ID.');
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
        setError(`Donor ID #${idNum} not found.`);
        setLoadedDonor(null);
      } else {
        setLoadedDonor(donor);
        setSuccess(`Donor record found. Review details below before deletion.`);
      }
    } catch (err: any) {
      setError(err.message || 'Error searching donor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!loadedDonor) return;

    if (confirm(`Are you sure you want to DELETE donor #${loadedDonor.donorId} (${loadedDonor.name})? This action cannot be undone.`)) {
      setLoading(true);
      try {
        await deleteDonor(loadedDonor.donorId);
        setSuccess(`Donor #${loadedDonor.donorId} (${loadedDonor.name}) successfully deleted.`);
        setLoadedDonor(null);
        setSearchId('');
      } catch (err: any) {
        setError(err.message || 'Error deleting donor.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setSearchId('');
    setLoadedDonor(null);
    setError('');
    setSuccess('');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="app-card">
        <h2 className="app-card-title" style={{ color: '#cc0033' }}>
          <UserX size={24} color="#cc0033" />
          Delete Donor Record
        </h2>
        <p className="app-card-subtitle">Search for a donor by ID and confirm read-only details before deletion</p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Donor ID (e.g. 1)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary" disabled={loading}>
            <Search size={16} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div style={{ backgroundColor: 'rgba(204, 0, 51, 0.15)', border: '1px solid #dc2626', color: '#dc2626', padding: '0.875rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)', border: '1px solid #16a34a', color: '#16a34a', padding: '0.875rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Read-Only Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={loadedDonor?.name || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Father Name</label>
            <input type="text" className="form-input" value={loadedDonor?.fatherName || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Mother Name</label>
            <input type="text" className="form-input" value={loadedDonor?.motherName || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="text" className="form-input" value={loadedDonor?.DOB || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Phone No</label>
            <input type="text" className="form-input" value={loadedDonor?.Phone || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <input type="text" className="form-input" value={loadedDonor?.gender || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="text" className="form-input" value={loadedDonor?.email || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <input type="text" className="form-input" value={loadedDonor?.bloodGroup || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input type="text" className="form-input" value={loadedDonor?.city || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" rows={3} value={loadedDonor?.address || ''} readOnly />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={!loadedDonor || loading}>
            <Trash2 size={16} />
            {loading ? 'Deleting...' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
