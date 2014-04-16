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

    GlyphHelper.addEditGlyph = function(glyph) {
        var self = this;
        var glyphAdded = $.Deferred();
        self.glyphDialog.dialog({
            resizable: false,
            width: 500,
            modal: true,
            buttons: {
                'Save': function() {
                    if (glyph.isValid()) {
                        self.glyphDialog.dialog('close');
                        glyphAdded.resolve();
                    } else {
                        glyph.displayErrors();
                    }
                },
                'Cancel': function() {
                    self.glyphDialog.dialog('close');
                    glyphAdded.reject();
                }
            }
        });

        return glyphAdded.promise();
    };

    return GlyphHelper;
});