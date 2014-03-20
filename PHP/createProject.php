<?php
include_once("CommonMethods.php");

// Setup return object.
$returnValue = getInitialReturnValue();

$projectName = $_POST["project"];
createProject($returnValue, $projectName);
reportReturnValue($returnValue);

?>
