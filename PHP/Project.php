<?php
/*
    Class containing data for a project
*/
class Project
{
    private $id;
    private $name;
    private $state;
    private $created;
    private $createdBy;
    private $lastModified;
    private $lastModifiedBy;


    /**
     * Constructs a new Project object
     * @param integer $id
     * @param string $name
     * @param string $state
     * @param integer $created
     * @param int $createdBy
     * @param integer $lastModified
     * @param int $lastModifiedBy
     */
    public static function createFull($id, $name, $state, $created,
        $createdBy, $lastModified, $lastModifiedBy)
    {
        $instance = new self();
        $instance->id = $id;
        $instance->name = $name;
        $instance->state = $state;
        $instance->created = $created;
        $instance->createdBy = $createdBy;
        $instance->lastModified = $lastModified;
        $instance->lastModifiedBy = $lastModifiedBy;

        return $instance;
    }

    /**
     * Constructs a new Project object
     * @param string $name
     * @param string $state (initial state is assumed if none is given)
     */
    public static function create($name, $state = null)
    {
        $instance = new self();
        $instance->name = $name;
        $instance->state = $state ? $state : json_encode(array("name" => $name));
        return $instance;
    }

    /**
     * Setter for project state
     * @param string $state: Stringified JSON state of project
     */
    public function setState($state)
    {
        $this->state = $state;
    }

    /* Getters for data fields */
    public function getId()
    {
        return $this->id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getState()
    {
        return $this->state;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getCreatedBy()
    {
        return $this->createdBy;
    }

    public function getLastModified()
    {
        return $this->lastModified;
    }

    public function getLastModifiedBy()
    {
        return $this->lastModifiedBy;
    }

    public function toDetailsArray()
    {
        return array(
            "id" => $this->getId(),
            "name" => $this->getName(),
            "created" => $this->getCreated(),
            "createdBy" => $this->getCreatedBy(),
            "lastModified" => $this->getLastModified(),
            "lastModifiedBy" => $this->getLastModifiedBy()
        );
    }
}
?>
