'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Minus, Printer, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStock, updateStock, StockItem } from '@/utils/dbManager';

export default function ManageStockPage() {
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('A+');
  const [unitsInput, setUnitsInput] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    try {
      const data = await getStock();
      setStockList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const handleStockChange = async (isIncrease: boolean) => {
    setMessage(null);
    const qty = parseInt(unitsInput.trim(), 10);
    if (isNaN(qty) || qty <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive number of units.' });
      return;
    }

    setLoading(true);
    const change = isIncrease ? qty : -qty;

    try {
      const res = await updateStock(selectedGroup, change);
      if (!res.success) {
        setMessage({ type: 'error', text: res.message || 'Operation failed.' });
      } else {
        setMessage({
          type: 'success',
          text: `Successfully ${isIncrease ? 'increased' : 'decreased'} ${selectedGroup} stock by ${qty} units!`,
        });
        setUnitsInput('');
        await fetchStockData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating stock.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="app-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="app-card-title">
              <Package size={24} color="#6c63ff" />
              Manage Blood Stock
            </h2>
            <p className="app-card-subtitle" style={{ marginBottom: 0 }}>Adjust blood inventory levels and review active stock quantities</p>
          </div>

          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} />
            Print Report
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ backgroundColor: 'var(--bg-card-subtle)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Blood Group</label>
              <select className="form-select" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Units (Quantity)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 5"
                min="1"
                value={unitsInput}
                onChange={(e) => setUnitsInput(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-success"
              onClick={() => handleStockChange(true)}
              disabled={loading}
            >
              <Plus size={16} />
              Increase (+)
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleStockChange(false)}
              disabled={loading}
            >
              <Minus size={16} />
              Decrease (-)
            </button>
          </div>
        </div>

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

        {/* Stock Inventory Table */}
        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>Blood Group</th>
                <th style={{ textAlign: 'right' }}>Available Units</th>
              </tr>
            </thead>
            <tbody>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => {
                const item = stockList.find((s) => s.bloodGroup === group);
                const count = item ? item.units : 0;
                return (
                  <tr key={group}>
                    <td>
                      <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>{group}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: count < 10 ? '#dc2626' : '#16a34a' }}>
                      {count} Units
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
