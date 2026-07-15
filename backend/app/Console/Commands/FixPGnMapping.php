<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\GramaNiladhari;
use App\Models\PGn;

class FixPGnMapping extends Command
{
    protected $signature = 'app:fix-pgn-mapping';
    protected $description = 'Smart fuzzy mapping for unmapped PGn records based on JSON source';

    public function handle()
    {
        $this->info('Starting Smart Fuzzy Mapping...');
        $json = file_get_contents(database_path('data/gn_population.json'));
        $data = json_decode($json, true);

        // Pre-fetch all GNs grouped by gn_name
        $allGns = GramaNiladhari::select('id', 'name_en', 'ds_en', 'dis_en', 'CCODE')->get();
        $gnsByName = [];
        foreach ($allGns as $gn) {
            $name = strtolower(trim($gn->name_en));
            $gnsByName[$name][] = $gn;
        }

        $mappedCount = 0;
        
        foreach ($data as $row) {
            // Find the PGn record that corresponds to this JSON row, but is unmapped
            $pgn = PGn::where('gn_name', $row['gn_name'])
                      ->where('population_both', $row['population_both'])
                      ->whereNull('grama_niladhari_id')
                      ->first();
            
            if (!$pgn) continue;

            $searchName = strtolower(trim($row['gn_name']));
            if (!isset($gnsByName[$searchName])) {
                continue; // No GramaNiladhari with this exact name exists at all
            }

            $candidates = $gnsByName[$searchName];
            
            $bestMatch = null;
            $bestScore = -1;

            foreach ($candidates as $candidate) {
                // Calculate similarity percentage based on DS Name and District Name
                $dsSim = 0;
                $disSim = 0;
                similar_text(strtolower(trim($candidate->ds_en)), strtolower(trim($row['ds_name'])), $dsSim);
                similar_text(strtolower(trim($candidate->dis_en)), strtolower(trim($row['district_name'])), $disSim);
                
                $score = $dsSim + $disSim; // Max 200
                
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $bestMatch = $candidate;
                }
            }

            if ($bestMatch && $bestScore > 100) { // arbitrary threshold for decent match (50% average)
                $pgn->grama_niladhari_id = $bestMatch->id;
                $pgn->CCODE = $bestMatch->CCODE;
                $pgn->save();
                $mappedCount++;
            }
        }

        $this->info("Successfully mapped {$mappedCount} previously unmapped records using fuzzy matching!");
    }
}
