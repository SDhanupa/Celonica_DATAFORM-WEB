<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;
use Illuminate\Support\Facades\File;

class SyncProdSlugs extends Command
{
    protected $signature = 'app:sync-prod-slugs {file}';
    protected $description = 'Sync category slugs from a production JSON export';

    public function handle()
    {
        $file = $this->argument('file');
        
        if (!File::exists($file)) {
            $this->error("File not found: {$file}");
            return;
        }

        $json = File::get($file);
        $slugsMap = json_decode($json, true);

        if (!$slugsMap) {
            $this->error("Invalid JSON format");
            return;
        }

        $updatedCount = 0;
        foreach ($slugsMap as $name => $prodSlug) {
            // Find local category with the exact same english name
            $localCat = Category::where('name_en', $name)->first();
            
            if ($localCat) {
                if ($localCat->slug !== $prodSlug) {
                    $localCat->slug = $prodSlug;
                    // Disable automatic slug generation if your model uses Sluggable
                    $localCat->save();
                    $this->info("Updated slug for '{$name}' -> {$prodSlug}");
                    $updatedCount++;
                }
            } else {
                $this->warn("Local category '{$name}' not found. Skipping.");
            }
        }

        $this->info("Successfully updated {$updatedCount} category slugs to match production!");
    }
}
