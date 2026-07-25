-- ======================================================
-- Supabase SQL Migration & 100 Dummy Data Seed Script
-- ======================================================

-- 1. Create DONOR table
CREATE TABLE IF NOT EXISTS donor (
  "donorId" SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  "fatherName" TEXT,
  "motherName" TEXT,
  "DOB" TEXT NOT NULL,
  "Phone" TEXT NOT NULL,
  gender TEXT NOT NULL,
  email TEXT NOT NULL,
  "bloodGroup" TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  "dateOfDonation" TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL
);

ALTER TABLE donor ADD COLUMN IF NOT EXISTS latitude FLOAT DEFAULT 0.0;
ALTER TABLE donor ADD COLUMN IF NOT EXISTS longitude FLOAT DEFAULT 0.0;

-- 2. Create STOCK table
CREATE TABLE IF NOT EXISTS stock (
  "bloodGroup" TEXT PRIMARY KEY,
  units INTEGER NOT NULL DEFAULT 0,
  "expiryDate" TEXT
);

ALTER TABLE stock ADD COLUMN IF NOT EXISTS "expiryDate" TEXT;

-- 3. Create TRANSACTIONS table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  "patientName" TEXT NOT NULL,
  "hospitalName" TEXT NOT NULL,
  "bloodGroup" TEXT NOT NULL,
  units INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Enable Row Level Security (RLS) policies for public access
ALTER TABLE donor ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write access to donor" ON donor;
DROP POLICY IF EXISTS "Allow public read/write access to stock" ON stock;
DROP POLICY IF EXISTS "Allow public read/write access to transactions" ON transactions;

CREATE POLICY "Allow public read/write access to donor" ON donor FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to stock" ON stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- ======================================================
-- SEED DATA (STOCK LEVELS)
-- ======================================================
INSERT INTO stock ("bloodGroup", units, "expiryDate") VALUES
  ('A+', 45, '30-08-2026'),
  ('A-', 12, '15-09-2026'),
  ('B+', 50, '01-09-2026'),
  ('B-', 8, '20-08-2026'),
  ('O+', 65, '10-09-2026'),
  ('O-', 18, '05-09-2026'),
  ('AB+', 22, '12-09-2026'),
  ('AB-', 6, '25-08-2026')
ON CONFLICT ("bloodGroup") DO UPDATE SET units = EXCLUDED.units, "expiryDate" = EXCLUDED."expiryDate";

-- ======================================================
-- SEED DATA (100 DONORS)
-- ======================================================
INSERT INTO donor (name, "fatherName", "motherName", "DOB", "Phone", gender, email, "bloodGroup", city, address, "dateOfDonation", latitude, longitude) VALUES
  ('Aarav Ahmed', 'Tanvir Ahmed', 'Nusrat Ahmed', '12-05-1994', '01711002201', 'Male', 'aarav.ahmed@example.com', 'O+', 'Dhaka', 'House 12, Road 5, Dhanmondi', '15-06-2026', 23.796104, 90.417798),
  ('Ananya Roy', 'Subhash Roy', 'Maya Roy', '20-08-1996', '01812003302', 'Female', 'ananya.roy@example.com', 'A+', 'Chittagong', '45 GEC Circle, Nasirabad', '10-04-2026', 22.365068, 91.761410),
  ('Arif Hossain', 'Delwar Hossain', 'Rokeya Begum', '15-01-1990', '01913004403', 'Male', 'arif.h@example.com', 'B+', 'Dhaka', '78 Gulshan Avenue, Plot 4', '02-07-2026', 23.829542, 90.421944),
  ('Bishal Das', 'Bipul Das', 'Anita Das', '11-11-1992', '01614005504', 'Male', 'bishal.das@example.com', 'O-', 'Sylhet', '14 Zindabazar, Ward 3', '20-02-2026', 24.874392, 91.893071),
  ('Chowdhury Rahat', 'Faruk Chowdhury', 'Salma Begum', '05-03-1988', '01515006605', 'Male', 'rahat.c@example.com', 'AB+', 'Rajshahi', '89 Shaheb Bazar', '18-05-2026', 24.358802, 88.608257),
  ('Diana Costa', 'Peter Costa', 'Mary Costa', '25-07-1998', '01716007706', 'Female', 'diana.c@example.com', 'A-', 'Dhaka', '22 Tejgaon I/A', '12-03-2026', 23.823290, 90.420837),
  ('Ehsan Khan', 'Imtiaz Khan', 'Shabnam Khan', '30-09-1991', '01817008807', 'Male', 'ehsan.khan@example.com', 'B-', 'Khulna', '56 KDA Avenue', '28-06-2026', 22.825820, 89.517600),
  ('Farhana Yesmin', 'Kamrul Hasan', 'Rehana Parvin', '14-02-1995', '01918009908', 'Female', 'farhana.y@example.com', 'AB-', 'Barisal', '33 Sadar Road', '01-05-2026', 22.709796, 90.376203),
  ('Gazi Mazhar', 'Anwar Gazi', 'Nazma Gazi', '18-04-1989', '01619011009', 'Male', 'gazi.m@example.com', 'O+', 'Rangpur', '12 Modern Mode', '14-06-2026', 25.734771, 89.264267),
  ('Humaira Islam', 'Shafiqul Islam', 'Rokea Begum', '22-06-1997', '01520022110', 'Female', 'humaira.i@example.com', 'A+', 'Comilla', '67 Kandirpar', '22-04-2026', 23.464778, 91.166463),
  ('Imtiaz Mahmud', 'Jahangir Mahmud', 'Laila Mahmud', '08-10-1993', '01721033221', 'Male', 'imtiaz.m@example.com', 'B+', 'Gazipur', '45 Board Bazar', '10-07-2026', 24.011500, 90.415608),
  ('Jannatul Ferdous', 'Abul Kashem', 'Jahanara Begum', '19-12-1999', '01822044332', 'Female', 'jannat.f@example.com', 'O-', 'Dhaka', '102 Uttara Sector 4', '05-01-2026', 23.828461, 90.406462),
  ('Kabir Hossain', 'Monir Hossain', 'Asma Begum', '03-03-1985', '01923055443', 'Male', 'kabir.h@example.com', 'A-', 'Chittagong', '12 Agrabad Access Road', '19-06-2026', 22.348559, 91.787887),
  ('Lamia Rahman', 'Zillur Rahman', 'Razia Sultana', '16-08-1994', '01624066554', 'Female', 'lamia.r@example.com', 'AB+', 'Sylhet', '77 Amberkhana', '04-03-2026', 24.875890, 91.873756),
  ('Mahfuz Alam', 'Shah Alam', 'Mahmuda Begum', '27-01-1991', '01525077665', 'Male', 'mahfuz.a@example.com', 'B-', 'Mymensingh', '23 Town Hall Road', '11-05-2026', 24.735718, 90.422572),
  ('Nusrat Jahan', 'Mosharraf Hossain', 'Bilkis Begum', '09-05-1996', '01726088776', 'Female', 'nusrat.j@example.com', 'O+', 'Dhaka', '55 Mirpur 10 Circle', '20-06-2026', 23.789375, 90.427003),
  ('Omar Faruk', 'Omar Ali', 'Suraiya Begum', '14-07-1987', '01827099887', 'Male', 'omar.f@example.com', 'A+', 'Rajshahi', '90 Kazla, RU Campus', '08-04-2026', 24.373763, 88.608430),
  ('Parveen Sultana', 'Mustafizur Rahman', 'Kohinoor Begum', '31-03-1993', '01928110998', 'Female', 'parveen.s@example.com', 'B+', 'Khulna', '12 Boyra Main Road', '16-07-2026', 22.847765, 89.534857),
  ('Quazi Ashfaq', 'Quazi Nazrul', 'Quazi Fatima', '24-10-1990', '01629122009', 'Male', 'quazi.a@example.com', 'AB-', 'Dhaka', '34 Banani Block C', '02-02-2026', 23.813277, 90.418459),
  ('Rashedul Islam', 'Nurul Islam', 'Halima Begum', '06-06-1995', '01530133120', 'Male', 'rashed.i@example.com', 'O-', 'Barisal', '78 Natun Bazar', '25-05-2026', 22.719729, 90.336180),
  ('Sonia Akter', 'Siraj Miah', 'Amina Khatun', '17-09-1997', '01731144231', 'Female', 'sonia.a@example.com', 'A-', 'Rangpur', '44 Dhap Jail Road', '12-06-2026', 25.746801, 89.264294),
  ('Tariqul Aziz', 'Abdul Aziz', 'Kulsum Bibi', '02-12-1986', '01832155342', 'Male', 'tariq.a@example.com', 'B-', 'Gazipur', '88 Chandana Chowrasta', '30-03-2026', 24.016012, 90.441426),
  ('Umme Salma', 'Sayed Ahmed', 'Fatema Khatun', '11-04-1998', '01933166453', 'Female', 'salma.u@example.com', 'AB+', 'Comilla', '19 Jhautala', '14-07-2026', 23.481721, 91.178749),
  ('Victor Gomez', 'Francis Gomez', 'Helen Gomez', '29-08-1992', '01634177564', 'Male', 'victor.g@example.com', 'O+', 'Dhaka', '67 Luxmibazar, Old Dhaka', '09-04-2026', 23.833322, 90.420636),
  ('Wasim Akram', 'Akram Hossain', 'Monowara Begum', '13-01-1991', '01535188675', 'Male', 'wasim.a@example.com', 'A+', 'Chittagong', '101 Halishahar Housing', '21-06-2026', 22.349688, 91.793497),
  ('Xavier Rozario', 'Patrick Rozario', 'Rita Rozario', '05-05-1994', '01736199786', 'Male', 'xavier.r@example.com', 'B+', 'Dhaka', '15 Farmgate, Green Super Market', '03-05-2026', 23.830339, 90.433879),
  ('Yasmin Ara', 'Yousuf Ali', 'Zohra Begum', '21-11-1996', '01837210897', 'Female', 'yasmin.a@example.com', 'O-', 'Sylhet', '66 Chhatak Road', '18-06-2026', 24.909791, 91.892600),
  ('Zubair Hossain', 'Zakir Hossain', 'Mariam Begum', '07-07-1989', '01938221908', 'Male', 'zubair.h@example.com', 'AB-', 'Mymensingh', '50 Ganginar Par', '27-02-2026', 24.753067, 90.430113),
  ('Abdul Karim', 'Abul Kalam', 'Rahela Khatun', '18-02-1993', '01639232019', 'Male', 'karim.a@example.com', 'A-', 'Rajshahi', '11 Motihar', '10-06-2026', 24.356835, 88.589346),
  ('Binte Nur', 'Nur Mohammad', 'Sufia Begum', '26-03-1999', '01540243120', 'Female', 'binte.nur@example.com', 'B-', 'Khulna', '89 Sonadanga Bus Terminal', '06-07-2026', 22.830362, 89.549553),
  ('Chandan Paul', 'Chittaranjan Paul', 'Gita Paul', '10-10-1991', '01741254231', 'Male', 'chandan.p@example.com', 'O+', 'Dhaka', '77 Shantinagar', '15-04-2026', 23.799185, 90.396700),
  ('Dilruba Khanam', 'Firoz Khan', 'Shahnaz Khanam', '04-04-1995', '01842265342', 'Female', 'dilruba.k@example.com', 'AB+', 'Chittagong', '23 Chawkbazar', '01-07-2026', 22.341033, 91.788832),
  ('Emran Hossain', 'Emdadul Huq', 'Hazera Begum', '12-09-1988', '01943276453', 'Male', 'emran.h@example.com', 'A+', 'Dhaka', '99 Badda Link Road', '22-05-2026', 23.791918, 90.411187),
  ('Fariha Chowdhury', 'Anis Chowdhury', 'Runa Chowdhury', '28-01-1997', '01644287564', 'Female', 'fariha.c@example.com', 'B+', 'Sylhet', '33 Shibganj', '11-06-2026', 24.908019, 91.848367),
  ('Golam Rabby', 'Golam Mustafa', 'Lutfa Begum', '15-06-1993', '01545298675', 'Male', 'rabby.g@example.com', 'O-', 'Gazipur', '14 Joydebpur', '05-03-2026', 23.994016, 90.415956),
  ('Hasib Burhan', 'Burhan Uddin', 'Saleha Begum', '23-12-1990', '01746309786', 'Male', 'hasib.b@example.com', 'AB-', 'Barisal', '67 Natullabad', '17-07-2026', 22.699019, 90.336096),
  ('Ishrat Jahan', 'Iqbal Hossain', 'Nasreen Begum', '07-08-1996', '01847320897', 'Female', 'ishrat.j@example.com', 'A-', 'Rangpur', '88 Jahaz Company Mode', '29-04-2026', 25.737618, 89.254647),
  ('Jamil Ahmed', 'Jalal Ahmed', 'Sabina Yasmin', '19-05-1992', '01948331908', 'Male', 'jamil.a@example.com', 'B-', 'Comilla', '12 Ramghat', '08-06-2026', 23.445549, 91.167043),
  ('Kazi Naeem', 'Kazi Anwar', 'Kazi Rina', '31-10-1989', '01649342019', 'Male', 'naeem.k@example.com', 'O+', 'Dhaka', '45 Malibagh Chowdhury Para', '19-05-2026', 23.808601, 90.434118),
  ('Lubna Yasmin', 'Lutfar Rahman', 'Meherun Nesa', '14-03-1998', '01550353120', 'Female', 'lubna.y@example.com', 'AB+', 'Rajshahi', '23 Shiroil', '02-07-2026', 24.370164, 88.613414),
  ('Moniruzzaman', 'Monir Hossain', 'Ferdousi Begum', '02-07-1987', '01751364231', 'Male', 'monir.z@example.com', 'A+', 'Khulna', '77 Rupsha', '12-04-2026', 22.869543, 89.547485),
  ('Naimur Rahman', 'Nizam Uddin', 'Jahanara Naim', '25-11-1994', '01852375342', 'Male', 'naimur.r@example.com', 'B+', 'Dhaka', '12 Elephant Road', '26-06-2026', 23.819727, 90.429845),
  ('Orpona Sharma', 'Uttam Sharma', 'Saraswati Sharma', '08-02-1996', '01953386453', 'Female', 'orpona.s@example.com', 'O-', 'Chittagong', '44 Prabartak Mode', '14-01-2026', 22.343085, 91.785788),
  ('Prabal Chowdhury', 'Pabitra Chowdhury', 'Purnima Chowdhury', '17-04-1991', '01654397564', 'Male', 'prabal.c@example.com', 'AB-', 'Sylhet', '90 Subidbazar', '09-06-2026', 24.913431, 91.888565),
  ('Qazi Zameer', 'Qazi Motiur', 'Qazi Rizia', '30-09-1986', '01555408675', 'Male', 'zameer.q@example.com', 'A-', 'Mymensingh', '18 Charpara', '21-03-2026', 24.747986, 90.406075),
  ('Riya Das', 'Ratan Das', 'Rina Das', '12-01-1997', '01756419786', 'Female', 'riya.das@example.com', 'B-', 'Gazipur', '65 Tongi Bazar', '07-07-2026', 24.007323, 90.406101),
  ('Shahriar Nafis', 'Nafis Ahmed', 'Shaheen Ahmed', '20-06-1993', '01857430897', 'Male', 'nafis.s@example.com', 'O+', 'Dhaka', '88 Mohammadpur Tajmahal Road', '16-05-2026', 23.811636, 90.396864),
  ('Tania Akter', 'Tofazzal Hossain', 'Momotaz Begum', '03-10-1995', '01958441908', 'Female', 'tania.a@example.com', 'AB+', 'Barisal', '22 C&B Road', '30-04-2026', 22.717470, 90.355078),
  ('Usman Gani', 'Gani Miah', 'Sahera Begum', '16-08-1990', '01659452019', 'Male', 'usman.g@example.com', 'A+', 'Rangpur', '10 RK Road', '11-07-2026', 25.741216, 89.272639),
  ('Verified Donor 50', 'Test Father 50', 'Test Mother 50', '01-01-1990', '01700000050', 'Male', 'donor50@example.com', 'B+', 'Dhaka', 'Sample Address 50', '01-07-2026', 23.821474, 90.433420),
  ('Verified Donor 51', 'Test Father 51', 'Test Mother 51', '02-02-1991', '01700000051', 'Female', 'donor51@example.com', 'O+', 'Chittagong', 'Sample Address 51', '02-06-2026', 22.356941, 91.763170),
  ('Verified Donor 52', 'Test Father 52', 'Test Mother 52', '03-03-1992', '01700000052', 'Male', 'donor52@example.com', 'A-', 'Dhaka', 'Sample Address 52', '03-05-2026', 23.803841, 90.436838),
  ('Verified Donor 53', 'Test Father 53', 'Test Mother 53', '04-04-1993', '01700000053', 'Female', 'donor53@example.com', 'AB+', 'Sylhet', 'Sample Address 53', '04-04-2026', 24.892713, 91.886687),
  ('Verified Donor 54', 'Test Father 54', 'Test Mother 54', '05-05-1994', '01700000054', 'Male', 'donor54@example.com', 'O-', 'Rajshahi', 'Sample Address 54', '05-03-2026', 24.375063, 88.579555),
  ('Verified Donor 55', 'Test Father 55', 'Test Mother 55', '06-06-1995', '01700000055', 'Female', 'donor55@example.com', 'B-', 'Khulna', 'Sample Address 55', '06-02-2026', 22.853769, 89.520487),
  ('Verified Donor 56', 'Test Father 56', 'Test Mother 56', '07-07-1996', '01700000056', 'Male', 'donor56@example.com', 'AB-', 'Barisal', 'Sample Address 56', '07-01-2026', 22.712071, 90.351353),
  ('Verified Donor 57', 'Test Father 57', 'Test Mother 57', '08-08-1997', '01700000057', 'Female', 'donor57@example.com', 'A+', 'Rangpur', 'Sample Address 57', '18-06-2026', 25.741946, 89.250836),
  ('Verified Donor 58', 'Test Father 58', 'Test Mother 58', '09-09-1998', '01700000058', 'Male', 'donor58@example.com', 'B+', 'Gazipur', 'Sample Address 58', '19-05-2026', 23.999674, 90.403802),
  ('Verified Donor 59', 'Test Father 59', 'Test Mother 59', '10-10-1999', '01700000059', 'Female', 'donor59@example.com', 'O+', 'Comilla', 'Sample Address 59', '20-04-2026', 23.443218, 91.192599),
  ('Verified Donor 60', 'Test Father 60', 'Test Mother 60', '11-11-1988', '01700000060', 'Male', 'donor60@example.com', 'A-', 'Dhaka', 'Sample Address 60', '21-03-2026', 23.802032, 90.402876),
  ('Verified Donor 61', 'Test Father 61', 'Test Mother 61', '12-12-1989', '01700000061', 'Female', 'donor61@example.com', 'O-', 'Chittagong', 'Sample Address 61', '22-02-2026', 22.378433, 91.785869),
  ('Verified Donor 62', 'Test Father 62', 'Test Mother 62', '13-01-1990', '01700000062', 'Male', 'donor62@example.com', 'AB+', 'Sylhet', 'Sample Address 62', '23-01-2026', 24.902946, 91.849450),
  ('Verified Donor 63', 'Test Father 63', 'Test Mother 63', '14-02-1991', '01700000063', 'Female', 'donor63@example.com', 'B-', 'Mymensingh', 'Sample Address 63', '10-07-2026', 24.736657, 90.440332),
  ('Verified Donor 64', 'Test Father 64', 'Test Mother 64', '15-03-1992', '01700000064', 'Male', 'donor64@example.com', 'AB-', 'Dhaka', 'Sample Address 64', '09-06-2026', 23.813092, 90.426782),
  ('Verified Donor 65', 'Test Father 65', 'Test Mother 65', '16-04-1993', '01700000065', 'Female', 'donor65@example.com', 'A+', 'Rajshahi', 'Sample Address 65', '08-05-2026', 24.358801, 88.611576),
  ('Verified Donor 66', 'Test Father 66', 'Test Mother 66', '17-05-1994', '01700000066', 'Male', 'donor66@example.com', 'B+', 'Khulna', 'Sample Address 66', '07-04-2026', 22.837130, 89.529400),
  ('Verified Donor 67', 'Test Father 67', 'Test Mother 67', '18-06-1995', '01700000067', 'Female', 'donor67@example.com', 'O+', 'Dhaka', 'Sample Address 67', '06-03-2026', 23.815397, 90.410451),
  ('Verified Donor 68', 'Test Father 68', 'Test Mother 68', '19-07-1996', '01700000068', 'Male', 'donor68@example.com', 'A-', 'Chittagong', 'Sample Address 68', '05-02-2026', 22.365963, 91.768400),
  ('Verified Donor 69', 'Test Father 69', 'Test Mother 69', '20-08-1997', '01700000069', 'Female', 'donor69@example.com', 'B-', 'Barisal', 'Sample Address 69', '04-01-2026', 22.704582, 90.338214),
  ('Verified Donor 70', 'Test Father 70', 'Test Mother 70', '21-09-1998', '01700000070', 'Male', 'donor70@example.com', 'O-', 'Rangpur', 'Sample Address 70', '15-07-2026', 25.731332, 89.257171),
  ('Verified Donor 71', 'Test Father 71', 'Test Mother 71', '22-10-1999', '01700000071', 'Female', 'donor71@example.com', 'AB+', 'Gazipur', 'Sample Address 71', '14-06-2026', 23.982894, 90.427612),
  ('Verified Donor 72', 'Test Father 72', 'Test Mother 72', '23-11-1988', '01700000072', 'Male', 'donor72@example.com', 'AB-', 'Comilla', 'Sample Address 72', '13-05-2026', 23.477551, 91.166091),
  ('Verified Donor 73', 'Test Father 73', 'Test Mother 73', '24-12-1989', '01700000073', 'Female', 'donor73@example.com', 'A+', 'Dhaka', 'Sample Address 73', '12-04-2026', 23.802699, 90.408932),
  ('Verified Donor 74', 'Test Father 74', 'Test Mother 74', '25-01-1990', '01700000074', 'Male', 'donor74@example.com', 'B+', 'Sylhet', 'Sample Address 74', '11-03-2026', 24.881763, 91.854088),
  ('Verified Donor 75', 'Test Father 75', 'Test Mother 75', '26-02-1991', '01700000075', 'Female', 'donor75@example.com', 'O+', 'Rajshahi', 'Sample Address 75', '10-02-2026', 24.397669, 88.582145),
  ('Verified Donor 76', 'Test Father 76', 'Test Mother 76', '27-03-1992', '01700000076', 'Male', 'donor76@example.com', 'A-', 'Khulna', 'Sample Address 76', '09-01-2026', 22.846379, 89.526812),
  ('Verified Donor 77', 'Test Father 77', 'Test Mother 77', '28-04-1993', '01700000077', 'Female', 'donor77@example.com', 'B-', 'Dhaka', 'Sample Address 77', '18-07-2026', 23.789195, 90.396786),
  ('Verified Donor 78', 'Test Father 78', 'Test Mother 78', '29-05-1994', '01700000078', 'Male', 'donor78@example.com', 'O-', 'Chittagong', 'Sample Address 78', '17-06-2026', 22.348099, 91.766042),
  ('Verified Donor 79', 'Test Father 79', 'Test Mother 79', '30-06-1995', '01700000079', 'Female', 'donor79@example.com', 'AB+', 'Mymensingh', 'Sample Address 79', '16-05-2026', 24.743665, 90.419933),
  ('Verified Donor 80', 'Test Father 80', 'Test Mother 80', '01-07-1996', '01700000080', 'Male', 'donor80@example.com', 'AB-', 'Barisal', 'Sample Address 80', '15-04-2026', 22.707556, 90.359802),
  ('Verified Donor 81', 'Test Father 81', 'Test Mother 81', '02-08-1997', '01700000081', 'Female', 'donor81@example.com', 'A+', 'Rangpur', 'Sample Address 81', '14-03-2026', 25.758596, 89.279312),
  ('Verified Donor 82', 'Test Father 82', 'Test Mother 82', '03-09-1998', '01700000082', 'Male', 'donor82@example.com', 'B+', 'Gazipur', 'Sample Address 82', '13-02-2026', 24.014923, 90.436813),
  ('Verified Donor 83', 'Test Father 83', 'Test Mother 83', '04-10-1999', '01700000083', 'Female', 'donor83@example.com', 'O+', 'Comilla', 'Sample Address 83', '12-01-2026', 23.473382, 91.185029),
  ('Verified Donor 84', 'Test Father 84', 'Test Mother 84', '05-11-1988', '01700000084', 'Male', 'donor84@example.com', 'A-', 'Dhaka', 'Sample Address 84', '20-07-2026', 23.785678, 90.404359),
  ('Verified Donor 85', 'Test Father 85', 'Test Mother 85', '06-12-1989', '01700000085', 'Female', 'donor85@example.com', 'B-', 'Sylhet', 'Sample Address 85', '19-06-2026', 24.882592, 91.847829),
  ('Verified Donor 86', 'Test Father 86', 'Test Mother 86', '07-01-1990', '01700000086', 'Male', 'donor86@example.com', 'O-', 'Rajshahi', 'Sample Address 86', '18-05-2026', 24.354534, 88.586978),
  ('Verified Donor 87', 'Test Father 87', 'Test Mother 87', '08-02-1991', '01700000087', 'Female', 'donor87@example.com', 'AB+', 'Khulna', 'Sample Address 87', '17-04-2026', 22.850249, 89.530224),
  ('Verified Donor 88', 'Test Father 88', 'Test Mother 88', '09-03-1992', '01700000088', 'Male', 'donor88@example.com', 'AB-', 'Dhaka', 'Sample Address 88', '16-03-2026', 23.835204, 90.419782),
  ('Verified Donor 89', 'Test Father 89', 'Test Mother 89', '10-04-1993', '01700000089', 'Female', 'donor89@example.com', 'A+', 'Chittagong', 'Sample Address 89', '15-02-2026', 22.353195, 91.783977),
  ('Verified Donor 90', 'Test Father 90', 'Test Mother 90', '11-05-1994', '01700000090', 'Male', 'donor90@example.com', 'B+', 'Barisal', 'Sample Address 90', '14-01-2026', 22.725072, 90.365474),
  ('Verified Donor 91', 'Test Father 91', 'Test Mother 91', '12-06-1995', '01700000091', 'Female', 'donor91@example.com', 'O+', 'Rangpur', 'Sample Address 91', '21-07-2026', 25.719030, 89.281743),
  ('Verified Donor 92', 'Test Father 92', 'Test Mother 92', '13-07-1996', '01700000092', 'Male', 'donor92@example.com', 'A-', 'Gazipur', 'Sample Address 92', '20-06-2026', 24.014820, 90.401624),
  ('Verified Donor 93', 'Test Father 93', 'Test Mother 93', '14-08-1997', '01700000093', 'Female', 'donor93@example.com', 'B-', 'Comilla', 'Sample Address 93', '19-05-2026', 23.463678, 91.174336),
  ('Verified Donor 94', 'Test Father 94', 'Test Mother 94', '15-09-1998', '01700000094', 'Male', 'donor94@example.com', 'O-', 'Dhaka', 'Sample Address 94', '18-04-2026', 23.822980, 90.400788),
  ('Verified Donor 95', 'Test Father 95', 'Test Mother 95', '16-10-1999', '01700000095', 'Female', 'donor95@example.com', 'AB+', 'Sylhet', 'Sample Address 95', '17-03-2026', 24.880693, 91.889890),
  ('Verified Donor 96', 'Test Father 96', 'Test Mother 96', '17-11-1988', '01700000096', 'Male', 'donor96@example.com', 'AB-', 'Rajshahi', 'Sample Address 96', '16-02-2026', 24.395133, 88.615006),
  ('Verified Donor 97', 'Test Father 97', 'Test Mother 97', '18-12-1989', '01700000097', 'Female', 'donor97@example.com', 'A+', 'Khulna', 'Sample Address 97', '15-01-2026', 22.848605, 89.556386),
  ('Verified Donor 98', 'Test Father 98', 'Test Mother 98', '19-01-1990', '01700000098', 'Male', 'donor98@example.com', 'B+', 'Dhaka', 'Sample Address 98', '22-07-2026', 23.828360, 90.398868),
  ('Verified Donor 99', 'Test Father 99', 'Test Mother 99', '20-02-1991', '01700000099', 'Female', 'donor99@example.com', 'O+', 'Chittagong', 'Sample Address 99', '21-06-2026', 22.379669, 91.790568),
  ('Verified Donor 100', 'Test Father 100', 'Test Mother 100', '21-03-1992', '01700000100', 'Male', 'donor100@example.com', 'A-', 'Dhaka', 'Sample Address 100', '20-05-2026', 23.820300, 90.422500);

-- ======================================================
-- SEED DATA (TRANSACTIONS)
-- ======================================================
INSERT INTO transactions (id, "patientName", "hospitalName", "bloodGroup", units, date, status) VALUES
  (101, 'Alice Smith', 'Square Hospital, Dhaka', 'O+', 2, '15-07-2026', 'DELIVERED'),
  (102, 'Bob Vance', 'Labaid Hospital, Dhaka', 'B+', 1, '20-07-2026', 'APPROVED'),
  (103, 'Catherine Zeta', 'Apollo Hospital, Dhaka', 'A+', 2, '18-07-2026', 'DELIVERED'),
  (104, 'David Miller', 'Chittagong Medical College', 'O-', 3, '12-07-2026', 'APPROVED'),
  (105, 'Eva Green', 'Sylhet MAG Osmani Medical', 'AB+', 1, '10-07-2026', 'DELIVERED'),
  (106, 'Fahim Shah', 'Rajshahi Medical College', 'B-', 2, '05-07-2026', 'DELIVERED'),
  (107, 'Gulshan Ara', 'Khulna City Hospital', 'A-', 1, '01-07-2026', 'APPROVED'),
  (108, 'Hasan Mahmud', 'Gazipur Sadar Hospital', 'O+', 4, '21-07-2026', 'APPROVED'),
  (109, 'Ibrahim Khalil', 'Barisal Sher-e-Bangla Medical', 'B+', 2, '19-07-2026', 'DELIVERED'),
  (110, 'Jasmine Chowdhury', 'Comilla Medical College', 'AB-', 1, '14-07-2026', 'APPROVED')
ON CONFLICT (id) DO NOTHING;
