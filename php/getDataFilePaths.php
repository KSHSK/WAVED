<?php

chdir("../");

$dir = "data/";
$filenames = scandir($dir);
$fullFilenames = array();

foreach ($filenames as $filename) {
    if ($filename == "." || $filename == "..") {
        continue;
    }
    array_push($fullFilenames, $dir . $filename);
}

echo json_encode($fullFilenames);

?>