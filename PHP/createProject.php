<?php
include_once("CommonMethods.php");

/**
 * Checks to see if the proejct name is valid.
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
    if ($len < 1 || $len > 255) {
        setReturnValueError($returnValue, "The project name must be between 1 and 255 characters.");
        return false;
    }
    
    $pattern = "/^[a-zA-Z0-9_\-]+$/";
    if (preg_match($pattern, $projectName) !== 1) {
        setReturnValueError($returnValue, "The project name can only include alphanumeric characters, hyphens (-), and underscores (_).");
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
mkdir("projects/" . $projectName, 0660);
mkdir("projects/" . $projectName . "/data", 0660);

// TODO: Other setup for a new project with the database.

reportReturnValue($returnValue);
?>