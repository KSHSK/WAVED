<?php
include_once('connect.php');
include_once("CommonMethods.php");
include_once('Project.php');

// Setup return object.
$returnValue = getInitialReturnValue();

$oldProjectName = $_POST["oldProject"];
$projectName = $_POST["project"];
$projectState = $_POST["state"];

// Create project
$success = createProject($returnValue, $projectName);

if (!$success) {
    reportReturnValue($returnValue);
    return;
}

// Save project state
$success = saveProject($returnValue, $projectName, $projectState);

if (!$success) {
    reportReturnValue($returnValue);
    return;
}

// Copy data files
copyDataFiles($oldProjectName, $projectName);

reportReturnValue($returnValue);
?>
