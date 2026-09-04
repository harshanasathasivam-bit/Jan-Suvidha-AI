/**
 * Client-Side Profile Parser
 * Converts natural language text and voice transcripts (English + Tamil)
 * into a structured citizen profile object for scheme matching.
 */

export function parseConversationToProfileClient(messages, currentProfile = {}) {
  const fullText = messages
    .map(m => m.text || '')
    .join(' ')
    .toLowerCase();

  const profile = {
    full_name: currentProfile.full_name || currentProfile.name || 'Citizen',
    name: currentProfile.name || currentProfile.full_name || 'Citizen',
    age: currentProfile.age ? Number(currentProfile.age) : null,
    gender: currentProfile.gender || null, // 'female', 'male', 'transgender'
    occupation: currentProfile.occupation || null, // 'farmer', 'student', 'daily_wage', 'homemaker'
    family_size: currentProfile.family_size ? Number(currentProfile.family_size) : 4,
    state_domicile: 'tamil_nadu',
    district: currentProfile.district || 'Thanjavur',
    annual_family_income: currentProfile.annual_family_income ? Number(currentProfile.annual_family_income) : null,
    ration_card_head: currentProfile.ration_card_head !== undefined ? !!currentProfile.ration_card_head : false,
    ration_card_holder: currentProfile.ration_card_holder !== undefined ? !!currentProfile.ration_card_holder : true,
    school_type_6_to_12: currentProfile.school_type_6_to_12 || null,
    education_course_type: currentProfile.education_course_type || null,
    education_level: currentProfile.education_level || null,
    last_exam_marks_pct: currentProfile.last_exam_marks_pct ? Number(currentProfile.last_exam_marks_pct) : 60,
    marital_status: currentProfile.marital_status || null,
    owns_pucca_house: currentProfile.owns_pucca_house !== undefined ? !!currentProfile.owns_pucca_house : false,
    disability_status: currentProfile.disability_status !== undefined ? !!currentProfile.disability_status : false,
    category: currentProfile.category || 'General'
  };

  // 1. Occupation extraction
  if (/farmer|agriculture|cultivator|small farmer|landless|விவசாயி|விவசாயம்/i.test(fullText)) {
    profile.occupation = 'farmer';
  } else if (/student|college|degree|pursuing|school|மாணவி|மாணவர்|படிப்பு/i.test(fullText)) {
    profile.occupation = 'student';
  } else if (/daily wage|coolie|worker|laborer|கூலி|தொழிலாளி/i.test(fullText)) {
    profile.occupation = 'daily_wage';
  } else if (/housewife|homemaker|head on ration card|குடும்பத் தலைவி|இல்லத்தரசி/i.test(fullText)) {
    profile.occupation = 'homemaker';
  }

  // 2. Gender extraction (Tamil + English)
  if (/woman|female|girl|lady|married woman|மாணவி|பெண்|தாயார்|அம்மா|மனைவி|தலைவி/i.test(fullText)) {
    profile.gender = 'female';
  } else if (/transgender|திருநங்கை/i.test(fullText)) {
    profile.gender = 'transgender';
  } else if (/man|male|boy|ஆண்|விவசாயி/i.test(fullText) && !profile.gender) {
    profile.gender = 'male';
  }

  // 3. Age extraction (e.g., "45 year old", "22 years", "age 30", "24 year old", "வயது 45")
  const ageMatch = fullText.match(/(\d{1,2})\s*(?:year|years|yr|yrs|வயது|வயசு)/i) || fullText.match(/(?:age|வயது)\s*(?:is|:)?\s*(\d{1,2})/i);
  if (ageMatch && ageMatch[1]) {
    profile.age = parseInt(ageMatch[1], 10);
  }

  // 4. Family size
  const famMatch = fullText.match(/(?:family of|family size|members|உறுப்பினர்கள்)\s*(?:is|:)?\s*(\d{1,2})/i);
  if (famMatch && famMatch[1]) {
    profile.family_size = parseInt(famMatch[1], 10);
  }

  // 5. Income extraction (e.g. 1.2 lakh, 1.5 lakh, 120000, 80k, 50,000, 1.2L, 70 ஆயிரம்)
  if (/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|லட்சம்)/i.test(fullText)) {
    const lMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|லட்சம்)/i);
    if (lMatch) profile.annual_family_income = Math.round(parseFloat(lMatch[1]) * 100000);
  } else if (/(\d+)\s*(?:thousand|k|ஆயிரம்)/i.test(fullText)) {
    const kMatch = fullText.match(/(\d+)\s*(?:thousand|k|ஆயிரம்)/i);
    if (kMatch) profile.annual_family_income = parseInt(kMatch[1], 10) * 1000;
  } else {
    const rawIncMatch = fullText.match(/(?:income|வருமானம்|salary)\s*(?:is|:)?\s*₹?\s*(\d[\d,]+)/i);
    if (rawIncMatch) {
      profile.annual_family_income = parseInt(rawIncMatch[1].replace(/,/g, ''), 10);
    }
  }

  // Default reasonable income if user states low income/support request without specific figure
  if (!profile.annual_family_income && /low income|bpl|welfare support|poverty|ஏழை|வருமானம் குறைவு/i.test(fullText)) {
    profile.annual_family_income = 120000;
  }

  // 6. Ration card head status
  if (/head of (?:family|household)|ration card head|head on ration card|குடும்பத் தலைவி|கார்டு தலைவி/i.test(fullText)) {
    profile.ration_card_head = true;
    profile.ration_card_holder = true;
  }

  // 7. School type (Government vs Private)
  if (/govt school|government school|tn govt school|6-12th in tn govt|அரசு பள்ளி|அரசுப்பள்ளி/i.test(fullText)) {
    profile.school_type_6_to_12 = 'tn_govt_school';
  } else if (/private school|மெட்ரிக்/i.test(fullText)) {
    profile.school_type_6_to_12 = 'private_school';
  }

  // 8. Higher education / college details
  if (/college|degree|diploma|university|கல்லூரி|பட்டப்படிப்பு/i.test(fullText)) {
    profile.education_course_type = 'regular_higher_education';
    if (!profile.education_level) profile.education_level = '12th_pass';
  }

  // 9. Disability status
  if (/disabled|disability|differently abled|handicapped|மாற்றுத்திறனாளி/i.test(fullText)) {
    profile.disability_status = true;
  }

  // 10. District extraction
  const tnDistricts = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Erode', 'Vellore', 'Thanjavur', 'Dindigul', 'Kanchipuram', 'Cuddalore',
    'Tiruvallur', 'Villupuram', 'Tiruppur', 'Karur', 'Nagapattinam'
  ];
  for (const dist of tnDistricts) {
    if (new RegExp(dist, 'i').test(fullText)) {
      profile.district = dist;
      break;
    }
  }

  // Fallback defaults if fields remain empty so scheme matcher gets complete object
  if (!profile.age) profile.age = 35;
  if (!profile.gender) profile.gender = 'female';
  if (!profile.annual_family_income) profile.annual_family_income = 120000;
  if (!profile.occupation) profile.occupation = 'Citizen';

  return profile;
}
