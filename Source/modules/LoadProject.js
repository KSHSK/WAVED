/**
 * A module for loading an existing project.
 */
 define([
        'angular',
        'WAVED',
        '../modules/UnsavedChanges',
        'jquery'
    ], function(
        angular,
        WAVED,
        UnsavedChangesModule, 
        $) {
     
    var LoadProjectModule = {
        loadProjectDialog: $('#load-project-dialog'),
        loadProjectSelect: $('#load-project-select'),
        loadProjectError: $('#load-project-error'),
        
        /**
         * If the project is clean, the load project dialog is opened.
         * If the project is dirty, the unsaved changes must be handled before
         * the load project dialog is opened.
         */
        tryToLoadProject: function() {
            var self = this;
            
            var projectClean = $.Deferred();
            
            if (WAVED.isDirty() === true) {
                UnsavedChangesModule.handleUnsavedChanges(projectClean);
            }
            else {
                // Project is already clean.
                projectClean.resolve();
            }
            
            var projectLoaded = $.Deferred();
            $.when(projectClean).done(function() {
                var projectListLoaded = self.updateProjectList();
                $.when(projectListLoaded).done(function() {
                    self.openLoadProjectDialog(projectLoaded);
                });
            });
            
            return projectLoaded.promise();
        },
        
        /**
         * Updates the list of projects displayed in the dialog.
         */
        updateProjectList: function() {
            var self = this;
            
            return $.ajax({
                type: "POST",
                url: "PHP/getExistingProjectNames.php",
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        self.loadProjectError.text('');
                        self.setProjectList(data.projects);
                    }
                    else {
                        // Display error to user.
                        self.loadProjectError.text(data.errorMessage);
                    }
                }
            }).promise();
        },
        
        setProjectList: function(projects) {
            var select = this.loadProjectSelect;
            select.empty();
            
            $.each(projects, function(index, value) {
                var option = $('<option>').val(value).text(value);
                select.append(option);
            });
        },

        /**
         * Open the dialog for loading an existing project.
         */
        openLoadProjectDialog: function(projectLoaded) {
            var self = this;
            
            this.loadProjectDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    "Load Project": {
                        text: "Load Project",
                        "class": "submit-button",
                        click: function() {
                            self.loadProject(projectLoaded, self.loadProjectSelect.val());
                            $.when(projectLoaded).done(function() {
                                self.loadProjectDialog.dialog("close");
                            });
                        }
                    },
                    "Cancel": function() {
                        self.loadProjectDialog.dialog("close");
                    }
                }
            });
        },
        
        /**
         * Actually submit the load project request.
         */
        loadProject: function(projectLoaded, projectName) {
            var self = this;

            $.ajax({
                type: "POST",
                url: "PHP/loadProject.php",
                data: {
                    "project": projectName
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        self.loadProjectError.text('');
                        
                        // Set the proejct name.
                        var scope = angular.element($('body')).scope();
                        scope.$apply(function() {
                            scope.projectName = data.projectName;
                        });
                        
                        WAVED.setClean();
                        projectLoaded.resolve();
                    }
                    else {
                        // Display error to user.
                        self.loadProjectError.text(data.errorMessage);
                    }
                }
            });
        }
    };
    
    
    // Load Project
    $(document).on('click', '#load-button', function() {
        LoadProjectModule.tryToLoadProject();
    });
    
    // Refresh list of projects to load from.
    $(document).on('click', '#load-project-refresh-list', function() {
        LoadProjectModule.updateProjectList();
    });
	
	return LoadProjectModule;
});