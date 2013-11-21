<?php
    include_once('connect.php');
    include_once('SQLiteStateSerializer.php');

    // Grab application and json value from parameters
    $application = $_POST['application'];
    $json = $_POST['json'];

    // Bad request without application or json, 400
    if(empty($application) || empty($json))
    {  
        header("HTTP/1.0 400 Bad Request");
    }
    // Attempt to set the value
    else
    {
        $serializer = new SQLiteStateSerializer($db);
        $success = $serializer->set($application, $json);

        // Something went wrong
        if(!$success)
        {
            header("HTTP/1.0 500 Internal Error");
        }
    }
?>
