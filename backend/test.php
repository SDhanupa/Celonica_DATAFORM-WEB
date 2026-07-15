<?php
$ch = curl_init("http://localhost:8000/graphql");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["query" => "{ pDistrict(id: 1) { id gramaNiladharis { id pGn { id populationBoth } } } }"]));
$response = curl_exec($ch);
curl_close($ch);
echo json_encode(json_decode($response), JSON_PRETTY_PRINT);

