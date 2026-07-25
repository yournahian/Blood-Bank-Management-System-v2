'use client';

import React, { useEffect, useState } from 'react';
import { History, Printer, CheckCircle } from 'lucide-react';
import { getTransactions, updateTransactionStatus, Transaction } from '@/utils/dbManager';

export default function DeliveryHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleMarkDelivered = async (id: number) => {
    try {
      const res = await updateTransactionStatus(id, 'DELIVERED');
      if (res.success) {
        await fetchTransactions();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="app-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="app-card-title">
              <History size={24} color="#6c63ff" />
              Blood Request & Delivery History
            </h2>
            <p className="app-card-subtitle" style={{ marginBottom: 0 }}>Log of all hospital blood requests and status tracking</p>
          </div>

          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} />
            Print History
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>Loading transaction records...</p>
        ) : transactions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>No blood request transactions logged yet.</p>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Patient Name</th>
                  <th>Hospital</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th className="no-print" style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{tx.id}</td>
                    <td style={{ fontWeight: 600 }}>{tx.patientName}</td>
                    <td>{tx.hospitalName}</td>
                    <td><span className="badge badge-danger">{tx.bloodGroup}</span></td>
                    <td style={{ fontWeight: 700 }}>{tx.units} Units</td>
                    <td>{tx.date}</td>
                    <td>
                      <span className={`badge ${tx.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      {tx.status !== 'DELIVERED' ? (
                        <button
                          type="button"
                          className="btn btn-success"
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                          onClick={() => handleMarkDelivered(tx.id)}
                        >
                          <CheckCircle size={14} />
                          Mark Delivered
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Complete</span>
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
