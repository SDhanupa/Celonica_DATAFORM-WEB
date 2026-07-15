<?php
$results = DB::select("SELECT id, name FROM gn_divisions WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(79.8863, 6.9318), 4326))");
echo json_encode($results);
