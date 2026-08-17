<?php

$url = 'https://ceystem.com/graphql';
$query = '{"query":"{ categories { id nameEn slug children { id nameEn slug children { id nameEn slug children { id nameEn slug children { id nameEn slug } } } } } }"}';

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => $query,
        'ignore_errors' => true
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    die("Error fetching from production\n");
}

echo "Fetched data successfully!\n";
file_put_contents(__DIR__ . '/prod_slugs.json', $result);
echo "Saved to prod_slugs.json\n";
