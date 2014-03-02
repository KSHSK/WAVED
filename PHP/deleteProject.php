<?php
include_once('connect.php');
include_once("CommonMethods.php");
include_once('Project.php');
/* Main Code. */

// Setup return object.
$returnValue = getInitialReturnValue();

$projectName = $_POST["project"];

// Check if the project already exists.
if (empty($projectName)) {
    setReturnValueError($returnValue, "A project name must be given.");
    reportReturnValue($returnValue);
    return;
}
else if (!projectExists($projectName)) {
    setReturnValueError($returnValue, "This project does not exist.");
    reportReturnValue($returnValue);
    return;
}

// Create the directory for the project.
$success = recursiveRmdir("../projects/" . $projectName);

if (!$success) {
    setReturnValueError($returnValue, "Unknown error removing project directory.");
    reportReturnValue($returnValue);
    return;
}

$success = $projectSerializer->delete($projectName);

if(!$success) {
    // Report error
    setReturnValueError($returnValue, "Unknown error registering new project.");
    reportReturnValue($returnValue);
    return;
}

// Set the name and state of the project
$returnValue["projectName"] = $projectName;

reportReturnValue($returnValue);
?>
