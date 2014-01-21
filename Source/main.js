require([], function() {

    // UI Setup
    $(document).ready(function() {
        $('#new-button').button();
        $('#undo-button').button();
        $('#redo-button').button();
        $('#load-button').button();
        $('#save-button').button();
        $('#export-button').button();
        $('#refresh-button').button();
    
        $('#accordion').accordion({
            animate: false
        });
    
        $('input').addClass('ui-corner-all');
    });
});