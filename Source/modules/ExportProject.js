/**
 * A module for exporting the current project.
 */
define([
        '../models/Constants/EventType',
        '../models/Action/PropertyAction',
        '../models/Constants/MessageType',
        '../models/Data/Query',
        '../models/Data/DataSet',
        '../models/Widget/USMapWidget/USMap',
        './UnsavedChanges',
        '../WAVEDViewModel',
        '../util/defined',
        '../modules/DisplayMessage',
        'jquery'
    ], function(
        EventType,
        PropertyAction,
        MessageType,
        Query,
        DataSet,
        USMap,
        UnsavedChangesModule,
        WAVEDViewModel,
        defined,
        DisplayMessage,
        $) {
    'use strict';

    var imports = {
        D3: '<script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min.js"></script>',
        JQUERY: '<script src="https://code.jquery.com/jquery-1.9.1.js"></script>',
        WAVED_CSS: '<link rel="stylesheet" type=\"text/css\" href=\"WAVED.css">',
        WAVED_JS: '<script src="WAVED.js"></script>'
    };

    function cssToString(widget) {
        var str = '#' + widget.viewModel.exportId + ' {\n';
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

            css += '.widget-container {\n';
            css += '\tposition: absolute;\n';
            css += '\tpointer-events: none;\n';
            css += '}\n\n';

            for (var i = 0; i < viewModel.currentProject.widgets.length; i++) {
                css += cssToString(viewModel.currentProject.widgets[i]);
                css += '\n\n';
            }
            return css;
        },

        // TODO: Action with nested properties
        exportAction: function(action, tabs) {
            var js = '';
            if (action instanceof PropertyAction) {
                for (var key in action.newValues) {

                    var subscribableNestedProperties = action.target[key].getSubscribableNestedProperties();

                    // Nested properties
                    if(defined(subscribableNestedProperties)) { // if the key has nested objects
                        var nestedObject = action.newValues[key].value; // get that nested object
                        var widgetNestedObject; // This is the nested object we're looking at

                        for (var x = 0; x < subscribableNestedProperties.length; x++) {
                            if (subscribableNestedProperties[x].getType() === nestedObject.type) {
                                widgetNestedObject = subscribableNestedProperties[x];
                                break;
                            }
                        }

                        for (var nestedProperty in nestedObject) { // for every property in that nested object
                            if (defined(widgetNestedObject[nestedProperty]) && defined(widgetNestedObject[nestedProperty].css)) {
                                var nestedValue = action.newValues[key].value[nestedProperty].value;
                                if(defined(nestedValue.css.units)) {
                                    nestedValue += action.target[key].css.units;
                                }
                            }
                        }



                        // TODO: Specific for US Map??
                        //js += tabs + '\n\t$(\'#' + action.target.name.value + '\').css(\'' + action.target[key].css.attribute + '\', \'' + value + '\');\n';

                        // TODO: Needs specific function calls for map and glyphs to update coloring or rerender (due to scaling and such)

                        continue; // Skip the rest of the loop, no reason to look at the top level property again
                    }

                    if (defined(action.target[key].css)) {
                        var value = action.newValues[key].value;
                        if (defined(action.target[key].css.units)) {
                            value += action.target[key].css.units;
                        }
                        js += tabs + '\n\t$(\'#' + action.target.exportId + '\').css(\'' + action.target[key].css.attribute + '\', \'' + value + '\');\n';
                    }

                    if (defined(action.target[key].html)) {
                        js += tabs + '\n\t$(\'#' + action.target.exportId + '\').html(\'' + action.newValues[key] + '\');\n';
                    }
                }
            }
            else {
                js += '\n' + action.getJs(tabs);
            }

            return js;
        },

        exportDataJs: function(dataSets, hasSubsets) {
            var js = '';
            var i;

            js += '// START DATA\n';

            if (hasSubsets) {
                js += Query.getHelperFunctionsJs();
            }

            js += DataSet.getHelperFunctionsJs();

            js += '// Initialize Data sets\n';
            js += 'var dataSets = {};\n';
            for (i = 0; i < dataSets.length; i++) {
                js += dataSets[i].getSetupJs();
            }

            js += '// Load Data\n';
            for (i = 0; i < dataSets.length; i++) {
                js += dataSets[i].getLoadDataJs();
            }
            js += '// END DATA\n\n';

            return js;
        },

        generateJs: function(viewModel) {
            var js = '$(document).ready(function() {\n';
            var i;

            // Export Data
            if (viewModel.currentProject.dataSets.length > 0) {
                var hasSubsets = (viewModel.currentProject.dataSubsets.length > 0);
                js += this.exportDataJs(viewModel.currentProject.dataSets, hasSubsets);
            }

            // Override CSS attributes from automatically applied Actions
            // TODO: Nested Properties?
            for (i = 0; i < viewModel.currentProject.actions.length; i++) {
                var action = viewModel.currentProject.actions[i];
                if (action.applyAutomatically) {
                    js += this.exportAction(action, '');
                }
            }

            // Export Events
            for (i = 0; i < viewModel.currentProject.events.length; i++) {
                var event = viewModel.currentProject.events[i];
                js += '$(\'#'+ event.triggeringWidget.viewModel.exportId + '\').on(\'' + EventType[event.eventType] + '\', function() {';
                // apply actions
                for (var j = 0; j < event.actions.length; j++) {
                    js += this.exportAction(event.actions[j], '\t');
                }
                js += '});\n';
            }

            for (i = 0; i < viewModel.currentProject.widgets.length; i++) {
                var widget = viewModel.currentProject.widgets[i];
                if (defined(widget.getJs)) {
                    js += widget.getJs(viewModel.currentProject.googleAnalytics);
                }

                // Add Google Analytics track on click event
                if (widget.viewModel.logGoogleAnalytics.value && !(widget instanceof USMap)) {
                    js += '$(\'#'+ widget.viewModel.exportId + '\').on(\'click\', function() {';
                    js += '\t_gaq.push([\'_trackEvent\', \''+ viewModel.currentProject.googleAnalytics.eventCategory.originalValue + '\', \'click-' + widget.viewModel.name.originalValue +'\']);';
                    js += '});\n';
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
                             thirdPartyImports;

            if (viewModel.currentProject.googleAnalytics.bound) {
                htmlTemplate += '<script type="text/javascript">' + '\n' +
                                '\t' + 'var _gaq=_gaq || [];' + '\n' +
                                '\t' + '_gaq.push([\'_setAccount\',\'' + viewModel.currentProject.googleAnalytics.uaCode.originalValue +'\']);' + '\n' +
                                '\t' + '_gaq.push([\'_trackPageview\']);' + '\n' +
                                '\t' + '(function() {' + '\n' +
                                '\t' + '\t' + 'var ga=document.createElement(\'script\');' + '\n' +
                                '\t' + '\t' + 'ga.type=\'text/javascript\';' + '\n' +
                                '\t' + '\t' + 'ga.async=true;' + '\n' +
                                '\t' + '\t' + 'ga.src=(\'https:\'==document.location.protocol ? \'https://ssl\' :\'http://www\') + \'.google-analytics.com/ga.js\';' + '\n' +
                                '\t' + '\t' + 'var s=document.getElementsByTagName(\'script\')[0];' + '\n' +
                                '\t' + '\t' + 's.parentNode.insertBefore(ga,s);' + '\n' +
                                '\t' + '})();' + '\n' +
                                '</script>';
            }

            htmlTemplate += '</head>\n' +
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

            var dataFiles = [];
            var dataSets = viewModel.currentProject.unmarkedProperDataSets;
            for (var i = 0; i < dataSets.length; i++) {
                var dataSet = dataSets[i];
                dataFiles.push(dataSet.filename);
            }

            for (i = 0; i < viewModel.currentProject.widgets.length; i++) {
                var widget = viewModel.currentProject.widgets[i];
                if (widget instanceof USMap) {
                    dataFiles.push('states.json');
                    break;
                }
            }

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
                DisplayMessage.show(data.errorMessage, MessageType.ERROR);
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
