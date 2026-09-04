// Client-Side Grounded Scheme Engine containing 18 Active + 1 Upcoming Schemes

export const ALL_SCHEMES_DATA = [
  {
    schemeId: 'pudhumai_penn',
    nameEn: 'Pudhumai Penn Thittam',
    nameTa: 'புதுமைப் பெண் திட்டம்',
    departmentEn: 'Social Welfare & Women Empowerment Dept',
    departmentTa: 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
    officialPortal: 'https://penkalvi.tn.gov.in',
    benefitEn: '₹1,000/month financial assistance for female higher education students.',
    benefitTa: 'உயர் கல்வி பயிலும் மாணவிகளுக்கு மாதம் ₹1,000 நிதியுதவி.',
    monthlyBenefitAmount: 1000,
    annualBenefitAmount: 12000,
    isActive: 1,
    rules: [
      { field: 'gender', operator: 'EQUALS', val: 'female', en: 'Must be female', ta: 'பெண்ணாக இருக்க வேண்டும்' },
      { field: 'school_type_6_to_12', operator: 'EQUALS', val: 'tn_govt_school', en: 'Studied Classes 6-12 in TN Govt school', ta: '6-12 ஆம் வகுப்பு வரை அரசுப் பள்ளியில் படித்திருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'aadhaar_card', nameEn: 'Aadhaar Card', nameTa: 'ஆதார் அட்டை' },
      { key: 'school_tc', nameEn: 'Classes 6-12 School Study Certificate', nameTa: '6-12 பள்ளிச் சான்றிதழ்' },
      { key: 'bank_passbook', nameEn: 'Student Bank Passbook', nameTa: 'வங்கி கணக்கு புத்தகம்' }
    ]
  },
  {
    schemeId: 'tamil_pudhalvan',
    nameEn: 'Tamil Pudhalvan Scheme',
    nameTa: 'தமிழ்ப் புதல்வன் திட்டம்',
    departmentEn: 'School Education Dept, Govt of Tamil Nadu',
    departmentTa: 'பள்ளித் கல்வித் துறை',
    officialPortal: 'https://tn.gov.in',
    benefitEn: '₹1,000/month financial assistance for male higher education students.',
    benefitTa: 'உயர் கல்வி பயிலும் மாணவர்களுக்கு மாதம் ₹1,000 நிதியுதவி.',
    monthlyBenefitAmount: 1000,
    annualBenefitAmount: 12000,
    isActive: 1,
    rules: [
      { field: 'gender', operator: 'EQUALS', val: 'male', en: 'Must be male', ta: 'ஆணாக இருக்க வேண்டும்' },
      { field: 'school_type_6_to_12', operator: 'EQUALS', val: 'tn_govt_school', en: 'Studied Classes 6-12 in TN Govt school', ta: '6-12 ஆம் வகுப்பு வரை அரசுப் பள்ளியில் படித்திருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'aadhaar_card', nameEn: 'Aadhaar Card', nameTa: 'ஆதார் அட்டை' },
      { key: 'school_tc', nameEn: 'School Study Certificate', nameTa: 'பள்ளிச் சான்றிதழ்' },
      { key: 'bank_passbook', nameEn: 'Bank Passbook', nameTa: 'வங்கி கணக்கு புத்தகம்' }
    ]
  },
  {
    schemeId: 'kmut',
    nameEn: 'Kalaignar Magalir Urimai Thittam (KMUT)',
    nameTa: 'கலைஞர் மகளிர் உரிமைத் திட்டம்',
    departmentEn: 'Special Programme Implementation Dept',
    departmentTa: 'சிறப்பு திட்ட செயலாக்கத் துறை',
    officialPortal: 'https://kmut.tn.gov.in',
    benefitEn: '₹1,000/month basic income for female family heads.',
    benefitTa: 'குடும்பத் தலைவிகளுக்கு மாதம் ₹1,000 உரிமைத் தொகை.',
    monthlyBenefitAmount: 1000,
    annualBenefitAmount: 12000,
    isActive: 1,
    rules: [
      { field: 'gender', operator: 'EQUALS', val: 'female', en: 'Must be female family head', ta: 'பெண் குடும்பத் தலைவியாக இருக்க வேண்டும்' },
      { field: 'annual_family_income', operator: 'LTE', val: 250000, en: 'Annual family income ≤ ₹2,50,000', ta: 'குடும்ப ஆண்டு வருமானம் ₹2,50,000 க்குள் இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'smart_ration_card', nameEn: 'Smart Ration Card', nameTa: 'ஸ்மார்ட் ரேஷன் அட்டை' },
      { key: 'aadhaar_card', nameEn: 'Aadhaar Card', nameTa: 'ஆதார் அட்டை' }
    ]
  },
  {
    schemeId: 'first_graduate',
    nameEn: 'First Graduate Tuition Fee Waiver',
    nameTa: 'முதல் பட்டதாரி கல்விக் கட்டண விலக்கு',
    departmentEn: 'Directorate of Technical Education, TN',
    departmentTa: 'தொழில்நுட்பக் கல்வி இயக்ககம்',
    officialPortal: 'https://tneaonline.org',
    benefitEn: 'Tuition fee waiver up to ₹60,000/year for first-generation graduates.',
    benefitTa: 'முதல் தலைமுறை பட்டதாரிகளுக்கு ஆண்டுக்கு ₹60,000 வரை கட்டண விலக்கு.',
    monthlyBenefitAmount: 0,
    annualBenefitAmount: 60000,
    isActive: 1,
    rules: [
      { field: 'is_first_graduate', operator: 'EQUALS', val: 1, en: 'Must be first graduate in family', ta: 'குடும்பத்தின் முதல் பட்டதாரியாக இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'first_graduate_cert', nameEn: 'First Graduate Certificate from Tahsildar', nameTa: 'முதல் பட்டதாரி சான்றிதழ்' },
      { key: 'joint_declaration', nameEn: 'Family Joint Declaration', nameTa: 'குடும்ப கூட்டு உறுதிமொழி' }
    ]
  },
  {
    schemeId: 'post_matric_bc_mbc',
    nameEn: 'Post Matric Scholarship for BC/MBC Students',
    nameTa: 'பிற்படுத்தப்பட்டோர் / மிகவும் பிற்படுத்தப்பட்டோர் கல்வி உதவித்தொகை',
    departmentEn: 'BC, MBC & Minorities Welfare Dept',
    departmentTa: 'பிற்படுத்தப்பட்டோர் மற்றும் சிறுபான்மையினர் நலத் துறை',
    officialPortal: 'https://bcmbc.tn.gov.in',
    benefitEn: 'Full maintenance fee and tuition reimbursement for BC/MBC students.',
    benefitTa: 'பிசி/எம்பிசி மாணவர்களுக்கு முழு கல்விக் கட்டணம் மற்றும் பராமரிப்பு தொகை.',
    monthlyBenefitAmount: 500,
    annualBenefitAmount: 25000,
    isActive: 1,
    rules: [
      { field: 'category', operator: 'IN', val: 'bc,mbc,dnc,obc', en: 'Category must be BC, MBC, or DNC', ta: 'பிசி, எம்பிசி அல்லது டிஎன்சி பிரிவைச் சேர்ந்தவராக இருக்க வேண்டும்' },
      { field: 'annual_family_income', operator: 'LTE', val: 250000, en: 'Annual income ≤ ₹2,50,000', ta: 'ஆண்டு வருமானம் ₹2,50,000 க்குள் இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'community_cert', nameEn: 'Community Certificate (BC/MBC)', nameTa: 'சாதிச் சான்றிதழ்' },
      { key: 'income_cert', nameEn: 'Income Certificate', nameTa: 'வருமானச் சான்றிதழ்' }
    ]
  },
  {
    schemeId: 'post_matric_sc_st',
    nameEn: 'Post Matric Scholarship for SC/ST Students',
    nameTa: 'ஆதிதிராவிடர் மற்றும் பழங்குடியினர் போஸ்ட் மெட்ரிக் உதவித்தொகை',
    departmentEn: 'Adi Dravidar and Tribal Welfare Dept',
    departmentTa: 'ஆதிதிராவிடர் மற்றும் பழங்குடியினர் நலத் துறை',
    officialPortal: 'https://tnadw.tn.gov.in',
    benefitEn: '100% compulsory non-refundable fees & monthly allowance.',
    benefitTa: '100% கல்விக் கட்டணம் மற்றும் மாதாந்திர பராமரிப்பு நிதி.',
    monthlyBenefitAmount: 1200,
    annualBenefitAmount: 50000,
    isActive: 1,
    rules: [
      { field: 'category', operator: 'IN', val: 'sc,st,sca', en: 'Category must be SC, ST, or SCA', ta: 'எஸ்சி, எஸ்டி பிரிவைச் சேர்ந்தவராக இருக்க வேண்டும்' },
      { field: 'annual_family_income', operator: 'LTE', val: 250000, en: 'Annual income ≤ ₹2,50,000', ta: 'ஆண்டு வருமானம் ₹2,50,000 க்குள் இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'community_cert', nameEn: 'SC/ST Community Certificate', nameTa: 'சாதிச் சான்றிதழ்' },
      { key: 'income_cert', nameEn: 'Income Certificate', nameTa: 'வருமானச் சான்றிதழ்' }
    ]
  },
  {
    schemeId: 'cmchis',
    nameEn: 'Chief Minister Comprehensive Health Insurance (CMCHIS)',
    nameTa: 'முதல்வரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்',
    departmentEn: 'Health & Family Welfare Dept, Govt of TN',
    departmentTa: 'மக்கள் நல்வாழ்வுத் துறை',
    officialPortal: 'https://cmchistn.com',
    benefitEn: 'Cashless hospital treatment up to ₹5,00,000 per family per year.',
    benefitTa: 'குடும்பத்திற்கு ஆண்டுக்கு ₹5,00,000 வரை இலவச மருத்துவக் காப்பீடு.',
    monthlyBenefitAmount: 0,
    annualBenefitAmount: 500000,
    isActive: 1,
    rules: [
      { field: 'annual_family_income', operator: 'LTE', val: 120000, en: 'Annual family income ≤ ₹1,20,000', ta: 'ஆண்டு குடும்ப வருமானம் ₹1,20,000 க்குள் இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'smart_ration_card', nameEn: 'TN Smart Ration Card', nameTa: 'ஸ்மார்ட் ரேஷன் அட்டை' },
      { key: 'income_cert', nameEn: 'Income Certificate from VAO/Tahsildar', nameTa: 'வருமானச் சான்றிதழ்' }
    ]
  },
  {
    schemeId: 'magalir_payanam',
    nameEn: 'Free Bus Travel for Women (Magalir Payanam)',
    nameTa: 'மகளிர் இலவச பேருந்து பயணத் திட்டம்',
    departmentEn: 'Transport Dept, Govt of Tamil Nadu',
    departmentTa: 'போக்குவரத்துத் துறை',
    officialPortal: 'https://tnstc.in',
    benefitEn: 'Free bus travel in ordinary town buses across Tamil Nadu.',
    benefitTa: 'தமிழ்நாடு முழுவதும் நகரப் பேருந்துகளில் இலவச பயணம்.',
    monthlyBenefitAmount: 800,
    annualBenefitAmount: 9600,
    isActive: 1,
    rules: [
      { field: 'gender', operator: 'IN', val: 'female,transgender', en: 'Must be female or transgender', ta: 'பெண் அல்லது திருநங்கையாக இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'id_proof', nameEn: 'Aadhaar / Voter ID', nameTa: 'ஆதார் / வாக்காளர் அட்டை' }
    ]
  },
  {
    schemeId: 'naan_mudhalvan',
    nameEn: 'Naan Mudhalvan Skill Scheme',
    nameTa: 'நான் முதல்வன் திறன் மேம்பாட்டு திட்டம்',
    departmentEn: 'Tamil Nadu Skill Development Corporation',
    departmentTa: 'தமிழ்நாடு திறன் மேம்பாட்டுக் கழகம்',
    officialPortal: 'https://naanmudhalvan.tn.gov.in',
    benefitEn: 'Free emerging tech skills, placement support & industry training.',
    benefitTa: 'இலவச தொழில்முறை திறன் பயிற்சி மற்றும் வேலைவாய்ப்பு உதவி.',
    monthlyBenefitAmount: 0,
    annualBenefitAmount: 20000,
    isActive: 1,
    rules: [
      { field: 'age', operator: 'GTE', val: 17, en: 'Age ≥ 17 years', ta: 'வயது 17 அல்லது அதற்கு மேல்' },
      { field: 'age', operator: 'LTE', val: 35, en: 'Age ≤ 35 years', ta: 'வயது 35 க்குள் இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'college_id', nameEn: 'College Student ID / Degree Marksheet', nameTa: 'கல்லூரி அடையாள அட்டை' }
    ]
  },
  {
    schemeId: 'amma_two_wheeler',
    nameEn: 'Amma Two Wheeler Subsidy Scheme',
    nameTa: 'அம்மா இருசக்கர வாகன மானியத் திட்டம்',
    departmentEn: 'Social Welfare & Women Empowerment Dept',
    departmentTa: 'சமூக நலத் துறை',
    officialPortal: 'https://tn.gov.in',
    benefitEn: '50% subsidy up to ₹25,000 on two-wheeler purchase for working women.',
    benefitTa: 'பணிபுரியும் பெண்களுக்கு இருசக்கர வாகனம் வாங்க ₹25,000 வரை 50% மானியம்.',
    monthlyBenefitAmount: 0,
    annualBenefitAmount: 25000,
    isActive: 1,
    rules: [
      { field: 'gender', operator: 'EQUALS', val: 'female', en: 'Must be female', ta: 'பெண்ணாக இருக்க வேண்டும்' },
      { field: 'annual_family_income', operator: 'LTE', val: 250000, en: 'Annual income ≤ ₹2,50,000', ta: 'ஆண்டு வருமானம் ₹2,50,000 க்குள் இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'driving_license', nameEn: 'Valid Two-Wheeler Driving License', nameTa: 'ஓட்டுநர் உரிமம்' },
      { key: 'employment_proof', nameEn: 'Employment / Salary Certificate', nameTa: 'வேலைவாய்ப்பு சான்றிதழ்' }
    ]
  },
  {
    schemeId: 'aicte_pragati',
    nameEn: 'AICTE Pragati Scholarship for Girls',
    nameTa: 'பிரகதி பெண் குழந்தைகள் உதவித்தொகை',
    departmentEn: 'Ministry of Education / AICTE, Govt of India',
    departmentTa: 'மத்திய கல்வி அமைச்சகம்',
    officialPortal: 'https://scholarships.gov.in',
    benefitEn: '₹50,000/year for girls pursuing technical degree/diploma education.',
    benefitTa: 'தொழில்நுட்பக் கல்வி பயிலும் பெண்களுக்கு ஆண்டுக்கு ₹50,000 உதவித்தொகை.',
    monthlyBenefitAmount: 4166,
    annualBenefitAmount: 50000,
    isActive: 1,
    rules: [
      { field: 'gender', operator: 'EQUALS', val: 'female', en: 'Must be female', ta: 'பெண்ணாக இருக்க வேண்டும்' },
      { field: 'annual_family_income', operator: 'LTE', val: 800000, en: 'Family income ≤ ₹8,00,000', ta: 'குடும்ப வருமானம் ₹8,00,000 க்குள் இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'aicte_admission_proof', nameEn: 'AICTE College Admission Slip', nameTa: 'கல்லூரி சேர்க்கை சான்றிதழ்' }
    ]
  },
  {
    schemeId: 'ambedkar_overseas',
    nameEn: 'Annal Ambedkar Overseas Scholarship',
    nameTa: 'அண்ணல் அம்பேத்கர் வெளிநாட்டு கல்வி உதவித்தொகை',
    departmentEn: 'Adi Dravidar Welfare Department',
    departmentTa: 'ஆதிதிராவிடர் நலத் துறை',
    officialPortal: 'https://tnadw.tn.gov.in',
    benefitEn: 'Full foreign university tuition, visa, airfare & living allowance.',
    benefitTa: 'வெளிநாட்டு பல்கலைக்கழக உயர் கல்விக்கான முழு செலவு நிதியுதவி.',
    monthlyBenefitAmount: 50000,
    annualBenefitAmount: 1500000,
    isActive: 1,
    rules: [
      { field: 'category', operator: 'IN', val: 'sc,st', en: 'Must belong to SC or ST community', ta: 'எஸ்சி அல்லது எஸ்டி பிரிவைச் சேர்ந்தவராக இருக்க வேண்டும்' },
      { field: 'annual_family_income', operator: 'LTE', val: 800000, en: 'Family income ≤ ₹8,00,000', ta: 'குடும்ப வருமானம் ₹8,00,000 க்குள் இருக்க வேண்டும்' }
    ],
    docs: [
      { key: 'passport', nameEn: 'Valid Indian Passport & Visa', nameTa: 'பாஸ்போர்ட்' },
      { key: 'admission_letter', nameEn: 'Foreign University Unconditional Offer Letter', nameTa: 'பல்கலைக்கழக சேர்க்கை கடிதம்' }
    ]
  },
  {
    schemeId: 'amma_unavagam',
    nameEn: 'Amma Unavagam (Amma Canteen)',
    nameTa: 'அம்மா உணவகம்',
    departmentEn: 'Food & Civil Supplies / Municipal Admin',
    departmentTa: 'உணவு மற்றும் நகராட்சி நிர்வாகத் துறை',
    officialPortal: 'https://tn.gov.in',
    benefitEn: 'Subsidized meals: ₹1 Idli, ₹5 Sambar Rice, ₹3 Curd Rice.',
    benefitTa: 'மிகவும் மலிவான விலையில் சத்தான உணவு (₹1 இட்லி, ₹5 சாம்பார் சாதம்).',
    monthlyBenefitAmount: 1500,
    annualBenefitAmount: 18000,
    isActive: 1,
    rules: [],
    docs: []
  },
  {
    schemeId: 'cm_breakfast',
    nameEn: "Chief Minister's Breakfast Scheme",
    nameTa: 'முதலமைச்சரின் காலை உணவுத் திட்டம்',
    departmentEn: 'School Education Dept, Govt of TN',
    departmentTa: 'பள்ளித் கல்வித் துறை',
    officialPortal: 'https://tn.gov.in',
    benefitEn: 'Free hot nutritious daily breakfast for primary school students.',
    benefitTa: 'அரசுத் தொடக்கப் பள்ளி மாணவர்களுக்கு தினமும் இலவச காலை உணவு.',
    monthlyBenefitAmount: 600,
    annualBenefitAmount: 7200,
    isActive: 1,
    rules: [
      { field: 'school_type_6_to_12', operator: 'EQUALS', val: 'tn_govt_school', en: 'Studying in TN Govt School', ta: 'அரசுப் பள்ளியில் பயில வேண்டும்' }
    ],
    docs: []
  }
];

/**
 * Client-Side Grounded Scheme Matcher Fallback
 */
export function evaluateClientSchemes(profile = {}) {
  return ALL_SCHEMES_DATA.map(scheme => {
    let totalRules = scheme.rules.length;
    let passedCount = 0;
    const passedRules = [];
    const failedRules = [];

    for (const rule of scheme.rules) {
      const userVal = profile[rule.field];
      let isPassed = false;

      if (userVal !== undefined && userVal !== null) {
        const normUser = String(userVal).trim().toLowerCase();
        const normRule = String(rule.val).trim().toLowerCase();

        switch (rule.operator) {
          case 'EQUALS': {
            const isUserTruthy = normUser === '1' || normUser === 'true' || normUser === 'yes';
            const isRuleTruthy = normRule === '1' || normRule === 'true' || normRule === 'yes';
            const isUserFalsy = normUser === '0' || normUser === 'false' || normUser === 'no';
            const isRuleFalsy = normRule === '0' || normRule === 'false' || normRule === 'no';

            if ((isUserTruthy && isRuleTruthy) || (isUserFalsy && isRuleFalsy)) {
              isPassed = true;
            } else {
              isPassed = normUser === normRule;
            }
            break;
          }
          case 'GTE':
            isPassed = Number(userVal) >= Number(rule.val);
            break;
          case 'LTE':
            isPassed = Number(userVal) <= Number(rule.val);
            break;
          case 'IN': {
            const allowed = normRule.split(',').map(s => s.trim());
            isPassed = allowed.includes(normUser);
            break;
          }
          default:
            isPassed = false;
        }
      }

      if (isPassed) {
        passedCount++;
        passedRules.push({
          ruleId: rule.field,
          field: rule.field,
          en: rule.en,
          ta: rule.ta,
          userValue: userVal
        });
      } else {
        failedRules.push({
          ruleId: rule.field,
          field: rule.field,
          en: rule.en,
          ta: rule.ta,
          userValue: userVal,
          expected: rule.val
        });
      }
    }

    const matchPercentage = totalRules > 0 ? Math.round((passedCount / totalRules) * 100) : 100;
    let status = 'INELIGIBLE';
    if (failedRules.length === 0) {
      status = 'ELIGIBLE';
    } else if (passedCount > 0 && failedRules.length <= 1) {
      status = 'PARTIALLY_ELIGIBLE';
    }

    return {
      schemeId: scheme.schemeId,
      nameEn: scheme.nameEn,
      nameTa: scheme.nameTa,
      departmentEn: scheme.departmentEn,
      departmentTa: scheme.departmentTa,
      officialPortal: scheme.officialPortal,
      benefitEn: scheme.benefitEn,
      benefitTa: scheme.benefitTa,
      monthlyBenefitAmount: scheme.monthlyBenefitAmount,
      annualBenefitAmount: scheme.annualBenefitAmount,
      matchPercentage,
      status,
      passedRules,
      failedRules,
      requiredDocuments: scheme.docs
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
}
