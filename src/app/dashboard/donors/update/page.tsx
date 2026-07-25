'use client';

import React, { useState } from 'react';
import { UserCheck, Search, MapPin, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDonors, updateDonor, Donor } from '@/utils/dbManager';

export default function UpdateDonorPage() {
  const [searchId, setSearchId] = useState('');
  const [loadedDonor, setLoadedDonor] = useState<Donor | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const hasUnsavedChanges = () => {
    if (!loadedDonor) return false;
    return (
      name !== loadedDonor.name ||
      fatherName !== loadedDonor.fatherName ||
      motherName !== loadedDonor.motherName ||
      phone !== loadedDonor.Phone ||
      gender !== loadedDonor.gender ||
      email !== loadedDonor.email ||
      bloodGroup !== loadedDonor.bloodGroup ||
      city !== loadedDonor.city ||
      address !== loadedDonor.address
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!searchId.trim()) {
      setError('Please enter a Donor ID to search.');
      return;
    }

    if (loadedDonor && hasUnsavedChanges()) {
      if (!confirm('You have unsaved changes for the current donor.\nDo you want to discard them and search for a new ID?')) {
        return;
      }
    }

    const idNum = parseInt(searchId.trim(), 10);
    if (isNaN(idNum)) {
      setError('Please enter a valid numeric Donor ID.');
      return;
    }

    setLoading(true);

    try {
      const allDonors = await getDonors();
      const donor = allDonors.find((d) => d.donorId === idNum);

      if (!donor) {
        setError(`Donor ID #${idNum} not found in database.`);
        setLoadedDonor(null);
      } else {
        setLoadedDonor(donor);
        setName(donor.name);
        setFatherName(donor.fatherName);
        setMotherName(donor.motherName);
        setDob(donor.DOB);
        setPhone(donor.Phone);
        setGender(donor.gender);
        setEmail(donor.email);
        setBloodGroup(donor.bloodGroup);
        setCity(donor.city);
        setAddress(donor.address);
        setSuccess(`Loaded Donor Details for ID #${donor.donorId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching donor details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loadedDonor) return;

    setError('');
    setSuccess('');

    if (!name.trim() || !phone.trim() || !email.trim() || !city.trim() || !address.trim()) {
      setError('All mandatory fields must be filled.');
      return;
    }

    setLoading(true);

    try {
      const updated: Donor = {
        ...loadedDonor,
        name: name.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        DOB: dob,
        Phone: phone.trim(),
        gender,
        email: email.trim(),
        bloodGroup,
        city: city.trim(),
        address: address.trim(),
      };

      await updateDonor(updated);
      setLoadedDonor(updated);
      setSuccess('Donor details successfully updated!');
    } catch (err: any) {
      setError(err.message || 'Error updating donor details.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowMap = () => {
    if (!address || !city) {
      alert('Please fill Address and City to view location on Google Maps.');
      return;
    }
    const fullQuery = encodeURIComponent(`${address}, ${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${fullQuery}`, '_blank');
  };

  const handleReset = () => {
    setSearchId('');
    setLoadedDonor(null);
    setName('');
    setFatherName('');
    setMotherName('');
    setDob('');
    setPhone('');
    setGender('Male');
    setEmail('');
    setBloodGroup('A+');
    setCity('');
    setAddress('');
    setError('');
    setSuccess('');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="app-card">
        <h2 className="app-card-title">
          <UserCheck size={24} color="#6c63ff" />
          Update Donor Details
        </h2>
        <p className="app-card-subtitle">Search for a registered donor by ID to edit details or open location</p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Donor ID (e.g. 1)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={16} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div style={{ backgroundColor: 'rgba(204, 0, 51, 0.15)', border: '1px solid #dc2626', color: '#dc2626', padding: '0.875rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)', border: '1px solid #16a34a', color: '#16a34a', padding: '0.875rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">Father Name</label>
              <input type="text" className="form-input" value={fatherName} onChange={(e) => setFatherName(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">Mother Name</label>
              <input type="text" className="form-input" value={motherName} onChange={(e) => setMotherName(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="text" className="form-input" value={dob} onChange={(e) => setDob(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone No</label>
              <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <input type="text" className="form-input" value={gender} onChange={(e) => setGender(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <input type="text" className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} disabled={!loadedDonor} required />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} disabled={!loadedDonor} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-warning" onClick={handleShowMap} disabled={!loadedDonor}>
              <MapPin size={16} />
              Show on Map
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset
            </button>
            <button type="submit" className="btn btn-primary" disabled={!loadedDonor || loading}>
              <Save size={16} />
              {loading ? 'Updating...' : 'Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
