'use client';

import React, { useEffect, useState } from 'react';
import { Users, Package, History, MapPin, BarChart3, PieChart } from 'lucide-react';
import { getDonors, getStock, getTransactions, Donor, StockItem, Transaction } from '@/utils/dbManager';

export default function DashboardOverviewPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [dList, sList, tList] = await Promise.all([
          getDonors(),
          getStock(),
          getTransactions(),
        ]);
        setDonors(dList);
        setStock(sList);
        setTransactions(tList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalDonors = donors.length;
  const totalStockUnits = stock.reduce((acc, curr) => acc + curr.units, 0);
  const totalTransactions = transactions.length;
  const uniqueCities = new Set(donors.map((d) => d.city).filter(Boolean)).size;

  // Gender counts
  const maleCount = donors.filter((d) => d.gender?.toLowerCase() === 'male').length;
  const femaleCount = donors.filter((d) => d.gender?.toLowerCase() === 'female').length;
  const othersCount = donors.filter(
    (d) => d.gender && d.gender.toLowerCase() !== 'male' && d.gender.toLowerCase() !== 'female'
  ).length;

  // City counts map
  const cityMap: Record<string, number> = {};
  donors.forEach((d) => {
    if (d.city) {
      cityMap[d.city] = (cityMap[d.city] || 0) + 1;
    }
  });
  const cityData = Object.entries(cityMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);

  const maxStock = Math.max(...stock.map((s) => s.units), 10);
  const maxCityCount = Math.max(...cityData.map((c) => c.count), 5);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Overview Analytics...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Total Donors */}
        <div className="app-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Donors</span>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-title)', marginTop: '0.25rem' }}>{totalDonors}</h2>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
        </div>

        {/* Stock Units */}
        <div className="app-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stock Units</span>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-title)', marginTop: '0.25rem' }}>{totalStockUnits}</h2>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} />
          </div>
        </div>

        {/* Transactions */}
        <div className="app-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Transactions</span>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-title)', marginTop: '0.25rem' }}>{totalTransactions}</h2>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={24} />
          </div>
        </div>

        {/* Locations */}
        <div className="app-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Cities</span>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-title)', marginTop: '0.25rem' }}>{uniqueCities}</h2>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(225, 29, 72, 0.15)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={24} />
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Stock Bar Chart & Gender Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* CHART 1: Stock Levels Bar Chart */}
        <div className="app-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h3 className="app-card-title">
              <BarChart3 size={20} color="#6c63ff" />
              Stock Levels by Blood Group
            </h3>
            <span className="badge badge-blue">Bar Chart</span>
          </div>
          <p className="app-card-subtitle">Real-time unit availability in blood inventory</p>

          <div style={{ position: 'relative', height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '2rem' }}>
            {/* Gridlines */}
            <div style={{ position: 'absolute', top: '2rem', left: 0, right: 0, bottom: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
                <div key={ratio} style={{ borderBottom: '1px dashed var(--border-color)', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-10px', backgroundColor: 'var(--bg-card)', paddingLeft: '4px', paddingRight: '4px' }}>
                    {Math.round(maxStock * ratio)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bars container */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', zIndex: 1, paddingBottom: '0.5rem' }}>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => {
                const item = stock.find((s) => s.bloodGroup === group);
                const units = item ? item.units : 0;
                const heightPercent = Math.max((units / maxStock) * 100, 4);
                const isHovered = hoveredBar === `stock-${group}`;

                return (
                  <div
                    key={group}
                    onMouseEnter={() => setHoveredBar(`stock-${group}`)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                      cursor: 'pointer',
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isHovered ? '#818cf8' : 'var(--text-main)',
                      marginBottom: '6px',
                      transition: 'transform 0.2s',
                      transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                    }}>
                      {units}
                    </span>
                    <div
                      style={{
                        width: '32px',
                        height: `${heightPercent}%`,
                        background: isHovered
                          ? 'linear-gradient(180deg, #4f46e5 0%, #6366f1 100%)'
                          : 'linear-gradient(180deg, #6c63ff 0%, #818cf8 100%)',
                        borderRadius: '8px 8px 0 0',
                        boxShadow: isHovered ? '0 6px 15px rgba(108, 99, 255, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '8px' }}>
                      {group}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART 2: Gender Distribution */}
        <div className="app-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h3 className="app-card-title">
              <PieChart size={20} color="#ec4899" />
              Donors by Gender
            </h3>
            <span className="badge badge-success">Distribution</span>
          </div>
          <p className="app-card-subtitle">Demographic breakdown of registered blood donors</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            {/* Male */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                <span style={{ color: '#3b82f6' }}>● Male Donors</span>
                <span style={{ color: 'var(--text-main)' }}>{maleCount} ({totalDonors ? Math.round((maleCount / totalDonors) * 100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${totalDonors ? (maleCount / totalDonors) * 100 : 0}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '6px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Female */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                <span style={{ color: '#ec4899' }}>● Female Donors</span>
                <span style={{ color: 'var(--text-main)' }}>{femaleCount} ({totalDonors ? Math.round((femaleCount / totalDonors) * 100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${totalDonors ? (femaleCount / totalDonors) * 100 : 0}%`, height: '100%', backgroundColor: '#ec4899', borderRadius: '6px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Others */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                <span style={{ color: '#f59e0b' }}>● Others</span>
                <span style={{ color: 'var(--text-main)' }}>{othersCount} ({totalDonors ? Math.round((othersCount / totalDonors) * 100) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${totalDonors ? (othersCount / totalDonors) * 100 : 0}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '6px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHART 3: Donors by Area / City Bar Chart */}
      <div className="app-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <h3 className="app-card-title">
            <BarChart3 size={20} color="#00a65a" />
            Donors by Area / City (Bar Chart)
          </h3>
          <span className="badge badge-success">Geographic Bar Chart</span>
        </div>
        <p className="app-card-subtitle">Geographic distribution of registered blood donors by city</p>

        {cityData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 0', textAlign: 'center' }}>No city data recorded yet.</p>
        ) : (
          <div style={{ position: 'relative', height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '2.5rem' }}>
            {/* Gridlines */}
            <div style={{ position: 'absolute', top: '2.5rem', left: 0, right: 0, bottom: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
                <div key={ratio} style={{ borderBottom: '1px dashed var(--border-color)', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-10px', backgroundColor: 'var(--bg-card)', paddingLeft: '4px', paddingRight: '4px' }}>
                    {Math.round(maxCityCount * ratio)}
                  </span>
                </div>
              ))}
            </div>

            {/* Vertical Bar Pillars for Cities */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', zIndex: 1, paddingBottom: '0.5rem', gap: '0.5rem' }}>
              {cityData.map(({ city, count }) => {
                const heightPercent = Math.max((count / maxCityCount) * 100, 5);
                const isHovered = hoveredBar === `city-${city}`;

                return (
                  <div
                    key={city}
                    onMouseEnter={() => setHoveredBar(`city-${city}`)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                      cursor: 'pointer',
                      height: '100%',
                      justifyContent: 'flex-end',
                      maxWidth: '80px'
                    }}
                  >
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isHovered ? '#34d399' : '#16a34a',
                      marginBottom: '6px',
                      transition: 'transform 0.2s',
                      transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                    }}>
                      {count}
                    </span>
                    <div
                      style={{
                        width: '80%',
                        maxWidth: '36px',
                        height: `${heightPercent}%`,
                        background: isHovered
                          ? 'linear-gradient(180deg, #059669 0%, #10b981 100%)'
                          : 'linear-gradient(180deg, #00a65a 0%, #34d399 100%)',
                        borderRadius: '8px 8px 0 0',
                        boxShadow: isHovered ? '0 6px 15px rgba(0, 166, 90, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isHovered ? '#34d399' : 'var(--text-muted)',
                      marginTop: '8px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      maxWidth: '100%'
                    }}>
                      {city}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
