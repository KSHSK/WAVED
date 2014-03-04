<?php
/*
    Interface for retrieving an element
    from serialization by id
*/
interface IDeserializer
{
    public function exists($id);
    public function get($id);
    public function getAll();
}
?>
