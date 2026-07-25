'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Printer, AlertTriangle } from 'lucide-react';
import { getDonors, Donor } from '@/utils/dbManager';

interface ExpiryItem {
  donorId: number;
  donorName: string;
  bloodGroup: string;
  dateOfDonation: string;
  daysOld: number;
  status: 'EXPIRED' | 'WARNING';
}

export default function CheckExpiryPage() {
  const [expiryList, setExpiryList] = useState<ExpiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const donors: Donor[] = await getDonors();
        const today = new Date();
        const items: ExpiryItem[] = [];

        donors.forEach((donor) => {
          if (!donor.dateOfDonation) return;

          let dDate: Date | null = null;
          if (donor.dateOfDonation.includes('-')) {
            const parts = donor.dateOfDonation.split('-');
            if (parts[0].length === 4) {
              dDate = new Date(donor.dateOfDonation);
            } else if (parts[2].length === 4) {
              dDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
          }

          if (dDate && !isNaN(dDate.getTime())) {
            const diffTime = Math.abs(today.getTime() - dDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 35) {
              items.push({
                donorId: donor.donorId,
                donorName: donor.name,
                bloodGroup: donor.bloodGroup,
                dateOfDonation: donor.dateOfDonation,
                daysOld: diffDays,
                status: diffDays > 42 ? 'EXPIRED' : 'WARNING',
              });
            }
          }
        });

        items.sort((a, b) => b.daysOld - a.daysOld);
        setExpiryList(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="app-card">
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="app-card-title">
              <Clock size={24} color="#dc2626" />
              Expired Blood Monitor (&gt;42 Days)
            </h2>
            <p className="app-card-subtitle" style={{ marginBottom: 0 }}>
              Tracks blood donation age and flags units approaching or exceeding the 42-day medical shelf life
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: '#dc2626' }}>● Expired (&gt;42 Days)</span>
              <span style={{ color: '#d97706' }}>● Near Expiry (35-42 Days)</span>
            </div>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#64748b', padding: '2rem 0', textAlign: 'center' }}>Evaluating inventory shelf life...</p>
        ) : expiryList.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #86efac' }}>
            <p style={{ color: '#166534', fontWeight: 700, fontSize: '1rem' }}>✓ All blood units in inventory are fresh (&lt;35 days old)!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Donor ID</th>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Donation Date</th>
                  <th>Age (Days)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {expiryList.map((item) => (
                  <tr key={item.donorId}>
                    <td style={{ fontWeight: 700, color: '#cc0033' }}>#{item.donorId}</td>
                    <td style={{ fontWeight: 600 }}>{item.donorName}</td>
                    <td><span className="badge badge-danger">{item.bloodGroup}</span></td>
                    <td>{item.dateOfDonation}</td>
                    <td style={{ fontWeight: 700 }}>{item.daysOld} Days</td>
                    <td>
                      <span className={`badge ${item.status === 'EXPIRED' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.status}
                      </span>
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
