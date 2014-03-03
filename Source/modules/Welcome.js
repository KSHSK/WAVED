/*global define*/
/**
 * A module for creating a new project.
 */
define([
        '../modules/NewProject',
        '../modules/LoadProject',
        'jquery'
    ], function(
        NewProject,
        LoadProject,
        $) {
    'use strict';

    function getProjectNameFromUrl() {
        var params = location.search.split('?');
        if (params.length < 2) {
            // Invalid URL parameter.
            return "";
        }

        var projectParam = params[1].split('=');
        if (projectParam.length < 2 || projectParam[0] !== "project") {
            // Invalid URL parameter.
            return "";
        }

        return decodeURI(projectParam[1]);
    }

    var Welcome = {

        welcomeDialog: $('#welcome-dialog'),

        /**
         * Starts the application
         */
        start: function(viewModel) {
            var self = this;

            var projectName = getProjectNameFromUrl();
            if (projectName.length === 0) {
                // Open welcome dialog.
                self.openWelcomeDialog(viewModel);
            }
            else {
                var projectLoaded = $.Deferred();

                // Try to load the project.
                LoadProject.loadProject(projectLoaded, projectName, viewModel);

                // If this project failed to load, open the welcome dialog.
                $.when(projectLoaded).fail(function() {
                    self.openWelcomeDialog(viewModel);
                });
            }
        },

        /**
         * Open the welcome dialog.
         */
        openWelcomeDialog: function(viewModel) {
            var self = this;

            this.welcomeDialog.dialog({
                resizable: false,
                height: 200,
                width: 300,
                modal: true,
                closeOnEscape: false,
                buttons: {
                    'New Project': function() {
                        var projectCreated = NewProject.tryToCreateNewProject(viewModel);
                        $.when(projectCreated).done(function() {
                            self.welcomeDialog.dialog('close');
                        });
                    },
                    'Load Project': function() {
                        var projectLoaded = LoadProject.tryToLoadProject(viewModel);
                        $.when(projectLoaded).done(function() {
                            self.welcomeDialog.dialog('close');
                        });
                    }
                },
                open: function(event, ui) {
                    // Hide the close button so that the user must select a button.
                    $('.ui-dialog-titlebar-close', $(this).parent()).hide();

                    // Don't auto-select the 'New Project' option.
                    $('button', $(this).parent()).blur();
                }
            });
        }
    };

    return Welcome;
});
