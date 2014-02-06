/**
 * A module for creating a new project.
 */
 define([
        'angular',
        'WAVED',
        'UnsavedChanges',
        'jquery'
    ], function(
        angular,
        WAVED,
        UnsavedChangesModule, 
        $) {
 
    var NewProjectModule = {
        projectNameDiv: $('#project-name'),
        createNewProjectNameInput: $('#create-new-project-name'),
        createNewProjectError: $('#create-new-project-error'),
    
        /**
         * If the project is clean, the new project dialog is opened.
         * If the project is dirty, the unsaved changes must be handled before
         * the new project dialog is opened.
         */
        tryToCreateNewProject: function() {
            var self = this;
            var projectClean = $.Deferred();
        
            if (WAVED.getDirty() === true) {
                UnsavedChangesModule.handleUnsavedChanges(projectClean);
            }
            else {
                // Project is already clean.
                projectClean.resolve();
            }
        
            var projectCreated = $.Deferred();
            $.when(projectClean).done(function() {
                self.openCreateNewProjectDialog(projectCreated);
            });
        
            return projectCreated.promise();
        },
    
        /**
         * Open the dialog for creating a new project.
         */
        openCreateNewProjectDialog: function(projectCreated) {
            var self = this;
            var createNewProjectDialog = $('#create-new-project-dialog');
            
            // Clear the input.
            this.createNewProjectNameInput.val("");
        
            // TODO: Use AngularJS Validation
            this.createNewProjectError.text("");
        
            createNewProjectDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    "Create Project": {
                        text: "Create Project",
                        "class": "submit-button",
                        click: function() {
                            self.createNewProject(projectCreated);
                            $.when(projectCreated).done(function() {
                                createNewProjectDialog.dialog("close");
                            });
                        }
                    },
                    "Cancel": function() {
                        createNewProjectDialog.dialog("close");
                    }
                }
            });
        },
    
        /**
         * Actually submit the createProject request.
         */
        createNewProject: function(projectCreated) {
            var self = this;
            // Don't allow leading or trailing white space.
            var projectName = this.createNewProjectNameInput.val().trim();
            this.createNewProjectNameInput.val(projectName);

            $.ajax({
                type: "POST",
                url: "PHP/createProject.php",
                data: {
                    "project": projectName
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        self.createNewProjectError.text("");
                        var scope = angular.element(self.projectNameDiv).scope();
                        scope.$apply(function() {
                            scope.projectName = data.projectName;
                        });
                        projectCreated.resolve();
                    }
                    else {
                        // Display error to user.
                        self.createNewProjectError.text(data.errorMessage);
                    }
                }
            });
        },
    
        /**
         * Open the welcome dialog.
         */
        openWelcomeDialog: function() {
            var self = this;
            var welcomeDialog = $("#welcome-dialog");
        
            welcomeDialog.dialog({
                resizable: false,
                height: 200,
                width: 300,
                modal: true,
                closeOnEscape: false,
                buttons: {
                    "New Project": function() {
                        var projectCreated = self.tryToCreateNewProject();
                        $.when(projectCreated).done(function() {
                            welcomeDialog.dialog("close");
                        });
                    },
                    "Load Project": function() {
                        var projectLoaded = LoadProjectModule.tryToLoadExistingProject();
                        $.when(projectLoaded).done(function() {
                            welcomeDialog.dialog("close");
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
    
    return NewProjectModule;
 });