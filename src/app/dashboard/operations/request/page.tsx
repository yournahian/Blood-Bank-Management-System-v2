'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle2, ArrowRight, Truck, Package, Clock, AlertCircle } from 'lucide-react';
import { getTransactions, updateTransactionStatus, Transaction } from '@/utils/dbManager';
import confetti from 'canvas-confetti';

export default function AdminRequisitionManagerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setMessage(null);
    try {
      const res = await updateTransactionStatus(id, newStatus);
      if (res.success) {
        if (newStatus === 'DELIVERED') {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          setMessage({ type: 'success', text: `Transaction #${id} marked as Delivered! Inventory has been automatically deducted.` });
        } else {
          setMessage({ type: 'success', text: `Transaction #${id} status updated to ${newStatus}.` });
        }
        await fetchTransactions();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update transaction status.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating status.' });
    }
  };

  const activeRequests = transactions.filter(t => t.status !== 'DELIVERED' && t.status !== 'REJECTED');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="app-card">
        <h2 className="app-card-title" style={{ color: '#6c63ff' }}>
          <ClipboardList size={24} color="#6c63ff" />
          Admin Requisition Manager
        </h2>
        <p className="app-card-subtitle">Manage incoming blood requests from hospitals (Pending → Approved → Prepared → Delivered)</p>

        {message && (
          <div style={{
            backgroundColor: message.type === 'success' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(204, 0, 51, 0.15)',
            border: `1px solid ${message.type === 'success' ? '#16a34a' : '#dc2626'}`,
            color: message.type === 'success' ? '#16a34a' : '#dc2626',
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading requests...</p>
        ) : activeRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-color)', borderRadius: '12px' }}>
            <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>All Caught Up!</h3>
            <p style={{ color: 'var(--text-muted)' }}>There are no active hospital requisitions pending processing.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Hospital</th>
                  <th>Patient</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {activeRequests.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{tx.id}</td>
                    <td style={{ fontWeight: 600 }}>{tx.hospitalName}</td>
                    <td>{tx.patientName}</td>
                    <td><span className="badge badge-danger">{tx.bloodGroup}</span></td>
                    <td style={{ fontWeight: 700 }}>{tx.units} Units</td>
                    <td>
                      <span className={`badge ${
                        tx.status === 'PENDING' ? 'badge-warning' : 
                        tx.status === 'APPROVED' ? 'badge-primary' : 
                        'badge-info'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {tx.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                           <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleStatusChange(tx.id, 'APPROVED')}>
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        </div>
                      )}
                      
                      {tx.status === 'APPROVED' && (
                        <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleStatusChange(tx.id, 'PREPARED')}>
                          <Package size={14} /> Mark Prepared
                        </button>
                      )}

                      {tx.status === 'PREPARED' && (
                        <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleStatusChange(tx.id, 'DELIVERED')}>
                          <Truck size={14} /> Dispatch (Deduct Stock)
                        </button>
                      )}
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
