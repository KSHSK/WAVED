<?php
include_once("CommonMethods.php");

// Setup return object.
$returnValue = getInitialReturnValue();

$projectName = $_POST["project"];

// TODO : remove once db existence is merged in
// Go back to the main directory.
chdir("../");

// Check if the project already exists.
if (!projectExists($projectName)) {
    setReturnValueError($returnValue, "This project does not exist.");
    reportReturnValue($returnValue);
    return;
}

// Set the name of the project
$returnValue["projectName"] = $projectName;

// Set state of project
$returnValue["projectState"] = getProjectState($projectName);

reportReturnValue($returnValue);
?>
