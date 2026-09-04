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
 * Match a profile against seeded Tamil Nadu schemes
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

        let totalRules = rules.length;
        let passedCount = 0;
        const passedRules = [];
        const failedRules = [];
        const missingInfoRules = [];

        for (const rule of rules) {
          const userVal = profile[rule.field_name];
          let isPassed = false;
          let isMissing = false;

          if (userVal === undefined || userVal === null) {
            isMissing = true;
          } else {
            switch (rule.operator) {
              case 'EQUALS':
                isPassed = String(userVal).toLowerCase() === String(rule.field_value).toLowerCase();
                break;
              case 'GTE':
                isPassed = Number(userVal) >= Number(rule.field_value);
                break;
              case 'LTE':
                isPassed = Number(userVal) <= Number(rule.field_value);
                break;
              case 'IN':
                const allowed = rule.field_value.split(',').map(s => s.trim().toLowerCase());
                isPassed = allowed.includes(String(userVal).toLowerCase());
                break;
              default:
                isPassed = false;
            }
          }

          if (isPassed) {
            passedCount++;
            passedRules.push({
              ruleId: rule.id,
              field: rule.field_name,
              en: rule.description_en,
              ta: rule.description_ta,
              userValue: userVal
            });
          } else if (isMissing) {
            missingInfoRules.push({
              ruleId: rule.id,
              field: rule.field_name,
              en: rule.description_en,
              ta: rule.description_ta
            });
          } else {
            failedRules.push({
              ruleId: rule.id,
              field: rule.field_name,
              en: rule.description_en,
              ta: rule.description_ta,
              userValue: userVal,
              expected: rule.field_value
            });
          }
        }

        const matchPct = totalRules > 0 ? Math.round((passedCount / totalRules) * 100) : 100;
        let status = 'INELIGIBLE';
        if (failedRules.length === 0 && missingInfoRules.length === 0) {
          status = 'ELIGIBLE';
        } else if (failedRules.length === 0 && missingInfoRules.length > 0) {
          status = 'PARTIALLY_ELIGIBLE';
        } else if (passedCount > 0 && failedRules.length <= 2) {
          status = 'PARTIALLY_ELIGIBLE';
        }

        results.push({
          schemeId: scheme.id,
          nameEn: scheme.name_en,
          nameTa: scheme.name_ta,
          departmentEn: scheme.department_en,
          departmentTa: scheme.department_ta,
          officialPortal: scheme.official_portal,
          benefitEn: scheme.benefit_en,
          benefitTa: scheme.benefit_ta,
          monthlyBenefitAmount: scheme.monthly_benefit_amount,
          annualBenefitAmount: scheme.annual_benefit_amount,
          policyNotes2026En: scheme.policy_notes_2026_en,
          policyNotes2026Ta: scheme.policy_notes_2026_ta,
          matchPercentage: matchPct,
          status,
          passedRules,
          failedRules,
          missingInfoRules,
          requiredDocuments: docs.map(d => ({
            key: d.doc_key,
            nameEn: d.doc_name_en,
            nameTa: d.doc_name_ta
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
