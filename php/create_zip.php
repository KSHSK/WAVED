<?php

// Get the name of the demo.
$demo = $_POST["demo"];
if ($demo == "") {
   echo "App name cannot be blank.";   
   return;
}

// Get the HTML
$html = $_POST["html"];
if ($html == "") {
   echo "HTML cannot be blank.";
   return;
}

// Get the data files.
$data_files = $_POST["data_files"];
if ($data_files == null) {
   // Default to no data files.
   $data_files = array();
}

// Go back to the main directory.
chdir("../");

$split = str_split($demo);
$folder = $demo . (end($split) == "/" ? "" : "/");
$zipName = $demo . '.zip';

$generated_location = "generated_files/";

$zipPath = $generated_location . $zipName;

// Create the zipfile in the $generated_location directory.
// The zip folder will contain the a root directory named $demo, containing the generated HTML file, and all data files.
$zip = new ZipArchive;
$zip->open($zipPath, ZipArchive::CREATE | ZIPARCHIVE::OVERWRITE);
$zip->addEmptyDir($folder);

// Add the HTML file.
$zip->addFromString($folder . "index.html", $html);

// Add all of the data files.
foreach ($data_files as $file) {
   $zip_path = $folder . $file;
   $zip->addFile($file, $zip_path);
}

$zip->close();

if (!file_exists($zipPath)) {
   echo "Failed to create zip file.";
   return;
}

echo "success";
?>