<?php
    include_once('connect.php');
    include_once('SQLiteStateSerializer.php');
    header('Content-type: application/json');

    $deserializer = new SQLiteStateSerializer($db);
    $list = $deserializer->listId();

    // Spit out found value, 200
    echo json_encode($list);
?>

