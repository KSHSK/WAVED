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

        // Project Tree Animations
        $('.tree-folder-icon').click( function () {
            // Shorten the animation with an empty folder to
            // avoid 'wobbling' effect
            var folder = $(this);
            var duration = folder.siblings('ul').children().size() > 0 ? 300 : 0;

            folder.siblings('ul').slideToggle(duration);
            folder.toggleClass('closed');
        });

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

        $('.preview-icon-button').button({
            text: false,
            icons: {
                primary: 'ui-icon-search'
            }
        });

        // Setup accordion
        $('#accordion').accordion({
            animate: false,
            heightStyle: 'fill'
        });

        $('#accordion').on('accordionactivate', function(event, ui) {
            if ($('#accordion').accordion('option', 'active') === 5) {
                $('#widget-select').prop('disabled', false);
            } else {
                $('#widget-select').prop('disabled', true);
            }
        });

        $('input').addClass('ui-corner-all');

        var viewModel = WAVED.viewModel;
        ko.applyBindings(viewModel, document.body);
    }

    function displayPage() {
        $('.hide-on-load').removeClass('hide-on-load');

        // Accordion must calculate size after it is visible to avoid sizing issues.
        $('#accordion').accordion('refresh');

        // Accordion must also update on window resize.
        $(window).resize(function() {
            $('#accordion').accordion('refresh');
        });
    }
});
