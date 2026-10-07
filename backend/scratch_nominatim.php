<?php
$options = ['http' => ['header' => 'User-Agent: Celonica/1.0']];
$context = stream_context_create($options);
echo file_get_contents('https://nominatim.openstreetmap.org/reverse?lat=6.9343&lon=79.9808&format=json', false, $context);
