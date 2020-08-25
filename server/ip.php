<?php
if ($_SERVER["HTTP_X_FORWARDED_FOR"]) {
    $client = $_SERVER["HTTP_X_FORWARDED_FOR"];
} else {
    $client = $_SERVER["REMOTE_ADDR"];
}
echo $client;
?>