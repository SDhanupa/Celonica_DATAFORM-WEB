/* ──────────────────────────────────────────────────────────────────────────
   Industry survey — validation & verification logic
   Pure, framework-agnostic. `L(en, si, ta?)` supplies localized messages.
   ────────────────────────────────────────────────────────────────────────── */

export type FormValues = Record<string, string>;
export type Errors = Record<string, string>;
export type Translate = (en: string, si: string, ta?: string) => string;

export const TOTAL_STEPS = 13;

/* ── NIC parsing (also used to prefill DOB/age on the page) ───────────────── */
export const extractNICDetails = (nic: string): { dob: string; age: string } => {
  let year = 0;
  let dayText = 0;
  const cleanNic = (nic || '').trim().toUpperCase();

  if (cleanNic.length === 10) {
    year = 1900 + parseInt(cleanNic.substring(0, 2), 10);
    dayText = parseInt(cleanNic.substring(2, 5), 10);
  } else if (cleanNic.length === 12) {
    year = parseInt(cleanNic.substring(0, 4), 10);
    dayText = parseInt(cleanNic.substring(4, 7), 10);
  } else if (cleanNic.length === 9) {
    year = 1900 + parseInt(cleanNic.substring(0, 2), 10);
    dayText = parseInt(cleanNic.substring(2, 5), 10);
  } else {
    return { dob: '', age: '' };
  }

  if (isNaN(year) || isNaN(dayText)) return { dob: '', age: '' };
  if (dayText > 500) dayText -= 500;
  if (dayText < 1 || dayText > 366) return { dob: '', age: '' };

  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  if (!isLeapYear(year) && dayText > 59) dayText -= 1;

  const dob = new Date(year, 0);
  dob.setDate(dayText);

  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);
  const age = Math.abs(age_dt.getUTCFullYear() - 1970);

  return { dob: dob.toLocaleDateString(), age: age.toString() };
};

/* ── Low-level predicates ─────────────────────────────────────────────────── */
const isBlank = (s?: string) => !s || !s.trim();
const digitsOnly = (s: string) => (s || '').replace(/\D/g, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidNIC = (s: string) => {
  const c = (s || '').trim().toUpperCase();
  if (!/^(\d{9}[VX]?|\d{12})$/.test(c)) return false;
  const { dob, age } = extractNICDetails(c);
  return !!(dob && age);
};

export const isValidPhone = (s: string) => {
  const d = digitsOnly(s);
  // Sri Lankan mobile/land: 10 local digits (0XXXXXXXXX) or 11 with 94 country code.
  return /^0\d{9}$/.test(d) || /^94\d{9}$/.test(d);
};

export const isValidEmail = (s: string) => EMAIL_RE.test((s || '').trim());
const isCount = (s: string) => /^\d+$/.test(s.trim()); // non-negative integer
const asNumber = (s: string) => Number((s || '').trim());

/* ──────────────────────────────────────────────────────────────────────────
   Per-step validation. Returns { fieldId: message } for the given step.
   ────────────────────────────────────────────────────────────────────────── */
export function getStepErrors(step: number, fv: FormValues, L: Translate): Errors {
  const e: Errors = {};

  const REQ = L('This field is required', 'මෙම ක්ෂේත්‍රය අවශ්‍යයි', 'இந்த புலம் தேவை');
  const SEL = L('Please select an option', 'කරුණාකර විකල්පයක් තෝරන්න', 'ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்');
  const PICK = L('Select at least one option', 'අවම වශයෙන් එකක් තෝරන්න', 'குறைந்தது ஒன்றைத் தேர்ந்தெடுக்கவும்');
  const NUM = L('Enter a valid number', 'වලංගු අංකයක් ඇතුළත් කරන්න', 'சரியான எண்ணை உள்ளிடவும்');
  const WHOLE = L('Enter a whole number (0 or more)', 'නිඛිල සංඛ්‍යාවක් ඇතුළත් කරන්න (0 හෝ වැඩි)', 'முழு எண்ணை உள்ளிடவும்');

  const req = (id: string, msg = REQ) => { if (isBlank(fv[id])) e[id] = msg; };
  const pick = (id: string) => { if (isBlank(fv[id]) || fv[id].split(', ').filter(Boolean).length === 0) e[id] = PICK; };
  const count = (id: string, required = false) => {
    const val = fv[id];
    if (isBlank(val)) { if (required) e[id] = REQ; return; }
    if (!isCount(val)) e[id] = WHOLE;
  };
  const numRange = (id: string, min: number, max: number, required = false) => {
    const val = fv[id];
    if (isBlank(val)) { if (required) e[id] = REQ; return; }
    const n = asNumber(val);
    if (!isFinite(n)) e[id] = NUM;
    else if (n < min || n > max) e[id] = L(`Enter a value between ${min} and ${max}`, `${min} සහ ${max} අතර අගයක් ඇතුළත් කරන්න`, `${min} முதல் ${max} வரை உள்ளிடவும்`);
  };

  switch (step) {
    case 0: {
      req('q_owner_name');
      req('q_gender', SEL);
      if (isBlank(fv['q_nic'])) e['q_nic'] = REQ;
      else if (!isValidNIC(fv['q_nic'])) e['q_nic'] = L('Enter a valid NIC number', 'වලංගු ජා.හැ. අංකයක් ඇතුළත් කරන්න', 'சரியான தேசிய அடையாள எண்ணை உள்ளிடவும்');
      if (isBlank(fv['q_mobile'])) e['q_mobile'] = REQ;
      else if (!isValidPhone(fv['q_mobile'])) e['q_mobile'] = L('Enter a valid phone number', 'වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න', 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்');
      if (!isBlank(fv['q_whatsapp']) && !isValidPhone(fv['q_whatsapp'])) e['q_whatsapp'] = L('Enter a valid phone number', 'වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න', 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்');
      if (!isBlank(fv['q_email']) && !isValidEmail(fv['q_email'])) e['q_email'] = L('Enter a valid email address', 'වලංගු විද්‍යුත් තැපෑලක් ඇතුළත් කරන්න', 'சரியான மின்னஞ்சலை உள்ளிடவும்');
      count('q_experience');
      break;
    }
    case 1: {
      req('q_legal_status', SEL);
      if (fv['q_legal_status'] === '7. වෙනත් (සඳහන් කරන්න)') req('q_legal_status_other');
      req('q_is_registered', SEL);
      if (fv['q_is_registered'] === '1. ඔව්' || fv['q_is_registered'] === '2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ') {
        pick('q_registered_agencies');
        if ((fv['q_registered_agencies'] || '').includes('6. වෙනත්')) req('q_registered_agencies_other');
      }
      if (fv['q_is_registered'] === '1. ඔව්') req('q_registration_number');
      req('q_has_vat', SEL);
      if (fv['q_has_vat'] === '1. ඔව්') req('q_vat_number');
      break;
    }
    case 2: {
      req('q_business_location_type', SEL);
      req('q_business_address');
      req('q_location_ownership', SEL);
      if (fv['q_location_ownership'] === '2. කුලියට ගෙන ඇත') numRange('q_rent_amount', 0, 100000000, true);
      req('q_pay_building_tax', SEL);
      if (fv['q_pay_building_tax'] === '1. ඔව්') numRange('q_building_tax_amount', 0, 100000000, true);
      break;
    }
    case 3: {
      req('q_uses_electricity', SEL);
      pick('q_main_energy_source');
      count('q_power_outages');
      req('q_water_source', SEL);
      req('q_water_storage', SEL);
      req('q_internet_access', SEL);
      pick('q_telephone_service');
      break;
    }
    case 4: {
      pick('q_capital_sources');
      req('q_business_scale', SEL);
      req('q_engagement_nature', SEL);
      req('q_business_place', SEL);
      break;
    }
    case 5: {
      count('q_total_workers', true);
      ['q_female_workers', 'q_male_workers', 'q_paid_workers', 'q_unpaid_family_workers', 'q_contract_workers'].forEach((id) => count(id));
      // Cross-field: men + women cannot exceed the total headcount.
      if (isCount(fv['q_total_workers'] || '') && (isCount(fv['q_female_workers'] || '') || isCount(fv['q_male_workers'] || ''))) {
        const total = asNumber(fv['q_total_workers']);
        const female = isCount(fv['q_female_workers'] || '') ? asNumber(fv['q_female_workers']) : 0;
        const male = isCount(fv['q_male_workers'] || '') ? asNumber(fv['q_male_workers']) : 0;
        if (female + male > total) {
          const msg = L('Men + women cannot exceed the total workers', 'පිරිමි + කාන්තා ගණන මුළු සේවකයින්ට වඩා වැඩි විය නොහැක', 'ஆண் + பெண் மொத்த தொழிலாளர்களை மீற முடியாது');
          e['q_total_workers'] = msg;
        }
      }
      req('q_labor_contribution', SEL);
      req('q_provides_training', SEL);
      req('q_pays_epf', SEL);
      break;
    }
    case 6: {
      numRange('q_machinery_value', 0, 100000000000, false);
      ['q_production_daily', 'q_production_weekly', 'q_production_monthly', 'q_production_yearly'].forEach((id) => count(id));
      numRange('q_production_capacity', 0, 100, false);
      numRange('q_operating_hours', 0, 24, false);
      pick('q_material_sources');
      req('q_material_license_req', SEL);
      if (fv['q_material_license_req'] === '1. ඔව්') req('q_material_license_agency', SEL);
      numRange('q_material_cost', 0, 100000000000, false);
      pick('q_waste_disposal');
      req('q_waste_recycled', SEL);
      req('q_waste_income', SEL);
      break;
    }
    case 7: {
      req('q_profit_calculated', SEL);
      if (fv['q_profit_calculated'] === '1. ඔව්') numRange('q_profit_percentage', 0, 100, true);
      req('q_cost_calculated', SEL);
      if (fv['q_cost_calculated'] === '1. ඔව්') numRange('q_unit_cost', 0, 100000000000, true);
      ['q_monthly_income', 'q_monthly_expense', 'q_monthly_net_profit'].forEach((id) => numRange(id, 0, 100000000000, false));
      req('q_profitable', SEL);
      ['q_loan_installment', 'q_total_loan', 'q_personal_loan'].forEach((id) => numRange(id, 0, 100000000000, false));
      req('q_bank_account', SEL);
      if (fv['q_bank_account'] === '1. ඔව්') req('q_bank_name');
      req('q_financial_records', SEL);
      req('q_receives_salary', SEL);
      req('q_knows_financial_concepts', SEL);
      break;
    }
    case 8: {
      pick('q_customers');
      req('q_market_extent', SEL);
      req('q_customer_trend', SEL);
      req('q_has_competitors', SEL);
      if (fv['q_has_competitors'] === '1. ඔව්, බොහෝ දෙනෙක්' || fv['q_has_competitors'] === '2. ඔව්, කීප දෙනෙක්') req('q_competitor_influence', SEL);
      pick('q_marketing_methods');
      req('q_has_brand', SEL);
      break;
    }
    case 9: {
      req('q_new_products', SEL);
      req('q_new_tech', SEL);
      pick('q_tech_devices');
      req('q_uses_internet_for_business', SEL);
      pick('q_digital_payments');
      break;
    }
    case 10: {
      pick('q_reg_certificates');
      pick('q_taxes_paid');
      pick('q_gov_support_received');
      ['q_barrier_finance', 'q_barrier_infrastructure', 'q_barrier_taxes', 'q_barrier_labor', 'q_barrier_laws'].forEach((id) => req(id, L('Please rate this from 1 to 5', 'කරුණාකර 1 සිට 5 දක්වා ශ්‍රේණිගත කරන්න', 'தயவுசெய்து 1 முதல் 5 வரை மதிப்பிடவும்')));
      break;
    }
    case 11: {
      req('q_env_impact_assessed', SEL);
      req('q_energy_saving', SEL);
      req('q_social_responsibility', SEL);
      break;
    }
    case 12: {
      pick('q_business_expansion');
      pick('q_expected_gov_support');
      break;
    }
    default:
      break;
  }

  return e;
}

/* First step (0..12) that has any validation error, or -1 if the whole survey is valid. */
export function getFirstInvalidStep(fv: FormValues, L: Translate): number {
  for (let s = 0; s < TOTAL_STEPS; s++) {
    if (Object.keys(getStepErrors(s, fv, L)).length > 0) return s;
  }
  return -1;
}
