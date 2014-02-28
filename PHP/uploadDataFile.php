<?php

$file = $_FILES["file"];

// Setup return object.
$returnValue = array("errorMessage" => "", "success" => true, "filePath" => "");

if ($file == null) {
   $returnValue["success"] = false;
   $returnValue["errorMessage"] = "File is missing.";
   echo json_encode($returnValue);
   return;
}

// Go back to the main directory.
chdir("../");

// TODO: Figure out how to get the project name.
// $projectName = $file["projectName"];
$projectName = "abc";

$fileName = $file["name"];
$filePath = "projects/" . $projectName . "/data/" . $fileName;
$tempName = $file["tmp_name"];

if (file_exists($filePath)) {
   $returnValue["success"] = false;
   $returnValue["errorMessage"] = "This file already exists.";
   echo json_encode($returnValue);
   return;
}

$success = move_uploaded_file($tempName, $filePath);
if (!$success) {
   $returnValue["success"] = false;
   $returnValue["errorMessage"] = "Failed to create file.";
   echo json_encode($returnValue);
   return;
}

$returnValue["filePath"] = $filePath;
echo json_encode($returnValue);

?>