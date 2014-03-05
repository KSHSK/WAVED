<?php
include_once('connect.php');
include_once("CommonMethods.php");
include_once('Project.php');

// Setup return object.
$returnValue = getInitialReturnValue();

$projectName = $_POST["project"];
$projectState = $_POST["state"];


// Check if the project exists.
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

// Check that a state was given
if (empty($projectState)) {
    setReturnValueError($returnValue, "A project state must be given.");
    reportReturnValue($returnValue);
    return;
}

// Create and serialize Project object
$project = Project::create($projectName, $projectState);
$success = $projectSerializer->set($project);

if(!$success) {
    setReturnValueError($returnValue, "Unknown error updating project.");
    reportReturnValue($returnValue);
    return;
}

// Set the name of the project
$returnValue["projectName"] = $projectName;

reportReturnValue($returnValue);
?>
