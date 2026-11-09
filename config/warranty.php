<?php

return [
    'allow_unregistered_claims' => env('WARRANTY_ALLOW_UNREGISTERED_CLAIMS', true),
    'ocr_timeout' => 20,
    'pdf_pages' => 3,
    'upload_max_kb' => 5120,
    'upload_lifetime_hours' => 24,
    'types' => ['dry-charge' => 'Dry-charge lead-acid', 'maintenance-free' => 'Maintenance-free (MF) lead-acid', 'lithium-ion' => 'Lithium (Life Series)', 'inverter' => 'Inverter'],
    'issues' => ["Doesn't hold charge", "Vehicle won't start", 'Short backup time', 'Bulging, leaking or damaged', 'Other'],
];
