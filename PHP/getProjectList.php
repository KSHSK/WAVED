<?php
    include_once('connect.php');
    include_once('SQLiteProjectSerializer.php');
    header('Content-type: application/json');

    $deserializer = new SQLiteProjectSerializer($db);
    $list = $deserializer->listId();

    // Spit out found value, 200
    echo json_encode($list);
?>
