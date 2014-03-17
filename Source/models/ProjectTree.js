define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var self;
    var ProjectTree = function() {
        self = this;
        this._selectedType = this.SelectedTypeEnum.PROJECT;

        ko.track(this);
    };

    ProjectTree.prototype.tryToDeleteSelected = function(wavedViewModel) {
        switch (self._selectedType) {
            case self.SelectedTypeEnum.PROJECT:
                return wavedViewModel.tryToDeleteProject();
            case self.SelectedTypeEnum.COMPONENT:
                // TODO : Try to delete component
                return;
            case self.SelectedTypeEnum.DATA:
                return wavedViewModel.markDataForDeletion();
            case self.SelectedTypeEnum.ACTION:
                return wavedViewModel.removeSelectedAction();
            case self.SelectedTypeEnum.EVENT:
                return wavedViewModel.removeSelectedEvent();
        }
    };

    ProjectTree.prototype.isSelected = function(wavedViewModel, type, value) {
        if (self.selectedType != type) {
            return false;
        }

        switch (type) {
            case self.SelectedTypeEnum.PROJECT:
                return true;
            case self.SelectedTypeEnum.COMPONENT:
                return wavedViewModel.selectedWidget === value;
            case self.SelectedTypeEnum.DATA:
                return wavedViewModel.selectedDataSet === value;
            case self.SelectedTypeEnum.ACTION:
                return wavedViewModel.selectedAction === value;
            case self.SelectedTypeEnum.EVENT:
                return wavedViewModel.selectedEvent === value;
        }
    };

    ProjectTree.prototype.select = function(wavedViewModel, type, value) {
        self.selectedType = type;

        switch (type) {
            case self.SelectedTypeEnum.PROJECT:
                break;
            case self.SelectedTypeEnum.COMPONENT:
                wavedViewModel.selectedWidget = value;
            case self.SelectedTypeEnum.DATA:
                wavedViewModel.selectedDataSet = value;
            case self.SelectedTypeEnum.ACTION:
                wavedViewModel.selectedAction = value;
            case self.SelectedTypeEnum.EVENT:
                wavedViewModel.selectedEvent = value;
        }
    };

    Object.defineProperties(ProjectTree.prototype, {
        SelectedTypeEnum: {
            get: function() {
                return {
                    PROJECT: 0,
                    COMPONENT: 1,
                    DATA: 2,
                    ACTION: 3,
                    EVENT: 4
                };
            }
        },
        selectedType: {
            get: function() {
                return this._selectedType;
            },
            set: function(value) {
                this._selectedType = value;
            }
        }
    });

    return ProjectTree;
});