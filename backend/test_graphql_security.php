<?php
$query = '{
  "query": "query { users(first: 10) { data { id email } } }"
}';

$ch = curl_init('http://127.0.0.1:8000/graphql');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $query);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
