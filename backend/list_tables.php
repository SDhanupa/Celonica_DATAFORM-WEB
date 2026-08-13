<?php
require __DIR__.'/vendor/autoload.php';
\ = require_once __DIR__.'/bootstrap/app.php';
\ = \->make(Illuminate\Contracts\Console\Kernel::class);
\->bootstrap();
\ = DB::select(\"SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'\");
foreach(\ as \) {
    echo \->tablename . \"\n\";
}
