<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

        $uniqueDistricts = \App\Models\GramaNiladhari::select('dis_en', 'dis_si', 'dis_ta')
            ->whereNotNull('dis_en')
            ->distinct()
            ->get();

        // Fetch counts to prioritize the most frequent DCCODEs if possible, but ensuring no duplicates
        $allCodes = \App\Models\GramaNiladhari::select('dis_en', 'DCCODE', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
            ->whereNotNull('dis_en')
            ->whereNotNull('DCCODE')
            ->groupBy('dis_en', 'DCCODE')
            ->orderBy('total', 'desc')
            ->get()
            ->groupBy('dis_en');

        $assignedCodes = [];
        $districts = collect();

        foreach ($uniqueDistricts as $d) {
            $disEn = trim($d->dis_en);
            if ($disEn === 'LK60' || empty($disEn)) {
                continue;
            }

            $districtCodes = $allCodes->get($d->dis_en) ?? collect();
            $selectedCode = 'UNKNOWN';

            foreach ($districtCodes as $codeRow) {
                $code = $codeRow->DCCODE;
                if (!in_array($code, $assignedCodes)) {
                    $selectedCode = $code;
                    $assignedCodes[] = $code;
                    break;
                }
            }

            // Fallback if all codes were somehow taken (should not happen with this dataset)
            if ($selectedCode === 'UNKNOWN') {
                $selectedCode = $districtCodes->first()->DCCODE ?? 'UNKNOWN';
            }

            $districts->push([
                'code' => $selectedCode,
                'nameEn' => $d->dis_en,
                'nameSi' => $d->dis_si,
                'nameTa' => $d->dis_ta,
            ]);
        }

echo json_encode($districts, JSON_PRETTY_PRINT);
