<?php
include_once("CommonMethods.php");

// Setup return object.
$returnValue = getInitialReturnValue();

$projectName = $_POST["project"];

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

// TODO: set state of project and anything else needed.
$returnValue["projectState"] = "";

reportReturnValue($returnValue);
?>