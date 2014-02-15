/*global define*/
define([
        'models/NumberPropertyType',
        'models/Property',
        'util/defined'
    ], function(
        NumberPropertyType,
        Property,
        defined){
    'use strict';

    var Workspace = function(width, height) {
        if (defined(width)) {
            this._width = width;
        } else {
            this._width = new Property({
                displayName: 'Width',
                value: 750,
                propertyType: NumberPropertyType,
                isValidValue: function(value) {
                    return (typeof value === 'number');
                }
            });
        }
        if (defined(height)) {
            this._height = height;
        } else {
            this._height = new Property({
                displayName: 'Height',
                value: 600,
                propertyType: NumberPropertyType,
                isValidValue: function(value) {
                    return (typeof value === 'number');
                }
            });
        }
    };

    Object.defineProperties(Workspace.prototype, {
        name: {
            get: function() {
                return {displayName: 'Workspace'};
            }
        },
        width: {
            get: function() {
                return this._width;
            },
            set: function(value) {
                this._width = value;
            }
        },
        height: {
            get: function(){
                return this._height;
            },
            set: function(value) {
                this._height = value;
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
