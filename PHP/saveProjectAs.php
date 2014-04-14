<?php
include_once("CommonMethods.php");
include_once('Project.php');

/*
    Avoid 500 errors and return proper JSON error response
*/
try {
    // Setup return object.
    $returnValue = getInitialReturnValue();

    $oldProjectName = $_POST["oldProject"];
    $projectName = $_POST["project"];
    $projectState = $_POST["state"];

    // Create project
    $returnValue = createProject($returnValue, $projectName);

    if (!$returnValue["success"]) {
        reportReturnValue($returnValue);
        return;
    }

    // Save project state
    $returnValue = saveProject($returnValue, $projectName, $projectState);

    if (!$returnValue["success"]) {
        reportReturnValue($returnValue);
        return;
    }

    // Copy data files
    $returnValue = copyDataFiles($returnValue, $oldProjectName, $projectName);

    reportReturnValue($returnValue);
}
catch (Exception $e) {
    reportError();
}
?>
