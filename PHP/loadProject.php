<?php
include_once("CommonMethods.php");

/*
    Avoid 500 errors and return proper JSON error response
*/
try {
    // Setup return object.
    $returnValue = getInitialReturnValue();

    $projectName = $_POST["project"];

    // Check if the project already exists.
    if (!projectExists($projectName)) {
        setReturnValueError($returnValue, "This project does not exist.");
        reportReturnValue($returnValue);
        return;
    }

    // Set project variables, note that the name may have changed cases.
    $project = getProject($projectName);
    $returnValue["projectName"] = $project->getName();
    $returnValue["projectState"] = $project->getState();
    $returnValue["dataFolder"] = getDataFolder($project->getName());

    reportReturnValue($returnValue);
}
catch (Exception $e) {
    reportError();
}
?>
