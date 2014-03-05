/*global define*/
/**
 * A module for creating a new project.
 */
define([
        '../modules/NewProject',
        '../modules/LoadProject',
        'util/getQueryParamByName',
        'jquery'
    ], function(
        NewProject,
        LoadProject,
        getQueryParamByName,
        $) {
    'use strict';

    var Welcome = {
        welcomeDialog: $('#welcome-dialog'),

        /**
         * Starts the application
         */
        start: function(viewModel) {
            var self = this;

            var projectName = getQueryParamByName('project');
            if (projectName.length === 0) {
                // Remove the URL param for the project that couldn't be loaded.
                var url = location.href.split('?')[0];
                history.replaceState({}, '', url);

                // Open welcome dialog.
                self.openWelcomeDialog(viewModel);
            }
            else {
                var projectLoaded = $.Deferred();

                // Try to load the project.
                LoadProject.loadProject(projectLoaded, projectName, viewModel);

                // If this project failed to load...
                $.when(projectLoaded).fail(function() {
                    // Remove the URL param for the project that couldn't be loaded.
                    var url = location.href.split('?')[0];
                    history.replaceState({}, '', url);

                    // Open welcome window.
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
