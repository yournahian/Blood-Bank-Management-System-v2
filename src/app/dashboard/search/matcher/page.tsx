'use client';

import React, { useState } from 'react';
import { Sparkles, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { getDonors, Donor } from '@/utils/dbManager';

interface MatchResult {
  score: number;
  donor: Donor;
  daysSinceDonation: number | 'Never';
  recommendation: string;
}

export default function IntelligentMatcherPage() {
  const [patientBloodGroup, setPatientBloodGroup] = useState('A+');
  const [patientCity, setPatientCity] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Base coordinates mapping for patient city
  const getCoords = (cityName: string) => {
    switch(cityName.trim().toLowerCase()) {
      case 'dhaka': return { lat: 23.8103, lng: 90.4125 };
      case 'chittagong': return { lat: 22.3569, lng: 91.7832 };
      case 'sylhet': return { lat: 24.8949, lng: 91.8687 };
      case 'rajshahi': return { lat: 24.3745, lng: 88.6042 };
      case 'khulna': return { lat: 22.8456, lng: 89.5403 };
      case 'barisal': return { lat: 22.7010, lng: 90.3535 };
      case 'rangpur': return { lat: 25.7439, lng: 89.2752 };
      case 'comilla': return { lat: 23.4607, lng: 91.1809 };
      case 'gazipur': return { lat: 23.9999, lng: 90.4203 };
      case 'mymensingh': return { lat: 24.7471, lng: 90.4203 };
      default: return null;
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  };

  // Medical compatibility mapping
  const getCompatibleGroups = (group: string): string[] => {
    switch (group) {
      case 'A+': return ['A+', 'A-', 'O+', 'O-'];
      case 'A-': return ['A-', 'O-'];
      case 'B+': return ['B+', 'B-', 'O+', 'O-'];
      case 'B-': return ['B-', 'O-'];
      case 'O+': return ['O+', 'O-'];
      case 'O-': return ['O-'];
      case 'AB+': return ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
      case 'AB-': return ['AB-', 'A-', 'B-', 'O-'];
      default: return [];
    }
  };

  const handleFindMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      const allDonors = await getDonors();
      const compatibleGroups = getCompatibleGroups(patientBloodGroup);

      // Filter compatible donors
      const compatibleDonors = allDonors.filter((d) =>
        compatibleGroups.includes(d.bloodGroup)
      );

      const today = new Date();

      const ranked: MatchResult[] = compatibleDonors.map((donor) => {
        let score = 0;
        let recommendation = '';
        let daysSince: number | 'Never' = 'Never';

        // 1. Eligibility Check (50 pts)
        if (donor.dateOfDonation) {
          // Parse dd-mm-yyyy or yyyy-mm-dd
          let donationDate: Date | null = null;
          if (donor.dateOfDonation.includes('-')) {
            const parts = donor.dateOfDonation.split('-');
            if (parts[0].length === 4) {
              donationDate = new Date(donor.dateOfDonation);
            } else if (parts[2].length === 4) {
              donationDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
          }

          if (donationDate && !isNaN(donationDate.getTime())) {
            const diffTime = Math.abs(today.getTime() - donationDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysSince = diffDays;

            if (diffDays > 90) {
              score += 50;
              recommendation += 'Eligible for donation. ';
            } else {
              const daysToWait = 90 - diffDays;
              recommendation += `WAIT (${daysToWait} days left to recover). `;
            }
          } else {
            score += 50;
            recommendation += 'Fresh Donor. ';
          }
        } else {
          score += 50;
          recommendation += 'Fresh Donor. ';
        }

        // 2. Location Check via GPS Haversine (30 pts)
        if (patientCity.trim()) {
          const patientCoords = getCoords(patientCity);
          if (patientCoords && donor.latitude && donor.longitude) {
            const distance = calculateDistance(patientCoords.lat, patientCoords.lng, donor.latitude, donor.longitude);
            if (distance < 15) {
              score += 30;
              recommendation += `Very Close GPS Match (~${distance.toFixed(1)} km). `;
            } else if (distance < 50) {
              score += 15;
              recommendation += `Nearby GPS Match (~${distance.toFixed(1)} km). `;
            } else {
              recommendation += `Far location (~${distance.toFixed(1)} km). `;
            }
          } else if (donor.city.toLowerCase() === patientCity.trim().toLowerCase()) {
            score += 20; // Fallback string match if GPS fails
            recommendation += 'Same city (Fallback). ';
          }
        }

        // 3. Exact Blood Match (20 pts)
        if (donor.bloodGroup === patientBloodGroup) {
          score += 20;
          recommendation += 'Exact blood type match. ';
        }

        return {
          score,
          donor,
          daysSinceDonation: daysSince,
          recommendation: recommendation.trim(),
        };
      });

      // Sort descending by score
      ranked.sort((a, b) => b.score - a.score);
      setResults(ranked);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="app-card">
        <h2 className="app-card-title">
          <Sparkles size={24} color="#6c63ff" />
          Intelligent Donor Matcher (AI Algorithm)
        </h2>
        <p className="app-card-subtitle">
          Ranks medically compatible blood donors based on 90-day donation eligibility, GPS proximity (Haversine Distance), and exact blood matching score
        </p>

        {/* Input Controls */}
        <form onSubmit={handleFindMatch} style={{ backgroundColor: 'var(--bg-card-subtle)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Patient Blood Group</label>
              <select className="form-select" value={patientBloodGroup} onChange={(e) => setPatientBloodGroup(e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Patient City / Area</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dhaka"
                value={patientCity}
                onChange={(e) => setPatientCity(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }} disabled={loading}>
              <Search size={16} />
              {loading ? 'Matching...' : 'Find Best Match'}
            </button>
          </div>
        </form>

        {/* Results Table */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>Evaluating medical compatibility algorithms...</p>
        ) : !hasSearched ? (
          <div style={{ textTransform: 'none', padding: '2.5rem', textAlign: 'center', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <Sparkles size={32} color="#6c63ff" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Select Patient Blood Group and City above to execute AI Matcher</p>
          </div>
        ) : results.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>No compatible donors found in database for group {patientBloodGroup}.</p>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Match Score</th>
                  <th>Donor Name</th>
                  <th>Group</th>
                  <th>Location</th>
                  <th>Last Donated</th>
                  <th>AI Recommendation & Notes</th>
                </tr>
              </thead>
              <tbody>
                {results.map(({ score, donor, daysSinceDonation, recommendation }) => (
                  <tr key={donor.donorId}>
                    <td>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626',
                        backgroundColor: score >= 80 ? 'rgba(22, 163, 74, 0.15)' : score >= 50 ? 'rgba(217, 119, 6, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '6px'
                      }}>
                        {score}% Match
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{donor.name}</td>
                    <td><span className="badge badge-danger">{donor.bloodGroup}</span></td>
                    <td>{donor.city}</td>
                    <td>{typeof daysSinceDonation === 'number' ? `${daysSinceDonation} Days ago` : 'Never'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'normal' }}>
                      {recommendation}
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
