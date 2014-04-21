<?php
include_once("Serializer.php");
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
 * Echos a return value for an error
 */
function reportError($errorMessage = "An unknown error occured.") {
    $returnValue = getInitialReturnValue();
    setReturnValueError($returnValue, $errorMessage);
    reportReturnValue($returnValue);
}

/**
 * Checks to see if the project exists.
 * @param string $projectName
 */
function projectExists($projectName) {
    return Serializer::projectSerializer()->exists($projectName);
}

/**
 * Returns all existing projects.
 */
function getExistingsProjects() {
    $projects = Serializer::projectSerializer()->getAll();
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
    return Serializer::projectSerializer()->get($projectName)->getState();
}

/**
 * Recursivley removes a directory.
 * @param string $baseDir
 */
function recursiveRmdir($baseDir) {
    // Don't fail if the directory has already been removed
    if (!file_exists($baseDir)) {
        return TRUE;
    }

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
 * @param string $projectName The name of the project.
 * @param array $returnValue The initial return value.
 * @return array $returnValue with updated values.
 */
function validProjectName($projectName, $returnValue) {
    if ($projectName === null) {
        setReturnValueError($returnValue, "The project name is required.");
        return $returnValue;
    }

    $len = strlen($projectName);
    if ($len < 1 || $len > 50) {
        setReturnValueError($returnValue, "The project name must be between 1 and 50 characters.");
        return $returnValue;
    }

    $pattern = "/^[a-zA-Z0-9_\- ]+$/";
    if (preg_match($pattern, $projectName) !== 1) {
        setReturnValueError($returnValue, "The project name can only include alphanumeric characters, hyphens (-), underscores (_), and spaces.");
        return $returnValue;
    }

    return $returnValue;
}

/**
 * Creates a new project with the name $projectName.
 * @param array $returnValue The return value to set errors and information on.
 * @param string $projectName The name of the new project.
 * @return array $returnValue with updated values.
 */
function createProject($returnValue, $projectName) {
    // Make sure the project name is valid.
    $returnValue = validProjectName($projectName, $returnValue);
    if (!$returnValue["success"]) {
        return $returnValue;
    }

    // Check if the project already exists.
    if (projectExists($projectName)) {
        setReturnValueError($returnValue, "This project already exists.");
        return $returnValue;
    }
    
    // Create the directory for the project.
    $success = mkdir("../projects/" . $projectName, 0755);
    
    $dataFolder = "../projects/" . $projectName . "/data/";
    
    if ($success) {
        // Create the directory for the data files.
        $success = mkdir($dataFolder, 0755);
    }
    
    if ($success) {
        // Copy 'states.json' to the project's data folder.
        $success = copy("../data/" . "states.json", $dataFolder . "states.json");
    }
    
    if (!$success) {
        setReturnValueError($returnValue, "Unknown error creating new project directory.");
        return $returnValue;
    }
    
    $project = Project::create($projectName);
    $success = Serializer::projectSerializer()->set($project);
    
    if(!$success) {
        // Attempt to remove traces from the filesystem
        rmdir("../projects/". $projectName . "/data");
        rmdir("../projects/". $projectName);
    
        // Report error
        setReturnValueError($returnValue, "Unknown error registering new project.");
        return $returnValue;
    }

    // Set project variables.
    $returnValue["projectName"] = $projectName;
    $returnValue["projectState"] = $project->getState();
    $returnValue["dataFolder"] = getDataFolder($projectName);
    
    return $returnValue;
}

/**
 * Saves the project $projectName with the state $projectState.
 * @param array $returnValue The return value to set errors and information on.
 * @param string $projectName The name of the new project.
 * @param string $projectState The new state of the project.
 * @return array $returnValue with updated values.
 */
function saveProject($returnValue, $projectName, $projectState) {
    // Check if the project exists.
    if (empty($projectName)) {
        setReturnValueError($returnValue, "A project name must be given.");
        return $returnValue;
    }
    else if (!projectExists($projectName)) {
        setReturnValueError($returnValue, "This project does not exist.");
        return $returnValue;
    }
    
    // Check that a state was given
    if (empty($projectState)) {
        setReturnValueError($returnValue, "A project state must be given.");
        return $returnValue;
    }
    
    // Create and serialize Project object
    $project = Project::create($projectName, $projectState);
    $success = Serializer::projectSerializer()->set($project);
    
    if(!$success) {
        setReturnValueError($returnValue, "Unknown error updating project.");
        return $returnValue;
    }
    
    // Set the name of the project
    $returnValue["projectName"] = $projectName;
    return $returnValue;
}

/**
 * Copies the data files from $fromProjectName's data folder to $toProjectName's data folder.
 * @param array $returnValue The return value to set errors and information on.
 * @param string $fromProjectName The name of the project currently with data files.
 * @param string $toProjectName The name of the project to which the data files are copied.
 * @return array $returnValue with updated values.
 */
function copyDataFiles($returnValue, $fromProjectName, $toProjectName) {
    $offset = "../";
    
    $fromDataFolder = getDataFolder($fromProjectName, $offset);
    $toDataFolder = getDataFolder($toProjectName, $offset);
    
    $contents = array_diff(scandir($fromDataFolder), array('.', '..'));
    
    $success = true;
    foreach ($contents as $file) {
        $success = copy($fromDataFolder . $file, $toDataFolder . $file) && $success;
    }
    
    if (!$success) {
        setReturnValueError($returnValue, "Could not copy data files to new project.");
    }
    
    return $returnValue;
}

?>
