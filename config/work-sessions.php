<?php

return [
    'inactivity_timeout' => (int) env('WORK_SESSION_INACTIVITY_TIMEOUT', 15),
    'heartbeat_interval' => (int) env('WORK_SESSION_HEARTBEAT_INTERVAL', 120),
];
