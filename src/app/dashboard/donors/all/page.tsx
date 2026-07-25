'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, MapPin, Printer, RotateCcw, ExternalLink, Check } from 'lucide-react';
import { getDonors, Donor } from '@/utils/dbManager';

export default function AllDonorsAndSearchPage() {
  const [allDonors, setAllDonors] = useState<Donor[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedBloodGroups, setSelectedBloodGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const ALL_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDonors();
        setAllDonors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleResetFilters = () => {
    setLocationSearch('');
    setSelectedBloodGroups([]);
  };

  const handleToggleBloodGroup = (group: string) => {
    if (group === '') {
      // Clicked ALL -> Clear selections
      setSelectedBloodGroups([]);
      return;
    }

    if (selectedBloodGroups.includes(group)) {
      setSelectedBloodGroups(selectedBloodGroups.filter((g) => g !== group));
    } else {
      setSelectedBloodGroups([...selectedBloodGroups, group]);
    }
  };

  const handleOpenMap = (address: string, city: string) => {
    if (!address && !city) {
      alert('No location details available for this donor.');
      return;
    }
    const query = encodeURIComponent(`${address ? address + ', ' : ''}${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleSendAlert = (name: string, phone: string) => {
    if (!phone) {
      alert(`No phone number recorded for ${name}.`);
      return;
    }
    // Simulate SMS dispatch
    alert(`SMS DISPATCHED SUCCESSFULLY!\n\nTo: ${name}\nPhone: ${phone}\nMessage: "URGENT: Your blood group is immediately needed for a critical patient. Please contact the Blood Bank immediately if you are available to donate."\n\n(Simulated via Twilio Gateway)`);
  };

  // Unified Filtering Logic: Location + Multi-select Blood Groups
  const filteredDonors = allDonors.filter((d) => {
    // 1. Location & Name Search
    if (locationSearch.trim()) {
      const term = locationSearch.trim().toLowerCase();
      const matchCity = d.city && d.city.toLowerCase().includes(term);
      const matchAddr = d.address && d.address.toLowerCase().includes(term);
      const matchName = d.name && d.name.toLowerCase().includes(term);
      if (!matchCity && !matchAddr && !matchName) return false;
    }

    // 2. Multi-select Blood Group Filter (If empty, match ALL)
    if (selectedBloodGroups.length > 0) {
      const donorBg = (d.bloodGroup || '').toUpperCase();
      if (!selectedBloodGroups.includes(donorBg)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      <div className="app-card">
        {/* Page Header */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="app-card-title">
              <Users size={24} color="#6c63ff" />
              All Donors Directory & Unified Search
            </h2>
            <p className="app-card-subtitle" style={{ marginBottom: 0 }}>
              Filter donors by location, select multiple blood groups, and pinpoint donor addresses on Google Maps
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} />
            Print List
          </button>
        </div>

        {/* Unified Search & Multi-Select Toolbar */}
        <div className="no-print" style={{
          backgroundColor: 'var(--bg-card-subtle)',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Top Bar: Search Input + Reset Button */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Search Location or Donor Name (City, Address, Name)
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Type City, Address or Name (e.g. Dhaka, Dhanmondi)..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>
            </div>

            <button type="button" className="btn btn-secondary" onClick={handleResetFilters} style={{ padding: '0.625rem 1.25rem' }}>
              <RotateCcw size={16} />
              Reset Filters
            </button>
          </div>

          {/* Multi-Select Blood Group Filter Chips */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Filter Blood Groups (Select one or multiple):
              </span>
              {selectedBloodGroups.length > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cc0033' }}>
                  {selectedBloodGroups.length} Group(s) Selected: {selectedBloodGroups.join(', ')}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* ALL Button */}
              <button
                type="button"
                className={`badge ${selectedBloodGroups.length === 0 ? 'badge-danger' : 'badge-blue'}`}
                style={{
                  cursor: 'pointer',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  border: selectedBloodGroups.length === 0 ? '1px solid #cc0033' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onClick={() => handleToggleBloodGroup('')}
              >
                {selectedBloodGroups.length === 0 && <Check size={12} />}
                ALL GROUPS
              </button>

              {/* Individual Blood Groups */}
              {ALL_GROUPS.map((bg) => {
                const isSelected = selectedBloodGroups.includes(bg);
                return (
                  <button
                    key={bg}
                    type="button"
                    className={`badge ${isSelected ? 'badge-danger' : 'badge-blue'}`}
                    style={{
                      cursor: 'pointer',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.8rem',
                      border: isSelected ? '1px solid #cc0033' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: isSelected ? '0 2px 5px rgba(204, 0, 51, 0.25)' : 'none'
                    }}
                    onClick={() => handleToggleBloodGroup(bg)}
                  >
                    {isSelected && <Check size={12} />}
                    {bg}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Counter Header */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Showing {filteredDonors.length} of {allDonors.length} Donors
          </span>
        </div>

        {/* Table View */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>Loading donors directory...</p>
        ) : filteredDonors.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No donors found matching your search and selected blood group criteria.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Donation Date</th>
                  <th className="no-print" style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((d) => (
                  <tr key={d.donorId}>
                    <td style={{ fontWeight: 700, color: '#cc0033' }}>#{d.donorId}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td><span className="badge badge-danger">{d.bloodGroup}</span></td>
                    <td>{d.Phone}</td>
                    <td>{d.gender}</td>
                    <td style={{ fontWeight: 600, color: '#00a65a' }}>{d.city}</td>
                    <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.address}</td>
                    <td>{d.dateOfDonation}</td>
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-warning"
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: '6px' }}
                          onClick={() => handleOpenMap(d.address, d.city)}
                          title={`View ${d.name}'s address on Google Maps`}
                        >
                          <MapPin size={14} />
                          Map
                          <ExternalLink size={12} style={{ opacity: 0.7 }} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: '6px', backgroundColor: '#dc2626' }}
                          onClick={() => handleSendAlert(d.name, d.Phone)}
                          title={`Send emergency SMS to ${d.name}`}
                        >
                          <Printer size={14} style={{ display: 'none' }} />
                          SMS Alert
                        </button>
                      </div>
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
