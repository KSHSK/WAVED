define([], function() {
   
    /* ### Private WAVED Variables ### */
    
    // True if changes have been made since the last save; otherwise false.
    var _dirty = false;

    // The current name of the project.
    var _activeProjectName = "";
    
    // Has the application been started yet.
    var _started = false;
    
    /* ### Other Local Variables and Functions ### */
    
    // jQuery variables
    var welcomeDialog = $("#welcome-dialog");
    var createNewProjectDialog = $('#create-new-project-dialog');
    var createNewProjectName = $('#create-new-project-name');
    var createNewProjectError = $('#create-new-project-error');
    var unsavedChangesDialog = $('#unsaved-changes-dialog');

    /**
     * Adds all event listeners for the application.
     */
    function registerEventHandlers() {
        var mainSection = $('#mainSection');
        mainSection.on('click', '#new-button', function() {
            tryToCreateNewProject();
        });
    }
    
    /**
     * Handles when the user tries to close the project when there are unsaved changes.
     */
    function handleUnsavedChanges(deferred) {
        // TODO: This should open a dialog giving the user the option to
        // "Save Changes", "Discard Changes", or "Cancel" (is "Save As" needed as well?).
        // "Cancel" should reject the deferred.
        // "Discard" should resolve the deferred and return.
        // "Save" (or "Save As") should resolve only if the user saves successfully.
    };
    
    /**
     * Open the welcome dialog.
     */
    function openWelcomeDialog() {
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
                    var projectLoaded = tryToLoadExistingProject();
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
    
    /**
     * Open the dialog for creating a new project.
     */
    function openCreateNewProjectDialog(projectCreated) {
        // Clear the input.
        createNewProjectName.val("");
        
        createNewProjectDialog.dialog({
            resizable: false,
            height: 250,
            width: 400,
            modal: true,
            buttons: {
                "Create Project": function() {
                    createNewProject(projectCreated);
                    $.when(projectCreated).done(function() {
                        createNewProjectDialog.dialog("close");
                    });
                },
                "Cancel": function() {
                    $(this).dialog("close");
                }
            }
        });
    };
    
    /**
     * If the project is clean, the new project dialog is opened.
     * If the project is dirty, the unsaved changes must be handled before
     * the new project dialog is opened.
     */
    function tryToCreateNewProject() {
        var projectClean = $.Deferred();
        
        if (WAVED.getDirty() === true) {
            handleUnsavedChanges(projectClean);
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
    
    function tryToLoadExistingProject() {
        // TODO Implement me.
        
        var deferred = $.Deferred();
        
        // Remove this reject when implementing.
        deferred.reject();
        
        return deferred.promise();
    };
    
    /**
     * Actually submit the createProject request.
     */
    function createNewProject(projectCreated) {
        // Don't allow leading or trailing white space.
        var projectName = createNewProjectName.val().trim();
        createNewProjectName.val(projectName);
        
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
                    clearError(createNewProjectError);
                    setProjectName(data.projectName);
                    projectCreated.resolve();
                }
                else {
                    // Display error to user.
                    displayError(createNewProjectError, data.errorMessage);
                }
            }
        });
    }
    
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
    }
    
    /* ### WAVED Definition ### */
    var WAVED = {
        start: function() {
            // Can only be called once.
            
            if (_started === false) {
                _started = true;
                registerEventHandlers();
                openWelcomeDialog();
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