define([
        'models/ComponentViewModel',
        'models/SuperComponentViewModel',
        'models/Property/ArrayProperty',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Property/GlyphSize/GlyphSizeSelectionProperty',
        'modules/UniqueTracker',
        'util/defined',
        'knockout'
    ], function(
        ComponentViewModel,
        SuperComponentViewModel,
        ArrayProperty,
        StringProperty,
        NumberProperty,
        GlyphSizeSelectionProperty,
        UniqueTracker,
        defined,
        ko) {
    'use strict';

    var GlyphViewModel = function(state, boundData) {
        var self = this;
        state = (defined(state)) ? state : {};
        ComponentViewModel.call(this, state);

        if (!defined(state.name)) {
            var namespace = SuperComponentViewModel.getUniqueNameNamespace();
            this.name.value = UniqueTracker.getDefaultUniqueValue(namespace, GlyphViewModel.getType(), this);
        }

        this.boundData = boundData;

        this.dataSet = new ArrayProperty({
            displayName: 'Data Set',
            options: this.boundData,
            getOptionText: function(value) {
                return value.name;
            },
            ondisplaychange: function(newValue){
                self.latitude.options = newValue.dataFields;
                self.longitude.options = newValue.dataFields;
            }
        });
        this.color = new StringProperty({
            displayName: 'Color',
            value: 'Red'
        });
        this.opacity = new NumberProperty({
            displayName: 'Opacity',
            value: 80
        });
        this.size = new GlyphSizeSelectionProperty({
            displayName: 'Size',
            value: ''
        }, this);
        this.latitude = new ArrayProperty({
            displayName: 'Latitude'
        });
        this.longitude = new ArrayProperty({
            displayName: 'Longitude'
        });

        this.setState(state);

        this._dom = undefined;

        ko.track(this);
    };

    GlyphViewModel.prototype = Object.create(ComponentViewModel.prototype);

    GlyphViewModel.prototype.getState = function() {
        var state = ComponentViewModel.prototype.getState.call(this);
        state.type = GlyphViewModel.getType();
        state.dataSet = this.dataSet.getState();
        state.color = this.color.getState();
        state.opacity = this.opacity.getState();
        state.size = this.size.getState();
        state.latitude = this.latitude.getState();
        state.longitude = this.longitude.getState();

        return state;
    };

    GlyphViewModel.prototype.setState = function(state) {
        ComponentViewModel.prototype.setState.call(this, state);

        if (defined(state.dataSet)) {
            this.dataSet.setState(state.dataSet);
        }
        if (defined(state.color)) {
            this.color.setState(state.color);
        }
        if (defined(state.opacity)) {
            this.opacity.setState(state.opacity);
        }
        if (defined(state.size)) {
            this.size.setState(state.size);
        }
        if (defined(state.latitude)) {
            this.latitude.setState(state.latitude);
        }
        if (defined(state.longitude)) {
            this.longitude.setState(state.longitude);
        }
    };

    GlyphViewModel.prototype.clone = function() {
        return new GlyphViewModel(this.getState(), this.boundData);
    };

    /**
     * Static method that returns the type String for this class.
     */
    GlyphViewModel.getType = function() {
        return 'Glyph';
    };

    Object.defineProperties(GlyphViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.dataSet, this.color, this.opacity, this.size, this.latitude, this.longitude, this.visible,
                this.logGoogleAnalytics];
            }
        }
    });

    return GlyphViewModel;
});