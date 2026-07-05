<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            // (A) ජනවිකාස (Demographic)
            ['section' => 'A', 'question_text' => 'වසමේ ස්ථිර ජනගහනය (De jure population) එකතුව කීයද?', 'input_type' => 'number'],
            ['section' => 'A', 'question_text' => 'පිරිමි ජනගහනය කීයද?', 'input_type' => 'number'],
            ['section' => 'A', 'question_text' => 'ගැහැණු ජනගහනය කීයද?', 'input_type' => 'number'],
            ['section' => 'A', 'question_text' => 'වසමේ ලියාපදිංචි ඡන්දදායකයින් (Electors) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'A', 'question_text' => 'වයස අවුරුදු 0-4 අතර ළමුන් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'A', 'question_text' => 'වයස අවුරුදු 5-17 (පාසල් යන වයස් කාණ්ඩය) දක්වා දරුවන් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'A', 'question_text' => 'වයස අවුරුදු 60ට වැඩි ජ්‍යෙෂ්ඨ පුරවැසියන් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'A', 'question_text' => 'සමස්ත ජනගහනයෙන් සිංහල ජනවාර්ගිකයින්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'A', 'question_text' => 'සමස්ත ජනගහනයෙන් ශ්‍රී ලාංකික දෙමළ ජනවාර්ගිකයින්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'A', 'question_text' => 'සමස්ත ජනගහනයෙන් ඉන්දියානු දෙමළ (වතුකර) ජනවාර්ගිකයින්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'A', 'question_text' => 'සමස්ත ජනගහනයෙන් මුස්ලිම් (යෝනක) ජනවාර්ගිකයින්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'A', 'question_text' => 'බෞද්ධ ආගමිකයින්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'A', 'question_text' => 'හින්දු ආගමිකයින්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'A', 'question_text' => 'ක්‍රිස්තියානි (කතෝලික හා ප්‍රතිසංස්කරණවාදී) ආගමිකයින්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'A', 'question_text' => 'වසමේ ස්ථිර නිවාස ඒකක (Permanent Housing Units) ගණන කීයද?', 'input_type' => 'number'],

            // (B) භූගෝලීය හා පාරිසරික (Geographic & Environmental)
            ['section' => 'B', 'question_text' => 'වසමේ මුළු භූමි ප්‍රමාණය (හෙක්ටයාර් / අක්කර) කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'මුහුදු මට්ටමේ සිට සාමාන්‍ය උන්නතාංශය මීටර් කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'ආසන්නතම මුහුදු වෙරළ තීරයට ඇති දුර කිලෝමීටර් කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'වසම හරහා ප්‍රධාන ගංගාවක් හෝ ඇල මාර්ගයක් ගලා යනවාද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'B', 'question_text' => 'වසම තුළ පිහිටි මිනිසා විසින් තනන ලද ජලාශ/වැව් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'වසමේ වාර්ෂික සාමාන්‍ය වර්ෂාපතනය (මිලිමීටර්) කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'වසමේ වාර්ෂික සාමාන්‍ය උෂ්ණත්වය (°C) කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'වසමේ රක්ෂිත වනාන්තර / ගැල් වන භූමි ප්‍රමාණය (හෙක්ටයාර්) කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'වගා කළ හැකි (Cultivable) ඉඩම් ප්‍රමාණය හෙක්ටයාර් කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'ජනාවාස හා ගොඩනැගිලි සඳහා යොදාගත් භූමි ප්‍රමාණය (හෙක්ටයාර්) කීයද?', 'input_type' => 'number'],
            ['section' => 'B', 'question_text' => 'සමස්ත භූමියෙන් පැතලි (තැනිතලා) භූමි ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'B', 'question_text' => 'සමස්ත භූමියෙන් කඳුකර/බෑවුම් සහිත භූමි ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'B', 'question_text' => 'වසම නායයෑම් හෝ ගංවතුර අවදානම් කලාපයක පිහිටා තිබේද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'B', 'question_text' => 'පානීය ජලය සඳහා ප්‍රධාන මූලාශ්‍රය ලෙස නළ ළිං (Tube wells) භාවිතා කරන නිවාස ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'B', 'question_text' => 'වාර්ෂික සාමාන්‍ය වායු ආර්ද්‍රතාවය (Relative Humidity - %) කීයද?', 'input_type' => 'percentage'],

            // (C) ආර්ථික හා රැකියා (Economic & Employment)
            ['section' => 'C', 'question_text' => 'වසමේ මූලික ආර්ථික අංශ (ගොවිතැන්, ධීවර, සේවා, කර්මාන්ත ලෙස) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'කෘෂිකර්මාන්තය (ගොවිතැන්/ගෙවතු වගා) ප්‍රධාන රැකියාව කරගෙන සිටින පවුල් සංඛ්‍යාව කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'රාජ්‍ය හා පෞද්ගලික අංශයේ විධිමත් (Formal) රැකියාවල නියුතු පුද්ගලයින් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'වසමේ සාමාන්‍ය දෛනික ශ්‍රමික වැටුප (Daily Wage) රුපියල් කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'විදේශ රැකියා (Foreign Employment) සඳහා ගොස් සිටින පුද්ගලයින් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'වාර්ෂිකව විදේශයන්ගෙන් මෙම වසමට ලැබෙන ප්‍රේෂණ (Remittances) රුපියල් කෝටි කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'වසම තුළ ක්‍රියාත්මක බැංකු ශාඛා / සුක්ෂම මූල්‍ය ආයතන (Microfinance) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'ගෘහස්ථ කාන්තාවන් අතිරේක ආදායම් උපයන ක්‍රියාකාරකම්වල (ඇඳුම් මැසීම, ශිල්ප) නියුතු ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'C', 'question_text' => 'වසමේ ලියාපදිංචි කුඩා හා මධ්‍ය පරිමාණ ව්‍යාපාර (SMEs) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'සමුපකාර (Co-operative) සංගම් සාමාජිකත්වය ලබා ඇති පවුල් ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'C', 'question_text' => 'ශ්‍රී ලංකා දරිද්‍රතා රේඛාවට පහළ ජීවත් වන පවුල්වල ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'C', 'question_text' => 'සමෘද්ධි (Samurdhi) ප්‍රතිලාභ ලබන පවුල් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'වසමේ ස්ථිර වෙළඳපොළක් (Permanent Market) හෝ සතිපොළක් තිබේද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'C', 'question_text' => 'ආසන්නතම ප්‍රධාන නගරයට හෝ නගර සභාවට ඇති දුර කිලෝමීටර් කීයද?', 'input_type' => 'number'],
            ['section' => 'C', 'question_text' => 'ප්‍රධාන නගරයට යාමට ගෙවිය යුතු සාමාන්‍ය ප්‍රවාහන ගාස්තුව (බස් ගාස්තුව) රුපියල් කීයද?', 'input_type' => 'number'],

            // (D) කෘෂිකර්ම හා පශු සම්පත් (Agricultural & Livestock)
            ['section' => 'D', 'question_text' => 'වසමේ වගා කරන ප්‍රධාන භෝග (Crops) වර්ග ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'වී (Rice) වගා කරන භූමි ප්‍රමාණය (හෙක්ටයාර්) කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'වියළි කලාපීය අතරමැදි භෝග (මෙනේරි, කුරක්කන්) වගා ප්‍රමාණය හෙක්ටයාර් කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'එළවළු හා පළතුරු වගා කරන ඉඩම් ප්‍රමාණය (හෙක්ටයාර්) කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'වාරිමාර්ග (Irrigation) පහසුකම් යටතේ පවතින ගොවිබිම් ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'D', 'question_text' => 'වසමේ ගව ගණන (එළදෙනුන් හා ගොනුන් ඇතුළුව) කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'කිරි දෙන (Milking) එළදෙනුන් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'වසමේ කුකුළු ගණන (බ්‍රොයිලර් සහ තැබූ බිත්තර කුකුළු) කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'එළුවන් හා බැටළුවන් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'මිරිදිය හා මුහුදු ධීවර කර්මාන්තයේ සම්පූර්ණයෙන්ම නියුතු පවුල් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'වාර්ෂික ධීවර අස්වැන්න (මෙට්‍රික් ටොන්) කීයද?', 'input_type' => 'number'],
            ['section' => 'D', 'question_text' => 'කාබනික පොහොර (Organic fertilizer) පමණක් භාවිතා කරන ගොවීන්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'D', 'question_text' => 'රසායනික පොහොර (Chemical fertilizer) භාවිතා කරන ගොවීන්ගේ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'D', 'question_text' => 'කෘෂිකාර්මික කටයුතු සඳහා යාන්ත්‍රිකරණය (ට්‍රැක්ටර්, පවර් ටිලර්) භාවිතා කරන ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'D', 'question_text' => 'වැවිලි බෝග (තේ/රබර්/පොල්/කුරුඳු) සඳහා වෙන්කළ භූමි ප්‍රමාණය (හෙක්ටයාර්) කීයද?', 'input_type' => 'number'],

            // (E) කර්මාන්ත හා යටිතල පහසුකම් (Industrial & Infrastructure)
            ['section' => 'E', 'question_text' => 'වසම තුළ ලියාපදිංචි කර්මාන්තශාලා / කම්හල් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'E', 'question_text' => 'කුඩා කර්මාන්ත (ගල් ඇඹරුම්, තෙල් මිරිකීම, වියළි කර්මාන්ත) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'E', 'question_text' => 'ග්‍රාමීය ශිල්පීය කර්මාන්ත (වඩු, කම්මල්, පිඟන්) සඳහා ලියාපදිංචි ස්ථාන ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'E', 'question_text' => 'වසම තුළ තැපැල් කාර්යාලයක් (Post Office) හෝ උප තැපැල් කාර්යාලයක් තිබේද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'E', 'question_text' => 'වසම තුළ ස්ථිර බැංකු ශාඛාවක් තිබේද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'E', 'question_text' => 'වසම තුළ ක්‍රියාත්මක ස්වයංක්‍රීය ටෙලර් යන්ත්‍ර (ATM) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'E', 'question_text' => 'ප්‍රාථමික (1-5 ශ්‍රේණි) පාසල් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'E', 'question_text' => 'ද්විතියික හා උසස් පාසල් (6-13 ශ්‍රේණි) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'E', 'question_text' => 'ජාතික විදුලිබල පද්ධතියට සම්බන්ධ (Grid-connected) නිවාස ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'E', 'question_text' => 'පුනර්ජනනීය බලශක්ති (සූර්ය/සුළං) භාවිතා කරන නිවාස ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'E', 'question_text' => 'පුළුල් පටල අන්තර්ජාලය (Broadband) සහිත නිවාස ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'E', 'question_text' => 'තාර දැමූ (Paved) මාර්ගවල මුළු දිග කිලෝමීටර් කීයද?', 'input_type' => 'number'],
            ['section' => 'E', 'question_text' => 'තාර නොදැමූ (Unpaved) මාර්ග/කඩිමඩිය මාර්ගවල දිග කිලෝමීටර් කීයද?', 'input_type' => 'number'],
            ['section' => 'E', 'question_text' => 'වසම හරහා දුම්රිය මාර්ගයක් (Railway line) ගමන් කරනවාද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'E', 'question_text' => 'ජංගම දුරකථන කුළුණු (Mobile Signal Towers) ගණන කීයද?', 'input_type' => 'number'],

            // (F) සංස්කෘතික, සමාජ, ආගමික හා ඓතිහාසික (Cultural, Social, Religious & Historical)
            ['section' => 'F', 'question_text' => 'බෞද්ධ විහාරස්ථාන (Temples) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'හින්දු කෝවිල් (Kovils) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'ක්‍රිස්තියානි පල්ලි (Churches) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'මුස්ලිම් මස්ජිද් (Mosques) / ජුම්මා පල්ලි ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'වාර්ෂිකව පවත්වනු ලබන ප්‍රධාන ගම්මාන උත්සව (පෙරහැර, කතෝලික උත්සව, මුස්ලිම් ඊද් උත්සව) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'පුරාවිද්‍යා දෙපාර්තමේන්තුව විසින් ආරක්ෂිත ස්මාරක (Archaeological protected monuments) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'වසමේ පුරාණ ග්‍රාමයක් හෝ ඓතිහාසික යුගයකට අයත් නටබුන් තිබේද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'F', 'question_text' => 'වසමේ ලියාපදිංචි සමාජ සංවිධාන (සංවර්ධන සමිති, යෞවන සමාජ, කාන්තා සමාජ) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'පොදු පුස්තකාල (Public Library) ගණන හා එහි ඇති ග්‍රන්ථ සංඛ්‍යාව කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'ක්‍රීඩා පිටි (Playgrounds) හා ව්‍යායාම ශාලා ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'වසම තුළින් බිහිවූ ජාතික මට්ටමේ ප්‍රසිද්ධ පුද්ගලයින් (දේශපාලන, කලා, ක්‍රීඩා) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'වසමේ ක්‍රියාත්මක ග්‍රාමීය සංවර්ධන ඒකක (Grama Shakthi / RDD) ප්‍රධානීන් ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'වාර්ෂික සාමාන්‍ය විවාහ සංඛ්‍යාව (Marriages) කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'වාර්ෂික සාමාන්‍ය සජීවී උපත් (Live births) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'F', 'question_text' => 'වසමේ වාර්ෂික සාමාන්‍ය මරණ (Deaths) ගණන කීයද?', 'input_type' => 'number'],

            // (G) සෞඛ්‍ය, සනීපාරක්ෂාව හා උපයෝගිතා (Health, Sanitation & Utilities)
            ['section' => 'G', 'question_text' => 'වසම තුළ මහජන සෞඛ්‍ය පරීක්ෂක (PHI) කාර්යාලයක් හෝ සෞඛ්‍ය සේවා ස්ථානයක් තිබේද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'G', 'question_text' => 'ප්‍රාථමික සෞඛ්‍ය ඒකක (MOH / පවුල් සෞඛ්‍ය සායන) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'G', 'question_text' => 'වසමේ සියලුම ළමුන් සඳහා එන්නත් කිරීමේ (Vaccination) ආවරණ ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'G', 'question_text' => 'නිසි ලෙස ඉදිකරන ලද පෞද්ගලික වැසිකිළි (සනීපාරක්ෂක වැසිකිළි) සහිත නිවාස ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'G', 'question_text' => 'ප්‍රජා කසළ බහාලුම් (Community Dustbins) හෝ අපද්‍රව්‍ය එකතු කිරීමේ ස්ථාන ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'G', 'question_text' => 'නල ජල සැපයුම (Pipe-borne water) ලබන නිවාස ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'G', 'question_text' => 'වාර්ෂිකව ඩෙංගු / මැලේරියා / ලෙප්ටො වැනි වසංගත රෝග සඳහා වාර්තා වන රෝගීන් (Confirmed cases) ගණන කීයද?', 'input_type' => 'number'],
            ['section' => 'G', 'question_text' => 'වසම තුළ ඖෂධ ශාලාවක් (Pharmacy) හෝ ඖෂධ බෙදාහැරීමේ මධ්‍යස්ථානයක් තිබේද? (ඔව්/නැත)', 'input_type' => 'boolean'],
            ['section' => 'G', 'question_text' => 'ආයුර්වේද / ජන වෛද්‍ය ප්‍රතිකාර සඳහා ප්‍රවේශය ඇති පවුල් ප්‍රතිශතය (%) කීයද?', 'input_type' => 'percentage'],
            ['section' => 'G', 'question_text' => 'පසුගිය වසර 05 තුළ සාමාන්‍යයෙන් වාර්ෂිකව ස්වභාවික ආපදා (ගංවතුර, නියඟය, කඩාවැටීම්) හේතුවෙන් හානියට පත් වාර්ෂික ගොවිබිම් හා දේපළ ප්‍රමාණය (හෙක්ටයාර් හෝ ගණන) කීයද?', 'input_type' => 'number'],
        ];

        $sortOrder = 1;
        foreach ($questions as $q) {
            Question::updateOrCreate(
                ['question_text' => $q['question_text']],
                [
                    'section' => $q['section'],
                    'input_type' => $q['input_type'],
                    'sort_order' => $sortOrder++,
                    'is_active' => true,
                ]
            );
        }
    }
}
