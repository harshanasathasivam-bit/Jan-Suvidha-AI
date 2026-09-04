import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db/database.sqlite');

function getDbConnection() {
  return new sqlite3.Database(dbPath);
}

/**
 * Match a profile against seeded real Tamil Nadu and Central schemes with Explainable Breakdown
 */
export async function matchProfileToSchemes(profile) {
  const db = getDbConnection();

  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM schemes WHERE is_active = 1`, async (err, schemes) => {
      if (err) return reject(err);

      const results = [];

      for (const scheme of schemes) {
        // Fetch rules
        const rules = await new Promise((res, rej) => {
          db.all(
            `SELECT * FROM eligibility_rules WHERE scheme_id = ?`,
            [scheme.id],
            (e, r) => (e ? rej(e) : res(r))
          );
        });

        // Fetch docs
        const docs = await new Promise((res, rej) => {
          db.all(
            `SELECT * FROM required_documents WHERE scheme_id = ?`,
            [scheme.id],
            (e, d) => (e ? rej(e) : res(d))
          );
        });

        const breakdown = [];
        const whyQualify = [];
        const needsVerification = [];
        let passWeight = 0;
        let totalWeight = rules.length || 1;

        for (const rule of rules) {
          const userVal = profile[rule.field_name];
          let status = 'UNKNOWN'; // 'PASS' | 'WARNING' | 'FAIL' | 'UNKNOWN'
          let detailEn = '';
          let detailTa = '';

          if (userVal === undefined || userVal === null) {
            status = 'UNKNOWN';
            detailEn = `Missing profile detail for ${rule.field_name}. Please provide this information.`;
            detailTa = `${rule.description_ta} பற்றிய தகவல் சுயவிவரத்தில் இல்லை.`;
            needsVerification.push({
              ruleId: rule.id,
              field: rule.field_name,
              en: `Missing info: ${rule.description_en} needs citizen verification`,
              ta: `தகவல் தேவை: ${rule.description_ta}`
            });
          } else {
            let matches = false;
            switch (rule.operator) {
              case 'EQUALS':
                matches = String(userVal).toLowerCase() === String(rule.field_value).toLowerCase();
                break;
              case 'GTE':
                matches = Number(userVal) >= Number(rule.field_value);
                break;
              case 'LTE':
                matches = Number(userVal) <= Number(rule.field_value);
                break;
              case 'IN':
                const allowed = rule.field_value.split(',').map(s => s.trim().toLowerCase());
                matches = allowed.includes(String(userVal).toLowerCase());
                break;
              default:
                matches = false;
            }

            if (matches) {
              // Check if close to boundary (e.g. income near limit) -> WARNING
              if (rule.operator === 'LTE' && rule.field_name.includes('income')) {
                const threshold = Number(rule.field_value);
                const userIncome = Number(userVal);
                if (userIncome > threshold * 0.9 && userIncome <= threshold) {
                  status = 'WARNING';
                  detailEn = `Annual income (₹${userIncome.toLocaleString()}) is close to scheme limit (₹${threshold.toLocaleString()}). Revenue certificate required.`;
                  detailTa = `வருமானம் வரம்பிற்கு அருகில் உள்ளது (வருமானச் சான்றிதழ் கட்டாயம்).`;
                  passWeight += 0.8;
                  needsVerification.push({
                    ruleId: rule.id,
                    field: rule.field_name,
                    en: `Income is within 10% of threshold; verify official income certificate.`,
                    ta: `வருமானச் சான்றிதழை வட்டாட்சியரிடம் உறுதிப்படுத்தவும்.`
                  });
                } else {
                  status = 'PASS';
                  detailEn = `Requirement satisfied (Income: ₹${userIncome.toLocaleString()} ≤ ₹${threshold.toLocaleString()}).`;
                  detailTa = `வருமானத் தகுதி பூர்த்தியடைந்தது.`;
                  passWeight += 1.0;
                  whyQualify.push({
                    en: `Your annual income (₹${userIncome.toLocaleString()}) is within the listed ₹${threshold.toLocaleString()} threshold.`,
                    ta: `உங்கள் குடும்ப ஆண்டு வருமானம் நிர்ணயிக்கப்பட்ட ₹${threshold.toLocaleString()} வரம்பிற்குள் உள்ளது.`
                  });
                }
              } else {
                status = 'PASS';
                detailEn = `Requirement satisfied.`;
                detailTa = `தகுதி நிபந்தனை பூர்த்தியடைந்தது.`;
                passWeight += 1.0;
                whyQualify.push({
                  en: rule.description_en,
                  ta: rule.description_ta
                });
              }
            } else {
              status = 'FAIL';
              detailEn = `Condition not met (Provided: ${userVal}, Expected: ${rule.field_value}).`;
              detailTa = `தகுதி நிபந்தனை பூர்த்தியாகவில்லை.`;
            }
          }

          breakdown.push({
            ruleId: rule.id,
            field: rule.field_name,
            status, // PASS, WARNING, FAIL, UNKNOWN
            descriptionEn: rule.description_en,
            descriptionTa: rule.description_ta,
            detailEn,
            detailTa,
            isMandatory: !!rule.is_mandatory
          });
        }

        const matchPercentage = Math.min(100, Math.max(0, Math.round((passWeight / totalWeight) * 100)));

        let status = 'INELIGIBLE';
        const hasFailures = breakdown.some(b => b.status === 'FAIL' && b.isMandatory);
        const hasUnknowns = breakdown.some(b => b.status === 'UNKNOWN');
        const hasWarnings = breakdown.some(b => b.status === 'WARNING');

        if (!hasFailures && !hasUnknowns && !hasWarnings && matchPercentage >= 85) {
          status = 'ELIGIBLE';
        } else if (!hasFailures && (hasUnknowns || hasWarnings || matchPercentage >= 60)) {
          status = 'PARTIALLY_ELIGIBLE';
        } else if (matchPercentage >= 50 && !hasFailures) {
          status = 'PARTIALLY_ELIGIBLE';
        }

        results.push({
          schemeId: scheme.id,
          nameEn: scheme.name_en,
          nameTa: scheme.name_ta,
          departmentEn: scheme.department_en,
          departmentTa: scheme.department_ta,
          government: scheme.government || 'Government of Tamil Nadu',
          category: scheme.category || 'Social Security',
          descriptionEn: scheme.description_en,
          descriptionTa: scheme.description_ta,
          benefitEn: scheme.benefit_en,
          benefitTa: scheme.benefit_ta,
          monthlyBenefitAmount: scheme.monthly_benefit_amount,
          annualBenefitAmount: scheme.annual_benefit_amount,
          applicationProcessEn: scheme.application_process_en,
          applicationProcessTa: scheme.application_process_ta,
          officialSource: scheme.official_source || 'Official Government Source',
          officialUrl: scheme.official_url || scheme.official_portal,
          lastVerified: scheme.last_verified || 'August 2026',
          schemeStatus: scheme.status || 'ACTIVE',
          policyNotes2026En: scheme.policy_notes_2026_en,
          policyNotes2026Ta: scheme.policy_notes_2026_ta,
          matchPercentage,
          status,
          disclaimerEn: "You may be eligible based on the information provided. Final eligibility is determined by the concerned government authority.",
          disclaimerTa: "வழங்கப்பட்ட தகவல்களின் அடிப்படையில் நீங்கள் தகுதி பெறலாம். இறுதி தகுதியை சம்பந்தப்பட்ட அரசு துறை அதிகாரிகளே முடிவு செய்வார்கள்.",
          breakdown,
          whyQualify,
          needsVerification,
          passedRules: breakdown.filter(b => b.status === 'PASS').map(b => ({ en: b.descriptionEn, ta: b.descriptionTa })),
          failedRules: breakdown.filter(b => b.status === 'FAIL').map(b => ({ en: b.descriptionEn, ta: b.descriptionTa, userValue: profile[b.field] })),
          missingInfoRules: breakdown.filter(b => b.status === 'UNKNOWN').map(b => ({ en: b.descriptionEn, ta: b.descriptionTa })),
          requiredDocuments: docs.map(d => ({
            key: d.doc_key,
            nameEn: d.doc_name_en,
            nameTa: d.doc_name_ta,
            isMandatory: !!d.is_mandatory
          }))
        });
      }

      // Sort by match percentage descending
      results.sort((a, b) => b.matchPercentage - a.matchPercentage);

      db.close();
      resolve(results);
    });
  });
}
