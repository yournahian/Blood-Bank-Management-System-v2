'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Activity, Send, Clock, PlusCircle } from 'lucide-react';
import { getStock, getTransactions, addTransaction, StockItem, Transaction } from '@/utils/dbManager';

export default function HospitalPortalPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [units, setUnits] = useState('1');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const stockData = await getStock();
      const txData = await getTransactions();
      setStock(stockData);
      setTransactions(txData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const qty = parseInt(units.trim(), 10);
    if (isNaN(qty) || qty <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid number of blood units.' });
      return;
    }

    try {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      await addTransaction({
        patientName: patientName.trim(),
        hospitalName: hospitalName.trim(),
        bloodGroup,
        units: qty,
        date: dateStr,
        status: 'PENDING',
      });

      setMessage({ type: 'success', text: `Blood request for ${qty} units of ${bloodGroup} submitted successfully.` });
      setPatientName('');
      setUnits('1');
      await fetchData(); // Refresh tables
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error processing request.' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'APPROVED': return 'badge-primary';
      case 'PREPARED': return 'badge-info';
      case 'DELIVERED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="app-card" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Building2 size={36} color="white" />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>B2B Hospital Integration Portal</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Place automated blood requisition orders directly to the Blood Bank</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left Col: Request Form */}
        <div className="app-card">
          <h2 className="app-card-title">
            <PlusCircle size={20} color="#cc0033" />
            New Blood Requisition
          </h2>
          
          {message && (
            <div style={{
              backgroundColor: message.type === 'success' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(204, 0, 51, 0.1)',
              border: `1px solid ${message.type === 'success' ? '#16a34a' : '#dc2626'}`,
              color: message.type === 'success' ? '#16a34a' : '#dc2626',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmitRequest}>
            <div className="form-group">
              <label className="form-label">Hospital Name</label>
              <input type="text" className="form-input" placeholder="e.g. Dhaka Medical College" value={hospitalName} onChange={e => setHospitalName(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Patient Name (For Record)</label>
              <input type="text" className="form-input" placeholder="e.g. John Doe" value={patientName} onChange={e => setPatientName(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Units Needed</label>
                <input type="number" className="form-input" min="1" value={units} onChange={e => setUnits(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.75rem' }}>
              <Send size={16} /> Submit Request
            </button>
          </form>
        </div>

        {/* Right Col: Live Stock */}
        <div className="app-card">
          <h2 className="app-card-title">
            <Activity size={20} color="#6c63ff" />
            Live Blood Bank Inventory
          </h2>
          <p className="app-card-subtitle" style={{ fontSize: '0.8rem' }}>Check availability before requesting</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            {stock.map((item) => (
              <div key={item.bloodGroup} style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#cc0033' }}>{item.bloodGroup}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-color)' }}>{item.units} <span style={{fontSize: '0.75rem', fontWeight: 'normal'}}>Units</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: My Requests */}
      <div className="app-card">
        <h2 className="app-card-title">
          <Clock size={20} color="#16a34a" />
          Active Requisition Status
        </h2>
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Hospital</th>
                  <th>Patient</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600 }}>#{tx.id}</td>
                    <td>{tx.hospitalName}</td>
                    <td>{tx.patientName}</td>
                    <td><span className="badge badge-danger" style={{ backgroundColor: 'rgba(204,0,51,0.1)', color: '#cc0033' }}>{tx.bloodGroup}</span></td>
                    <td style={{ fontWeight: 700 }}>{tx.units} Units</td>
                    <td>{tx.date}</td>
                    <td>
                      <span className={`badge ${getStatusColor(tx.status)}`}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
