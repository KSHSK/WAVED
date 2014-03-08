<?php
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
    global $projectSerializer;
    return $projectSerializer->exists($projectName);
}

/**
 * Returns all existing projects.
 */
function getExistingsProjects() {
    global $projectSerializer;
    $projects = $projectSerializer->getAll();
    $getName = function($project) { return $project->getName(); };

    // Map through the array, returning only the name
    // for each project
    return array_map($getName, $projects);
}

/**
 * Returns the stored state of a project.
 * @param string $projectName
 */
function getProjectState($projectName) {
    global $projectSerializer;
    return $projectSerializer->get($projectName)->getState();
}

/**
 * Recursivley removes a directory.
 * @param string $baseDir
 */
function recursiveRmdir($baseDir) {
    // Find directory contents, ignoring current directory
    // and parent directory
    $contents = array_diff(scandir($baseDir), array('.', '..'));

    // Delete each of the directory contents
    foreach ($contents as $content) {
        $content = "$baseDir/$content";
        if (is_dir($content)) {
            recursiveRmdir($content);
        }
        else {
            unlink($content);
        }
    }

    // Remove the now empty directory
    return rmdir($baseDir);
}

/**
 * Returns the data folder for the given project.
 * @param String $projectName
 */
function getDataFolder($projectName) {
    return "projects/" . $projectName . "/data/";
}

/**
 * Determines if $file is in $projectName's data folder
 * @param String $projectName
 * @param String $file
 */
function projectHasDataFile($projectName, $file) {
    $dataFolder = getDataFolder($projectName);

    // Scan the $dataFolder directory to ensure $file doesn't go into other directories.
    $files = array_diff(scandir($dataFolder), array('.', '..'));
    foreach ($files as $fileToCheck) {
        if ($fileToCheck === $file && is_file($dataFolder . $fileToCheck)) {
            return true;
        }
    }
    
    return false;
}
?>
