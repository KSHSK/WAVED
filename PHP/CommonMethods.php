<?php
include_once("connect.php");
include_once('Project.php');


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
function getDataFolder($projectName, $offset = "") {
    return $offset . "projects/" . $projectName . "/data/";
}

/**
 * Determines if $fileName is in $projectName's data folder
 * @param String $projectName
 * @param String $fileName
 */
function projectHasDataFile($projectName, $fileName) {
    $dataFolder = getDataFolder($projectName);

    // Scan the $dataFolder directory to ensure $fileName doesn't navigate to other directories.
    $files = scandir($dataFolder);
    
    return in_array($fileName, $files) && is_file($dataFolder . $fileName);
}

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

function createProject(&$returnValue, $projectName) {
    global $projectSerializer;
    
    // Make sure the project name is valid.
    if (!validProjectName($projectName, $returnValue)) {
        return false;
    }

    // Check if the project already exists.
    if (projectExists($projectName)) {
        setReturnValueError($returnValue, "This project already exists.");
        return false;
    }
    
    // Create the directory for the project.
    $success = mkdir("../projects/" . $projectName, 0755);
    
    if ($success) {
        $success = mkdir("../projects/" . $projectName . "/data", 0755);
    }
    
    if (!$success) {
        setReturnValueError($returnValue, "Unknown error creating new project directory.");
        return false;
    }
    
    $projectState = "{}";
    $project = Project::create($projectName, $projectState);
    $success = $projectSerializer->set($project);
    
    if(!$success) {
        // Attempt to remove traces from the filesystem
        rmdir("../projects/". $projectName . "/data");
        rmdir("../projects/". $projectName);
    
        // Report error
        setReturnValueError($returnValue, "Unknown error registering new project.");
        return false;
    }

    // Set project variables.
    $returnValue["projectName"] = $projectName;
    $returnValue["projectState"] = $projectState;
    $returnValue["dataFolder"] = getDataFolder($projectName);
    
    return true;
}

function saveProject(&$returnValue, $projectName, $projectState) {
    global $projectSerializer;

    // Check if the project exists.
    if (empty($projectName)) {
        setReturnValueError($returnValue, "A project name must be given.");
        return false;
    }
    else if (!projectExists($projectName)) {
        setReturnValueError($returnValue, "This project does not exist.");
        return false;
    }
    
    // Check that a state was given
    if (empty($projectState)) {
        setReturnValueError($returnValue, "A project state must be given.");
        return false;
    }
    
    // Create and serialize Project object
    $project = Project::create($projectName, $projectState);
    $success = $projectSerializer->set($project);
    
    if(!$success) {
        setReturnValueError($returnValue, "Unknown error updating project.");
        return false;
    }
    
    // Set the name of the project
    $returnValue["projectName"] = $projectName;
    return true;
}

// Copies the data files from $fromProjectName's data folder to $toProjectName's data folder.
function copyDataFiles($fromProjectName, $toProjectName) {
    $offset = "../";
    
    $fromDataFolder = getDataFolder($fromProjectName, $offset);
    $toDataFolder = getDataFolder($toProjectName, $offset);
    
    $contents = array_diff(scandir($fromDataFolder), array('.', '..'));
    
    
    foreach ($contents as $file) {
        copy($fromDataFolder . $file, $toDataFolder . $file);
    }
}

?>