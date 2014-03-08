<?php
include_once("CommonMethods.php");

$projectName = $_POST["projectName"];
$fileName = $_POST["fileName"];

// Setup return object.
$returnValue = getInitialReturnValue();

if ($projectName == null) {
    setReturnValueError($returnValue, "Project name is missing.");
    reportReturnValue($returnValue);
    return;
}

if ($fileName == null) {
    setReturnValueError($returnValue, "Filename is missing.");
    reportReturnValue($returnValue);
    return;
}

// Go back to the main directory.
chdir("../");

$filePath = realpath("projects/" . $projectName . "/data/" . $fileName);

if (!is_file($filePath)) {
    setReturnValueError($returnValue, "This file does not exist.");
    reportReturnValue($returnValue);
    return;
}

// Delete file.
$success = unlink($filePath);
if(!$success) {
    setReturnValueError($returnValue, "Could not delete file.");
    reportReturnValue($returnValue);
    return;
}

reportReturnValue($returnValue);

?>