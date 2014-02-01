<?php
/*
    Interface for retrieving an element
    from serialization by id
*/
interface IDeserializer
{
    public function get($id);
    public function listId();
}
?>
