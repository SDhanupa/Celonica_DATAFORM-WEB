<?php
foreach(App\Models\Category::all() as $c) {
    echo $c->slug . ' - ' . $c->name_en . PHP_EOL;
}
