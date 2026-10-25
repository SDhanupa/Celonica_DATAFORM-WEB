<?php

namespace App\Support;

use Illuminate\Http\Request;

final class PublicDirectoryData
{
    // Only directory labels and village-level context are public. New columns
    // and arbitrary survey answers remain private unless explicitly reviewed.
    public static function record(object|array $record): array
    {
        return array_intersect_key((array) $record, array_flip([
            'id', 'reg_number', 'name_en', 'name_si', 'name_ta',
            'gn_id', 'province_name', 'district_name', 'ds_name', 'gn_name',
            'raw_province', 'raw_district', 'raw_ds', 'raw_gn',
        ]));
    }

    public static function staff(Request $request): bool
    {
        $admin = $request->attributes->get('current_admin');
        return $admin instanceof \App\Models\Admin && $admin->is_active
            && in_array($admin->role, ['super_admin', 'admin', 'moderator'], true);
    }
}
