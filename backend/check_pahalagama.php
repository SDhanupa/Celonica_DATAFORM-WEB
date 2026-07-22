<?php
$json = file_get_contents(__DIR__ . '/gn_population_updates2.json');
$data = json_decode($json, true);
$res = array_filter($data, fn($i) => strpos($i['gn_name'], 'Pahalagama') !== false && strpos($i['district'], 'Anuradhapura') !== false);
echo json_encode(array_values($res), JSON_PRETTY_PRINT);
