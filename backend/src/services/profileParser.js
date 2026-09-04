/**
 * Profile Parser Service
 * Turns natural conversation / voice transcripts (Tamil + English) into a structured profile object.
 */

export function parseConversationToProfile(messages, currentProfile = {}) {
  // Combine all messages into full conversation text
  const fullText = messages
    .map(m => m.text || '')
    .join(' ')
    .toLowerCase();

  const profile = {
    name: currentProfile.name || 'Citizen',
    age: currentProfile.age || null,
    gender: currentProfile.gender || null, // 'female', 'male', 'transgender'
    occupation: currentProfile.occupation || null, // 'farmer', 'student', 'worker', etc.
    family_size: currentProfile.family_size || 4,
    state_domicile: currentProfile.state_domicile || 'tamil_nadu',
    annual_family_income: currentProfile.annual_family_income !== undefined ? currentProfile.annual_family_income : null,
    ration_card_head: currentProfile.ration_card_head !== undefined ? currentProfile.ration_card_head : null,
    ration_card_holder: currentProfile.ration_card_holder !== undefined ? currentProfile.ration_card_holder : true,
    school_type_6_to_12: currentProfile.school_type_6_to_12 || null, // 'tn_govt_school', 'tn_govt_aided_school', 'private_school'
    education_course_type: currentProfile.education_course_type || null, // 'regular_higher_education', 'distance', 'school'
    education_level: currentProfile.education_level || null, // '10th_pass', '12th_pass', 'diploma', 'degree', 'below_10th'
    previous_exam_marks_pct: currentProfile.previous_exam_marks_pct !== undefined ? currentProfile.previous_exam_marks_pct : 60,
    marital_status: currentProfile.marital_status || null, // 'single', 'married', 'widowed'
    groom_age: currentProfile.groom_age || null,
    bpl_or_low_income: currentProfile.bpl_or_low_income !== undefined ? currentProfile.bpl_or_low_income : null,
    eligible_daughters_count: currentProfile.eligible_daughters_count || 1,
    owns_four_wheeler: currentProfile.owns_four_wheeler !== undefined ? currentProfile.owns_four_wheeler : false,
    owns_pucca_house: currentProfile.owns_pucca_house !== undefined ? currentProfile.owns_pucca_house : false,
    land_ownership_wet_acres: currentProfile.land_ownership_wet_acres || 0,
    land_ownership_dry_acres: currentProfile.land_ownership_dry_acres || 0,
    is_govt_employee_or_pensioner: currentProfile.is_govt_employee_or_pensioner !== undefined ? currentProfile.is_govt_employee_or_pensioner : false,
    district: currentProfile.district || 'Thanjavur'
  };

  // Occupation extraction
  if (/farmer|agriculture|cultivator|விவசாயி|விவசாயம்/i.test(fullText)) {
    profile.occupation = 'farmer';
  } else if (/student|மாணவி|மாணவர்|படிப்பு|college/i.test(fullText)) {
    profile.occupation = 'student';
  } else if (/daily wage|coolie|கூலி|தொழிலாளி/i.test(fullText)) {
    profile.occupation = 'daily_wage';
  }

  // Gender extraction (Tamil + English)
  if (/woman|female|girl|lady|பெண்|மாணவி|தாயார்|அம்மா|மனைவி/i.test(fullText)) {
    profile.gender = 'female';
  } else if (/transgender|திருநங்கை/i.test(fullText)) {
    profile.gender = 'transgender';
  } else if (/man|male|boy|ஆண்|விவசாயி/i.test(fullText) && !profile.gender) {
    profile.gender = 'male';
  }

  // Age extraction
  const ageMatch = fullText.match(/(\d{1,2})\s*(?:years|year|yrs|வயது|வயசு)/i) || fullText.match(/(?:age|வயது)\s*(?:is|:)?\s*(\d{1,2})/i);
  if (ageMatch && ageMatch[1]) {
    profile.age = parseInt(ageMatch[1], 10);
  }

  // Family size
  const famMatch = fullText.match(/(?:family of|family size|members|உறுப்பினர்கள்)\s*(?:is|:)?\s*(\d{1,2})/i);
  if (famMatch && famMatch[1]) {
    profile.family_size = parseInt(famMatch[1], 10);
  }

  // Income extraction (e.g. 1.2 lakh, 150000, 80k, 50,000, 1.2L, 2.5L, 70 ஆயிரம்)
  if (/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|லட்சம்)/i.test(fullText)) {
    const lMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|லட்சம்)/i);
    if (lMatch) profile.annual_family_income = parseFloat(lMatch[1]) * 100000;
  } else if (/(\d+)\s*(?:thousand|k|ஆயிரம்)/i.test(fullText)) {
    const kMatch = fullText.match(/(\d+)\s*(?:thousand|k|ஆயிரம்)/i);
    if (kMatch) profile.annual_family_income = parseInt(kMatch[1], 10) * 1000;
  } else {
    const rawIncMatch = fullText.match(/(?:income|வருமானம்|salary)\s*(?:is|:)?\s*₹?\s*(\d[\d,]+)/i);
    if (rawIncMatch) {
      profile.annual_family_income = parseInt(rawIncMatch[1].replace(/,/g, ''), 10);
    }
  }

  if (profile.annual_family_income !== null) {
    profile.bpl_or_low_income = profile.annual_family_income <= 120000;
  }

  // Ration card head status
  if (/head of (?:family|household)|ration card head|குடும்பத் தலைவி|கார்டு தலைவி/i.test(fullText)) {
    profile.ration_card_head = true;
  } else if (/wife of head|மனைவி/i.test(fullText)) {
    profile.ration_card_head = true;
  }

  // School type extraction
  if (/govt school|government school|அரசு பள்ளி|அரசுப்பள்ளி/i.test(fullText)) {
    profile.school_type_6_to_12 = 'tn_govt_school';
  } else if (/govt aided|aided school|அரசு உதவிபெறும் பள்ளி/i.test(fullText)) {
    profile.school_type_6_to_12 = 'tn_govt_aided_school';
  } else if (/private school|மெட்ரிக்|சுயநிதி/i.test(fullText)) {
    profile.school_type_6_to_12 = 'private_school';
  }

  // College / Higher education course
  if (/college|degree|diploma|iti|university|கல்லூரி|பட்டப்படிப்பு/i.test(fullText)) {
    profile.education_course_type = 'regular_higher_education';
  }

  // Marital status
  if (/married|திருமணமானவர்|மனைவி/i.test(fullText)) {
    profile.marital_status = 'married';
  } else if (/single|unmarried|studying|மாணவி|கன்னி/i.test(fullText)) {
    profile.marital_status = 'single';
  }

  // Groom age
  const groomAgeMatch = fullText.match(/(?:groom|husband|மணமகன்)\s*(?:age|வயது)?\s*(?:is|:)?\s*(\d{1,2})/i);
  if (groomAgeMatch) {
    profile.groom_age = parseInt(groomAgeMatch[1], 10);
  }

  // District extraction
  const tnDistricts = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul', 'Kanchipuram', 'Cuddalore', 'Tiruvallur', 'Villupuram'];
  for (const dist of tnDistricts) {
    if (new RegExp(dist, 'i').test(fullText)) {
      profile.district = dist;
      break;
    }
  }

  return profile;
}
