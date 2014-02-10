/**
 * A module for creating a new project.
 */
 define([
        'angular',
        'WAVED',
        '../modules/NewProject',
        '../modules/LoadProject',
        'jquery'
    ], function(
        angular,
        WAVED,
        NewProjectModule, 
        LoadProjectModule,
        $) {
 
    var WelcomeModule = {
        
        welcomeDialog: $("#welcome-dialog"),
    
        /**
         * Open the welcome dialog.
         */
        openWelcomeDialog: function() {
            var self = this;
        
            this.welcomeDialog.dialog({
                resizable: false,
                height: 200,
                width: 300,
                modal: true,
                closeOnEscape: false,
                buttons: {
                    "New Project": function() {
                        var projectCreated = NewProjectModule.tryToCreateNewProject();
                        $.when(projectCreated).done(function() {
                            self.welcomeDialog.dialog("close");
                        });
                    },
                    "Load Project": function() {
                        var projectLoaded = LoadProjectModule.tryToLoadProject();
                        $.when(projectLoaded).done(function() {
                            self.welcomeDialog.dialog("close");
                        });
                    }
                },
                open: function(event, ui) {
                    // Hide the close button so that the user must select a button.
                    $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                
                    // Don't auto-select the "New Project" option.
                    $('button', $(this).parent()).blur();
                }
            });
        }
    };
    
    return WelcomeModule;
 });