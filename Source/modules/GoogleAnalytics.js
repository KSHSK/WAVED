/**
 * A module for Google Analytics integration
 */
define([        
        'angular',
        'WAVED',
        '../modules/GoogleAnalytics',
        'jquery'
    ], function(
        angular,
        WAVED,
        GoogleAnalyticsModule,
        $) {
    
    var GoogleAnalyticsModule = {
        unboundDisplay: $('#google-analytics-unbound'),
        boundDisplay: $('#google-analytics-bound'),
        uaPreview: $('#google-analytics-ua-preview'),
        categoryPreview: $('#google-analytics-category-preview'),
        uaInputField: $('#google-analytics-ua'),
        categoryInputField: $('#google-analytics-category'),
        uaError: $('#google-analytics-ua-error'),
        categoryError: $('#google-analytics-category-error'),
        ua: '',
        category: '',
        
        addGoogleAnalytics: function() {
            // Validate on submit
            if(!(WAVED.validateInputField(this.uaInputField) && WAVED.validateInputField(this.categoryInputField))){
                return;
            }
            
            this.setUA($(this.uaInputField).val());
            this.setCategory($(this.categoryInputField).val());
            
            // Clear error
            this.categoryError.text('');
            this.uaError.text('');
            
            // Swap the visibility of the divs
            this.unboundDisplay.hide();
            this.boundDisplay.show();
            
            // Update the previews
            this.uaPreview.text(this.ua);
            this.categoryPreview.text(this.category);
        },
        
        removeGoogleAnalytics: function() {
            this.unboundDisplay.show();
            this.boundDisplay.hide();
            
            this.uaPreview.text('');
            this.categoryPreview.text('');
            
            this.setUA('');
            this.setCategory('');
            
            this.uaInputField.val('');
            this.categoryInputField.val('');
        },
        
        clearGoogleAnalyticsFields: function() {
            this.uaInputField.val('');
            this.categoryInputField.val('');
            this.categoryError.text('');
            this.uaError.text('');
        },
        
        getUA: function() {
            return this.ua;
        },
        
        getCategory: function() {
            return this.category;
        },
        
        setUA: function(ua) {
            this.ua = ua;
        },
        
        setCategory: function(category) {
            this.category = category;
        }
    };
    
    return GoogleAnalyticsModule;
});