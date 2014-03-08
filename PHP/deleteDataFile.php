<?php
include_once("CommonMethods.php");

$projectName = $_POST["projectName"];
$fileName = $_POST["fileName"];

// Setup return object.
$returnValue = getInitialReturnValue();

if (empty($projectName)) {
    setReturnValueError($returnValue, "A project name must be given.");
    reportReturnValue($returnValue);
    return;
}

if (empty($fileName)) {
    setReturnValueError($returnValue, "A filename must be given.");
    reportReturnValue($returnValue);
    return;
}

if (!projectExists($projectName)) {
    setReturnValueError($returnValue, "This project does not exist.");
    reportReturnValue($returnValue);
    return;
}

// Go back to the main directory.
chdir("../");
$filePath = realpath(getDataFolder($projectName) . $fileName);

if (!is_file($filePath)) {
    setReturnValueError($returnValue, "This file does not exist.");
    reportReturnValue($returnValue);
    return;
}

if (!projectHasDataFile($projectName, $fileName)) {
    setReturnValueError($returnValue, "This filename is invalid.");
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