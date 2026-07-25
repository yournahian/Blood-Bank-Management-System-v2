import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface Donor {
  donorId: number;
  name: string;
  fatherName: string;
  motherName: string;
  DOB: string;
  Phone: string;
  gender: string;
  email: string;
  bloodGroup: string;
  city: string;
  address: string;
  dateOfDonation: string;
  latitude?: number;
  longitude?: number;
}

export interface StockItem {
  bloodGroup: string;
  units: number;
  expiryDate?: string;
}

export interface Transaction {
  id: number;
  patientName: string;
  hospitalName: string;
  bloodGroup: string;
  units: number;
  date: string;
  status: string;
}

// Generate 100 Initial Donors for local fallback testing
const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Comilla', 'Gazipur', 'Mymensingh'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const generate100Donors = (): Donor[] => {
  const getCoords = (cityName: string) => {
    switch(cityName) {
      case 'Dhaka': return { lat: 23.8103, lng: 90.4125 };
      case 'Chittagong': return { lat: 22.3569, lng: 91.7832 };
      case 'Sylhet': return { lat: 24.8949, lng: 91.8687 };
      case 'Rajshahi': return { lat: 24.3745, lng: 88.6042 };
      case 'Khulna': return { lat: 22.8456, lng: 89.5403 };
      case 'Barisal': return { lat: 22.7010, lng: 90.3535 };
      case 'Rangpur': return { lat: 25.7439, lng: 89.2752 };
      case 'Comilla': return { lat: 23.4607, lng: 91.1809 };
      case 'Gazipur': return { lat: 23.9999, lng: 90.4203 };
      case 'Mymensingh': return { lat: 24.7471, lng: 90.4203 };
      default: return { lat: 23.8103, lng: 90.4125 };
    }
  };

  const list: Donor[] = [
    {
      donorId: 1,
      name: 'Aarav Ahmed',
      fatherName: 'Tanvir Ahmed',
      motherName: 'Nusrat Ahmed',
      DOB: '12-05-1994',
      Phone: '01711002201',
      gender: 'Male',
      email: 'aarav.ahmed@example.com',
      bloodGroup: 'O+',
      city: 'Dhaka',
      address: 'House 12, Road 5, Dhanmondi',
      dateOfDonation: '15-06-2026',
      latitude: 23.8103,
      longitude: 90.4125
    },
    {
      donorId: 2,
      name: 'Ananya Roy',
      fatherName: 'Subhash Roy',
      motherName: 'Maya Roy',
      DOB: '20-08-1996',
      Phone: '01812003302',
      gender: 'Female',
      email: 'ananya.roy@example.com',
      bloodGroup: 'A+',
      city: 'Chittagong',
      address: '45 GEC Circle, Nasirabad',
      dateOfDonation: '10-04-2026',
      latitude: 22.3569,
      longitude: 91.7832
    },
    {
      donorId: 3,
      name: 'Arif Hossain',
      fatherName: 'Delwar Hossain',
      motherName: 'Rokeya Begum',
      DOB: '15-01-1990',
      Phone: '01913004403',
      gender: 'Male',
      email: 'arif.h@example.com',
      bloodGroup: 'B+',
      city: 'Dhaka',
      address: '78 Gulshan Avenue, Plot 4',
      dateOfDonation: '02-07-2026',
      latitude: 23.8203,
      longitude: 90.4225
    },
    {
      donorId: 4,
      name: 'Bishal Das',
      fatherName: 'Bipul Das',
      motherName: 'Anita Das',
      DOB: '11-11-1992',
      Phone: '01614005504',
      gender: 'Male',
      email: 'bishal.das@example.com',
      bloodGroup: 'O-',
      city: 'Sylhet',
      address: '14 Zindabazar, Ward 3',
      dateOfDonation: '20-02-2026',
      latitude: 24.8949,
      longitude: 91.8687
    },
    {
      donorId: 5,
      name: 'Chowdhury Rahat',
      fatherName: 'Faruk Chowdhury',
      motherName: 'Salma Begum',
      DOB: '05-03-1988',
      Phone: '01515006605',
      gender: 'Male',
      email: 'rahat.c@example.com',
      bloodGroup: 'AB+',
      city: 'Rajshahi',
      address: '89 Shaheb Bazar',
      dateOfDonation: '18-05-2026',
      latitude: 24.3745,
      longitude: 88.6042
    },
  ];

  const firstNames = ['Tanvir', 'Farhana', 'Rahim', 'Humaira', 'Imtiaz', 'Jannat', 'Kabir', 'Lamia', 'Mahfuz', 'Nusrat', 'Omar', 'Parveen', 'Quazi', 'Rashed', 'Sonia', 'Tariq', 'Umme', 'Victor', 'Wasim', 'Yasmin'];
  const lastNames = ['Hossain', 'Islam', 'Rahman', 'Khan', 'Ahmed', 'Chowdhury', 'Begum', 'Sultana', 'Ali', 'Gazi', 'Alam', 'Akter', 'Aziz', 'Mahmud', 'Paul', 'Das', 'Roy', 'Sharma', 'Rozario', 'Costa'];

  for (let i = 6; i <= 100; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const gender = i % 3 === 0 ? 'Female' : i % 7 === 0 ? 'Others' : 'Male';
    const city = CITIES[i % CITIES.length];
    const bg = BLOOD_GROUPS[i % BLOOD_GROUPS.length];

    // Varied donation dates to test expiry, warnings, and AI prediction
    const month = String((i % 12) + 1).padStart(2, '0');
    const day = String((i % 28) + 1).padStart(2, '0');
    const year = i % 4 === 0 ? '2025' : '2026';
    const dateOfDonation = `${day}-${month}-${year}`;

    const baseCoords = getCoords(city);
    // Add slight randomness to coords so they aren't all exactly on top of each other
    const lat = baseCoords.lat + (Math.random() * 0.05 - 0.025);
    const lng = baseCoords.lng + (Math.random() * 0.05 - 0.025);

    list.push({
      donorId: i,
      name: `${fn} ${ln} ${i}`,
      fatherName: `Father ${fn}`,
      motherName: `Mother ${ln}`,
      DOB: `15-05-199${i % 10}`,
      Phone: `017${String(i).padStart(8, '0')}`,
      gender,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      bloodGroup: bg,
      city,
      address: `House ${i * 2}, Sector ${(i % 14) + 1}, ${city}`,
      dateOfDonation,
      latitude: lat,
      longitude: lng
    });
  }

  return list;
};

const INITIAL_DONORS: Donor[] = generate100Donors();

const INITIAL_STOCK: StockItem[] = [
  { bloodGroup: 'A+', units: 45, expiryDate: '30-08-2026' },
  { bloodGroup: 'A-', units: 12, expiryDate: '15-09-2026' },
  { bloodGroup: 'B+', units: 50, expiryDate: '01-09-2026' },
  { bloodGroup: 'B-', units: 8, expiryDate: '20-08-2026' },
  { bloodGroup: 'O+', units: 65, expiryDate: '10-09-2026' },
  { bloodGroup: 'O-', units: 18, expiryDate: '05-09-2026' },
  { bloodGroup: 'AB+', units: 22, expiryDate: '12-09-2026' },
  { bloodGroup: 'AB-', units: 6, expiryDate: '25-08-2026' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 101, patientName: 'Alice Smith', hospitalName: 'Square Hospital, Dhaka', bloodGroup: 'O+', units: 2, date: '15-07-2026', status: 'DELIVERED' },
  { id: 102, patientName: 'Bob Vance', hospitalName: 'Labaid Hospital, Dhaka', bloodGroup: 'B+', units: 1, date: '20-07-2026', status: 'APPROVED' },
  { id: 103, patientName: 'Catherine Zeta', hospitalName: 'Apollo Hospital, Dhaka', bloodGroup: 'A+', units: 2, date: '18-07-2026', status: 'DELIVERED' },
  { id: 104, patientName: 'David Miller', hospitalName: 'Chittagong Medical College', bloodGroup: 'O-', units: 3, date: '12-07-2026', status: 'APPROVED' },
  { id: 105, patientName: 'Eva Green', hospitalName: 'Sylhet MAG Osmani Medical', bloodGroup: 'AB+', units: 1, date: '10-07-2026', status: 'DELIVERED' },
  { id: 106, patientName: 'Fahim Shah', hospitalName: 'Rajshahi Medical College', bloodGroup: 'B-', units: 2, date: '05-07-2026', status: 'DELIVERED' },
  { id: 107, patientName: 'Gulshan Ara', hospitalName: 'Khulna City Hospital', bloodGroup: 'A-', units: 1, date: '01-07-2026', status: 'APPROVED' },
  { id: 108, patientName: 'Hasan Mahmud', hospitalName: 'Gazipur Sadar Hospital', bloodGroup: 'O+', units: 4, date: '21-07-2026', status: 'APPROVED' },
  { id: 109, patientName: 'Ibrahim Khalil', hospitalName: 'Barisal Sher-e-Bangla Medical', bloodGroup: 'B+', units: 2, date: '19-07-2026', status: 'DELIVERED' },
  { id: 110, patientName: 'Jasmine Chowdhury', hospitalName: 'Comilla Medical College', bloodGroup: 'AB-', units: 1, date: '14-07-2026', status: 'APPROVED' },
];

// Helper to get local data
const getLocal = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

// DONOR API
export async function getDonors(): Promise<Donor[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('donor').select('*').order('donorId', { ascending: true });
    if (!error && data) return data as Donor[];
  }
  return getLocal('bbms_donors', INITIAL_DONORS);
}

export async function getNextDonorId(): Promise<number> {
  const donors = await getDonors();
  if (donors.length === 0) return 1;
  const maxId = Math.max(...donors.map(d => d.donorId || 0));
  return maxId + 1;
}

export async function addDonor(donor: Omit<Donor, 'donorId'> & { donorId?: number }): Promise<Donor> {
  const nextId = donor.donorId || (await getNextDonorId());
  const newDonor: Donor = { ...donor, donorId: nextId };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('donor').insert([newDonor]).select();
    if (!error && data && data.length > 0) return data[0] as Donor;
  }

  const donors = getLocal('bbms_donors', INITIAL_DONORS);
  const updated = [...donors, newDonor];
  setLocal('bbms_donors', updated);
  return newDonor;
}

export async function updateDonor(donor: Donor): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('donor').update(donor).eq('donorId', donor.donorId);
    if (!error) return true;
  }

  const donors = getLocal('bbms_donors', INITIAL_DONORS);
  const updated = donors.map(d => (d.donorId === donor.donorId ? donor : d));
  setLocal('bbms_donors', updated);
  return true;
}

export async function deleteDonor(donorId: number): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('donor').delete().eq('donorId', donorId);
    if (!error) return true;
  }

  const donors = getLocal('bbms_donors', INITIAL_DONORS);
  const updated = donors.filter(d => d.donorId !== donorId);
  setLocal('bbms_donors', updated);
  return true;
}

// STOCK API
export async function getStock(): Promise<StockItem[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('stock').select('*');
    if (!error && data && data.length > 0) return data as StockItem[];
  }
  return getLocal('bbms_stock', INITIAL_STOCK);
}

export async function updateStock(bloodGroup: string, unitsChange: number, isAbsolute: boolean = false): Promise<{ success: boolean; message?: string }> {
  const stockList = await getStock();
  const item = stockList.find(s => s.bloodGroup === bloodGroup);
  const currentUnits = item ? item.units : 0;
  const newUnits = isAbsolute ? unitsChange : currentUnits + unitsChange;

  if (newUnits < 0) {
    return { success: false, message: `Not enough stock! Current stock for ${bloodGroup} is ${currentUnits}` };
  }

  let expiryDate = item?.expiryDate;
  if (unitsChange > 0) {
    const today = new Date();
    today.setDate(today.getDate() + 35);
    expiryDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  }

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('stock').upsert({ bloodGroup, units: newUnits, expiryDate });
    if (!error) return { success: true };
  }

  const updatedStock = stockList.map(s => (s.bloodGroup === bloodGroup ? { ...s, units: newUnits, expiryDate } : s));
  if (!stockList.some(s => s.bloodGroup === bloodGroup)) {
    updatedStock.push({ bloodGroup, units: newUnits, expiryDate });
  }
  setLocal('bbms_stock', updatedStock);
  return { success: true };
}

// TRANSACTIONS API
export async function getTransactions(): Promise<Transaction[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('transactions').select('*').order('id', { ascending: false });
    if (!error && data) return data as Transaction[];
  }
  return getLocal('bbms_transactions', INITIAL_TRANSACTIONS);
}

export async function addTransaction(trans: Omit<Transaction, 'id'>): Promise<Transaction> {
  const existing = await getTransactions();
  const nextId = existing.length > 0 ? Math.max(...existing.map(t => t.id || 0)) + 1 : 101;
  const newTrans: Transaction = { ...trans, id: nextId };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('transactions').insert([newTrans]).select();
    if (!error && data && data.length > 0) return data[0] as Transaction;
  }

  const updated = [newTrans, ...existing];
  setLocal('bbms_transactions', updated);
  return newTrans;
}

export async function updateTransactionStatus(id: number, status: string): Promise<{ success: boolean; message?: string }> {
  // First, find the transaction
  const transactions = await getTransactions();
  const trans = transactions.find(t => t.id === id);
  if (!trans) return { success: false, message: 'Transaction not found.' };

  // If transitioning to DELIVERED, attempt to deduct stock
  if (status === 'DELIVERED' && trans.status !== 'DELIVERED') {
    const stockRes = await updateStock(trans.bloodGroup, -trans.units);
    if (!stockRes.success) {
      return { success: false, message: stockRes.message };
    }
  }

  // Update in Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('transactions').update({ status }).eq('id', id);
    if (error) return { success: false, message: 'Database update failed.' };
  }

  // Update local fallback
  const existing = getLocal<Transaction[]>('bbms_transactions', INITIAL_TRANSACTIONS);
  const updated = existing.map(t => (t.id === id ? { ...t, status } : t));
  setLocal('bbms_transactions', updated);
  
  return { success: true };
}
