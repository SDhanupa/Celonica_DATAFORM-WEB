<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class LocationCategoriesSeeder extends Seeder
{
    public function run()
    {
        $cat_0_0 = Category::updateOrCreate(
            ['slug' => 'boundaries'],
            [
                'name_en' => 'Boundaries',
                'name_si' => 'සීමාවන්',
                'parent_id' => null,
                'sort_order' => 0,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'administrative-basics'],
            [
                'name_en' => 'Administrative Basics',
                'name_si' => 'මූලික පරිපාලනමය බෙදීම්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'province'],
            [
                'name_en' => 'Province',
                'name_si' => 'පළාත',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'district'],
            [
                'name_en' => 'District',
                'name_si' => 'දිස්ත්‍රික්කය',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'divisional-secretariat'],
            [
                'name_en' => 'Divisional Secretariat',
                'name_si' => 'ප්‍රාදේශීය ලේකම් කොට්ඨාශය',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'grama-niladhari-division'],
            [
                'name_en' => 'Grama Niladhari Division',
                'name_si' => 'ග්‍රාම නිලධාරි වසම',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'village'],
            [
                'name_en' => 'Village',
                'name_si' => 'ගම',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'settlement'],
            [
                'name_en' => 'Settlement',
                'name_si' => 'ජනාවාසය',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 5,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'police'],
            [
                'name_en' => 'Police',
                'name_si' => 'පොලිස් බෙදීම්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'range'],
            [
                'name_en' => 'Range',
                'name_si' => 'දිසා',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'division'],
            [
                'name_en' => 'Division',
                'name_si' => 'දිසාව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'district-1'],
            [
                'name_en' => 'District',
                'name_si' => 'කොට්ඨාශය',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'police-district'],
            [
                'name_en' => 'Police District',
                'name_si' => 'දිස්ත්‍රික්කය',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'police-station'],
            [
                'name_en' => 'Police Station',
                'name_si' => 'වසම (පොලිස් ස්ථානය)',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_1_2 = Category::updateOrCreate(
            ['slug' => 'local-government'],
            [
                'name_en' => 'Local Government',
                'name_si' => 'පළාත් පාලන ආයතනමය බෙදීම්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'pradeshiya-sabha'],
            [
                'name_en' => 'Pradeshiya Sabha',
                'name_si' => 'ප්‍රාදේශීය සභා බල ප්‍රදේශය',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'urban-council'],
            [
                'name_en' => 'Urban Council',
                'name_si' => 'නගර සභා බල ප්‍රදේශය',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'municipal-council'],
            [
                'name_en' => 'Municipal Council',
                'name_si' => 'මහ නගර සභා බල ප්‍රදේශය',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_3 = Category::updateOrCreate(
            ['slug' => 'postal'],
            [
                'name_en' => 'Postal',
                'name_si' => 'තැපල් සීමාවන්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'province-1'],
            [
                'name_en' => 'Province',
                'name_si' => 'පළාත',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'district-2'],
            [
                'name_en' => 'District',
                'name_si' => 'දිස්ත්‍රික්කය',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'main-post-office'],
            [
                'name_en' => 'Main Post Office',
                'name_si' => 'ප්‍රධාන තැපල් කාර්යාලය',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'sub-post-office'],
            [
                'name_en' => 'Sub Post Office',
                'name_si' => 'උප තැපල් කාර්යාලය',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_4 = Category::updateOrCreate(
            ['slug' => 'health'],
            [
                'name_en' => 'Health',
                'name_si' => 'සෞඛ්‍ය සීමාවන්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'province-2'],
            [
                'name_en' => 'Province',
                'name_si' => 'පළාත',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'district-3'],
            [
                'name_en' => 'District',
                'name_si' => 'දිස්ත්‍රික්කය',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'moh-area'],
            [
                'name_en' => 'MOH Area',
                'name_si' => 'සෞඛ්‍ය වෛද්‍ය නිලධාරි බල ප්‍රදේශය',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'phi-area'],
            [
                'name_en' => 'PHI Area',
                'name_si' => 'මහජන සෞඛ්‍ය පරීක්ෂක බල ප්‍රදේශය',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'phm-area'],
            [
                'name_en' => 'PHM Area',
                'name_si' => 'පවුල් සෞඛ්‍ය සේවිකා බල ප්‍රදේශය',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 4,
            ]
        );

        $cat_1_5 = Category::updateOrCreate(
            ['slug' => 'forest-administration'],
            [
                'name_en' => 'Forest Administration',
                'name_si' => 'වනාන්තර පරිපාලනමය සීමාවන්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'zone'],
            [
                'name_en' => 'Zone',
                'name_si' => 'කලාපය',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'division-1'],
            [
                'name_en' => 'Division',
                'name_si' => 'දිසාව',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'range-1'],
            [
                'name_en' => 'Range',
                'name_si' => 'අඩවිය',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'beat'],
            [
                'name_en' => 'Beat',
                'name_si' => 'බීට්ටුව',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'field'],
            [
                'name_en' => 'Field',
                'name_si' => 'ක්ෂේත්‍ර',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 4,
            ]
        );

        $cat_1_6 = Category::updateOrCreate(
            ['slug' => 'wildlife-administration'],
            [
                'name_en' => 'Wildlife Administration',
                'name_si' => 'වනජීවී පරිපාලනමය සීමාවන්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 6,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'assistant-director-region'],
            [
                'name_en' => 'Assistant Director Region',
                'name_si' => 'සහකාර අධ්‍යක්ෂ බල ප්‍රදේශය',
                'parent_id' => $cat_1_6->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'range-2'],
            [
                'name_en' => 'Range',
                'name_si' => 'අඩවිය',
                'parent_id' => $cat_1_6->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'beat-1'],
            [
                'name_en' => 'Beat',
                'name_si' => 'බීට්ටු',
                'parent_id' => $cat_1_6->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_7 = Category::updateOrCreate(
            ['slug' => 'nature-zones'],
            [
                'name_en' => 'Nature Zones',
                'name_si' => 'ස්වභාවික කලාප සීමාවන්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 7,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'flowering-plant-zones'],
            [
                'name_en' => 'Flowering Plant Zones',
                'name_si' => 'සපුෂ්ප ශාඛ කලාප',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'a-dry-zone'],
            [
                'name_en' => 'A: Dry zone',
                'name_si' => 'A: වියලි කලාපය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'b1-northern-intermediate-lowlands'],
            [
                'name_en' => 'B1: Northern Intermediate lowlands',
                'name_si' => 'B1: උතුරු අතරමැදි පහතරට',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'b2-eastern-intermediate-lowlands'],
            [
                'name_en' => 'B2: Eastern Intermediate lowlands',
                'name_si' => 'B2: නැගෙනහිර අතරමැදි පහතරට',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'c1-northern-wet-lowlands'],
            [
                'name_en' => 'C1: Northern Wet lowlands',
                'name_si' => 'C1: උතුරු තෙත් පහතරට',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'c2-south-of-ratnapura'],
            [
                'name_en' => 'C2: South of Ratnapura',
                'name_si' => 'C2: රත්නපුරයට දකුණින්',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'c3-southern-sinharaja-hiniduma-kanneliya'],
            [
                'name_en' => 'C3: Southern Sinharaja Hiniduma-Kanneliya',
                'name_si' => 'C3: දකුණු සිංහරාජය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'd-foothills-of-adams-peak'],
            [
                'name_en' => 'D: Foothills of Adam’s Peak',
                'name_si' => 'D: සමනල කන්ද පාමුල',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_7 = Category::updateOrCreate(
            ['slug' => 'e-kandy---upper-mahaweli'],
            [
                'name_en' => 'E: Kandy - upper Mahaweli',
                'name_si' => 'E: මහනුවර',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_8 = Category::updateOrCreate(
            ['slug' => 'f-knuckles'],
            [
                'name_en' => 'F: Knuckles',
                'name_si' => 'F: නකල්ස්',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 8,
            ]
        );

        $cat_3_9 = Category::updateOrCreate(
            ['slug' => 'g-central-mountains-ramboda---nuwara-eliya'],
            [
                'name_en' => 'G: Central Mountains Ramboda - Nuwara Eliya',
                'name_si' => 'G: මධ්‍යම කඳුකරය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 9,
            ]
        );

        $cat_3_10 = Category::updateOrCreate(
            ['slug' => 'h-adams-peak'],
            [
                'name_en' => 'H: Adam’s Peak',
                'name_si' => 'H: සමනල කන්ද',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 10,
            ]
        );

        $cat_3_11 = Category::updateOrCreate(
            ['slug' => 'i-horton-plains'],
            [
                'name_en' => 'I: Horton Plains',
                'name_si' => 'I: හෝටන්තැන්න',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 11,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'forest-zones'],
            [
                'name_en' => 'Forest Zones',
                'name_si' => 'වනාන්තර කලාප',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'lowland-rain-forest'],
            [
                'name_en' => 'Lowland Rain Forest',
                'name_si' => 'පහතරට වැසි වනාන්තර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'dry-monsoon-forest'],
            [
                'name_en' => 'Dry Monsoon Forest',
                'name_si' => 'වියළි මෝසම් වනාන්තර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'moist-monsoon-forest'],
            [
                'name_en' => 'Moist Monsoon Forest',
                'name_si' => 'තෙත් මෝසම් වනාන්තර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'montane-forest'],
            [
                'name_en' => 'Montane Forest',
                'name_si' => 'කඳුකර වනාන්තර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'sub-montane-forest'],
            [
                'name_en' => 'Sub Montane Forest',
                'name_si' => 'උප කඳුකර වනාන්තර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'open--sparse-forest'],
            [
                'name_en' => 'Open & Sparse Forest',
                'name_si' => 'විවෘත හා විරල වනාන්තර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'mangrove'],
            [
                'name_en' => 'Mangrove',
                'name_si' => 'කඩොලාන',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_7 = Category::updateOrCreate(
            ['slug' => 'riverine-dry-forest'],
            [
                'name_en' => 'Riverine Dry Forest',
                'name_si' => 'ගංගාධාර වියළි වනාන්තර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_8 = Category::updateOrCreate(
            ['slug' => 'savannah'],
            [
                'name_en' => 'Savannah',
                'name_si' => 'සවානා',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 8,
            ]
        );

        $cat_3_9 = Category::updateOrCreate(
            ['slug' => 'shrub'],
            [
                'name_en' => 'Shrub',
                'name_si' => 'පඳුරු',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 9,
            ]
        );

        $cat_3_10 = Category::updateOrCreate(
            ['slug' => 'grassland'],
            [
                'name_en' => 'Grassland',
                'name_si' => 'තෘණ භූමි',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 10,
            ]
        );

        $cat_3_11 = Category::updateOrCreate(
            ['slug' => 'marsh'],
            [
                'name_en' => 'Marsh',
                'name_si' => 'වගුරු',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 11,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'wildlife-zones'],
            [
                'name_en' => 'Wildlife Zones',
                'name_si' => 'වනජීවී කලාප',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'national-parks'],
            [
                'name_en' => 'National Parks',
                'name_si' => 'ජාතික උද්‍යාන',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'national-reserves'],
            [
                'name_en' => 'National Reserves',
                'name_si' => 'ජාතික රක්ෂිත ප්‍රදේශ',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'strict-nature-reserves'],
            [
                'name_en' => 'Strict Nature Reserves',
                'name_si' => 'දැඩි ස්වභාව රක්ෂිත',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'nature-reserves'],
            [
                'name_en' => 'Nature Reserves',
                'name_si' => 'ස්වභාව රක්ෂිත',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'sanctuaries'],
            [
                'name_en' => 'Sanctuaries',
                'name_si' => 'අභයභූමි',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'marine-reserves'],
            [
                'name_en' => 'Marine Reserves',
                'name_si' => 'සමුද්‍රීය රක්ෂිත',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'elephant-pass-polygon'],
            [
                'name_en' => 'Elephant Pass Polygon',
                'name_si' => 'අලිමංකඩ',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 6,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'rock-zones'],
            [
                'name_en' => 'Rock Zones',
                'name_si' => 'පාෂාණ කලාප',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'highland-complex'],
            [
                'name_en' => 'Highland Complex',
                'name_si' => 'උස්බිම් සංකීර්ණය',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'wanni-complex'],
            [
                'name_en' => 'Wanni Complex',
                'name_si' => 'වන්නි සංකීර්ණය',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'vijayan-complex'],
            [
                'name_en' => 'Vijayan Complex',
                'name_si' => 'විජයානු සංකීර්ණය',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'limestone-complex'],
            [
                'name_en' => 'Limestone Complex',
                'name_si' => 'හුණුගල් සංකීර්ණය',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'kadugannawa-complex'],
            [
                'name_en' => 'Kadugannawa Complex',
                'name_si' => 'කඩුගන්නාව සංකීර්ණය',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'agro-ecological-zones'],
            [
                'name_en' => 'Agro-ecological Zones',
                'name_si' => 'කෘෂි පාරිසරික කලාප',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'dry-zone'],
            [
                'name_en' => 'Dry Zone',
                'name_si' => 'වියලි කලාපය',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'intermediate-zone'],
            [
                'name_en' => 'Intermediate Zone',
                'name_si' => 'අතරමැදි කලාපය',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'wet-zone'],
            [
                'name_en' => 'Wet Zone',
                'name_si' => 'තෙත් කලාපය',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'topographic-zones'],
            [
                'name_en' => 'Topographic Zones',
                'name_si' => 'භූ විෂමතා කලාප',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'mountainous-zone'],
            [
                'name_en' => 'Mountainous Zone',
                'name_si' => 'කඳුකර කලාපය',
                'parent_id' => $cat_2_5->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'central'],
            [
                'name_en' => 'Central',
                'name_si' => 'මධ්‍ය',
                'parent_id' => $cat_2_5->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'bulutota-rakwana'],
            [
                'name_en' => 'Bulutota-Rakwana',
                'name_si' => 'බුළුතොට-රක්වාන',
                'parent_id' => $cat_2_5->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'gal-oya'],
            [
                'name_en' => 'Gal Oya',
                'name_si' => 'ගල්ඔය',
                'parent_id' => $cat_2_5->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'inland-plains'],
            [
                'name_en' => 'Inland Plains',
                'name_si' => 'අභ්‍යන්තර තැනිතලාව',
                'parent_id' => $cat_2_5->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'coastal-plains'],
            [
                'name_en' => 'Coastal Plains',
                'name_si' => 'වෙරළබඩ තැන්න',
                'parent_id' => $cat_2_5->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_6 = Category::updateOrCreate(
            ['slug' => 'climate-zones'],
            [
                'name_en' => 'Climate Zones',
                'name_si' => 'දේශගුණ කලාප',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'lowland-wet-zone'],
            [
                'name_en' => 'Lowland Wet Zone',
                'name_si' => 'පහතරට තෙත් කලාපය',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'montane-zone'],
            [
                'name_en' => 'Montane Zone',
                'name_si' => 'කඳුකර කලාපය',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'intermediate-zone-1'],
            [
                'name_en' => 'Intermediate Zone',
                'name_si' => 'අතරමැදි කලාපය',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'dry-zone-1'],
            [
                'name_en' => 'Dry Zone',
                'name_si' => 'වියළි කලාපය',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'semi-arid-zone'],
            [
                'name_en' => 'Semi-arid Zone',
                'name_si' => 'අර්ධ ශුෂ්ක කලාපය',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_7 = Category::updateOrCreate(
            ['slug' => 'rainfall-zones'],
            [
                'name_en' => 'Rainfall Zones',
                'name_si' => 'වර්ෂාපතන කලාප',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'wet-zone-1'],
            [
                'name_en' => 'Wet Zone',
                'name_si' => 'තෙත් කලාපය',
                'parent_id' => $cat_2_7->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'intermediate-zone-2'],
            [
                'name_en' => 'Intermediate Zone',
                'name_si' => 'අතරමැදි කලාපය',
                'parent_id' => $cat_2_7->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'dry-zone-2'],
            [
                'name_en' => 'Dry Zone',
                'name_si' => 'වියළි කලාපය',
                'parent_id' => $cat_2_7->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'semi-arid-zone-1'],
            [
                'name_en' => 'Semi-arid Zone',
                'name_si' => 'අර්ධ ශුෂ්ක කලාපය',
                'parent_id' => $cat_2_7->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_8 = Category::updateOrCreate(
            ['slug' => 'electricity-distribution'],
            [
                'name_en' => 'Electricity Distribution',
                'name_si' => 'විදුලි බෙදාහැරීම්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 8,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'distribution-division-1'],
            [
                'name_en' => 'Distribution Division 1',
                'name_si' => 'බෙදාහැරීම් අංශය 1',
                'parent_id' => $cat_1_8->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'distribution-division-2'],
            [
                'name_en' => 'Distribution Division 2',
                'name_si' => 'බෙදාහැරීම් අංශය 2',
                'parent_id' => $cat_1_8->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'distribution-division-3'],
            [
                'name_en' => 'Distribution Division 3',
                'name_si' => 'බෙදාහැරීම් අංශය 3',
                'parent_id' => $cat_1_8->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'distribution-division-4'],
            [
                'name_en' => 'Distribution Division 4',
                'name_si' => 'බෙදාහැරීම් අංශය 4',
                'parent_id' => $cat_1_8->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_9 = Category::updateOrCreate(
            ['slug' => 'education'],
            [
                'name_en' => 'Education',
                'name_si' => 'අධ්‍යාපන',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 9,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'province-3'],
            [
                'name_en' => 'Province',
                'name_si' => 'පළාත',
                'parent_id' => $cat_1_9->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'zone-1'],
            [
                'name_en' => 'Zone',
                'name_si' => 'කලාපය',
                'parent_id' => $cat_1_9->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'division-2'],
            [
                'name_en' => 'Division',
                'name_si' => 'කොට්ඨාශය',
                'parent_id' => $cat_1_9->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'schools'],
            [
                'name_en' => 'Schools',
                'name_si' => 'පාසල්',
                'parent_id' => $cat_1_9->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_10 = Category::updateOrCreate(
            ['slug' => 'disaster-zones'],
            [
                'name_en' => 'Disaster Zones',
                'name_si' => 'ආපදා කලාප',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 10,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'flood'],
            [
                'name_en' => 'Flood',
                'name_si' => 'ගංවතුර',
                'parent_id' => $cat_1_10->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'landslides'],
            [
                'name_en' => 'Landslides',
                'name_si' => 'නායයාම්',
                'parent_id' => $cat_1_10->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'tsunami'],
            [
                'name_en' => 'Tsunami',
                'name_si' => 'සුනාමි',
                'parent_id' => $cat_1_10->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'contagious-diseases'],
            [
                'name_en' => 'Contagious Diseases',
                'name_si' => 'බෝවන රෝග',
                'parent_id' => $cat_1_10->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'drought'],
            [
                'name_en' => 'Drought',
                'name_si' => 'නියග',
                'parent_id' => $cat_1_10->id,
                'sort_order' => 4,
            ]
        );

        $cat_1_11 = Category::updateOrCreate(
            ['slug' => 'telecommunication'],
            [
                'name_en' => 'Telecommunication',
                'name_si' => 'විදුලි සංදේශ',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 11,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'telecommunication-tower'],
            [
                'name_en' => 'Telecommunication Tower',
                'name_si' => 'සංදේශ කුළුණ',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'telecom'],
            [
                'name_en' => 'Telecom',
                'name_si' => 'ටෙලිකොම්',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'region'],
            [
                'name_en' => 'Region',
                'name_si' => 'කලාප',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'province-4'],
            [
                'name_en' => 'Province',
                'name_si' => 'පළාත්',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'regional-area'],
            [
                'name_en' => 'Regional Area',
                'name_si' => 'ප්‍රාදේශීය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'local-exchange-area'],
            [
                'name_en' => 'Local Exchange Area',
                'name_si' => 'ස්ථානීය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_12 = Category::updateOrCreate(
            ['slug' => 'archaeological-boundaries'],
            [
                'name_en' => 'Archaeological Boundaries',
                'name_si' => 'පුරා විද්‍යා සීමාවන්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 12,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'district-4'],
            [
                'name_en' => 'District',
                'name_si' => 'දිස්ත්‍රික්',
                'parent_id' => $cat_1_12->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'zone-2'],
            [
                'name_en' => 'Zone',
                'name_si' => 'කලාපය',
                'parent_id' => $cat_1_12->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'site'],
            [
                'name_en' => 'Site',
                'name_si' => 'ස්ථානය',
                'parent_id' => $cat_1_12->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_13 = Category::updateOrCreate(
            ['slug' => 'history'],
            [
                'name_en' => 'History',
                'name_si' => 'පැරණි සීමාවන්',
                'parent_id' => $cat_0_0->id,
                'sort_order' => 13,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'pre-anuradhapura-era'],
            [
                'name_en' => 'Pre-Anuradhapura Era',
                'name_si' => 'අනුරාධපුර යුගයට පෙර සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'anuradhapura-era'],
            [
                'name_en' => 'Anuradhapura Era',
                'name_si' => 'අනුරාධපුර යුගයේ සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'ruhuna'],
            [
                'name_en' => 'Ruhuna',
                'name_si' => 'රුහුණ',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'pihiti'],
            [
                'name_en' => 'Pihiti',
                'name_si' => 'පිහිටි',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'maya'],
            [
                'name_en' => 'Maya',
                'name_si' => 'මායා',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'malaya'],
            [
                'name_en' => 'Malaya',
                'name_si' => 'මලය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'polonnaruwa-era'],
            [
                'name_en' => 'Polonnaruwa Era',
                'name_si' => 'පොලොන්නරු යුගයේ සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'uttaradesa'],
            [
                'name_en' => 'Uttaradesa',
                'name_si' => 'උත්තර දේශය',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'dakkhinadesa'],
            [
                'name_en' => 'Dakkhinadesa',
                'name_si' => 'දක්ඛිණ දේශය',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'rohana'],
            [
                'name_en' => 'Rohana',
                'name_si' => 'රෝහණය',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'dolos-dahas-rata'],
            [
                'name_en' => 'Dolos Dahas Rata',
                'name_si' => 'දොලොස් දහස් රට',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'ata-dahas-rata'],
            [
                'name_en' => 'Ata Dahas Rata',
                'name_si' => 'අට දහස් රට',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'malaya-1'],
            [
                'name_en' => 'Malaya',
                'name_si' => 'මලය',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'post-polonnaruwa-era'],
            [
                'name_en' => 'Post-Polonnaruwa Era',
                'name_si' => 'පශ්චාත් පොලොන්නරු යුගය',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'kotte-era'],
            [
                'name_en' => 'Kotte Era',
                'name_si' => 'කෝට්ටේ යුගයේ සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'raigama'],
            [
                'name_en' => 'Raigama',
                'name_si' => 'රයිගම',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'kotte'],
            [
                'name_en' => 'Kotte',
                'name_si' => 'කෝට්ටේ',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'sitawaka'],
            [
                'name_en' => 'Sitawaka',
                'name_si' => 'සීතාවක',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'senkadagala'],
            [
                'name_en' => 'Senkadagala',
                'name_si' => 'සෙංකඩගල',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'vanni'],
            [
                'name_en' => 'Vanni',
                'name_si' => 'වන්නි',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'jaffna'],
            [
                'name_en' => 'Jaffna',
                'name_si' => 'යාපනය',
                'parent_id' => $cat_2_4->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'kandyan-era'],
            [
                'name_en' => 'Kandyan Era',
                'name_si' => 'මහනුවර යුගයේ සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_6 = Category::updateOrCreate(
            ['slug' => 'portuguese-era'],
            [
                'name_en' => 'Portuguese Era',
                'name_si' => 'පෘතුගීසි යුගයේ සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'coastal'],
            [
                'name_en' => 'Coastal',
                'name_si' => 'වෙරළබඩ',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'kandyan'],
            [
                'name_en' => 'Kandyan',
                'name_si' => 'මහනුවර',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_7 = Category::updateOrCreate(
            ['slug' => 'dutch-era'],
            [
                'name_en' => 'Dutch Era',
                'name_si' => 'ලන්දේසි යුගයේ සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'jaffna-1'],
            [
                'name_en' => 'Jaffna',
                'name_si' => 'යාපනය',
                'parent_id' => $cat_2_7->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'colombo'],
            [
                'name_en' => 'Colombo',
                'name_si' => 'කොළඹ',
                'parent_id' => $cat_2_7->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'galle'],
            [
                'name_en' => 'Galle',
                'name_si' => 'ගාල්ල',
                'parent_id' => $cat_2_7->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'kandyan-kingdom'],
            [
                'name_en' => 'Kandyan Kingdom',
                'name_si' => 'මහනුවර රාජධානිය',
                'parent_id' => $cat_2_7->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_8 = Category::updateOrCreate(
            ['slug' => 'british-era'],
            [
                'name_en' => 'British Era',
                'name_si' => 'ඉංග්‍රීසි යුගයේ සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 8,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'north'],
            [
                'name_en' => 'North',
                'name_si' => 'උතුර',
                'parent_id' => $cat_2_8->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'east'],
            [
                'name_en' => 'East',
                'name_si' => 'නැගෙනහිර',
                'parent_id' => $cat_2_8->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'west'],
            [
                'name_en' => 'West',
                'name_si' => 'බස්නාහිර',
                'parent_id' => $cat_2_8->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'south'],
            [
                'name_en' => 'South',
                'name_si' => 'දකුණ',
                'parent_id' => $cat_2_8->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'central-1'],
            [
                'name_en' => 'Central',
                'name_si' => 'මධ්‍යම',
                'parent_id' => $cat_2_8->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_9 = Category::updateOrCreate(
            ['slug' => 'ceylon-era'],
            [
                'name_en' => 'Ceylon Era',
                'name_si' => 'ලංකා යුගයේ සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 9,
            ]
        );

        $cat_2_10 = Category::updateOrCreate(
            ['slug' => 'war-zones'],
            [
                'name_en' => 'War Zones',
                'name_si' => 'යුද්ධය තුළ බල සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 10,
            ]
        );

        $cat_2_11 = Category::updateOrCreate(
            ['slug' => 'current-chinese-boundaries'],
            [
                'name_en' => 'Current Chinese Boundaries',
                'name_si' => 'වර්තමාන චීන සීමාවන්',
                'parent_id' => $cat_1_13->id,
                'sort_order' => 11,
            ]
        );

        $cat_0_1 = Category::updateOrCreate(
            ['slug' => 'space'],
            [
                'name_en' => 'Space',
                'name_si' => 'භූ අවකාශ',
                'parent_id' => null,
                'sort_order' => 1,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'public-spaces'],
            [
                'name_en' => 'Public Spaces',
                'name_si' => 'පොදු අවකාශය',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'sport'],
            [
                'name_en' => 'Sport',
                'name_si' => 'ක්‍රීඩා අවකාශ',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'playground'],
            [
                'name_en' => 'Playground',
                'name_si' => 'ක්‍රීඩා පිටිය',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'cricket-ground'],
            [
                'name_en' => 'Cricket Ground',
                'name_si' => 'ක්‍රිකට් ගහන තැන',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'volleyball-court'],
            [
                'name_en' => 'Volleyball Court',
                'name_si' => 'වොලිබෝල් ගහන තැන',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'jogging-track'],
            [
                'name_en' => 'Jogging Track',
                'name_si' => 'ජොගින් ට්‍රැක්',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'swimming-spot'],
            [
                'name_en' => 'Swimming Spot',
                'name_si' => 'පිහිනුම් ස්ථානය',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'swimming-pool'],
            [
                'name_en' => 'Swimming Pool',
                'name_si' => 'පිහිනුම් තටාකය',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_6 = Category::updateOrCreate(
            ['slug' => 'street-play-area'],
            [
                'name_en' => 'Street Play Area',
                'name_si' => 'වීදියේ ක්‍රීඩා කරන තැන',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 6,
            ]
        );

        $cat_1_2 = Category::updateOrCreate(
            ['slug' => 'recreation'],
            [
                'name_en' => 'Recreation',
                'name_si' => 'විනෝද හා විවේක ස්ථාන',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'event-place'],
            [
                'name_en' => 'Event Place',
                'name_si' => 'උත්සව පවත්වන තැන',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'permanent'],
            [
                'name_en' => 'Permanent',
                'name_si' => 'ස්ථිර',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'temporary'],
            [
                'name_en' => 'Temporary',
                'name_si' => 'තාවකාලික',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'bardrinking-place'],
            [
                'name_en' => 'Bar/Drinking Place',
                'name_si' => 'මත්පැන් බොන තැන',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'weed-place'],
            [
                'name_en' => 'Weed Place',
                'name_si' => 'ගංජා ගහන තැන',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'park'],
            [
                'name_en' => 'Park',
                'name_si' => 'උද්‍යානය',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'public-park'],
            [
                'name_en' => 'Public Park',
                'name_si' => 'පොදු උද්‍යානය',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'botanical-garden'],
            [
                'name_en' => 'Botanical Garden',
                'name_si' => 'උද්භිද උද්‍යානය',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'childrens-park'],
            [
                'name_en' => 'Children\'s Park',
                'name_si' => 'ළමා උද්‍යානය',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'wew-pitiya'],
            [
                'name_en' => 'Wew Pitiya',
                'name_si' => 'වැව් පිටිය',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'urban-forest'],
            [
                'name_en' => 'Urban Forest',
                'name_si' => 'නාගරික කැලෑව',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_6 = Category::updateOrCreate(
            ['slug' => 'resting-places'],
            [
                'name_en' => 'Resting Places',
                'name_si' => 'විවේක ස්ථාන',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'outdoor-bench'],
            [
                'name_en' => 'Outdoor Bench',
                'name_si' => 'එලිමහන් බංකුව',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'yard'],
            [
                'name_en' => 'Yard',
                'name_si' => 'මිදුල',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'void-deck'],
            [
                'name_en' => 'Void Deck',
                'name_si' => 'Void Deck',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'ghost-space'],
            [
                'name_en' => 'Ghost space',
                'name_si' => 'Ghost space',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'blue-space'],
            [
                'name_en' => 'Blue space',
                'name_si' => 'Blue space',
                'parent_id' => $cat_2_6->id,
                'sort_order' => 4,
            ]
        );

        $cat_1_3 = Category::updateOrCreate(
            ['slug' => 'business-space'],
            [
                'name_en' => 'Business Space',
                'name_si' => 'ව්‍යාපාරික අවකාශ',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'free-trade-zone'],
            [
                'name_en' => 'Free Trade Zone',
                'name_si' => 'නිදහස් වෙළඳ කලාප',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'industrial-estate'],
            [
                'name_en' => 'Industrial Estate',
                'name_si' => 'කර්මාන්ත පුර',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'pola'],
            [
                'name_en' => 'Pola',
                'name_si' => 'පොල',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'daily-pola'],
            [
                'name_en' => 'Daily Pola',
                'name_si' => 'දෛනික පොල',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'special-day-pola'],
            [
                'name_en' => 'Special Day Pola',
                'name_si' => 'විශේෂ දින පොළ',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'market-center'],
            [
                'name_en' => 'Market Center',
                'name_si' => 'කඩ මණ්ඩිය',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'gammaedda'],
            [
                'name_en' => 'Gammaedda',
                'name_si' => 'ගම්මැද්ද',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'pavement'],
            [
                'name_en' => 'Pavement',
                'name_si' => 'පදික වේදිකාව',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_6 = Category::updateOrCreate(
            ['slug' => 'lellama'],
            [
                'name_en' => 'Lellama',
                'name_si' => 'ලෙල්ලම',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 6,
            ]
        );

        $cat_2_7 = Category::updateOrCreate(
            ['slug' => 'gem-buying-open-area'],
            [
                'name_en' => 'Gem Buying Open Area',
                'name_si' => 'මැණික් මිලදී ගැනුම් විවෘත ස්ථානය',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 7,
            ]
        );

        $cat_2_8 = Category::updateOrCreate(
            ['slug' => 'tea-weighing-station'],
            [
                'name_en' => 'Tea Weighing Station',
                'name_si' => 'තේ දළු කිරන ස්ථානය',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 8,
            ]
        );

        $cat_2_9 = Category::updateOrCreate(
            ['slug' => 'milk-buying-station'],
            [
                'name_en' => 'Milk Buying Station',
                'name_si' => 'කිරි මිළදී ගන්නා ස්ථානය',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 9,
            ]
        );

        $cat_2_10 = Category::updateOrCreate(
            ['slug' => 'street'],
            [
                'name_en' => 'Street',
                'name_si' => 'වීදිය',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 10,
            ]
        );

        $cat_1_4 = Category::updateOrCreate(
            ['slug' => 'religious-space'],
            [
                'name_en' => 'Religious Space',
                'name_si' => 'ආගමික අවකාශ',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'kovil'],
            [
                'name_en' => 'Kovil',
                'name_si' => 'කෝවිල',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'mosque'],
            [
                'name_en' => 'Mosque',
                'name_si' => 'මුස්ලිම් පල්ලිය',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'buddhist-temple'],
            [
                'name_en' => 'Buddhist Temple',
                'name_si' => 'පන්සල',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'church'],
            [
                'name_en' => 'Church',
                'name_si' => 'කතෝලික පල්ලිය',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'devalaya'],
            [
                'name_en' => 'Devalaya',
                'name_si' => 'දේවාලය',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'sanhida'],
            [
                'name_en' => 'Sanhida',
                'name_si' => 'සංහිඳ',
                'parent_id' => $cat_1_4->id,
                'sort_order' => 5,
            ]
        );

        $cat_1_5 = Category::updateOrCreate(
            ['slug' => 'cultural-space'],
            [
                'name_en' => 'Cultural Space',
                'name_si' => 'සංස්කෘතික අවකාශ',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'dance-practice-area'],
            [
                'name_en' => 'Dance Practice Area',
                'name_si' => 'නැටුම් පුරුදු වෙන තැන',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'singing-area'],
            [
                'name_en' => 'Singing Area',
                'name_si' => 'සිංදු කියන තැන',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'cultural-center-ground'],
            [
                'name_en' => 'Cultural Center Ground',
                'name_si' => 'සංස්කෘතික මධ්‍යස්ථාන භූමිය',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'open-air-theater'],
            [
                'name_en' => 'Open Air Theater',
                'name_si' => 'එලිමහන් රගහල',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'archeological-site'],
            [
                'name_en' => 'Archeological Site',
                'name_si' => 'පුරා විද්‍යාත්මක ස්ථානය',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'open-stage'],
            [
                'name_en' => 'Open Stage',
                'name_si' => 'විවෘත වේදිකාව',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_6 = Category::updateOrCreate(
            ['slug' => 'dance-performance-area'],
            [
                'name_en' => 'Dance Performance Area',
                'name_si' => 'නැටුම් පෙන්වන තැන',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 6,
            ]
        );

        $cat_2_7 = Category::updateOrCreate(
            ['slug' => 'music-concert-area'],
            [
                'name_en' => 'Music Concert Area',
                'name_si' => 'සංගීත ප්‍රසංග පවත්වන තැන',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 7,
            ]
        );

        $cat_2_8 = Category::updateOrCreate(
            ['slug' => 'kamatha'],
            [
                'name_en' => 'Kamatha',
                'name_si' => 'කමත',
                'parent_id' => $cat_1_5->id,
                'sort_order' => 8,
            ]
        );

        $cat_1_6 = Category::updateOrCreate(
            ['slug' => 'tourist-space'],
            [
                'name_en' => 'Tourist Space',
                'name_si' => 'සංචාරක අවකාශ',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 6,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'historical-place'],
            [
                'name_en' => 'Historical Place',
                'name_si' => 'ඓතිහාසික ස්ථානයක්',
                'parent_id' => $cat_1_6->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'normal'],
            [
                'name_en' => 'Normal',
                'name_si' => 'සාමාන්‍ය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'ruins'],
            [
                'name_en' => 'Ruins',
                'name_si' => 'නටඹුන්',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'recreation-place'],
            [
                'name_en' => 'Recreation Place',
                'name_si' => 'විනෝද ස්ථානයක්',
                'parent_id' => $cat_1_6->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'view-point'],
            [
                'name_en' => 'View Point',
                'name_si' => 'නැරඹුම් පොයින්ට් එකක්',
                'parent_id' => $cat_1_6->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'nature-place'],
            [
                'name_en' => 'Nature Place',
                'name_si' => 'ස්වභාවික ස්ථානයක්',
                'parent_id' => $cat_1_6->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_7 = Category::updateOrCreate(
            ['slug' => 'community-services'],
            [
                'name_en' => 'Community Services',
                'name_si' => 'ප්‍රජා සේවා සම්පාදනය',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 7,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'bathing-spot'],
            [
                'name_en' => 'Bathing Spot',
                'name_si' => 'නාන තොට',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'spout'],
            [
                'name_en' => 'Spout',
                'name_si' => 'පිහිල්ල',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'public-well'],
            [
                'name_en' => 'Public Well',
                'name_si' => 'පොදු ළිඳ',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'car-park'],
            [
                'name_en' => 'Car Park',
                'name_si' => 'කාර් පාක් එක',
                'parent_id' => $cat_1_7->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_8 = Category::updateOrCreate(
            ['slug' => 'other'],
            [
                'name_en' => 'Other',
                'name_si' => 'වෙනත්',
                'parent_id' => $cat_0_1->id,
                'sort_order' => 8,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'cemetery'],
            [
                'name_en' => 'Cemetery',
                'name_si' => 'සුසාන භූමි',
                'parent_id' => $cat_1_8->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'lighthouse'],
            [
                'name_en' => 'Lighthouse',
                'name_si' => 'ප්‍රදීපාගාර',
                'parent_id' => $cat_1_8->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'living-space'],
            [
                'name_en' => 'Living Space',
                'name_si' => 'ජීවත් වෙන ස්ථානය',
                'parent_id' => $cat_1_8->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'street-1'],
            [
                'name_en' => 'Street',
                'name_si' => 'වීදිය',
                'parent_id' => $cat_1_8->id,
                'sort_order' => 3,
            ]
        );

        $cat_0_2 = Category::updateOrCreate(
            ['slug' => 'land'],
            [
                'name_en' => 'Land',
                'name_si' => 'ඉඩම්',
                'parent_id' => null,
                'sort_order' => 2,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'non-state-owned'],
            [
                'name_en' => 'Non-State Owned',
                'name_si' => 'රජයට අයත් නොවන සියළු',
                'parent_id' => $cat_0_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'private'],
            [
                'name_en' => 'Private',
                'name_si' => 'පුද්ගලයින් සතු',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'sinnakkara'],
            [
                'name_en' => 'Sinnakkara',
                'name_si' => 'සින්නක්කර ඔප්පු',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'grants'],
            [
                'name_en' => 'Grants',
                'name_si' => 'ප්‍රදාන පත්‍ර',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'ranbima'],
            [
                'name_en' => 'Ranbima',
                'name_si' => 'රන්බිම',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'rathnabhumi'],
            [
                'name_en' => 'Rathnabhumi',
                'name_si' => 'රත්නභූමි',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'jayabhumi'],
            [
                'name_en' => 'Jayabhumi',
                'name_si' => 'ජයභූමි',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'swarnabhumi'],
            [
                'name_en' => 'Swarnabhumi',
                'name_si' => 'ස්වර්ණභූමි',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'company-owned'],
            [
                'name_en' => 'Company Owned',
                'name_si' => 'සමාගම් සතු',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'lrc'],
            [
                'name_en' => 'LRC',
                'name_si' => 'LRC',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'janawasama'],
            [
                'name_en' => 'Janawasama',
                'name_si' => 'ජනවසම',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'company'],
            [
                'name_en' => 'Company',
                'name_si' => 'සමාගම',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'organization-owned'],
            [
                'name_en' => 'Organization Owned',
                'name_si' => 'සංවිධාන සතු',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'religious'],
            [
                'name_en' => 'Religious',
                'name_si' => 'ආගමික සංවිධාන',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'temple'],
            [
                'name_en' => 'Temple',
                'name_si' => 'පන්සල',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'devalaya-1'],
            [
                'name_en' => 'Devalaya',
                'name_si' => 'දේවාලය',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'church-1'],
            [
                'name_en' => 'Church',
                'name_si' => 'කතෝලික පල්ලිය',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_3 = Category::updateOrCreate(
            ['slug' => 'mosque-1'],
            [
                'name_en' => 'Mosque',
                'name_si' => 'මුස්ලිම් පල්ලිය',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_4_4 = Category::updateOrCreate(
            ['slug' => 'kovil-1'],
            [
                'name_en' => 'Kovil',
                'name_si' => 'කෝ්විල',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'ngo'],
            [
                'name_en' => 'NGO',
                'name_si' => 'රාජ්‍ය නොවන සංවිධාන',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'cbo'],
            [
                'name_en' => 'CBO',
                'name_si' => 'ප්‍රජා සංවිධාන',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'embassy-owned'],
            [
                'name_en' => 'Embassy Owned',
                'name_si' => 'තානාපති කාර්යාල සතු',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'state-owned'],
            [
                'name_en' => 'State Owned',
                'name_si' => 'රජයේ',
                'parent_id' => $cat_0_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'divisional-secretariat-1'],
            [
                'name_en' => 'Divisional Secretariat',
                'name_si' => 'ප්‍රාදේශීය ලේකම් සතු',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'railway-dept'],
            [
                'name_en' => 'Railway Dept',
                'name_si' => 'දුම්රිය දෙපාර්තමේන්තුව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'forest-dept'],
            [
                'name_en' => 'Forest Dept',
                'name_si' => 'වන සංරක්ෂණ දෙපාර්තමේන්තුව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'wildlife-dept'],
            [
                'name_en' => 'Wildlife Dept',
                'name_si' => 'වන ජීවි සංරක්ෂණ දෙපාර්තමේන්තුව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'archeology-dept'],
            [
                'name_en' => 'Archeology Dept',
                'name_si' => 'පුරා විද්‍යා දෙපාර්තමේන්තුව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'agrarian-services-dept'],
            [
                'name_en' => 'Agrarian Services Dept',
                'name_si' => 'ගොවිජන සේවා දෙපාර්තමේන්තුව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_6 = Category::updateOrCreate(
            ['slug' => 'irrigation-dept'],
            [
                'name_en' => 'Irrigation Dept',
                'name_si' => 'වාරිමාර්ග දෙපාර්තමේන්තුව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 6,
            ]
        );

        $cat_2_7 = Category::updateOrCreate(
            ['slug' => 'coast-conservation-dept'],
            [
                'name_en' => 'Coast Conservation Dept',
                'name_si' => 'වෙරළ සංරක්ෂණ දෙපාර්තමේන්තුව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 7,
            ]
        );

        $cat_2_8 = Category::updateOrCreate(
            ['slug' => 'other-depts'],
            [
                'name_en' => 'Other Depts',
                'name_si' => 'වෙනත් දෙපාර්තමේන්තු',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 8,
            ]
        );

        $cat_2_9 = Category::updateOrCreate(
            ['slug' => 'boi'],
            [
                'name_en' => 'BOI',
                'name_si' => 'BOI',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 9,
            ]
        );

        $cat_2_10 = Category::updateOrCreate(
            ['slug' => 'exclusive-economic-zone'],
            [
                'name_en' => 'Exclusive Economic Zone',
                'name_si' => 'Exclusive Economic Zone',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 10,
            ]
        );

        $cat_2_11 = Category::updateOrCreate(
            ['slug' => 'local-government-1'],
            [
                'name_en' => 'Local Government',
                'name_si' => 'පළාත් පාලන ආයතන',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 11,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'urban-council-1'],
            [
                'name_en' => 'Urban Council',
                'name_si' => 'නගර සභා',
                'parent_id' => $cat_2_11->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'municipal-council-1'],
            [
                'name_en' => 'Municipal Council',
                'name_si' => 'මහ නගර සභා',
                'parent_id' => $cat_2_11->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'pradeshiya-sabha-1'],
            [
                'name_en' => 'Pradeshiya Sabha',
                'name_si' => 'ප්‍රාදේශීය සභා',
                'parent_id' => $cat_2_11->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_12 = Category::updateOrCreate(
            ['slug' => 'state-corporations'],
            [
                'name_en' => 'State Corporations',
                'name_si' => 'රජයේ සංස්ථා සතු',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 12,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'land-reform-commission'],
            [
                'name_en' => 'Land Reform Commission',
                'name_si' => 'ඉඩම් ප්‍රතිසංස්කරණ කොමිෂම',
                'parent_id' => $cat_2_12->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'mahaweli-authority'],
            [
                'name_en' => 'Mahaweli Authority',
                'name_si' => 'මහවැලි අධිකාරිය',
                'parent_id' => $cat_2_12->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'vihara-devalagam'],
            [
                'name_en' => 'Vihara Devalagam',
                'name_si' => 'විහාර හා දේවාලගම් පනත',
                'parent_id' => $cat_2_12->id,
                'sort_order' => 2,
            ]
        );

        $cat_0_3 = Category::updateOrCreate(
            ['slug' => 'building'],
            [
                'name_en' => 'Building',
                'name_si' => 'ගොඩනැගිලි',
                'parent_id' => null,
                'sort_order' => 3,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'residence'],
            [
                'name_en' => 'Residence',
                'name_si' => 'පදිංචිය',
                'parent_id' => $cat_0_3->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'house'],
            [
                'name_en' => 'House',
                'name_si' => 'නිවස',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'apartment'],
            [
                'name_en' => 'Apartment',
                'name_si' => 'තට්ටු නිවාසයේ නිවස',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'housing-complex'],
            [
                'name_en' => 'Housing Complex',
                'name_si' => 'නිවාස සංකීර්ණයේ නිවස',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'hostel'],
            [
                'name_en' => 'Hostel',
                'name_si' => 'නේවාසිකාගාරය',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'production'],
            [
                'name_en' => 'Production',
                'name_si' => 'නිෂ්පාදනය',
                'parent_id' => $cat_0_3->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'agriculture--forestry'],
            [
                'name_en' => 'Agriculture & Forestry',
                'name_si' => 'කෘෂිකර්මය, වන වගාව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'mining'],
            [
                'name_en' => 'Mining',
                'name_si' => 'පතල් හා කැණීම්',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'manufacturing'],
            [
                'name_en' => 'Manufacturing',
                'name_si' => 'නිෂ්පාදන',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_2 = Category::updateOrCreate(
            ['slug' => 'services'],
            [
                'name_en' => 'Services',
                'name_si' => 'සේවා සැපයීම',
                'parent_id' => $cat_0_3->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'government'],
            [
                'name_en' => 'Government',
                'name_si' => 'රජයේ',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'main'],
            [
                'name_en' => 'Main',
                'name_si' => 'ප්‍රධාන',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'ministries'],
            [
                'name_en' => 'Ministries',
                'name_si' => 'අමාත්‍යංශ',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'departments'],
            [
                'name_en' => 'Departments',
                'name_si' => 'දෙපාර්තමේන්තු',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'corporations'],
            [
                'name_en' => 'Corporations',
                'name_si' => 'සංස්ථා',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_3 = Category::updateOrCreate(
            ['slug' => 'commissions'],
            [
                'name_en' => 'Commissions',
                'name_si' => 'කොමිෂන්',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'provincial'],
            [
                'name_en' => 'Provincial',
                'name_si' => 'පළාත්',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'main-1'],
            [
                'name_en' => 'Main',
                'name_si' => 'ප්‍රධාන',
                'parent_id' => $cat_3_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'departments-1'],
            [
                'name_en' => 'Departments',
                'name_si' => 'දෙපාර්තමේන්තු',
                'parent_id' => $cat_3_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'corporations-1'],
            [
                'name_en' => 'Corporations',
                'name_si' => 'සංස්ථා',
                'parent_id' => $cat_3_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_3 = Category::updateOrCreate(
            ['slug' => 'commissions-1'],
            [
                'name_en' => 'Commissions',
                'name_si' => 'කොමිෂන්',
                'parent_id' => $cat_3_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'district-5'],
            [
                'name_en' => 'District',
                'name_si' => 'දිස්ත්‍රික්',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'district-offices'],
            [
                'name_en' => 'District Offices',
                'name_si' => 'දිස්ත්‍රික් කාර්යාල',
                'parent_id' => $cat_3_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'service-provision'],
            [
                'name_en' => 'Service Provision',
                'name_si' => 'සේවා සම්පාදනය',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'health-1'],
            [
                'name_en' => 'Health',
                'name_si' => 'සෞඛ්‍ය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'district-hospital'],
            [
                'name_en' => 'District Hospital',
                'name_si' => 'දිස්ත්‍රික් රෝහල',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'general-hospital'],
            [
                'name_en' => 'General Hospital',
                'name_si' => 'මහ රෝහල',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'regional'],
            [
                'name_en' => 'Regional',
                'name_si' => 'ප්‍රාදේශීය',
                'parent_id' => $cat_3_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'admin'],
            [
                'name_en' => 'Admin',
                'name_si' => 'පරිපාලන',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'local-gov'],
            [
                'name_en' => 'Local Gov',
                'name_si' => 'පළාත් පාලන ආයතන',
                'parent_id' => $cat_3_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'main-offices'],
            [
                'name_en' => 'Main Offices',
                'name_si' => 'ප්‍රධාන කාර්යාල',
                'parent_id' => $cat_3_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'sub-offices'],
            [
                'name_en' => 'Sub Offices',
                'name_si' => 'උප කාර්යාල',
                'parent_id' => $cat_3_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_3 = Category::updateOrCreate(
            ['slug' => 'libraries'],
            [
                'name_en' => 'Libraries',
                'name_si' => 'පුස්තකාල',
                'parent_id' => $cat_3_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'health-services'],
            [
                'name_en' => 'Health Services',
                'name_si' => 'සෞඛ්‍ය සේවා',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'clinics'],
            [
                'name_en' => 'Clinics',
                'name_si' => 'සායන',
                'parent_id' => $cat_3_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'hospitals'],
            [
                'name_en' => 'Hospitals',
                'name_si' => 'රෝහල්',
                'parent_id' => $cat_3_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'base-hospital'],
            [
                'name_en' => 'Base Hospital',
                'name_si' => 'මූලික රෝහල',
                'parent_id' => $cat_3_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_3 = Category::updateOrCreate(
            ['slug' => 'dispensary'],
            [
                'name_en' => 'Dispensary',
                'name_si' => 'ඩිස්පෙන්සරි',
                'parent_id' => $cat_3_2->id,
                'sort_order' => 3,
            ]
        );

        $cat_4_4 = Category::updateOrCreate(
            ['slug' => 'pharmacy'],
            [
                'name_en' => 'Pharmacy',
                'name_si' => 'ෆාමසි',
                'parent_id' => $cat_3_2->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'education-1'],
            [
                'name_en' => 'Education',
                'name_si' => 'අධ්‍යාපන',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'primary-education'],
            [
                'name_en' => 'Primary Education',
                'name_si' => 'ප්‍රාථමික අධ්‍යාපනය',
                'parent_id' => $cat_3_3->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'school-education'],
            [
                'name_en' => 'School Education',
                'name_si' => 'පාසල් අධ්‍යාපනය',
                'parent_id' => $cat_3_3->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'school'],
            [
                'name_en' => 'School',
                'name_si' => 'පාසල',
                'parent_id' => $cat_3_3->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_3 = Category::updateOrCreate(
            ['slug' => 'education-office'],
            [
                'name_en' => 'Education Office',
                'name_si' => 'අධ්‍යාපන කාර්යාලය',
                'parent_id' => $cat_3_3->id,
                'sort_order' => 3,
            ]
        );

        $cat_4_4 = Category::updateOrCreate(
            ['slug' => 'vocational-education'],
            [
                'name_en' => 'Vocational Education',
                'name_si' => 'වෘත්තීය අධ්‍යාපනය',
                'parent_id' => $cat_3_3->id,
                'sort_order' => 4,
            ]
        );

        $cat_5_0 = Category::updateOrCreate(
            ['slug' => 'training-institutes'],
            [
                'name_en' => 'Training Institutes',
                'name_si' => 'වෘත්තීය පුහුණු ආයතන',
                'parent_id' => $cat_4_4->id,
                'sort_order' => 0,
            ]
        );

        $cat_5_1 = Category::updateOrCreate(
            ['slug' => 'technical-colleges'],
            [
                'name_en' => 'Technical Colleges',
                'name_si' => 'කාර්මික විද්‍යාල',
                'parent_id' => $cat_4_4->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_5 = Category::updateOrCreate(
            ['slug' => 'higher-education'],
            [
                'name_en' => 'Higher Education',
                'name_si' => 'උසස් අධ්‍යාපන ආයතන',
                'parent_id' => $cat_3_3->id,
                'sort_order' => 5,
            ]
        );

        $cat_5_0 = Category::updateOrCreate(
            ['slug' => 'universities'],
            [
                'name_en' => 'Universities',
                'name_si' => 'විශ්වවිද්‍යාල',
                'parent_id' => $cat_4_5->id,
                'sort_order' => 0,
            ]
        );

        $cat_5_1 = Category::updateOrCreate(
            ['slug' => 'faculties'],
            [
                'name_en' => 'Faculties',
                'name_si' => 'පීඨ',
                'parent_id' => $cat_4_5->id,
                'sort_order' => 1,
            ]
        );

        $cat_5_2 = Category::updateOrCreate(
            ['slug' => 'departments-2'],
            [
                'name_en' => 'Departments',
                'name_si' => 'අධ්‍යනාංශ',
                'parent_id' => $cat_4_5->id,
                'sort_order' => 2,
            ]
        );

        $cat_5_3 = Category::updateOrCreate(
            ['slug' => 'campuses'],
            [
                'name_en' => 'Campuses',
                'name_si' => 'විශ්වවිද්‍යාල මණ්ඩප',
                'parent_id' => $cat_4_5->id,
                'sort_order' => 3,
            ]
        );

        $cat_5_4 = Category::updateOrCreate(
            ['slug' => 'institutes'],
            [
                'name_en' => 'Institutes',
                'name_si' => 'විශ්වවිද්‍යාල ආයතන',
                'parent_id' => $cat_4_5->id,
                'sort_order' => 4,
            ]
        );

        $cat_4_6 = Category::updateOrCreate(
            ['slug' => 'research-institutes'],
            [
                'name_en' => 'Research Institutes',
                'name_si' => 'පර්යේෂණ ආයතන',
                'parent_id' => $cat_3_3->id,
                'sort_order' => 6,
            ]
        );

        $cat_4_7 = Category::updateOrCreate(
            ['slug' => 'library'],
            [
                'name_en' => 'Library',
                'name_si' => 'පුස්තකාලය',
                'parent_id' => $cat_3_3->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'cultural'],
            [
                'name_en' => 'Cultural',
                'name_si' => 'සංස්කෘතික',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'reception-halls'],
            [
                'name_en' => 'Reception Halls',
                'name_si' => 'උත්සව ශාලා',
                'parent_id' => $cat_3_4->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'theaters'],
            [
                'name_en' => 'Theaters',
                'name_si' => 'නාට්‍ය ශාලා',
                'parent_id' => $cat_3_4->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'law--order'],
            [
                'name_en' => 'Law & Order',
                'name_si' => 'නීතිය හා සාමය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 5,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'police-1'],
            [
                'name_en' => 'Police',
                'name_si' => 'පොලිස්',
                'parent_id' => $cat_3_5->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'police-station-1'],
            [
                'name_en' => 'Police Station',
                'name_si' => 'පොලීසිය',
                'parent_id' => $cat_3_5->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'police-post'],
            [
                'name_en' => 'Police Post',
                'name_si' => 'Police post',
                'parent_id' => $cat_3_5->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_3 = Category::updateOrCreate(
            ['slug' => 'courts'],
            [
                'name_en' => 'Courts',
                'name_si' => 'උසාවි',
                'parent_id' => $cat_3_5->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'agriculture--livestock'],
            [
                'name_en' => 'Agriculture & Livestock',
                'name_si' => 'කෘෂිකර්මය හා සත්ව පාලනය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_7 = Category::updateOrCreate(
            ['slug' => 'communication'],
            [
                'name_en' => 'Communication',
                'name_si' => 'සන්නිවේදනය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_8 = Category::updateOrCreate(
            ['slug' => 'transport'],
            [
                'name_en' => 'Transport',
                'name_si' => 'ප්‍රවාහනය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 8,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'roads'],
            [
                'name_en' => 'Roads',
                'name_si' => 'මාර්ග',
                'parent_id' => $cat_3_8->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'bus-stand'],
            [
                'name_en' => 'Bus Stand',
                'name_si' => 'බස් නැවතුම',
                'parent_id' => $cat_3_8->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_9 = Category::updateOrCreate(
            ['slug' => 'water'],
            [
                'name_en' => 'Water',
                'name_si' => 'ජල',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 9,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'ferry-service'],
            [
                'name_en' => 'Ferry Service',
                'name_si' => 'Ferry Service',
                'parent_id' => $cat_3_9->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'port'],
            [
                'name_en' => 'Port',
                'name_si' => 'Port',
                'parent_id' => $cat_3_9->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_10 = Category::updateOrCreate(
            ['slug' => 'air'],
            [
                'name_en' => 'Air',
                'name_si' => 'ගුවන්',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 10,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'air-port'],
            [
                'name_en' => 'Air Port',
                'name_si' => 'Air Port',
                'parent_id' => $cat_3_10->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'helicopter-pad'],
            [
                'name_en' => 'Helicopter pad',
                'name_si' => 'Helicopter pad',
                'parent_id' => $cat_3_10->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_11 = Category::updateOrCreate(
            ['slug' => 'rural'],
            [
                'name_en' => 'Rural',
                'name_si' => 'ග්‍රාමීය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 11,
            ]
        );

        $cat_4_0 = Category::updateOrCreate(
            ['slug' => 'gn-office'],
            [
                'name_en' => 'GN Office',
                'name_si' => 'ග්‍රාම නිලධාරි කාර්යාලය',
                'parent_id' => $cat_3_11->id,
                'sort_order' => 0,
            ]
        );

        $cat_4_1 = Category::updateOrCreate(
            ['slug' => 'post-office'],
            [
                'name_en' => 'Post Office',
                'name_si' => 'තැපල් කාර්යාලය',
                'parent_id' => $cat_3_11->id,
                'sort_order' => 1,
            ]
        );

        $cat_4_2 = Category::updateOrCreate(
            ['slug' => 'rural-hospital'],
            [
                'name_en' => 'Rural Hospital',
                'name_si' => 'ග්‍රාමීය රෝහල',
                'parent_id' => $cat_3_11->id,
                'sort_order' => 2,
            ]
        );

        $cat_4_3 = Category::updateOrCreate(
            ['slug' => 'krushi-office'],
            [
                'name_en' => 'Krushi Office',
                'name_si' => 'කෘපනිස කාර්යාලය',
                'parent_id' => $cat_3_11->id,
                'sort_order' => 3,
            ]
        );

        $cat_4_4 = Category::updateOrCreate(
            ['slug' => 'dev-officer-office'],
            [
                'name_en' => 'Dev Officer Office',
                'name_si' => 'සංවර්ධන නිලධාරි කාර්යාලය',
                'parent_id' => $cat_3_11->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'business-sector-services'],
            [
                'name_en' => 'Business Sector Services',
                'name_si' => 'ව්‍යාපාරික අංශයේ සේවා සැපයීම',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'electricity-gas-water'],
            [
                'name_en' => 'Electricity, Gas, Water',
                'name_si' => 'විදුලිය, ගෑස්, ජලය',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'filling-station'],
            [
                'name_en' => 'Filling Station',
                'name_si' => 'Filling Station',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'construction'],
            [
                'name_en' => 'Construction',
                'name_si' => 'ඉදිකිරීම්',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'retail--wholesale'],
            [
                'name_en' => 'Retail & Wholesale',
                'name_si' => 'තොග සහ සිල්ලර වෙළඳාම',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'transport--storage'],
            [
                'name_en' => 'Transport & Storage',
                'name_si' => 'ප්‍රවාහනය සහ ගබඩා කිරීම්',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'accommodation--food'],
            [
                'name_en' => 'Accommodation & Food',
                'name_si' => 'නවාතැන් හා ආහාර සැපයීම්',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'it--communication'],
            [
                'name_en' => 'IT & Communication',
                'name_si' => 'තොරතුරු සහ සන්නිවේදන',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_7 = Category::updateOrCreate(
            ['slug' => 'finance--insurance'],
            [
                'name_en' => 'Finance & Insurance',
                'name_si' => 'මූල්‍ය සහ රක්ෂණ',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_8 = Category::updateOrCreate(
            ['slug' => 'real-estate'],
            [
                'name_en' => 'Real Estate',
                'name_si' => 'දේපල වෙළඳාම්',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 8,
            ]
        );

        $cat_3_9 = Category::updateOrCreate(
            ['slug' => 'professional--scientific'],
            [
                'name_en' => 'Professional & Scientific',
                'name_si' => 'වෘත්තීය, විද්‍යාත්මක',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 9,
            ]
        );

        $cat_3_10 = Category::updateOrCreate(
            ['slug' => 'education-2'],
            [
                'name_en' => 'Education',
                'name_si' => 'අධ්‍යාපනය',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 10,
            ]
        );

        $cat_3_11 = Category::updateOrCreate(
            ['slug' => 'arts--entertainment'],
            [
                'name_en' => 'Arts & Entertainment',
                'name_si' => 'කලා හා පොදු විනෝදාත්මක',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 11,
            ]
        );

        $cat_3_12 = Category::updateOrCreate(
            ['slug' => 'other-services'],
            [
                'name_en' => 'Other Services',
                'name_si' => 'අනෙකුත් සේවා',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 12,
            ]
        );

        $cat_1_3 = Category::updateOrCreate(
            ['slug' => 'organizations'],
            [
                'name_en' => 'Organizations',
                'name_si' => 'සංවිධාන',
                'parent_id' => $cat_0_3->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'community'],
            [
                'name_en' => 'Community',
                'name_si' => 'ප්‍රජා',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'community-hall'],
            [
                'name_en' => 'Community Hall',
                'name_si' => 'ප්‍රජා ශාලාව',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'sarvodaya-bldg'],
            [
                'name_en' => 'Sarvodaya Bldg',
                'name_si' => 'සර්වෝදය ගොඩනැගිල්ල',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'sanasa-bldg'],
            [
                'name_en' => 'Sanasa Bldg',
                'name_si' => 'සණස ගොඩනැගිල්ල',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'pre-school-bldg'],
            [
                'name_en' => 'Pre-school Bldg',
                'name_si' => 'පෙර පාසල් ගොඩනැගිල්ල',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'death-donation-society-bldg'],
            [
                'name_en' => 'Death Donation Society Bldg',
                'name_si' => 'මරණාධාර සමිති ගොඩනැගිල්ල',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'ngo-1'],
            [
                'name_en' => 'NGO',
                'name_si' => 'රාජ්‍ය නොවන සංවිධාන',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'ingo'],
            [
                'name_en' => 'INGO',
                'name_si' => 'ජාත්‍යන්තර සංවිධාන කටයුතු',
                'parent_id' => $cat_1_3->id,
                'sort_order' => 2,
            ]
        );

        $cat_0_4 = Category::updateOrCreate(
            ['slug' => 'road'],
            [
                'name_en' => 'Road',
                'name_si' => 'පාරවල්',
                'parent_id' => null,
                'sort_order' => 4,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'road-types'],
            [
                'name_en' => 'Road Types',
                'name_si' => 'පාරවල් වර්ග',
                'parent_id' => $cat_0_4->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'public-roads'],
            [
                'name_en' => 'Public Roads',
                'name_si' => 'පොදු මාර්ග',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'expressway-e'],
            [
                'name_en' => 'Expressway E',
                'name_si' => 'සීග්‍රගාමී මාර්ගය E',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'a-grade'],
            [
                'name_en' => 'A Grade',
                'name_si' => 'A මාර්ගය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'b-grade'],
            [
                'name_en' => 'B Grade',
                'name_si' => 'B මාර්ගය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'c-grade'],
            [
                'name_en' => 'C Grade',
                'name_si' => 'C මාර්ගය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'jeep-track'],
            [
                'name_en' => 'Jeep Track',
                'name_si' => 'ජීප් රථ මාර්ගය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'ac'],
            [
                'name_en' => 'AC',
                'name_si' => 'AC',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'ab-grade'],
            [
                'name_en' => 'AB Grade',
                'name_si' => 'AB මාර්ගය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 6,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'private-roads'],
            [
                'name_en' => 'Private Roads',
                'name_si' => 'පුද්ගලික මාර්ග',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'road-to-house'],
            [
                'name_en' => 'Road to House',
                'name_si' => 'නිවසට යන පාර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'farm-road'],
            [
                'name_en' => 'Farm Road',
                'name_si' => 'කෘෂි බිම ඇතුලේ මාර්ග',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'factory-road'],
            [
                'name_en' => 'Factory Road',
                'name_si' => 'නිෂ්පාදන බිම ඇතුලේ මාර්ග',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'railways'],
            [
                'name_en' => 'Railways',
                'name_si' => 'දුම්රිය මාර්ග',
                'parent_id' => $cat_0_4->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'lines'],
            [
                'name_en' => 'Lines',
                'name_si' => 'මාර්ග වර්ග',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'main-line'],
            [
                'name_en' => 'Main Line',
                'name_si' => 'ප්‍රධාන පාර',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'coastal-line'],
            [
                'name_en' => 'Coastal Line',
                'name_si' => 'වෙරළබඩ',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'puttalam-line'],
            [
                'name_en' => 'Puttalam Line',
                'name_si' => 'පුත්තලම්',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'kelani-valley-line'],
            [
                'name_en' => 'Kelani Valley Line',
                'name_si' => 'කැළනිවැලි',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'matale-line'],
            [
                'name_en' => 'Matale Line',
                'name_si' => 'මාතලේ',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'northern-line'],
            [
                'name_en' => 'Northern Line',
                'name_si' => 'උතුරු',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'mannar-line'],
            [
                'name_en' => 'Mannar Line',
                'name_si' => 'මන්නාරම',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_7 = Category::updateOrCreate(
            ['slug' => 'batticaloa-line'],
            [
                'name_en' => 'Batticaloa Line',
                'name_si' => 'මඩකලපුව',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_8 = Category::updateOrCreate(
            ['slug' => 'trincomalee-line'],
            [
                'name_en' => 'Trincomalee Line',
                'name_si' => 'ත්‍රිකුණාමලය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 8,
            ]
        );

        $cat_3_9 = Category::updateOrCreate(
            ['slug' => 'mihintale-line'],
            [
                'name_en' => 'Mihintale Line',
                'name_si' => 'මිහින්තලේ',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 9,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'railway-station'],
            [
                'name_en' => 'Railway Station',
                'name_si' => 'දුම්රිය ස්ථානය',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'railway-halt'],
            [
                'name_en' => 'Railway Halt',
                'name_si' => 'දුම්රිය නැවතුම',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_2 = Category::updateOrCreate(
            ['slug' => 'on-the-road'],
            [
                'name_en' => 'On the Road',
                'name_si' => 'පාර මත',
                'parent_id' => $cat_0_4->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'traffic-signs'],
            [
                'name_en' => 'Traffic Signs',
                'name_si' => 'මාර්ග සංඥා',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'road-elements'],
            [
                'name_en' => 'Road Elements',
                'name_si' => 'මාර්ගයට අදාල කොටස්',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'culvert'],
            [
                'name_en' => 'Culvert',
                'name_si' => 'බෝක්කුව',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'bridge'],
            [
                'name_en' => 'Bridge',
                'name_si' => 'පාලම',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'center-line'],
            [
                'name_en' => 'Center Line',
                'name_si' => 'මැද ඉර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'side-lines'],
            [
                'name_en' => 'Side Lines',
                'name_si' => 'දෙපැත්තෙ ඉරි',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'retaining-wall'],
            [
                'name_en' => 'Retaining Wall',
                'name_si' => 'පැති බැම්ම',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'pavement-1'],
            [
                'name_en' => 'Pavement',
                'name_si' => 'පදික වේදිකාව',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'bus-stop'],
            [
                'name_en' => 'Bus Stop',
                'name_si' => 'බස් නැවතුම',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_7 = Category::updateOrCreate(
            ['slug' => 'drain'],
            [
                'name_en' => 'Drain',
                'name_si' => 'කානුව',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 7,
            ]
        );

        $cat_3_8 = Category::updateOrCreate(
            ['slug' => 'roundabout'],
            [
                'name_en' => 'Roundabout',
                'name_si' => 'වටරවුම',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 8,
            ]
        );

        $cat_3_9 = Category::updateOrCreate(
            ['slug' => 'traffic-lights'],
            [
                'name_en' => 'Traffic Lights',
                'name_si' => 'සංඥා එලි',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 9,
            ]
        );

        $cat_3_10 = Category::updateOrCreate(
            ['slug' => 'kilometer-post'],
            [
                'name_en' => 'Kilometer Post',
                'name_si' => 'Kilometer post',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 10,
            ]
        );

        $cat_3_11 = Category::updateOrCreate(
            ['slug' => 'junction'],
            [
                'name_en' => 'Junction',
                'name_si' => 'Junction',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 11,
            ]
        );

        $cat_3_12 = Category::updateOrCreate(
            ['slug' => 'thawalantenna'],
            [
                'name_en' => 'Thawalantenna',
                'name_si' => 'තවලන්තැන්න',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 12,
            ]
        );

        $cat_0_5 = Category::updateOrCreate(
            ['slug' => 'geo-type'],
            [
                'name_en' => 'Geo-type',
                'name_si' => 'භූ ගෝලීය පිහිටීම',
                'parent_id' => null,
                'sort_order' => 5,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'mountain'],
            [
                'name_en' => 'Mountain',
                'name_si' => 'කන්ද',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 0,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'port-1'],
            [
                'name_en' => 'Port',
                'name_si' => 'තොටුපල',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 1,
            ]
        );

        $cat_1_2 = Category::updateOrCreate(
            ['slug' => 'gap'],
            [
                'name_en' => 'Gap',
                'name_si' => 'කපොල්ල',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_3 = Category::updateOrCreate(
            ['slug' => 'rock'],
            [
                'name_en' => 'Rock',
                'name_si' => 'පර්වතය',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_4 = Category::updateOrCreate(
            ['slug' => 'plateau'],
            [
                'name_en' => 'Plateau',
                'name_si' => 'සානුව',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 4,
            ]
        );

        $cat_1_5 = Category::updateOrCreate(
            ['slug' => 'rock-slab'],
            [
                'name_en' => 'Rock Slab',
                'name_si' => 'ගල් තලාව',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 5,
            ]
        );

        $cat_1_6 = Category::updateOrCreate(
            ['slug' => 'cave'],
            [
                'name_en' => 'Cave',
                'name_si' => 'ගුහාව',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 6,
            ]
        );

        $cat_1_7 = Category::updateOrCreate(
            ['slug' => 'plain'],
            [
                'name_en' => 'Plain',
                'name_si' => 'තැනිතලාව',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 7,
            ]
        );

        $cat_1_8 = Category::updateOrCreate(
            ['slug' => 'sand-dune'],
            [
                'name_en' => 'Sand Dune',
                'name_si' => 'වැලි වැටිය',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 8,
            ]
        );

        $cat_1_9 = Category::updateOrCreate(
            ['slug' => 'limestone'],
            [
                'name_en' => 'Limestone',
                'name_si' => 'හුණුගල්',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 9,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'limestone-cave'],
            [
                'name_en' => 'Limestone Cave',
                'name_si' => 'හුණුගල් ගුහාව',
                'parent_id' => $cat_1_9->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'stalactite'],
            [
                'name_en' => 'Stalactite',
                'name_si' => 'හිරි ලැඹ',
                'parent_id' => $cat_1_9->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'stalagmite'],
            [
                'name_en' => 'Stalagmite',
                'name_si' => 'හිරි ටැඹ',
                'parent_id' => $cat_1_9->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_10 = Category::updateOrCreate(
            ['slug' => 'springs'],
            [
                'name_en' => 'Springs',
                'name_si' => 'වෙක්ලුසියානු උල්පත්',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 10,
            ]
        );

        $cat_1_11 = Category::updateOrCreate(
            ['slug' => 'natural-formation'],
            [
                'name_en' => 'Natural Formation',
                'name_si' => 'ස්වභාවික පිහිටීම',
                'parent_id' => $cat_0_5->id,
                'sort_order' => 11,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'swamp'],
            [
                'name_en' => 'Swamp',
                'name_si' => 'වගුර',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'mangrove-1'],
            [
                'name_en' => 'Mangrove',
                'name_si' => 'කඩොලාන',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'primary-forest'],
            [
                'name_en' => 'Primary Forest',
                'name_si' => 'ප්‍රාථමික වනාන්තරය',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'secondary-forest'],
            [
                'name_en' => 'Secondary Forest',
                'name_si' => 'ද්විතීයක වනාන්තරය',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'scrubland'],
            [
                'name_en' => 'Scrubland',
                'name_si' => 'කටු පඳුරු සහිත ලඳු බිම',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'patana'],
            [
                'name_en' => 'Patana',
                'name_si' => 'පතන් බිම',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 5,
            ]
        );

        $cat_2_6 = Category::updateOrCreate(
            ['slug' => 'savannah-1'],
            [
                'name_en' => 'Savannah',
                'name_si' => 'තලාව',
                'parent_id' => $cat_1_11->id,
                'sort_order' => 6,
            ]
        );

        $cat_0_6 = Category::updateOrCreate(
            ['slug' => 'water-1'],
            [
                'name_en' => 'Water',
                'name_si' => 'ජල පිහිටීම',
                'parent_id' => null,
                'sort_order' => 6,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'natural'],
            [
                'name_en' => 'Natural',
                'name_si' => 'ස්වභාවික',
                'parent_id' => $cat_0_6->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'river'],
            [
                'name_en' => 'River',
                'name_si' => 'ගංගාව',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'river-basin'],
            [
                'name_en' => 'River Basin',
                'name_si' => 'ගංගා ද්‍රෝණිය',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'primary-river'],
            [
                'name_en' => 'Primary River',
                'name_si' => 'ප්‍රථම ගංගාව',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'tributary'],
            [
                'name_en' => 'Tributary',
                'name_si' => 'අපර ගංගාව',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'western-river'],
            [
                'name_en' => 'Western River',
                'name_si' => 'පශ්චිම ගංගාව',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'river-features'],
            [
                'name_en' => 'River Features',
                'name_si' => 'ගංගා භූ ලක්ෂණ',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'waterfall'],
            [
                'name_en' => 'Waterfall',
                'name_si' => 'දිය ඇල්ල',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'v-valley'],
            [
                'name_en' => 'V Valley',
                'name_si' => 'V නිම්නය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'u-valley'],
            [
                'name_en' => 'U Valley',
                'name_si' => 'U නිම්නය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'canyon'],
            [
                'name_en' => 'Canyon',
                'name_si' => 'කැනියම',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'flood-plain'],
            [
                'name_en' => 'Flood Plain',
                'name_si' => 'පිටාර තැන්න',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_3_5 = Category::updateOrCreate(
            ['slug' => 'meander'],
            [
                'name_en' => 'Meander',
                'name_si' => 'ගං දඟරය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 5,
            ]
        );

        $cat_3_6 = Category::updateOrCreate(
            ['slug' => 'delta'],
            [
                'name_en' => 'Delta',
                'name_si' => 'ඩෙල්ටා',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 6,
            ]
        );

        $cat_3_7 = Category::updateOrCreate(
            ['slug' => 'estuary'],
            [
                'name_en' => 'Estuary',
                'name_si' => 'මෝය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 7,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'stream'],
            [
                'name_en' => 'Stream',
                'name_si' => 'දිය පහර',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'pond'],
            [
                'name_en' => 'Pond',
                'name_si' => 'පොකුණ',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'lake'],
            [
                'name_en' => 'Lake',
                'name_si' => 'විල',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'spring'],
            [
                'name_en' => 'Spring',
                'name_si' => 'දිය උල්පත',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 5,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'artificial'],
            [
                'name_en' => 'Artificial',
                'name_si' => 'නිර්මිත කෘත්‍රිම',
                'parent_id' => $cat_0_6->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'well'],
            [
                'name_en' => 'Well',
                'name_si' => 'ළිඳ',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'drinking-well'],
            [
                'name_en' => 'Drinking Well',
                'name_si' => 'වතුර බොන ළිඳ',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'bathing-well'],
            [
                'name_en' => 'Bathing Well',
                'name_si' => 'නාන ළිඳ',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'agri-well'],
            [
                'name_en' => 'Agri Well',
                'name_si' => 'වගා ළිද',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'tube-well'],
            [
                'name_en' => 'Tube Well',
                'name_si' => 'Tube Well',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'andiya-well'],
            [
                'name_en' => 'Andiya Well',
                'name_si' => 'ආඬියා ළිඳ',
                'parent_id' => $cat_2_0->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'reservoir'],
            [
                'name_en' => 'Reservoir',
                'name_si' => 'ජලාශය',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'water-body'],
            [
                'name_en' => 'Water Body',
                'name_si' => 'ජල තලය',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'bank'],
            [
                'name_en' => 'Bank',
                'name_si' => 'ඉවුර',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'dam'],
            [
                'name_en' => 'Dam',
                'name_si' => 'වේල්ල',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'sluice'],
            [
                'name_en' => 'Sluice',
                'name_si' => 'සොරොව්ව',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_4 = Category::updateOrCreate(
            ['slug' => 'tunnel'],
            [
                'name_en' => 'Tunnel',
                'name_si' => 'උමග',
                'parent_id' => $cat_2_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'wewa'],
            [
                'name_en' => 'Wewa',
                'name_si' => 'වැව',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'abandoned-wewa'],
            [
                'name_en' => 'Abandoned Wewa',
                'name_si' => 'අත්හල වැව',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'catchment'],
            [
                'name_en' => 'Catchment',
                'name_si' => 'ඉහත්තාව',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'tawulla'],
            [
                'name_en' => 'Tawulla',
                'name_si' => 'තාවුල්ල සහ දෙණිකඩ',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'wew-pathula'],
            [
                'name_en' => 'Wew Pathula',
                'name_si' => 'වැව් පතුල',
                'parent_id' => $cat_2_2->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'canal'],
            [
                'name_en' => 'Canal',
                'name_si' => 'ඇළ',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 3,
            ]
        );

        $cat_3_0 = Category::updateOrCreate(
            ['slug' => 'main-canal'],
            [
                'name_en' => 'Main Canal',
                'name_si' => 'ප්‍රධාන ඇල',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 0,
            ]
        );

        $cat_3_1 = Category::updateOrCreate(
            ['slug' => 'branch-canal'],
            [
                'name_en' => 'Branch Canal',
                'name_si' => 'බෙදුම් ඇල',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 1,
            ]
        );

        $cat_3_2 = Category::updateOrCreate(
            ['slug' => 'd-canal'],
            [
                'name_en' => 'D Canal',
                'name_si' => 'ඩී ඇල',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 2,
            ]
        );

        $cat_3_3 = Category::updateOrCreate(
            ['slug' => 'field-canal'],
            [
                'name_en' => 'Field Canal',
                'name_si' => 'කෙත් ඇල',
                'parent_id' => $cat_2_3->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'anicut'],
            [
                'name_en' => 'Anicut',
                'name_si' => 'අමුණ',
                'parent_id' => $cat_1_1->id,
                'sort_order' => 4,
            ]
        );

        $cat_1_2 = Category::updateOrCreate(
            ['slug' => 'sea'],
            [
                'name_en' => 'Sea',
                'name_si' => 'මුහුදු',
                'parent_id' => $cat_0_6->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'point'],
            [
                'name_en' => 'Point',
                'name_si' => 'තුඩුව',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'island'],
            [
                'name_en' => 'Island',
                'name_si' => 'දූපත',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'reef'],
            [
                'name_en' => 'Reef',
                'name_si' => 'පරය',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'lagoon'],
            [
                'name_en' => 'Lagoon',
                'name_si' => 'කලපුව',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 3,
            ]
        );

        $cat_2_4 = Category::updateOrCreate(
            ['slug' => 'bay'],
            [
                'name_en' => 'Bay',
                'name_si' => 'බොක්ක',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 4,
            ]
        );

        $cat_2_5 = Category::updateOrCreate(
            ['slug' => 'beach'],
            [
                'name_en' => 'Beach',
                'name_si' => 'වැල්ල',
                'parent_id' => $cat_1_2->id,
                'sort_order' => 5,
            ]
        );

        $cat_0_7 = Category::updateOrCreate(
            ['slug' => 'lines-1'],
            [
                'name_en' => 'Lines',
                'name_si' => 'රැහැන් සහ රේඛා',
                'parent_id' => null,
                'sort_order' => 7,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'electricity'],
            [
                'name_en' => 'Electricity',
                'name_si' => 'විදුලිය',
                'parent_id' => $cat_0_7->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_0 = Category::updateOrCreate(
            ['slug' => 'power-plants'],
            [
                'name_en' => 'Power Plants',
                'name_si' => 'Power Plants',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 0,
            ]
        );

        $cat_2_1 = Category::updateOrCreate(
            ['slug' => 'grid-substation'],
            [
                'name_en' => 'Grid Substation',
                'name_si' => 'Grid Substation',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 1,
            ]
        );

        $cat_2_2 = Category::updateOrCreate(
            ['slug' => 'lines-2'],
            [
                'name_en' => 'Lines',
                'name_si' => 'Lines',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 2,
            ]
        );

        $cat_2_3 = Category::updateOrCreate(
            ['slug' => 'transformer-point'],
            [
                'name_en' => 'Transformer point',
                'name_si' => 'Transformer point',
                'parent_id' => $cat_1_0->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'communication-lines'],
            [
                'name_en' => 'Communication Lines',
                'name_si' => 'සන්නිවේදන',
                'parent_id' => $cat_0_7->id,
                'sort_order' => 1,
            ]
        );

        $cat_1_2 = Category::updateOrCreate(
            ['slug' => 'water-pipe-line'],
            [
                'name_en' => 'Water pipe line',
                'name_si' => 'ජල නල',
                'parent_id' => $cat_0_7->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_3 = Category::updateOrCreate(
            ['slug' => 'drainage-lines'],
            [
                'name_en' => 'Drainage Lines',
                'name_si' => 'ජලාපවහන',
                'parent_id' => $cat_0_7->id,
                'sort_order' => 3,
            ]
        );

        $cat_0_8 = Category::updateOrCreate(
            ['slug' => 'plants'],
            [
                'name_en' => 'Plants',
                'name_si' => 'ශාඛ',
                'parent_id' => null,
                'sort_order' => 8,
            ]
        );

        $cat_1_0 = Category::updateOrCreate(
            ['slug' => 'kingdom'],
            [
                'name_en' => 'Kingdom',
                'name_si' => 'Kingdom',
                'parent_id' => $cat_0_8->id,
                'sort_order' => 0,
            ]
        );

        $cat_1_1 = Category::updateOrCreate(
            ['slug' => 'division-3'],
            [
                'name_en' => 'Division',
                'name_si' => 'Division',
                'parent_id' => $cat_0_8->id,
                'sort_order' => 1,
            ]
        );

        $cat_1_2 = Category::updateOrCreate(
            ['slug' => 'class'],
            [
                'name_en' => 'Class',
                'name_si' => 'Class',
                'parent_id' => $cat_0_8->id,
                'sort_order' => 2,
            ]
        );

        $cat_1_3 = Category::updateOrCreate(
            ['slug' => 'order'],
            [
                'name_en' => 'Order',
                'name_si' => 'Order',
                'parent_id' => $cat_0_8->id,
                'sort_order' => 3,
            ]
        );

        $cat_1_4 = Category::updateOrCreate(
            ['slug' => 'family'],
            [
                'name_en' => 'Family',
                'name_si' => 'Family',
                'parent_id' => $cat_0_8->id,
                'sort_order' => 4,
            ]
        );

        $cat_1_5 = Category::updateOrCreate(
            ['slug' => 'genus'],
            [
                'name_en' => 'Genus',
                'name_si' => 'Genus',
                'parent_id' => $cat_0_8->id,
                'sort_order' => 5,
            ]
        );

        $cat_1_6 = Category::updateOrCreate(
            ['slug' => 'scientific-name'],
            [
                'name_en' => 'Scientific Name',
                'name_si' => 'විද්‍යාත්මක නම',
                'parent_id' => $cat_0_8->id,
                'sort_order' => 6,
            ]
        );

    }
}