<?php
    include_once('SQLiteProjectSerializer.php');
    // Modify this depending on how you are hosting
    // the website
    $WEB_ROOT='../DB/';
    $db = new SQLite3($WEB_ROOT . 'waved.db');
    $projectSerializer = new SQLiteProjectSerializer($db);
?>
