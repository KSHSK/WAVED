<?php
include_once("CommonMethods.php");

$file = $_FILES["file"];
$projectName = $_POST["projectName"];

// Setup return object.
$returnValue = getInitialReturnValue();

if ($file == null) {
    setReturnValueError($returnValue, "File is missing.");
    reportReturnValue($returnValue);
    return;
}

// Go back to the main directory.
chdir("../");

$fileName = $file["name"];
$filePath = "projects/" . $projectName . "/data/" . $fileName;
$tempName = $file["tmp_name"];

if (file_exists($filePath)) {
    setReturnValueError($returnValue, "This file already exists.");
    reportReturnValue($returnValue);
    return;
}

$success = move_uploaded_file($tempName, $filePath);
if (!$success) {
    setReturnValueError($returnValue, "Failed to create file.");
    reportReturnValue($returnValue);
    return;
}

$returnValue["filePath"] = $filePath;
reportReturnValue($returnValue);

?>