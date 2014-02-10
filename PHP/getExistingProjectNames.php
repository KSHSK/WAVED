<?php
include_once("CommonMethods.php");

// Setup return object.
$returnValue = getInitialReturnValue();

$projects = getExistingsProjects();

$returnValue["projects"] = $projects;

echo json_encode($returnValue);

?>
