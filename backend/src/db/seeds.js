import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

// Ensure db directory exists
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

console.log('🌱 Initializing Jan Suvidha AI Database Schema & Seed Data...');

db.serialize(() => {
  // Drop old tables if exist to apply schema updates
  db.run(`DROP TABLE IF EXISTS required_documents`);
  db.run(`DROP TABLE IF EXISTS eligibility_rules`);
  db.run(`DROP TABLE IF EXISTS schemes`);
  db.run(`DROP TABLE IF EXISTS verification_codes`);
  db.run(`DROP TABLE IF EXISTS profiles`);
  db.run(`DROP TABLE IF EXISTS users`);

  // 1. Schemes table
  db.run(`
    CREATE TABLE schemes (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_ta TEXT NOT NULL,
      department_en TEXT NOT NULL,
      department_ta TEXT NOT NULL,
      official_portal TEXT NOT NULL,
      benefit_en TEXT NOT NULL,
      benefit_ta TEXT NOT NULL,
      monthly_benefit_amount REAL DEFAULT 0,
      annual_benefit_amount REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      policy_notes_2026_en TEXT,
      policy_notes_2026_ta TEXT
    )
  `);

  // 2. Eligibility Rules
  db.run(`
    CREATE TABLE eligibility_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scheme_id TEXT NOT NULL,
      field_name TEXT NOT NULL,
      operator TEXT NOT NULL,
      field_value TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_ta TEXT NOT NULL,
      is_mandatory INTEGER DEFAULT 1,
      FOREIGN KEY (scheme_id) REFERENCES schemes(id)
    )
  `);

  // 3. Required Documents
  db.run(`
    CREATE TABLE required_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scheme_id TEXT NOT NULL,
      doc_key TEXT NOT NULL,
      doc_name_en TEXT NOT NULL,
      doc_name_ta TEXT NOT NULL,
      description_en TEXT,
      description_ta TEXT,
      is_mandatory INTEGER DEFAULT 1,
      FOREIGN KEY (scheme_id) REFERENCES schemes(id)
    )
  `);

  // 4. Users Table (Real Authentication + Profile Completed Flag)
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      hashed_password TEXT NOT NULL,
      district TEXT DEFAULT 'Chennai',
      annual_income REAL DEFAULT 120000,
      is_verified INTEGER DEFAULT 0,
      profile_completed INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Verification Codes Table
  db.run(`
    CREATE TABLE verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 6. Profiles Table (Stored Citizen Profiles)
  db.run(`
    CREATE TABLE profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      mobile_number TEXT,
      district TEXT NOT NULL,
      education_level TEXT NOT NULL,
      school_type_6_to_12 TEXT NOT NULL,
      education_course_type TEXT DEFAULT 'regular_higher_education',
      last_exam_marks_pct REAL DEFAULT 60,
      annual_family_income REAL NOT NULL,
      ration_card_head INTEGER DEFAULT 0,
      ration_card_holder INTEGER DEFAULT 1,
      category TEXT DEFAULT 'General',
      disability_status INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 1. KMUT (Kalaignar Magalir Urimai Thogai Thittam)
  const kmut = {
    id: 'kmut',
    name_en: 'Kalaignar Magalir Urimai Thogai Thittam (KMUT)',
    name_ta: 'கலைஞர் மகளிர் உரிமைத் தொகை திட்டம் (KMUT)',
    department_en: 'Social Welfare & Women Empowerment',
    department_ta: 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
    official_portal: 'https://kmut.tn.gov.in',
    benefit_en: '₹1,000/month (₹12,000/year) via Direct Benefit Transfer (DBT) to bank account, credited on the 15th.',
    benefit_ta: 'மாதம்தோறும் ₹1,000 (ஆண்டுக்கு ₹12,000) நேரடியாக வங்கி கணக்கில் செலுத்துதல்.',
    monthly_benefit_amount: 1000,
    annual_benefit_amount: 12000,
    policy_notes_2026_en: 'Confirmed seed benefit: ₹1,000/mo. Mid-2026 proposed hikes to ₹2,500-₹3,000/mo are currently under review/unconfirmed.',
    policy_notes_2026_ta: 'உறுதிசெய்யப்பட்ட தொகை: ₹1,000/மாதம். ₹2,500-₹3,000 உயர்வு பற்றிய முன்மொழிவு பரிசீலனையில் உள்ளது.'
  };

  db.run(
    `INSERT INTO schemes (id, name_en, name_ta, department_en, department_ta, official_portal, benefit_en, benefit_ta, monthly_benefit_amount, annual_benefit_amount, policy_notes_2026_en, policy_notes_2026_ta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kmut.id, kmut.name_en, kmut.name_ta, kmut.department_en, kmut.department_ta, kmut.official_portal, kmut.benefit_en, kmut.benefit_ta, kmut.monthly_benefit_amount, kmut.annual_benefit_amount, kmut.policy_notes_2026_en, kmut.policy_notes_2026_ta]
  );

  const kmutRules = [
    { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Applicant must be a woman', ta: 'விண்ணப்பதாரர் பெண்ணாக இருக்க வேண்டும்' },
    { field_name: 'age', operator: 'GTE', field_value: '21', en: 'Must be aged 21 years or older (born before 15 Sep 2002)', ta: 'வயது 21 அல்லது அதற்கு மேல் இருக்க வேண்டும் (15 செப்டம்பர் 2002க்கு முன் பிறந்தவர்)' },
    { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Must be a permanent resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் நிரந்தர வசிப்பிடமாக இருக்க வேண்டும்' },
    { field_name: 'ration_card_head', operator: 'EQUALS', field_value: 'true', en: 'Must be named as head of family (or wife of male head) on Ration Card', ta: 'குடும்ப அட்டையில் குடும்பத் தலைவியாக (அல்லது மனைவியாக) இருக்க வேண்டும்' },
    { field_name: 'annual_family_income', operator: 'LTE', field_value: '250000', en: 'Family annual income must be below ₹2,50,000 (₹2.5 Lakh)', ta: 'குடும்பத்தின் ஆண்டு வருமானம் ₹2,50,000க்கு மிகாமல் இருக்க வேண்டும்' },
    { field_name: 'owns_four_wheeler', operator: 'EQUALS', field_value: 'false', en: 'Family must not own a four-wheeler car/SUV', ta: 'குடும்பத்தில் நான்கு சக்கர வாகனம் இருக்கக்கூடாது' },
    { field_name: 'land_ownership_wet_acres', operator: 'LTE', field_value: '5', en: 'Must not own more than 5 acres of wetland', ta: '5 ஏக்கருக்கு மேல் நஞ்சை நிலம் இருக்கக்கூடாது' },
    { field_name: 'land_ownership_dry_acres', operator: 'LTE', field_value: '10', en: 'Must not own more than 10 acres of dryland', ta: '10 ஏக்கருக்கு மேல் புஞ்சை நிலம் இருக்கக்கூடாது' },
    { field_name: 'is_govt_employee_or_pensioner', operator: 'EQUALS', field_value: 'false', en: 'Applicant/spouse must not be a Govt employee, pensioner or income taxpayer', ta: 'அரசு ஊழியர், ஓய்வூதியதாரர் அல்லது வருமான வரி செலுத்துபவராக இருக்கக்கூடாது' }
  ];

  kmutRules.forEach(rule => {
    db.run(
      `INSERT INTO eligibility_rules (scheme_id, field_name, operator, field_value, description_en, description_ta) VALUES (?, ?, ?, ?, ?, ?)`,
      [kmut.id, rule.field_name, rule.operator, rule.field_value, rule.en, rule.ta]
    );
  });

  const kmutDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Card (Bank Linked)', ta: 'ஆதார் கார்டு (வங்கி கணக்குடன் இணைக்கப்பட்டது)' },
    { key: 'ration_card', en: 'Smart Family Ration Card', ta: 'ஸ்மார்ட் குடும்ப அட்டை' },
    { key: 'bank_passbook', en: 'Bank Account Passbook / Statement', ta: 'வங்கி கணக்கு புத்தகத்தின் முன் பக்கம்' }
  ];

  kmutDocs.forEach(doc => {
    db.run(
      `INSERT INTO required_documents (scheme_id, doc_key, doc_name_en, doc_name_ta) VALUES (?, ?, ?, ?)`,
      [kmut.id, doc.key, doc.en, doc.ta]
    );
  });

  // 2. Pudhumai Penn Thittam
  const pudhumai = {
    id: 'pudhumai_penn',
    name_en: 'Pudhumai Penn Thittam (Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme)',
    name_ta: 'புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார் உயர்கல்வி உறுதித் திட்டம்)',
    department_en: 'Social Welfare & Women Empowerment',
    department_ta: 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
    official_portal: 'https://tnsocialwelfare.tn.gov.in',
    benefit_en: '₹1,000/month (₹12,000/year) financial assistance until completion of first UG degree / diploma / ITI course.',
    benefit_ta: 'பட்டப்படிப்பு / டிப்ளமோ / ITI முடியும் வரை மாதந்தோறும் ₹1,000 நிதி உதவி.',
    monthly_benefit_amount: 1000,
    annual_benefit_amount: 12000,
    policy_notes_2026_en: 'Eligibility expanded from July 15, 2024 to include female students from Govt-Aided schools (Classes 6-12 in Tamil medium).',
    policy_notes_2026_ta: '15 ஜூலை 2024 முதல் அரசு உதவி பெறும் பள்ளிகளிலும் படித்த மாணவிகளுக்கு விரிவாக்கப்பட்டுள்ளது.'
  };

  db.run(
    `INSERT INTO schemes (id, name_en, name_ta, department_en, department_ta, official_portal, benefit_en, benefit_ta, monthly_benefit_amount, annual_benefit_amount, policy_notes_2026_en, policy_notes_2026_ta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [pudhumai.id, pudhumai.name_en, pudhumai.name_ta, pudhumai.department_en, pudhumai.department_ta, pudhumai.official_portal, pudhumai.benefit_en, pudhumai.benefit_ta, pudhumai.monthly_benefit_amount, pudhumai.annual_benefit_amount, pudhumai.policy_notes_2026_en, pudhumai.policy_notes_2026_ta]
  );

  const pudhumaiRules = [
    { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Applicant must be a female student', ta: 'விண்ணப்பதாரர் மாணவியாக இருக்க வேண்டும்' },
    { field_name: 'school_type_6_to_12', operator: 'IN', field_value: 'tn_govt_school,tn_govt_aided_school', en: 'Studied classes 6th to 12th in Tamil Nadu Govt School or Govt-Aided School', ta: '6 ஆம் வகுப்பு முதல் 12 ஆம் வகுப்பு வரை தமிழக அரசு பள்ளி/அரசு உதவி பெறும் பள்ளியில் படித்திருக்க வேண்டும்' },
    { field_name: 'education_course_type', operator: 'EQUALS', field_value: 'regular_higher_education', en: 'Currently enrolled in regular UG Degree, Diploma, or ITI course in Tamil Nadu', ta: 'தமிழகத்தில் வழக்கமான உயர்கல்வி பட்டப்படிப்பு/டிப்ளமோ/ITI படிப்பில் பயில வேண்டும்' },
    { field_name: 'previous_exam_marks_pct', operator: 'GTE', field_value: '33', en: 'Minimum 33% marks achieved in the previous qualifying examination', ta: 'முந்தைய தேர்வில் குறைந்தபட்சம் 33% மதிப்பெண்கள் பெற்றிருக்க வேண்டும்' }
  ];

  pudhumaiRules.forEach(rule => {
    db.run(
      `INSERT INTO eligibility_rules (scheme_id, field_name, operator, field_value, description_en, description_ta) VALUES (?, ?, ?, ?, ?, ?)`,
      [pudhumai.id, rule.field_name, rule.operator, rule.field_value, rule.en, rule.ta]
    );
  });

  const pudhumaiDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
    { key: 'mark_sheet_10_12', en: '10th / 12th Marksheet', ta: '10 / 12 ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்' },
    { key: 'bonafide_certificate', en: 'Current College Bonafide / Admission Certificate', ta: 'கல்லூரி சேர்க்கை / போனஃபைட் சான்றிதழ்' },
    { key: 'bank_passbook', en: 'Bank Account Passbook Details', ta: 'வங்கி கணக்கு புத்தக நகல்' }
  ];

  pudhumaiDocs.forEach(doc => {
    db.run(
      `INSERT INTO required_documents (scheme_id, doc_key, doc_name_en, doc_name_ta) VALUES (?, ?, ?, ?)`,
      [pudhumai.id, doc.key, doc.en, doc.ta]
    );
  });

  // 3. Free Bus Travel Scheme for Women (Magalir Payanam)
  const busScheme = {
    id: 'magalir_payanam',
    name_en: 'Free Bus Travel Scheme for Women (Magalir Payanam)',
    name_ta: 'மகளிர் இலவச பேருந்து பயணத் திட்டம் (மகளிர் பயணம்)',
    department_en: 'Transport Department, Govt. of Tamil Nadu',
    department_ta: 'போக்குவரத்துத் துறை, தமிழ்நாடு அரசு',
    official_portal: 'https://tnstc.in',
    benefit_en: 'Free zero-ticket bus travel for women and transgender persons in ordinary town buses across Tamil Nadu (TNSTC, MTC).',
    benefit_ta: 'தமிழ்நாடு முழுவதும் சாதாரண நகரப் பேருந்துகளில் பெண்கள் மற்றும் திருநங்கைகளுக்கு கட்டணமில்லாப் பயணம்.',
    monthly_benefit_amount: 1200,
    annual_benefit_amount: 14400,
    policy_notes_2026_en: 'Renamed to "Magalir Payanam" in July 2026. "Vetrip Payanam" expansion announced for Oct 2, 2026 to cover Express/LSS/Deluxe buses.',
    policy_notes_2026_ta: 'ஜூலை 2026இல் "மகளிர் பயணம்" என பெயர் மாற்றம் செய்யப்பட்டது. அக்டோபர் 2, 2026 முதல் எக்ஸ்பிரஸ் பேருந்துகளுக்கும் விரிவாக்கம் திட்டமிடப்பட்டுள்ளது.'
  };

  db.run(
    `INSERT INTO schemes (id, name_en, name_ta, department_en, department_ta, official_portal, benefit_en, benefit_ta, monthly_benefit_amount, annual_benefit_amount, policy_notes_2026_en, policy_notes_2026_ta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [busScheme.id, busScheme.name_en, busScheme.name_ta, busScheme.department_en, busScheme.department_ta, busScheme.official_portal, busScheme.benefit_en, busScheme.benefit_ta, busScheme.monthly_benefit_amount, busScheme.annual_benefit_amount, busScheme.policy_notes_2026_en, busScheme.policy_notes_2026_ta]
  );

  const busRules = [
    { field_name: 'gender', operator: 'IN', field_value: 'female,transgender', en: 'Must be a woman or transgender person', ta: 'பெண் அல்லது திருநங்கையாக இருக்க வேண்டும்' },
    { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Must be a resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்' }
  ];

  busRules.forEach(rule => {
    db.run(
      `INSERT INTO eligibility_rules (scheme_id, field_name, operator, field_value, description_en, description_ta) VALUES (?, ?, ?, ?, ?, ?)`,
      [busScheme.id, rule.field_name, rule.operator, rule.field_value, rule.en, rule.ta]
    );
  });

  const busDocs = [
    { key: 'residence_proof', en: 'No formal application required. Carry Aadhaar/ID as residence proof.', ta: 'முறையான விண்ணப்பம் தேவையில்லை. ஆதார்/அடையாள அட்டை வைத்திருக்கவும்.' }
  ];

  busDocs.forEach(doc => {
    db.run(
      `INSERT INTO required_documents (scheme_id, doc_key, doc_name_en, doc_name_ta) VALUES (?, ?, ?, ?)`,
      [busScheme.id, doc.key, doc.en, doc.ta]
    );
  });

  // 4. CMCHIS (Chief Minister's Comprehensive Health Insurance Scheme)
  const cmchis = {
    id: 'cmchis',
    name_en: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
    name_ta: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)',
    department_en: 'Health & Family Welfare Department',
    department_ta: 'மக்கள் நல்வாழ்வு மற்றும் குடும்ப நலத்துறை',
    official_portal: 'https://cmchistn.com',
    benefit_en: 'Cashless hospital treatment up to ₹5,000,000/family/year across 1,090+ empanelled government and private hospitals.',
    benefit_ta: 'ஆண்டுக்கு குடும்பத்திற்கு ₹5 லட்சம் வரை 1090+ அரசு மற்றும் தனியார் மருத்துவமனைகளில் ரொக்கமில்லா சிகிச்சை.',
    monthly_benefit_amount: 0,
    annual_benefit_amount: 500000,
    policy_notes_2026_en: 'Seed figure: ₹5 Lakh coverage. On Aug 19, 2026 CM announced proposal to increase coverage limit to ₹25 Lakh/family/year (pending notification).',
    policy_notes_2026_ta: 'தற்போது ₹5 லட்சம் காப்பீடு. ஆகஸ்ட் 19, 2026 அன்று காப்பீட்டுத் தொகையை ₹25 லட்சமாக உயர்த்த அரசு அறிவித்துள்ளது.'
  };

  db.run(
    `INSERT INTO schemes (id, name_en, name_ta, department_en, department_ta, official_portal, benefit_en, benefit_ta, monthly_benefit_amount, annual_benefit_amount, policy_notes_2026_en, policy_notes_2026_ta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [cmchis.id, cmchis.name_en, cmchis.name_ta, cmchis.department_en, cmchis.department_ta, cmchis.official_portal, cmchis.benefit_en, cmchis.benefit_ta, cmchis.monthly_benefit_amount, cmchis.annual_benefit_amount, cmchis.policy_notes_2026_en, cmchis.policy_notes_2026_ta]
  );

  const cmchisRules = [
    { field_name: 'ration_card_holder', operator: 'EQUALS', field_value: 'true', en: 'Family listed on a valid Tamil Nadu Smart Family Ration Card', ta: 'தமிழ்நாடு ஸ்மார்ட் குடும்ப அட்டையில் குடும்ப உறுப்பினராக இருக்க வேண்டும்' },
    { field_name: 'annual_family_income', operator: 'LTE', field_value: '120000', en: 'Annual family income must be below ₹1,20,000 (₹1.2 Lakh)', ta: 'குடும்பத்தின் ஆண்டு வருமானம் ₹1,20,000க்கு மிகாமல் இருக்க வேண்டும்' },
    { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Permanent resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் நிரந்தர வசிப்பிடமாக இருக்க வேண்டும்' }
  ];

  cmchisRules.forEach(rule => {
    db.run(
      `INSERT INTO eligibility_rules (scheme_id, field_name, operator, field_value, description_en, description_ta) VALUES (?, ?, ?, ?, ?, ?)`,
      [cmchis.id, rule.field_name, rule.operator, rule.field_value, rule.en, rule.ta]
    );
  });

  const cmchisDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Card of Head of Family & Members', ta: 'குடும்பத் தலைவர் மற்றும் உறுப்பினர்களின் ஆதார் அட்டை' },
    { key: 'ration_card', en: 'Smart Family Ration Card', ta: 'ஸ்மார்ட் குடும்ப அட்டை' },
    { key: 'income_certificate', en: 'Income Certificate issued by Revenue Department (VAO/Tahsildar)', ta: 'வருவாய்த் துறை வழங்கிய வருமானச் சான்றிதழ்' }
  ];

  cmchisDocs.forEach(doc => {
    db.run(
      `INSERT INTO required_documents (scheme_id, doc_key, doc_name_en, doc_name_ta) VALUES (?, ?, ?, ?)`,
      [cmchis.id, doc.key, doc.en, doc.ta]
    );
  });

  // 5. Thalikku Thangam Thittam
  const thalikkuThangam = {
    id: 'thalikku_thangam',
    name_en: 'Thalikku Thangam Thittam (Marriage Assistance Scheme)',
    name_ta: 'தாலிக்கு தங்கம் திட்டம் (திருமண உதவித் திட்டம்)',
    department_en: 'Social Welfare & Women Empowerment',
    department_ta: 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
    official_portal: 'https://tnsocialwelfare.tn.gov.in',
    benefit_en: 'Financial assistance cheque (Tier I: ₹25,000 for 10th standard pass; Tier II: ₹50,000 for degree/diploma pass) + 8g (22-carat) Gold Coin for marriage.',
    benefit_ta: 'திருமண உதவி: ₹25,000 / ₹50,000 ரொக்கம் + 8 கிராம் (22 கேரட்) தங்க நாணயம் வழங்கப்படுகிறது.',
    monthly_benefit_amount: 0,
    annual_benefit_amount: 50000,
    policy_notes_2026_en: 'Re-verified marriage assistance benefit scheme. Tier I: 10th pass (5th pass for ST), Tier II: Degree/Diploma graduates.',
    policy_notes_2026_ta: 'மறுஉறுதிப்படுத்தப்பட்ட திட்டம். நிலை 1: 10வது தேர்ச்சி, நிலை 2: பட்டப்படிப்பு/டிப்ளமோ தேர்ச்சி.'
  };

  db.run(
    `INSERT INTO schemes (id, name_en, name_ta, department_en, department_ta, official_portal, benefit_en, benefit_ta, monthly_benefit_amount, annual_benefit_amount, policy_notes_2026_en, policy_notes_2026_ta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [thalikkuThangam.id, thalikkuThangam.name_en, thalikkuThangam.name_ta, thalikkuThangam.department_en, thalikkuThangam.department_ta, thalikkuThangam.official_portal, thalikkuThangam.benefit_en, thalikkuThangam.benefit_ta, thalikkuThangam.monthly_benefit_amount, thalikkuThangam.annual_benefit_amount, thalikkuThangam.policy_notes_2026_en, thalikkuThangam.policy_notes_2026_ta]
  );

  const thalikkuRules = [
    { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Applicant must be the bride', ta: 'விண்ணப்பதாரர் மணப்பெண்ணாக இருக்க வேண்டும்' },
    { field_name: 'age', operator: 'GTE', field_value: '18', en: 'Bride must be aged 18 years or older at marriage', ta: 'மணப்பெண்ணுக்கு குறைந்தபட்சம் 18 வயது முடிந்திருக்க வேண்டும்' },
    { field_name: 'groom_age', operator: 'GTE', field_value: '21', en: 'Groom must be aged 21 years or older', ta: 'மணமகனுக்கு குறைந்தபட்சம் 21 வயது முடிந்திருக்க வேண்டும்' },
    { field_name: 'education_level', operator: 'IN', field_value: '10th_pass,12th_pass,diploma,degree,st_5th_pass', en: 'Bride must have passed at least 10th Std (5th Std for ST) or Degree/Diploma', ta: 'மணப்பெண் குறைந்தபட்சம் 10 ஆம் வகுப்பு (ST சமூகத்திற்கு 5 ஆம் வகுப்பு) அல்லது பட்டப்படிப்பு முடித்திருக்க வேண்டும்' },
    { field_name: 'bpl_or_low_income', operator: 'EQUALS', field_value: 'true', en: 'Family annual income must be under BPL limit (under ₹72,000)', ta: 'குடும்ப வருமானம் வறுமைக் கோட்டிற்கு கீழ் (₹72,000க்குள்) இருக்க வேண்டும்' },
    { field_name: 'eligible_daughters_count', operator: 'LTE', field_value: '1', en: 'Benefit limited to one daughter per family', ta: 'ஒரு குடும்பத்தில் ஒரு மகளுக்கு மட்டுமே இந்த உதவித்தொகை வழங்கப்படும்' }
  ];

  thalikkuRules.forEach(rule => {
    db.run(
      `INSERT INTO eligibility_rules (scheme_id, field_name, operator, field_value, description_en, description_ta) VALUES (?, ?, ?, ?, ?, ?)`,
      [thalikkuThangam.id, rule.field_name, rule.operator, rule.field_value, rule.en, rule.ta]
    );
  });

  const thalikkuDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Card of Bride & Groom', ta: 'மணப்பெண் மற்றும் மணமகனின் ஆதார் அட்டை' },
    { key: 'age_proof', en: 'Birth Certificate / School Transfer Certificate', ta: 'பிறப்புச் சான்றிதழ் / பள்ளி மாற்றுச் சான்றிதழ்' },
    { key: 'academic_certificate', en: '10th / Degree / Diploma Educational Certificate', ta: '10 ஆம் வகுப்பு / பட்டப்படிப்பு சான்றிதழ்' },
    { key: 'income_certificate', en: 'BPL / Income Certificate', ta: 'வருமானச் சான்றிதழ் / வறுமைக் கோட்டிற்குட்பட்ட சான்று' },
    { key: 'marriage_invitation', en: 'Marriage Invitation Card / Registration Certificate', ta: 'திருமணப் பத்திரிகை / பதிவுச் சான்றிதழ்' }
  ];

  thalikkuDocs.forEach(doc => {
    db.run(
      `INSERT INTO required_documents (scheme_id, doc_key, doc_name_en, doc_name_ta) VALUES (?, ?, ?, ?)`,
      [thalikkuThangam.id, doc.key, doc.en, doc.ta]
    );
  });

  console.log('✅ SQLite Database successfully re-created with clean schema (users, profiles, schemes)!');
});

db.close();
