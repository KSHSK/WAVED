 define([
        'require',
        'WAVED',
        'modules/Welcome',
        'knockout',
        'jqueryUI'
    ], function (
        require,
        WAVED,
        WelcomeModule,
        ko,
        $) {
    'use strict';

    require(['../ThirdParty/domReady!', 'koExternalTemplateEngine'], function(document) {
        setupUI();
        displayPage();
        WelcomeModule.start(WAVED.viewModel);
    });

    function setupUI() {
        $('#new-button').button();
        $('#undo-button').button();
        $('#redo-button').button();
        $('#load-button').button();
        $('#save-button').button();
        $('#save-as-button').button();
        $('#export-button').button();
        $('#refresh-button').button();
        $('#google-analytics-add-button').button();
        $('#google-analytics-remove-button').button();
        $('#google-analytics-clear-button').button();
        $('#bind-data-add-data-file-button').button();

        // Add/Edit/Remove Buttons.
        $('.add-icon-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-plus'
            }
        });

        $('.edit-icon-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-pencil'
            }
        });

        $('.delete-icon-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-trash'
            }
        });

        $('.refresh-icon-button').button({
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
        ko.applyBindings(viewModel, document.body);
    }

    function displayPage() {
        $('.hide-on-load').removeClass('hide-on-load');

        // Accordion must calculate size after it is visible to avoid sizing issues.
        $('#accordion').accordion('refresh');
    }
});