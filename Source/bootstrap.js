 define([
        'require',
        'WAVED',
        'modules/Welcome',
        'knockout',
        'jqueryUI',
        'DataTables',
        'modules/DeleteProject',
        'modules/LoadProject',
    ], function (
        require,
        WAVED,
        WelcomeModule,
        ko,
        $,
        DataTables,
        DeleteProject,
        LoadProject) {
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

        // Project List Table
        var dateRender = function(data) {
            var date = new Date(data * 1000);
            return date.toLocaleString();
        };

        var deleteRender = function(td, cellData, fullData) {
            // Create button
            var button = $('<button>');
            button.append('Delete Project "' + fullData.name + '"');

            // Button click
            var fnDeleteDone;
            var cleanUp = false;

            // Deleting the current project requires the Welcome Dialog
            if (WAVED.viewModel.currentProject.name == fullData.name) {
                fnDeleteDone = function() {
                    /*
                        Open the welcome dialog while hidden to bring
                        up the load dialog again without flashing.
                    */
                    WelcomeModule.welcomeDialog.parent().hide();
                    WelcomeModule.openWelcomeDialog(WAVED.viewModel);
                    WelcomeModule.openLoadDialog(WAVED.viewModel);
                    WelcomeModule.welcomeDialog.parent().show();
                };
                cleanUp = true;
            }
            // Otherwise just refresh the project list
            else {
                fnDeleteDone = function() {
                    LoadProject.updateProjectList(WAVED.viewModel);
                };
            }

            button.click(function() {
                // Delete selected project without going through Welcome Dialog
                var projectDeleted = DeleteProject.tryToDeleteProject(WAVED.viewModel, fullData.name, cleanUp);

                // Update project list to show deletion
                $.when(projectDeleted).done(fnDeleteDone);
            });

            // Button style
            button.button({
                text: false,
                icons: {
                    primary: 'ui-icon-trash'
                }
            });

            $(td).addClass('button-cell').append(button);
        };

        $('#project-list').dataTable({
            'sScrollY': '200px',
            'bPaginate': false,
            'bScrollCollapse': false,
            'aoColumns' : [
                { 'mData': 'name' },
                { 'mData': 'created', 'mRender': dateRender },
                { 'mData': 'lastModified', 'mRender': dateRender },
                { 'mData': null, 'bSortable': false, 'fnCreatedCell': deleteRender },
            ],
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
