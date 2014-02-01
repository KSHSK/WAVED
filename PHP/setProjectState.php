<?php
    include_once('connect.php');
    include_once('SQLiteProjectSerializer.php');

    // Grab project and state value from parameters
    $project = $_POST['project'];
    $state = $_POST['state'];

    // Bad request without project or state, 400
    if(empty($project) || empty($state))
    {  
        header("HTTP/1.0 400 Bad Request");
    }
    // Attempt to set the value
    else
    {
        $serializer = new SQLiteProjectSerializer($db);
        $success = $serializer->set($project, $state);


        // Something went wrong
        if(!$success)
        {
            header("HTTP/1.0 500 Internal Error");
        }
    }
?>
