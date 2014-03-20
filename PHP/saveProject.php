<?php
include_once('connect.php');
include_once("CommonMethods.php");
include_once('Project.php');

// Setup return object.
$returnValue = getInitialReturnValue();

$projectName = $_POST["project"];
$projectState = $_POST["state"];

saveProject($returnValue, $projectName, $projectState);
reportReturnValue($returnValue);

?>
