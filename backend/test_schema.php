<?php
$columns = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'gn_divisions'");
echo json_encode($columns);
