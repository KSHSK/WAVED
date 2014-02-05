<?php
include_once('ISerializer.php');
include_once('IDeserializer.php');

/*
    Class to (de)serialize project
    to SQLite3 database
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
        $dateTime=time();

        // Try an update
        $update = $this->db->prepare("UPDATE " . self::TABLE . "
            SET state = :state,
                lastModified = :dateTime,
                lastModifiedBy = :user
            WHERE name = :name");

        $update->bindValue(':name', $name, SQLITE3_TEXT);
        $update->bindValue(':state', $state, SQLITE3_BLOB);
        $update->bindValue(':user', $userid, SQLITE3_INTEGER);
        $update->bindValue(':dateTime', $dateTime, SQLITE3_INTEGER);
        $update->execute();
        $update->close();

        // Try an insert
        if ($this->db->changes() <= 0)
        {
            $insert = $this->db->prepare("INSERT INTO " . self::TABLE .
                "(name, state, created, createdBy, lastModified, lastModifiedBy)
                values(:name, :state, :dateTime, :user, :dateTime, :user)");

            $insert->bindValue(':name', $name, SQLITE3_TEXT);
            $insert->bindValue(':state', $state, SQLITE3_BLOB);
            $insert->bindValue(':user', $userid, SQLITE3_INTEGER);
            $insert->bindValue(':dateTime', $dateTime, SQLITE3_INTEGER);
            $insert->execute();
            $insert->close();

            return $this->db->changes() > 0;
        }

        return TRUE;
    }

    public function get($name)
    {
        $statement = $this->db->prepare("SELECT state FROM  " . self::TABLE . " WHERE name = :name");
        $statement->bindValue(':name', $name, SQLITE3_TEXT);
        $value = $statement->execute()->fetchArray(SQLITE3_NUM);
        $statement->close();

        return $value[0];
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
