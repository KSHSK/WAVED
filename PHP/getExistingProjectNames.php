<?php
include_once("CommonMethods.php");

/*
    Avoid 500 errors and return proper JSON error response
*/
try {
    // Setup return object.
    $returnValue = getInitialReturnValue();

    $projects = getExistingsProjects();

    $returnValue["projects"] = $projects;

    reportReturnValue($returnValue);
}
catch (Exception $e) {
    reportError();
}

?>
