import json
import os

with open('scratch_excel_mapping.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

clean_mapping = {}
for k, v in mapping.items():
    if k in ('Hierarchy', 'අංකය'): continue
    clean_mapping[k] = v.split('(')[0].strip()

php_array_content = '[\n'
for k, v in clean_mapping.items():
    php_array_content += f"            '{k}' => '{v}',\n"
php_array_content += '        ]'

seeder_content = f"""<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class ProductionSlugCodeSeeder extends Seeder
{{
    public function run()
    {{
        $mapping = {php_array_content};
        
        $categories = Category::whereNull('code')->get();
        $updatedCount = 0;
        
        foreach ($categories as $category) {{
            $slug = $category->slug;
            
            $prefix = 'location-';
            if (str_starts_with($slug, $prefix)) {{
                $numberStr = substr($slug, strlen($prefix));
                $numberStr = str_replace('-', '.', $numberStr);
                
                if (isset($mapping[$numberStr])) {{
                    $category->code = $mapping[$numberStr];
                    $category->save();
                    $updatedCount++;
                }}
            }} else {{
                // Handle non-location slugs if their slug directly matches dots
                $numberStr = str_replace('-', '.', $slug);
                if (isset($mapping[$numberStr])) {{
                    $category->code = $mapping[$numberStr];
                    $category->save();
                    $updatedCount++;
                }}
            }}
        }}
        
        $this->command->info("Successfully updated {{ $updatedCount }} categories using slug matching.");
    }}
}}
"""

with open('backend/database/seeders/ProductionSlugCodeSeeder.php', 'w', encoding='utf-8') as f:
    f.write(seeder_content)

print('Generated backend/database/seeders/ProductionSlugCodeSeeder.php')
