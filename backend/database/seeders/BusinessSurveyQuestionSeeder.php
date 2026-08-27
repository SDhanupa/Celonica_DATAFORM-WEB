<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessSurveyQuestion;

class BusinessSurveyQuestionSeeder extends Seeder
{
    public function run(): void
    {
        BusinessSurveyQuestion::truncate();

        $json = <<<JSON
[
    {
        "step": 0,
        "key": "b_name",
        "type": "custom",
        "en": "Business Location Name",
        "si": "ව්‍යාපාර ස්ථානයේ නම",
        "ta": "வணிகத்தின் பெயர்"
    },
    {
        "step": 0,
        "key": "b_reg_no",
        "type": "custom",
        "en": "Business Registration Number",
        "si": "ව්‍යාපාර ලියාපදිංචි අංකය",
        "ta": "வணிக பதிவு எண்"
    },
    {
        "step": 0,
        "key": "b_address",
        "type": "custom",
        "en": "Address",
        "si": "ලිපිනය",
        "ta": "முகவரி"
    },
    {
        "step": 0,
        "key": "b_owner_name",
        "type": "custom",
        "en": "Business Owner Name",
        "si": "ව්‍යාපාර හිමියාගේ නම",
        "ta": "உரிமையாளரின் பெயர்"
    },
    {
        "step": 0,
        "key": "b_mobile",
        "type": "custom",
        "en": "WhatsApp / Mobile Number",
        "si": "වට්ස්ඇප්/ මොබයිල් අංකය",
        "ta": "வாட்ஸ்அப்/ மொபைல் எண்"
    },
    {
        "step": 0,
        "key": "b_type",
        "type": "custom",
        "en": "Business Type",
        "si": "ව්‍යාපාර වර්ගය",
        "ta": "வணிக வகை"
    },
    {
        "step": 0,
        "key": "b_nic",
        "type": "custom",
        "en": "NIC",
        "si": "NIC",
        "ta": "தேசிய அடையாள அட்டை"
    },
    {
        "step": 0,
        "key": "b_photo",
        "type": "custom",
        "en": "Photo of the Business",
        "si": "ව්‍යාපාරයේ ඡායාරූපයක්",
        "ta": "வணிகத்தின் புகைப்படம்"
    },
    {
        "step": 1,
        "key": "q_owner_name",
        "type": "custom",
        "en": "Owner's Full Name",
        "si": "හිමිකරුගේ සම්පූර්ණ නම",
        "ta": "உரிமையாளரின் முழுப் பெயர்"
    },
    {
        "step": 1,
        "key": "q_gender",
        "type": "custom",
        "en": "Gender",
        "si": "ස්ත්‍රී/පුරුෂ භාවය",
        "ta": "பாலினம்"
    },
    {
        "step": 1,
        "key": "q_nic",
        "type": "custom",
        "en": "National Identity Card Number (NIC)",
        "si": "ජාතික හැඳුනුම්පත් අංකය",
        "ta": "தேசிய அடையாள அட்டை எண் (NIC)"
    },
    {
        "step": 1,
        "key": "q_dob_age",
        "type": "custom",
        "en": "Date of Birth / Age",
        "si": "උපන් දිනය / වයස",
        "ta": "பிறந்த தேதி / வயது"
    },
    {
        "step": 1,
        "key": "q_whatsapp",
        "type": "custom",
        "en": "WhatsApp Number",
        "si": "වට්ස්ඇප් දුරකථන අංකය",
        "ta": "வாட்ஸ்அப் எண்"
    },
    {
        "step": 1,
        "key": "q_mobile",
        "type": "custom",
        "en": "Main Phone Number",
        "si": "ප්‍රධාන දුරකථන අංකය",
        "ta": "முக்கிய தொலைபேசி எண்"
    },
    {
        "step": 1,
        "key": "q_email",
        "type": "custom",
        "en": "Email Address (if any)",
        "si": "විද්‍යුත් තැපැල් ලිපිනය (ඇත්නම්)",
        "ta": "மின்னஞ்சல் முகவரி (ஏதேனும் இருந்தால்)"
    },
    {
        "step": 1,
        "key": "q_address",
        "type": "custom",
        "en": "Residential Address",
        "si": "නියාසික ලිපිනය",
        "ta": "குடியிருப்பு முகவரி"
    },
    {
        "step": 1,
        "key": "q_education",
        "type": "custom",
        "en": "Highest Educational Qualification",
        "si": "උසස්ම අධ්‍යාපන සුදුසුකම",
        "ta": "மிக உயர்ந்த கல்வித் தகுதி"
    },
    {
        "step": 1,
        "key": "q_experience",
        "type": "custom",
        "en": "Experience in this Industry (Years)",
        "si": "මෙම කර්මාන්තයේ පළපුරුද්ද (වසර)",
        "ta": "இந்த தொழிலில் அனுபவம் (ஆண்டுகள்)"
    },
    {
        "step": 1,
        "key": "q_prev_occupation",
        "type": "custom",
        "en": "Occupation before starting the industry",
        "si": "කර්මාන්තය ආරම්භ කිරීමට පෙර රැකියාව",
        "ta": "தொழிலைத் தொடங்குவதற்கு முன் தொழில்"
    },
    {
        "step": 2,
        "key": "q_legal_status",
        "type": "select",
        "en": "What is the legal form of the business?",
        "si": "ව්‍යාපාරයේ නෛතික තත්ත්වය කුමක්ද?",
        "ta": "வணிகத்தின் சட்ட வடிவம் என்ன?",
        "options": {
            "en": [
                "1. Sole Proprietorship",
                "2. Partnership",
                "3. Private Limited (Pvt Ltd)",
                "4. Public Limited (PLC)",
                "5. Cooperative Society",
                "6. Unregistered Home Business",
                "7. Other (Specify)"
            ],
            "si": [
                "1. තනි පුද්ගල ව්‍යාපාරය",
                "2. හවුල් ව්‍යාපාරය",
                "3. පෞද්ගලික සමාගම (Pvt Ltd)",
                "4. පොදු සමාගම (PLC)",
                "5. සමුපකාර සමිතිය",
                "6. ලියාපදිංචි නොකළ ගෘහාශ්‍රිත ව්‍යාපාරය",
                "7. වෙනත් (සඳහන් කරන්න)"
            ],
            "ta": [
                "1. தனி உரிமையாளர்",
                "2. கூட்டாண்மை",
                "3. தனியார் வரையறுக்கப்பட்ட (Pvt Ltd)",
                "4. பொது வரையறுக்கப்பட்ட (PLC)",
                "5. கூட்டுறவு சங்கம்",
                "6. பதிவு செய்யப்படாத வீட்டு வணிகம்",
                "7. மற்றவை (குறிப்பிடவும்)"
            ]
        }
    },
    {
        "step": 2,
        "key": "q_legal_status_other",
        "type": "text",
        "depends_on": "q_legal_status:7",
        "en": "Specify other form",
        "si": "වෙනත් ස්වරූපය සඳහන් කරන්න",
        "ta": "மற்ற வடிவத்தை குறிப்பிடவும்"
    },
    {
        "step": 2,
        "key": "q_is_registered",
        "type": "select",
        "en": "Is the business registered?",
        "si": "ව්‍යාපාරය ලියාපදිංචි කර තිබේද?",
        "ta": "வணிகம் பதிவு செய்யப்பட்டுள்ளதா?",
        "options": {
            "en": [
                "1. Yes",
                "2. In the registration process",
                "3. No"
            ],
            "si": [
                "1. ඔව්",
                "2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ පවතී",
                "3. නැත"
            ],
            "ta": [
                "1. ஆம்",
                "2. பதிவு செயல்பாட்டில் உள்ளது",
                "3. இல்லை"
            ]
        }
    },
    {
        "step": 2,
        "key": "q_registered_agencies",
        "type": "multiselect",
        "depends_on": "q_is_registered:1,2",
        "en": "If registered, with which agency? (Multiple Choice)",
        "si": "ලියාපදිංචි කර ඇත්නම්, කුමන ආයතනයේද? (බහුවරණ)",
        "ta": "பதிவு செய்யப்பட்டிருந்தால், எந்த நிறுவனத்துடன்? (பல தேர்வு)",
        "options": {
            "en": [
                "1. Local Council",
                "2. Divisional Secretariat",
                "3. Registrar of Companies",
                "4. Tax Department",
                "5. Social Security Board",
                "6. Other"
            ],
            "si": [
                "1. පළාත් පාලන ආයතනය",
                "2. ප්‍රාදේශීය ලේකම් කාර්යාලය",
                "3. සමාගම් ලියාපදිංචි කාර්යාලය",
                "4. බදු දෙපාර්තමේන්තුව",
                "5. සමාජ ආරක්ෂණ මණ්ඩලය",
                "6. වෙනත්"
            ],
            "ta": [
                "1. உள்ளாட்சி சபை",
                "2. பிரதேச செயலகம்",
                "3. நிறுவனங்களின் பதிவாளர்",
                "4. வரித் துறை",
                "5. சமூக பாதுகாப்பு வாரியம்",
                "6. மற்றவை"
            ]
        }
    },
    {
        "step": 2,
        "key": "q_registration_number",
        "type": "text",
        "depends_on": "q_is_registered:1",
        "en": "Registration Number (If available)",
        "si": "ලියාපදිංචි අංකය (තිබේ නම්)",
        "ta": "பதிவு எண் (இருந்தால்)"
    },
    {
        "step": 2,
        "key": "q_has_vat",
        "type": "select",
        "en": "Are you registered for VAT?",
        "si": "ඔබ VAT සඳහා ලියාපදිංචි වී තිබේද?",
        "ta": "நீங்கள் VAT க்கு பதிவு செய்யப்பட்டுள்ளீர்களா?",
        "options": {
            "en": [
                "1. Yes",
                "2. No",
                "3. In Process"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත",
                "3. ක්‍රියාවලියේ පවතී"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை",
                "3. செயல்பாட்டில் உள்ளது"
            ]
        }
    },
    {
        "step": 2,
        "key": "q_vat_number",
        "type": "text",
        "depends_on": "q_has_vat:1",
        "en": "Enter VAT Number",
        "si": "VAT අංකය ඇතුළත් කරන්න",
        "ta": "VAT எண்ணை உள்ளிடவும்"
    },
    {
        "step": 3,
        "key": "q_business_location_type",
        "type": "select",
        "en": "Location of the Business",
        "si": "ව්‍යාපාර ස්ථානයේ ස්වභාවය",
        "ta": "வணிகத்தின் இடம்",
        "options": {
            "en": [
                "1. Same as Residence",
                "2. Separate Building",
                "3. Mobile/Vehicle",
                "4. Online Only"
            ],
            "si": [
                "1. පදිංචි ස්ථානයම",
                "2. වෙනම ගොඩනැගිල්ලක්",
                "3. ජංගම/වාහනයක",
                "4. අන්තර්ජාලය හරහා පමණක්"
            ],
            "ta": [
                "1. வசிக்கும் இடமே",
                "2. தனி கட்டிடம்",
                "3. மொபைல்/வாகனம்",
                "4. ஆன்லைனில் மட்டும்"
            ]
        }
    },
    {
        "step": 3,
        "key": "q_business_address",
        "type": "text",
        "depends_on": "q_business_location_type:2",
        "en": "Address of the Business (If different from residence)",
        "si": "ව්‍යාපාරයේ ලිපිනය (පදිංචි ස්ථානයෙන් වෙනස් නම්)",
        "ta": "வணிகத்தின் முகவரி (வசிக்கும் இடத்திலிருந்து வேறுபட்டால்)"
    },
    {
        "step": 3,
        "key": "q_branch_address",
        "type": "text",
        "en": "Address of Branches (If any)",
        "si": "ශාඛාවල ලිපිනය (ඇත්නම්)",
        "ta": "கிளைகளின் முகவரி (ஏதேனும் இருந்தால்)"
    },
    {
        "step": 3,
        "key": "q_location_ownership",
        "type": "select",
        "en": "Ownership of the Business Location",
        "si": "ව්‍යාපාර ස්ථානයේ අයිතිය",
        "ta": "வணிக இடத்தின் உரிமை",
        "options": {
            "en": [
                "1. Fully Owned",
                "2. Rented/Leased",
                "3. State Land",
                "4. Family Owned (No deed)",
                "5. Other"
            ],
            "si": [
                "1. සම්පූර්ණ අයිතිය",
                "2. කුලියට/බදු",
                "3. රජයේ ඉඩම්",
                "4. පවුලේ අයිතිය (ඔප්පු නැත)",
                "5. වෙනත්"
            ],
            "ta": [
                "1. முழு உரிமையாளர்",
                "2. வாடகைக்கு/குத்தகைக்கு",
                "3. அரச காணி",
                "4. குடும்பத்திற்கு சொந்தமானது (பத்திரம் இல்லை)",
                "5. மற்றவை"
            ]
        }
    },
    {
        "step": 3,
        "key": "q_rent_amount",
        "type": "number",
        "depends_on": "q_location_ownership:2",
        "en": "If rented, Monthly Rent (Rs.)",
        "si": "කුලියට නම්, මාසික කුලිය (රු.)",
        "ta": "வாடகைக்கு இருந்தால், மாத வாடகை (ரூ.)"
    },
    {
        "step": 3,
        "key": "q_pay_building_tax",
        "type": "select",
        "en": "Do you pay municipal building taxes?",
        "si": "ඔබ නගර සභා/ප්‍රාදේශීය සභා ගොඩනැගිලි බදු ගෙවනවාද?",
        "ta": "நீங்கள் நகர சபை/பிரதேச சபை கட்டிட வரி செலுத்துகிறீர்களா?",
        "options": {
            "en": [
                "1. Yes",
                "2. No",
                "3. Not Applicable"
            ],
            "si": [
                "1. ඔව්",
                "2. නැත",
                "3. අදාළ නොවේ"
            ],
            "ta": [
                "1. ஆம்",
                "2. இல்லை",
                "3. பொருந்தாது"
            ]
        }
    },
    {
        "step": 3,
        "key": "q_building_tax_amount",
        "type": "number",
        "depends_on": "q_pay_building_tax:1",
        "en": "Annual Tax Amount (Rs.)",
        "si": "වාර්ෂික බදු මුදල (රු.)",
        "ta": "வருடாந்திர வரித் தொகை (ரூ.)"
    },
    {
        "step": 3,
        "key": "q_uses_electricity",
        "type": "select",
        "en": "Does the business use Electricity?",
        "si": "ව්‍යාපාරය සඳහා විදුලිය භාවිතා කරන්නේද?",
        "ta": "வணிகம் மின்சாரத்தைப் பயன்படுத்துகிறதா?",
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
        }
    },
    {
        "step": 3,
        "key": "q_main_energy_source",
        "type": "multiselect",
        "depends_on": "q_uses_electricity:1",
        "en": "Main source of energy (Multiple Choice)",
        "si": "ප්‍රධාන බලශක්ති ප්‍රභවය (බහුවරණ)",
        "ta": "முக்கிய ஆற்றல் ஆதாரம் (பல தேர்வு)",
        "options": {
            "en": [
                "1. National Grid (CEB/LECO)",
                "2. Solar Power",
                "3. Generator (Diesel/Petrol)",
                "4. Firewood/Biomass",
                "5. Other"
            ],
            "si": [
                "1. ජාතික විදුලිබල පද්ධතිය (CEB/LECO)",
                "2. සූර්ය බලශක්තිය (Solar)",
                "3. විදුලි ජනක යන්ත්‍ර (Generator)",
                "4. දර/ජෛව ස්කන්ධ (Biomass)",
                "5. වෙනත්"
            ],
            "ta": [
                "1. தேசிய மின் கட்டமைப்பு (CEB/LECO)",
                "2. சூரிய சக்தி (Solar)",
                "3. மின்னாக்கி (Generator)",
                "4. விறகு/உயிரிப் பொருள் (Biomass)",
                "5. மற்றவை"
            ]
        }
    },
    {
        "step": 3,
        "key": "q_power_outages",
        "type": "select",
        "en": "Does power outage affect your business?",
        "si": "විදුලි කප්පාදුව ඔබේ ව්‍යාපාරයට බලපාන්නේද?",
        "ta": "மின்வெட்டு உங்கள் வணிகத்தை பாதிக்கிறதா?",
        "options": {
            "en": [
                "1. High Impact",
                "2. Low Impact",
                "3. No Impact"
            ],
            "si": [
                "1. දැඩි බලපෑමක් ඇත",
                "2. සුළු බලපෑමක් ඇත",
                "3. බලපෑමක් නැත"
            ],
            "ta": [
                "1. அதிக பாதிப்பு",
                "2. குறைந்த பாதிப்பு",
                "3. பாதிப்பு இல்லை"
            ]
        }
    },
    {
        "step": 3,
        "key": "q_water_source",
        "type": "select",
        "en": "Main source of Water",
        "si": "ප්‍රධාන ජල ප්‍රභවය",
        "ta": "முக்கிய நீர் ஆதாரம்",
        "options": {
            "en": [
                "1. National Water Board",
                "2. Tube Well",
                "3. Ordinary Well",
                "4. River/Stream",
                "5. Buying Water",
                "6. Not required for business"
            ],
            "si": [
                "1. ජල සම්පාදන මණ්ඩලය",
                "2. නළ ළිඳ",
                "3. සාමාන්‍ය ළිඳ",
                "4. ගඟ/ඇළ",
                "5. ජලය මිලදී ගැනීම",
                "6. ව්‍යාපාරයට ජලය අවශ්‍ය නොවේ"
            ],
            "ta": [
                "1. தேசிய நீர் வழங்கல் சபை",
                "2. குழாய் கிணறு",
                "3. சாதாரண கிணறு",
                "4. ஆறு/நீரோடை",
                "5. தண்ணீர் வாங்குதல்",
                "6. வணிகத்திற்கு தண்ணீர் தேவையில்லை"
            ]
        }
    },
    {
        "step": 3,
        "key": "q_water_storage",
        "type": "select",
        "en": "Do you have a water storage facility (Tank)?",
        "si": "ඔබට ජල ගබඩා පහසුකමක් (ටැංකියක්) තිබේද?",
        "ta": "உங்களிடம் நீர் சேமிப்பு வசதி (தொட்டி) உள்ளதா?",
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
        }
    },
    {
        "step": 3,
        "key": "q_internet_access",
        "type": "select",
        "en": "Do you have internet access for the business?",
        "si": "ව්‍යාපාරය සඳහා අන්තර්ජාල පහසුකම් තිබේද?",
        "ta": "வணிகத்திற்கு இணைய வசதி உள்ளதா?",
        "options": {
            "en": [
                "1. Fixed Broadband (Fiber/ADSL)",
                "2. Mobile Router (4G)",
                "3. Mobile Data (Phone)",
                "4. No Internet"
            ],
            "si": [
                "1. ස්ථාවර අන්තර්ජාලය (Fiber/ADSL)",
                "2. ජංගම රවුටර (4G)",
                "3. ජංගම දුරකථන දත්ත (Mobile Data)",
                "4. අන්තර්ජාල පහසුකම් නැත"
            ],
            "ta": [
                "1. நிலையான இணையம் (Fiber/ADSL)",
                "2. மொபைல் திசைவி (4G)",
                "3. மொபைல் தரவு (Mobile Data)",
                "4. இணைய வசதி இல்லை"
            ]
        }
    },
    {
        "step": 3,
        "key": "q_telephone_service",
        "type": "multiselect",
        "en": "Available telephone services (Multiple Choice)",
        "si": "පවතින දුරකථන සේවා (බහුවරණ)",
        "ta": "கிடைக்கும் தொலைபேசி சேவைகள் (பல தேர்வு)",
        "options": {
            "en": [
                "1. Landline",
                "2. Mobile",
                "3. WhatsApp/Viber",
                "4. None"
            ],
            "si": [
                "1. ස්ථාවර දුරකථන",
                "2. ජංගම දුරකථන",
                "3. වට්ස්ඇප්/වයිබර්",
                "4. කිසිවක් නැත"
            ],
            "ta": [
                "1. நிலையான தொலைபேசி",
                "2. மொபைல் தொலைபேசி",
                "3. வாட்ஸ்அப்/வைபர்",
                "4. ஏதுமில்லை"
            ]
        }
    },
    {
        "step": 4,
        "key": "q_capital_sources",
        "type": "multiselect",
        "en": "Main sources of initial capital (Multiple Choice)",
        "si": "මූලික ප්‍රාග්ධනය ලබාගත් ප්‍රධාන මාර්ග (බහුවරණ)",
        "ta": "ஆரம்ப மூலதனத்தின் முக்கிய ஆதாரங்கள் (பல தேர்வு)",
        "options": {
            "en": [
                "1. Personal Savings",
                "2. Bank Loan",
                "3. Samurdhi Loan",
                "4. Microfinance Loan",
                "5. Loans from Family/Friends",
                "6. Government Grant",
                "7. Other"
            ],
            "si": [
                "1. පෞද්ගලික ඉතුරුම්",
                "2. බැංකු ණය",
                "3. සමෘද්ධි ණය",
                "4. ක්ෂුද්‍ර මූල්‍ය ණය",
                "5. පවුලේ අයගෙන්/මිතුරන්ගෙන් ලබාගත් ණය",
                "6. රජයේ ප්‍රදාන",
                "7. වෙනත්"
            ],
            "ta": [
                "1. தனிப்பட்ட சேமிப்பு",
                "2. வங்கி கடன்",
                "3. சமுர்த்தி கடன்",
                "4. நுண்நிதி கடன்",
                "5. குடும்பத்தினர்/நண்பர்களிடமிருந்து கடன்கள்",
                "6. அரச மானியம்",
                "7. மற்றவை"
            ]
        }
    },
    {
        "step": 4,
        "key": "q_business_scale",
        "type": "select",
        "en": "Current scale of the business",
        "si": "ව්‍යාපාරයේ වත්මන් පරිමාණය",
        "ta": "வணிகத்தின் தற்போதைய அளவு",
        "options": {
            "en": [
                "1. Micro (Less than Rs.1M turnover)",
                "2. Small (Rs.1M - Rs.10M turnover)",
                "3. Medium (Rs.10M - Rs.50M turnover)",
                "4. Large (Over Rs.50M turnover)"
            ],
            "si": [
                "1. ක්ෂුද්‍ර (වාර්ෂික පිරිවැටුම රු. මිලියන 1ට අඩු)",
                "2. කුඩා (රු. මිලියන 1 - 10 අතර)",
                "3. මධ්‍යම (රු. මිලියන 10 - 50 අතර)",
                "4. මහා පරිමාණ (රු. මිලියන 50ට වැඩි)"
            ],
            "ta": [
                "1. நுண் (ரூ. 1 மில்லியனுக்கும் குறைவான வருவாய்)",
                "2. சிறிய (ரூ. 1 மில்லியன் - 10 மில்லியன் வருவாய்)",
                "3. நடுத்தர (ரூ. 10 மில்லியன் - 50 மில்லியன் வருவாய்)",
                "4. பெரிய (ரூ. 50 மில்லியனுக்கு மேல் வருவாய்)"
            ]
        }
    },
    {
        "step": 4,
        "key": "q_engagement_nature",
        "type": "select",
        "en": "Nature of engagement",
        "si": "ඔබ ව්‍යාපාරයේ යෙදෙන ආකාරය",
        "ta": "ஈடுபாட்டின் தன்மை",
        "options": {
            "en": [
                "1. Full-time",
                "2. Part-time",
                "3. Seasonal"
            ],
            "si": [
                "1. පූර්ණ කාලීන",
                "2. අර්ධ කාලීන",
                "3. සෘතුමය (කාලීන)"
            ],
            "ta": [
                "1. முழு நேரம்",
                "2. பகுதி நேரம்",
                "3. பருவகால"
            ]
        }
    },
    {
        "step": 4,
        "key": "q_business_place",
        "type": "select",
        "en": "Primary place of business operations",
        "si": "ව්‍යාපාරික මෙහෙයුම් සිදුකරන ප්‍රධාන ස්ථානය",
        "ta": "வணிக நடவடிக்கைகளின் முக்கிய இடம்",
        "options": {
            "en": [
                "1. Within the village/GN division",
                "2. Town area",
                "3. Throughout the country (Mobile/Distribution)",
                "4. Export oriented"
            ],
            "si": [
                "1. ගම/ග්‍රාම නිලධාරී වසම තුළ",
                "2. නගරය තුළ",
                "3. දිවයින පුරා (ජංගම/බෙදාහැරීම්)",
                "4. අපනයන සඳහා පමණි"
            ],
            "ta": [
                "1. கிராமம்/கிராம உத்தியோகத்தர் பிரிவுக்குள்",
                "2. நகரப் பகுதி",
                "3. நாடு முழுவதும் (மொபைல்/விநியோகம்)",
                "4. ஏற்றுமதி சார்ந்தது"
            ]
        }
    },
    {
        "step": 5,
        "key": "q_total_workers",
        "type": "number",
        "en": "Total number of employees (including owner)",
        "si": "මුළු සේවකයින් ගණන (හිමිකරුද ඇතුළුව)",
        "ta": "மொத்த ஊழியர்களின் எண்ணிக்கை (உரிமையாளர் உட்பட)"
    },
    {
        "step": 5,
        "key": "q_female_workers",
        "type": "number",
        "en": "Number of female workers",
        "si": "කාන්තා සේවකයින් ගණන",
        "ta": "பெண் தொழிலாளர்களின் எண்ணிக்கை"
    },
    {
        "step": 5,
        "key": "q_male_workers",
        "type": "number",
        "en": "Number of male workers",
        "si": "පිරිමි සේවකයින් ගණන",
        "ta": "ஆண் தொழிலாளர்களின் எண்ணிக்கை"
    },
    {
        "step": 5,
        "key": "q_family_workers",
        "type": "number",
        "en": "Number of unpaid family workers",
        "si": "වැටුප් නොලබන පවුලේ සේවකයින් ගණන",
        "ta": "சம்பளம் பெறாத குடும்ப தொழிலாளர்களின் எண்ணிக்கை"
    },
    {
        "step": 5,
        "key": "q_epf_etf_registered",
        "type": "select",
        "en": "Are employees registered for EPF/ETF?",
        "si": "සේවකයින් EPF/ETF සඳහා ලියාපදිංචි කර තිබේද?",
        "ta": "ஊழியர்கள் EPF/ETF க்கு பதிவு செய்யப்பட்டுள்ளார்களா?",
        "options": {
            "en": [
                "1. Yes, all employees",
                "2. Yes, some employees",
                "3. No",
                "4. Not applicable (No employees)"
            ],
            "si": [
                "1. ඔව්, සියලුම සේවකයින්",
                "2. ඔව්, සමහර සේවකයින්",
                "3. නැත",
                "4. අදාළ නොවේ (සේවකයින් නොමැත)"
            ],
            "ta": [
                "1. ஆம், அனைத்து ஊழியர்களும்",
                "2. ஆம், சில ஊழியர்கள்",
                "3. இல்லை",
                "4. பொருந்தாது (ஊழியர்கள் இல்லை)"
            ]
        }
    },
    {
        "step": 5,
        "key": "q_worker_shortage",
        "type": "select",
        "en": "Do you face a shortage of workers?",
        "si": "ඔබට සේවක හිඟයක් පවතීද?",
        "ta": "நீங்கள் தொழிலாளர் பற்றாக்குறையை எதிர்கொள்கிறீர்களா?",
        "options": {
            "en": [
                "1. Yes, highly skilled workers",
                "2. Yes, unskilled labor",
                "3. Yes, both",
                "4. No shortage"
            ],
            "si": [
                "1. ඔව්, පුහුණු ශ්‍රමිකයින්ගේ",
                "2. ඔව්, නුපුහුණු ශ්‍රමිකයින්ගේ",
                "3. ඔව්, දෙවර්ගයේම",
                "4. සේවක හිඟයක් නොමැත"
            ],
            "ta": [
                "1. ஆம், அதிக திறன் கொண்ட தொழிலாளர்கள்",
                "2. ஆம், திறமையற்ற உழைப்பு",
                "3. ஆம், இரண்டும்",
                "4. பற்றாக்குறை இல்லை"
            ]
        }
    },
    {
        "step": 6,
        "key": "q_main_products",
        "type": "text",
        "en": "Main products or services offered",
        "si": "සපයනු ලබන ප්‍රධාන නිෂ්පාදන හෝ සේවා මොනවාද?",
        "ta": "வழங்கப்படும் முக்கிய தயாரிப்புகள் அல்லது சேவைகள்"
    },
    {
        "step": 6,
        "key": "q_monthly_income",
        "type": "select",
        "en": "Average Monthly Income (Rs.)",
        "si": "සාමාන්‍ය මාසික ආදායම (රු.)",
        "ta": "சராசரி மாத வருமானம் (ரூ.)",
        "options": {
            "en": [
                "1. Less than 50,000",
                "2. 50,000 - 100,000",
                "3. 100,000 - 500,000",
                "4. 500,000 - 1 Million",
                "5. Over 1 Million",
                "6. Prefer not to say"
            ],
            "si": [
                "1. 50,000 ට අඩු",
                "2. 50,000 - 100,000",
                "3. 100,000 - 500,000",
                "4. 500,000 - මිලියන 1",
                "5. මිලියන 1 ට වැඩි",
                "6. පැවසීමට අකමැතියි"
            ],
            "ta": [
                "1. 50,000 க்கும் குறைவான",
                "2. 50,000 - 100,000",
                "3. 100,000 - 500,000",
                "4. 500,000 - 1 மில்லியன்",
                "5. 1 மில்லியனுக்கு மேல்",
                "6. சொல்ல விரும்பவில்லை"
            ]
        }
    },
    {
        "step": 6,
        "key": "q_monthly_expenses",
        "type": "select",
        "en": "Average Monthly Business Expenses (Rs.)",
        "si": "සාමාන්‍ය මාසික ව්‍යාපාර වියදම (රු.)",
        "ta": "சராசரி மாத வணிக செலவுகள் (ரூ.)",
        "options": {
            "en": [
                "1. Less than 25,000",
                "2. 25,000 - 75,000",
                "3. 75,000 - 250,000",
                "4. 250,000 - 500,000",
                "5. Over 500,000",
                "6. Prefer not to say"
            ],
            "si": [
                "1. 25,000 ට අඩු",
                "2. 25,000 - 75,000",
                "3. 75,000 - 250,000",
                "4. 250,000 - 500,000",
                "5. 500,000 ට වැඩි",
                "6. පැවසීමට අකමැතියි"
            ],
            "ta": [
                "1. 25,000 க்கும் குறைவான",
                "2. 25,000 - 75,000",
                "3. 75,000 - 250,000",
                "4. 250,000 - 500,000",
                "5. 500,000 க்கும் மேல்",
                "6. சொல்ல விரும்பவில்லை"
            ]
        }
    },
    {
        "step": 6,
        "key": "q_market_reach",
        "type": "multiselect",
        "en": "Where do you sell your products/services? (Multiple Choice)",
        "si": "ඔබේ නිෂ්පාදන/සේවා අලෙවි කරන්නේ කොහිද? (බහුවරණ)",
        "ta": "உங்கள் தயாரிப்புகள்/சேவைகளை எங்கு விற்கிறீர்கள்? (பல தேர்வு)",
        "options": {
            "en": [
                "1. Village level",
                "2. District level",
                "3. National level",
                "4. International (Export)",
                "5. Online (Social Media/Web)"
            ],
            "si": [
                "1. ග්‍රාමීය මට්ටමින්",
                "2. දිස්ත්‍රික් මට්ටමින්",
                "3. ජාතික මට්ටමින්",
                "4. ජාත්‍යන්තරව (අපනයන)",
                "5. අන්තර්ජාලය හරහා (ෆේස්බුක් ආදිය)"
            ],
            "ta": [
                "1. கிராம அளவில்",
                "2. மாவட்ட அளவில்",
                "3. தேசிய அளவில்",
                "4. சர்வதேச (ஏற்றுமதி)",
                "5. ஆன்லைன் (சமூக ஊடகம்/இணையம்)"
            ]
        }
    },
    {
        "step": 6,
        "key": "q_sales_method",
        "type": "select",
        "en": "Main sales method",
        "si": "ප්‍රධාන අලෙවි ක්‍රමය",
        "ta": "முக்கிய விற்பனை முறை",
        "options": {
            "en": [
                "1. Direct to customers (Retail)",
                "2. Wholesale to shops",
                "3. Order based",
                "4. Through distributors"
            ],
            "si": [
                "1. සෘජුවම පාරිභෝගිකයින්ට (සිල්ලර)",
                "2. වෙළඳසැල් සඳහා තොග වශයෙන්",
                "3. ඇණවුම් මත පමණි",
                "4. බෙදාහරින්නන් හරහා"
            ],
            "ta": [
                "1. வாடிக்கையாளர்களுக்கு நேரடியாக (சில்லறை)",
                "2. கடைகளுக்கு மொத்த விற்பனை",
                "3. ஆர்டர் அடிப்படையில்",
                "4. விநியோகஸ்தர்கள் மூலம்"
            ]
        }
    },
    {
        "step": 6,
        "key": "q_export_details",
        "type": "text",
        "depends_on": "q_market_reach:4",
        "en": "If exporting, list countries/products",
        "si": "අපනයනය කරන්නේ නම්, රටවල් හා නිෂ්පාදන ලැයිස්තුගත කරන්න",
        "ta": "ஏற்றுமதி செய்தால், நாடுகள்/தயாரிப்புகளை பட்டியலிடவும்"
    },
    {
        "step": 7,
        "key": "q_use_digital_payment",
        "type": "select",
        "en": "Do you accept digital payments (Cards, QR, Bank Transfer)?",
        "si": "ඔබ ඩිජිටල් ගෙවීම් (කාඩ්පත්, QR, බැංකු හුවමාරු) භාර ගන්නේද?",
        "ta": "டிஜிட்டல் கொடுப்பனவுகளை (கார்டுகள், கியூஆர், வங்கி பரிமாற்றம்) ஏற்றுக்கொள்கிறீர்களா?",
        "options": {
            "en": [
                "1. Yes, all types",
                "2. Bank transfers only",
                "3. QR Code only",
                "4. No, cash only"
            ],
            "si": [
                "1. ඔව්, සියලුම වර්ග",
                "2. බැංකු හුවමාරු පමණි",
                "3. ලංකා QR පමණි",
                "4. නැත, මුදල් පමණි"
            ],
            "ta": [
                "1. ஆம், அனைத்து வகைகளும்",
                "2. வங்கி பரிமாற்றங்கள் மட்டும்",
                "3. கியூஆர் குறியீடு மட்டும்",
                "4. இல்லை, பணம் மட்டும்"
            ]
        }
    },
    {
        "step": 7,
        "key": "q_accounting_method",
        "type": "select",
        "en": "How do you maintain accounts?",
        "si": "ඔබ ගිණුම් පවත්වාගෙන යන්නේ කෙසේද?",
        "ta": "கணக்குகளை எவ்வாறு பராமரிக்கிறீர்கள்?",
        "options": {
            "en": [
                "1. Computer software (POS/ERP)",
                "2. Excel/Spreadsheets",
                "3. Manual books",
                "4. Not maintaining proper accounts"
            ],
            "si": [
                "1. පරිගණක මෘදුකාංග හරහා (POS ආදිය)",
                "2. එක්සෙල් (Excel) හරහා",
                "3. පොත්පත් වල ලිවීමෙන්",
                "4. නිසි ගිණුම් පවත්වා නොගනී"
            ],
            "ta": [
                "1. கணினி மென்பொருள் (POS/ERP)",
                "2. எக்செல்/விரிதாள்கள்",
                "3. கையேடு புத்தகங்கள்",
                "4. முறையான கணக்குகளை பராமரிக்கவில்லை"
            ]
        }
    },
    {
        "step": 7,
        "key": "q_marketing_method",
        "type": "multiselect",
        "en": "Main marketing methods (Multiple Choice)",
        "si": "ප්‍රධාන ප්‍රවර්ධන ක්‍රම (බහුවරණ)",
        "ta": "முக்கிய சந்தைப்படுத்தல் முறைகள் (பல தேர்வு)",
        "options": {
            "en": [
                "1. Word of mouth",
                "2. Social Media (Facebook/Tiktok)",
                "3. Posters/Banners",
                "4. Newspaper/TV/Radio ads",
                "5. E-commerce platforms",
                "6. No marketing done"
            ],
            "si": [
                "1. කටින් කට ප්‍රචාරය",
                "2. සමාජ මාධ්‍ය (ෆේස්බුක්/ටික්ටොක්)",
                "3. පෝස්ටර්/බැනර් මගින්",
                "4. පුවත්පත්/රූපවාහිනී දැන්වීම්",
                "5. ඊ-වාණිජ්‍ය වෙබ් අඩවි හරහා",
                "6. ප්‍රවර්ධනයක් සිදු නොකරයි"
            ],
            "ta": [
                "1. வாய்வழி",
                "2. சமூக ஊடகம் (பேஸ்புக்/டிக்டாக்)",
                "3. சுவரொட்டிகள்/பதாகைகள்",
                "4. செய்தித்தாள்/டிவி/ரேடியோ விளம்பரங்கள்",
                "5. மின் வணிக தளங்கள்",
                "6. சந்தைப்படுத்தல் எதுவும் செய்யப்படவில்லை"
            ]
        }
    },
    {
        "step": 7,
        "key": "q_use_smartphones",
        "type": "select",
        "en": "Do you use smartphones/computers for business purposes?",
        "si": "ව්‍යාපාරික කටයුතු සඳහා ස්මාර්ට් ජංගම දුරකථන/පරිගණක භාවිතා කරන්නේද?",
        "ta": "வணிக நோக்கங்களுக்காக ஸ்மார்ட்போன்கள்/கணினிகளைப் பயன்படுத்துகிறீர்களா?",
        "options": {
            "en": [
                "1. Yes, extensively",
                "2. Yes, partially",
                "3. No"
            ],
            "si": [
                "1. ඔව්, බහුලව භාවිතා කරයි",
                "2. ඔව්, යම් පමණකට භාවිතා කරයි",
                "3. නැත"
            ],
            "ta": [
                "1. ஆம், பரவலாக",
                "2. ஆம், ஓரளவு",
                "3. இல்லை"
            ]
        }
    },
    {
        "step": 8,
        "key": "q_main_challenges",
        "type": "multiselect",
        "en": "Main challenges faced by the business (Multiple Choice)",
        "si": "ව්‍යාපාරය මුහුණ දෙන ප්‍රධාන අභියෝග (බහුවරණ)",
        "ta": "வணிகம் எதிர்கொள்ளும் முக்கிய சவால்கள் (பல தேர்வு)",
        "options": {
            "en": [
                "1. Financial constraints/Lack of capital",
                "2. Lack of raw materials",
                "3. Lack of skilled labor",
                "4. High taxes/utilities",
                "5. Market competition",
                "6. Lack of modern technology",
                "7. Transport issues",
                "8. Legal/Registration issues",
                "9. Other"
            ],
            "si": [
                "1. මූල්‍ය දුෂ්කරතා/ප්‍රාග්ධන හිඟය",
                "2. අමුද්‍රව්‍ය හිඟය",
                "3. පුහුණු ශ්‍රමිකයින්ගේ හිඟය",
                "4. අධික බදු සහ විදුලි/ජල බිල්පත්",
                "5. වෙළඳපොළ තරඟකාරීත්වය",
                "6. නවීන තාක්ෂණය නොමැතිකම",
                "7. ප්‍රවාහන ගැටළු",
                "8. නෛතික/ලියාපදිංචි වීමේ ගැටළු",
                "9. වෙනත්"
            ],
            "ta": [
                "1. நிதி நெருக்கடிகள்/மூலதன பற்றாக்குறை",
                "2. மூலப்பொருட்களின் பற்றாக்குறை",
                "3. திறன்வாய்ந்த தொழிலாளர்களின் பற்றாக்குறை",
                "4. அதிக வரி/பயன்பாடுகள்",
                "5. சந்தை போட்டி",
                "6. நவீன தொழில்நுட்பம் இன்மை",
                "7. போக்குவரத்து சிக்கல்கள்",
                "8. சட்ட/பதிவு சிக்கல்கள்",
                "9. மற்றவை"
            ]
        }
    },
    {
        "step": 8,
        "key": "q_required_support",
        "type": "multiselect",
        "en": "What kind of support do you expect from the government/institutions? (Multiple Choice)",
        "si": "රජයෙන් හෝ ආයතන වලින් ඔබ අපේක්ෂා කරන සහාය කුමක්ද? (බහුවරණ)",
        "ta": "அரசு/நிறுவனங்களிடம் இருந்து எத்தகைய ஆதரவை எதிர்பார்க்கிறீர்கள்? (பல தேர்வு)",
        "options": {
            "en": [
                "1. Low interest loans",
                "2. Equipment/Machinery grants",
                "3. Training & Technical advice",
                "4. Marketing assistance",
                "5. Land/Building facilities",
                "6. Simplification of registration process",
                "7. Other"
            ],
            "si": [
                "1. අඩු පොලී ණය පහසුකම්",
                "2. උපකරණ/යන්ත්‍රෝපකරණ ප්‍රදාන",
                "3. පුහුණුව සහ තාක්ෂණික උපදෙස්",
                "4. අලෙවිකරණ සහාය",
                "5. ඉඩම්/ගොඩනැගිලි පහසුකම්",
                "6. ලියාපදිංචි කිරීමේ ක්‍රියාවලිය සරල කිරීම",
                "7. වෙනත්"
            ],
            "ta": [
                "1. குறைந்த வட்டி கடன்கள்",
                "2. உபகரணங்கள்/இயந்திர மானியங்கள்",
                "3. பயிற்சி மற்றும் தொழில்நுட்ப ஆலோசனை",
                "4. சந்தைப்படுத்தல் உதவி",
                "5. நிலம்/கட்டிட வசதிகள்",
                "6. பதிவு செயல்முறையை எளிமையாக்குதல்",
                "7. மற்றவை"
            ]
        }
    },
    {
        "step": 8,
        "key": "q_future_plans",
        "type": "select",
        "en": "What is the future plan for your business?",
        "si": "ඔබේ ව්‍යාපාරයේ අනාගත සැලැස්ම කුමක්ද?",
        "ta": "உங்கள் வணிகத்திற்கான எதிர்காலத் திட்டம் என்ன?",
        "options": {
            "en": [
                "1. Expand operations",
                "2. Maintain current level",
                "3. Start a new branch",
                "4. Introduce new products",
                "5. Plan to close down"
            ],
            "si": [
                "1. මෙහෙයුම් පුළුල් කිරීම",
                "2. වත්මන් මට්ටම පවත්වාගෙන යාම",
                "3. නව ශාඛාවක් ආරම්භ කිරීම",
                "4. නව නිෂ්පාදන හඳුන්වා දීම",
                "5. වසා දැමීමට සැලසුම් කර ඇත"
            ],
            "ta": [
                "1. செயல்பாடுகளை விரிவுபடுத்துதல்",
                "2. தற்போதைய நிலையை பராமரித்தல்",
                "3. புதிய கிளையை தொடங்குதல்",
                "4. புதிய தயாரிப்புகளை அறிமுகப்படுத்துதல்",
                "5. மூட திட்டமிட்டுள்ளது"
            ]
        }
    }
]
JSON;

        $questions = json_decode($json, true);

        foreach ($questions as $index => $q) {
            BusinessSurveyQuestion::create([
                'step_index' => $q['step'],
                'field_key' => $q['key'],
                'type' => $q['type'],
                'question_en' => $q['en'],
                'question_si' => $q['si'],
                'question_ta' => $q['ta'],
                'options_json' => isset($q['options']) ? $q['options'] : null,
                'depends_on' => isset($q['depends_on']) ? $q['depends_on'] : null,
                'is_active' => true,
                'sort_order' => $index,
            ]);
        }
    }
}
