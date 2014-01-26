<?php
    include_once('connect.php');
    include_once('SQLiteProjectSerializer.php');
    header('Content-type: application/json');

    // Grab project from GET parameters
    $project = $_GET['project'];

    // Bad request without project, 400
    if(empty($project))
    {
        header("HTTP/1.0 400 Bad Request");
    }
    // Look up value for project
    else
    {  
        $deserializer = new SQLiteProjectSerializer($db);
        $state = $deserializer->get($project);

        // Nothing was found, 404
        if(empty($state))
        {
            header("HTTP/1.0 404 Not Found");
        }
        // Spit out found value, 200
        else
        {
            echo $state;
        }
    }
?>
