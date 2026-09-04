import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

console.log('🌱 Seeding Jan Suvidha AI Database with 19 Real TN & Central Government Schemes...');

db.serialize(() => {
  // Drop & Recreate tables
  db.run(`DROP TABLE IF EXISTS required_documents`);
  db.run(`DROP TABLE IF EXISTS eligibility_rules`);
  db.run(`DROP TABLE IF EXISTS schemes`);
  db.run(`DROP TABLE IF EXISTS verification_codes`);
  db.run(`DROP TABLE IF EXISTS profiles`);
  db.run(`DROP TABLE IF EXISTS users`);

  db.run(`
    CREATE TABLE schemes (
      government TEXT DEFAULT 'Government of Tamil Nadu',
      description_en TEXT DEFAULT '',
      description_ta TEXT DEFAULT '',
      official_source TEXT DEFAULT 'Official Government Portal',
      official_url TEXT DEFAULT '',
      status TEXT DEFAULT 'ACTIVE',
      last_verified TEXT DEFAULT 'August 2026',
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
      category TEXT DEFAULT 'general',
      policy_notes_2026_en TEXT,
      policy_notes_2026_ta TEXT
    )
  `);

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
      is_first_graduate INTEGER DEFAULT 0,
      ex_serviceman_child INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Helper insertion function
  const insertScheme = (s, rules, docs) => {
    db.run(
      `INSERT INTO schemes (id, name_en, name_ta, department_en, department_ta, official_portal, official_url, official_source, government, description_en, description_ta, benefit_en, benefit_ta, monthly_benefit_amount, annual_benefit_amount, is_active, category, policy_notes_2026_en, policy_notes_2026_ta, status, last_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.name_en, s.name_ta, s.department_en, s.department_ta, s.official_portal, s.official_portal, 'Government of Tamil Nadu', 'Government of Tamil Nadu', s.benefit_en, s.benefit_ta, s.benefit_en, s.benefit_ta, s.monthly_benefit_amount || 0, s.annual_benefit_amount || 0, s.is_active !== undefined ? s.is_active : 1, s.category || 'general', s.policy_notes_2026_en || '', s.policy_notes_2026_ta || '', 'ACTIVE', 'August 2026']
    );

    rules.forEach(r => {
      db.run(
        `INSERT INTO eligibility_rules (scheme_id, field_name, operator, field_value, description_en, description_ta) VALUES (?, ?, ?, ?, ?, ?)`,
        [s.id, r.field_name, r.operator, r.field_value, r.en, r.ta]
      );
    });

    docs.forEach(d => {
      db.run(
        `INSERT INTO required_documents (scheme_id, doc_key, doc_name_en, doc_name_ta) VALUES (?, ?, ?, ?)`,
        [s.id, d.key, d.en, d.ta]
      );
    });
  };

  // 1. KMUT
  insertScheme(
    {
      id: 'kmut',
      name_en: 'Kalaignar Magalir Urimai Thogai Thittam (KMUT)',
      name_ta: 'கலைஞர் மகளிர் உரிமைத் தொகை திட்டம் (KMUT)',
      department_en: 'Social Welfare & Women Empowerment',
      department_ta: 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
      official_portal: 'https://kmut.tn.gov.in',
      benefit_en: '₹1,000/month (₹12,000/year) via DBT credited on 15th of every month.',
      benefit_ta: 'மாதம்தோறும் ₹1,000 (ஆண்டுக்கு ₹12,000) நேரடியாக வங்கி கணக்கில் செலுத்துதல்.',
      monthly_benefit_amount: 1000,
      annual_benefit_amount: 12000,
      category: 'general',
      policy_notes_2026_en: 'Confirmed seed benefit: ₹1,000/mo. Mid-2026 proposed hikes to ₹2,500-₹3,000/mo are under review.'
    },
    [
      { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Applicant must be a woman', ta: 'விண்ணப்பதாரர் பெண்ணாக இருக்க வேண்டும்' },
      { field_name: 'age', operator: 'GTE', field_value: '21', en: 'Must be aged 21 years or older', ta: 'வயது 21 அல்லது அதற்கு மேல் இருக்க வேண்டும்' },
      { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Permanent resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் நிரந்தர வசிப்பிடமாக இருக்க வேண்டும்' },
      { field_name: 'ration_card_head', operator: 'EQUALS', field_value: 'true', en: 'Head of family on Smart Ration Card', ta: 'குடும்ப அட்டையில் குடும்பத் தலைவியாக இருக்க வேண்டும்' },
      { field_name: 'annual_family_income', operator: 'LTE', field_value: '250000', en: 'Family annual income below ₹2,50,000', ta: 'குடும்பத்தின் ஆண்டு வருமானம் ₹2,50,000க்கு மிகாமல் இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card (Bank Linked)', ta: 'ஆதார் கார்டு' },
      { key: 'ration_card', en: 'Smart Family Ration Card', ta: 'ஸ்மார்ட் குடும்ப அட்டை' },
      { key: 'bank_passbook', en: 'Bank Passbook Details', ta: 'வங்கி கணக்கு புத்தக நகல்' }
    ]
  );

  // 2. Pudhumai Penn
  insertScheme(
    {
      id: 'pudhumai_penn',
      name_en: 'Pudhumai Penn Thittam',
      name_ta: 'புதுமைப் பெண் திட்டம்',
      department_en: 'Social Welfare & Women Empowerment',
      department_ta: 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
      official_portal: 'https://tnsocialwelfare.tn.gov.in',
      benefit_en: '₹1,000/month financial assistance for female higher education students.',
      benefit_ta: 'பட்டப்படிப்பு / டிப்ளமோ / ITI முடியும் வரை மாதந்தோறும் ₹1,000 நிதி உதவி.',
      monthly_benefit_amount: 1000,
      annual_benefit_amount: 12000,
      category: 'student',
      policy_notes_2026_en: 'Eligibility expanded to female students from Govt-Aided schools (Classes 6-12).'
    },
    [
      { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Applicant must be a female student', ta: 'விண்ணப்பதாரர் மாணவியாக இருக்க வேண்டும்' },
      { field_name: 'school_type_6_to_12', operator: 'IN', field_value: 'tn_govt_school,tn_govt_aided_school', en: 'Studied 6th to 12th in TN Govt or Govt-Aided School', ta: '6 முதல் 12 ஆம் வகுப்பு வரை தமிழக அரசு/அரசு உதவிபெறும் பள்ளியில் படித்திருக்க வேண்டும்' },
      { field_name: 'education_course_type', operator: 'EQUALS', field_value: 'regular_higher_education', en: 'Enrolled in regular UG Degree, Diploma, or ITI course', ta: 'வழக்கமான உயர்கல்வி பட்டப்படிப்பு/டிப்ளமோ/ITI படிப்பில் பயில வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'mark_sheet_10_12', en: '10th / 12th Marksheet', ta: '10 / 12 ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்' },
      { key: 'bonafide_certificate', en: 'College Bonafide Certificate', ta: 'கல்லூரி சேர்க்கை / போனஃபைட் சான்றிதழ்' }
    ]
  );

  // 3. Tamil Pudhalvan (NEW #1)
  insertScheme(
    {
      id: 'tamil_pudhalvan',
      name_en: 'Tamil Pudhalvan Scheme',
      name_ta: 'தமிழ்ப் புதல்வன் திட்டம்',
      department_en: 'School Education Department, Govt. of Tamil Nadu (G.O. Ms No. 109)',
      department_ta: 'பள்ளித் கல்வித் துறை, தமிழ்நாடு அரசு',
      official_portal: 'https://tnschools.gov.in',
      benefit_en: '₹1,000/month via DBT until completion of first UG degree / diploma / ITI course.',
      benefit_ta: 'முதல் பட்டப்படிப்பு / டிப்ளமோ / ITI முடியும் வரை மாதந்தோறும் ₹1,000 நிதி உதவி.',
      monthly_benefit_amount: 1000,
      annual_benefit_amount: 12000,
      category: 'student',
      policy_notes_2026_en: 'Launched for male students who studied 6th-12th in TN Govt / Govt-Aided schools.'
    },
    [
      { field_name: 'gender', operator: 'EQUALS', field_value: 'male', en: 'Applicant must be a male student', ta: 'விண்ணப்பதாரர் மாணவராக இருக்க வேண்டும்' },
      { field_name: 'school_type_6_to_12', operator: 'IN', field_value: 'tn_govt_school,tn_govt_aided_school', en: 'Studied classes 6th to 12th in TN Govt or Govt-Aided School', ta: '6 முதல் 12 ஆம் வகுப்பு வரை தமிழக அரசு/அரசு உதவிபெறும் பள்ளியில் படித்திருக்க வேண்டும்' },
      { field_name: 'education_course_type', operator: 'EQUALS', field_value: 'regular_higher_education', en: 'Enrolled in regular UG Degree, Diploma, or ITI course in Tamil Nadu', ta: 'தமிழகத்தில் வழக்கமான உயர்கல்வி படிப்பில் பயில வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'mark_sheet_10_12', en: '10th / 12th Marksheet', ta: '10 / 12 ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்' },
      { key: 'bonafide_certificate', en: 'Current College Bonafide / Admission Certificate', ta: 'கல்லூரி சேர்க்கை சான்றிதழ்' }
    ]
  );

  // 4. BC/MBC/DNC Post-Matric Scholarship (NEW #2)
  insertScheme(
    {
      id: 'post_matric_bc_mbc',
      name_en: 'BC/MBC/DNC Post-Matric Scholarship',
      name_ta: 'பிற்படுத்தப்பட்டோர் / மிகவும் பிற்படுத்தப்பட்டோர் கல்வி உதவித்தொகை',
      department_en: 'BC, MBC & Minorities Welfare Department, Govt. of Tamil Nadu',
      department_ta: 'பிற்படுத்தப்பட்டோர் மற்றும் மிகவும் பிற்படுத்தப்பட்டோர் நலத்துறை',
      official_portal: 'https://bcmbc.tn.gov.in',
      benefit_en: 'Full tuition fee waiver + ₹230–₹1,200/month maintenance allowance.',
      benefit_ta: 'முழு கல்விக் கட்டண விலக்கு + ₹230-₹1,200 மாதப் பராமரிப்புத் தொகை.',
      monthly_benefit_amount: 1000,
      annual_benefit_amount: 15000,
      category: 'student'
    },
    [
      { field_name: 'category', operator: 'IN', field_value: 'OBC,MBC,DNC', en: 'Must belong to BC, MBC, or DNC social category', ta: 'BC, MBC அல்லது DNC சமூகப் பிரிவைச் சேர்ந்தவராக இருக்க வேண்டும்' },
      { field_name: 'education_level', operator: 'IN', field_value: '12th_pass,degree,diploma,iti,pg', en: 'Pursuing Post-10th / Higher Education studies', ta: '10 ஆம் வகுப்பிற்குப் பிந்தைய உயர்கல்வி பயில வேண்டும்' },
      { field_name: 'annual_family_income', operator: 'LTE', field_value: '250000', en: 'Family annual income must be below ₹2,50,000', ta: 'குடும்பத்தின் ஆண்டு வருமானம் ₹2,50,000க்கு மிகாமல் இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'community_certificate', en: 'BC / MBC / DNC Community Certificate', ta: 'சாதிச் சான்றிதழ்' },
      { key: 'income_certificate', en: 'Income Certificate', ta: 'வருமானச் சான்றிதழ்' }
    ]
  );

  // 5. SC/ST Post-Matric Scholarship (NEW #3)
  insertScheme(
    {
      id: 'post_matric_sc_st',
      name_en: 'SC/ST Post-Matric Scholarship',
      name_ta: 'ஆதிதிராவிடர் மற்றும் பழங்குடியினர் கல்வி உதவித்தொகை',
      department_en: 'Adi Dravidar & Tribal Welfare Department, Govt. of Tamil Nadu',
      department_ta: 'ஆதிதிராவிடர் மற்றும் பழங்குடியினர் நலத்துறை',
      official_portal: 'https://adw.tn.gov.in',
      benefit_en: 'Full tuition fee reimbursement + monthly stipend.',
      benefit_ta: 'முழு கல்விக் கட்டண மறுசெலுத்துகை + மாதந்தோறும் கல்வி உதவித் தொகை.',
      monthly_benefit_amount: 1200,
      annual_benefit_amount: 25000,
      category: 'student'
    },
    [
      { field_name: 'category', operator: 'IN', field_value: 'SC,ST', en: 'Must belong to SC or ST community', ta: 'SC அல்லது ST சமூகத்தைச் சேர்ந்தவராக இருக்க வேண்டும்' },
      { field_name: 'education_level', operator: 'IN', field_value: '12th_pass,degree,diploma,iti,pg', en: 'Pursuing Post-10th / UG / PG studies', ta: '10 ஆம் வகுப்பிற்குப் பிந்தைய கல்வி பயில வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'community_certificate', en: 'SC / ST Community Certificate', ta: 'சாதிச் சான்றிதழ்' },
      { key: 'income_certificate', en: 'Income Certificate', ta: 'வருமானச் சான்றிதழ்' }
    ]
  );

  // 6. First Graduate Scholarship (NEW #4)
  insertScheme(
    {
      id: 'first_graduate',
      name_en: 'First Graduate Scholarship',
      name_ta: 'முதல் பட்டதாரி கல்வி உதவித்தொகை',
      department_en: 'Directorate of Collegiate Education, Govt. of Tamil Nadu',
      department_ta: 'கல்லூரி கல்வி இயக்ககம், தமிழ்நாடு அரசு',
      official_portal: 'https://tn.gov.in',
      benefit_en: 'Tuition fee assistance up to ₹60,000/year for first-generation graduates.',
      benefit_ta: 'குடும்பத்தில் முதல் பட்டதாரிக்கு ஆண்டுக்கு ₹60,000 வரை கல்விக் கட்டண உதவி.',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 60000,
      category: 'student'
    },
    [
      { field_name: 'is_first_graduate', operator: 'EQUALS', field_value: 'true', en: 'Student must be the first person in immediate family to attend college', ta: 'குடும்பத்தில் முதல் பட்டதாரியாக இருக்க வேண்டும்' },
      { field_name: 'annual_family_income', operator: 'LTE', field_value: '250000', en: 'Family annual income must be below ₹2,50,000', ta: 'குடும்பத்தின் ஆண்டு வருமானம் ₹2,50,000க்கு மிகாமல் இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'first_graduate_cert', en: 'First Graduate Certificate (Tahsildar issued)', ta: 'முதல் பட்டதாரி சான்றிதழ்' },
      { key: 'income_certificate', en: 'Income Certificate', ta: 'வருமானச் சான்றிதழ்' }
    ]
  );

  // 7. EVR Nagammai Scholarship (NEW #5)
  insertScheme(
    {
      id: 'evr_nagammai',
      name_en: 'EVR Nagammai Scholarship',
      name_ta: 'ஈ.வெ.ரா. நாகம்மையார் கல்வி உதவித்தொகை',
      department_en: 'Directorate of Collegiate Education, Govt. of Tamil Nadu',
      department_ta: 'கல்லூரி கல்வி இயக்ககம், தமிழ்நாடு அரசு',
      official_portal: 'https://dce.tn.gov.in',
      benefit_en: 'Fee assistance for female students pursuing Postgraduate (PG) studies in Arts or Science.',
      benefit_ta: 'கலை மற்றும் அறிவியல் முதுகலை (PG) படிக்கும் மாணவிகளுக்கு கல்விக் கட்டண உதவி.',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 15000,
      category: 'student'
    },
    [
      { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Must be a female student', ta: 'மாணவியாக இருக்க வேண்டும்' },
      { field_name: 'education_level', operator: 'EQUALS', field_value: 'pg', en: 'Currently pursuing Postgraduate (PG) degree in Arts/Science', ta: 'முதுகலை (PG) பட்டம் பயில வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'degree_certificate', en: 'UG Marksheet / Degree Certificate', ta: 'இளங்கலை மதிப்பெண் சான்றிதழ்' },
      { key: 'bonafide_certificate', en: 'PG Admission / Bonafide Certificate', ta: 'முதுகலை சேர்க்கை சான்றிதழ்' }
    ]
  );

  // 8. AICTE Pragati Scholarship for Girls (NEW #6)
  insertScheme(
    {
      id: 'aicte_pragati',
      name_en: 'AICTE Pragati Scholarship for Girls',
      name_ta: 'AICTE பிரகதி மாணவிகள் கல்வி உதவித்தொகை',
      department_en: 'AICTE, Ministry of Education, Govt. of India',
      department_ta: 'அகில இந்திய தொழில்நுட்பக் கல்வி கவுன்சில் (AICTE)',
      official_portal: 'https://scholarships.gov.in',
      benefit_en: '₹50,000/year for female technical education students.',
      benefit_ta: 'தொழில்நுட்ப கல்வி பயிலும் மாணவிகளுக்கு ஆண்டுக்கு ₹50,000 உதவித்தொகை.',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 50000,
      category: 'student'
    },
    [
      { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Must be a female student', ta: 'மாணவியாக இருக்க வேண்டும்' },
      { field_name: 'age', operator: 'GTE', field_value: '17', en: 'Aged between 17 and 30 years', ta: 'வயது 17 முதல் 30க்குள் இருக்க வேண்டும்' },
      { field_name: 'age', operator: 'LTE', field_value: '30', en: 'Age must not exceed 30 years', ta: 'வயது 30க்கு மிகாமல் இருக்க வேண்டும்' },
      { field_name: 'annual_family_income', operator: 'LTE', field_value: '800000', en: 'Family annual income must be below ₹8,00,000 (₹8 Lakh)', ta: 'குடும்ப ஆண்டு வருமானம் ₹8 லட்சத்திற்குள் இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'admission_letter', en: 'AICTE Approved College Admission Letter', ta: 'கல்லூரி சேர்க்கை கடிதம்' },
      { key: 'income_certificate', en: 'Income Certificate', ta: 'வருமானச் சான்றிதழ்' }
    ]
  );

  // 9. Annal Ambedkar Overseas Scholarship (NEW #7)
  insertScheme(
    {
      id: 'ambedkar_overseas',
      name_en: 'Annal Ambedkar Overseas Higher Education Scholarship',
      name_ta: 'அண்ணல் அம்பேத்கர் வெளிநாட்டு உயர்கல்வி உதவித்தொகை',
      department_en: 'Adi Dravidar & Tribal Welfare Department, Govt. of Tamil Nadu',
      department_ta: 'ஆதிதிராவிடர் மற்றும் பழங்குடியினர் நலத்துறை',
      official_portal: 'https://adw.tn.gov.in',
      benefit_en: 'Full funding for foreign university study (Tuition fees, living expenses, airfare, visa).',
      benefit_ta: 'வெளிநாட்டு பல்கலைக்கழக உயர்கல்விக்கான முழு நிதியுதவி (கட்டணம், வாழ்வாதாரம், விமானக் கட்டணம்).',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 2500000,
      category: 'student'
    },
    [
      { field_name: 'category', operator: 'EQUALS', field_value: 'SC', en: 'Must belong to SC community', ta: 'SC சமூகத்தைச் சேர்ந்தவராக இருக்க வேண்டும்' },
      { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Permanent resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் நிரந்தர வசிப்பிடமாக இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'community_certificate', en: 'SC Community Certificate', ta: 'சாதிச் சான்றிதழ்' },
      { key: 'foreign_admission', en: 'Foreign University Admission Letter', ta: 'வெளிநாட்டு பல்கலைக்கழக சேர்க்கைக் கடிதம்' }
    ]
  );

  // 10. PM Scholarship Scheme (NEW #8)
  insertScheme(
    {
      id: 'pmss',
      name_en: 'Prime Minister Scholarship Scheme (PMSS)',
      name_ta: 'பிரதமரின் கல்வி உதவித்தொகை திட்டம் (PMSS)',
      department_en: 'Kendriya Sainik Board (KSB), Ministry of Defence, Govt. of India',
      department_ta: 'மத்திய சைனிக் வாரியம், பாதுகாப்பு அமைச்சகம்',
      official_portal: 'https://ksb.gov.in',
      benefit_en: '₹2,500/month for boys, ₹3,000/month for girls in professional courses.',
      benefit_ta: 'மாணவர்களுக்கு ₹2,500/மாதம், மாணவிகளுக்கு ₹3,000/மாதம் கல்வி உதவித்தொகை.',
      monthly_benefit_amount: 3000,
      annual_benefit_amount: 36000,
      category: 'student'
    },
    [
      { field_name: 'ex_serviceman_child', operator: 'EQUALS', field_value: 'true', en: 'Child or widow of ex-serviceman / ex-coast guard personnel', ta: 'முன்னாள் ராணுவத்தினரின் குழந்தை அல்லது விதவையாக இருக்க வேண்டும்' },
      { field_name: 'age', operator: 'GTE', field_value: '17', en: 'Aged between 17 and 25 years', ta: 'வயது 17 முதல் 25க்குள் இருக்க வேண்டும்' },
      { field_name: 'age', operator: 'LTE', field_value: '25', en: 'Age limit 25 years', ta: 'அதிகபட்ச வயது 25' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'ex_serviceman_cert', en: 'Ex-Serviceman Certificate / ESM Card', ta: 'முன்னாள் ராணுவத்தினர் சான்றிதழ்' },
      { key: 'mark_sheet', en: 'Qualifying Marksheets', ta: 'கல்வி மதிப்பெண் சான்றிதழ்' }
    ]
  );

  // 11. Amma Two Wheeler Scheme (NEW #9)
  insertScheme(
    {
      id: 'amma_two_wheeler',
      name_en: 'Amma Two Wheeler Scheme',
      name_ta: 'அம்மா இருசக்கர வாகன திட்டம்',
      department_en: 'Social Welfare & Women Empowerment, Govt. of Tamil Nadu',
      department_ta: 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
      official_portal: 'https://tnsocialwelfare.tn.gov.in',
      benefit_en: '50% subsidy (up to ₹25,000) on purchase of a two-wheeler for working women.',
      benefit_ta: 'பணியாற்றும் பெண்களுக்கு இருசக்கர வாகனம் வாங்க 50% மானியம் (அதிகபட்சம் ₹25,000).',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 25000,
      category: 'general'
    },
    [
      { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Must be a working woman', ta: 'பணியாற்றும் பெண்ணாக இருக்க வேண்டும்' },
      { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Permanent resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'employment_proof', en: 'Proof of Employment / Salary Certificate', ta: 'வேலை வாய்ப்பு சான்றிதழ்' },
      { key: 'driving_license', en: 'Valid Two-Wheeler Driving License', ta: 'ஓட்டுநர் உரிமம்' }
    ]
  );

  // 12. Amma Unavagam (NEW #10)
  insertScheme(
    {
      id: 'amma_unavagam',
      name_en: 'Amma Unavagam (Amma Canteen)',
      name_ta: 'அம்மா உணவகம்',
      department_en: 'Municipal Administration & Urban Development, Govt. of Tamil Nadu',
      department_ta: 'நகராட்சி நிர்வாகம் மற்றும் குடிநீர் வழங்கல் துறை',
      official_portal: 'https://chennaicorporation.gov.in',
      benefit_en: 'Highly subsidized meals (₹1 Idli, ₹5 Sambar Rice, ₹3 Curd Rice) at state-run canteens.',
      benefit_ta: 'அரசு உணவகங்களில் மிகக் குறைந்த விலையில் தரமான உணவு (இட்லி ₹1, சாம்பார் சாதம் ₹5).',
      monthly_benefit_amount: 1500,
      annual_benefit_amount: 18000,
      category: 'general'
    },
    [
      { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Open to all residents & general public in Tamil Nadu', ta: 'தமிழ்நாட்டில் உள்ள அனைத்து பொதுமக்களுக்கும் பொருந்தும்' }
    ],
    [
      { key: 'no_doc', en: 'No formal application needed — Walk-in service.', ta: 'விண்ணப்பம் தேவையில்லை — நேரடியாகச் சென்று உணவு பெறலாம்.' }
    ]
  );

  // 13. CM Breakfast Scheme (NEW #11)
  insertScheme(
    {
      id: 'cm_breakfast',
      name_en: "Chief Minister's Breakfast Scheme",
      name_ta: 'முதலமைச்சரின் காலை உணவுத் திட்டம்',
      department_en: 'School Education Department, Govt. of Tamil Nadu',
      department_ta: 'பள்ளித் கல்வித் துறை, தமிழ்நாடு அரசு',
      official_portal: 'https://tnschools.gov.in',
      benefit_en: 'Free nutritious daily breakfast provided to primary school students.',
      benefit_ta: 'அரசு தொடக்கப் பள்ளி மாணவர்களுக்கு தினமும் இலவச ஊட்டச்சத்து காலை உணவு.',
      monthly_benefit_amount: 800,
      annual_benefit_amount: 9600,
      category: 'student'
    },
    [
      { field_name: 'school_type_6_to_12', operator: 'EQUALS', field_value: 'tn_govt_school', en: 'Enrolled in Tamil Nadu Government Primary School', ta: 'தமிழக அரசு தொடக்கப் பள்ளியில் பயில வேண்டும்' }
    ],
    [
      { key: 'school_enrollment', en: 'Automatic coverage upon school enrollment.', ta: 'பள்ளிச் சேர்க்கை மூலம் தானாகவே வழங்கப்படும்.' }
    ]
  );

  // 14. Naan Mudhalvan (NEW #12)
  insertScheme(
    {
      id: 'naan_mudhalvan',
      name_en: 'Naan Mudhalvan Skill Development Scheme',
      name_ta: 'நான் முதல்வன் திறன் மேம்பாட்டுத் திட்டம்',
      department_en: 'Higher Education Department & TNSDC, Govt. of Tamil Nadu',
      department_ta: 'உயர்கல்வித் துறை & தமிழ்நாடு திறன் மேம்பாட்டுக் கழகம்',
      official_portal: 'https://naanmudhalvan.tn.gov.in',
      benefit_en: 'Free industry skill development, emerging tech training & placement assistance.',
      benefit_ta: 'இலவச தொழில் திறன் பயிற்சி, புதிய தொழில்நுட்ப பயிற்சி மற்றும் வேலைவாய்ப்பு உதவி.',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 20000,
      category: 'student'
    },
    [
      { field_name: 'education_course_type', operator: 'EQUALS', field_value: 'regular_higher_education', en: 'College student or youth in Tamil Nadu', ta: 'தமிழக கல்லூரி மாணவர் அல்லது இளைஞராக இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'college_id', en: 'College ID / Student Proof', ta: 'கல்லூரி அடையாள அட்டை' }
    ]
  );

  // 15. Kalaignar Kanavu Illam (NEW #13)
  insertScheme(
    {
      id: 'kanavu_illam',
      name_en: 'Kalaignar Kanavu Illam Housing Scheme',
      name_ta: 'கலைஞர் கனவு இல்லம் திட்டம்',
      department_en: 'Rural Development & Housing Department, Govt. of Tamil Nadu',
      department_ta: 'ஊரக வளர்ச்சி மற்றும் ஊராட்சித் துறை',
      official_portal: 'https://tnrd.tn.gov.in',
      benefit_en: '₹3.5 Lakh financial grant to build a permanent (pucca) house for hut-dwellers.',
      benefit_ta: 'குடில்களில் வசிப்போருக்கு நிரந்தர வீடு கட்ட ₹3.5 லட்சம் நிதி உதவி.',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 350000,
      category: 'general'
    },
    [
      { field_name: 'annual_family_income', operator: 'LTE', field_value: '120000', en: 'Low income family living in huts or inadequate housing', ta: 'குடில்கள் அல்லது போதிய வீடற்ற ஏழை குடும்பமாக இருக்க வேண்டும்' },
      { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Permanent resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'income_cert', en: 'Income Certificate', ta: 'வருமானச் சான்றிதழ்' },
      { key: 'site_patta', en: 'Land Patta / Site Documents', ta: 'நிலப் பட்டா சான்று' }
    ]
  );

  // 16. Annapoorani Super 6 (NEW #14 — Upcoming Jan 2027 Scheme)
  insertScheme(
    {
      id: 'annapoorani_super6',
      name_en: 'Annapoorani Super 6 LPG Cylinder Scheme',
      name_ta: 'அன்னபூரணி சூப்பர் 6 இலவச கேஸ் உருளைத் திட்டம்',
      department_en: 'Civil Supplies & Consumer Protection, Govt. of Tamil Nadu',
      department_ta: 'உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை',
      official_portal: 'https://tnpds.gov.in',
      benefit_en: '3 Free LPG Gas Cylinders per year for low-income households.',
      benefit_ta: 'ஆண்டுக்கு 3 இலவச சமையல் எரிவாயு சிலிண்டர்கள் வழங்கப்படும்.',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 3000,
      is_active: 0, // Upcoming scheme launching January 2027
      category: 'general',
      policy_notes_2026_en: 'Status: Upcoming scheme scheduled to launch in January 2027.',
      policy_notes_2026_ta: 'நிலை: ஜனவரி 2027 இல் தொடங்க திட்டமிடப்பட்டுள்ள புதிய திட்டம்.'
    },
    [
      { field_name: 'ration_card_head', operator: 'EQUALS', field_value: 'true', en: 'Woman head of household', ta: 'குடும்பத் தலைவியாக இருக்க வேண்டும்' },
      { field_name: 'annual_family_income', operator: 'LTE', field_value: '250000', en: 'Family annual income under ₹2,50,000', ta: 'குடும்ப ஆண்டு வருமானம் ₹2,50,000க்குள் இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'ration_card', en: 'Smart Family Ration Card', ta: 'ஸ்மார்ட் குடும்ப அட்டை' },
      { key: 'gas_passbook', en: 'LPG Gas Connection Consumer Book', ta: 'எரிவாயு இணைப்பு அட்டை' }
    ]
  );

  // 17. CMCHIS
  insertScheme(
    {
      id: 'cmchis',
      name_en: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
      name_ta: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)',
      department_en: 'Health & Family Welfare Department',
      department_ta: 'மக்கள் நல்வாழ்வு மற்றும் குடும்ப நலத்துறை',
      official_portal: 'https://cmchistn.com',
      benefit_en: 'Cashless hospital treatment up to ₹5,000,000/family/year across 1,090+ hospitals.',
      benefit_ta: 'ஆண்டுக்கு குடும்பத்திற்கு ₹5 லட்சம் வரை 1090+ மருத்துவமனைகளில் ரொக்கமில்லா சிகிச்சை.',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 500000,
      category: 'general',
      policy_notes_2026_en: 'Seed figure: ₹5 Lakh coverage. CM announced proposal to increase coverage limit to ₹25 Lakh.'
    },
    [
      { field_name: 'ration_card_holder', operator: 'EQUALS', field_value: 'true', en: 'Valid Tamil Nadu Smart Family Ration Card holder', ta: 'தமிழ்நாடு ஸ்மார்ட் குடும்ப அட்டை இருக்க வேண்டும்' },
      { field_name: 'annual_family_income', operator: 'LTE', field_value: '120000', en: 'Annual family income below ₹1,20,000', ta: 'குடும்பத்தின் ஆண்டு வருமானம் ₹1,20,000க்கு மிகாமல் இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'ration_card', en: 'Smart Family Ration Card', ta: 'ஸ்மார்ட் குடும்ப அட்டை' },
      { key: 'income_certificate', en: 'Income Certificate', ta: 'வருமானச் சான்றிதழ்' }
    ]
  );

  // 18. Thalikku Thangam
  insertScheme(
    {
      id: 'thalikku_thangam',
      name_en: 'Thalikku Thangam Thittam (Marriage Assistance Scheme)',
      name_ta: 'தாலிக்கு தங்கம் திட்டம் (திருமண உதவித் திட்டம்)',
      department_en: 'Social Welfare & Women Empowerment',
      department_ta: 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
      official_portal: 'https://tnsocialwelfare.tn.gov.in',
      benefit_en: 'Marriage financial assistance (₹25,000 / ₹50,000) + 8g (22-carat) Gold Coin.',
      benefit_ta: 'திருமண உதவி: ₹25,000 / ₹50,000 ரொக்கம் + 8 கிராம் (22 கேரட்) தங்க நாணயம்.',
      monthly_benefit_amount: 0,
      annual_benefit_amount: 50000,
      category: 'general'
    },
    [
      { field_name: 'gender', operator: 'EQUALS', field_value: 'female', en: 'Applicant must be the bride', ta: 'விண்ணப்பதாரர் மணப்பெண்ணாக இருக்க வேண்டும்' },
      { field_name: 'age', operator: 'GTE', field_value: '18', en: 'Bride aged 18 years or older', ta: 'மணப்பெண்ணுக்கு 18 வயது நிறைந்திருக்க வேண்டும்' },
      { field_name: 'annual_family_income', operator: 'LTE', field_value: '120000', en: 'Low family annual income', ta: 'குடும்ப வருமானம் குறைவாக இருக்க வேண்டும்' }
    ],
    [
      { key: 'aadhaar_card', en: 'Aadhaar Card', ta: 'ஆதார் கார்டு' },
      { key: 'academic_certificate', en: 'Educational Certificate (10th / Degree)', ta: 'கல்விச் சான்றிதழ்' },
      { key: 'marriage_invitation', en: 'Marriage Invitation / Registration', ta: 'திருமணப் பத்திரிகை' }
    ]
  );

  // 19. Free Bus Travel (Magalir Payanam)
  insertScheme(
    {
      id: 'magalir_payanam',
      name_en: 'Free Bus Travel Scheme for Women (Magalir Payanam)',
      name_ta: 'மகளிர் இலவச பேருந்து பயணத் திட்டம் (மகளிர் பயணம்)',
      department_en: 'Transport Department, Govt. of Tamil Nadu',
      department_ta: 'போக்குவரத்துத் துறை, தமிழ்நாடு அரசு',
      official_portal: 'https://tnstc.in',
      benefit_en: 'Free zero-ticket bus travel for women and transgender persons in town buses.',
      benefit_ta: 'நகரப் பேருந்துகளில் கட்டணமில்லா இலவசப் பயணம்.',
      monthly_benefit_amount: 1200,
      annual_benefit_amount: 14400,
      category: 'general'
    },
    [
      { field_name: 'gender', operator: 'IN', field_value: 'female,transgender', en: 'Must be a woman or transgender person', ta: 'பெண் அல்லது திருநங்கையாக இருக்க வேண்டும்' },
      { field_name: 'state_domicile', operator: 'EQUALS', field_value: 'tamil_nadu', en: 'Resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்' }
    ],
    [
      { key: 'residence_proof', en: 'Carry Aadhaar/ID as residence proof.', ta: 'ஆதார்/அடையாள அட்டை வைத்திருக்கவும்.' }
    ]
  );

  console.log('✅ SQLite Database successfully seeded with 19 Real Tamil Nadu & Central Government Schemes!');
});

db.close();
