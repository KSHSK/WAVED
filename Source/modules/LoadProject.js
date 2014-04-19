/**
 * A module for loading an existing project.
 */
define([
        'jquery',
        'DataTables',
        './UnsavedChanges',
        './ReadData',
        './DeleteData',
        './SaveProject',
        './UniqueTracker',
        'models/ProjectViewModel'
    ], function(
        $,
        DataTables,
        UnsavedChanges,
        ReadData,
        DeleteData,
        SaveProject,
        UniqueTracker,
        ProjectViewModel) {
    'use strict';

    var LoadProject = {

        /**
         * If the project is clean, the load project dialog is opened. If the project is dirty, the unsaved changes must
         * be handled before the load project dialog is opened.
         */
        tryToLoadProject: function(viewModel) {
            var self = this;

            var projectClean = $.Deferred();

            if (viewModel.dirty === true) {
                UnsavedChanges.handleUnsavedChanges(projectClean);
            }
            else {
                // Project is already clean.
                projectClean.resolve();
            }

            var projectLoaded = $.Deferred();
            $.when(projectClean).done(function() {
                var projectListLoaded = self.updateProjectList(viewModel);
                $.when(projectListLoaded).done(function() {
                    self.openLoadProjectDialog(projectLoaded, viewModel);
                });
            });

            return projectLoaded.promise();
        },

        /**
         * Updates the list of projects displayed in the dialog.
         */
        updateProjectList: function(viewModel) {
            var self = this;

            return $.ajax({
                type: 'POST',
                url: 'PHP/getExistingProjectDetails.php',
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        var table = $('#project-list').dataTable();
                        viewModel.projectList = data.projects;

                        // Reset the data of the table
                        table.fnClearTable();
                        table.fnAddData(data.projects, true);

                        // Click events for selecting a project
                        $('#project-list tbody tr').click(function() {
                            if ($(this).hasClass('row_selected')) {
                                $(this).removeClass('row_selected');
                                viewModel.loadProjectName._value = '';
                            }
                            else {
                                table.$('tr.row_selected').removeClass('row_selected');
                                $(this).addClass('row_selected');
                                viewModel.loadProjectName._value = table._(this)[0].name;
                                viewModel.loadProjectName.error = false;
                            }
                        });
                    }
                    else {
                        viewModel.loadProjectName.error = true;
                        viewModel.loadProjectName.message = data.errorMessage;
                    }
                }
            }).promise();
        },

        /**
         * Open the dialog for loading an existing project.
         */
        openLoadProjectDialog: function(projectLoaded, viewModel) {
            var loadProjectDialog = $('#load-project-dialog');
            var self = this;
            viewModel.loadProjectName._value = '';
            viewModel.loadProjectName.message = '';

            loadProjectDialog.dialog({
                resizable: false,
                height: 450,
                width: 750,
                modal: true,
                buttons: {
                    'Load Project': {
                        text: 'Load Project',
                        'class': 'submit-button',
                        click: function() {
                            var projectName = viewModel.loadProjectName.value;

                            // Load with soft fail to avoid being stuck in rejected state
                            self.loadProject(projectLoaded, projectName, viewModel, true);
                            $.when(projectLoaded).done(function() {
                                loadProjectDialog.dialog('close');
                            });
                        }
                    },
                    'Cancel': function() {
                        projectLoaded.reject();
                        loadProjectDialog.dialog('close');
                    }
                }
            });

            // Update column sizes now that the dialog is open
            var table = $('#project-list').dataTable();
            table.fnAdjustColumnSizing();

        },

        /**
         * Actually submit the load project request.
         */
        loadProject: function(projectLoaded, projectName, viewModel, softFail) {
            var self = this;

            // Client side check for name before sending server request
            if (projectName.length === 0) {
                viewModel.loadProjectName.error = true;
                viewModel.loadProjectName.message = "A project name needs to be given!";

                /* Reject the deferred only if we're not expecting
                   to fail 'softly', allowing for another attempt
                   with the same deferred
                */
                if (!softFail) {
                    projectLoaded.reject();
                }
                return;
            }

            $.ajax({
                type: 'POST',
                url: 'PHP/loadProject.php',
                data: {
                    'project': projectName
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        // Update the data folder path.
                        ReadData.dataFolderPath = data.dataFolder;

                        viewModel.loadProjectName._value = '';
                        viewModel.selectedComponent = viewModel.workspace;

                        // Reset everything using the updated state.
                        viewModel.reset(JSON.parse(data.projectState));

                        // Delete marked data.
                        var filesDeleted = DeleteData.deleteAllMarkedData(viewModel);

                        $.when(filesDeleted).done(function() {
                            // Save the project if some files were deleted.
                            var projectSaved = $.Deferred();
                            SaveProject.saveProject(projectSaved, viewModel);
                        });

                        projectLoaded.resolve();
                    }
                    else {
                        viewModel.loadProjectName.error = true;
                        viewModel.loadProjectName.message = data.errorMessage;

                        /* Reject the deferred only if we're not expecting
                           to fail 'softly', allowing for another attempt
                           with the same deferred
                        */
                        if (!softFail) {
                            projectLoaded.reject();
                        }
                    }
                }
            });
        }
    };

    return LoadProject;
});
