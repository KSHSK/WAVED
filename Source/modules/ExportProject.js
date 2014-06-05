/**
 * A module for exporting the current project.
 */
define([
        '../models/Constants/EventType',
        '../models/Action/PropertyAction',
        '../models/Widget/USMapWidget/USMap',
        './UnsavedChanges',
        '../WAVEDViewModel',
        '../util/defined',
        '../util/displayMessage',
        'jquery'
    ], function(
        EventType,
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
            str += '\t' + property + ': ' + css[property] + ';\n';
        }
        str += '}';
        return str;
    }

    var ExportProject = {

        /**
         * If the project is clean, the export project dialog is opened. If the project is dirty, the unsaved changes must
         * be handled before the export project dialog is opened.
         */
        tryToExportProject: function(viewModel) {
            var self = this;

            var projectExported = $.Deferred();
            self.exportProject(projectExported, viewModel);

            return projectExported.promise();
        },

        generateCss: function(viewModel) {
            var workspace = viewModel.currentProject.workspace;

            var css = workspace.getCss() + '\n\n';

            for (var i = 0; i < viewModel.currentProject.widgets.length; i++) {
                css += cssToString(viewModel.currentProject.widgets[i]);
                css += '\n\n';
            }
            return css;
        },

        generateJs: function(viewModel) {
            var js = '$(document).ready(function() {\n';

            function exportAction(action, tabs) {
                var js = '';
                if (action instanceof PropertyAction) {
                    for (var key in action.newValues) {
                        if (defined(action.target.viewModel[key].css)) {
                            var value = action.newValues[key];
                            if (defined(action.target.viewModel[key].css.units)) {
                                value += action.target.viewModel[key].css.units;
                            }
                            js += tabs + '\n\t$(\'#' + action.target.viewModel.name.value + '\').css(\'' + action.target.viewModel[key].css.attribute + '\', \'' + value + '\');\n';
                        }

                        if (defined(action.target.viewModel[key].html)) {
                            js += tabs + '\n\t$(\'#' + action.target.viewModel.name.value + '\').html(\'' + action.newValues[key] + '\');\n';
                        }
                    }
                }
                return js;
            }

            // Export Data
            js += 'var dataSets = {};\n';
            for (var i = 0; i < viewModel.currentProject.dataSets.length; i++) {
				js += viewModel.currentProject.dataSets[i].getSetupJs();
            }
            for (i = 0; i < viewModel.currentProject.dataSets.length; i++) {
				js += viewModel.currentProject.dataSets[i].getLoadDataJs();
            }

            // Override CSS attributes from automatically applied Actions
            // TODO: Nested Properties?
            for (i = 0; i < viewModel.currentProject.actions.length; i++) {
                var action = viewModel.currentProject.actions[i];
                if (action.applyAutomatically) {
                    js += exportAction(action, '');
                }
            }

            // Export Events
            for (i = 0; i < viewModel.currentProject.events.length; i++) {
                var event = viewModel.currentProject.events[i];
                js += '$(\'#'+ event.triggeringWidget.viewModel.name.value + '\').on(\'' + EventType[event.eventType] + '\', function() {';
                // apply actions
                for (var j = 0; j < event.actions.length; j++) {
                    js += exportAction(event.actions[j], '\t');
                }
                js += '});';
            }

            for (i = 0; i < viewModel.currentProject.widgets.length; i++) {
                if (defined(viewModel.currentProject.widgets[i].getJs)) {
                    js += viewModel.currentProject.widgets[i].getJs();
                }
            }

            return js + '\n});';
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

        downloadGeneratedZipFile: function(response, fileName) {
            var data = JSON.parse(response);
            if (!data.success) {
                displayMessage(data.errorMessage);
                return;
            }

            var exportLink = $('#export-file-link');

            // Set and click a hidden link so this doesn't require another step by the user.
            exportLink.attr('href', 'PHP/downloadZip.php?fileName=' + fileName);
            exportLink.attr('download', fileName);
            exportLink[0].click();
        }
    };

    return ExportProject;
});
