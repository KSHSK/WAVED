/**
 * Create the WAVED Controller and add it to the controllers module.
 */
define([
        './module',
        '../WAVED',
        '../UnsavedChanges',
        '../LoadProject',
        'jquery'
    ], function(
        controllers, 
        WAVED, 
        UnsavedChangesModule,
        LoadProjectModule, 
        $) {
    
    controllers.controller('WAVEDCtrl', function ($scope) {
    
        $scope.widgets = [];
        $scope.projectName = "";
    
        $scope.selectedWidgetChanged = function() {
            console.log('Selected Widget: ' + $scope.selectedWidget.name);
        };
        
        $scope.logTest = function() {
            console.log('test');
        };
        
        // New Project
        
        var createNewProjectDialog = $('#create-new-project-dialog');
        var createNewProjectNameInput = $('#create-new-project-name');
        var createNewProjectError = $('#create-new-project-error');
        
        /**
         * If the project is clean, the new project dialog is opened.
         * If the project is dirty, the unsaved changes must be handled before
         * the new project dialog is opened.
         */
        var tryToCreateNewProject = function() {

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
                openCreateNewProjectDialog(projectCreated);
            });
            
            return projectCreated.promise();
        };
        
        /**
         * Open the dialog for creating a new project.
         */
        var openCreateNewProjectDialog = function(projectCreated) {
            
            // TODO: use scope project name variable
            // Clear the input.
            createNewProjectNameInput.val("");
            
            // TODO: Use AngularJS Validation
            createNewProjectError.text("");
            
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
                            createNewProject(projectCreated);
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
        };
        
        /**
         * Actually submit the createProject request.
         */
        var createNewProject = function(projectCreated) {
            
            // Don't allow leading or trailing white space.
            var projectName = createNewProjectNameInput.val().trim();
            createNewProjectNameInput.val(projectName);

            $.ajax({
                type: "POST",
                url: "PHP/createProject.php",
                data: {
                    "project": projectName
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        createNewProjectError.text("");
                        $scope.projectName = data.projectName;
                        $scope.$apply();
                        projectCreated.resolve();
                    }
                    else {
                        // Display error to user.
                        createNewProjectError.text(data.errorMessage);
                    }
                }
            });
        };
        
        /**
         * Open the welcome dialog.
         */
        var openWelcomeDialog = function() {
            
            var welcomeDialog = $("#welcome-dialog");
            
            welcomeDialog.dialog({
                resizable: false,
                height: 200,
                width: 300,
                modal: true,
                closeOnEscape: false,
                buttons: {
                    "New Project": function() {
                        var projectCreated = tryToCreateNewProject();
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
        };
        
        openWelcomeDialog();
        
        // Assign functions to the scope that need to be called from DOM elements. (e.g. from the ng-click attribute).
        $scope.tryToCreateNewProject = tryToCreateNewProject;
    });
});