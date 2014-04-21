<?php
include_once("CommonMethods.php");
include_once('Project.php');

/*
    Avoid 500 errors and return proper
    JSON error response
*/
try {
    // Setup return object.
    $returnValue = getInitialReturnValue();

    $projectName = $_POST["project"];
    $projectState = $_POST["state"];

    $returnValue = saveProject($returnValue, $projectName, $projectState);
    reportReturnValue($returnValue);
}
catch (Exception $e) {
    reportError();
}

?>
