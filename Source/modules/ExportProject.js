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

    var imports = {
        D3: '<script src="http://d3js.org/d3.v3.min.js"></script>',
        JQUERY: '<script src="https://code.jquery.com/jquery-1.9.1.js"></script>',
        JQUERY_UI: '<script src="https://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>',
        WAVED_CSS: '<link rel="stylesheet" type=\"text/css\" href=\"WAVED.css">',
        WAVED_JS: '<script src="WAVED.js"></script>',
        JQUERY_UI_STYLE: '<link rel="stylesheet" type="text/css" href="https://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css">',
        D3_TOPOJSON: '<script src="http://d3js.org/topojson.v1.min.js"></script>'
    };

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

        generateCss: function(viewModel) {
            var workspace = viewModel.currentProject.workspace;

            var workspaceCss = '#waved-container {\n' +
                                 '\twidth: ' + workspace.width.value + 'px;\n' +
                                 '\theight: ' + workspace.height.value + 'px;\n' +
                                 '\tposition: relative;\n' +
                                 '\tbackground-color: ' + workspace.color.value + ';\n' +
                               '}\n';

            return workspaceCss;
        },

        generateJs: function(viewModel) {
            // TODO;
        },

        generateHtml: function(viewModel) {
            var thirdPartyImports = imports.D3 + '\n' +
                                    imports.JQUERY + '\n' +
                                    imports.JQUERY_UI + '\n' +
                                    imports.JQUERY_UI_STYLE + '\n' +
                                    imports.D3_TOPOJSON + '\n' +
                                    imports.WAVED_CSS + '\n' +
                                    imports.WAVED_JS + '\n';

            var htmlTemplate = '<html>\n' +
                             '<head>\n' +
                             thirdPartyImports +
                             '</head>\n' +
                             '<body>\n' +
                                 '\t<div id="waved-container">\n' +
                                     // TODO: Widgets
                                 '\t</div>\n' +
                             '</body>\n' +
                             '</html>';

            return htmlTemplate;
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
            var css = self.generateCss(viewModel);
            var js = self.generateJs(viewModel);
            self.generateZipFile(projectName, dataFiles, html, css, js);
        },

        generateZipFile: function(projectName, dataFiles, html, css, js) {
            var self = this;
            $.ajax({
                type: 'POST',
                url: 'PHP/createZip.php',
                data: {
                    'name': projectName,
                    'data_files': dataFiles,
                    'html': html,
                    'css': css,
                    'js': js
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