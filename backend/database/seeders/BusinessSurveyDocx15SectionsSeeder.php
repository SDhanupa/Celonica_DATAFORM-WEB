<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessSurveyQuestion;

/**
 * Seeds business_survey_questions structured exactly as the 15-section DOCX:
 * 'කර්මාන්ත හා ව්‍යාපාර සමීක්ෂණ ප්‍රශ්නාවලිය.docx'
 *
 * All 15 sections are seeded with accurate Sinhala question text, English & Tamil
 * translations, options arrays, and tooltips/descriptions.
 *
 * Safe to re-run: uses updateOrCreate by field_key.
 *
 * Run via:
 *   php artisan db:seed --class=Database\\Seeders\\BusinessSurveyDocx15SectionsSeeder
 */
class BusinessSurveyDocx15SectionsSeeder extends Seeder
{
    public function run(): void
    {
        $json = <<<JSON
[
    {
        "step": 1,
        "key": "b_gps",
        "type": "custom",
        "en": "1.1.7 Geographic Coordinates (GPS)",
        "si": "1.1.7 භූගෝලීය ඛණ්ඩාංක (GPS)",
        "ta": "1.1.7 புவியியல் ஒருங்கிணைப்புகள் (GPS)",
        "exp_en": "Automatic latitude and longitude capture of the business location",
        "exp_si": "ව්‍යාපාරික ස්ථානයේ අක්ෂාංශ හා දේශාංශ ස්වයංක්‍රීයව සටහන් කර ගැනීම",
        "exp_ta": "வணிக இருப்பிடத்தின் அட்சரேகை மற்றும் தீர்க்கரேகையை தானாக பதிவு செய்தல்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_name",
        "type": "text",
        "en": "1.2.1 Full Name of Owner",
        "si": "1.2.1 හිමිකරුගේ සම්පූර්ණ නම",
        "ta": "1.2.1 உரிமையாளரின் முழுப் பெயர்",
        "exp_en": "Full legal name of the business owner",
        "exp_si": "ව්‍යාපාර හිමිකරුගේ සම්පූර්ණ නම ඇතුළත් කරන්න",
        "exp_ta": "வணிக உரிமையாளரின் முழு பெயரை உள்ளிடவும்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_gender",
        "type": "select",
        "en": "1.2.2 Gender",
        "si": "1.2.2 ස්ත්‍රී/පුරුෂ භාවය",
        "ta": "1.2.2 பாலினம்",
        "exp_en": "Gender of the business owner",
        "exp_si": "හිමිකරුගේ ස්ත්‍රී හෝ පුරුෂ භාවය තෝරන්න",
        "exp_ta": "உரிமையாளரின் பாலினத்தைத் தேர்ந்தெடுக்கவும்",
        "options": {
            "en": [
                "1. Male",
                "2. Female",
                "3. Other"
            ],
            "si": [
                "1. පිරිමි",
                "2. ගැහැණු",
                "3. වෙනත්"
            ],
            "ta": [
                "1. ஆண்",
                "2. பெண்",
                "3. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_nic",
        "type": "text",
        "en": "1.2.3 National Identity Card (NIC) Number",
        "si": "1.2.3 ජාතික හැඳුනුම්පත් අංකය",
        "ta": "1.2.3 தேசிய அடையாள அட்டை எண்",
        "exp_en": "Owner's 10 or 12 digit National Identity Card number",
        "exp_si": "හිමිකරුගේ ජාතික හැඳුනුම්පත් අංකය ඇතුළත් කරන්න",
        "exp_ta": "உரிமையாளரின் தேசிய அடையாள அட்டை எண்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_dob",
        "type": "text",
        "en": "1.2.4 Date of Birth / Age",
        "si": "1.2.4 උපන් දිනය / වයස",
        "ta": "1.2.4 பிறந்த தேதி / வயது",
        "exp_en": "Auto-calculated from NIC number or enter manually",
        "exp_si": "ජාතික හැඳුනුම්පතෙන් ස්වයංක්‍රීයව හෝ අතින් ඇතුළත් කරන්න",
        "exp_ta": "தேசிய அடையாள அட்டையிலிருந்து தானாக கணக்கிடப்படும் அல்லது கைமுறையாக உள்ளிடவும்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "b_mobile",
        "type": "text",
        "en": "1.2.5 WhatsApp Mobile Number",
        "si": "1.2.5 වට්ස්ඇප් දුරකථන අංකය",
        "ta": "1.2.5 வாட்ஸ்அப் மொபைல் எண்",
        "exp_en": "Active WhatsApp number for business communication and OTP verification",
        "exp_si": "OTP සත්‍යාපනය සහ සන්නිවේදනය සඳහා සක්‍රීය WhatsApp අංකය",
        "exp_ta": "OTP சரிபார்ப்பு மற்றும் தொடர்புகளுக்கான செயலில் உள்ள வாட்ஸ்அப் எண்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_phone",
        "type": "text",
        "en": "1.2.6 Primary Contact Telephone Number",
        "si": "1.2.6 ප්‍රධාන දුරකථන අංකය",
        "ta": "1.2.6 முதன்மை தொடர்பு தொலைபேசி எண்",
        "exp_en": "Main telephone/mobile number of the business owner",
        "exp_si": "ව්‍යාපාර හිමිකරුගේ ප්‍රධාන ඇමතුම් දුරකථන අංකය",
        "exp_ta": "வணிக உரிமையாளரின் முதன்மை தொலைபேசி எண்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_email",
        "type": "text",
        "en": "1.2.7 Email Address (if any)",
        "si": "1.2.7 විද්‍යුත් තැපැල් ලිපිනය (ඇත්නම්)",
        "ta": "1.2.7 மின்னஞ்சல் முகவரி (இருந்தால்)",
        "exp_en": "Official or personal email address of owner",
        "exp_si": "ව්‍යාපාරයේ හෝ හිමිකරුගේ විද්‍යුත් තැපැල් ලිපිනය",
        "exp_ta": "உரிமையாளரின் மின்னஞ்சல் முகவரி",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_address",
        "type": "text",
        "en": "1.2.8 Residential Address",
        "si": "1.2.8 නිවැසි ලිපිනය",
        "ta": "1.2.8 வீட்டு முகவரி",
        "exp_en": "Permanent residential address of the owner",
        "exp_si": "හිමිකරු පදිංචි ස්ථිර නිවසේ ලිපිනය",
        "exp_ta": "உரிமையாளரின் வீட்டு முகவரி",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_education",
        "type": "select",
        "en": "1.2.9 Highest Educational Qualification",
        "si": "1.2.9 උසස්ම අධ්‍යාපන සුදුසුකම",
        "ta": "1.2.9 மிக உயர்ந்த கல்வித் தகுதி",
        "exp_en": "Highest level of formal education completed",
        "exp_si": "හිමිකරු සම්පූර්ණ කර ඇති උසස්ම අධ්‍යාපන මට්ටම",
        "exp_ta": "உரிமையாளரின் மிக உயர்ந்த கல்வி நிலை",
        "options": {
            "en": [
                "1. Primary",
                "2. Secondary (O/L)",
                "3. Advanced Level (A/L)",
                "4. Diploma / NVQ",
                "5. Bachelor's Degree",
                "6. Postgraduate (Master's/PhD)",
                "7. No Formal Education"
            ],
            "si": [
                "1. ප්‍රාථමික",
                "2. ද්විතීයික (සා/පෙ)",
                "3. උසස් පෙළ (උ/පෙ)",
                "4. ඩිප්ලෝමා / NVQ",
                "5. උපාධිය",
                "6. උපාධියට වඩා ඉහළ",
                "7. විධිමත් අධ්‍යාපනයක් නැත"
            ],
            "ta": [
                "1. ஆரம்பக் கல்வி",
                "2. இடைநிலைக் கல்வி (சா/த)",
                "3. உயர்தரம் (உ/த)",
                "4. டிப்ளோமா / NVQ",
                "5. இளங்கலை பட்டம்",
                "6. முதுகலை பட்டம்",
                "7. முறையான கல்வி இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_experience",
        "type": "number",
        "en": "1.2.10 Experience in this Industry (Years)",
        "si": "1.2.10 මෙම කර්මාන්තයේ පළපුරුද්ද (වසර)",
        "ta": "1.2.10 இந்தத் துறையில் அனுபவம் (ஆண்டுகள்)",
        "exp_en": "Number of completed years of experience in this specific field",
        "exp_si": "මෙම කර්මාන්ත ක්ෂේත්‍රයේ හිමිකරු සතු පළපුරුද්ද වසර ගණනින්",
        "exp_ta": "இந்த குறிப்பிட்ட தொழில் துறையில் உரிமையாளருக்கு உள்ள அனுபவம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_owner_prev_job",
        "type": "text",
        "en": "1.2.11 Occupation Prior to Starting this Business",
        "si": "1.2.11 කර්මාන්තය ආරම්භ කිරීමට පෙර රැකියාව",
        "ta": "1.2.11 இந்த தொழிலைத் தொடங்குவதற்கு முன் தொழில்",
        "exp_en": "Previous employment or occupation before entering this industry",
        "exp_si": "මෙම ව්‍යාපාරය ආරම්භ කිරීමට පෙර හිමිකරු නිරත වූ රැකියාව",
        "exp_ta": "இந்தத் தொழிலைத் தொடங்குவதற்கு முன் உரிமையாளர் செய்த வேலை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_legal_status",
        "type": "select",
        "en": "1.3.1 Legal Form of the Business",
        "si": "1.3.1 ව්‍යාපාරයේ නීතිමය ස්වරූපය කුමක්ද?",
        "ta": "1.3.1 வணிகத்தின் சட்ட வடிவம் என்ன?",
        "exp_en": "Official legal organization structure of the enterprise",
        "exp_si": "ව්‍යාපාරය සංවිධානය වී ඇති නීතිමය ස්වරූපය තෝරන්න",
        "exp_ta": "நிறுவனத்தின் அதிகாரப்பூர்வ சட்ட அமைப்பு",
        "options": {
            "en": [
                "1. Sole Proprietorship",
                "2. Partnership",
                "3. Private Limited Company (Pvt Ltd)",
                "4. Public Limited Company (PLC)",
                "5. Cooperative Society",
                "6. Unregistered Household Enterprise",
                "7. Other"
            ],
            "si": [
                "1. තනි හිමිකාරිත්වය",
                "2. හවුල් ව්‍යාපාරය",
                "3. පෞද්ගලික සමාගම (Pvt Ltd)",
                "4. පොදු සමාගම (PLC)",
                "5. සමුපකාර සමිතිය",
                "6. ලියාපදිංචි නොකළ ගෘහස්ථ ව්‍යාපාරය",
                "7. වෙනත්"
            ],
            "ta": [
                "1. தனி உரிமையாளர்",
                "2. கூட்டாண்மை",
                "3. தனியார் வரையறுக்கப்பட்ட நிறுவனம் (Pvt Ltd)",
                "4. பொது வரையறுக்கப்பட்ட நிறுவனம் (PLC)",
                "5. கூட்டுறவு சங்கம்",
                "6. பதிவு செய்யப்படாத வீட்டு வணிகம்",
                "7. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_registered",
        "type": "select",
        "en": "1.3.2 Is the Business Registered?",
        "si": "1.3.2 ව්‍යාපාරය ලියාපදිංචි කර තිබේද?",
        "ta": "1.3.2 வணிகம் பதிவு செய்யப்பட்டுள்ளதா?",
        "exp_en": "Registration status with any government or local authority",
        "exp_si": "ව්‍යාපාරය රජයේ හෝ පළාත් පාලන ආයතනයක ලියාපදිංචි කර ඇත්දැයි සඳහන් කරන්න",
        "exp_ta": "அரசாங்கத்தில் வணிகத்தின் பதிவு நிலை",
        "options": {
            "en": [
                "1. Yes",
                "2. In Process of Registration",
                "3. No"
            ],
            "si": [
                "1. ඔව්",
                "2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ",
                "3. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. பதிவு செய்யும் பணியில் உள்ளது",
                "3. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_reg_agency",
        "type": "multiselect",
        "en": "1.3.3 If Registered, with Which Agency?",
        "si": "1.3.3 ලියාපදිංචි කර ඇත්නම්, කුමන ආයතනයක් සමඟද?",
        "ta": "1.3.3 பதிவு செய்யப்பட்டிருந்தால், எந்த நிறுவனத்தில்?",
        "exp_en": "Agencies where the business holds registration certificates",
        "exp_si": "ලියාපදිංචිය ලබා ඇති ආයතනය හෝ ආයතන තෝරන්න",
        "exp_ta": "வணிகம் பதிவு செய்யப்பட்டுள்ள நிறுவனங்கள்",
        "options": {
            "en": [
                "1. Pradeshiya Sabha / Municipal Council",
                "2. Divisional Secretariat",
                "3. Registrar of Companies (ROC)",
                "4. Department of Inland Revenue",
                "5. Social Security / EPF Dept",
                "6. Other Authority"
            ],
            "si": [
                "1. ප්‍රාදේශීය සභාව / නගර සභාව",
                "2. ප්‍රාදේශීය ලේකම් කාර්යාලය",
                "3. සමාගම් ලියාපදිංචි කාර්යාලය (ROC)",
                "4. දේශීය ආදායම් දෙපාර්තමේන්තුව",
                "5. සමාජ සුරක්ෂිත ආයතනය / EPF",
                "6. වෙනත්"
            ],
            "ta": [
                "1. பிரதேச சபை / மாநகர சபை",
                "2. பிரதேச செயலகம்",
                "3. நிறுவனங்கள் பதிவாளர்",
                "4. உள்நாட்டு இறைவரித் திணைக்களம்",
                "5. சமூகப் பாதுகாப்பு நிறுவனம்",
                "6. மற்றவை"
            ]
        },
        "depends_on": "q_registered:1"
    },
    {
        "step": 1,
        "key": "b_reg_no",
        "type": "text",
        "en": "1.3.4 Business Registration Number(s)",
        "si": "1.3.4 ලියාපදිංචි අංක(ය)",
        "ta": "1.3.4 வணிக பதிவு எண்(கள்)",
        "exp_en": "Official certificate/registration number(s)",
        "exp_si": "ව්‍යාපාර ලියාපදිංචි සහතිකයේ සඳහන් අංකය(න්)",
        "exp_ta": "வணிக பதிவு சான்றிதழ் எண்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 1,
        "key": "q_vat",
        "type": "select",
        "en": "1.3.5 Registered for Value Added Tax (VAT)?",
        "si": "1.3.5 වැට් (VAT) ලියාපදිංචිය තිබේද?",
        "ta": "1.3.5 மதிப்பு கூட்டு வரி (VAT) பதிவு உள்ளதா?",
        "exp_en": "Whether the business has a valid VAT registration number",
        "exp_si": "ව්‍යාපාරයට දේශීය ආදායම් දෙපාර්තමේන්තුවේ VAT ලියාපදිංචිය තිබේදැයි තෝරන්න",
        "exp_ta": "வணிகத்திற்கு VAT பதிவு உள்ளதா",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_premises_type",
        "type": "select",
        "en": "2.1.1 Type of Business Location / Premises",
        "si": "2.1.1 ව්‍යාපාරය ක්‍රියාත්මක වන ස්ථානය කුමක්ද?",
        "ta": "2.1.1 வணிகம் இயங்கும் இடம் என்ன?",
        "exp_en": "Physical nature of the location where operations take place",
        "exp_si": "ව්‍යාපාරික කටයුතු සිදුකරන භෞතික ස්ථානයේ ස්වභාවය තෝරන්න",
        "exp_ta": "வணிக செயல்பாடுகள் நடைபெறும் இடம்",
        "options": {
            "en": [
                "1. Inside home (no separate space)",
                "2. Dedicated room in the house",
                "3. Separate section / upper floor of house",
                "4. Separate building adjacent to house",
                "5. Separate permanent commercial location (owned/rented)",
                "6. Temporary kiosk / booth / roadside stall",
                "7. Mobile business (hawker, street vendor)"
            ],
            "si": [
                "1. නිවස තුළ (වෙනම ඉඩක් නැතිව)",
                "2. නිවසේ කාමරයක",
                "3. නිවසේ වෙනම කොටසක/උඩුමහලේ",
                "4. නිවසට යාබදව ඉදිකළ වෙනම ගොඩනැගිල්ලක",
                "5. වෙනම ස්ථිර ස්ථානයක (කුලියට/තමන්ගේ)",
                "6. වෙනත් තාවකාලික ස්ථානයක (කුටිය, කියෝස්ක්, වීදි කඩය)",
                "7. ගමන් කරන ව්‍යාපාරයක් (හෝකර්, පාරේ විකුණුම්)"
            ],
            "ta": [
                "1. வீட்டிற்குள் (தனி இடம் இல்லாமல்)",
                "2. வீட்டின் ஒரு அறையில்",
                "3. வீட்டின் தனிப் பகுதியில்/மேல் மாடியில்",
                "4. வீட்டிற்கு அருகில் கட்டப்பட்ட தனி கட்டிடத்தில்",
                "5. தனி நிரந்தர இடத்தில் (வாடகை/சொந்தம்)",
                "6. தற்காலிக கடையில் (கியோஸ்க், தெருக் கடை)",
                "7. நடமாடும் வணிகம் (தெரு விற்பனை)"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "b_address",
        "type": "text",
        "en": "2.1.2 Business Operating Address",
        "si": "2.1.2 ව්‍යාපාරික ස්ථානයේ ලිපිනය",
        "ta": "2.1.2 வணிக இயக்க முகவரி",
        "exp_en": "Full street address where the workshop/shop is situated",
        "exp_si": "කර්මාන්තය හෝ ව්‍යාපාරය පිහිටි නිශ්චිත ලිපිනය",
        "exp_ta": "தொழிற்சாலை அல்லது வணிகம் அமைந்துள்ள முகவரி",
        "options": null,
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_branch_locations",
        "type": "text",
        "en": "2.1.3 Branch Addresses (if any)",
        "si": "2.1.3 ශාඛා ලිපින(ය) (ඇත්නම්)",
        "ta": "2.1.3 கிளை முகவரிகள் (இருந்தால்)",
        "exp_en": "Locations of any other branches, sales outlets, or production workshops",
        "exp_si": "ව්‍යාපාරයට වෙනත් ශාඛා හෝ අලෙවිසැල් ඇත්නම් ඒවායේ ලිපින",
        "exp_ta": "கிளைகள் அல்லது பிற விற்பனை நிலையங்கள் இருந்தால் அவற்றின் முகவரி",
        "options": null,
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_ownership",
        "type": "select",
        "en": "2.1.4 Ownership of the Premises",
        "si": "2.1.4 ස්ථානයේ හිමිකාරිත්වය",
        "ta": "2.1.4 இடத்தின் உரிமை",
        "exp_en": "Ownership status of the property used for business",
        "exp_si": "ව්‍යාපාරික ගොඩනැගිල්ලේ හෝ භූමියේ හිමිකාරිත්වය",
        "exp_ta": "வணிகம் நடைபெறும் நிலம் அல்லது கட்டிடத்தின் உரிமை",
        "options": {
            "en": [
                "1. Owned by Proprietor",
                "2. Rented / Leased",
                "3. Free of Charge / Family Property",
                "4. Government / Municipal Permit",
                "5. Other"
            ],
            "si": [
                "1. තමන් සතුය",
                "2. කුලියට ගෙන ඇත",
                "3. නොමිලේ භාවිතා කරයි",
                "4. රජයේ / පළාත් පාලන බලපත්‍ර",
                "5. වෙනත්"
            ],
            "ta": [
                "1. சொந்தமானது",
                "2. வாடகைக்கு எடுக்கப்பட்டது",
                "3. இலவசமாகப் பயன்படுத்தப்படுகிறது",
                "4. அரசாங்க அனுமதி",
                "5. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_monthly_rent",
        "type": "number",
        "en": "2.1.5 Monthly Rent Amount (LKR)",
        "si": "2.1.5 කුලියට ගෙන ඇත්නම්, මාසික කුලී මුදල (රු.)",
        "ta": "2.1.5 வாடகைக்கு எடுக்கப்பட்டால், மாதாந்திர வாடகை (ரூ.)",
        "exp_en": "Monthly rental or lease fee paid for the business premises",
        "exp_si": "ව්‍යාපාරික ස්ථානය සඳහා මසකට ගෙවන කුලී මුදල රුපියල් වලින්",
        "exp_ta": "மாதாந்திர வாடகைத் தொகை",
        "options": null,
        "depends_on": "q_ownership:2"
    },
    {
        "step": 2,
        "key": "q_building_tax",
        "type": "select",
        "en": "2.1.6 Do You Pay Property / Municipal Rates?",
        "si": "2.1.6 ගොඩනැගිල්ල සඳහා බද්දක් ගෙවන්නේද?",
        "ta": "2.1.6 கட்டிடத்திற்கு வரி செலுத்துகிறீர்களா?",
        "exp_en": "Whether rates/taxes are paid to Pradeshiya Sabha or Municipal Council",
        "exp_si": "පළාත් පාලන ආයතනයට වරිපනම් හෝ ගොඩනැගිලි බදු ගෙවන්නේදැයි සඳහන් කරන්න",
        "exp_ta": "கட்டிடத்திற்கு உள்ளூராட்சி வரி செலுத்தப்படுகிறதா",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_electricity",
        "type": "select",
        "en": "2.2.1 Do You Use Electricity for Business?",
        "si": "2.2.1 විදුලිය භාවිතා කරන්නේද?",
        "ta": "2.2.1 வணிகத்திற்கு மின்சாரம் பயன்படுத்துகிறீர்களா?",
        "exp_en": "Source of electrical power used in day-to-day operations",
        "exp_si": "ව්‍යාපාරික මෙහෙයුම් සඳහා විදුලිය ලබාගන්නා ආකාරය",
        "exp_ta": "மின்சார பயன்பாடு மற்றும் அதன் ஆதாரம்",
        "options": {
            "en": [
                "1. Yes (National Grid - CEB/LECO)",
                "2. Yes (Solar Power)",
                "3. Yes (Generator)",
                "4. No"
            ],
            "si": [
                "1. ඔව් (ජාතික විදුලිබල මණ්ඩලයෙන්)",
                "2. ඔව් (සූර්ය බලයෙන්)",
                "3. ඔව් (ජනක යන්ත්‍රයකින්)",
                "4. නැත"
            ],
            "ta": [
                "1. ஆம் (தேசிய மின்சார சபை)",
                "2. ஆம் (சூரிய சக்தி)",
                "3. ஆம் (ஜெனரேட்டர்)",
                "4. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_energy_source",
        "type": "multiselect",
        "en": "2.2.2 Primary Energy / Fuel Sources",
        "si": "2.2.2 ප්‍රධාන බලශක්ති ප්‍රභවය කුමක්ද?",
        "ta": "2.2.2 முதன்மை ஆற்றல் ஆதாரங்கள்",
        "exp_en": "All forms of energy and fuels utilized in production or operations",
        "exp_si": "නිෂ්පාදන හෝ සේවා කටයුතු සඳහා භාවිතා කරන බලශක්ති ප්‍රභවයන්",
        "exp_ta": "பயன்படுத்தப்படும் ஆற்றல் ஆதாரங்கள்",
        "options": {
            "en": [
                "1. Electricity",
                "2. Diesel",
                "3. Kerosene",
                "4. Solar Power",
                "5. Firewood / Biomass",
                "6. LP Gas",
                "7. Other"
            ],
            "si": [
                "1. විදුලිය",
                "2. ඩීසල්",
                "3. භූමිතෙල්",
                "4. සූර්ය බලය",
                "5. දර / ජෛව ස්කන්ධ",
                "6. ගෑස්",
                "7. වෙනත්"
            ],
            "ta": [
                "1. மின்சாரம்",
                "2. டீசல்",
                "3. மண்ணெண்ணெய்",
                "4. சூரிய சக்தி",
                "5. விறகு",
                "6. எரிவாயு (LP Gas)",
                "7. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_power_outages",
        "type": "number",
        "en": "2.2.3 Average Power Outages Per Week",
        "si": "2.2.3 සතියකට සාමාන්‍යයෙන් විදුලිය ඇනහිටීම් කීයක් සිදුවේද?",
        "ta": "2.2.3 வாரத்திற்கு சராசரியாக எத்தனை முறை மின் தடை ஏற்படுகிறது?",
        "exp_en": "Weekly frequency of power cuts affecting production",
        "exp_si": "සතියක කාලයක් තුළ විදුලිය විසන්ධි වන වාර ගණන",
        "exp_ta": "வாரத்திற்கு ஏற்படும் மின் தடை எண்ணிக்கை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_water_source",
        "type": "select",
        "en": "2.2.4 Water Supply Source",
        "si": "2.2.4 ජලය ලබා ගන්නේ කෙසේද?",
        "ta": "2.2.4 நீர் விநியோக ஆதாரம்",
        "exp_en": "Main source of water used for business activities",
        "exp_si": "ව්‍යාපාරික අවශ්‍යතා සඳහා ජලය ලබාගන්නා ප්‍රධාන මූලාශ්‍රය",
        "exp_ta": "நீர் ஆதாரம்",
        "options": {
            "en": [
                "1. Pipe-borne Water (NWSDB)",
                "2. Well Water",
                "3. Natural Spring",
                "4. Water Bowser / Delivery",
                "5. River / Canal",
                "6. Other"
            ],
            "si": [
                "1. නල ජලය (ජල සම්පාදන මණ්ඩලය)",
                "2. ළිඳකින්",
                "3. උල්පතකින්",
                "4. ටැංකි රථයකින්",
                "5. ගඟක්/ඇළක්",
                "6. වෙනත්"
            ],
            "ta": [
                "1. குழாய் நீர்",
                "2. கிணறு",
                "3. நீரூற்று",
                "4. தண்ணீர் போசர்",
                "5. ஆறு / கால்வாய்",
                "6. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_water_storage",
        "type": "select",
        "en": "2.2.5 Do You Have Water Storage Facilities?",
        "si": "2.2.5 ජලය ගබඩා කිරීමේ පහසුකමක් තිබේද?",
        "ta": "2.2.5 நீர் சேமிப்பு வசதி உள்ளதா?",
        "exp_en": "Tanks or reservoirs to ensure uninterrupted water supply",
        "exp_si": "ජල ටැංකි හෝ වෙනත් ගබඩා පහසුකම් තිබේදැයි තෝරන්න",
        "exp_ta": "நீர் சேமிப்பு வசதிகள்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_internet",
        "type": "select",
        "en": "2.2.6 Internet Connectivity",
        "si": "2.2.6 අන්තර්ජාල පහසුකම තිබේද?",
        "ta": "2.2.6 இணைய இணைப்பு உள்ளதா?",
        "exp_en": "Internet access available at business location",
        "exp_si": "ව්‍යාපාරික ස්ථානයේ අන්තර්ජාල පහසුකම් භාවිතය",
        "exp_ta": "வணிகத்தில் இணைய வசதி",
        "options": {
            "en": [
                "1. Yes (Mobile Data)",
                "2. Yes (Fixed Broadband / Fiber / 4G Router)",
                "3. No"
            ],
            "si": [
                "1. ඔව් (ජංගම දත්ත)",
                "2. ඔව් (බ්‍රෝඩ්බෑන්ඩ් / ෆයිබර් / රවුටර)",
                "3. නැත"
            ],
            "ta": [
                "1. ஆம் (மொபைல் டேட்டா)",
                "2. ஆம் (பிராட்பேண்ட் / ஃபைபர்)",
                "3. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 2,
        "key": "q_telephone",
        "type": "multiselect",
        "en": "2.2.7 Telephone Service Available",
        "si": "2.2.7 දුරකථන සේවාව තිබේද?",
        "ta": "2.2.7 தொலைபேசி சேவை உள்ளதா?",
        "exp_en": "Types of telephone connections maintained for business",
        "exp_si": "භාවිතා කරන දුරකථන සේවා වර්ග තෝරන්න",
        "exp_ta": "தொலைபேசி சேவை வகைகள்",
        "options": {
            "en": [
                "1. Yes (Fixed Landline)",
                "2. Yes (Mobile Phone)",
                "3. No"
            ],
            "si": [
                "1. ඔව් (ස්ථාවර දුරකථනය)",
                "2. ඔව් (ජංගම දුරකථනය)",
                "3. නැත"
            ],
            "ta": [
                "1. ஆம் (நிலையான தொலைபேசி)",
                "2. ஆம் (மொபைல்)",
                "3. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 3,
        "key": "b_name",
        "type": "text",
        "en": "3.1.1 Name of Business / Enterprise",
        "si": "3.1.1 ව්‍යාපාරයේ නම",
        "ta": "3.1.1 வணிகத்தின் பெயர்",
        "exp_en": "Trade name or official business name",
        "exp_si": "ව්‍යාපාරය හෝ කර්මාන්තය හඳුන්වන නම ඇතුළත් කරන්න",
        "exp_ta": "வணிகத்தின் பெயர்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 3,
        "key": "b_description",
        "type": "text",
        "en": "3.1.2 Main Business Activity / Description",
        "si": "3.1.2 ව්‍යාපාරයේ ප්‍රධාන ක්‍රියාකාරකම",
        "ta": "3.1.2 முக்கிய வணிக செயல்பாடு",
        "exp_en": "Detailed description of main products produced or services provided",
        "exp_si": "සිදුකරන ප්‍රධාන නිෂ්පාදන හෝ සේවා පිළිබඳ කෙටි විස්තරයක්",
        "exp_ta": "முக்கிய வணிக செயல்பாடு பற்றிய விளக்கம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 3,
        "key": "b_category_code",
        "type": "custom",
        "en": "3.1.3 National Industry Classification (ISIC)",
        "si": "3.1.3 කර්මාන්තය ජාතික වර්ගීකරණය අනුව (ISIC)",
        "ta": "3.1.3 தேசிய தொழில் வகைப்பாடு (ISIC)",
        "exp_en": "Standard international industrial classification category",
        "exp_si": "ජාතික කර්මාන්ත වර්ගීකරණයට අනුව කාණ්ඩය තෝරන්න",
        "exp_ta": "தொழில் வகைப்பாடு குறியீடு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 3,
        "key": "q_industry_subcategory",
        "type": "text",
        "en": "3.1.4 Industry Sub-classification / Niche",
        "si": "3.1.4 කර්මාන්තයේ උප වර්ගීකරණය",
        "ta": "3.1.4 தொழில் துணை வகைப்பாடு",
        "exp_en": "Subcategory or specific specialized niche of this business",
        "exp_si": "කර්මාන්තයේ නිශ්චිත උප කාණ්ඩය සඳහන් කරන්න",
        "exp_ta": "குறிப்பிட்ட துணை வகைப்பாடு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 3,
        "key": "q_main_products_photos",
        "type": "photo",
        "en": "3.1.5 Photos of Main Products / Services (Max 3)",
        "si": "3.1.5 ව්‍යාපාරයේ ප්‍රධාන නිෂ්පාදන/සේවා (උපරිම 3)",
        "ta": "3.1.5 முக்கிய தயாரிப்புகளின் புகைப்படங்கள் (அதிகபட்சம் 3)",
        "exp_en": "Upload or take clear photos of your primary products/services",
        "exp_si": "ප්‍රධාන නිෂ්පාදන හෝ සේවාවන්හි පැහැදිලි ඡායාරූප ඇතුළත් කරන්න",
        "exp_ta": "தயாரிப்புகளின் புகைப்படங்களை பதிவேற்றவும்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 3,
        "key": "b_start_year",
        "type": "text",
        "en": "3.1.6 Date / Year Business Established",
        "si": "3.1.6 ව්‍යාපාරය ආරම්භ කළ දිනය/වර්ෂය",
        "ta": "3.1.6 வணிகம் தொடங்கப்பட்ட ஆண்டு",
        "exp_en": "Year or approximate date operations commenced",
        "exp_si": "මෙම ව්‍යාපාරය ආරම්භ කළ වර්ෂය හෝ දිනය",
        "exp_ta": "வணிகம் தொடங்கப்பட்ட ஆண்டு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 3,
        "key": "q_initial_capital",
        "type": "number",
        "en": "3.1.7 Initial Capital Investment (LKR)",
        "si": "3.1.7 ආරම්භක ප්‍රාග්ධනය (රු.)",
        "ta": "3.1.7 ஆரம்ப மூலதனம் (ரூ.)",
        "exp_en": "Total financial capital invested when the business was first started",
        "exp_si": "ව්‍යාපාරය ආරම්භයේදී ආයෝජනය කළ මුළු ප්‍රාග්ධනය රුපියල් වලින්",
        "exp_ta": "ஆரம்ப மூலதனத் தொகை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 3,
        "key": "q_capital_sources",
        "type": "multiselect",
        "en": "3.2.1 Sources of Startup / Initial Capital",
        "si": "3.2.1 ආරම්භක ප්‍රාග්ධනය ලබාගත් මූලාශ්‍ර",
        "ta": "3.2.1 ஆரம்ப மூலதன ஆதாரங்கள்",
        "exp_en": "How initial financing for business setup was obtained",
        "exp_si": "ව්‍යාපාරය ආරම්භ කිරීම සඳහා මුදල් සපයාගත් ආකාරය තෝරන්න",
        "exp_ta": "தொடக்க மூலதனம் பெறப்பட்ட ஆதாரங்கள்",
        "options": {
            "en": [
                "1. Personal Savings",
                "2. Family / Relative Assistance",
                "3. Government Grant / Subsidy",
                "4. Commercial Bank Loan",
                "5. Microfinance Institution",
                "6. NGO / Development Agency Aid",
                "7. Cooperative Society",
                "8. Informal Loan / Money Lender",
                "9. Other Source"
            ],
            "si": [
                "1. පුද්ගලික ඉතුරුම්",
                "2. පවුලේ/ඥාතීන්ගේ ආධාරය",
                "3. රජයේ ආධාරයක්/ප්‍රතිපාදනයක්",
                "4. බැංකු ණයක්",
                "5. මයික්‍රොෆයිනන්ස් ආයතනයක්",
                "6. රාජ්‍ය නොවන සංවිධානයක ආධාරය",
                "7. සමුපකාර සමිතියක්",
                "8. අනියම් ණයක් (පොලී මුදලාලි)",
                "9. වෙනත්"
            ],
            "ta": [
                "1. தனிப்பட்ட சேமிப்பு",
                "2. குடும்பம் / உறவினர் உதவி",
                "3. அரசாங்க மானியம்",
                "4. வங்கி கடன்",
                "5. மைக்ரோ ஃபைனான்ஸ்",
                "6. தன்னார்வ தொண்டு நிறுவன உதவி",
                "7. கூட்டுறவு சங்கம்",
                "8. முறைசாரா கடன்",
                "9. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 3,
        "key": "b_scale",
        "type": "select",
        "en": "3.3.1 Scale of the Enterprise",
        "si": "3.3.1 ව්‍යාපාරයේ පරිමාණය",
        "ta": "3.3.1 நிறுவனத்தின் அளவு",
        "exp_en": "Standard SME definition classification",
        "exp_si": "සේවක සංඛ්‍යාව හා ආයෝජනය අනුව ව්‍යාපාරයේ පරිමාණය",
        "exp_ta": "வணிகத்தின் அளவு வகைப்பாடு",
        "options": {
            "en": [
                "1. Micro Enterprise",
                "2. Small Enterprise",
                "3. Medium Enterprise",
                "4. Large Enterprise"
            ],
            "si": [
                "1. ක්ෂුද්‍ර (මයික්‍රො)",
                "2. කුඩා (සුළු)",
                "3. මධ්‍යම",
                "4. විශාල (මහා)"
            ],
            "ta": [
                "1. மிகச் சிறியது (மைக்ரோ)",
                "2. சிறியது",
                "3. நடுத்தரமானது",
                "4. பெரியது"
            ]
        },
        "depends_on": null
    },
    {
        "step": 3,
        "key": "q_activity_nature",
        "type": "select",
        "en": "3.3.2 Operating Frequency / Nature of Engagement",
        "si": "3.3.2 ව්‍යාපාරයේ නියැලීමේ ස්වභාවය",
        "ta": "3.3.2 வணிக செயல்பாட்டின் தன்மை",
        "exp_en": "Regularity of business operations throughout the year",
        "exp_si": "ව්‍යාපාරික කටයුතු සිදුකරන කාලසීමාව සහ වාරික ස්වභාවය",
        "exp_ta": "செயல்பாட்டு அதிர்வெண்",
        "options": {
            "en": [
                "1. Occasional / Periodic",
                "2. Few days per month",
                "3. Few days per week",
                "4. Daily Operations",
                "5. Seasonal",
                "6. Annual campaign"
            ],
            "si": [
                "1. කලාතුරකින් කරන (වාරික)",
                "2. මාසයකට දින කිහිපයක්",
                "3. සතියකට දින කිහිපයක්",
                "4. දිනපතා",
                "5. වාරයේ (කන්නයේ)",
                "6. වාර්ෂික"
            ],
            "ta": [
                "1. அவ்வப்போது / குறிப்பிட்ட காலம்",
                "2. மாதத்திற்கு சில நாட்கள்",
                "3. வாரத்திற்கு சில நாட்கள்",
                "4. தினசரி",
                "5. பருவகால",
                "6. வருடாந்திர"
            ]
        },
        "depends_on": null
    },
    {
        "step": 3,
        "key": "q_location_nature",
        "type": "select",
        "en": "3.3.3 Operational Setting",
        "si": "3.3.3 ව්‍යාපාරය සිදුකරන ස්ථානය",
        "ta": "3.3.3 வணிகம் நடைபெறும் இடம்",
        "exp_en": "Environment where the primary trade occurs",
        "exp_si": "ව්‍යාපාරික කටයුතු සිදුකරන ස්ථානයේ පරිසරය",
        "exp_ta": "வணிக இடம்",
        "options": {
            "en": [
                "1. In Home (mixed with living area)",
                "2. Separate room in house",
                "3. Separate dedicated section of premises",
                "4. Temporary outside location",
                "5. Permanent dedicated workshop / showroom"
            ],
            "si": [
                "1. නිවසේ",
                "2. නිවසේ කාමරයක",
                "3. නිවසේ වෙනම කොටසක",
                "4. වෙනම තාවකාලික ස්ථානයක",
                "5. වෙනම ස්ථිර ස්ථානයක"
            ],
            "ta": [
                "1. வீட்டில்",
                "2. வீட்டின் ஒரு அறையில்",
                "3. வீட்டின் தனிப் பகுதியில்",
                "4. தற்காலிக இடத்தில்",
                "5. நிரந்தர வணிக இடத்தில்"
            ]
        },
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_total_workers",
        "type": "number",
        "en": "4.1.1 Total Persons Working in Business (Including Owner)",
        "si": "4.1.1 ව්‍යාපාරයේ සේවය කරන මුළු පුද්ගලයින් සංඛ්‍යාව (ඔබ ඇතුළුව)",
        "ta": "4.1.1 வணிகத்தில் பணிபுரியும் மொத்த நபர்களின் எண்ணிக்கை (உரிமையாளர் உட்பட)",
        "exp_en": "Total headcount involved in daily operations",
        "exp_si": "හිමිකරු ඇතුළුව මෙහි සේවය කරන සම්පූර්ණ පිරිස",
        "exp_ta": "பணிபுரியும் மொத்த நபர்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_female_workers",
        "type": "number",
        "en": "4.1.2 Number of Female Workers",
        "si": "4.1.2 ඉන් කාන්තාවන් සංඛ්‍යාව",
        "ta": "4.1.2 அதில் பெண்களின் எண்ணிக்கை",
        "exp_en": "Total count of female staff members",
        "exp_si": "මුළු සේවකයින් අතර සිටින කාන්තා සංඛ්‍යාව",
        "exp_ta": "பெண் தொழிலாளர்களின் எண்ணிக்கை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_male_workers",
        "type": "number",
        "en": "4.1.3 Number of Male Workers",
        "si": "4.1.3 ඉන් පිරිමි සංඛ්‍යාව",
        "ta": "4.1.3 அதில் ஆண்களின் எண்ணிக்கை",
        "exp_en": "Total count of male staff members",
        "exp_si": "මුළු සේවකයින් අතර සිටින පිරිමි සංඛ්‍යාව",
        "exp_ta": "ஆண் தொழிலாளர்களின் எண்ணிக்கை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_paid_workers",
        "type": "number",
        "en": "4.1.4 Number of Paid Employees",
        "si": "4.1.4 ගෙවන සේවකයින් සංඛ්‍යාව",
        "ta": "4.1.4 ஊதியம் பெறும் தொழிலாளர்களின் எண்ணிக்கை",
        "exp_en": "Staff receiving monthly wage or daily salary",
        "exp_si": "වැටුප් හෝ දීමනා ලබන සේවකයින් ගණන",
        "exp_ta": "ஊதியம் பெறும் பணியாளர்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_unpaid_workers",
        "type": "number",
        "en": "4.1.5 Number of Unpaid Family Members Contributing",
        "si": "4.1.5 වැටුප් නොලබන පවුලේ සාමාජිකයින් සංඛ්‍යාව",
        "ta": "4.1.5 ஊதியம் பெறாத குடும்ப உறுப்பினர்களின் எண்ணிக்கை",
        "exp_en": "Family members helping out without formal wages",
        "exp_si": "වැටුපක් නොලබා උදව් කරන පවුලේ සාමාජිකයින් ගණන",
        "exp_ta": "ஊதியம் பெறாத குடும்ப உறுப்பினர்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_contract_workers",
        "type": "number",
        "en": "4.1.6 Number of Contract / Casual / Seasonal Workers",
        "si": "4.1.6 වරින් වර/කොන්ත්‍රාත් සේවය කරන අය සංඛ්‍යාව",
        "ta": "4.1.6 தற்காலிக / ஒப்பந்தத் தொழிலாளர்களின் எண்ணிக்கை",
        "exp_en": "Casual laborers hired on demand or peak seasons",
        "exp_si": "වරින් වර හෝ අවශ්‍යතාව අනුව යොදවාගන්නා අනියම් සේවකයින් ගණන",
        "exp_ta": "ஒப்பந்த / தற்காலிக தொழிலாளர்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_labor_contribution",
        "type": "select",
        "en": "4.2.1 Nature of Labor Setup",
        "si": "4.2.1 ශ්‍රම දායකත්වයේ ස්වභාවය",
        "ta": "4.2.1 உழைப்புப் பங்களிப்பின் தன்மை",
        "exp_en": "Organizational setup of the workforce",
        "exp_si": "ව්‍යාපාරයේ ශ්‍රමය සපයාගන්නා ආකාරය",
        "exp_ta": "பணியாளர் அமைப்பு வகை",
        "options": {
            "en": [
                "1. Solo (Only Myself)",
                "2. Family Labor Only",
                "3. Family Labor + Occasional Hired Help",
                "4. Permanent Employees (1-2)",
                "5. Permanent Employees (3-5)",
                "6. Permanent Employees (6-10)",
                "7. Permanent Employees (11-25)",
                "8. Large Workforce (> 25)"
            ],
            "si": [
                "1. තනියෙන්ම",
                "2. පවුලේ ශ්‍රමය පමණක්",
                "3. පවුලේ ශ්‍රමය + වරින් වර කුලියට",
                "4. ස්ථිර සේවකයින් (1-2)",
                "5. ස්ථිර සේවකයින් (3-5)",
                "6. ස්ථිර සේවකයින් (6-10)",
                "7. ස්ථිර සේවකයින් (11-25)",
                "8. ස්ථිර සේවකයින් (25 ට වැඩි)"
            ],
            "ta": [
                "1. தனியாக மட்டும்",
                "2. குடும்ப உழைப்பு மட்டும்",
                "3. குடும்ப உழைப்பு + தற்காலிக உழைப்பு",
                "4. நிரந்தர பணியாளர்கள் (1-2)",
                "5. நிரந்தர பணியாளர்கள் (3-5)",
                "6. நிரந்தர பணியாளர்கள் (6-10)",
                "7. நிரந்தர பணியாளர்கள் (11-25)",
                "8. 25 க்கும் மேற்பட்ட பணியாளர்கள்"
            ]
        },
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_training_provided",
        "type": "select",
        "en": "4.2.2 Is Skill Training Provided to Employees?",
        "si": "4.2.2 සේවකයින්ට පුහුණුව ලබා දෙනවාද?",
        "ta": "4.2.2 பணியாளர்களுக்கு பயிற்சி வழங்கப்படுகிறதா?",
        "exp_en": "On-the-job training or external institutional skills training",
        "exp_si": "සේවකයින්ගේ කුසලතා වර්ධනය සඳහා පුහුණුව ලබාදෙන්නේදැයි තෝරන්න",
        "exp_ta": "தொழிலாளர் பயிற்சி",
        "options": {
            "en": [
                "1. Yes (Formal Training / Certified)",
                "2. Yes (On-the-job Informal Training)",
                "3. No"
            ],
            "si": [
                "1. ඔව් (විධිමත්)",
                "2. ඔව් (රැකියාවේදී)",
                "3. නැත"
            ],
            "ta": [
                "1. ஆம் (முறையான பயிற்சி)",
                "2. ஆம் (வேலையிட பயிற்சி)",
                "3. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 4,
        "key": "q_epf_payment",
        "type": "select",
        "en": "4.2.3 Are EPF / ETF Contributions Made for Employees?",
        "si": "4.2.3 සේවකයින් සඳහා EPF ගෙවීම් සිදු කරනවාද?",
        "ta": "4.2.3 ஊழியர்களுக்கு EPF/ETF செலுத்தப்படுகிறதா?",
        "exp_en": "Statutory employee provident fund compliance",
        "exp_si": "සේවක අර්ථසාධක හා භාර අරමුදල් ගෙවීම් සිදුකරන්නේද?",
        "exp_ta": "EPF பங்களிப்பு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_machinery_photos",
        "type": "photo",
        "en": "5.1.1 Main Machinery Used (Photos - Max 5)",
        "si": "5.1.1 භාවිතා කරන ප්‍රධාන යන්ත්‍රෝපකරණ (උපරිම 5)",
        "ta": "5.1.1 பயன்படுத்தப்படும் முக்கிய இயந்திரங்கள் (புகைப்படங்கள் - அதிகபட்சம் 5)",
        "exp_en": "Photographs and names of main manufacturing/processing machinery",
        "exp_si": "නිෂ්පාදන කටයුතුවලට භාවිතා කරන ප්‍රධාන යන්ත්‍රවල ඡායාරූප",
        "exp_ta": "இயந்திரங்களின் புகைப்படங்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_tools_photos",
        "type": "photo",
        "en": "5.1.2 Main Tools & Equipment Used (Photos - Max 5)",
        "si": "5.1.2 භාවිතා කරන ප්‍රධාන මෙවලම් (උපරිම 5)",
        "ta": "5.1.2 பயன்படுத்தப்படும் முக்கிய கருவிகள் (புகைப்படங்கள் - அதிகபட்சம் 5)",
        "exp_en": "Photographs and list of handheld and powered tools utilized",
        "exp_si": "භාවිතා කරන ප්‍රධාන අත් මෙවලම් හා උපකරණවල ඡායාරූප",
        "exp_ta": "கருவிகளின் புகைப்படங்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_machinery_value",
        "type": "number",
        "en": "5.1.3 Approximate Value of Machinery & Tools (LKR)",
        "si": "5.1.3 යන්ත්‍රෝපකරණවල ආසන්න වටිනාකම (රු.)",
        "ta": "5.1.3 இயந்திரங்கள் மற்றும் கருவிகளின் தோராயமான மதிப்பு (ரூ.)",
        "exp_en": "Current estimated market/replacement value of all production equipment",
        "exp_si": "සියලු යන්ත්‍ර හා මෙවලම්වල වත්මන් වෙළඳපල වටිනාකම රුපියල් වලින්",
        "exp_ta": "இயந்திரங்களின் தோராயமான மதிப்பு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_machinery_acquisition",
        "type": "multiselect",
        "en": "5.1.4 How Machinery & Tools Were Acquired",
        "si": "5.1.4 යන්ත්‍රෝපකරණ ලබාගත් ආකාරය",
        "ta": "5.1.4 இயந்திரங்கள் பெறப்பட்ட முறை",
        "exp_en": "Method of equipment acquisition",
        "exp_si": "යන්ත්‍රෝපකරණ හිමිකරගත් ආකාරය තෝරන්න",
        "exp_ta": "இயந்திரங்கள் கையகப்படுத்தப்பட்ட விதம்",
        "options": {
            "en": [
                "1. Purchased Brand New",
                "2. Purchased Used / Reconditioned",
                "3. Rented / Leased",
                "4. Fabricated / Self-made",
                "5. Gift / Family Inherited",
                "6. Government / Development Grant",
                "7. Other"
            ],
            "si": [
                "1. අලුතින් මිලදී ගත්තා",
                "2. පාවිච්චි කළ ඒවා මිලදී ගත්තා",
                "3. කුලියට ගත්තා",
                "4. තනිවම සාදා ගත්තා",
                "5. තෑග්ගක් / පවුලෙන් උරුම වූ",
                "6. රජයෙන් / ආධාර වලින් ලැබුණා",
                "7. වෙනත්"
            ],
            "ta": [
                "1. புதிதாக வாங்கப்பட்டது",
                "2. பயன்படுத்தியதை வாங்கியது",
                "3. வாடகைக்கு எடுக்கப்பட்டது",
                "4. சுயமாக தயாரிக்கப்பட்டது",
                "5. அன்பளிப்பு / பரம்பரை",
                "6. அரசாங்க மானியம்",
                "7. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_daily_output",
        "type": "text",
        "en": "5.2.1 Daily Production Output",
        "si": "5.2.1 දිනකට නිෂ්පාදනය කරන ප්‍රමාණය",
        "ta": "5.2.1 தினசரி உற்பத்தி அளவு",
        "exp_en": "Average daily quantity produced (with units, e.g., 50 kg, 20 units)",
        "exp_si": "දිනකට නිපදවන සාමාන්‍ය ප්‍රමාණය සහ ඒකකය (උදා: කිලෝ 50, ඒකක 20)",
        "exp_ta": "தினசரி உற்பத்தி அளவு மற்றும் அலகு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_weekly_output",
        "type": "text",
        "en": "5.2.2 Weekly Production Output",
        "si": "5.2.2 සතියකට නිෂ්පාදනය කරන ප්‍රමාණය",
        "ta": "5.2.2 வாராந்திர உற்பத்தி அளவு",
        "exp_en": "Average weekly quantity produced",
        "exp_si": "සතියක සාමාන්‍ය නිෂ්පාදන ප්‍රමාණය",
        "exp_ta": "வாராந்திர உற்பத்தி அளவு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_monthly_output",
        "type": "text",
        "en": "5.2.3 Monthly Production Output",
        "si": "5.2.3 මාසයකට නිෂ්පාදනය කරන ප්‍රමාණය",
        "ta": "5.2.3 மாதாந்திர உற்பத்தி அளவு",
        "exp_en": "Average monthly quantity produced",
        "exp_si": "මාසික සාමාන්‍ය නිෂ්පාදන ප්‍රමාණය",
        "exp_ta": "மாதாந்திர உற்பத்தி அளவு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_yearly_output",
        "type": "text",
        "en": "5.2.4 Estimated Annual Production Output",
        "si": "5.2.4 වාර්ෂික නිෂ්පාදන ප්‍රමාණය (ඇස්තමේන්තුව)",
        "ta": "5.2.4 மதிப்பிடப்பட்ட வருடாந்திர உற்பத்தி அளவு",
        "exp_en": "Annual total production capacity or actual output",
        "exp_si": "වසරක ඇස්තමේන්තුගත මුළු නිෂ්පාදන ප්‍රමාණය",
        "exp_ta": "ஆண்டு உற்பத்தி அளவு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_capacity_utilization",
        "type": "number",
        "en": "5.2.5 Percentage of Production Capacity Utilized (%)",
        "si": "5.2.5 නිෂ්පාදන ධාරිතාවයේ භාවිත ප්‍රතිශතය (%)",
        "ta": "5.2.5 பயன்படுத்தப்படும் உற்பத்தி திறன் சதவீதம் (%)",
        "exp_en": "Percentage of maximum possible capacity currently active (0-100%)",
        "exp_si": "යන්ත්‍රවල උපරිම ධාරිතාවෙන් දැනට ප්‍රයෝජනයට ගන්නා ප්‍රතිශතය",
        "exp_ta": "பயன்படுத்தப்படும் உற்பத்தி திறன் சதவீதம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_daily_hours",
        "type": "number",
        "en": "5.2.6 Operational Working Hours Per Day",
        "si": "5.2.6 දිනකට මෙහෙයුම් පැය ගණන",
        "ta": "5.2.6 ஒரு நாளைக்கு இயக்கப்படும் வேலை நேரம்",
        "exp_en": "Number of active operating hours per working day",
        "exp_si": "දිනකට කර්මාන්තය ක්‍රියාත්මක වන සාමාන්‍ය පැය ගණන",
        "exp_ta": "ஒரு நாளைக்கு வேலை செய்யும் நேரம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_raw_materials_photos",
        "type": "photo",
        "en": "5.3.1 Main Raw Materials Used (Photos - Max 5)",
        "si": "5.3.1 භාවිතා කරන ප්‍රධාන අමුද්‍රව්‍ය (උපරිම 5)",
        "ta": "5.3.1 பயன்படுத்தப்படும் முக்கிய மூலப்பொருட்கள் (புகைப்படங்கள் - அதிகபட்சம் 5)",
        "exp_en": "Photographs and names of main input materials",
        "exp_si": "නිෂ්පාදනය සඳහා ගන්නා ප්‍රධාන අමුද්‍රව්‍යවල ඡායාරූප",
        "exp_ta": "மூலப்பொருட்களின் புகைப்படங்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_raw_sources",
        "type": "multiselect",
        "en": "5.3.2 How Raw Materials are Sourced",
        "si": "5.3.2 අමුද්‍රව්‍ය සපයා ගන්නා ආකාරය",
        "ta": "5.3.2 மூலப்பொருட்கள் பெறப்படும் முறை",
        "exp_en": "Geographical origin and procurement channel of inputs",
        "exp_si": "අමුද්‍රව්‍ය ලබාගන්නා ස්ථාන සහ ක්‍රම තෝරන්න",
        "exp_ta": "மூலப்பொருள் ஆதாரங்கள்",
        "options": {
            "en": [
                "1. From Own Land / Farm",
                "2. Free from Local Surroundings",
                "3. Purchased Locally (Village / Town)",
                "4. Purchased from Nearby City",
                "5. Purchased from Colombo / Wholesale Hub",
                "6. Imported Directly from Overseas",
                "7. From Commercial Distributor"
            ],
            "si": [
                "1. තම ඉඩමෙන්ම",
                "2. ප්‍රදේශයෙන් නොමිලේ",
                "3. ප්‍රදේශයෙන් මුදලට",
                "4. නගරයෙන් මිලදී ගනී",
                "5. කොළඹින් මිලදී ගනී",
                "6. විදෙස් රටකින් ආනයනය",
                "7. බෙදාහරින්නෙකුගෙන්"
            ],
            "ta": [
                "1. சொந்த நிலத்தில் இருந்து",
                "2. உள்ளூரிலிருந்து இலவசமாக",
                "3. உள்ளூரிலிருந்து பணம் கொடுத்து",
                "4. நகரத்திலிருந்து வாங்குதல்",
                "5. கொழும்பில் இருந்து வாங்குதல்",
                "6. வெளிநாட்டிலிருந்து இறக்குமதி",
                "7. விநியோகஸ்தரிடமிருந்து"
            ]
        },
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_raw_license",
        "type": "select",
        "en": "5.3.3 Is a Permit Required for Raw Materials?",
        "si": "5.3.3 අමුද්‍රව්‍ය සඳහා බලපත්‍රයක් අවශ්‍යද?",
        "ta": "5.3.3 மூலப்பொருட்களுக்கு அனுமதிப்பத்திரம் தேவையா?",
        "exp_en": "Legal permit requirement for extraction, transport or storage",
        "exp_si": "අමුද්‍රව්‍ය ප්‍රවාහනයට හෝ ළඟ තබා ගැනීමට විශේෂ බලපත්‍ර අවශ්‍යද?",
        "exp_ta": "மூலப்பொருள் அனுமதி தேவை",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_raw_license_agency",
        "type": "select",
        "en": "5.3.4 If Permit Required, from Which Institution?",
        "si": "5.3.4 බලපත්‍රය අවශ්‍ය නම් කුමන ආයතනයෙන්ද?",
        "ta": "5.3.4 அனுமதி தேவைப்பட்டால், எந்த நிறுவனத்திலிருந்து?",
        "exp_en": "Issuing agency for the raw material transport or extraction permit",
        "exp_si": "බලපත්‍රය නිකුත් කරන රජයේ ආයතනය",
        "exp_ta": "அனுமதி வழங்கும் நிறுவனம்",
        "options": {
            "en": [
                "1. Police Department",
                "2. Divisional Secretariat",
                "3. Central Government / Ministry (GSMB, Forest, etc.)",
                "4. Other Agency"
            ],
            "si": [
                "1. පොලීසියෙන්",
                "2. ප්‍රාදේශීය ලේකම් කාර්යාලයෙන්",
                "3. මධ්‍යම රජයෙන් (භූ විද්‍යා / වන සංරක්ෂණ ආදී)",
                "4. වෙනත්"
            ],
            "ta": [
                "1. காவல்துறை",
                "2. பிரதேச செயலகம்",
                "3. மத்திய அரசு / அமைச்சு",
                "4. மற்றவை"
            ]
        },
        "depends_on": "q_raw_license:1"
    },
    {
        "step": 5,
        "key": "q_raw_cost",
        "type": "number",
        "en": "5.3.5 Average Monthly Expenditure on Raw Materials (LKR)",
        "si": "5.3.5 අමුද්‍රව්‍ය සඳහා මාසික වියදම (රු.)",
        "ta": "5.3.5 மூலப்பொருட்களுக்கான சராசரி மாதாந்திர செலவு (ரூ.)",
        "exp_en": "Total average monthly cost incurred purchasing inputs",
        "exp_si": "අමුද්‍රව්‍ය මිලදී ගැනීම සඳහා මසකට දරන මුළු වියදම රුපියල් වලින්",
        "exp_ta": "மூலப்பொருட்களுக்கான மாதாந்திர செலவு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_waste_disposal",
        "type": "multiselect",
        "en": "5.4.1 Method of Waste Disposal",
        "si": "5.4.1 අපද්‍රව්‍ය බැහැර කරන ආකාරය",
        "ta": "5.4.1 கழிவு அகற்றல் முறை",
        "exp_en": "How by-products and industrial waste are handled",
        "exp_si": "නිෂ්පාදන අපද්‍රව්‍ය කළමනාකරණය කරන ආකාරය තෝරන්න",
        "exp_ta": "கழிவுகளை அகற்றும் முறைகள்",
        "options": {
            "en": [
                "1. Recycled on-site",
                "2. Transported and dumped elsewhere",
                "3. Handed to Local Government / Municipal waste collection",
                "4. Burnt on premises",
                "5. Buried / Composted",
                "6. Sold to scrap / recyclers",
                "7. Other"
            ],
            "si": [
                "1. ස්ථානයේම ප්‍රතිචක්‍රීකරණය කරයි",
                "2. වෙනත් ස්ථානයකට ගෙන ගොස් බැහැර කරයි",
                "3. පළාත් පාලන ආයතනයට ලබා දෙයි",
                "4. පුළුස්සා දමයි",
                "5. වළලමින් බැහැර කරයි",
                "6. යකඩ / අපද්‍රව්‍ය මිලදී ගන්නන්ට විකුණයි",
                "7. වෙනත්"
            ],
            "ta": [
                "1. தளத்திலேயே மறுசுழற்சி செய்யப்படுகிறது",
                "2. வேறு இடத்திற்கு கொண்டு செல்லப்படுகிறது",
                "3. உள்ளூராட்சி சபையிடம் ஒப்படைக்கப்படுகிறது",
                "4. எரிக்கப்படுகிறது",
                "5. புதைக்கப்படுகிறது",
                "6. பழைய இரும்பு வியாபாரிகளுக்கு விற்பனை",
                "7. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_waste_recycle",
        "type": "select",
        "en": "5.4.2 Do You Recycle Any By-products or Waste?",
        "si": "5.4.2 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණය කරනවාද?",
        "ta": "5.4.2 கழிவுகளை மறுசுழற்சி செய்கிறீர்களா?",
        "exp_en": "Whether internal recycling or reuse occurs",
        "exp_si": "අපද්‍රව්‍ය නැවත ප්‍රයෝජනයට ගැනීම හෝ ප්‍රතිචක්‍රීකරණය සිදුකරන්නේද?",
        "exp_ta": "கழிவு மறுசுழற்சி",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 5,
        "key": "q_waste_income",
        "type": "select",
        "en": "5.4.3 Do You Earn an Income from Waste / By-products?",
        "si": "5.4.3 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණයෙන් හෝ විකිණීමෙන් ආදායමක් ලැබේද?",
        "ta": "5.4.3 கழிவு விற்பனையிலிருந்து வருமானம் கிடைக்கிறதா?",
        "exp_en": "Revenue generation from scrap or recyclable waste",
        "exp_si": "අපද්‍රව්‍ය විකිණීමෙන් අමතර ආදායමක් ලැබේදැයි තෝරන්න",
        "exp_ta": "கழிவுகளிலிருந்து கிடைக்கும் வருமானம்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_profit_calculated",
        "type": "select",
        "en": "6.1.1 Is Net Profit Formally Calculated?",
        "si": "6.1.1 ලාභය ගණනය කර තිබේද?",
        "ta": "6.1.1 லாபம் முறையாக கணக்கிடப்படுகிறதா?",
        "exp_en": "Whether the business accurately tracks profit margins",
        "exp_si": "ව්‍යාපාරයේ ශුද්ධ ලාභය නිශ්චිතව ගණනය කර තිබේදැයි තෝරන්න",
        "exp_ta": "லாப கணக்கீடு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_unit_cost_calculated",
        "type": "select",
        "en": "6.1.2 Is Unit Production Cost Calculated?",
        "si": "6.1.2 ඒකක නිෂ්පාදන පිරිවැය ගණනය කර තිබේද?",
        "ta": "6.1.2 ஒரு அலகு உற்பத்தி செலவு கணக்கிடப்படுகிறதா?",
        "exp_en": "Whether cost-per-unit is tracked for pricing accuracy",
        "exp_si": "එක් භාණ්ඩ ඒකකයක් නිපදවීමට යන පිරිවැය ගණනය කරන්නේද?",
        "exp_ta": "அலகு செலவு கணக்கீடு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_monthly_revenue",
        "type": "number",
        "en": "6.1.3 Approximate Monthly Gross Revenue / Sales (LKR)",
        "si": "6.1.3 මාසික ආදායම (ආසන්න) (රු.)",
        "ta": "6.1.3 தோராயமான மாதாந்திர மொத்த வருமானம் (ரூ.)",
        "exp_en": "Total sales revenue before deducting expenses",
        "exp_si": "මසකට ලබන දළ අලෙවි ආදායම රුපියල් වලින්",
        "exp_ta": "மாதாந்திர மொத்த வருமானம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_monthly_expense",
        "type": "number",
        "en": "6.1.4 Approximate Monthly Total Expenses (LKR)",
        "si": "6.1.4 මාසික වියදම (ආසන්න) (රු.)",
        "ta": "6.1.4 தோராயமான மாதாந்திர செலவுகள் (ரூ.)",
        "exp_en": "Total monthly running costs including raw materials, wages, utilities",
        "exp_si": "අමුද්‍රව්‍ය, වැටුප් හා බිල්පත් ඇතුළු මසක මුළු වියදම රුපියල් වලින්",
        "exp_ta": "மாதாந்திர மொத்த செலவு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_monthly_profit",
        "type": "number",
        "en": "6.1.5 Approximate Monthly Net Profit (LKR)",
        "si": "6.1.5 මාසික ශුද්ධ ලාභය (ආසන්න) (රු.)",
        "ta": "6.1.5 தோராயமான மாதாந்திர நிகர லாபம் (ரூ.)",
        "exp_en": "Estimated monthly net profit remaining after all expenses",
        "exp_si": "වියදම් අඩු කිරීමෙන් පසු ඉතිරිවන මාසික ශුද්ධ ලාභය",
        "exp_ta": "மாதாந்திர நிகர லாபம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_profitable",
        "type": "select",
        "en": "6.1.6 Is the Enterprise Operating Profitably Overall?",
        "si": "6.1.6 ව්‍යාපාරය ලාභ සහිතව කරගෙන යනවාද?",
        "ta": "6.1.6 வணிகம் பொதுவாக லாபகரமாக இயங்குகிறதா?",
        "exp_en": "Overall financial health and profitability status",
        "exp_si": "ව්‍යාපාරය ලාභදායී ලෙස පවත්වාගෙන යන්නේදැයි හිමිකරුගේ අදහස",
        "exp_ta": "வணிகத்தின் லாப நிலை",
        "options": {
            "en": [
                "1. Yes (Consistent Profit)",
                "2. No (In Loss / Struggling)",
                "3. Sometimes / Break-even"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත",
                "3. සමහර විට (වියදම පියවේ)"
            ],
            "ta": [
                "1. ஆம் (லாபகரமாக)",
                "2. இல்லை (நஷ்டத்தில்)",
                "3. சில நேரங்களில்"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_debt_installment_1",
        "type": "text",
        "en": "6.1.7 Monthly Loan Repayment Installments",
        "si": "6.1.7 ණය ගෙවීමේ වාරික (රු.)",
        "ta": "6.1.7 மாதாந்திர கடன் தவணைத் தொகைகள் (ரூ.)",
        "exp_en": "Monthly installment amounts paid towards business loans",
        "exp_si": "ව්‍යාපාර ණය වෙනුවෙන් මසකට ගෙවන වාරික මුදල",
        "exp_ta": "மாதாந்திர கடன் தவணை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_business_debt",
        "type": "number",
        "en": "6.1.8 Total Outstanding Business Debt / Loans (LKR)",
        "si": "6.1.8 ව්‍යාපාරයක් ලෙස ගෙවිය යුතු මුළු ණය ප්‍රමාණය (රු.)",
        "ta": "6.1.8 செலுத்த வேண்டிய மொத்த வணிகக் கடன் (ரூ.)",
        "exp_en": "Total balance remaining to be settled across all business facilities",
        "exp_si": "ව්‍යාපාරය නමින් ලබාගෙන ඇති සමස්ත ණය ප්‍රමාණය රුපියල් වලින්",
        "exp_ta": "வணிகக் கடன் தொகை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_personal_debt",
        "type": "number",
        "en": "6.1.9 Personal Debt Incurred for Business Purpose (LKR)",
        "si": "6.1.9 පුද්ගලිකව ණය වී ඇති ප්‍රමාණය (ව්‍යාපාරය සඳහා) (රු.)",
        "ta": "6.1.9 வணிகத்திற்காக பெறப்பட்ட தனிப்பட்ட கடன் (ரூ.)",
        "exp_en": "Personal borrowings or pawned jewelry used to fund business activities",
        "exp_si": "ව්‍යාපාරය වෙනුවෙන් පෞද්ගලිකව ලබාගෙන ඇති ණය හෝ උකස් මුදල්",
        "exp_ta": "தனிப்பட்ட கடன் தொகை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_bank_account",
        "type": "select",
        "en": "6.2.1 Business Bank Account Status",
        "si": "6.2.1 ව්‍යාපාරය සඳහා බැංකු ගිණුමක් තිබේද?",
        "ta": "6.2.1 வணிக வங்கி கணக்கு நிலை",
        "exp_en": "Whether a dedicated commercial account is maintained",
        "exp_si": "ව්‍යාපාරය නමින් වෙනම බැංකු ගිණුමක් පවත්වාගෙන යන්නේදැයි තෝරන්න",
        "exp_ta": "வங்கி கணக்கு நிலை",
        "options": {
            "en": [
                "1. Yes (Dedicated Business Account)",
                "2. No (Uses Personal Bank Account)",
                "3. No Bank Account Used"
            ],
            "si": [
                "1. ඔව් (ව්‍යාපාරික ගිණුමක් ඇත)",
                "2. නැත, පුද්ගලික ගිණුම භාවිතා කරයි",
                "3. ගිණුමක් නැත"
            ],
            "ta": [
                "1. ஆம் (வணிக கணக்கு)",
                "2. இல்லை (தனிப்பட்ட கணக்கு)",
                "3. கணக்கு இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_accounting_records",
        "type": "select",
        "en": "6.2.2 Are Accounting Books / Records Maintained?",
        "si": "6.2.2 ගිණුම් පවත්වාගෙන යනවාද?",
        "ta": "6.2.2 கணக்கு புத்தகங்கள் பராமரிக்கப்படுகிறதா?",
        "exp_en": "Daily bookkeeping, ledgers, or digital accounting records",
        "exp_si": "දෛනික ආදායම් වියදම් සටහන් පොත් හෝ මෘදුකාංග මඟින් පවත්වාගෙන යන්නේද?",
        "exp_ta": "கணக்கியல் பதிவுகள்",
        "options": {
            "en": [
                "1. Yes (Formal Audited / Professional Books)",
                "2. Yes (Informal Cash Book / Diary Notes)",
                "3. No Formal Records"
            ],
            "si": [
                "1. ඔව් (විධිමත් ගිණුම් පොත්)",
                "2. ඔව් (අවිධිමත් / සටහන් පොත්)",
                "3. නැත"
            ],
            "ta": [
                "1. ஆம் (முறையான புத்தகங்கள்)",
                "2. ஆம் (குறிப்பேடுகள்)",
                "3. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_crib_status",
        "type": "select",
        "en": "6.2.3 Credit Information Bureau (CRIB) History",
        "si": "6.2.3 CRIB (Credit Information Bureau) ගිණුමක් තිබේද?",
        "ta": "6.2.3 CRIB கடன் அறிக்கை நிலை",
        "exp_en": "Borrowing record status with Credit Information Bureau",
        "exp_si": "හිමිකරු හෝ ව්‍යාපාරය CRIB දත්ත පද්ධතිය තුළ ලියාපදිංචි වී ඇත්දැයි තෝරන්න",
        "exp_ta": "CRIB கடன் வரலாறு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_loan_access",
        "type": "select",
        "en": "6.2.4 Ease of Obtaining a Business Bank Loan",
        "si": "6.2.4 ණය ලබා ගැනීමේ පහසුව",
        "ta": "6.2.4 வங்கி கடன் பெறுவதில் உள்ள எளிமை",
        "exp_en": "Perceived accessibility of commercial bank financing",
        "exp_si": "බැංකුවලින් ව්‍යාපාර ණයක් ලබා ගැනීමේ පහසුව හෝ අපහසුතාව",
        "exp_ta": "கடன் பெறுவதில் உள்ள எளிமை",
        "options": {
            "en": [
                "1. Very Easy",
                "2. Easy",
                "3. Difficult",
                "4. Very Difficult"
            ],
            "si": [
                "1. ඉතා පහසුයි",
                "2. පහසුයි",
                "3. අපහසුයි",
                "4. ඉතා අපහසුයි"
            ],
            "ta": [
                "1. மிகவும் எளிதானது",
                "2. எளிதானது",
                "3. கடினமானது",
                "4. மிகவும் கடினமானது"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_financial_decisions",
        "type": "multiselect",
        "en": "6.3.1 How Financial Decisions are Made in Business",
        "si": "6.3.1 ඔබ ව්‍යාපාරයේ මූල්‍ය තීරණ ගන්නේ කෙසේද?",
        "ta": "6.3.1 வணிகத்தில் நிதி முடிவுகள் எவ்வாறு எடுக்கப்படுகின்றன?",
        "exp_en": "Advisory sources consulted before taking major financial decisions",
        "exp_si": "ආයෝජන හෝ මූල්‍ය තීරණ ගැනීමේදී උපදෙස් ලබාගන්නා ආකාරය",
        "exp_ta": "நிதி முடிவுகள் எடுக்கும் முறை",
        "options": {
            "en": [
                "1. Alone (Owner Only)",
                "2. Consulting with Family",
                "3. With an Accountant / Financial Advisor",
                "4. With a Bank Officer / Credit Advisor",
                "5. Other"
            ],
            "si": [
                "1. තනිවම",
                "2. පවුලේ අය සමඟ සාකච්ඡා කර",
                "3. ගිණුම් උපදේශකයෙකු සමඟ",
                "4. බැංකු උපදේශකයෙකු සමඟ",
                "5. වෙනත්"
            ],
            "ta": [
                "1. தனியாக",
                "2. குடும்பத்துடன் ஆலோசித்து",
                "3. கணக்காளருடன்",
                "4. வங்கி அதிகாரியுடன்",
                "5. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_interest_rate_awareness",
        "type": "select",
        "en": "6.3.2 Do You Compare Interest Rates Before Borrowing?",
        "si": "6.3.2 ව්‍යාපාර ණය ගැනීමේදී පොලී අනුපාතය ගැන සලකා බලනවාද?",
        "ta": "6.3.2 கடன் வாங்கும் முன் வட்டி விகிதத்தை கவனிக்கிறீர்களா?",
        "exp_en": "Financial literacy regarding borrowing terms and APR",
        "exp_si": "ණය ගැනීමේදී විවිධ බැංකුවල පොලී අනුපාත සංසන්දනය කරන්නේද?",
        "exp_ta": "வட்டி விகித விழிப்புணர்வு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 6,
        "key": "q_contract_terms_read",
        "type": "select",
        "en": "6.3.3 Do You Thoroughly Read Terms Before Signing Loan Contracts?",
        "si": "6.3.3 ණය ගිවිසුමක් අත්සන් කිරීමට පෙර එහි කොන්දේසි කියවනවාද?",
        "ta": "6.3.3 ஒப்பந்தத்தில் கையெழுத்திடும் முன் நிபந்தனைகளை படிக்கிறீர்களா?",
        "exp_en": "Due diligence when signing financial legal agreements",
        "exp_si": "ණය ගිවිසුමක ඇති නීතිමය කොන්දේසි කියවා බලා තේරුම් ගන්නේද?",
        "exp_ta": "ஒப்பந்த நிபந்தனைகளை படித்தல்",
        "options": {
            "en": [
                "1. Always",
                "2. Most of the time",
                "3. Rarely",
                "4. Never"
            ],
            "si": [
                "1. සැමවිටම",
                "2. බොහෝ විට",
                "3. කලාතුරකින්",
                "4. කිසි විටෙක නැත"
            ],
            "ta": [
                "1. எப்போதும்",
                "2. பெரும்பாலான நேரங்களில்",
                "3. அரிதாக",
                "4. ஒருபோதும் இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_customers",
        "type": "multiselect",
        "en": "7.1.1 Who are Your Main Buyers / Customers?",
        "si": "7.1.1 ප්‍රධාන ගැනුම්කරුවන් කවුද?",
        "ta": "7.1.1 உங்கள் முக்கிய வாடிக்கையாளர்கள் யார்?",
        "exp_en": "Primary consumer profile and customer segment",
        "exp_si": "නිෂ්පාදන හෝ සේවා මිලදී ගන්නා ප්‍රධාන පාරිභෝගික කණ්ඩායම්",
        "exp_ta": "முக்கிய வாடிக்கையாளர் பிரிவுகள்",
        "options": {
            "en": [
                "1. Local Area Residents / Community",
                "2. Customers from Outside the Village/Area",
                "3. Other Businesses (B2B)",
                "4. Wholesalers / Middlemen",
                "5. Government Institutions",
                "6. Direct Export Customers"
            ],
            "si": [
                "1. ප්‍රදේශයේ පාරිභෝගිකයින් (ගම තුළ)",
                "2. ප්‍රදේශයෙන් පිටත පාරිභෝගිකයින්",
                "3. වෙනත් ව්‍යාපාරිකයින් (B2B)",
                "4. අතරමැදියන්/තොග වෙළඳුන්",
                "5. රජයේ ආයතන",
                "6. අපනයනය සඳහා"
            ],
            "ta": [
                "1. உள்ளூர் வாடிக்கையாளர்கள்",
                "2. பகுதிக்கு வெளியே உள்ள வாடிக்கையாளர்கள்",
                "3. மற்ற வணிகங்கள் (B2B)",
                "4. இடைத்தரகர்கள் / மொத்த விற்பனையாளர்கள்",
                "5. அரசாங்க நிறுவனங்கள்",
                "6. ஏற்றுமதி வாடிக்கையாளர்கள்"
            ]
        },
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_market_extent",
        "type": "multiselect",
        "en": "7.1.2 Geographical Extent of Your Market",
        "si": "7.1.2 භාණ්ඩ/සේවා විකුණන වෙළඳපල ප්‍රදේශය",
        "ta": "7.1.2 சந்தையின் புவியியல் பரப்பு",
        "exp_en": "Geographical reach where products are sold",
        "exp_si": "ඔබේ නිෂ්පාදන හෝ සේවා අලෙවි වන භූගෝලීය සීමාව තෝරන්න",
        "exp_ta": "சந்தை எல்லைகள்",
        "options": {
            "en": [
                "1. Village / Local Community",
                "2. Divisional / Regional",
                "3. District Level",
                "4. Western Province / Colombo",
                "5. National (Islandwide)",
                "6. Export / International"
            ],
            "si": [
                "1. ප්‍රජාව (ගම තුළ)",
                "2. ප්‍රාදේශීය",
                "3. දිස්ත්‍රික්කය",
                "4. කොළඹ / බස්නාහිර",
                "5. ජාතික (දිවයින පුරා)",
                "6. අපනයන"
            ],
            "ta": [
                "1. கிராமம் / உள்ளூர்",
                "2. பிரதேச மட்டம்",
                "3. மாவட்ட மட்டம்",
                "4. கொழும்பு",
                "5. தேசிய அளவில்",
                "6. ஏற்றுமதி"
            ]
        },
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_export",
        "type": "select",
        "en": "7.1.3 Do You Export Directly or Indirectly?",
        "si": "7.1.3 අපනයනය කරන්නේද?",
        "ta": "7.1.3 நேரடியாகவோ மறைமுகமாகவோ ஏற்றுமதி செய்கிறீர்களா?",
        "exp_en": "Direct international export sales or indirect supplying to exporters",
        "exp_si": "ඔබේ නිෂ්පාදන විදේශ රටවලට අපනයනය කරන්නේදැයි තෝරන්න",
        "exp_ta": "ஏற்றுமதி விற்பனை",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_village_competitors",
        "type": "number",
        "en": "7.2.1 Competitors Operating in Same Industry Within Village",
        "si": "7.2.1 මෙම කර්මාන්තය ගම තුළ කරන පිරිස් සංඛ්‍යාව",
        "ta": "7.2.1 கிராமத்தில் இதே தொழிலைச் செய்யும் நபர்களின் எண்ணிக்கை",
        "exp_en": "Number of similar micro-enterprises in your local village",
        "exp_si": "මෙම කර්මාන්තයේම නියැලෙන වෙනත් පිරිස් ගම තුළ කීදෙනෙක් සිටීද?",
        "exp_ta": "கிராமத்தில் உள்ள போட்டியாளர்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_main_competitors",
        "type": "number",
        "en": "7.2.2 Total Key Competitors in Wider Area",
        "si": "7.2.2 ප්‍රධාන තරඟකරුවන් සංඛ්‍යාව (ප්‍රදේශය තුළ)",
        "ta": "7.2.2 பகுதியில் உள்ள முக்கிய போட்டியாளர்களின் எண்ணிக்கை",
        "exp_en": "Estimated number of competing businesses in your division/district",
        "exp_si": "ප්‍රාදේශීය ලේකම් කොට්ඨාශය තුළ සිටින තරඟකාරී ව්‍යාපාර ගණන",
        "exp_ta": "பகுதியில் உள்ள மொத்த போட்டியாளர்கள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_competition_level",
        "type": "select",
        "en": "7.2.3 Perceived Intensity of Market Competition",
        "si": "7.2.3 තරඟකාරිත්වයේ මට්ටම",
        "ta": "7.2.3 சந்தை போட்டியின் தீவிரம்",
        "exp_en": "Market competition pressure on pricing and customer retention",
        "exp_si": "වෙළඳපල තුළ පවතින තරඟකාරිත්වයේ ප්‍රබලතාව තෝරන්න",
        "exp_ta": "போட்டி நிலை",
        "options": {
            "en": [
                "1. Very High",
                "2. High",
                "3. Moderate",
                "4. Low",
                "5. No Direct Competitors"
            ],
            "si": [
                "1. ඉතා ඉහළ",
                "2. ඉහළ",
                "3. මධ්‍යස්ථ",
                "4. අඩු",
                "5. තරඟකරුවන් නැත"
            ],
            "ta": [
                "1. மிகவும் அதிகம்",
                "2. அதிகம்",
                "3. நடுத்தரமானது",
                "4. குறைவு",
                "5. நேரடி போட்டியாளர்கள் இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_marketing_methods",
        "type": "multiselect",
        "en": "7.3.1 Marketing & Promotional Methods Used",
        "si": "7.3.1 භාවිතා කරන අලෙවිකරණ ක්‍රම",
        "ta": "7.3.1 பயன்படுத்தப்படும் சந்தைப்படுத்தல் முறைகள்",
        "exp_en": "Channels used to promote the business and find new customers",
        "exp_si": "පාරිභෝගිකයින් ආකර්ෂණය කර ගැනීමට භාවිතා කරන ක්‍රම",
        "exp_ta": "சந்தைப்படுத்தல் உத்திகள்",
        "options": {
            "en": [
                "1. Social Media Marketing",
                "2. Word of Mouth / Village Reputation",
                "3. Wholesale to Local Shops",
                "4. Online Platforms / Websites",
                "5. Flyers / Banners / Signboards",
                "6. Radio / Newspaper / TV",
                "7. Direct Sales Agent / Exhibitions"
            ],
            "si": [
                "1. සමාජ මාධ්‍ය අලෙවිකරණය",
                "2. ගමේ අය දන්නා නිසා එනවා (වාචික ප්‍රචාරය)",
                "3. කඩවලට දානවා",
                "4. ඔන්ලයින් වෙළඳපල වේදිකා",
                "5. ප්‍රචාරක පත්‍රිකා / බැනර්",
                "6. රේඩියෝ / පත්තර / රූපවාහිනී",
                "7. සෘජු අලෙවිය / ප්‍රදර්ශන"
            ],
            "ta": [
                "1. சமூக ஊடகங்கள்",
                "2. வாய்மொழி விளம்பரம்",
                "3. கடைகளுக்கு விநியோகம்",
                "4. இணையதளங்கள்",
                "5. துண்டுப் பிரசுரங்கள் / பலகைகள்",
                "6. வானொலி / தொலைக்காட்சி",
                "7. நேரடி விற்பனை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_social_media",
        "type": "multiselect",
        "en": "7.3.2 Social Media Channels Utilized",
        "si": "7.3.2 සමාජ මාධ්‍ය භාවිතා කරන්නේද?",
        "ta": "7.3.2 பயன்படுத்தப்படும் சமூக ஊடகங்கள்",
        "exp_en": "Specific social networks where the business maintains a page/account",
        "exp_si": "ව්‍යාපාර ප්‍රවර්ධනයට යොදාගන්නා සමාජ මාධ්‍ය වේදිකා",
        "exp_ta": "சமூக வலைப்பின்னல்கள்",
        "options": {
            "en": [
                "1. Facebook Page / Group",
                "2. Instagram",
                "3. TikTok",
                "4. YouTube Channel",
                "5. WhatsApp Business Catalog",
                "6. None"
            ],
            "si": [
                "1. ෆේස්බුක් පිටුව/කණ්ඩායම",
                "2. ඉන්ස්ටග්‍රෑම්",
                "3. ටික්ටොක්",
                "4. යූටියුබ්",
                "5. වට්ස්ඇප් බිස්නස්",
                "6. නැත"
            ],
            "ta": [
                "1. பேஸ்புக்",
                "2. இன்ஸ்டாகிராம்",
                "3. டிக்டாக்",
                "4. யூடியூப்",
                "5. வாட்ஸ்அப் பிசினஸ்",
                "6. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_online_platforms",
        "type": "multiselect",
        "en": "7.3.3 E-Commerce Platforms Used for Sales",
        "si": "7.3.3 ඔන්ලයින් විකුණුම් වේදිකා භාවිතා කරන්නේද?",
        "ta": "7.3.3 மின்-வணிக விற்பனை தளங்கள்",
        "exp_en": "Digital marketplaces used for selling goods online",
        "exp_si": "භාණ්ඩ අලෙවි කිරීම සඳහා භාවිතා කරන අන්තර්ජාල වෙළඳසැල්",
        "exp_ta": "இணைய சந்தைகள்",
        "options": {
            "en": [
                "1. Daraz",
                "2. Kapruka",
                "3. Amazon / eBay / Etsy",
                "4. Alibaba",
                "5. Own E-commerce Website",
                "6. None"
            ],
            "si": [
                "1. ඩරස් (Daraz)",
                "2. කප්රුක් (Kapruka)",
                "3. ඇමේසන් / ඊබේ / එට්සි",
                "4. අලිබාබා",
                "5. තමන්ගේම වෙබ් අඩවියක්",
                "6. නැත"
            ],
            "ta": [
                "1. Daraz",
                "2. Kapruka",
                "3. Amazon / eBay",
                "4. Alibaba",
                "5. சொந்த இணையதளம்",
                "6. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 7,
        "key": "q_new_marketing",
        "type": "select",
        "en": "7.3.4 Introduced Any New Marketing Method in Past 3 Years?",
        "si": "7.3.4 නව අලෙවිකරණ ක්‍රමයක් හඳුන්වා දී තිබේද? (පසුගිය වසර 3 තුළ)",
        "ta": "7.3.4 கடந்த 3 ஆண்டுகளில் புதிய சந்தைப்படுத்தல் முறை அறிமுகப்படுத்தப்பட்டதா?",
        "exp_en": "Innovative sales or promotional channels adopted recently",
        "exp_si": "පසුගිය වසර 3 තුළ නව ප්‍රවර්ධන ක්‍රමයක් හඳුන්වා දුන්නේද?",
        "exp_ta": "புதிய சந்தைப்படுத்தல் முறை",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 8,
        "key": "q_new_products",
        "type": "select",
        "en": "8.1.1 Introduced New or Significantly Improved Products in Past 3 Years?",
        "si": "8.1.1 පසුගිය වසර 3 තුළ නව හෝ වැඩිදියුණු කළ නිෂ්පාදන/සේවා හඳුන්වා දුන්නාද?",
        "ta": "8.1.1 கடந்த 3 ஆண்டுகளில் புதிய தயாரிப்புகள் அறிமுகப்படுத்தப்பட்டதா?",
        "exp_en": "Product-level innovations or design enhancements",
        "exp_si": "පසුගිය වසර 3 තුළ නවීන හෝ සැලකිය යුතු ලෙස වැඩිදියුණු කළ නිෂ්පාදන හඳුන්වා දුන්නේද?",
        "exp_ta": "தயாரிப்பு புதுமை",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 8,
        "key": "q_new_processes",
        "type": "select",
        "en": "8.1.2 Introduced New or Improved Production Processes in Past 3 Years?",
        "si": "8.1.2 පසුගිය වසර 3 තුළ නව නිෂ්පාදන ක්‍රම හඳුන්වා දුන්නාද?",
        "ta": "8.1.2 புதிய உற்பத்தி செயல்முறைகள் அறிமுகப்படுத்தப்பட்டதா?",
        "exp_en": "Process-level innovations, automation, or improved workflows",
        "exp_si": "නිෂ්පාදන කාර්යක්ෂමතාව වැඩි කරන නව ක්‍රමවේද හඳුන්වා දුන්නේද?",
        "exp_ta": "செயல்முறை புதுமை",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 8,
        "key": "q_rd_activities",
        "type": "select",
        "en": "8.1.3 Do You Conduct Research & Development (R&D)?",
        "si": "8.1.3 පර්යේෂණ හා සංවර්ධන (R&D) කටයුතු සිදු කරනවාද?",
        "ta": "8.1.3 ஆராய்ச்சி மற்றும் மேம்பாடு (R&D) செய்கிறீர்களா?",
        "exp_en": "Experimentation, recipe testing, prototyping, or formula development",
        "exp_si": "නව නිෂ්පාදන අත්හදා බැලීම් හෝ පර්යේෂණ කටයුතු සිදුකරන්නේද?",
        "exp_ta": "ஆராய்ச்சி மற்றும் மேம்பாடு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 8,
        "key": "q_tech_advice_source",
        "type": "multiselect",
        "en": "8.1.4 Sources of Technical & Advisory Assistance",
        "si": "8.1.4 තාක්ෂණික උපදෙස් ලබා ගන්නා මූලාශ්‍රය",
        "ta": "8.1.4 தொழில்நுட்ப ஆலோசனை ஆதாரங்கள்",
        "exp_en": "Where technical guidance and manufacturing expertise are obtained",
        "exp_si": "තාක්ෂණික ගැටළු සඳහා උපදෙස් ලබාගන්නා ආයතන හෝ පුද්ගලයින්",
        "exp_ta": "தொழில்நுட்ப வழிகாட்டுதல் ஆதாரங்கள்",
        "options": {
            "en": [
                "1. Government Institutes (IDB, Vidatha, ITI, etc.)",
                "2. Research Institutes / Universities",
                "3. NGOs / Development Foundations",
                "4. Other Business Owners / Peers",
                "5. Machinery / Raw Material Suppliers",
                "6. Internet / Books / Online Tutorials",
                "7. None / Self-learned"
            ],
            "si": [
                "1. රජයේ ආයතන (විදාතා, IDB, ITI ආදී)",
                "2. පර්යේෂණ ආයතන / විශ්වවිද්‍යාල",
                "3. රාජ්‍ය නොවන සංවිධාන",
                "4. වෙනත් ව්‍යාපාරිකයින්",
                "5. යන්ත්‍රෝපකරණ / අමුද්‍රව්‍ය විකුණුම්කරුවන්",
                "6. අන්තර්ජාලය / පොත්පත් / යූටියුබ්",
                "7. කිසිවක් නැත / තනිවම"
            ],
            "ta": [
                "1. அரசு நிறுவனங்கள் (விமிதா, IDB போன்றவை)",
                "2. ஆராய்ச்சி நிறுவனங்கள் / பல்கலைக்கழகங்கள்",
                "3. தன்னார்வ தொண்டு நிறுவனங்கள்",
                "4. மற்ற வணிகர்கள்",
                "5. சப்ளையர்கள்",
                "6. இணையம் / யூடியூப்",
                "7. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 8,
        "key": "q_uses_ict",
        "type": "select",
        "en": "8.2.1 Does the Business Use ICT in Daily Operations?",
        "si": "8.2.1 ව්‍යාපාරය ICT භාවිතා කරනවාද?",
        "ta": "8.2.1 வணிகத்தில் தகவல் தொடர்பு தொழில்நுட்பம் பயன்படுத்தப்படுகிறதா?",
        "exp_en": "Information and communication technology usage in administration/sales",
        "exp_si": "දෛනික ව්‍යාපාරික කටයුතුවලදී ICT තාක්ෂණය යොදාගන්නේදැයි තෝරන්න",
        "exp_ta": "ICT பயன்பாடு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 8,
        "key": "q_uses_computer",
        "type": "select",
        "en": "8.2.2 Do You Use a Computer / Laptop for Business?",
        "si": "8.2.2 පරිගණකයක් භාවිතා කරනවාද?",
        "ta": "8.2.2 கணினி / மடிக்கணினி பயன்படுத்துகிறீர்களா?",
        "exp_en": "Desktop, laptop, or tablet computer utilized for business records",
        "exp_si": "ගිණුම්කරණය, සන්නිවේදනය හෝ වාර්තා සඳහා පරිගණකයක් භාවිතා කරන්නේද?",
        "exp_ta": "கணினி பயன்பாடு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 8,
        "key": "q_digital_payments",
        "type": "select",
        "en": "8.2.3 Do You Accept Digital / Online Payments?",
        "si": "8.2.3 ඩිජිටල් ගෙවීම් ක්‍රම භාවිතා කරනවාද?",
        "ta": "8.2.3 டிஜிட்டல் கட்டண முறைகளை ஏற்றுக்கொள்கிறீர்களா?",
        "exp_en": "Bank transfer, LANKAQR, or mobile wallets (eZ Cash, mCash, etc.)",
        "exp_si": "බැංකු හුවමාරු, QR කේත හෝ ජංගම පසුම්බි මඟින් ගෙවීම් ලබාගන්නේද?",
        "exp_ta": "டிஜிட்டல் கட்டண பயன்பாடு",
        "options": {
            "en": [
                "1. Yes (Bank Transfer / LankaQR)",
                "2. Yes (Mobile Wallets - Dialog/Mobitel)",
                "3. No (Cash Only)"
            ],
            "si": [
                "1. ඔව් (බැංකු හුවමාරුව / LankaQR)",
                "2. ඔව් (ජංගම ගෙවීම් - මොබිටෙල්, ඩයලොග්)",
                "3. නැත (මුදල් පමණි)"
            ],
            "ta": [
                "1. ஆம் (வங்கி பரிமாற்றம் / QR)",
                "2. ஆம் (மொபைல் வாலட்)",
                "3. இல்லை (பணம் மட்டும்)"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_gov_support",
        "type": "multiselect",
        "en": "9.1.1 Government Assistance / Grants Received to Date",
        "si": "9.1.1 ලැබී ඇති රාජ්‍ය අනුග්‍රහය/සහාය",
        "ta": "9.1.1 இதுவரை பெறப்பட்ட அரசு உதவிகள் / மானியங்கள்",
        "exp_en": "Forms of state support previously obtained",
        "exp_si": "ව්‍යාපාරය ආරම්භයේ සිට මේ දක්වා ලැබී ඇති රජයේ ආධාර වර්ග තෝරන්න",
        "exp_ta": "அரசு உதவி வகைகள்",
        "options": {
            "en": [
                "1. Financial Grant / Subsidized Loan",
                "2. Entrepreneurship / Vocational Training",
                "3. Machinery / Equipment Provision",
                "4. Business Registration Facilitation",
                "5. Business Plan Preparation",
                "6. Market Linkages / Exhibitions",
                "7. None Received"
            ],
            "si": [
                "1. මූල්‍ය ආධාරයක්",
                "2. පුහුණුවක්",
                "3. යන්ත්‍රෝපකරණ ලබාදීමක්",
                "4. ව්‍යාපාර සම්බන්ධීකරණයක්",
                "5. ව්‍යාපාර සැලසුම් සකස් කරගැනීම",
                "6. වෙළඳපල සම්බන්ධ කිරීම්",
                "7. කිසිවක් නැත"
            ],
            "ta": [
                "1. நிதி உதவி",
                "2. பயிற்சி",
                "3. இயந்திரங்கள் வழங்கல்",
                "4. வணிக ஒருங்கிணைப்பு",
                "5. வணிகத் திட்டமிடல்",
                "6. சந்தை இணைப்புகள்",
                "7. எதுவும் இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_gov_officials",
        "type": "multiselect",
        "en": "9.1.2 Government Officials Connected with Your Business",
        "si": "9.1.2 ව්‍යාපාරය හා සම්බන්ධ රාජ්‍ය නිලධාරින්",
        "ta": "9.1.2 வணிகத்துடன் தொடர்புடைய அரசு அதிகாரிகள்",
        "exp_en": "Field and divisional officers who visit or assist your enterprise",
        "exp_si": "ව්‍යාපාරයට සම්බන්ධ වන ක්ෂේත්‍ර නිලධාරීන් තෝරන්න",
        "exp_ta": "தொடர்புடைய கள அதிகாரிகள்",
        "options": {
            "en": [
                "1. Samurdhi Development Officer",
                "2. Agricultural Research Officer (ARPA)",
                "3. Development Officer (DO)",
                "4. Small Enterprise Development Officer (SEDO)",
                "5. Aswesuma Welfare Officer",
                "6. Women Development Officer (WDO)",
                "7. Environmental Officer (CEA/PS)",
                "8. Community Development Officer",
                "9. Vidatha Resource Officer",
                "10. Agrarian Services Officer",
                "11. Agriculture Instructor (AI)",
                "12. Tea / Rubber Development Officer",
                "13. None"
            ],
            "si": [
                "1. සමෘද්ධි සංවර්ධන නිලධාරි",
                "2. කෘෂිකර්ම නිලධාරි (කෘපනිස)",
                "3. සංවර්ධන නිලධාරි",
                "4. කුඩා ව්‍යාපාර සංවර්ධන නිලධාරි (SEDO)",
                "5. අස්වැසුම නිලධාරි",
                "6. වනිතා සංවර්ධන නිලධාරි",
                "7. පරිසර නිලධාරි",
                "8. ප්‍රජා සංවර්ධන නිලධාරි",
                "9. විදාතා සම්පත් නිලධාරි",
                "10. ගොවිජන සේවා නිලධාරි",
                "11. කෘෂිකර්ම උපදේශක",
                "12. තේ / රබර් සංවර්ධන නිලධාරි",
                "13. කිසිවෙක් නැත"
            ],
            "ta": [
                "1. சமுர்த்தி அதிகாரி",
                "2. விவசாய அதிகாரி",
                "3. அபிவிருத்தி அதிகாரி",
                "4. சிறு வணிக அபிவிருத்தி அதிகாரி",
                "5. அஸ்வெசும அதிகாரி",
                "6. மகளிர் அபிவிருத்தி அதிகாரி",
                "7. சுற்றுச்சூழல் அதிகாரி",
                "8. சமூக அபிவிருத்தி அதிகாரி",
                "9. விமிதா அதிகாரி",
                "10. விவசாய சேவை அதிகாரி",
                "11. விவசாய ஆலோசகர்",
                "12. தேயிலை / ரப்பர் அதிகாரி",
                "13. எவரும் இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_gov_sufficient",
        "type": "select",
        "en": "9.1.3 Is Government Support & Intervention Sufficient?",
        "si": "9.1.3 රජයේ මැදිහත්වීම ප්‍රමාණවත් යැයි සිතනවාද?",
        "ta": "9.1.3 அரசாங்கத்தின் ஆதரவு போதுமானது என கருதுகிறீர்களா?",
        "exp_en": "Evaluation of existing government programs for small businesses",
        "exp_si": "සුළු හා මධ්‍ය පරිමාණ ව්‍යාපාර සඳහා රජයේ සහාය ප්‍රමාණවත්දැයි තෝරන්න",
        "exp_ta": "அரசு ஆதரவின் போதுமான தன்மை",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_gov_intervention_how",
        "type": "text",
        "en": "9.1.4 How Should Government Support / Intervene?",
        "si": "9.1.4 රජය මැදිහත් විය යුතු ආකාරය",
        "ta": "9.1.4 அரசாங்கம் எவ்வாறு தலையிட வேண்டும்?",
        "exp_en": "Suggestions on policies, subsidies, markets, or regulations needed",
        "exp_si": "රජයෙන් ව්‍යාපාරිකයින්ට ලැබිය යුතු සහන හෝ සහාය පිළිබඳ යෝජනා",
        "exp_ta": "அரசுக்கான பரிந்துரைகள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_main_problems",
        "type": "multiselect",
        "en": "9.2.1 Current Major Challenges Encountered",
        "si": "9.2.1 දැනට පවතින ප්‍රධාන ගැටළු",
        "ta": "9.2.1 தற்போது எதிர்கொள்ளும் முக்கிய சவால்கள்",
        "exp_en": "Core obstacles constraining operations and profitability",
        "exp_si": "දැනට ව්‍යාපාරය කරගෙන යාමේදී මුහුණදෙන ප්‍රධාන ගැටළු තෝරන්න",
        "exp_ta": "முக்கிய வணிக சிக்கல்கள்",
        "options": {
            "en": [
                "1. Lack of Buyers / Low Demand",
                "2. Lack of Technical Training",
                "3. Lack of Business & Financial Knowledge",
                "4. Lack of Working Capital / Credit",
                "5. Lack of Industry Networks / Linkages",
                "6. Weak Promotion & Marketing",
                "7. Poor Business Management",
                "8. Intense Local Competition",
                "9. Scarcity & High Cost of Raw Materials",
                "10. Other"
            ],
            "si": [
                "1. ගැනුම්කරුවන් නොමැතිකම",
                "2. පුහුණුව නොමැතිකම",
                "3. දැනුම නොමැතිකම",
                "4. ප්‍රාග්ධනය නොමැතිකම",
                "5. සම්බන්ධතා නොමැතිකම",
                "6. ප්‍රවර්ධනය හා අලෙවිකරණය දුර්වල වීම",
                "7. කළමනාකරණය දුර්වල වීම",
                "8. තරඟකාරිත්වය",
                "9. අමුද්‍රව්‍ය හිඟය හා මිල ඉහළ යාම",
                "10. වෙනත්"
            ],
            "ta": [
                "1. வாடிக்கையாளர்கள் பற்றாக்குறை",
                "2. பயிற்சி இல்லாமை",
                "3. வணிக அறிவு பற்றாக்குறை",
                "4. மூலதனப் பற்றாக்குறை",
                "5. தொடர்புகள் இல்லாமை",
                "6. பலவீனமான சந்தைப்படுத்தல்",
                "7. மோசமான மேலாண்மை",
                "8. கடுமையான போட்டி",
                "9. மூலப்பொருள் தட்டுப்பாடு",
                "10. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_business_rating",
        "type": "select",
        "en": "9.2.2 Owner's Assessment of Business Health",
        "si": "9.2.2 ව්‍යාපාරයේ තත්ත්වය පිළිබඳ හිමිකරුගේ ඇගයීම",
        "ta": "9.2.2 வணிகத்தின் நிலை குறித்த உரிமையாளரின் மதிப்பீடு",
        "exp_en": "Subjective rating of overall enterprise performance",
        "exp_si": "ව්‍යාපාරයේ වත්මන් සාර්ථකත්වය පිළිබඳ හිමිකරුගේ තක්සේරුව",
        "exp_ta": "வணிகத்தின் தற்போதைய நிலை",
        "options": {
            "en": [
                "1. Running Very Well",
                "2. Moderate / Surviving",
                "3. Poor / Struggling"
            ],
            "si": [
                "1. ඉතා හොඳින් කරගෙන යනවා",
                "2. මධ්‍යස්ථයි",
                "3. දුර්වලයි"
            ],
            "ta": [
                "1. மிகவும் சிறப்பாக இயங்குகிறது",
                "2. நடுத்தரமானது",
                "3. பலவீனமானது"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_business_rating_reason",
        "type": "text",
        "en": "9.2.3 Reason if Rated Moderate or Poor",
        "si": "9.2.3 මධ්‍යස්ථ හෝ දුර්වල වීමට හේතුව",
        "ta": "9.2.3 நடுத்தர அல்லது பலவீனமாக இருப்பதற்கான காரணம்",
        "exp_en": "Underlying cause why the enterprise is not performing excellently",
        "exp_si": "ව්‍යාපාරය මධ්‍යස්ථ හෝ දුර්වල මට්ටමක පැවතීමට හේතුව විස්තර කරන්න",
        "exp_ta": "நிலைமைக்கான காரணம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_problem_details",
        "type": "text",
        "en": "9.2.4 Detailed Description of Operational Challenges",
        "si": "9.2.4 ව්‍යාපාරයේ දැනට පවතින ගැටළු (විස්තර)",
        "ta": "9.2.4 தற்போதுள்ள சிக்கல்களின் விரிவான விளக்கம்",
        "exp_en": "Elaborate on specific difficulties faced",
        "exp_si": "ව්‍යාපාරයේ පවතින විශේෂිත ගැටළු පිළිබඳ සවිස්තරාත්මක සටහනක්",
        "exp_ta": "சிக்கல்களின் விரிவான விளக்கம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_expansion_obstacles",
        "type": "multiselect",
        "en": "9.2.5 Obstacles to Expanding Operations",
        "si": "9.2.5 ව්‍යාපාරය පුළුල් කිරීමට ඇති ගැටළු",
        "ta": "9.2.5 வணிகத்தை விரிவுபடுத்துவதில் உள்ள தடைகள்",
        "exp_en": "Bottlenecks preventing scaling the business up",
        "exp_si": "ව්‍යාපාරය තවදුරටත් පුළුල් කිරීමට බාධා වන කරුණු තෝරන්න",
        "exp_ta": "விரிவாக்கத்திற்கான தடைகள்",
        "options": {
            "en": [
                "1. Lack of Space / Land",
                "2. Insufficient Capital / Funds",
                "3. Shortage of Skilled Employees",
                "4. Difficult Raw Material Sourcing",
                "5. Insufficient Market Demand",
                "6. Legal & Regulatory Barriers",
                "7. Other"
            ],
            "si": [
                "1. ස්ථානයක් නැත",
                "2. ප්‍රාග්ධනය ප්‍රමාණවත් නැත",
                "3. සේවකයින් ප්‍රමාණවත් නැත",
                "4. අමුද්‍රව්‍ය සැපයීම දුෂ්කරයි",
                "5. ඉල්ලුම ප්‍රමාණවත් නැත",
                "6. නීතිමය හා නියාමන බාධක",
                "7. වෙනත්"
            ],
            "ta": [
                "1. இடம் போதாமை",
                "2. மூலதனம் போதாமை",
                "3. பணியாளர் பற்றாக்குறை",
                "4. மூலப்பொருள் பெறுவது கடினம்",
                "5. சந்தை தேவை போதாமை",
                "6. சட்டத் தடைகள்",
                "7. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_electricity",
        "type": "select",
        "en": "9.3.1 Electricity Supply Reliability as an Obstacle (1-5)",
        "si": "9.3.1 විදුලිය සැපයුම (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.1 மின்சார விநியோக தடை நிலை (1-5)",
        "exp_en": "Rate severity of electricity cuts or tariffs on business operations",
        "exp_si": "විදුලි සැපයුම ව්‍යාපාරයට ඇති කරන බාධාවේ තරම (1 සිට 5 දක්වා)",
        "exp_ta": "மின்சார தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_transport",
        "type": "select",
        "en": "9.3.2 Transport & Road Infrastructure as an Obstacle (1-5)",
        "si": "9.3.2 ප්‍රවාහනය (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.2 போக்குவரத்து தடை நிலை (1-5)",
        "exp_en": "Rate severity of transport cost and road access constraints",
        "exp_si": "ප්‍රවාහන පහසුකම් ව්‍යාපාරයට ඇති කරන බාධාවේ තරම",
        "exp_ta": "போக்குவரத்து தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_finance",
        "type": "select",
        "en": "9.3.3 Access to Financial Services as an Obstacle (1-5)",
        "si": "9.3.3 මූල්‍ය සේවා සඳහා ප්‍රවේශය (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.3 நிதிச் சேவை அணுகல் தடை நிலை (1-5)",
        "exp_en": "Rate severity of obtaining loans and bank financing",
        "exp_si": "බැංකු ණය සහ මූල්‍ය සේවා ලබාගැනීමේ බාධාවේ තරම",
        "exp_ta": "நிதி அணுகல் தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_land",
        "type": "select",
        "en": "9.3.4 Access to Land & Premises as an Obstacle (1-5)",
        "si": "9.3.4 ඉඩම් ලබාගැනීම (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.4 நிலம் பெறுவதில் உள்ள தடை நிலை (1-5)",
        "exp_en": "Rate severity of acquiring property or industrial land",
        "exp_si": "ව්‍යාපාරය සඳහා ඉඩම් ලබා ගැනීමේ බාධාවේ තරම",
        "exp_ta": "நிலம் பெறுவதில் உள்ள தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_tax",
        "type": "select",
        "en": "9.3.5 Tax Rates & Administration as an Obstacle (1-5)",
        "si": "9.3.5 බදු ගෙවීම් (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.5 வரி விதிப்பு தடை நிலை (1-5)",
        "exp_en": "Rate burden of tax rates and tax administration",
        "exp_si": "බදු ගෙවීම් ව්‍යාපාරයට ඇති කරන බාධාවේ තරම",
        "exp_ta": "வரி விதிப்பு தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_regulations",
        "type": "select",
        "en": "9.3.6 Regulatory Compliance & Business Licensing as an Obstacle (1-5)",
        "si": "9.3.6 නියාමන අනුකූලතාව හා බලපත්‍ර (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.6 சட்ட ஒழுங்குமுறை தடை நிலை (1-5)",
        "exp_en": "Rate burden of permits, inspections, and bureaucracy",
        "exp_si": "රාජ්‍ය නීති හා බලපත්‍ර ලබාගැනීමේ බාධාවේ තරම",
        "exp_ta": "ஒழுங்குமுறை தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_labor",
        "type": "select",
        "en": "9.3.7 Finding Skilled Workforce as an Obstacle (1-5)",
        "si": "9.3.7 දක්ෂ ශ්‍රමිකයින් සොයාගැනීම (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.7 திறமையான தொழிலாளர்கள் கிடைப்பதில் தடை நிலை (1-5)",
        "exp_en": "Rate difficulty finding qualified, reliable staff",
        "exp_si": "පුහුණු හා දක්ෂ සේවකයින් සොයාගැනීමේ බාධාවේ තරම",
        "exp_ta": "தொழிலாளர் கிடைப்பனவு தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_competition",
        "type": "select",
        "en": "9.3.8 Competition from Informal or Large Businesses as an Obstacle (1-5)",
        "si": "9.3.8 තරඟකාරිත්වය (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.8 சந்தை போட்டி தடை நிலை (1-5)",
        "exp_en": "Rate threat of undercutting competitors or cheap imports",
        "exp_si": "වෙළඳපල තරඟකාරිත්වය ව්‍යාපාරයට ඇති කරන බාධාවේ තරම",
        "exp_ta": "போட்டி தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 9,
        "key": "q_barrier_crime",
        "type": "select",
        "en": "9.3.9 Crime, Theft & Disorder as an Obstacle (1-5)",
        "si": "9.3.9 අපරාධ/සොරකම් (බාධක ශ්‍රේණිගත කිරීම)",
        "ta": "9.3.9 குற்றங்கள் / திருட்டுகள் தடை நிலை (1-5)",
        "exp_en": "Rate risk of theft, extortion, or vandalism",
        "exp_si": "සොරකම් හා සමාජ අපරාධ ව්‍යාපාරයට ඇති කරන බාධාවේ තරම",
        "exp_ta": "குற்றச் செயல் தடை நிலை",
        "options": {
            "en": [
                "1. No Obstacle",
                "2. Minor Obstacle",
                "3. Moderate Obstacle",
                "4. Major Obstacle",
                "5. Very Severe Obstacle"
            ],
            "si": [
                "1. බාධාවක් නැත",
                "2. සුළු බාධාවකි",
                "3. මධ්‍යස්ථ බාධාවකි",
                "4. ප්‍රධාන බාධාවකි",
                "5. ඉතා බරපතල බාධාවකි"
            ],
            "ta": [
                "1. தடையல்ல",
                "2. சிறிய தடை",
                "3. நடுத்தர தடை",
                "4. பெரிய தடை",
                "5. மிகக் கடுமையான தடை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 10,
        "key": "q_env_impact",
        "type": "select",
        "en": "10.1.1 Overall Environmental Impact of Business",
        "si": "10.1.1 ව්‍යාපාරයේ පාරිසරික බලපෑම",
        "ta": "10.1.1 வணிகத்தின் சுற்றுச்சூழல் தாக்கம்",
        "exp_en": "General assessment of impact on surrounding natural environment",
        "exp_si": "ව්‍යාපාරය මඟින් ස්වභාවික පරිසරයට සිදුවන බලපෑම තෝරන්න",
        "exp_ta": "சுற்றுச்சூழல் தாக்கம்",
        "options": {
            "en": [
                "1. Positive / Eco-friendly",
                "2. Neutral / No Significant Impact",
                "3. Negative Impact Exists"
            ],
            "si": [
                "1. ධනාත්මකයි / පරිසරයට හිතකරයි",
                "2. බලපෑමක් නැත",
                "3. සෘණාත්මක බලපෑමක් ඇත"
            ],
            "ta": [
                "1. சாதகமானது / சூழலுக்கு உகந்தது",
                "2. தாக்கமில்லை",
                "3. பாதகமான தாக்கம் உள்ளது"
            ]
        },
        "depends_on": null
    },
    {
        "step": 10,
        "key": "q_env_impact_types",
        "type": "multiselect",
        "en": "10.1.2 Specific Types of Environmental Impacts Generated",
        "si": "10.1.2 බලපෑමේ ස්වභාවය",
        "ta": "10.1.2 சுற்றுச்சூழல் தாக்கத்தின் வகைகள்",
        "exp_en": "Pollution or emission types produced during operations",
        "exp_si": "ව්‍යාපාරයෙන් පිටවන පරිසර දූෂණ හෝ විමෝචන වර්ග",
        "exp_ta": "மாசுபாட்டின் வகைகள்",
        "options": {
            "en": [
                "1. Noise Pollution",
                "2. Air Pollution / Fumes",
                "3. Solid Waste Generation",
                "4. Wastewater / Effluents",
                "5. Dust Emissions",
                "6. Odor / Smell",
                "7. None / Other"
            ],
            "si": [
                "1. ශබ්ද දූෂණය",
                "2. වාතය දූෂණය",
                "3. ඝන අපද්‍රව්‍ය",
                "4. අපජලය",
                "5. දූවිලි",
                "6. ගන්ධය",
                "7. කිසිවක් නැත / වෙනත්"
            ],
            "ta": [
                "1. ஒலி மாசு",
                "2. காற்று மாசு",
                "3. திடக் கழிவு",
                "4. கழிவு நீர்",
                "5. தூசி",
                "6. துர்நாற்றம்",
                "7. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 10,
        "key": "q_env_mitigation",
        "type": "select",
        "en": "10.1.3 Do You Take Measures to Mitigate Environmental Impact?",
        "si": "10.1.3 පාරිසරික බලපෑම අවම කිරීමට ක්‍රියාමාර්ග ගන්නවාද?",
        "ta": "10.1.3 சுற்றுச்சூழல் தாக்கத்தைக் குறைக்க நடவடிக்கை எடுக்கிறீர்களா?",
        "exp_en": "Effluent treatment, noise reduction, waste filters or recycling",
        "exp_si": "පරිසර හානිය අවම කිරීමට ගෙන ඇති ක්‍රියාමාර්ග තිබේදැයි සඳහන් කරන්න",
        "exp_ta": "சுற்றுச்சூழல் பாதுகாப்பு நடவடிக்கைகள்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 10,
        "key": "q_env_friendly",
        "type": "select",
        "en": "10.1.4 Do You Produce Eco-friendly or Green Products?",
        "si": "10.1.4 පරිසර හිතකාමී නිෂ්පාදන/සේවා සපයනවාද?",
        "ta": "10.1.4 சூழல் நட்பு தயாரிப்புகளை வழங்குகிறீர்களா?",
        "exp_en": "Biodegradable, organic, solar-powered or sustainable items",
        "exp_si": "ස්වභාවික හෝ ප්‍රතිචක්‍රීකරණය කළ හැකි පරිසර හිතකාමී භාණ්ඩ නිපදවන්නේද?",
        "exp_ta": "சூழல் நட்பு தயாரிப்புகள்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 10,
        "key": "q_neighbor_attitude",
        "type": "select",
        "en": "10.2.1 Attitude of Neighbors Towards Business",
        "si": "10.2.1 අසල්වැසියන්ගේ ආකල්පය",
        "ta": "10.2.1 அண்டை வீட்டார்களின் அணுகுமுறை",
        "exp_en": "Local community and neighborhood acceptance of your workshop",
        "exp_si": "අසල්වැසි ජනතාව ව්‍යාපාරය පිළිබඳ දක්වන ප්‍රතිචාරය තෝරන්න",
        "exp_ta": "அண்டை வீட்டார் மனப்பான்மை",
        "options": {
            "en": [
                "1. Supportive / Favorable",
                "2. Unfavorable / Complaining",
                "3. Indifferent / Neutral"
            ],
            "si": [
                "1. අසල්වැසියන්ගේ කැමැත්ත ඇත",
                "2. අසල්වැසියන් කැමති නැත",
                "3. උදාසීනයි"
            ],
            "ta": [
                "1. ஆதரவானது",
                "2. எதிர்ப்பானது",
                "3. நடுநிலையானது"
            ]
        },
        "depends_on": null
    },
    {
        "step": 10,
        "key": "q_village_expansion_opinion",
        "type": "select",
        "en": "10.2.2 Owner's Opinion on Expanding this Industry to Others in Village",
        "si": "10.2.2 මෙම කර්මාන්තය ගම තුළ තවත් අයට ව්‍යාප්ත කිරීම ගැන හිමිකරුගේ මතය",
        "ta": "10.2.2 கிராமத்தில் உள்ள மற்றவர்களுக்கு இந்தத் தொழிலை விரிவுபடுத்துவது குறித்த கருத்து",
        "exp_en": "Willingness to have more village members adopt this trade",
        "exp_si": "ගමේ අනෙක් අයටද මෙම කර්මාන්තය හුරු කිරීම සුදුසුදැයි හිමිකරුගේ අදහස",
        "exp_ta": "கிராம விரிவாக்கம் குறித்த கருத்து",
        "options": {
            "en": [
                "1. Good (Should expand widely in village)",
                "2. Neutral / No impact",
                "3. Not suitable to expand further"
            ],
            "si": [
                "1. හොඳයි (ව්‍යාප්ත කළ යුතුයි)",
                "2. බලපෑමක් නැත",
                "3. ව්‍යාප්ත කිරීම සුදුසු නැත"
            ],
            "ta": [
                "1. நல்லது (கிராமத்தில் விரிவுபடுத்த வேண்டும்)",
                "2. நடுநிலையானது",
                "3. மேலும் விரிவுபடுத்துவது பொருத்தமற்றது"
            ]
        },
        "depends_on": null
    },
    {
        "step": 10,
        "key": "q_community_contribution",
        "type": "text",
        "en": "10.2.3 Business Contribution to Local Community",
        "si": "10.2.3 ව්‍යාපාරය ප්‍රජාවට ලබා දෙන දායකත්වය",
        "ta": "10.2.3 உள்ளூர் சமூகத்திற்கு வணிகத்தின் பங்களிப்பு",
        "exp_en": "Employment, sponsorships, temple/church assistance, or youth training",
        "exp_si": "ගමේ පොදු කටයුතුවලට හෝ ප්‍රජාවට ව්‍යාපාරයෙන් කෙරෙන දායකත්වය",
        "exp_ta": "சமூக பங்களிப்பு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 10,
        "key": "q_community_conflicts",
        "type": "select",
        "en": "10.2.4 Are There Any Conflicts or Disputes with Community?",
        "si": "10.2.4 ප්‍රජාව තුළ ගැටුම්/ආරවුල් තිබේද?",
        "ta": "10.2.4 சமூகத்தில் ஏதேனும் மோதல்கள் அல்லது தகராறுகள் உள்ளதா?",
        "exp_en": "Disputes regarding noise, parking, waste, or competition",
        "exp_si": "ප්‍රජාව සමඟ කිසියම් මතභේදයක් හෝ ආරවුලක් පවතින්නේදැයි සඳහන් කරන්න",
        "exp_ta": "சமூக முரண்பாடுகள்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 11,
        "key": "q_family_help",
        "type": "text",
        "en": "11.1.1 Support Received from Family",
        "si": "11.1.1 පවුලෙන් ලැබෙන උදව්",
        "ta": "11.1.1 குடும்பத்தினரிடம் இருந்து கிடைக்கும் உதவி",
        "exp_en": "Assistance provided by family members in labor, capital, or motivation",
        "exp_si": "ව්‍යාපාරය කරගෙන යාමට පවුලේ සාමාජිකයින්ගෙන් ලැබෙන සහයෝගය",
        "exp_ta": "குடும்ப ஆதரவு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 11,
        "key": "q_family_obstacles",
        "type": "text",
        "en": "11.1.2 Obstacles or Difficulties Arising from Family",
        "si": "11.1.2 පවුලෙන් ඇති වන බාධා",
        "ta": "11.1.2 குடும்பத்தினால் ஏற்படும் தடைகள்",
        "exp_en": "Domestic obligations, financial demands, or time constraints from family",
        "exp_si": "පවුලේ වගකීම් හෝ බාධා නිසා ව්‍යාපාරයට සිදුවන බලපෑම්",
        "exp_ta": "குடும்ப தடைகள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 11,
        "key": "q_family_other_businesses",
        "type": "select",
        "en": "11.1.3 Do Other Family Members Run Similar Businesses?",
        "si": "11.1.3 පවුලේ වෙනත් සාමාජිකයින්ට ද මෙවැනි ව්‍යාපාර තිබේද?",
        "ta": "11.1.3 மற்ற குடும்ப உறுப்பினர்களுக்கும் இதுபோன்ற வணிகங்கள் உள்ளதா?",
        "exp_en": "Relatives or siblings engaged in same or complementary trades",
        "exp_si": "පවුලේ හෝ ඥාතීන් අතර මෙවැනිම ව්‍යාපාර කරන අය සිටීදැයි තෝරන්න",
        "exp_ta": "குடும்பத்தில் உள்ள பிற வணிகங்கள்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 11,
        "key": "q_societies_joined",
        "type": "multiselect",
        "en": "11.2.1 Community Societies / Organizations Joined",
        "si": "11.2.1 ඔබ ව්‍යාපාරයට අදාළව ගමේ සම්බන්ධ වී ඇති සමිති/කණ්ඩායම්/සංවිධාන",
        "ta": "11.2.1 கிராமத்தில் நீங்கள் இணைந்துள்ள சங்கங்கள் / அமைப்புகள்",
        "exp_en": "Local community based organizations the entrepreneur is affiliated with",
        "exp_si": "ව්‍යාපාරය වෙනුවෙන් ඔබ සම්බන්ධ වී සිටින සමිති හා සංවිධාන තෝරන්න",
        "exp_ta": "இணைந்துள்ள சங்கங்கள்",
        "options": {
            "en": [
                "1. Sithamu Program",
                "2. Praja Shakthi Movement",
                "3. Govijana Bank",
                "4. Farmers' Organization",
                "5. Women's Societies (Kantha Samithi)",
                "6. Youth Clubs",
                "7. Other Local Society",
                "8. None"
            ],
            "si": [
                "1. සිතමු වැඩසටහන",
                "2. ප්‍රජා ශක්ති ව්‍යාපාරය",
                "3. ගොවිජන බැංකුව",
                "4. ගොවි සංවිධානය",
                "5. කාන්තා සමිති",
                "6. යෞවන සමාජ",
                "7. වෙනත් ග්‍රාමීය සමිතියක්",
                "8. කිසිවක් නැත"
            ],
            "ta": [
                "1. சிதமு திட்டம்",
                "2. பிரஜா சக்தி இயக்கம்",
                "3. கொவிஜன வங்கி",
                "4. விவசாய அமைப்பு",
                "5. பெண்கள் சங்கம்",
                "6. இளைஞர் கழகம்",
                "7. பிற சங்கங்கள்",
                "8. எதுவும் இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 11,
        "key": "q_business_cooperation",
        "type": "select",
        "en": "11.2.2 Do You Cooperate with Other Business Owners?",
        "si": "11.2.2 වෙනත් ව්‍යාපාර හිමියන් සමඟ සහයෝගයෙන් කටයුතු කරනවාද?",
        "ta": "11.2.2 பிற வணிக உரிமையாளர்களுடன் ஒத்துழைக்கிறீர்களா?",
        "exp_en": "Bulk purchasing, machine sharing, or referral cooperation with peers",
        "exp_si": "අමුද්‍රව්‍ය මිලදී ගැනීම් හෝ තාක්ෂණය හුවමාරුවේදී අන්‍යෝන්‍ය සහයෝගය",
        "exp_ta": "வணிக ஒத்துழைப்பு",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 11,
        "key": "q_chamber_member",
        "type": "select",
        "en": "11.2.3 Member of a Business Association / Chamber of Commerce?",
        "si": "11.2.3 ව්‍යාපාරික සංගමයක/වෙළඳ සභාවක සාමාජිකයෙක්ද?",
        "ta": "11.2.3 வணிக சங்கம் அல்லது வர்த்தக சபையில் உறுப்பினரா?",
        "exp_en": "Membership in formal trade guilds or District Chambers of Commerce",
        "exp_si": "දිස්ත්‍රික් වෙළඳ වාණිජ මණ්ඩලයක හෝ කර්මාන්ත සංගමයක සාමාජිකත්වය ඇත්දැයි සඳහන් කරන්න",
        "exp_ta": "வணிக சங்க உறுப்பினர்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 12,
        "key": "q_current_needs",
        "type": "multiselect",
        "en": "12.1.1 Current Critical Business Needs",
        "si": "12.1.1 දැනට අවශ්‍ය දේවල්",
        "ta": "12.1.1 தற்போதைய முக்கியமான வணிக தேவைகள்",
        "exp_en": "Most urgent requirements needed to advance the business",
        "exp_si": "ව්‍යාපාරය ඉදිරියට ගෙන යාමට මේ මොහොතේ වඩාත්ම අවශ්‍ය දේවල් තෝරන්න",
        "exp_ta": "முக்கிய வணிக தேவைகள்",
        "options": {
            "en": [
                "1. More Buyers / Market Access",
                "2. Technical & Skill Training",
                "3. Business Management Knowledge",
                "4. Financial Capital / Low-interest Loans",
                "5. Business Networks & Linkages",
                "6. Marketing & Branding Support",
                "7. Management & Bookkeeping Assistance",
                "8. Land / Space for Expansion",
                "9. Modern Machinery & Technology Support",
                "10. Legal & Licensing Guidance"
            ],
            "si": [
                "1. ගැනුම්කරුවන් / වෙළඳපල",
                "2. පුහුණුව",
                "3. දැනුම",
                "4. ප්‍රාග්ධනය",
                "5. සම්බන්ධතා",
                "6. ප්‍රවර්ධනය හා අලෙවිකරණය",
                "7. කළමනාකරණ සහාය",
                "8. ව්‍යාපාරය පුළුල් කරගැනීමට ඉඩකඩ",
                "9. තාක්ෂණික සහාය හා යන්ත්‍රෝපකරණ",
                "10. නීතිමය උපදෙස්"
            ],
            "ta": [
                "1. வாடிக்கையாளர்கள் / சந்தை",
                "2. பயிற்சி",
                "3. வணிக அறிவு",
                "4. மூலதனம்",
                "5. தொடர்புகள்",
                "6. சந்தைப்படுத்தல் உதவி",
                "7. மேலாண்மை உதவி",
                "8. விரிவாக்கத்திற்கான இடம்",
                "9. தொழில்நுட்ப உதவி",
                "10. சட்ட ஆலோசனை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 12,
        "key": "q_has_land_to_move",
        "type": "select",
        "en": "12.1.2 Do You Own Land to Relocate / Expand?",
        "si": "12.1.2 නව ස්ථානයකට යාමට ඉඩමක් තිබේද?",
        "ta": "12.1.2 வேறு இடத்திற்கு மாற்ற நிலம் உள்ளதா?",
        "exp_en": "Availability of suitable alternative land parcel",
        "exp_si": "ව්‍යාපාරය ගෙනයාමට සුදුසු වෙනත් ඉඩමක් හිමිකරු සතුව තිබේදැයි සඳහන් කරන්න",
        "exp_ta": "மாற்று நில வசதி",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 12,
        "key": "q_needs_land",
        "type": "select",
        "en": "12.1.3 Do You Need Land or Dedicated Premises from Government?",
        "si": "12.1.3 ඉඩමක් හෝ ස්ථානයක් අවශ්‍යද?",
        "ta": "12.1.3 நிலம் அல்லது கட்டிடம் தேவையா?",
        "exp_en": "Requirement for industrial estate plots or local authority land",
        "exp_si": "රජයෙන් හෝ කාර්මික ජනපදයකින් ඉඩමක් ලබා ගැනීමට අවශ්‍යදැයි තෝරන්න",
        "exp_ta": "அரசு நில தேவை",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 12,
        "key": "q_advisory_received",
        "type": "multiselect",
        "en": "12.1.4 Types of Advisory / BDS Services Received to Date",
        "si": "12.1.4 ලැබුණු උපදේශන/සහාය වර්ග",
        "ta": "12.1.4 இதுவரை பெறப்பட்ட ஆலோசனை சேவைகளின் வகைகள்",
        "exp_en": "Business development services experienced",
        "exp_si": "මීට පෙර රජයෙන් හෝ ආයතන වලින් ලැබී ඇති උපදේශන සේවා වර්ග තෝරන්න",
        "exp_ta": "பெறப்பட்ட ஆலோசனை சேவைகள்",
        "options": {
            "en": [
                "1. Marketing Information & Linkages",
                "2. Bookkeeping & Accounting Advice",
                "3. Legal & Regulatory Support",
                "4. Skills & Technical Training",
                "5. Business Planning & Feasibility",
                "6. Inventory & Quality Packaging",
                "7. None Received",
                "8. Other"
            ],
            "si": [
                "1. අලෙවිකරණ තොරතුරු",
                "2. ගිණුම්කරණය",
                "3. නීතිමය",
                "4. පුහුණුව",
                "5. ව්‍යාපාර සැලසුම්",
                "6. තොග සැකසීම හා ඇසුරුම්කරණය",
                "7. කිසිවක් නැත",
                "8. වෙනත්"
            ],
            "ta": [
                "1. சந்தைப்படுத்தல் தகவல்",
                "2. கணக்கியல்",
                "3. சட்ட ஆலோசனை",
                "4. பயிற்சி",
                "5. வணிக திட்டமிடல்",
                "6. பேக்கேஜிங்",
                "7. எதுவும் இல்லை",
                "8. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 12,
        "key": "q_future_expansion",
        "type": "select",
        "en": "12.2.1 Do You Plan to Expand the Business in the Next 12 Months?",
        "si": "12.2.1 ඉදිරි වසර 1 තුළ ව්‍යාපාරය පුළුල් කිරීමට සැලසුම් කරනවාද?",
        "ta": "12.2.1 அடுத்த 12 மாதங்களில் வணிகத்தை விரிவுபடுத்த திட்டமிட்டுள்ளீர்களா?",
        "exp_en": "Growth intention for the upcoming year",
        "exp_si": "ඉදිරි වසරක කාලය තුළ නිෂ්පාදනය හෝ අලෙවිය පුළුල් කිරීමට සැලසුම් ඇත්දැයි තෝරන්න",
        "exp_ta": "எதிர்கால விரிவாக்க திட்டம்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 12,
        "key": "q_expansion_capital",
        "type": "number",
        "en": "12.2.2 Estimated Capital Required for Planned Expansion (LKR)",
        "si": "12.2.2 පුළුල් කිරීමට අවශ්‍ය ප්‍රාග්ධනය (රු.)",
        "ta": "12.2.2 விரிவாக்கத்திற்கு தேவையான மதிப்பிடப்பட்ட மூலதனம் (ரூ.)",
        "exp_en": "Financial investment needed to execute the expansion plan",
        "exp_si": "ව්‍යාපාරය පුළුල් කිරීම සඳහා අවශ්‍ය වන ඇස්තමේන්තුගත මුදල රුපියල් වලින්",
        "exp_ta": "தேவையான மூலதனம்",
        "options": null,
        "depends_on": "q_future_expansion:1"
    },
    {
        "step": 12,
        "key": "q_hiring_plan",
        "type": "select",
        "en": "12.2.3 Plan to Recruit Additional Employees in Next Year?",
        "si": "12.2.3 නව සේවකයින් බඳවා ගැනීමට සැලසුම් කරනවාද?",
        "ta": "12.2.3 புதிய பணியாளர்களை நியமிக்க திட்டமிட்டுள்ளீர்களா?",
        "exp_en": "Job creation and hiring projections",
        "exp_si": "ඉදිරි වසර තුළ නව සේවකයින් බඳවා ගැනීමට සැලසුම් කර තිබේද?",
        "exp_ta": "புதிய பணியாளர் நியமன திட்டம்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 12,
        "key": "q_new_products_plan",
        "type": "select",
        "en": "12.2.4 Plan to Introduce New Products / Services?",
        "si": "12.2.4 නව නිෂ්පාදන/සේවා හඳුන්වා දීමට සැලසුම් කරනවාද?",
        "ta": "12.2.4 புதிய தயாரிப்புகளை அறிமுகப்படுத்த திட்டமிட்டுள்ளீர்களா?",
        "exp_en": "Product pipeline and diversification plans",
        "exp_si": "නුදුරේදීම නව නිෂ්පාදන හෝ සේවා වෙළඳපලට නිකුත් කිරීමට සැලසුම් ඇත්දැයි සඳහන් කරන්න",
        "exp_ta": "புதிய தயாரிப்பு திட்டம்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 13,
        "key": "q_gov_programs",
        "type": "multiselect",
        "en": "13.1.1 Government Programs the Enterprise Interacts With",
        "si": "13.1.1 ව්‍යාපාරය සම්බන්ධ වන රාජ්‍ය වැඩසටහන්",
        "ta": "13.1.1 வணிகம் தொடர்புடைய அரசு திட்டங்கள்",
        "exp_en": "Special development schemes or funds accessed",
        "exp_si": "ව්‍යාපාරික කටයුතුවලට සම්බන්ධ වන රජයේ වැඩසටහන් තෝරන්න",
        "exp_ta": "அரசு திட்டங்கள்",
        "options": {
            "en": [
                "1. Department of Social Services",
                "2. President's Fund",
                "3. Provincial Specific Funds (3% Fund)",
                "4. Industrial Development Board (IDB)",
                "5. Pradeshiya Sabha Development Funds",
                "6. Vidatha Resource Centers (Ministry of Tech)",
                "7. Samurdhi Development Department",
                "8. National Enterprise Development Authority (NEDA)",
                "9. Aswesuma Welfare Program",
                "10. Praja Shakthi Community Program",
                "11. Export Development Board (EDB)",
                "12. ADB / World Bank Funded MSME Projects",
                "13. National Productivity Secretariat",
                "14. Rural Micro Credit Scheme",
                "15. Community Development Bureau",
                "16. Kantha Samithi Enterprise Fund",
                "17. Other Scheme"
            ],
            "si": [
                "1. සමාජ සේවා දෙපාර්තමේන්තුව",
                "2. ජනාධිපති අරමුදල",
                "3. පළාත් අරමුදල් (3%)",
                "4. IDB (කාර්මික සංවර්ධන මණ්ඩලය)",
                "5. ප්‍රාදේශීය සභාව",
                "6. විදාතා සම්පත් මධ්‍යස්ථානය",
                "7. සමෘද්ධි සංවර්ධන දෙපාර්තමේන්තුව",
                "8. NEDA (ජාතික ව්‍යවසාය සංවර්ධන අධිකාරිය)",
                "9. අස්වැසුම",
                "10. ප්‍රජා ශක්ති",
                "11. EDB (අපනයන සංවර්ධන මණ්ඩලය)",
                "12. ADB / ලෝක බැංකු ආධාර",
                "13. ජාතික ඵලදායිතා ලේකම් කාර්යාලය",
                "14. ග්‍රාමීය ණය",
                "15. ප්‍රජා සංවර්ධන",
                "16. කාන්තා සමිති අරමුදල්",
                "17. වෙනත්"
            ],
            "ta": [
                "1. சமூக சேவைத் திணைக்களம்",
                "2. ஜனாதிபதி நிதி",
                "3. மாகாண நிதி (3%)",
                "4. IDB",
                "5. பிரதேச சபை",
                "6. விமிதா மையம்",
                "7. சமுர்த்தி திணைக்களம்",
                "8. NEDA",
                "9. அஸ்வெசும",
                "10. பிரஜா சக்தி",
                "11. EDB",
                "12. ADB உதவி",
                "13. உற்பத்தித்திறன் செயலகம்",
                "14. கிராமப்புற கடன்",
                "15. சமூக அபிவிருத்தி",
                "16. பெண்கள் சங்கம்",
                "17. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 13,
        "key": "q_gov_program_benefits",
        "type": "text",
        "en": "13.1.2 Key Benefits Received from These Programs",
        "si": "13.1.2 මෙම වැඩසටහන් වලින් ලැබුණු ප්‍රතිලාභ",
        "ta": "13.1.2 இந்தத் திட்டங்களிலிருந்து பெறப்பட்ட நன்மைகள்",
        "exp_en": "Actual tangible outcomes, grants, machinery or knowledge gained",
        "exp_si": "ඉහත වැඩසටහන් වලින් ව්‍යාපාරයට ලැබුණු ප්‍රයෝජන හා වාසි විස්තර කරන්න",
        "exp_ta": "பெறப்பட்ட நன்மைகள்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 13,
        "key": "q_gov_application_ease",
        "type": "select",
        "en": "13.1.3 Ease of Applying for Government Programs",
        "si": "13.1.3 වැඩසටහන් සඳහා අයදුම් කිරීමේ පහසුව",
        "ta": "13.1.3 திட்டங்களுக்கு விண்ணப்பிப்பதில் உள்ள எளிமை",
        "exp_en": "Administrative complexity and paper load when applying for assistance",
        "exp_si": "රජයේ ආධාර හෝ වැඩසටහන් සඳහා අයදුම් කිරීමේදී අත්විඳි පහසුව හෝ අපහසුතාව",
        "exp_ta": "விண்ணப்பிப்பதில் உள்ள எளிமை",
        "options": {
            "en": [
                "1. Very Easy",
                "2. Easy",
                "3. Difficult",
                "4. Very Difficult",
                "5. Never Applied"
            ],
            "si": [
                "1. ඉතා පහසුයි",
                "2. පහසුයි",
                "3. අපහසුයි",
                "4. ඉතා අපහසුයි",
                "5. අයදුම් කර නැත"
            ],
            "ta": [
                "1. மிகவும் எளிதானது",
                "2. எளிதானது",
                "3. கடினமானது",
                "4. மிகவும் கடினமானது",
                "5. விண்ணப்பிக்கவில்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 13,
        "key": "q_business_evaluation",
        "type": "multiselect",
        "en": "13.2.1 Has the Business Been Evaluated / Rated at Any Level?",
        "si": "13.2.1 ව්‍යාපාරය ඇගයීමකට ලක්වී තිබේද?",
        "ta": "13.2.1 வணிகம் ஏதேனும் மட்டத்தில் மதிப்பீடு செய்யப்பட்டுள்ளதா?",
        "exp_en": "Official competitions, ratings, or institutional evaluations",
        "exp_si": "රාජ්‍ය හෝ පෞද්ගලික ආයතන මඟින් ව්‍යාපාරය ඇගයීමට ලක්වූ මට්ටම්",
        "exp_ta": "மதிப்பீட்டு மட்டங்கள்",
        "options": {
            "en": [
                "1. Village Level",
                "2. Divisional Level",
                "3. District Level",
                "4. Provincial Level",
                "5. National Level",
                "6. International Level",
                "7. Never Evaluated"
            ],
            "si": [
                "1. ග්‍රාමීය",
                "2. ප්‍රාදේශීය",
                "3. දිස්ත්‍රික්",
                "4. පළාත්",
                "5. ජාතික",
                "6. ජාත්‍යන්තර",
                "7. ඇගයීමකට ලක්ව නැත"
            ],
            "ta": [
                "1. கிராம மட்டம்",
                "2. பிரதேச மட்டம்",
                "3. மாவட்ட மட்டம்",
                "4. மாகாண மட்டம்",
                "5. தேசிய மட்டம்",
                "6. சர்வதேச மட்டம்",
                "7. மதிப்பீடு செய்யப்படவில்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 13,
        "key": "q_awards_received",
        "type": "select",
        "en": "13.2.2 Have You Won Any Awards or Formal Recognitions?",
        "si": "13.2.2 සම්මාන/පිළිගැනීම් ලැබී තිබේද?",
        "ta": "13.2.2 ஏதேனும் விருதுகள் அல்லது அங்கீகாரங்கள் கிடைத்துள்ளதா?",
        "exp_en": "Prizes, certificates of merit, or entrepreneur awards won",
        "exp_si": "ව්‍යවසායක සම්මාන, සහතික හෝ ඇගයීම් ලැබී ඇත්දැයි තෝරන්න",
        "exp_ta": "விருதுகள் அல்லது அங்கீகாரங்கள்",
        "options": {
            "en": [
                "1. Yes",
                "2. No"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 14,
        "key": "q_transport_vehicles",
        "type": "multiselect",
        "en": "14.1.1 Vehicles Used for Business Transport",
        "si": "14.1.1 ව්‍යාපාරය සඳහා භාවිතා කරන වාහනය",
        "ta": "14.1.1 வணிகத்திற்கு பயன்படுத்தப்படும் வாகனங்கள்",
        "exp_en": "Means of transport utilized for business errands and distribution",
        "exp_si": "අමුද්‍රව්‍ය හා නිමි භාණ්ඩ ප්‍රවාහනයට යොදාගන්නා වාහන තෝරන්න",
        "exp_ta": "பயன்படுத்தப்படும் வாகனங்கள்",
        "options": {
            "en": [
                "1. No Vehicle (Public Transport / On Foot)",
                "2. Bicycle",
                "3. Motorcycle",
                "4. Three-Wheeler (Tuk-Tuk)",
                "5. Small Mini Truck (Batta Lorry)",
                "6. Tipper / Dump Truck",
                "7. Large Truck / Lorry",
                "8. Tractor",
                "9. Other Vehicle"
            ],
            "si": [
                "1. වාහනයක් නැත (පොදු ප්‍රවාහනය)",
                "2. බයිසිකලය",
                "3. යතුරුපැදිය",
                "4. ත්‍රීවීල් රථය",
                "5. බට්ටා ලොරිය (ඩිමෝ බට්ටා)",
                "6. ටිපර් රථය",
                "7. විශාල ලොරිය",
                "8. ට්‍රැක්ටරය",
                "9. වෙනත්"
            ],
            "ta": [
                "1. வாகனம் இல்லை",
                "2. மிதிவண்டி",
                "3. மோட்டார் சைக்கிள்",
                "4. மூன்று சக்கர வண்டி",
                "5. சிறிய மினி லொறி (பட்டா)",
                "6. டிப்பர்",
                "7. பெரிய லொறி",
                "8. டிராக்டர்",
                "9. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 14,
        "key": "q_raw_transport",
        "type": "text",
        "en": "14.1.2 How Raw Materials are Transported to Premises",
        "si": "14.1.2 අමුද්‍රව්‍ය ප්‍රවාහනය කරන ආකාරය",
        "ta": "14.1.2 மூலப்பொருட்கள் கொண்டு வரப்படும் விதம்",
        "exp_en": "Logistics arrangement for bringing raw materials to the workshop",
        "exp_si": "අමුද්‍රව්‍ය ව්‍යාපාරික ස්ථානයට ගෙන ඒමේ ප්‍රවාහන ක්‍රමවේදය",
        "exp_ta": "மூலப்பொருள் போக்குவரத்து முறை",
        "options": null,
        "depends_on": null
    },
    {
        "step": 14,
        "key": "q_goods_transport",
        "type": "text",
        "en": "14.1.3 How Finished Products are Delivered to Buyers / Market",
        "si": "14.1.3 නිෂ්පාදිත භාණ්ඩ ප්‍රවාහනය කරන ආකාරය",
        "ta": "14.1.3 முடிக்கப்பட்ட பொருட்கள் சந்தைக்கு கொண்டு செல்லப்படும் விதம்",
        "exp_en": "Distribution logistics for delivering finished items to customers",
        "exp_si": "නිමි භාණ්ඩ වෙළඳපලට හෝ පාරිභෝගිකයා වෙත යැවීමේ ප්‍රවාහන ක්‍රමය",
        "exp_ta": "முடிக்கப்பட்ட பொருட்கள் விநியோகம்",
        "options": null,
        "depends_on": null
    },
    {
        "step": 14,
        "key": "q_transport_cost",
        "type": "number",
        "en": "14.1.4 Average Monthly Transport & Logistics Cost (LKR)",
        "si": "14.1.4 මාසික ප්‍රවාහන වියදම (රු.)",
        "ta": "14.1.4 சராசரி மாதாந்திர போக்குவரத்து செலவு (ரூ.)",
        "exp_en": "Total fuel, delivery, vehicle rent, and freight expenses per month",
        "exp_si": "ප්‍රවාහනය, ඉන්ධන සහ කුලී රථ වෙනුවෙන් මසකට වැයවන මුදල රුපියල් වලින්",
        "exp_ta": "மாதாந்திர போக்குவரத்து செலவு",
        "options": null,
        "depends_on": null
    },
    {
        "step": 15,
        "key": "q_village_expansion_how",
        "type": "select",
        "en": "15.1 How This Industry Can be Further Expanded in the Village",
        "si": "15.1 ගම තුළ තවදුරටත් ව්‍යාප්ත කළ හැකි ආකාරය",
        "ta": "15.1 கிராமத்தில் இந்த தொழிலை மேலும் விரிவுபடுத்துவது எப்படி",
        "exp_en": "Practical mechanisms for spreading this manufacturing skill in the community",
        "exp_si": "ගමේ අනෙක් අයටද මෙම කර්මාන්තය හඳුන්වා දී රැකියා උත්පාදනය කළ හැකි ක්‍රම",
        "exp_ta": "கிராம விரிவாக்க வழிமுறைகள்",
        "options": {
            "en": [
                "1. Sub-contracting / Cottage Outsourcing",
                "2. Vocational Training / Apprenticeships",
                "3. Cluster / Cooperative Formation",
                "4. Other Approach"
            ],
            "si": [
                "1. උප කොන්ත්‍රාත්කරණය (නිවෙස්වලට වැඩ ලබාදීම)",
                "2. පුහුණු කිරීම / ආධුනිකත්ව",
                "3. පොකුරු / සමුපකාර ගොඩනැගීම",
                "4. වෙනත්"
            ],
            "ta": [
                "1. துணை ஒப்பந்தம் / வீட்டு வேலை",
                "2. தொழிற்பயிற்சி",
                "3. கூட்டுறவு அமைத்தல்",
                "4. மற்றவை"
            ]
        },
        "depends_on": null
    },
    {
        "step": 15,
        "key": "q_other_comments",
        "type": "text",
        "en": "15.2 Additional Comments, Grievances & Suggestions",
        "si": "15.2 වෙනත් අදහස්/යෝජනා",
        "ta": "15.2 பிற கருத்துக்கள் மற்றும் ஆலோசனைகள்",
        "exp_en": "Any other observations, policy recommendations, or notes by the surveyor/owner",
        "exp_si": "සමීක්ෂකයාගේ හෝ ව්‍යාපාර හිමියාගේ වෙනත් ඕනෑම අදහස්, යෝජනා හෝ ගැටළු මෙහි සටහන් කරන්න",
        "exp_ta": "பிற கருத்துக்கள் மற்றும் பரிந்துரைகள்",
        "options": null,
        "depends_on": null
    }
]
JSON;

        $questions = json_decode($json, true);

        foreach ($questions as $idx => $q) {
            BusinessSurveyQuestion::updateOrCreate(
                ['field_key' => $q['key']],
                [
                    'step_index' => $q['step'],
                    'type' => $q['type'],
                    'question_en' => $q['en'],
                    'question_si' => $q['si'],
                    'question_ta' => $q['ta'],
                    'explanation_en' => !empty($q['exp_en']) ? $q['exp_en'] : null,
                    'explanation_si' => !empty($q['exp_si']) ? $q['exp_si'] : null,
                    'explanation_ta' => !empty($q['exp_ta']) ? $q['exp_ta'] : null,
                    'options_json' => $q['options'] ?? null,
                    'depends_on' => $q['depends_on'] ?? null,
                    'is_active' => true,
                    'sort_order' => $idx,
                ]
            );
        }
    }
}
