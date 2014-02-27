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


    // TODO check
    /**
     * Constructs a new Project object
     * @param int $id
     * @param string $name
     * @param string $state
     * @param string $created
     * @param int $createdBy
     * @param string $lastModified
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
     * @param string $state
     */
    public static function create($name, $state)
    {
        $instance = new self();
        $instance->name = $name;
        $instance->state = $state;
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

    /* Getters for datafields */
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
}
?>
