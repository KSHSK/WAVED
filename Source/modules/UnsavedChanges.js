/**
 * A module for handling unsaved changes.
 */
define(['jquery'], function($) {
    'use strict';

    var unsavedChangesDialog = $('#unsaved-changes-dialog');
    var UnsavedChanges = {
        /**
         * Handles when the user tries to close the project when there are unsaved changes.
         */
        handleUnsavedChanges: function(deferred) {
            unsavedChangesDialog.dialog({
                resizable: false,
                height: 225,
                width: 300,
                modal: true,
                buttons: {
                    'Discard Changes': function() {
                        deferred.resolve();
                        $(this).dialog('close');
                    },
                    'Cancel': {
                        text: 'Cancel',
                        'class': 'cancel-button',
                        click: function() {
                            deferred.reject();
                            $(this).dialog('close');
                        }
                    }
                },
                open: function() {
                    // Select 'Cancel' by default.
                    $('.cancel-button', $(this).parent()).focus();
                }
            });

        }
    };

    return UnsavedChanges;
});
