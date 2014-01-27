define([], function() {
   
    /* ### Local Variables and Functions ### */
    
    // True if changes have been made since the last save; otherwise false.
    var dirty = false;

    // jQuery variables
    var welcomeDialog = $("#welcome-dialog");
    var createNewProjectDialog = $('#create-new-project-dialog');
    var createNewProjectName = $('#create-new-project-name');
    var createNewProjectError = $('#create-new-project-error');
    var unsavedChangesDialog = $('#unsaved-changes-dialog');

    
    function handleUnsavedChanges(deferred) {
        // TODO: Implement me.
    };
    
    // Open the welcome dialog.
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
    
    // Open the dialog for creating a new project.
    function openCreateNewProjectDialog(projectCreated) {
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
    
    function tryToCreateNewProject() {
        var projectClean = $.Deferred();
        
        if (dirty === true) {
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
    
    function createNewProject(projectCreated) {
        var projectName = createNewProjectName.val();
        
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
        return true;
    }
    
    function displayError(element, error) {
        element.text(error);
    }
    
    function clearError(element) {
        displayError(element, "");
    }
    
    /* ### WAVED Definition ### */
    var WAVED = {
        start: function() {
            openWelcomeDialog();
        },

        setDirty: function() {
            dirty = true;
        },
        
        setClean: function() {
            dirty = false;
        },
    };

    return WAVED;
});