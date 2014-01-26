<?php
include_once('ISerializer.php');
include_once('IDeserializer.php');

/*
    Class to (de)serialize project
    to SQLite3 database

    TODO: Bind statements instead of injecting strings
    TODO: modified
*/
class SQLiteProjectSerializer implements ISerializer, IDeserializer
{
    const TABLE = 'project';
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function set($name, $state)
    {
        // Hard code user for now
        $userid=1;

        // Try an update than insert
        $updateSQL = "UPDATE " . self::TABLE . " SET state = '$state' WHERE name='$name'";
        $insertSQL = "INSERT OR IGNORE INTO  " . self::TABLE . "(name, state) values('$name', '$state')";

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

    public function get($name)
    {
        $query = "SELECT state FROM  " . self::TABLE . " WHERE name = '$name'";
        return $this->db->querySingle($query);
    }

    public function listId()
    {
        $row = array();
        $query = "SELECT name FROM  " . self::TABLE;
        $result = $this->db->query($query);

        while ($res = $result->fetchArray(SQLITE3_NUM))
        {
            array_push($row, $res[0]);
        }

        return $row;
    }
}
?>
