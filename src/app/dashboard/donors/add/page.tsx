'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addDonor, getNextDonorId } from '@/utils/dbManager';
import { sendWelcomeEmail } from '@/utils/emailProvider';

export default function AddNewDonorPage() {
  const [nextId, setNextId] = useState<number>(1);
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

  useEffect(() => {
    async function loadId() {
      const id = await getNextDonorId();
      setNextId(id);
    }
    loadId();
  }, []);

  const handleReset = () => {
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
    getNextDonorId().then(setNextId);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !name.trim() ||
      !fatherName.trim() ||
      !motherName.trim() ||
      !dob ||
      !phone.trim() ||
      !email.trim() ||
      !city.trim() ||
      !address.trim()
    ) {
      setError('All mandatory fields must be filled out.');
      return;
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Invalid Phone Number. Must be a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).');
      return;
    }

    setLoading(true);

    try {
      // Parse DOB for display
      const dobDate = new Date(dob);
      const dobFormatted = `${String(dobDate.getDate()).padStart(2, '0')}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${dobDate.getFullYear()}`;

      const today = new Date();
      const donationFormatted = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      const newDonor = await addDonor({
        donorId: nextId,
        name: name.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        DOB: dobFormatted,
        Phone: phone.trim(),
        gender,
        email: email.trim(),
        bloodGroup,
        city: city.trim(),
        address: address.trim(),
        dateOfDonation: donationFormatted,
      });

      // Send Welcome Email
      sendWelcomeEmail({
        to: email.trim(),
        donorName: name.trim(),
        donorId: newDonor.donorId,
      });

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setSuccess(`Successfully Saved! Welcome Email dispatched to ${email.trim()}`);

      handleReset();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the donor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="app-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h2 className="app-card-title">
              <UserPlus size={24} color="#cc0033" />
              Add New Donor
            </h2>
            <p className="app-card-subtitle" style={{ marginBottom: 0 }}>Register a new blood donor into the database</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(204, 0, 51, 0.15)', padding: '0.5rem 1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>New Donor ID:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#cc0033' }}>#{nextId}</span>
          </div>
        </div>

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

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Father Name</label>
              <input type="text" className="form-input" placeholder="e.g. Robert Doe" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Mother Name</label>
              <input type="text" className="form-input" placeholder="e.g. Mary Doe" value={motherName} onChange={(e) => setMotherName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" value={dob} onChange={(e) => setDob(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone No</label>
              <input type="text" className="form-input" placeholder="e.g. 01712345678" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" placeholder="e.g. Dhaka" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" rows={3} placeholder="Full street address..." value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Donor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
