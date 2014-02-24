/*global define*/
 define([
        'require',
        'util/koExtenders',
        'app',
        'WAVED',
        'modules/Welcome',
        'knockout',
        'jqueryUI'
    ], function (
        require,
        koExtenders,
        app,
        WAVED,
        WelcomeModule,
        ko,
        $) {
    'use strict';

    require(['../ThirdParty/domReady!'], function(document) {
        setupUI();
        displayPage();
        WelcomeModule.openWelcomeDialog(WAVED.viewModel);
    });

    function setupUI() {
        $('#new-button').button();
        $('#undo-button').button();
        $('#redo-button').button();
        $('#load-button').button();
        $('#save-button').button();
        $('#export-button').button();
        $('#refresh-button').button();
        $('#google-analytics-add-button').button();
        $('#google-analytics-remove-button').button();
        $('#google-analytics-clear-button').button();

        // Add/Edit/Remove Buttons.
        $('#add-action-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-plus'
            }
        });

        $('#edit-action-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-pencil'
            }
        });

        $('#delete-action-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-trash'
            }
        });

        $('#add-event-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-plus'
            }
        });

        $('#edit-event-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-pencil'
            }
        });

        $('#delete-event-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-trash'
            }
        });

        $('#add-data-file-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-plus'
            }
        });

        $('#delete-data-file-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-trash'
            }
        });

        $('#add-data-subset-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-plus'
            }
        });

        $('#edit-data-subset-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-pencil'
            }
        });

        $('#delete-data-subset-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-trash'
            }
        });

        $('#load-project-refresh-list').button({
            text: false,
            icons: {
                primary: 'ui-icon-arrowrefresh-1-n'
            }
        });

        // Setup accordion
        $('#accordion').accordion({
            animate: false
        });

        $('input').addClass('ui-corner-all');

        var viewModel = WAVED.viewModel;

        var $widgetsPanel = $('#widgets-panel');
        $widgetsPanel.attr('data-bind', 'foreach: availableWidgets');
        var widgetButton = document.createElement('button');
        $(widgetButton).attr('data-bind', 'text: $data.name, click: $parent.addNewWidget');
        $widgetsPanel.append(widgetButton);

        var $propertiesPanel = $('#properties-panel');
        $propertiesPanel.attr('data-bind', 'foreach: currentProject.widgets');
        var widgetProperties = document.createElement('div');
        $(widgetProperties).attr('data-bind',
            'foreach: $data.viewModel.properties, visible: $parent.selectedWidget == $data');
        var property = document.createElement('div');
        $(property).attr('data-bind', 'template: {name : $data.templateName, data: $data}');
        $(widgetProperties).append(property);
        $propertiesPanel.append(widgetProperties);

        ko.applyBindings(viewModel, document.body);
    }

    function displayPage() {
        $('.hide-on-load').removeClass('hide-on-load');

        // Accordion must calculate size after it is visible to avoid sizing issues.
        $('#accordion').accordion('refresh');
    }
});