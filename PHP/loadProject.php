<?php
include_once("CommonMethods.php");

/*
    Avoid 500 errors and return proper
    JSON error response
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

    // Set project variables.
    $returnValue["projectName"] = $projectName;
    $returnValue["projectState"] = getProjectState($projectName);
    $returnValue["dataFolder"] = getDataFolder($projectName);

    reportReturnValue($returnValue);
}
catch (Exception $e) {
    reportError();
}
?>
