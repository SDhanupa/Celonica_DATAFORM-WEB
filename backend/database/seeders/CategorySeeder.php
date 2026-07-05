<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $mainCategories = [
            ['id' => 'boundaries', 'si' => 'සීමාවන්', 'en' => 'Boundaries', 'image' => '/images/categories/සීමාවන්.png'],
            ['id' => 'space', 'si' => 'භූ අවකාශ', 'en' => 'Space', 'image' => '/images/categories/භූ අවකාශ.png'],
            ['id' => 'land', 'si' => 'ඉඩම්', 'en' => 'Land', 'image' => '/images/categories/ඉඩම්.png'],
            ['id' => 'building', 'si' => 'ගොඩනැගිලි', 'en' => 'Building', 'image' => '/images/categories/ගොඩනැගිලි.png'],
            ['id' => 'road', 'si' => 'පාරවල්', 'en' => 'Road', 'image' => '/images/categories/පාරවල්.png'],
            ['id' => 'geotype', 'si' => 'භූ ගෝලීය පිහිටීම', 'en' => 'Geo-type', 'image' => '/images/categories/භූ ගෝලීය පිහිටීම.png'],
            ['id' => 'nature', 'si' => 'ස්වභාවික පිහිටීම', 'en' => 'Nature', 'image' => '/images/categories/ස්වභාවික පිහිටීම.png'],
            ['id' => 'water', 'si' => 'ජල පිහිටීම', 'en' => 'Water', 'image' => '/images/categories/ජල පිහිටීම.png'],
            ['id' => 'lines', 'si' => 'රැහැන් සහ රේඛා', 'en' => 'Lines', 'image' => '/images/categories/රැහැන් සහ රේඛා.png'],
            ['id' => 'plants', 'si' => 'ශාඛ', 'en' => 'Plants', 'image' => '/images/categories/ශාඛ.png'],
        ];

        $boundaries = [
            ['id' => 'admin-basics', 'si' => 'මූලික පරිපාලනමය බෙදීම්', 'en' => 'Administrative Basics'],
            ['id' => 'police', 'si' => 'පොලිස් බෙදීම්', 'en' => 'Police'],
            ['id' => 'local-gov', 'si' => 'පළාත් පාලන ආයතනමය බෙදීම්', 'en' => 'Local Government'],
            ['id' => 'postal', 'si' => 'තැපල් සීමාවන්', 'en' => 'Postal'],
            ['id' => 'health', 'si' => 'සෞඛ්ය සීමාවන්', 'en' => 'Health'],
            ['id' => 'forest', 'si' => 'වනාන්තර පරිපාලනමය සීමාවන්', 'en' => 'Forest Administration'],
            ['id' => 'nature-boundaries', 'si' => 'ස්වභාවික කලාප සීමාවන්', 'en' => 'Nature'],
            ['id' => 'education', 'si' => 'අධ්යාපන', 'en' => 'Education'],
            ['id' => 'disaster', 'si' => 'ආපදා කලාප', 'en' => 'Disaster Zones'],
            ['id' => 'telecom', 'si' => 'විදුලි සංදේශ', 'en' => 'Telecommunication'],
            ['id' => 'archaeology', 'si' => 'පුරා විද්යා සීමාවන්', 'en' => 'Archaeology'],
            ['id' => 'history', 'si' => 'පැරණි සීමාවන්', 'en' => 'History'],
        ];

        $space = [
            ['id' => 'public-spaces', 'si' => 'පොදු අවකාශය', 'en' => 'Public Spaces'],
            ['id' => 'business-spaces', 'si' => 'ව්යාපාරික අවකාශ (ප්රධාන සේවා සම්පාදනයට අයත් නොවන)', 'en' => 'Business Spaces'],
            ['id' => 'cultural', 'si' => 'සංස්කෘතික', 'en' => 'Cultural'],
            ['id' => 'tourism', 'si' => 'සංචාරක අවකාශ', 'en' => 'Tourism Spaces'],
            ['id' => 'community-services', 'si' => 'ප්රජා සේවා සම්පාදනය', 'en' => 'Community Services'],
            ['id' => 'other-space', 'si' => 'වෙනත්', 'en' => 'Other'],
            ['id' => 'living-place', 'si' => 'ජීවත් වෙන ස්ථානය', 'en' => 'Living Place'],
        ];

        $land = [
            ['id' => 'non-gov', 'si' => 'රජයට අයත් නොවන සියළු', 'en' => 'All Non-Government'],
            ['id' => 'gov', 'si' => 'රජයේ', 'en' => 'Government'],
            ['id' => 'vihara-act', 'si' => 'විහාර හා දේවාලගම් පනත', 'en' => 'Vihara and Devalagam Act'],
        ];

        $nonGov = [
            ['id' => 'individuals', 'si' => 'පුද්ගලයින් සතු', 'en' => 'Owned by Individuals'],
            ['id' => 'companies', 'si' => 'සමාගම් සතු', 'en' => 'Owned by Companies'],
            ['id' => 'organizations', 'si' => 'සංවිධාන සතු', 'en' => 'Owned by Organizations'],
            ['id' => 'embassies', 'si' => 'තානාපති කාර්යාල සතු', 'en' => 'Owned by Embassies'],
        ];

        $gov = [
            ['id' => 'divisional-sec', 'si' => 'ප්රාදේශීය ලේකම් සතු', 'en' => 'Divisional Secretariat'],
            ['id' => 'railways', 'si' => 'දුම්රිය දෙපාර්තමේන්තුව', 'en' => 'Department of Railways'],
            ['id' => 'forest-dept', 'si' => 'වන සංරක්ෂණ දෙපාර්තමේන්තුව', 'en' => 'Forest Conservation Department'],
            ['id' => 'wildlife', 'si' => 'වන ජීවි සංරක්ෂණ දෙපාර්තමේන්තුව', 'en' => 'Wildlife Conservation Department'],
            ['id' => 'archaeology-dept', 'si' => 'පුරා විද්යා දෙපාර්තමේන්තුව', 'en' => 'Archaeology Department'],
            ['id' => 'agrarian', 'si' => 'ගොවිජන සේවා දෙපාර්තමේන්තුව', 'en' => 'Agrarian Services Department'],
            ['id' => 'irrigation', 'si' => 'වාරිමාර්ග දෙපාර්තමේන්තුව', 'en' => 'Irrigation Department'],
            ['id' => 'coast', 'si' => 'වෙරළ සංරක්ෂණ දෙපාර්තමේන්තුව', 'en' => 'Coast Conservation Department'],
            ['id' => 'other-gov', 'si' => 'වෙනත් දෙපාර්තමේන්තු', 'en' => 'Other Departments'],
            ['id' => 'boi', 'si' => 'BOI', 'en' => 'BOI'],
            ['id' => 'local-gov-auth', 'si' => 'පළාත් පාලන ආයතන', 'en' => 'Local Government Authorities'],
            ['id' => 'corp', 'si' => 'රජයේ සංස්ථා සතු', 'en' => 'Government Corporations'],
        ];

        foreach ($mainCategories as $index => $cat) {
            $parent = Category::firstOrCreate(
                ['slug' => $cat['id']],
                [
                    'name_en' => $cat['en'],
                    'name_si' => $cat['si'],
                    'image_path' => $cat['image'],
                    'sort_order' => $index,
                ]
            );

            if ($cat['id'] === 'boundaries') {
                foreach ($boundaries as $idx => $sub) {
                    Category::firstOrCreate(
                        ['slug' => $sub['id']],
                        [
                            'parent_id' => $parent->id,
                            'name_en' => $sub['en'],
                            'name_si' => $sub['si'],
                            'sort_order' => $idx,
                        ]
                    );
                }
            } elseif ($cat['id'] === 'space') {
                foreach ($space as $idx => $sub) {
                    Category::firstOrCreate(
                        ['slug' => $sub['id']],
                        [
                            'parent_id' => $parent->id,
                            'name_en' => $sub['en'],
                            'name_si' => $sub['si'],
                            'sort_order' => $idx,
                        ]
                    );
                }
            } elseif ($cat['id'] === 'land') {
                foreach ($land as $idx => $sub) {
                    $landNode = Category::firstOrCreate(
                        ['slug' => $sub['id']],
                        [
                            'parent_id' => $parent->id,
                            'name_en' => $sub['en'],
                            'name_si' => $sub['si'],
                            'sort_order' => $idx,
                        ]
                    );

                    if ($sub['id'] === 'non-gov') {
                        foreach ($nonGov as $sidx => $subsub) {
                            Category::firstOrCreate(
                                ['slug' => $subsub['id']],
                                [
                                    'parent_id' => $landNode->id,
                                    'name_en' => $subsub['en'],
                                    'name_si' => $subsub['si'],
                                    'sort_order' => $sidx,
                                ]
                            );
                        }
                    } elseif ($sub['id'] === 'gov') {
                        foreach ($gov as $sidx => $subsub) {
                            Category::firstOrCreate(
                                ['slug' => $subsub['id']],
                                [
                                    'parent_id' => $landNode->id,
                                    'name_en' => $subsub['en'],
                                    'name_si' => $subsub['si'],
                                    'sort_order' => $sidx,
                                ]
                            );
                        }
                    }
                }
            }
        }
    }
}
