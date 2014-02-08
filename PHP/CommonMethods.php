<?php
include_once("SQLiteProjectSerializer.php");
include_once("connect.php");

/**
 * Initializes the return array with default values.
 * @return The initial return value array.
 */
function getInitialReturnValue() {
    $val = array();
    $val["errorMessage"] = "";
    $val["success"] = true;

    return $val;
}

/**
 * Sets success to false and sets the given error message.
 * @param array $returnValue
 * @param string $errorMessage
 */
function setReturnValueError(&$returnValue, $errorMessage) {
    $returnValue["success"] = false;
    $returnValue["errorMessage"] = $errorMessage;
}

/**
 * Echos the return value in valid form.
 * @param array $returnValue
 */
function reportReturnValue($returnValue) {
    echo json_encode($returnValue);
}

/**
 * Checks to see if the project exists.
 * @param string $projectName
 */
function projectExists($projectName) {
    return is_dir("projects/" . $projectName);
}

/**
 * Returns all existing projects.
 */
function getExistingsProjects() {
    global $db;
    $deserializer = new SQLiteProjectSerializer($db);
    return $deserializer->listId();
}

/**
 * Returns the stored state of a project.
 * @param string $projectName
 */
function getProjectState($projectName) {
    global $db;
    $deserializer = new SQLiteProjectSerializer($db);
    return $deserializer->get($projectName);
}
?>
