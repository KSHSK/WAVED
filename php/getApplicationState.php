<?php
    include_once('connect.php');
    include_once('SQLiteStateSerializer.php');
    header('Content-type: application/json');

    // Grab application from GET parameters
    $application = $_GET['application'];

    // Bad request without application, 400
    if(empty($application))
    {
        header("HTTP/1.0 400 Bad Request");
    }
    // Look up value for application
    else
    {  
        $deserializer = new SQLiteStateSerializer($db);
        $json = $deserializer->get($application);

        // Nothing was found, 404
        if(empty($json))
        {
            header("HTTP/1.0 404 Not Found");
        }
        // Spit out found value, 200
        else
        {
            echo $json;
        }
    }
?>
