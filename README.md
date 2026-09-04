# Jan Suvidha AI — Tamil Nadu Citizen Welfare Assistant

Jan Suvidha AI is a full-stack, PWA-enabled web application built to help Tamil Nadu citizens discover state welfare schemes, evaluate grounded eligibility against real government rules, inspect document quality via OCR, and generate printable application dossiers.

---

## 🌟 Seeded Tamil Nadu Welfare Schemes (Verified 2026 Rules)

1. **Kalaignar Magalir Urimai Thogai Thittam (KMUT)**
   - **Department**: Social Welfare & Women Empowerment | [kmut.tn.gov.in](https://kmut.tn.gov.in)
   - **Benefit**: ₹1,000/month (₹12,000/year) via DBT
   - **Rules**: Female, Age 21+, Head of family on Ration card, TN domicile, Annual income < ₹2.5L, max 5 acres wetland / 10 acres dryland, no 4-wheeler car.

2. **Pudhumai Penn Thittam**
   - **Department**: Social Welfare & Women Empowerment | [tnsocialwelfare.tn.gov.in](https://tnsocialwelfare.tn.gov.in)
   - **Benefit**: ₹1,000/month until completion of UG/Diploma/ITI
   - **Rules**: Female student, Studied 6th–12th in TN Govt or Govt-aided school, enrolled in regular higher education.

3. **Free Bus Travel Scheme (Magalir Payanam)**
   - **Department**: Transport Department | [tnstc.in](https://tnstc.in)
   - **Benefit**: Zero-ticket travel on ordinary TNSTC/MTC town buses
   - **Rules**: Woman or Transgender person, permanent resident of TN.

4. **Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)**
   - **Department**: Health & Family Welfare | [cmchistn.com](https://cmchistn.com)
   - **Benefit**: Cashless treatment up to ₹5,000,000/family/year across 1,090+ hospitals
   - **Rules**: Family listed on TN Smart Ration card, Annual family income < ₹1,20,000.

5. **Thalikku Thangam Thittam (Marriage Assistance)**
   - **Department**: Social Welfare & Women Empowerment | [tnsocialwelfare.tn.gov.in](https://tnsocialwelfare.tn.gov.in)
   - **Benefit**: ₹25,000 / ₹50,000 cheque + 8g 22-carat Gold Coin
   - **Rules**: Bride Age 18+, Groom Age 21+, BPL income, 10th/Degree pass.

---

## 🚀 API Endpoints

- `GET /api/schemes`: Fetch seeded schemes with eligibility rules, document requirements, and 2026 notes.
- `POST /api/profile`: Extract structured profile JSON from natural language (English + Tamil).
- `POST /api/match`: Grounded eligibility engine that evaluates profile against SQLite database rules.
- `POST /api/document-check`: Upload document image for OCR, blur analysis, and field detection.

---

## 🛠 Local Setup & Running

```bash
# 1. Install & Seed Backend Database
cd backend
npm install
npm run seed

# 2. Build Frontend
cd ../frontend
npm install
npm run build

# 3. Start Unified Express App
cd ../backend
npm start
```

App will run at `http://localhost:5000`.

---

## 🌐 Live Deployment Instructions

- **Render.com / Railway**: Connect repo and use `render.yaml` build pipeline.
- **Vercel**: Deploy `/frontend` dist folder with `POST /api` rewrite pointing to backend server URL.
