<?php
$file = 'backend/database/data/gm_divisions.json';
$data = file_get_contents($file);
$data = str_replace('"district_code":"LK60"', '"district_code":"LK61"', $data);
file_put_contents($file, $data);
echo "Fixed district_code LK60\n";
