/*global define*/
/**
 * Bootstraps Angular onto the window.document node
 * http://www.startersquad.com/blog/angularjs-requirejs/
 */
 define([
        'require',
        'util/koExtenders',
        'app',
        'WAVED',
        'modules/Welcome',
        'jquery'
    ], function (
        require,
        koExtenders,
        app,
        WAVED,
        WelcomeModule,
        $) {
    'use strict';

    require(['../ThirdParty/domReady!'], function(document) {
        setupUI();
        displayPage();
        WAVED.start();
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
    }

    function displayPage() {
        $('.hide-on-load').removeClass('hide-on-load');

        // Accordion must calculate size after it is visible to avoid sizing issues.
        $('#accordion').accordion('refresh');
    }
});