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
                'Save': {
                    text: 'Save',
                    'data-bind': 'jQueryDisable: glyphDialogHasErrors()',
                    click: function() {
                        if (!self.hasErrors(glyph)) {
                            glyphAdded.resolve();
                            glyphDialog.dialog('close');
                        } else {
                            glyph.displayErrors(ValueType.DISPLAY_VALUE);
                        }
                    },
                    create: function() {
                        ko.applyBindings(glyph, this);
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

    GlyphHelper.hasErrors = function(glyph) {
        return !glyph.isValid(ValueType.DISPLAY_VALUE);
    };

    return GlyphHelper;
});