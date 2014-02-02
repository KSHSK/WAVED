<?php
include_once('connect.php');
include_once("CommonMethods.php");
include_once('SQLiteProjectSerializer.php');

/**
 * Checks to see if the project name is valid.
 * @param string $projectName
 * @param array $returnValue
 * @return boolean
 */
function validProjectName($projectName, &$returnValue) {
    if ($projectName === null) {
        setReturnValueError($returnValue, "The project name is required.");
        return false;
    }
    
    $len = strlen($projectName);
    if ($len < 1 || $len > 50) {
        setReturnValueError($returnValue, "The project name must be between 1 and 50 characters.");
        return false;
    }
    
    $pattern = "/^[a-zA-Z0-9_\- ]+$/";
    if (preg_match($pattern, $projectName) !== 1) {
        setReturnValueError($returnValue, "The project name can only include alphanumeric characters, hyphens (-), underscores (_), and spaces.");
        return false;
    }
    
    return true;
}


/* Main Code. */

// Setup return object.
$returnValue = getInitialReturnValue();

$projectName = $_POST["project"];

// Make sure the project name is valid.
if (!validProjectName($projectName, $returnValue)) {
    reportReturnValue($returnValue);
    return;
}

// Go back to the main directory.
chdir("../");

// Check if the project already exists.
if (projectExists($projectName)) {
    setReturnValueError($returnValue, "This project already exists.");
    reportReturnValue($returnValue);
    return;
}

// Create the directory for the project.
$success = mkdir("projects/" . $projectName, 0755);

if ($success) {
    $success = mkdir("projects/" . $projectName . "/data", 0755);
}

if (!$success) {
    setReturnValueError($returnValue, "Unknown error creating new project directory.");
    reportReturnValue($returnValue);
    return;
}


// TODO: Replace with real initial state
$projectState="Dummy State";
$serializer = new SQLiteProjectSerializer($db);
$success = $serializer->set($projectName, $projectState);

if(!$success) {
    // Attempt to remove traces from the filesystem
    rmdir("projects/". $projectName . "/data");
    rmdir("projects/". $projectName);

    // Report error
    setReturnValueError($returnValue, "Unknown error creating new project database entry.");
    reportReturnValue($returnValue);
    return;
}

// Set the name and state of the project
$returnValue["projectName"] = $projectName;
$returnValue["projectState"] = $projectState;

reportReturnValue($returnValue);
?>
