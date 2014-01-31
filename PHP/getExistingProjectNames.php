<?php
include_once("CommonMethods.php");

// Go back to the main directory.
chdir("../");

// Setup return object.
$returnValue = getInitialReturnValue();

$projects = getExistingsProjects();

$returnValue["projects"] = $projects;

echo json_encode($returnValue);

?>