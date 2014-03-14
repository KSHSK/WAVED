define([
        'models/Property/StringProperty',
        'util/createValidator',
        'util/defined'
    ], function(
        StringProperty,
        createValidator,
        defined) {
    'use strict';

    /**
     * Gets an standard name String property instance.
     *
     * @param displayName
     *            The display name of the property.
     * @param uniqueItemInstance
     *            The item instance used for the unique constraint. If not supplied, the unique constraint is not
     *            enforced.
     */
    var getNamePropertyInstance = function(displayName, uniqueItemInstance) {
        // Valid value options
        var validValueOptions = {
            regex: new RegExp('^[a-zA-Z0-9_\\- ]+$'),
            minLength: 1,
            maxLength: 50
        };

        // Add unique option if uniqueItemInstance is supplied
        if (defined(uniqueItemInstance)) {
            validValueOptions.unique = {
                namespace: 'name',
                item: uniqueItemInstance
            };
        }

        return new StringProperty({
            displayName: displayName,
            value: '',
            validValue: createValidator(validValueOptions),
            errorMessage: 'Must be a unique value between 1 and 50 characters.<br>Can only include alphanumeric characters, hyphens (-), underscores (_), and spaces.'
        });
    };

    return getNamePropertyInstance;
});