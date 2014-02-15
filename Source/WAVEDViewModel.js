/*global define*/
define([
        './modules/NewProject',
        './modules/LoadProject',
        'knockout'
    ], function(
        NewProject,
        LoadProject,
        ko) {
    'use strict';

    var WAVEDViewModel = function() {
        this._dirty = false;

        this._projectName = '';

        ko.track(this);
    };

    WAVEDViewModel.prototype.tryToCreateNewProject = function(){
        return NewProject.tryToCreateNewProject(this);
    };

    WAVEDViewModel.prototype.tryToLoadProject = function() {
        return LoadProject.tryToLoadProject(this);
    };

    Object.defineProperties(WAVEDViewModel.prototype, {
        projectName: {
            get: function() {
                return this._projectName;
            },
            set: function(value) {
                this._projectName = value;
            }
        },
        dirty: {
            get: function() {
                return this._dirty;
            },
            set: function(value) {
                if (typeof value === Boolean){
                    this._dirty = value;
                }
            }
        }
    });

    return WAVEDViewModel;
});