/**
 * A module for exporting the current project.
 */
define([
        '../models/Widget/USMapWidget/USMap',
        './UnsavedChanges',
        '../WAVEDViewModel',
        '../util/defined',
        '../util/displayMessage',
        'jquery'
    ], function(
        USMap,
        UnsavedChangesModule,
        WAVEDViewModel,
        defined,
        displayMessage,
        $) {
    'use strict';

    var ExportProject = {

        /**
         * If the project is clean, the export project dialog is opened. If the project is dirty, the unsaved changes must
         * be handled before the export project dialog is opened.
         */
        tryToExportProject: function(viewModel) {
            var self = this;
            var projectClean = $.Deferred();

            if (viewModel.dirty === true) {
                UnsavedChangesModule.handleUnsavedChanges(projectClean);
            }
            else {
                // Project is already clean.
                projectClean.resolve();
            }

            var projectExported = $.Deferred();
            $.when(projectClean).done(function() {
                self.exportProject(projectExported, viewModel);
            });

            return projectExported.promise();
        },

        generateHtml: function(viewModel) {
            // TODO
            return '<html></html>';
        },

        exportProject: function(projectExported, viewModel) {
            var self = this;
            var projectName = viewModel.currentProject.name;
            var filenames = {};
            for (var i = 0; i < viewModel.currentProject.widgets.length; i++) {
                var widget = viewModel.currentProject.widgets[i];
                if (widget instanceof USMap) {
                    filenames['states.json'] = true;
                }
                for (var j = 0; j < widget.viewModel.boundData.length; j++) {
                    filenames[widget.viewModel.boundData[j].filename] = true;
                }
            }
            var dataFiles = Object.keys(filenames);
            var html = self.generateHtml(viewModel);
            self.generateZipFile(projectName, dataFiles, html);
        },

        generateZipFile: function(projectName, dataFiles, html) {
            var self = this;
            $.ajax({
                type: 'POST',
                url: 'PHP/createZip.php',
                data: {
                    'name': projectName,
                    'data_files': dataFiles,
                    'html': html
                },
                success: function(data) {
                    self.downloadGeneratedZipFile(data, projectName + '.zip');
                }
            });
        },

        downloadGeneratedZipFile: function(data, fileName) {
            if (data !== 'success') {
                displayMessage('Could not download zip file.');
                return;
            }

            var exportLink = $('#export-file-link');

            // Set and click a hidden link so this doesn't require another step by the user.
            exportLink.attr('href', 'php/downloadZip.php?fileName=' + fileName);
            exportLink.attr('download', fileName);
            exportLink[0].click();
        }
    };

    return ExportProject;
});