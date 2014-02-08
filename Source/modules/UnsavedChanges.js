/*global define*/
/**
 * A module for handling unsaved changes.
 */
define(['jquery'], function($) {
    'use strict';

    var UnsavedChangesModule = {
        unsavedChangesDialog: $('#unsaved-changes-dialog'),

        /**
         * Handles when the user tries to close the project when there are
         * unsaved changes.
         */
        handleUnsavedChanges: function(deferred) {
            // TODO: This should open a dialog giving the user the option to
            // "Discard Changes" / "Continue", or "Cancel"
            // "Cancel" should reject the deferred.
            // "Discard" should resolve the deferred and return.
        }
    };

    return UnsavedChangesModule;
});