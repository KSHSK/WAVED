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
    $returnValue = createProject($returnValue, $projectName);
    reportReturnValue($returnValue);
}
catch (Exception $e) {
    reportError();
}

?>
