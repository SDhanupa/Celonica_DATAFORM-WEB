<?php
$gn = \App\Models\GramaNiladhari::with(['police', 'postOffice', 'pProvince', 'pDistrict', 'pGn'])->find(11141);
echo json_encode($gn->toArray(), JSON_PRETTY_PRINT);
