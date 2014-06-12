define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Constants/ValueType',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
        HistoryMonitor,
        Action,
        PropertyAction,
        QueryAction,
        ValueType,
        defined,
        ko,
        $
    ){
    'use strict';
    var GlyphHelper = {};

    var glyphDialog = $('#glyph-editor-dialog');

    GlyphHelper.addEditGlyph = function(glyph) {
        var self = this;
        var glyphAdded = $.Deferred();

        glyphDialog.dialog({
            resizable: false,
            width: 500,
            modal: true,
            buttons: {
                'Save': function() {
                    if (glyph.isValid(ValueType.DISPLAY_VALUE)) {
                        glyphAdded.resolve();
                        glyphDialog.dialog('close');
                    } else {
                        glyph.displayErrors(ValueType.DISPLAY_VALUE);
                    }
                },
                'Cancel': function() {
                    glyphDialog.dialog('close');
                }
            },
            close: function(event, ui) {
                glyphAdded.reject();
            }
        });

        return glyphAdded.promise();
    };

    return GlyphHelper;
});