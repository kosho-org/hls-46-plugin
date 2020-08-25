<?php

date_default_timezone_set('Asia/Tokyo');

$time = date('Y-m-d H:i:s');
$day = date('Ymd');

$json_string = file_get_contents('php://input');
$json = json_decode($json_string,true);

file_put_contents('/tmp/result-'.$day.'.log', $time.','.$json_string."\n", FILE_APPEND );

?>