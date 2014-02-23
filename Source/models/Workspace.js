/*global define*/
define([
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'util/defined',
        'knockout'
    ], function(
        StringProperty,
        NumberProperty,
        defined,
        ko){
    'use strict';

    var Workspace = function(width, height) {
        this.name = new StringProperty({
            displayName: 'Name',
            value: 'Workspace'
        });
        if (defined(width)) {
            this.width = width;
        } else {
            this.width = new NumberProperty({
                displayName: 'Width',
                value: 750
            });
        }
        if (defined(height)) {
            this.height = height;
        } else {
            this.height = new NumberProperty({
                displayName: 'Height',
                value: 600
            });
        }
        ko.track(this);
    };

    Object.defineProperties(Workspace.prototype, {
        viewModel: {
            get: function() {
                return  this;
            }
        },
        properties: {
            get: function() {
                return [this.width, this.height];
            }
        }
    });

    return Workspace;

});
