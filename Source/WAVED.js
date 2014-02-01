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
            clearText(this.createNewProjectError);
            
            this.createNewProjectDialog.dialog({
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
                                self.createNewProjectDialog.dialog("close");
                            });
                        }
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

            $.ajax({
                type: "POST",
                url: "PHP/createProject.php",
                data: {
                    "project": projectName
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        clearText(self.createNewProjectError);
                        setProjectName(data.projectName);
                        projectCreated.resolve();
                    }
                    else {
                        // Display error to user.
                        displayText(self.createNewProjectError, data.errorMessage);
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
            // "Discard Changes" / "Continue", or "Cancel"
            // "Cancel" should reject the deferred.
            // "Discard" should resolve the deferred and return.
        }
    };

    /* ### General use functions ### */

    /**
     * Adds text to the given element.
     */
    function displayText(element, text) {
        element.text(text);
    }
    
    /**
     * Clears the text for the given element.
     */
    function clearText(element) {
        element.text("");
    }
    
    /**
     * Sets the project name and displays it on the page.
     */
    function setProjectName(projectName) {
        var element = $('#project-name');
        _activeProjectName = projectName;
        element.text(_activeProjectName);
        element.attr('title', _activeProjectName);
        // TODO: Update to use angular.
    }
    
    function disableButton(button) {
        button.attr('disabled', 'disabled').addClass('ui-state-disabled');
    }
    
    function enableButton(button) {
        button.removeAttr('disabled', 'disabled').removeClass('ui-state-disabled');
    }
    
    /**
     * Adds all event listeners for the application.
     */
    function registerEventHandlers() {
        var mainSection = $('#mainSection');
        
        // Input validation
        $(document).on('keyup', 'input.validate', function(event) {
            validateInput($(event.currentTarget));
        });
        
        // New Project
        mainSection.on('click', '#new-button', function() {
            NewProjectModule.tryToCreateNewProject();
        });
    }
    
    function validateInput(element) {
        var value = element.val().trim();
        
        var error = element.next('div.error');
        
        // TODO: This will only be correct for dialogs.
        //       Update this for non-dialogs when possible.
        var submitButton = element.parents('.ui-dialog').find('.submit-button');
        
        var minLength = element.data("min-length");
        var maxLength = element.data("max-length");
        var regex = element.attr("data-match");
        var regexDescription = element.attr("data-match-desc");
        
        if (typeof minLength === 'number') {
            if (value.length < minLength) {
                var charText = "character" + (minLength === 1 ? "" : "s");
                var message = "Must be at least " + minLength + " " + charText + ".";
                displayText(error, message);
                disableButton(submitButton);
                return;
            }
        }
        
        if (typeof maxLength === 'number') {
            if (value.length > maxLength) {
                var charText = "character" + (minLength === 1 ? "" : "s");
                var message = "Cannot be more than " + maxLength + " " + charText + ".";
                displayText(error, message);
                disableButton(submitButton);
                return;
            }
        }
        
        if (typeof regex !== 'undefined' && typeof regexDescription !== 'undefined') {
            if (!value.match(RegExp(regex))) {
                displayText(error, regexDescription);
                disableButton(submitButton);
                return;
            }
        }
        
        // Clear error.
        clearText(error);
        enableButton(submitButton);
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