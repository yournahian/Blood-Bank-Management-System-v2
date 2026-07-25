'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Printer, AlertCircle, Bug, CarFront } from 'lucide-react';
import { getStock, StockItem } from '@/utils/dbManager';

interface PredictionItem {
  group: string;
  units: number;
  dailyDemand: number;
  daysLeft: number;
  daysLeftStr: string;
  status: string;
  severity: 'critical' | 'urgent' | 'warning' | 'healthy';
}

export default function PredictiveStockPage() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation Toggles
  const [simDengue, setSimDengue] = useState(false);
  const [simHoliday, setSimHoliday] = useState(false);

  const getSimulatedDemand = (group: string, dengue: boolean, holiday: boolean): number => {
    let baseDemand = 1;
    switch (group) {
      case 'O+': baseDemand = 5; break;
      case 'A+': baseDemand = 4; break;
      case 'B+': baseDemand = 3; break;
      case 'O-': baseDemand = 2; break;
      default: baseDemand = 1; break;
    }

    // Apply Dengue Multiplier (Spikes O+ and B+ due to high population demand for platelets)
    if (dengue && (group === 'O+' || group === 'B+')) {
      baseDemand = Math.floor(baseDemand * 2.5);
    }

    // Apply Holiday/Accident Multiplier (Spikes all due to highway traffic)
    if (holiday) {
      baseDemand = Math.floor(baseDemand * 1.5);
    }

    return baseDemand;
  };

  const calculatePredictions = async () => {
    setLoading(true);
    try {
      const stockList: StockItem[] = await getStock();
      const items: PredictionItem[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => {
        const item = stockList.find((s) => s.bloodGroup === group);
        const units = item ? item.units : 0;
        const dailyDemand = getSimulatedDemand(group, simDengue, simHoliday);
        const daysLeft = dailyDemand > 0 ? Math.floor(units / dailyDemand) : 0;

        let status = 'Healthy Supply';
        let severity: 'critical' | 'urgent' | 'warning' | 'healthy' = 'healthy';

        const sevenDayRequirement = dailyDemand * 7;
        const deficit = sevenDayRequirement - units;

        if (units === 0) {
          status = `CRITICAL: Collect ${deficit} units ASAP!`;
          severity = 'critical';
        } else if (daysLeft < 3) {
          status = `URGENT: Collect ${deficit} more units this week`;
          severity = 'urgent';
        } else if (daysLeft < 7) {
          status = `WARNING: Collect ${deficit} more units this week`;
          severity = 'warning';
        } else if (deficit > 0) {
           // Edge case where daysLeft is technically >= 7, but due to rounding it's tight.
           status = `Target: Collect ${deficit} more units`;
           severity = 'warning';
        }

        let daysLeftStr = `${daysLeft} Days`;
        if (units === 0) daysLeftStr = '0 Days';
        else if (daysLeft > 365) daysLeftStr = '> 1 Year';

        return {
          group,
          units,
          dailyDemand,
          daysLeft,
          daysLeftStr,
          status,
          severity,
        };
      });

      setPredictions(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate whenever toggles change
  useEffect(() => {
    calculatePredictions();
  }, [simDengue, simHoliday]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Simulation Controls */}
      <div className="no-print app-card" style={{ marginBottom: '1.5rem', border: '1px solid #6c63ff', backgroundColor: 'rgba(108, 99, 255, 0.05)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#6c63ff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} />
          AI Environmental Simulation Controls
        </h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: `1px solid ${simDengue ? '#dc2626' : 'var(--border-color)'}` }}>
            <input 
              type="checkbox" 
              checked={simDengue} 
              onChange={(e) => setSimDengue(e.target.checked)} 
              style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bug size={20} color={simDengue ? '#dc2626' : 'var(--text-muted)'} />
              <div>
                <div style={{ fontWeight: 600, color: simDengue ? '#dc2626' : 'var(--text-color)' }}>Dengue Outbreak Season</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulates 2.5x demand spike for Platelets (O+, B+)</div>
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: `1px solid ${simHoliday ? '#d97706' : 'var(--border-color)'}` }}>
            <input 
              type="checkbox" 
              checked={simHoliday} 
              onChange={(e) => setSimHoliday(e.target.checked)} 
              style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CarFront size={20} color={simHoliday ? '#d97706' : 'var(--text-muted)'} />
              <div>
                <div style={{ fontWeight: 600, color: simHoliday ? '#d97706' : 'var(--text-color)' }}>Eid / Highway Holiday</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulates 1.5x demand spike due to accident rates</div>
              </div>
            </div>
          </label>

        </div>
      </div>


      <div className="app-card">
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="app-card-title">
              <TrendingUp size={24} color="#6c63ff" />
              AI Demand Prediction & Logistics Target
            </h2>
            <p className="app-card-subtitle" style={{ marginBottom: 0 }}>
              Forecasts remaining inventory and sets weekly collection targets based on live environmental models
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', gap: '0.6rem' }}>
              <span style={{ color: '#dc2626' }}>● Urgent</span>
              <span style={{ color: '#16a34a' }}>● Healthy</span>
            </div>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#64748b', padding: '2rem 0', textAlign: 'center' }}>Calculating forecasting algorithms...</p>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Current Stock</th>
                  <th>Est. Daily Demand</th>
                  <th>Supply Lasts For</th>
                  <th>AI Actionable Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.group} style={{ transition: 'background-color 0.3s ease' }}>
                    <td>
                      <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>
                        {p.group}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{p.units} Units</td>
                    <td style={{ fontWeight: 600, color: (simDengue || simHoliday) ? '#dc2626' : 'inherit' }}>
                      ~{p.dailyDemand} / day
                      {(simDengue || simHoliday) && <TrendingUp size={14} color="#dc2626" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }}/>}
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.daysLeftStr}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.severity === 'critical' || p.severity === 'urgent'
                            ? 'badge-danger'
                            : p.severity === 'warning'
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                        style={{ padding: '0.45rem 0.85rem', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        {p.status}
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
