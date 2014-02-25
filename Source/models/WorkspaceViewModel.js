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

    var WorkspaceViewModel = function(width, height) {
        this.name = new StringProperty({
            displayName: 'Name',
            value: 'Workspace'
        });

        var widthOptions;
        if (defined(width)) {
            widthOptions = {
                displayName: width.displayName,
                value: width.value
            };
        }
        else {
            widthOptions = {
                displayName: 'Width',
                value: 750
            };
        }
        this.width = new NumberProperty(widthOptions);

        var heightOptions;
        if (defined(height)) {
            heightOptions = {
                displayName: height.displayName,
                value: height.value
            };
        }
        else {
            heightOptions = {
                displayName: 'Height',
                value: 600
            };
        }
        this.height = new NumberProperty(heightOptions);

        ko.track(this);
    };

    Object.defineProperties(WorkspaceViewModel.prototype, {
        viewModel: {
            get: function() {
                return this;
            }
        },
        properties: {
            get: function() {
                return [this.width, this.height];
            }
        }
    });

    return WorkspaceViewModel;
});
