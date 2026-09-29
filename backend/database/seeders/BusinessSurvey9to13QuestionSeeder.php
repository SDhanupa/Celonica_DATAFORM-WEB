<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessSurveyQuestion;

/**
 * Seeds business_survey_questions for steps 9-13 (Market & Marketing through
 * Future Needs & Logistics) — the sections that used to be hardcoded JSX in
 * IndustrySurveyPage.tsx and are now rendered the same way steps 2-8 are, via
 * DynamicQuestionRenderer.
 *
 * Unlike BusinessSurveyQuestionSeeder (steps 0-8), this seeder does NOT
 * truncate the table: it upserts by field_key, so it is safe to re-run and
 * does not touch rows for any other step. Run it once per environment:
 *
 *   php artisan db:seed --class=Database\\Seeders\\BusinessSurvey9to13QuestionSeeder
 *
 * Content is a direct, field-for-field migration of the hardcoded JSX this
 * replaced (Sinhala text is byte-identical to the original). English and
 * Tamil translations were newly authored for this migration — the original
 * hardcoded JSX had no real en/ta text (both slots of its ternary held the
 * same Sinhala string). These should get a native-speaker review pass before
 * being treated as final, same as any new translated content.
 */
class BusinessSurvey9to13QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $json = <<<JSON
[
    {
        "step": 9,
        "key": "q_customers",
        "type": "multiselect",
        "en": "7.1.1 Who are your main buyers?",
        "si": "7.1.1 ප්‍රධාන ගැනුම්කරුවන් කවුද?",
        "ta": "7.1.1 உங்கள் முக்கிய வாடிக்கையாளர்கள் யார்?",
        "options": {
            "en": [
                "1. Local area customers",
                "2. Customers from outside the area",
                "3. Other businesses (B2B)",
                "4. Middlemen/Wholesalers",
                "5. Government institutions",
                "6. For export"
            ],
            "si": [
                "1. ප්‍රදේශයේ පාරිභෝගිකයින්",
                "2. ප්‍රදේශයෙන් පිටත පාරිභෝගිකයින්",
                "3. වෙනත් ව්‍යාපාරිකයින් (B2B)",
                "4. අතරමැදියන්/තොග වෙළඳුන්",
                "5. රජයේ ආයතන",
                "6. අපනයනය සඳහා"
            ],
            "ta": [
                "1. உள்ளூர் பகுதி வாடிக்கையாளர்கள்",
                "2. பகுதிக்கு வெளியே உள்ள வாடிக்கையாளர்கள்",
                "3. மற்ற வணிகங்கள் (B2B)",
                "4. இடைத்தரகர்கள்/மொத்த விற்பனையாளர்கள்",
                "5. அரசாங்க நிறுவனங்கள்",
                "6. ஏற்றுமதிக்காக"
            ]
        }
    },
    {
        "step": 9,
        "key": "q_market_extent",
        "type": "select",
        "en": "7.1.2 Extent of the market",
        "si": "7.1.2 වෙළඳපොළේ පැතිරීම",
        "ta": "7.1.2 சந்தையின் எல்லை",
        "options": {
            "en": ["1. Village only", "2. Divisional Secretariat area", "3. District", "4. Province", "5. Nationwide", "6. International"],
            "si": ["1. ගමට පමණයි", "2. ප්‍රාදේශීය ලේකම් කොට්ඨාසයට", "3. දිස්ත්‍රික්කයට", "4. පළාතට", "5. රට පුරා", "6. ජාත්‍යන්තර"],
            "ta": ["1. கிராமத்திற்கு மட்டும்", "2. பிரதேச செயலக பிரிவுக்கு", "3. மாவட்டத்திற்கு", "4. மாகாணத்திற்கு", "5. நாடு முழுவதும்", "6. சர்வதேசம்"]
        }
    },
    {
        "step": 9,
        "key": "q_customer_trend",
        "type": "select",
        "en": "7.1.3 Customer trend",
        "si": "7.1.3 පාරිභෝගිකයින්ගේ ප්‍රවණතාවය",
        "ta": "7.1.3 வாடிக்கையாளர் போக்கு",
        "options": {
            "en": ["1. Increasing", "2. Decreasing", "3. No change"],
            "si": ["1. වැඩි වෙමින් පවතී", "2. අඩු වෙමින් පවතී", "3. වෙනසක් නැත"],
            "ta": ["1. அதிகரித்து வருகிறது", "2. குறைந்து வருகிறது", "3. மாற்றம் இல்லை"]
        }
    },
    {
        "step": 9,
        "key": "q_has_competitors",
        "type": "select",
        "en": "7.2.1 Do you have competitors?",
        "si": "7.2.1 තරඟකරුවන් සිටීද?",
        "ta": "7.2.1 உங்களுக்கு போட்டியாளர்கள் உள்ளனரா?",
        "options": {
            "en": ["1. Yes, many", "2. Yes, a few", "3. No"],
            "si": ["1. ඔව්, බොහෝ දෙනෙක්", "2. ඔව්, කීප දෙනෙක්", "3. නැත"],
            "ta": ["1. ஆம், பலர் உள்ளனர்", "2. ஆம், சிலர் உள்ளனர்", "3. இல்லை"]
        }
    },
    {
        "step": 9,
        "key": "q_competitor_influence",
        "type": "select",
        "depends_on": "q_has_competitors:1,2",
        "en": "7.2.2 Impact from competitors",
        "si": "7.2.2 තරඟකරුවන්ගෙන් වන බලපෑම",
        "ta": "7.2.2 போட்டியாளர்களின் தாக்கம்",
        "options": {
            "en": ["1. High", "2. Moderate", "3. Low", "4. No impact"],
            "si": ["1. විශාලයි", "2. මධ්‍යමයි", "3. අඩුයි", "4. බලපෑමක් නැත"],
            "ta": ["1. அதிகம்", "2. நடுத்தரம்", "3. குறைவு", "4. தாக்கம் இல்லை"]
        }
    },
    {
        "step": 9,
        "key": "q_marketing_methods",
        "type": "multiselect",
        "en": "7.3.1 Marketing methods",
        "si": "7.3.1 අලෙවිකරණ ක්‍රම",
        "ta": "7.3.1 சந்தைப்படுத்தல் முறைகள்",
        "options": {
            "en": [
                "1. Posters/Banners",
                "2. Social media (Facebook, WhatsApp)",
                "3. Through a website",
                "4. Print media (newspapers)",
                "5. Television/Radio",
                "6. Word of mouth",
                "7. Exhibitions/Fairs",
                "8. No marketing done"
            ],
            "si": [
                "1. පෝස්ටර්/බැනර්",
                "2. සමාජ මාධ්‍ය (Facebook, WhatsApp)",
                "3. වෙබ් අඩවියක් මගින්",
                "4. මුද්‍රිත මාධ්‍ය (පුවත්පත්)",
                "5. රූපවාහිනී/ගුවන් විදුලි",
                "6. පාරිභෝගිකයින්ගේ දැනුම්දීම (Word of mouth)",
                "7. ප්‍රදර්ශන/පොළවල්",
                "8. අලෙවිකරණයක් නොකරයි"
            ],
            "ta": [
                "1. சுவரொட்டிகள்/பதாகைகள்",
                "2. சமூக ஊடகம் (Facebook, WhatsApp)",
                "3. இணையதளம் மூலம்",
                "4. அச்சு ஊடகம் (செய்தித்தாள்)",
                "5. தொலைக்காட்சி/வானொலி",
                "6. வாய்வழி விளம்பரம்",
                "7. கண்காட்சிகள்/சந்தைகள்",
                "8. சந்தைப்படுத்தல் செய்யப்படவில்லை"
            ]
        }
    },
    {
        "step": 9,
        "key": "q_has_brand",
        "type": "select",
        "en": "7.3.2 Do your products have a brand name?",
        "si": "7.3.2 භාණ්ඩ සඳහා වෙළඳ නාමයක් (Brand) තිබේද?",
        "ta": "7.3.2 உங்கள் தயாரிப்புகளுக்கு ஒரு பிராண்ட் பெயர் உள்ளதா?",
        "options": {
            "en": ["1. Yes", "2. No"],
            "si": ["1. ඔව්", "2. නැත"],
            "ta": ["1. ஆம்", "2. இல்லை"]
        }
    },
    {
        "step": 10,
        "key": "q_new_products",
        "type": "select",
        "en": "8.1.1 Have you introduced new products/services in the last 3 years?",
        "si": "8.1.1 පසුගිය වසර 3 තුළ නව නිෂ්පාදන/සේවා හඳුන්වා දුන්නේද?",
        "ta": "8.1.1 கடந்த 3 ஆண்டுகளில் புதிய தயாரிப்புகள்/சேவைகளை அறிமுகப்படுத்தினீர்களா?",
        "options": {
            "en": ["1. Yes", "2. No"],
            "si": ["1. ඔව්", "2. නැත"],
            "ta": ["1. ஆம்", "2. இல்லை"]
        }
    },
    {
        "step": 10,
        "key": "q_new_tech",
        "type": "select",
        "en": "8.1.2 Have you adopted new technology in the last 3 years?",
        "si": "8.1.2 පසුගිය වසර 3 තුළ නව තාක්ෂණයක් භාවිතා කළේද?",
        "ta": "8.1.2 கடந்த 3 ஆண்டுகளில் புதிய தொழில்நுட்பத்தை பயன்படுத்தினீர்களா?",
        "options": {
            "en": ["1. Yes", "2. No"],
            "si": ["1. ඔව්", "2. නැත"],
            "ta": ["1. ஆம்", "2. இல்லை"]
        }
    },
    {
        "step": 10,
        "key": "q_tech_devices",
        "type": "multiselect",
        "en": "8.2.1 Technology devices in use",
        "si": "8.2.1 භාවිතා කරන තාක්ෂණික උපකරණ",
        "ta": "8.2.1 பயன்படுத்தும் தொழில்நுட்ப சாதனங்கள்",
        "options": {
            "en": ["1. Smartphone", "2. Computer/Laptop", "3. Internet facilities", "4. None"],
            "si": ["1. ස්මාර්ට් දුරකථනය", "2. පරිගණකය/ලැප්ටොප්", "3. අන්තර්ජාල පහසුකම්", "4. කිසිවක් නැත"],
            "ta": ["1. ஸ்மார்ட்போன்", "2. கணினி/மடிக்கணினி", "3. இணைய வசதிகள்", "4. எதுவுமில்லை"]
        }
    },
    {
        "step": 10,
        "key": "q_uses_internet_for_business",
        "type": "select",
        "en": "8.2.2 Do you use the internet for business purposes?",
        "si": "8.2.2 අන්තර්ජාලය ව්‍යාපාරික කටයුතු සඳහා භාවිතා කරන්නේද?",
        "ta": "8.2.2 வணிக நோக்கங்களுக்காக இணையத்தைப் பயன்படுத்துகிறீர்களா?",
        "options": {
            "en": ["1. Yes", "2. No"],
            "si": ["1. ඔව්", "2. නැත"],
            "ta": ["1. ஆம்", "2. இல்லை"]
        }
    },
    {
        "step": 10,
        "key": "q_digital_payments",
        "type": "multiselect",
        "en": "8.2.3 Do you use digital payment methods?",
        "si": "8.2.3 ඩිජිටල් ගෙවීම් ක්‍රම භාවිතා කරන්නේද?",
        "ta": "8.2.3 டிஜிட்டல் பணம் செலுத்தும் முறைகளைப் பயன்படுத்துகிறீர்களா?",
        "options": {
            "en": [
                "1. Yes (via bank - Online Banking)",
                "2. Yes (LankaQR / Mobile Wallets)",
                "3. Via card (POS)",
                "4. No, cash only"
            ],
            "si": [
                "1. ඔව් (බැංකු හරහා - Online Banking)",
                "2. ඔව් (LankaQR / Mobile Wallets)",
                "3. කාඩ්පත් මගින් (POS)",
                "4. නැත, මුදල් (Cash) පමණයි"
            ],
            "ta": [
                "1. ஆம் (வங்கி மூலம் - Online Banking)",
                "2. ஆம் (LankaQR / மொபைல் வாலட்)",
                "3. அட்டை மூலம் (POS)",
                "4. இல்லை, பணம் மட்டும்"
            ]
        }
    },
    {
        "step": 11,
        "key": "q_reg_certificates",
        "type": "multiselect",
        "en": "9.1.1 Registration certificates held by the business",
        "si": "9.1.1 ව්‍යාපාරය සතු ලියාපදිංචි සහතික",
        "ta": "9.1.1 வணிகம் வைத்திருக்கும் பதிவுச் சான்றிதழ்கள்",
        "options": {
            "en": [
                "1. Divisional Secretariat registration (BR)",
                "2. Registrar of Companies registration",
                "3. Provincial/Local Council approval",
                "4. Environmental Protection Licence (EPL)",
                "5. Medical Officer of Health (MOH) certificate",
                "6. Sri Lanka Standards Institution certification (SLSI)",
                "7. Export Development Board registration (EDB)",
                "8. Other",
                "9. None"
            ],
            "si": [
                "1. ප්‍රාදේශීය ලේකම් ලියාපදිංචිය (BR)",
                "2. සමාගම් මැදුරේ ලියාපදිංචිය",
                "3. පළාත් සභා/ප්‍රාදේශීය සභා අනුමැතිය",
                "4. පරිසර ආරක්ෂණ බලපත්‍රය (EPL)",
                "5. සෞඛ්‍ය වෛද්‍ය නිලධාරී (MOH) සහතිකය",
                "6. ප්‍රමිති ආයතනයේ සහතිකය (SLSI)",
                "7. අපනයන සංවර්ධන මණ්ඩලයේ (EDB) ලියාපදිංචිය",
                "8. වෙනත්",
                "9. කිසිවක් නැත"
            ],
            "ta": [
                "1. பிரதேச செயலக பதிவு (BR)",
                "2. நிறுவனங்களின் பதிவாளர் பதிவு",
                "3. மாகாண சபை/உள்ளூர் சபை அனுமதி",
                "4. சுற்றுச்சூழல் பாதுகாப்பு உரிமம் (EPL)",
                "5. சுகாதார வைத்திய அதிகாரி (MOH) சான்றிதழ்",
                "6. இலங்கை தரநிலை நிறுவனச் சான்றிதழ் (SLSI)",
                "7. ஏற்றுமதி மேம்பாட்டு வாரிய பதிவு (EDB)",
                "8. மற்றவை",
                "9. எதுவுமில்லை"
            ]
        }
    },
    {
        "step": 11,
        "key": "q_taxes_paid",
        "type": "multiselect",
        "en": "9.1.2 Types of taxes paid",
        "si": "9.1.2 ගෙවන බදු වර්ග",
        "ta": "9.1.2 செலுத்தும் வரி வகைகள்",
        "options": {
            "en": ["1. Income tax", "2. Value Added Tax (VAT)", "3. Local council tax", "4. None"],
            "si": ["1. ආදායම් බදු", "2. එකතු කළ අගය මත බදු (VAT)", "3. ප්‍රාදේශීය සභා බදු", "4. කිසිවක් නැත"],
            "ta": ["1. வருமான வரி", "2. மதிப்புக் கூட்டு வரி (VAT)", "3. உள்ளூர் சபை வரி", "4. எதுவுமில்லை"]
        }
    },
    {
        "step": 11,
        "key": "q_gov_support_received",
        "type": "multiselect",
        "en": "9.2.1 Support received from the government",
        "si": "9.2.1 රජයෙන් ලැබී ඇති සහාය",
        "ta": "9.2.1 அரசாங்கத்திடமிருந்து பெற்ற ஆதரவு",
        "options": {
            "en": [
                "1. Financial aid (loans/grants)",
                "2. Training programmes",
                "3. Advisory services",
                "4. Raw materials/Equipment",
                "5. Opportunities for exhibitions",
                "6. No support received"
            ],
            "si": [
                "1. මූල්‍ය ආධාර (ණය/ප්‍රතිපාදන)",
                "2. පුහුණු වැඩසටහන්",
                "3. උපදේශන සේවා",
                "4. අමුද්‍රව්‍ය/උපකරණ",
                "5. ප්‍රදර්ශන සඳහා අවස්ථා",
                "6. කිසිදු සහායක් ලැබී නැත"
            ],
            "ta": [
                "1. நிதி உதவி (கடன்/மானியங்கள்)",
                "2. பயிற்சி திட்டங்கள்",
                "3. ஆலோசனை சேவைகள்",
                "4. மூலப்பொருட்கள்/உபகரணங்கள்",
                "5. கண்காட்சி வாய்ப்புகள்",
                "6. எந்த ஆதரவும் கிடைக்கவில்லை"
            ]
        }
    },
    {
        "step": 11,
        "key": "q_barrier_finance",
        "type": "select",
        "en": "9.3 Access to financial facilities",
        "si": "9.3 මූල්‍ය පහසුකම් ලබා ගැනීම",
        "ta": "9.3 நிதி வசதிகளைப் பெறுதல்",
        "options": {
            "en": ["1. Not a barrier", "2. Rarely", "3. A moderate barrier", "4. A barrier", "5. A very significant barrier"],
            "si": ["1. බාධකයක් නොවේ", "2. කලාතුරකින්", "3. සාමාන්‍ය බාධකයකි", "4. බාධකයකි", "5. ඉතා විශාල බාධකයකි"],
            "ta": ["1. தடையாக இல்லை", "2. அரிதாக", "3. மிதமான தடை", "4. ஒரு தடை", "5. மிகப் பெரிய தடை"]
        }
    },
    {
        "step": 11,
        "key": "q_barrier_infrastructure",
        "type": "select",
        "en": "9.3 Infrastructure (Electricity/Water)",
        "si": "9.3 යටිතල පහසුකම් (විදුලිය/ජලය)",
        "ta": "9.3 உள்கட்டமைப்பு (மின்சாரம்/நீர்)",
        "options": {
            "en": ["1. Not a barrier", "2. Rarely", "3. A moderate barrier", "4. A barrier", "5. A very significant barrier"],
            "si": ["1. බාධකයක් නොවේ", "2. කලාතුරකින්", "3. සාමාන්‍ය බාධකයකි", "4. බාධකයකි", "5. ඉතා විශාල බාධකයකි"],
            "ta": ["1. தடையாக இல்லை", "2. அரிதாக", "3. மிதமான தடை", "4. ஒரு தடை", "5. மிகப் பெரிய தடை"]
        }
    },
    {
        "step": 11,
        "key": "q_barrier_taxes",
        "type": "select",
        "en": "9.3 Tax rates",
        "si": "9.3 බදු අනුපාත",
        "ta": "9.3 வரி விகிதங்கள்",
        "options": {
            "en": ["1. Not a barrier", "2. Rarely", "3. A moderate barrier", "4. A barrier", "5. A very significant barrier"],
            "si": ["1. බාධකයක් නොවේ", "2. කලාතුරකින්", "3. සාමාන්‍ය බාධකයකි", "4. බාධකයකි", "5. ඉතා විශාල බාධකයකි"],
            "ta": ["1. தடையாக இல்லை", "2. அரிதாக", "3. மிதமான தடை", "4. ஒரு தடை", "5. மிகப் பெரிய தடை"]
        }
    },
    {
        "step": 11,
        "key": "q_barrier_labor",
        "type": "select",
        "en": "9.3 Finding skilled workers",
        "si": "9.3 පුහුණු ශ්‍රමිකයින් සොයා ගැනීම",
        "ta": "9.3 திறமையான தொழிலாளர்களைக் கண்டறிதல்",
        "options": {
            "en": ["1. Not a barrier", "2. Rarely", "3. A moderate barrier", "4. A barrier", "5. A very significant barrier"],
            "si": ["1. බාධකයක් නොවේ", "2. කලාතුරකින්", "3. සාමාන්‍ය බාධකයකි", "4. බාධකයකි", "5. ඉතා විශාල බාධකයකි"],
            "ta": ["1. தடையாக இல்லை", "2. அரிதாக", "3. மிதமான தடை", "4. ஒரு தடை", "5. மிகப் பெரிய தடை"]
        }
    },
    {
        "step": 11,
        "key": "q_barrier_laws",
        "type": "select",
        "en": "9.3 Legal and regulatory procedures",
        "si": "9.3 නීති හා රෙගුලාසි ක්‍රියා පටිපාටිය",
        "ta": "9.3 சட்ட மற்றும் ஒழுங்குமுறை நடைமுறைகள்",
        "options": {
            "en": ["1. Not a barrier", "2. Rarely", "3. A moderate barrier", "4. A barrier", "5. A very significant barrier"],
            "si": ["1. බාධකයක් නොවේ", "2. කලාතුරකින්", "3. සාමාන්‍ය බාධකයකි", "4. බාධකයකි", "5. ඉතා විශාල බාධකයකි"],
            "ta": ["1. தடையாக இல்லை", "2. அரிதாக", "3. மிதமான தடை", "4. ஒரு தடை", "5. மிகப் பெரிய தடை"]
        }
    },
    {
        "step": 12,
        "key": "q_env_impact_assessed",
        "type": "select",
        "en": "10.1.1 Has the environmental impact been assessed?",
        "si": "10.1.1 පරිසරයට වන බලපෑම තක්සේරු කර තිබේද?",
        "ta": "10.1.1 சுற்றுச்சூழல் தாக்கம் மதிப்பிடப்பட்டுள்ளதா?",
        "options": {
            "en": ["1. Yes", "2. No"],
            "si": ["1. ඔව්", "2. නැත"],
            "ta": ["1. ஆம்", "2. இல்லை"]
        }
    },
    {
        "step": 12,
        "key": "q_energy_saving",
        "type": "select",
        "en": "10.1.2 Have steps been taken to save energy/water?",
        "si": "10.1.2 බලශක්තිය/ජලය ඉතිරි කිරීමට පියවර ගෙන තිබේද?",
        "ta": "10.1.2 மின்சாரம்/நீரை சேமிக்க நடவடிக்கை எடுக்கப்பட்டுள்ளதா?",
        "options": {
            "en": ["1. Yes", "2. No"],
            "si": ["1. ඔව්", "2. නැත"],
            "ta": ["1. ஆம்", "2. இல்லை"]
        }
    },
    {
        "step": 12,
        "key": "q_social_responsibility",
        "type": "select",
        "en": "10.2.1 Does the business carry out social welfare (CSR) activities for the community?",
        "si": "10.2.1 ප්‍රජාව වෙනුවෙන් සමාජ සත්කාර (CSR) සිදු කරන්නේද?",
        "ta": "10.2.1 சமூகத்திற்காக சமூக நலன் (CSR) நடவடிக்கைகளை வணிகம் மேற்கொள்கிறதா?",
        "options": {
            "en": ["1. Yes", "2. No"],
            "si": ["1. ඔව්", "2. නැත"],
            "ta": ["1. ஆம்", "2. இல்லை"]
        }
    },
    {
        "step": 13,
        "key": "q_business_expansion",
        "type": "multiselect",
        "en": "11.1.1 Plans to develop the business",
        "si": "11.1.1 ව්‍යාපාරය දියුණු කිරීමට ඇති සැලසුම්",
        "ta": "11.1.1 வணிகத்தை மேம்படுத்துவதற்கான திட்டங்கள்",
        "options": {
            "en": [
                "1. Introducing new products/services",
                "2. Increasing production capacity",
                "3. Finding new markets (including export)",
                "4. Purchasing new technology/machinery",
                "5. Opening branches",
                "6. No plan"
            ],
            "si": [
                "1. නව නිෂ්පාදන/සේවා හඳුන්වා දීම",
                "2. නිෂ්පාදන ධාරිතාව වැඩි කිරීම",
                "3. නව වෙළඳපොළවල් සෙවීම (අපනයනය ඇතුළුව)",
                "4. නව තාක්ෂණය/යන්ත්‍රෝපකරණ මිලදී ගැනීම",
                "5. ශාඛා විවෘත කිරීම",
                "6. සැලසුමක් නැත"
            ],
            "ta": [
                "1. புதிய தயாரிப்புகள்/சேவைகளை அறிமுகப்படுத்துதல்",
                "2. உற்பத்தி திறனை அதிகரித்தல்",
                "3. புதிய சந்தைகளைத் தேடுதல் (ஏற்றுமதி உட்பட)",
                "4. புதிய தொழில்நுட்பம்/இயந்திரங்களை வாங்குதல்",
                "5. கிளைகளைத் திறத்தல்",
                "6. திட்டம் இல்லை"
            ]
        }
    },
    {
        "step": 13,
        "key": "q_expected_gov_support",
        "type": "multiselect",
        "en": "11.1.2 Support expected from the government or other institutions",
        "si": "11.1.2 රජයෙන් හෝ වෙනත් ආයතන වලින් බලාපොරොත්තු වන සහාය",
        "ta": "11.1.2 அரசாங்கம் அல்லது மற்ற நிறுவனங்களிடமிருந்து எதிர்பார்க்கும் ஆதரவு",
        "options": {
            "en": [
                "1. Low-interest loans",
                "2. New technical equipment/raw materials",
                "3. Business training/consultancy",
                "4. Marketing facilities/market access",
                "5. Land/infrastructure facilities",
                "6. Resolving legal issues",
                "7. Other"
            ],
            "si": [
                "1. අඩු පොලී ණය",
                "2. නව තාක්ෂණික උපකරණ/අමුද්‍රව්‍ය",
                "3. ව්‍යාපාරික පුහුණුව/උපදේශනය",
                "4. අලෙවි පහසුකම්/වෙළඳපොළ සෙවීම",
                "5. ඉඩම්/යටිතල පහසුකම්",
                "6. නීතිමය ගැටළු විසඳීම",
                "7. වෙනත්"
            ],
            "ta": [
                "1. குறைந்த வட்டி கடன்கள்",
                "2. புதிய தொழில்நுட்ப உபகரணங்கள்/மூலப்பொருட்கள்",
                "3. வணிக பயிற்சி/ஆலோசனை",
                "4. சந்தைப்படுத்தல் வசதிகள்/சந்தை தேடல்",
                "5. நிலம்/உள்கட்டமைப்பு வசதிகள்",
                "6. சட்டப் பிரச்சினைகளைத் தீர்த்தல்",
                "7. மற்றவை"
            ]
        }
    },
    {
        "step": 13,
        "key": "q_additional_comments",
        "type": "textarea",
        "en": "Other comments/suggestions",
        "si": "වෙනත් අදහස්/යෝජනා",
        "ta": "மற்ற கருத்துக்கள்/பரிந்துரைகள்"
    }
]
JSON;

        $questions = json_decode($json, true);

        foreach ($questions as $index => $q) {
            BusinessSurveyQuestion::updateOrCreate(
                ['field_key' => $q['key']],
                [
                    'step_index' => $q['step'],
                    'type' => $q['type'],
                    'question_en' => $q['en'],
                    'question_si' => $q['si'],
                    'question_ta' => $q['ta'],
                    'options_json' => $q['options'] ?? null,
                    'depends_on' => $q['depends_on'] ?? null,
                    'is_active' => true,
                    'sort_order' => ($index + 1) * 10,
                ]
            );
        }
    }
}
