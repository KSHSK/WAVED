<?php
include_once('ISerializer.php');
include_once('IDeserializer.php');

/*
    Class to (de)serialize application state
    to SQLite3 database

    TODO: Bind statements instead of injecting strings
*/
class SQLiteStateSerializer implements ISerializer, IDeserializer
{
    const TABLE = 'state';
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function set($app, $json)
    {
        // Hard code user for now
        $userid=1;

        // Try an update than insert
        $updateSQL = "UPDATE " . self::TABLE . " SET json = '$json' WHERE application='$app'";
        $insertSQL = "INSERT OR IGNORE INTO  " . self::TABLE . "(application, json, userid) values('$app', '$json', $userid)";

        // Execute commands and return any error codes
        if (!$this->db->exec($updateSQL))
        {
            return FALSE;
        }
        else if ($this->db->changes() > 0)
        {
            return TRUE;
        }

        return $this->db->exec($insertSQL);
    }

    public function get($app)
    {
        $query = "SELECT json FROM  " . self::TABLE . " WHERE application = '$app'";
        return $this->db->querySingle($query);
    }
}
?>
