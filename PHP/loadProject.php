<?php
include_once("CommonMethods.php");

// Setup return object.
$returnValue = getInitialReturnValue();

$projectName = $_POST["project"];

// Check if the project already exists.
if (!projectExists($projectName)) {
    setReturnValueError($returnValue, "This project does not exist.");
    reportReturnValue($returnValue);
    return;
}

// Set project variables.
$returnValue["projectName"] = $projectName;
$returnValue["projectState"] = getProjectState($projectName);
$returnValue["dataFolder"] = getDataFolder($projectName);

reportReturnValue($returnValue);
?>
