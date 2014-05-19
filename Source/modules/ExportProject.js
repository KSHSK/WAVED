/**
 * A module for exporting the current project.
 */
define([
        '../models/Action/PropertyAction',
        '../models/Widget/USMapWidget/USMap',
        './UnsavedChanges',
        '../WAVEDViewModel',
        '../util/defined',
        '../util/displayMessage',
        'jquery'
    ], function(
        PropertyAction,
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
        WAVED_CSS: '<link rel="stylesheet" type=\"text/css\" href=\"WAVED.css">',
        WAVED_JS: '<script src="WAVED.js"></script>'
    };

    function cssToString(widget) {
        var str = '#' + widget.viewModel.name.value + ' {\n';
        var css = widget.getCss();
        for (var property in css) {
            str = str + '\t' + property + ': ' + css[property] + ';\n';
        }
        str = str + '}\n\n';
        return str;
    }

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

            var css = '#waved-container {\n' +
                                 '\twidth: ' + workspace.width.value + 'px;\n' +
                                 '\theight: ' + workspace.height.value + 'px;\n' +
                                 '\tposition: relative;\n' +
                                 '\tbackground-color: ' + workspace.color.value + ';\n' +
                               '}\n\n';

            for (var i = 0; i < viewModel.currentProject.widgets.length; i++) {
                css += cssToString(viewModel.currentProject.widgets[i]);
                css += '\n\n';
            }
            return css;
        },

        generateJs: function(viewModel) {
            var js = '$(document).ready(function() {\n';

            // Override CSS attributes from automatically applied Actions
            // TODO: Nested Properties?
            for (var i = 0; i < viewModel.currentProject.actions.length; i++) {
                var action = viewModel.currentProject.actions[i];
                if (action.applyAutomatically && action instanceof PropertyAction) {
                    for (var key in action.newValues) {
                        if (defined(action.target.viewModel[key].css)) {
                            var value = action.newValues[key];
                            if (defined(action.target.viewModel[key].css.units)) {
                                value += action.target.viewModel[key].css.units;
                            }
                            js += '\t$(\'#' + action.target.viewModel.name.value + '\').css(\'' + action.target.viewModel[key].css.attribute + '\', \'' + value + '\');\n';
                        }
                        if (defined(action.target.viewModel[key].html)) {
                            js += '\t$(\'#' + action.target.viewModel.name.value + '\').html(\'' + action.newValues[key] + '\');\n';
                        }
                    }
                }
            }

            return js + '});';
        },

        generateHtml: function(viewModel) {
            var thirdPartyImports = imports.D3 + '\n' +
                                    imports.JQUERY + '\n' +
                                    imports.WAVED_CSS + '\n' +
                                    imports.WAVED_JS + '\n';

            var htmlTemplate = '<html>\n' +
                             '<head>\n' +
                             thirdPartyImports +
                             '</head>\n' +
                             '<body>\n' +
                                 '\t<div id="waved-container">\n';

            for (var i = 0; i < viewModel.currentProject.widgets.length; i++) {
                // TODO: proper tabbing
                htmlTemplate += '\t\t' + viewModel.currentProject.widgets[i].exportHtml() + '\n';
            }

            htmlTemplate += '\t</div>\n' +
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