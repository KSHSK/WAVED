<?php
include_once("CommonMethods.php");

$returnValue = getInitialReturnValue();

// Get the name of the demo.
$name = $_POST["name"];
if ($name == "") {
    setReturnValueError($returnValue, "App name cannot be blank.");
    reportReturnValue($returnValue);
    return;
}

// Get the HTML
$html = $_POST["html"];
if ($html == "") {
    setReturnValueError($returnValue, "HTML cannot be blank.");
    reportReturnValue($returnValue);
    return;
}

$css = $_POST["css"];
$js = $_POST["js"];

// Get the data files.

// The 'isset' check is necessary when hosting on Windows. Without this, '$data_files = $_POST["data_files"]' would fail.
if (isset($_POST["data_files"])) {
    $data_files = $_POST["data_files"];
}
else {
    $data_files = array();
}

if ($data_files == null) {
   // Default to no data files.
   $data_files = array();
}

// Go back to the main directory.
chdir("../");

$split = str_split($name);
$folder = $name . (end($split) == "/" ? "" : "/");
$zipName = $name . '.zip';

$generated_location = "generated_files/";
$data_file_location = $folder . "data/";

$zipPath = $generated_location . $zipName;

// Create the zipfile in the $generated_location directory.
// The zip folder will contain a root directory named $name, containing the generated HTML file and all data files.
$zip = new ZipArchive;
$zip->open($zipPath, ZipArchive::CREATE | ZIPARCHIVE::OVERWRITE);

// Add the HTML file.
$zip->addFromString("index.html", $html);
$zip->addFromString("WAVED.css", $css);
$zip->addFromString("WAVED.js", $js);

// Add all of the data files.
foreach ($data_files as $file) {
   $zip_path = $folder . $file;
   $zip->addFile('projects/' . $name . '/data/' . $file, 'data/' . $file);
}

$zip->close();

if (!file_exists($zipPath)) {
    setReturnValueError($returnValue, "This project does not exist.");
    reportReturnValue($returnValue);
    return;
}

reportReturnValue($returnValue);
?>