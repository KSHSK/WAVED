<?php
include_once('Serializer.php');
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

// Remove the directory for the project.
$success = recursiveRmdir("../projects/" . $projectName);

if (!$success) {
    setReturnValueError($returnValue, "Unknown error removing project directory.");
    reportReturnValue($returnValue);
    return;
}

// Remove the database entry for the project.
$success = Serializer::projectSerializer->delete($projectName);

if(!$success) {
    setReturnValueError($returnValue, "Unknown error deregistering project.");
    reportReturnValue($returnValue);
    return;
}

// Set the name and state of the project
$returnValue["projectName"] = $projectName;

reportReturnValue($returnValue);
?>
