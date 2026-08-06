<?php

namespace App\GraphQL\Queries;

use App\Models\Police;

class PoliceQueries
{
    /**
     * Get police station data for a GN by its CCODE.
     * The police table stores ccode directly on each record.
     */
    public function policeByGnCcode($_root, array $args): ?Police
    {
        return Police::where('ccode', $args['ccode'])->first();
    }

    /**
     * Get the 3 most relevant post offices for a GN:
     *   1. Post office matching GN name (most specific)
     *   2. Post office matching DS Division / City name
     *   3. Post office matching District name (broadest)
     */
    public function postOfficesByDsCode($_root, array $args)
    {
        $gnName     = $args['gnName']     ?? null;
        $dsName     = $args['dsName']     ?? null;
        $district   = $args['district']   ?? null;

        $results = collect();

        // 1. GN-level match
        if ($gnName) {
            $match = \App\Models\PostOffice::where('place_name_english', 'ilike', "%{$gnName}%")
                ->when($district, fn($q) => $q->where('district', 'ilike', "%{$district}%"))
                ->orderByRaw("LENGTH(place_name_english) ASC")
                ->first();
            if ($match) $results->push($match);
        }

        // 2. DS Division / City match (avoid duplicate)
        if ($dsName) {
            $match = \App\Models\PostOffice::where('place_name_english', 'ilike', "%{$dsName}%")
                ->when($district, fn($q) => $q->where('district', 'ilike', "%{$district}%"))
                ->whereNotIn('id', $results->pluck('id')->toArray())
                ->orderByRaw("LENGTH(place_name_english) ASC")
                ->first();
            if ($match) $results->push($match);
        }

        // 3. District capital / district name match (avoid duplicates)
        if ($district) {
            $match = \App\Models\PostOffice::where('place_name_english', 'ilike', "%{$district}%")
                ->where('district', 'ilike', "%{$district}%")
                ->whereNotIn('id', $results->pluck('id')->toArray())
                ->orderByRaw("LENGTH(place_name_english) ASC")
                ->first();
            if ($match) $results->push($match);
        }

        return $results->values();
    }
}
