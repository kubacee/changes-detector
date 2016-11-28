(function($) {
    "use strict";

    /**
     * @param $container
     * @param options
     */
    var ChangeDetector = function($container, options) {
        var self = this;

        // ~ Properties
        var _$container = false;
        var _form_is_change = false;
        var _excludedFields = [];
        var _changes = {};
        var _history_changes = {};

        // ~

        /** Constructor */
        var _constructor = function($container, options) {
            _$container = $container;

            if ('undefined' !== typeof options) {
                if ('undefined' !== typeof options.excludedFields) {
                    _excludedFields = options.excludedFields;
                }
            }
        };
        _constructor($container, options);

        // ~

        this.startDetecting = function() {
            _bindChangesEvents();
        };

        this.destroy = function() {
            this.clear();
            _unbindChangesEvents();
        };

        /**
         * Clear all vars in object.
         */
        this.clear = function() {
            _form_is_change = false;
            _changes = {};
            _history_changes = {};
        };

        // ~ Getters and setters

        /**
         * Set if form is change or not
         *
         * @param value
         */
        this.setFormChange = function(value) {
            _form_is_change = value
        };

        /**
         * @returns {boolean}
         */
        this.wasChanged = function() {
            return _form_is_change;
        };

        /**
         * @returns {Array}
         */
        this.getExcludedFields = function() {
            return _excludedFields;
        };

        /**
         * @param excludedFields
         */
        this.setExcludedFields = function(excludedFields) {
            _excludedFields = excludedFields;
        };

        /**
         * Show changed fields.
         *
         * @param actionType
         * @returns {{}}
         */
        this.getChanges = function(actionType) {
            if ('history' == actionType) {
                return this.getHistoryChanges();
            }

            return _changes;
        };

        /**
         * @returns {{}}
         */
        this.getHistoryChanges = function() {
            return _history_changes;
        };

        /**
         * @returns {boolean}|html
         */
        this.getContainer = function() {
            return _$container;
        };

        // ~ Events

        /**
         * @private
         */
        var _bindChangesEvents = function() {
            /* Add every change event here */
            $container.on('change', 'input[type=text], input[type=hidden], select, textarea', _formWasChangeEventBinder);
            $container.on('click', '.checkbox-container .checkbox', _formWasChangeEventBinder);

            // ~

            $container.on('submit', _submitEventBinder);
            $(window).on('beforeunload', _confirmExitMessageEventBinder);
        };

        /**
         * @private
         */
        var _unbindChangesEvents = function() {
            /* Add every change event here */
            $container.off('change', 'input[type=text], input[type=hidden], select, textarea', _formWasChangeEventBinder);
            $container.off('click', '.checkbox-container .checkbox', _formWasChangeEventBinder);

            // ~

            $container.off('submit', _submitEventBinder);
            $(window).off('beforeunload', _confirmExitMessageEventBinder);
        };

        // ~

        /**
         * @param event
         * @private
         */
        var _formWasChangeEventBinder = function(event) {
            var $self = $(this);
            var elementId = $self.attr('id');

            if (_excludedFields.indexOf(elementId) > -1) {
                console.log('This field is excluded: ', elementId);
                return false;
            }

            // ~

            _addChangedField(elementId);
            _addToHistoryChanges($self);

            // ~

            console.log('Field was change: ', elementId);
            self.setFormChange(true);
        };

        /**
         * @param event
         * @private
         */
        var _confirmExitMessageEventBinder = function(event) {
            tinyMCE.triggerSave();

            if (true == _form_is_change) {
                console.log(self.getChanges());

                unlockScreen(0);
                return translate('global.confirm_exit_without_save_changes');
            }
        };

        /**
         * @param event
         * @private
         */
        var _submitEventBinder = function(event) {
            /* Remove confirm message */
            $(window).off('beforeunload', _confirmExitMessageEventBinder);
        };

        // ~ Helpers

        /**
         * @param field
         * @private
         */
        var _addChangedField = function(field) {
            if ('undefined' !== typeof _changes[field]) {
                var count = _changes[field];
                _changes[field] = ++count;
            }
            else {
                _changes[field] = 1;
            }
        };

        /**
         * @param $element
         * @private
         */
        var _addToHistoryChanges = function($element) {
            //console.log($element);
        }
    };

    // ~

    /**
     * @param options
     * @returns {*}
     */
    $.fn.changesDetector = function(options) {
        var self = this;
        var $container = $(self);

        // ~

        /** @var changeDetectorObject ChangeDetector */
        var changeDetectorObject = $container.data('changesDetector');

        if (changeDetectorObject) {
            /* Do nothing */
        } else {
            changeDetectorObject = new ChangeDetector($container, options);

            changeDetectorObject.startDetecting();
            $container.data('changesDetector', changeDetectorObject);
        }

        // ~

        if (options == 'destroy') {
            changeDetectorObject.destroy();
            $container.data('changesDetector', null);
        }
        else if (options == 'clear') {
            changeDetectorObject.clear();
        }

        // ~

        return changeDetectorObject;
    };
})(jQuery);