define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
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
        defined,
        ko,
        $
    ){
    'use strict';
    var GlyphHelper = {};

    var glyphDialog = $('#glyph-editor-dialog');

    GlyphHelper.resetGlyphDialog = function(glyph) {
        glyph.properties.forEach(function(prop) {
            prop.displayValue = prop.originalValue;
        });
    };

    GlyphHelper.addEditGlyph = function(glyph) {
        var self = this;

        self.resetGlyphDialog(glyph);
        var glyphAdded = $.Deferred();
        glyphDialog.dialog({
            resizable: false,
            width: 500,
            modal: true,
            buttons: {
                'Save': function() {
                    if (glyph.isValid()) {
                        glyphAdded.resolve();
                        glyphDialog.dialog('close');
                    } else {
                        glyph.displayErrors('displayValue');
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