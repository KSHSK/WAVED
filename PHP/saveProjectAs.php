<?php
include_once('connect.php');
include_once("CommonMethods.php");
include_once('Project.php');

// Setup return object.
$returnValue = getInitialReturnValue();

$oldProjectName = $_POST["oldProject"];
$projectName = $_POST["project"];
$projectState = $_POST["state"];

// Make sure the project name is valid.
if (!validProjectName($projectName, $returnValue)) {
    reportReturnValue($returnValue);
    return;
}

// Make sure the project that will be copied exists.
if (!projectExists($oldProjectName)) {
    setReturnValueError($returnValue, "This original project does not exist.");
    reportReturnValue($returnValue);
    return;
}

// Check if the project already exists.
if (projectExists($projectName)) {
    setReturnValueError($returnValue, "This project already exists.");
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
