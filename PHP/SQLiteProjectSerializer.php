<?php
include_once('ISerializer.php');
include_once('IDeserializer.php');
include_once('Project.php');

/*
    Class to (de)serialize project
    to SQLite3 database
*/
class SQLiteProjectSerializer implements ISerializer, IDeserializer
{
    const TABLE = 'project';
    private $db;

    /**
     * Constructs a new SQLiteProjectSerializer object
     * @param SQLite3 $db
     */
    public function __construct($db)
    {
        $this->db = $db;
    }

    /**
     * Serializes the given project to the database
     * @param Project $project
     * @return boolean : TRUE on success, FALSE otherwise
     */
    public function set($project)
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

        $update->bindValue(':name', $project->getName(), SQLITE3_TEXT);
        $update->bindValue(':state', $project->getState(), SQLITE3_BLOB);
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

            $insert->bindValue(':name', $project->getName(), SQLITE3_TEXT);
            $insert->bindValue(':state', $project->getState(), SQLITE3_BLOB);
            $insert->bindValue(':user', $userid, SQLITE3_INTEGER);
            $insert->bindValue(':dateTime', $dateTime, SQLITE3_INTEGER);
            $insert->execute();
            $insert->close();

            return $this->db->changes() > 0;
        }

        return TRUE;
    }

    /**
     * Deletes the given project to the database
     * @param string $name
     * @return boolean : TRUE on success, FALSE otherwise
     */
    public function delete($name)
    {
        $delete = $this->db->prepare("DELETE FROM  " . self::TABLE . "
            WHERE name = :name");

        $delete->bindValue(':name', $name, SQLITE3_TEXT);
        $delete->execute();
        $delete->close();

        return $this->db->changes() > 0;
    }

    /**
     * Returns wheter a project with the given name exists
     * @param String $name
     * @return boolean
     */
    public function exists($name)
    {
        // Use COUNT(*) to find if a project exists by name
        $statement = $this->db->prepare("SELECT COUNT(*) FROM  " . self::TABLE .
            " WHERE name = :name LIMIT 1");
        $statement->bindValue(':name', $name, SQLITE3_TEXT);
        $value = $statement->execute()->fetchArray(SQLITE3_NUM);
        $statement->close();

        // A project exists if the count is greater
        // than zero
        return $value[0] > 0;
    }

    /**
     * Returns the Project that has the given name
     * @param string $name
     * @return Project
     */
    public function get($name)
    {
        $statement = $this->db->prepare("SELECT * FROM  " . self::TABLE . " WHERE name = :name");
        $statement->bindValue(':name', $name, SQLITE3_TEXT);
        $value = $statement->execute()->fetchArray(SQLITE3_ASSOC);
        $statement->close();

        $project = $this->projectFromRow($value);
        return $project;
    }

    /**
     * Returns a list of all existing projects
     * @return array
     */
    public function getAll()
    {
        $projects = array();
        $query = "SELECT * FROM  " . self::TABLE;
        $result = $this->db->query($query);

        while ($res = $result->fetchArray(SQLITE3_ASSOC))
        {
            $project = $this->projectFromRow($res);
            array_push($projects, $project);
        }

        return $projects;
    }

    /**
     * Helper function to create Project
     * object from associative array
     * @param array $row
     */
    private static function projectFromRow($row)
    {
        $project = Project::createFull($row['id'], $row['name'], $row['state'], $row['created'],
            $row['createdBy'], $row['lastModified'], $row['lastModifiedBy']);
        return $project;
    }
}
?>
