define(['knockout',
        'util/defined',
        'models/Constants/SelectedType'
    ],function(
        ko,
        defined,
        SelectedType
    ){
    'use strict';

    var self;
    var ProjectTree = function() {
        self = this;
        this.selectedType = SelectedType.PROJECT;

        ko.track(this);
    };

    ProjectTree.prototype.tryToDeleteSelected = function(wavedViewModel) {
        switch (self._selectedType) {
            case SelectedType.PROJECT:
                return wavedViewModel.tryToDeleteProject();
            case SelectedType.COMPONENT:
                return wavedViewModel.removeSelectedComponent();
            case SelectedType.DATA:
                return wavedViewModel.markDataForDeletion();
            case SelectedType.ACTION:
                return wavedViewModel.removeSelectedAction();
            case SelectedType.EVENT:
                return wavedViewModel.removeSelectedEvent();
        }
    };

    ProjectTree.prototype.isSelected = function(wavedViewModel, type, value) {
        if (self.selectedType !== type) {
            return false;
        }

        switch (type) {
            case SelectedType.PROJECT:
                return true;
            case SelectedType.COMPONENT:
                return wavedViewModel.selectedComponent === value;
            case SelectedType.DATA:
                return wavedViewModel.selectedDataSet === value;
            case SelectedType.ACTION:
                return wavedViewModel.selectedAction === value;
            case SelectedType.EVENT:
                return wavedViewModel.selectedEvent === value;
        }
    };

    ProjectTree.prototype.select = function(wavedViewModel, type, value) {
        self.selectedType = type;

        switch (type) {
            case SelectedType.PROJECT:
                break;
            case SelectedType.COMPONENT:
                wavedViewModel.selectedComponent = value;
                break;
            case SelectedType.DATA:
                wavedViewModel.selectedDataSet = value;
                break;
            case SelectedType.ACTION:
                wavedViewModel.selectedAction = value;
                break;
            case SelectedType.EVENT:
                wavedViewModel.selectedEvent = value;
                break;
        }
    };

    return ProjectTree;
});