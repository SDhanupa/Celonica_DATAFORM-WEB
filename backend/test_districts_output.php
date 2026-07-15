<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

        $accurateDistrictCodes = [
            'Colombo' => '11',
            'Gampaha' => '12',
            'Kalutara' => '13',
            'Kandy' => '21',
            'Matale' => '22',
            'Nuwara Eliya' => '23',
            'Galle' => '31',
            'Matara' => '32',
            'Hambantota' => '33',
            'Jaffna' => '41',
            'Kilinochchi' => '42',
            'Mannar' => '43',
            'Vavuniya' => '44',
            'Mullaitivu' => '45',
            'Batticaloa' => '51',
            'Ampara' => '52',
            'Trincomalee' => '53',
            'Kurunegala' => '61',
            'Puttalam' => '62',
            'Anuradhapura' => '71',
            'Polonnaruwa' => '72',
            'Badulla' => '81',
            'Monaragala' => '82',
            'Ratnapura' => '91',
            'Kegalle' => '92',
        ];

        // Fetch unique districts from the database
        $uniqueDistricts = \App\Models\GramaNiladhari::select('dis_en', 'dis_si', 'dis_ta')
            ->whereNotNull('dis_en')
            ->distinct()
            ->get();

        $districts = collect();
        foreach ($uniqueDistricts as $d) {
            $disEn = trim($d->dis_en);
            // Skip invalid or dummy districts like LK60
            if ($disEn === 'LK60' || empty($disEn)) {
                continue;
            }
            $districts->push([
                'code' => $accurateDistrictCodes[$disEn] ?? 'UNKNOWN',
                'nameEn' => $d->dis_en, // Wait, this uses untrimmed nameEn!
                'nameSi' => $d->dis_si,
                'nameTa' => $d->dis_ta,
            ]);
        }

echo count($districts) . "\n";
print_r($districts->pluck('nameEn')->toArray());
