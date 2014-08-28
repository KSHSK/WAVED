<?php

$fileName = $_GET["fileName"];

if ($fileName == "") {
   echo "Filename cannot be blank.";   
   return;
}

// Go back to the main directory.
chdir("../");

// This is the general download location.
chdir("generated_files/");

if (!file_exists($fileName)) {
   echo "Failed to download zip file.";
   return;
}

header('Content-Type: application/zip');
header('Content-disposition: attachment; filename=' . $fileName);
header('Content-Length: ' . filesize($fileName));
readfile($fileName);
?>