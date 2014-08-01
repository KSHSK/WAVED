/**
 * A module for exporting the current project.
 */
define([
        '../models/Constants/EventType',
        '../models/Action/Action',
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
        Action,
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

        exportActions: function(event, tabs) {
            var js = '';
            var j;
            var targets = [];
            var triggerName = event.triggeringWidget.viewModel.name.originalValue;

            for (j = 0; j < event.actions.length; j++) {
                var currentAction = event.actions[j];
                js += this.exportAction(currentAction, triggerName, '\t');

                if (currentAction instanceof PropertyAction) {
                    if (targets.indexOf(event.actions[j].target) === -1) {
                        targets.push(currentAction.target);
                    }
                }
            }

            // Do any rerendering for property actions.
            for (j = 0; j < targets.length; j++) {
                var target = targets[j];
                if (defined(target.renderFunctionName)) {
                    js += '\t' + target.renderFunctionName + '(widgets["' + target.name.originalValue + '"]);\n';
                }
            }

            return js;
        },

        exportAction: function(action, triggerName, tabs) {
            var js = '';

            js += action.getJs(tabs, triggerName) + '\n';

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
            var i, j;

            // Export workspace width and height, which may be used by widgets.
            var $workspace = $('#waved-workspace');
            js += 'var workspaceWidth = ' + $workspace.width() + ';\n';
            js += 'var workspaceHeight = ' + $workspace.height() + ';\n';

            // Export Data
            var dataSets = viewModel.currentProject.unmarkedDataSets;
            if (dataSets.length > 0) {
                var hasSubsets = (viewModel.currentProject.dataSubsets.length > 0);
                js += this.exportDataJs(dataSets, hasSubsets);
            }

            // Export Events

            // addDataToTrigger
            js += '// Trigger Functions\n';
            js += 'function addDataToTrigger(widgetName, name, key, value) {\n';
            js += '\tif (arguments.length === 3) {\n';
            js += '\t\twidgets[widgetName].triggerData[name] = key;\n';
            js += '\t\treturn;\n';
            js += '\t}\n';
            js += '\tif (typeof (widgets[widgetName].triggerData[name]) === \'undefined\') {\n';
            js += '\t\twidgets[widgetName].triggerData[name] = {};\n';
            js += '\t}\n';
            js += '\twidgets[widgetName].triggerData[name][key] = value;\n';
            js += '}\n\n';

            // addMouseDataToTrigger
            js += 'function addMouseDataToTrigger(event, widgetName){\n';
            js += '\tvar workspace = $(\'#waved-container\');\n';
            js += '\taddDataToTrigger(widgetName, \'x\', 100 * (event.pageX - workspace.offset().left) / workspace.width());\n';
            js += '\taddDataToTrigger(widgetName, \'y\', 100 * (event.pageY - workspace.offset().top) / workspace.height());\n';
            js += '}\n\n';

            var propertyActionHelperExported = false;
            var events = viewModel.currentProject.events;
            if (viewModel.currentProject.actions.length > 0) {
                js += Action.getHelperFunctionsJs();
            }

            if (events.length > 0) {
                js += '// Events\n';
            }

            for (i = 0; i < events.length; i++) {
                var event = events[i];
                js += '$(\'#'+ event.triggeringWidget.viewModel.exportId + '\').on(\'' + EventType[event.eventType] + '\', function(event) {\n';
                js += '\taddMouseDataToTrigger(event, \'' + event.triggeringWidget.viewModel.name.originalValue + '\');\n\n';

                // apply actions
                js += this.exportActions(event, '\t');
                js += '});\n\n';
            }

            // Figure out which widget properties to override for automatically applied actions.
            var autoActionCode = {};
            for (i = 0; i < viewModel.currentProject.actions.length; i++) {
                var action = viewModel.currentProject.actions[i];
                if (action.applyAutomatically) {
                    var targetName = action.target.name.originalValue;
                    if (!defined(autoActionCode[targetName])) {
                        autoActionCode[targetName] = [];
                    }
                    autoActionCode[targetName].push(this.exportAction(action, '', ''));
                }
            }

            js += '// Initialize Widgets\n';
            js += 'var widgets = {};\n';
            for (i = 0; i < viewModel.currentProject.widgets.length; i++) {
                var widget = viewModel.currentProject.widgets[i];

                js += 'widgets[\'' + widget.viewModel.name.originalValue + '\'] = {\n';
                js += '\t\'id\': \'' + widget.viewModel.exportId + '\',\n';

                if (widget.viewModel.boundData.length > 0) {
                    js += '\t\'boundData\': [' ;
                    for (j = 0; j < widget.viewModel.boundData.length; j++) {
                        js += '\'' + widget.viewModel.boundData[j].name + '\'';
                        if (j !== widget.viewModel.boundData.length - 1) {
                            js += ', ';
                        }
                    }
                    js += '],\n';
                } else {
                    js += '\t\'boundData\': [],\n';
                }
                js += '\t\'triggerData\': {},\n';
                js += '\t\'properties\': {}\n';
                js += '};\n\n';


                if (defined(widget.getJs)) {
                    js += widget.getJs(viewModel.currentProject.googleAnalytics, autoActionCode);
                }
                else {
                    var widgetAutoActions = autoActionCode[widget.viewModel.name.originalValue];
                    if (defined(widgetAutoActions) && widgetAutoActions.length > 0) {
                        js += '// Override properties from automatically applied actions.\n';
                        for (j = 0; j < widgetAutoActions.length; j++) {
                            js += widgetAutoActions[j];
                        }
                    }
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
