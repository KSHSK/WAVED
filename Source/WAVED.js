define([], function() {

    /* ### Private WAVED Variables ### */
    
    // True if changes have been made since the last save; otherwise false.
    var _dirty = false;

    // The current name of the project.
    var _activeProjectName = "";
    
    // Has the application been started yet.
    var _started = false;
    
    /* ### Modules ### */

    /**
     * A module for when the application first launches.
     */
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
                        var projectLoaded = LoadProjectModule.tryToLoadExistingProject();
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
    
    /**
     * A module for creating a new project.
     */
    var NewProjectModule = {
        createNewProjectDialog: $('#create-new-project-dialog'),
        createNewProjectNameInput: $('#create-new-project-name'),
        createNewProjectError: $('#create-new-project-error'),
        
        
        /**
         * Open the dialog for creating a new project.
         */
        openCreateNewProjectDialog: function(projectCreated) {
            var self = this;
            
            // Clear the input.
            this.createNewProjectNameInput.val("");
            
            this.createNewProjectDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    "Create Project": function() {
                        self.createNewProject(projectCreated);
                        $.when(projectCreated).done(function() {
                            self.createNewProjectDialog.dialog("close");
                        });
                    },
                    "Cancel": function() {
                        self.createNewProjectDialog.dialog("close");
                    }
                }
            });
        },
        
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
         * Actually submit the createProject request.
         */
        createNewProject: function(projectCreated) {
            var self = this;
            
            // Don't allow leading or trailing white space.
            var projectName = this.createNewProjectNameInput.val().trim();
            this.createNewProjectNameInput.val(projectName);
            
            if (!validProjectName(projectName)) {
                return;
            }
            
            $.ajax({
                type: "POST",
                url: "PHP/createProject.php",
                data: {
                    "project": projectName
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        clearError(self.createNewProjectError);
                        setProjectName(data.projectName);
                        projectCreated.resolve();
                    }
                    else {
                        // Display error to user.
                        displayError(self.createNewProjectError, data.errorMessage);
                    }
                }
            });
        }
    };
    
    /**
     * A module for loading an existing project.
     */
    var LoadProjectModule = {
        tryToLoadExistingProject: function() {
            // TODO Implement me.
            
            var deferred = $.Deferred();
            
            // Remove this reject when implementing.
            deferred.reject();
            
            return deferred.promise();
        }
    };

    /**
     * A module for handling unsaved changes.
     */
    var UnsavedChangesModule = {
        unsavedChangesDialog: $('#unsaved-changes-dialog'),
        
        /**
         * Handles when the user tries to close the project when there are unsaved changes.
         */
        handleUnsavedChanges: function(deferred) {
            // TODO: This should open a dialog giving the user the option to
            // "Save Changes", "Discard Changes", or "Cancel" (is "Save As" needed as well?).
            // "Cancel" should reject the deferred.
            // "Discard" should resolve the deferred and return.
            // "Save" (or "Save As") should resolve only if the user saves successfully.
        }
    };

    /* ### General use functions ### */
    
    function validProjectName(projectName) {
        // TODO: Should implement some client-side changes.
        return true;
    }
    
    /**
     * Adds text to the given element.
     */
    function displayError(element, error) {
        element.text(error);
    }
    
    /**
     * Clears the error for the given element.
     */
    function clearError(element) {
        displayError(element, "");
    }
    
    /**
     * Sets the project name and displays it on the page.
     */
    function setProjectName(projectName) {
        _activeProjectName = projectName;
        $('#project-name').text(_activeProjectName);
        // TODO: Update to use angular.
    }
    
    /**
     * Adds all event listeners for the application.
     */
    function registerEventHandlers() {
        var mainSection = $('#mainSection');
        mainSection.on('click', '#new-button', function() {
            NewProjectModule.tryToCreateNewProject();
        });
    }
    
    /* ### WAVED Definition ### */
    var WAVED = {
        start: function() {
            // Can only be called once.
            
            if (_started === false) {
                _started = true;
                registerEventHandlers();
                WelcomeModule.openWelcomeDialog();
            }
        },

        getDirty: function() {
            return _dirty;
        },

        setDirty: function() {
            _dirty = true;
        },
        
        setClean: function() {
            _dirty = false;
        },
    };

    return WAVED;
});