/**
 * A module for handling unsaved changes.
 */
 define([
        'angular',
        'WAVED',
        'jquery'
    ], function(
        angular,
        WAVED,
        $) {
     
     var UnsavedChangesModule = {
         unsavedChangesDialog: $('#unsaved-changes-dialog'),
         
         /**
          * Handles when the user tries to close the project when there are unsaved changes.
          */
         handleUnsavedChanges: function(deferred) {
             this.unsavedChangesDialog.dialog({
                 resizable: false,
                 height: 225,
                 width: 300,
                 modal: true,
                 buttons: {
                     "Discard Changes": function() {
                         deferred.resolve();
                         $(this).dialog("close");
                     },
                     "Cancel": function() {
                         deferred.reject();
                         $(this).dialog("close");
                     }
                 },
                 open: function() {
                     // Don't auto-select the "Discard Changes" option.
                     $('button', $(this).parent()).blur();
                 }
             });
             
         }
     };
     
     // Confirm if the user wants to leave when they have unsaved changes.
     $(window).on("beforeunload", function(event) {
         if (WAVED.isDirty()) {
             var message = "You have unsaved changes.";
             
             // IE/Firefox
             event.returnValue = message;
             
             // Webkit browsers.
             return message;
         }
     });
    
    return UnsavedChangesModule;
 });