<?php
include_once('SQLiteProjectSerializer.php');

class Serializer
{
    // Modify this depending on how you are hosting
    // the website
    private static $DB_PATH='../DB/waved.db';
    private static $_projectSerializer;

    private static function initProjectSerializer() {
        $_db = new SQLite3(self::$DB_PATH);
        self::$_projectSerializer = new SQLiteProjectSerializer($_db);
    }

    public static function projectSerializer() {
        if (!self::$_projectSerializer) {
            self::initProjectSerializer();
        }

        return self::$_projectSerializer;
    }
}
?>
