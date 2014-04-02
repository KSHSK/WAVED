define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
        HistoryMonitor,
        Action,
        PropertyAction,
        QueryAction,
        defined,
        displayMessage,
        ko,
        $
    ){
    'use strict';
    var GlyphHelper = {};

    GlyphHelper.glyphDialog = $('#glyph-editor-dialog');

    GlyphHelper.addEditGlyph = function() {
        var self = this;
        var glyphAdded = $.Deferred();
        var added = false;
        self.glyphDialog.dialog({
            resizable: false,
            width: 500,
            modal: true,
            buttons: {
                'Save': function() {
                    added = true;
                    self.closeActionDialog();
                    glyphAdded.resolve();
                },
                'Cancel': function() {
                    self.closeActionDialog();
                    glyphAdded.reject();
                }
            }
        });

        return glyphAdded.promise();
    };

    GlyphHelper.closeActionDialog = function(viewModel) {
        this.glyphDialog.dialog('close');
    };


    return GlyphHelper;
});