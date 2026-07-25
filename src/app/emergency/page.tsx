'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Droplet, AlertTriangle, ArrowLeft, CheckCircle2, Hospital, User, Hash } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getStock, updateStock, addTransaction } from '@/utils/dbManager';

export default function EmergencyRequestPage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [units, setUnits] = useState('1');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!patientName.trim() || !hospitalName.trim() || !units) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    const unitNum = parseInt(units, 10);
    if (isNaN(unitNum) || unitNum <= 0) {
      setError('Units needed must be a positive number greater than 0.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Check stock
      const stockList = await getStock();
      const currentStock = stockList.find((s) => s.bloodGroup === bloodGroup);
      const availableUnits = currentStock ? currentStock.units : 0;

      if (availableUnits < unitNum) {
        setError(`Insufficient Stock! Available: ${availableUnits} units for group ${bloodGroup}.`);
        setLoading(false);
        return;
      }

      // Step 2: Update stock (decrease)
      const stockResult = await updateStock(bloodGroup, -unitNum);
      if (!stockResult.success) {
        setError(stockResult.message || 'Failed to dispatch stock.');
        setLoading(false);
        return;
      }

      // Step 3: Insert transaction
      const todayDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');

      await addTransaction({
        patientName: patientName.trim(),
        hospitalName: hospitalName.trim(),
        bloodGroup,
        units: unitNum,
        date: todayDate,
        status: 'DELIVERED'
      });

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setSuccess(`Emergency Request Approved! ${unitNum} unit(s) of ${bloodGroup} dispatched immediately.`);

      setPatientName('');
      setHospitalName('');
      setUnits('1');
    } catch (err: any) {
      setError(err.message || 'An error occurred processing the emergency request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="app-card" style={{ maxWidth: '650px', width: '100%', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            Back to Login
          </Link>
          <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
            Emergency Kiosk
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Droplet size={36} fill="#dc2626" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#cc0033', marginBottom: '0.5rem' }}>
            Emergency Blood Request
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Requests will be processed immediately if available in inventory stock.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem'
          }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem'
          }}>
            <CheckCircle2 size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="patient">Patient Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="patient"
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Enter patient full name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="hospital">Hospital / Clinic Name</label>
            <div style={{ position: 'relative' }}>
              <Hospital size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="hospital"
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="e.g. Square Hospital, Dhaka"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="bloodGroup">Required Blood Group</label>
              <select
                id="bloodGroup"
                className="form-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="units">Units Needed</label>
              <div style={{ position: 'relative' }}>
                <Hash size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="units"
                  type="number"
                  min="1"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. 2"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-danger"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing Dispatch...' : 'REQUEST BLOOD NOW'}
          </button>
        </form>
      </div>
    </div>
  );
}
