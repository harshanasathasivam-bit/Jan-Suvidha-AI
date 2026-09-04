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

console.log('🌱 Initializing Jan Suvidha AI Welfare Schemes Database with 7 Real Verified Schemes...');

db.serialize(() => {
  // Drop & Recreate tables with expanded schema
  db.run(`DROP TABLE IF EXISTS required_documents`);
  db.run(`DROP TABLE IF EXISTS eligibility_rules`);
  db.run(`DROP TABLE IF EXISTS schemes`);

  db.run(`
    CREATE TABLE schemes (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_ta TEXT NOT NULL,
      department_en TEXT NOT NULL,
      department_ta TEXT NOT NULL,
      government TEXT NOT NULL,
      category TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_ta TEXT NOT NULL,
      benefit_en TEXT NOT NULL,
      benefit_ta TEXT NOT NULL,
      monthly_benefit_amount REAL DEFAULT 0,
      annual_benefit_amount REAL DEFAULT 0,
      application_process_en TEXT NOT NULL,
      application_process_ta TEXT NOT NULL,
      official_source TEXT NOT NULL,
      official_url TEXT NOT NULL,
      last_verified TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      is_active INTEGER DEFAULT 1,
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

  // Prepare insert statement for schemes
  const insertScheme = db.prepare(`
    INSERT INTO schemes (
      id, name_en, name_ta, department_en, department_ta, government, category,
      description_en, description_ta, benefit_en, benefit_ta,
      monthly_benefit_amount, annual_benefit_amount,
      application_process_en, application_process_ta,
      official_source, official_url, last_verified, status, is_active,
      policy_notes_2026_en, policy_notes_2026_ta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const insertRule = db.prepare(`
    INSERT INTO eligibility_rules (scheme_id, field_name, operator, field_value, description_en, description_ta, is_mandatory)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDoc = db.prepare(`
    INSERT INTO required_documents (scheme_id, doc_key, doc_name_en, doc_name_ta, description_en, description_ta, is_mandatory)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. KMUT (Kalaignar Magalir Urimai Thogai Thittam)
  insertScheme.run(
    'kmut',
    'Kalaignar Magalir Urimai Thogai Thittam (KMUT)',
    'கலைஞர் மகளிர் உரிமைத் தொகை திட்டம் (KMUT)',
    'Social Welfare & Women Empowerment Department',
    'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
    'Government of Tamil Nadu',
    'Women & Child',
    'A landmark universal basic income scheme empowering female heads of underprivileged households across Tamil Nadu with financial autonomy.',
    'தமிழ்நாட்டின் ஏழை குடும்பத் தலைவிகளுக்கு மாதந்தோறும் உரிமைத் தொகை வழங்கி பொருளாதார சுயாட்சியை உறுதிப்படுத்தும் திட்டம்.',
    '₹1,000/month (₹12,000/year) direct benefit transfer (DBT) to bank account on the 15th of every month.',
    'மாதம்தோறும் ₹1,000 (ஆண்டுக்கு ₹12,000) நேரடியாக குடும்பத் தலைவியின் வங்கி கணக்கில் செலுத்தப்படுகிறது.',
    1000, 12000,
    'Apply via special camp organized at your local ration shop / e-Sevai centre with Aadhaar & Ration Card.',
    'ரேஷன் கடை / இ-சேவை மையத்தில் நடக்கும் சிறப்பு முகாமில் ஆதார் மற்றும் குடும்ப அட்டையுடன் விண்ணப்பிக்கவும்.',
    'Official Government Source (Govt. of Tamil Nadu)',
    'https://kmut.tn.gov.in',
    'August 2026',
    'ACTIVE',
    'Confirmed seed benefit: ₹1,000/mo. Mid-2026 proposed hikes to ₹2,500-₹3,000/mo are currently under review/unconfirmed.',
    'உறுதிசெய்யப்பட்ட தொகை: ₹1,000/மாதம். ₹2,500-₹3,000 உயர்வு பற்றிய முன்மொழிவு பரிசீலனையில் உள்ளது.'
  );

  const kmutRules = [
    { field: 'gender', op: 'EQUALS', val: 'female', en: 'Applicant must be a woman', ta: 'விண்ணப்பதாரர் பெண்ணாக இருக்க வேண்டும்', m: 1 },
    { field: 'age', op: 'GTE', val: '21', en: 'Must be aged 21 years or older', ta: 'வயது 21 அல்லது அதற்கு மேல் இருக்க வேண்டும்', m: 1 },
    { field: 'state_domicile', op: 'EQUALS', val: 'tamil_nadu', en: 'Must be a resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் நிரந்தர வசிப்பிடமாக இருக்க வேண்டும்', m: 1 },
    { field: 'ration_card_head', op: 'EQUALS', val: 'true', en: 'Must be named head of household or spouse of head on Smart Ration Card', ta: 'குடும்ப அட்டையில் குடும்பத் தலைவியாக அல்லது மனைவியாக இருக்க வேண்டும்', m: 1 },
    { field: 'annual_family_income', op: 'LTE', val: '250000', en: 'Family annual income must not exceed ₹2,50,000 (₹2.5 Lakh)', ta: 'குடும்பத்தின் ஆண்டு வருமானம் ₹2,50,000க்கு மிகாமல் இருக்க வேண்டும்', m: 1 },
    { field: 'owns_four_wheeler', op: 'EQUALS', val: 'false', en: 'Family must not own a 4-wheeler personal vehicle (car/SUV)', ta: 'குடும்பத்தில் நான்கு சக்கர வாகனம் இருக்கக்கூடாது', m: 1 },
    { field: 'is_govt_employee_or_pensioner', op: 'EQUALS', val: 'false', en: 'Family must not have regular govt employees or income tax payees', ta: 'அரசு ஊழியர் அல்லது வருமான வரி செலுத்துபவராக இருக்கக்கூடாது', m: 1 }
  ];
  kmutRules.forEach(r => insertRule.run('kmut', r.field, r.op, r.val, r.en, r.ta, r.m));

  const kmutDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Card (Bank Linked / NPCI seeded)', ta: 'ஆதார் கார்டு (வங்கி கணக்குடன் இணைக்கப்பட்டது)', m: 1 },
    { key: 'ration_card', en: 'Smart Family Ration Card', ta: 'ஸ்மார்ட் குடும்ப அட்டை', m: 1 },
    { key: 'bank_passbook', en: 'Bank Account Passbook (Single account)', ta: 'வங்கி கணக்கு புத்தக நகல்', m: 1 },
    { key: 'electricity_bill', en: 'Recent Domestic Electricity Bill', ta: 'மின்சார கட்டண ரசீது', m: 0 }
  ];
  kmutDocs.forEach(d => insertDoc.run('kmut', d.key, d.en, d.ta, d.en, d.ta, d.m));

  // 2. Pudhumai Penn Thittam
  insertScheme.run(
    'pudhumai_penn',
    'Pudhumai Penn Thittam (Moovalur Ramamirtham Ammaiyar Scheme)',
    'புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார் உயர்கல்வி உறுதித் திட்டம்)',
    'Social Welfare & Women Empowerment Department',
    'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
    'Government of Tamil Nadu',
    'Education',
    'Higher education assurance financial assistance for girl students who studied classes 6 to 12 in Tamil Nadu government or government-aided schools.',
    'அரசு மற்றும் அரசு உதவி பெறும் பள்ளிகளில் 6 முதல் 12 வரை படித்த மாணவிகள் உயர்கல்வி பயில உதவும் மாதாந்திர ஊக்கத்தொகை திட்டம்.',
    '₹1,000/month credit directly to the student bank account until completion of first undergraduate degree or diploma.',
    'பட்டப்படிப்பு அல்லது டிப்ளமோ முடியும் வரை மாணவிகளுக்கு மாதந்தோறும் ₹1,000 கல்வி உதவித்தொகை.',
    1000, 12000,
    'Apply online through college administrative nodal desk on the official portal (pudhumaipenn.tn.gov.in).',
    'கல்லூரி ஒருங்கிணைப்பாளர் மூலமாக அதிகாரப்பூர்வ இணையதளத்தில் விண்ணப்பிக்கலாம்.',
    'Official Government Source (Govt. of Tamil Nadu)',
    'https://pudhumaipenn.tn.gov.in',
    'July 2026',
    'ACTIVE',
    'Eligibility expanded from July 15, 2024 to include female students from Govt-Aided schools (Classes 6-12 in Tamil medium).',
    'அரசு உதவி பெறும் பள்ளிகளில் படித்த மாணவிகளுக்கும் திட்டம் விரிவாக்கப்பட்டுள்ளது.'
  );

  const pudhumaiRules = [
    { field: 'gender', op: 'EQUALS', val: 'female', en: 'Applicant must be a female student', ta: 'விண்ணப்பதாரர் மாணவியாக இருக்க வேண்டும்', m: 1 },
    { field: 'school_type_6_to_12', op: 'IN', val: 'tn_govt_school,tn_govt_aided_school', en: 'Studied classes 6 to 12 in TN Govt School or Govt-Aided School', ta: '6 முதல் 12 ஆம் வகுப்பு வரை தமிழக அரசு அல்லது அரசு உதவி பெறும் பள்ளியில் பயின்றிருக்க வேண்டும்', m: 1 },
    { field: 'education_course_type', op: 'EQUALS', val: 'regular_higher_education', en: 'Enrolled in recognized undergraduate degree, diploma, or ITI in TN', ta: 'அங்கீகரிக்கப்பட்ட பட்டப்படிப்பு/டிப்ளமோ/ITI படிப்பில் பயில வேண்டும்', m: 1 }
  ];
  pudhumaiRules.forEach(r => insertRule.run('pudhumai_penn', r.field, r.op, r.val, r.en, r.ta, r.m));

  const pudhumaiDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Card of Student', ta: 'மாணவியின் ஆதார் அட்டை', m: 1 },
    { key: 'school_bonafide', en: 'Classes 6-12 Study Certificate from School / EMIS Number', ta: 'பள்ளி மாற்றுச் சான்றிதழ் / EMIS எண் சான்று', m: 1 },
    { key: 'college_id_bonafide', en: 'Current College Bonafide / Admission Receipt', ta: 'கல்லூரி சேர்க்கை ரசீது / போனஃபைட் சான்றிதழ்', m: 1 },
    { key: 'bank_passbook', en: 'Student Bank Account Passbook (Active Aadhaar linked)', ta: 'மாணவியின் தனி வங்கி கணக்கு புத்தகம்', m: 1 }
  ];
  pudhumaiDocs.forEach(d => insertDoc.run('pudhumai_penn', d.key, d.en, d.ta, d.en, d.ta, d.m));

  // 3. CMCHIS (Chief Minister's Comprehensive Health Insurance Scheme)
  insertScheme.run(
    'cmchis',
    "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
    'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS)',
    'Health & Family Welfare Department',
    'மக்கள் நல்வாழ்வு மற்றும் குடும்ப நலத்துறை',
    'Government of Tamil Nadu',
    'Health',
    'Cashless hospitalization and secondary/tertiary medical treatment up to ₹5,00,000 per family per year across 1,090+ empanelled government and private hospitals.',
    'ஆண்டுக்கு ₹5 லட்சம் வரை 1,090+ மருத்துவமனைகளில் அறுவை சிகிச்சை மற்றும் தீவிர மருத்துவ சிகிச்சைகளுக்கு கட்டணமில்லா காப்பீடு.',
    'Cashless medical cover up to ₹5,00,000 per family per year for covered diagnostics, surgeries, and critical illness treatment.',
    'ஆண்டுக்கு குடும்பத்திற்கு ₹5 லட்சம் வரை முழு ரொக்கமில்லா மருத்துவ சிகிச்சை.',
    0, 500000,
    'Enroll with Smart Family Card and Village Administrative Officer (VAO) income certificate at the District Kiosk / Collectorate.',
    'மாவட்ட ஆட்சியர் அலுவலகம் அல்லது இ-சேவை மையத்தில் குடும்ப அட்டை மற்றும் வருமான சான்றுடன் பதிவு செய்யலாம்.',
    'Official Government Source (Govt. of Tamil Nadu)',
    'https://cmchistn.com',
    'August 2026',
    'ACTIVE',
    'Coverage limit: ₹5 Lakh/family/year. Proposed extension to ₹25 Lakh announced and under notification.',
    'தற்போது ₹5 லட்சம் வரை காப்பீடு. ₹25 லட்சமாக உயர்த்துவதற்கான அரசு அரசாணை தயாரிப்பில் உள்ளது.'
  );

  const cmchisRules = [
    { field: 'ration_card_holder', op: 'EQUALS', val: 'true', en: 'Family enrolled in Tamil Nadu Smart Family Card', ta: 'தமிழக ஸ்மார்ட் குடும்ப அட்டை வைத்திருக்க வேண்டும்', m: 1 },
    { field: 'annual_family_income', op: 'LTE', val: '120000', en: 'Annual family income must not exceed ₹1,20,000 (₹1.2 Lakh)', ta: 'குடும்ப ஆண்டு வருமானம் ₹1,20,000க்கு மிகாமல் இருக்க வேண்டும்', m: 1 },
    { field: 'state_domicile', op: 'EQUALS', val: 'tamil_nadu', en: 'Must be a resident of Tamil Nadu', ta: 'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்', m: 1 }
  ];
  cmchisRules.forEach(r => insertRule.run('cmchis', r.field, r.op, r.val, r.en, r.ta, r.m));

  const cmchisDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Cards of all family members', ta: 'அனைத்து குடும்ப உறுப்பினர்களின் ஆதார் அட்டைகள்', m: 1 },
    { key: 'ration_card', en: 'Smart Family Ration Card', ta: 'ஸ்மார்ட் குடும்ப அட்டை', m: 1 },
    { key: 'income_certificate', en: 'Income Certificate issued by Revenue Tahsildar / VAO', ta: 'வருவாய்த் துறையினரால் வழங்கப்பட்ட வருமானச் சான்றிதழ்', m: 1 }
  ];
  cmchisDocs.forEach(d => insertDoc.run('cmchis', d.key, d.en, d.ta, d.en, d.ta, d.m));

  // 4. PMAY-U 2.0 (Pradhan Mantri Awas Yojana - Urban 2.0)
  insertScheme.run(
    'pmay_u',
    'Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U 2.0)',
    'பிரதான் மந்திரி ஆவாஸ் யோஜனா - நகர்ப்புறம் 2.0 (PMAY-U 2.0)',
    'Ministry of Housing and Urban Affairs / TN Housing Board',
    'வீட்டுவசதி மற்றும் நகர்ப்புற விவகாரங்கள் அமைச்சகம் / தமிழ்நாடு வீட்டுவசதி வாரியம்',
    'Government of India & Tamil Nadu',
    'Housing',
    'Affordable pucca housing assistance for EWS (Economically Weaker Sections) and LIG (Low Income Group) families in urban statutory towns without pucca homes.',
    'நகர்ப்புறங்களில் சொந்தமாக கான்கிரீட் வீடு இல்லாத ஏழை மற்றும் குறைந்த வருவாய் பிரிவினருக்கு வீடு கட்ட / வாங்க மானிய உதவி வழங்கும் திட்டம்.',
    'Interest subsidy up to ₹1.80 Lakh / Direct financial grant of ₹2.5 Lakh for construction of all-weather pucca house.',
    'புதிய வீடு கட்ட அல்லது வாங்க ₹2.5 லட்சம் வரை நேரடி அரசு மானியம் / வட்டி மானியம் வழங்கப்படுகிறது.',
    0, 250000,
    'Apply online through the official PMAY-U 2.0 unified portal (pmay-urban.gov.in) or common service centres (CSC) with land title and income proof.',
    'அதிகாரப்பூர்வ pmay-urban.gov.in இணையதளம் அல்லது பொது சேவை மையங்கள் மூலம் ஆன்லைனில் விண்ணப்பிக்கவும்.',
    'Official Government Source (Ministry of Housing and Urban Affairs, GoI)',
    'https://pmay-urban.gov.in',
    'August 2026',
    'ACTIVE',
    'PMAY-U 2.0 approved by Union Cabinet with ₹1 Lakh crore central assistance for 1 crore urban families across India.',
    'மத்திய அமைச்சரவையால் அங்கீகரிக்கப்பட்ட PMAY-U 2.0 திட்டத்தின் கீழ் 1 கோடி குடும்பங்களுக்கு மானிய உதவி.'
  );

  const pmayRules = [
    { field: 'state_domicile', op: 'EQUALS', val: 'tamil_nadu', en: 'Permanent resident of Tamil Nadu / India', ta: 'இந்திய மற்றும் தமிழக நிரந்தர வசிப்பவராக இருக்க வேண்டும்', m: 1 },
    { field: 'annual_family_income', op: 'LTE', val: '300000', en: 'Annual family income under ₹3,00,000 for EWS or ₹6,00,000 for LIG', ta: 'குடும்ப ஆண்டு வருமானம் ₹3,00,000க்கு மிகாமல் இருக்க வேண்டும் (EWS பிரிவு)', m: 1 },
    { field: 'owns_pucca_house', op: 'EQUALS', val: 'false', en: 'Family must not own an all-weather pucca house anywhere in India', ta: 'குடும்பத்தில் யாருக்கும் இந்தியாவில் எங்கும் சொந்த கான்கிரீட் வீடு இருக்கக்கூடாது', m: 1 }
  ];
  pmayRules.forEach(r => insertRule.run('pmay_u', r.field, r.op, r.val, r.en, r.ta, r.m));

  const pmayDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Cards of Head and Family members', ta: 'குடும்ப உறுப்பினர்களின் ஆதார் அட்டை', m: 1 },
    { key: 'income_certificate', en: 'Revenue Department Income Certificate', ta: 'வருவாய்த்துறை வருமானச் சான்றிதழ்', m: 1 },
    { key: 'land_patta', en: 'Land Patta / Ownership document (for new house construction)', ta: 'நிலப் பட்டா / உரிமை ஆவணம்', m: 1 },
    { key: 'bank_passbook', en: 'Bank Passbook / Cancelled Cheque', ta: 'வங்கி கணக்கு புத்தகம் / காசோலை', m: 1 }
  ];
  pmayDocs.forEach(d => insertDoc.run('pmay_u', d.key, d.en, d.ta, d.en, d.ta, d.m));

  // 5. PM-USP Central Sector Scholarship
  insertScheme.run(
    'pm_usp_scholarship',
    'PM-USP Central Sector Scheme of Scholarship for College and University Students',
    'கல்லூரி மற்றும் பல்கலைக்கழக மாணவர்களுக்கான மத்திய துறை உதவித்தொகை (PM-USP)',
    'Department of Higher Education, Ministry of Education',
    'உயர்கல்வித் துறை, இந்திய கல்வி அமைச்சகம்',
    'Government of India',
    'Education',
    'Merit-cum-means scholarship for meritorious college students scoring above the 80th percentile in Class 12 board examinations pursuing regular degrees.',
    '12 ஆம் வகுப்பு பொதுத்தேர்வில் சிறந்த மதிப்பெண் பெற்று கல்லூரி பட்டப்படிப்பு பயிலும் மாணவர்களுக்கு வழங்கப்படும் மத்திய அரசு கல்வி உதவித்தொகை.',
    '₹12,000/year at graduation level for first 3 years and ₹20,000/year at post-graduation level.',
    'பட்டப்படிப்பின் முதல் 3 ஆண்டுகளுக்கு ஆண்டுக்கு ₹12,000 மற்றும் முதுகலை படிப்புக்கு ஆண்டுக்கு ₹20,000.',
    1000, 12000,
    'Apply online through National Scholarship Portal (scholarships.gov.in) with Class 12 marksheet and college admission proof.',
    'தேசிய உதவித்தொகை போர்ட்டல் (scholarships.gov.in) மூலம் ஆன்லைனில் விண்ணப்பிக்கவும்.',
    'Official Government Source (National Scholarship Portal, MoE)',
    'https://scholarships.gov.in',
    'August 2026',
    'ACTIVE',
    'Disbursed through DBT on the National Scholarship Portal (NSP) with Aadhaar-enabled bank accounts.',
    'ஆதார் இணைக்கப்பட்ட வங்கி கணக்கில் மத்திய அரசால் நேரடியாகச் செலுத்தப்படுகிறது.'
  );

  const pmUspRules = [
    { field: 'education_course_type', op: 'EQUALS', val: 'regular_higher_education', en: 'Pursuing regular full-time undergraduate or postgraduate degree', ta: 'முழுநேர பட்டப்படிப்பு பயில வேண்டும்', m: 1 },
    { field: 'previous_exam_marks_pct', op: 'GTE', val: '75', en: 'Scored above 75%-80% marks in Class 12 Board examination', ta: '12 ஆம் வகுப்பு தேர்வில் 75% அல்லது அதற்கு மேல் மதிப்பெண் பெற்றிருக்க வேண்டும்', m: 1 },
    { field: 'annual_family_income', op: 'LTE', val: '450000', en: 'Family annual income from all sources must not exceed ₹4,50,000', ta: 'குடும்ப ஆண்டு வருமானம் ₹4,50,000க்கு மிகாமல் இருக்க வேண்டும்', m: 1 }
  ];
  pmUspRules.forEach(r => insertRule.run('pm_usp_scholarship', r.field, r.op, r.val, r.en, r.ta, r.m));

  const pmUspDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Card (Aadhaar Seeded Bank Account)', ta: 'மாணவரின் ஆதார் அட்டை', m: 1 },
    { key: 'marksheet_12', en: 'Class 12th Board Marksheet', ta: '12 ஆம் வகுப்பு மதிப்பெண் பட்டியல்', m: 1 },
    { key: 'bonafide_certificate', en: 'College Bonafide Certificate / Admission Fee Receipt', ta: 'கல்லூரி போனஃபைட் சான்றிதழ்', m: 1 },
    { key: 'income_certificate', en: 'Competent Authority Income Certificate', ta: 'அரசு வருமானச் சான்றிதழ்', m: 1 }
  ];
  pmUspDocs.forEach(d => insertDoc.run('pm_usp_scholarship', d.key, d.en, d.ta, d.en, d.ta, d.m));

  // 6. Free Bus Travel Scheme for Women (Magalir Payanam)
  insertScheme.run(
    'magalir_payanam',
    'Free Bus Travel Scheme for Women (Magalir Payanam)',
    'மகளிர் இலவச பேருந்து பயணத் திட்டம் (மகளிர் பயணம்)',
    'Transport Department, Govt. of Tamil Nadu',
    'போக்குவரத்துத் துறை, தமிழ்நாடு அரசு',
    'Government of Tamil Nadu',
    'Social Security',
    'Zero-fare public bus transport scheme for women, transgender persons, and differently-abled persons in ordinary town buses.',
    'தமிழ்நாடு முழுவதும் சாதாரண அரசு நகரப் பேருந்துகளில் பெண்கள், திருநங்கைகள் மற்றும் மாற்றுத்திறனாளிகளுக்கு கட்டணமில்லாப் பயணம்.',
    'Zero-ticket cost for all rides in ordinary town buses across TNSTC & MTC, saving estimated ₹1,200 - ₹1,500/month.',
    'அரசு சாதாரண நகரப் பேருந்துகளில் முழுவதும் இலவச பயணம், மாதம் ₹1,200க்கு மேல் சேமிப்பு.',
    1200, 14400,
    'No pre-application or token needed; board any pink-painted ordinary town bus across Tamil Nadu with residence proof.',
    'முன் விண்ணப்பம் தேவையில்லை; சாதாரண நகரப் பேருந்துகளில் அடையாள அட்டையுடன் நேரடியாக பயணிக்கலாம்.',
    'Official Government Source (TNSTC)',
    'https://tnstc.in',
    'July 2026',
    'ACTIVE',
    'Formally re-titled Magalir Payanam in July 2026. Extended service corridors announced for tier-2/3 rural hubs.',
    '2026 ஜூலையில் "மகளிர் பயணம்" என மறுபெயரிடப்பட்டு விரிவாக்கப்பட்டுள்ளது.'
  );

  const busRules = [
    { field: 'gender', op: 'IN', val: 'female,transgender', en: 'Applicant must be a woman or transgender person', ta: 'பெண் அல்லது திருநங்கையாக இருக்க வேண்டும்', m: 1 },
    { field: 'state_domicile', op: 'EQUALS', val: 'tamil_nadu', en: 'Resident or commuter in Tamil Nadu', ta: 'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்', m: 1 }
  ];
  busRules.forEach(r => insertRule.run('magalir_payanam', r.field, r.op, r.val, r.en, r.ta, r.m));

  const busDocs = [
    { key: 'residence_proof', en: 'No formal application needed. Carry Aadhaar Card / ID card for verification', ta: 'விண்ணப்பம் தேவையில்லை. ஆதார் அட்டை அல்லது அடையாள அட்டை கையில் வைத்திருக்கவும்', m: 0 }
  ];
  busDocs.forEach(d => insertDoc.run('magalir_payanam', d.key, d.en, d.ta, d.en, d.ta, d.m));

  // 7. Thalikku Thangam Thittam (Marriage Assistance)
  insertScheme.run(
    'thalikku_thangam',
    'Thalikku Thangam Thittam (Moovalur Ramamirtham Ammaiyar Marriage Assistance)',
    'தாலிக்கு தங்கம் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார் திருமண உதவித் திட்டம்)',
    'Social Welfare & Women Empowerment Department',
    'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
    'Government of Tamil Nadu',
    'Women & Child',
    'Financial assistance alongside an 8g 22-carat gold coin for marriage of daughters belonging to economically disadvantaged families.',
    'ஏழை குடும்பங்களில் உள்ள பெண்களின் திருமணத்திற்கு நிதியுதவியும் 8 கிராம் (22 கேரட்) தங்க நாணயமும் வழங்கும் திட்டம்.',
    'Cash aid (Tier I: ₹25,000 for 10th pass; Tier II: ₹50,000 for Degree/Diploma) plus 8g Sovereign Gold Coin.',
    '₹25,000 / ₹50,000 நிதியுதவி மற்றும் 8 கிராம் சுத்த தங்க நாணயம் வழங்கப்படுகிறது.',
    0, 50000,
    'Submit application at District Social Welfare Office / e-Sevai centre at least 40 days prior to marriage.',
    'திருமணத்திற்கு குறைந்தது 40 நாட்களுக்கு முன்பாக மாவட்ட சமூக நல அலுவலகம் அல்லது இ-சேவை மையத்தில் விண்ணப்பிக்கவும்.',
    'Official Government Source (Govt. of Tamil Nadu)',
    'https://tnsocialwelfare.tn.gov.in',
    'August 2026',
    'ACTIVE',
    'Re-verified marriage assistance scheme for eligible low-income brides (income < ₹72,000).',
    'குறைந்த வருவாய் கொண்ட குடும்ப பெண்களுக்கான திருமண உதவித் திட்டம்.'
  );

  const thalikkuRules = [
    { field: 'gender', op: 'EQUALS', val: 'female', en: 'Applicant must be the bride', ta: 'விண்ணப்பதாரர் மணப்பெண்ணாக இருக்க வேண்டும்', m: 1 },
    { field: 'age', op: 'GTE', val: '18', en: 'Bride must be at least 18 years of age at marriage', ta: 'மணப்பெண்ணுக்கு குறைந்தபட்சம் 18 வயது முடிந்திருக்க வேண்டும்', m: 1 },
    { field: 'annual_family_income', op: 'LTE', val: '72000', en: 'Family annual income must not exceed ₹72,000 (BPL limit)', ta: 'குடும்ப ஆண்டு வருமானம் ₹72,000க்கு மிகாமல் இருக்க வேண்டும்', m: 1 }
  ];
  thalikkuRules.forEach(r => insertRule.run('thalikku_thangam', r.field, r.op, r.val, r.en, r.ta, r.m));

  const thalikkuDocs = [
    { key: 'aadhaar_card', en: 'Aadhaar Card of Bride and Groom', ta: 'மணப்பெண் மற்றும் மணமகனின் ஆதார் அட்டை', m: 1 },
    { key: 'age_proof', en: 'Birth Certificate / 10th Transfer Certificate', ta: 'பிறப்புச் சான்றிதழ் / பள்ளி மாற்றுச் சான்றிதழ்', m: 1 },
    { key: 'income_certificate', en: 'Revenue Tahsildar BPL Income Certificate', ta: 'வட்டாட்சியர் வருமானச் சான்றிதழ்', m: 1 },
    { key: 'marriage_invitation', en: 'Marriage Invitation Card / Marriage Registration Receipt', ta: 'திருமணப் பத்திரிகை / திருமண பதிவு ரசீது', m: 1 }
  ];
  thalikkuDocs.forEach(d => insertDoc.run('thalikku_thangam', d.key, d.en, d.ta, d.en, d.ta, d.m));

  insertScheme.finalize();
  insertRule.finalize();
  insertDoc.finalize();

  console.log('✅ Successfully seeded 7 real verified welfare schemes into SQLite database!');
});

db.close();
