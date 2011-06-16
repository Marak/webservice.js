
var errors;

this.defaultMessages = {
    optional:  "",
    pattern:   "",
    maximum:   "",
    minimum:   "",
    maxLength: "",
    minLength: "",
    requires:  "",
    unique:    ""
};
this.defaultSchema = {


};

this.formats = {
  email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
  date: {
    test: function (val) {
      return new Date(val).toString() !== 'Invalid Date';
    }
  }
};

this.validate = function (object, schema) {
    errors = [];

    if (typeof(object) !== 'object' || typeof(schema) !== 'object') {
        throw new(TypeError)("`validate` takes two objects as arguments");
    }

    this.validateObject(object, schema);
    return { valid: !Boolean(errors.length), errors: errors };
};

this.validateObject = function (object, schema) {
    var that = this;
    Object.keys(schema.properties).forEach(function (k) {
        that.validateProperty(object, k, schema.properties[k])
    });
};

this.checkType = function (val, type) {
    switch (type) {
        case 'string':
            return typeof(val) === 'string';
        case 'array':
            return Array.isArray(val);
        case 'object':
            return val && (typeof(val) === 'object') && !Array.isArray(val);
        case 'number':
            return typeof(val) === 'number';
        case 'integer':
            return typeof(val) === 'number' && (val % 1 === 0);
        case 'null':
            return val === null;
        case 'boolean':
            return typeof(val) === 'boolean';
        case 'any':
            return typeof(val) !== 'undefined';
        default:
            return true;
    }
};

this.validateProperty = function (object, property, schema) {
    var type, value = object[property], valid;

    if (property == '_id') {
        return;
    }
    
    if (value === undefined && schema.optional) {
        return;
    }

    if (value === undefined && !schema.optional && schema.default) {
        return;
    }
    
    if (value === undefined && !schema.optional && schema.type !== 'any') {
        return error('optional', property, null, schema);
    }

    if (schema.required && !schema.optional) {
        error('required', property, null, schema);
        return;
    }
    
    if (schema.format) {
        if (!this.formats[schema.format]) {
            return error('format', property, value, schema);
        }
      
        valid = this.formats[schema.format].test(value);
        if (!valid) {
            return error('format', property, value, schema);
        }
    }
    
    if (schema.enum && schema.enum.indexOf(value) === -1) {
        error('enum', property, value, schema);
    }
    if (schema.requires && object[schema.requires] === undefined) {
        error('requires', property, null, schema);
    }
    if (this.checkType(value, schema.type)) {
        switch (schema.type || typeof(value)) {
            case 'string':
                constrain('minLength', value.length, function (a, e) { return a >= e });
                constrain('maxLength', value.length, function (a, e) { return a <= e });
                constrain('pattern',   value,        function (a, e) { return e.test(a) });
                break;
            case 'number':
                constrain('minimum',     value, function (a, e) { return a >= e });
                constrain('maximum',     value, function (a, e) { return a <= e });
                constrain('divisibleBy', value, function (a, e) { return a % e === 0 });
        }
    } else {
        error('type', property, typeof(value), schema);
    }

    function constrain(name, value, assert) {
        if ((name in schema) && !assert(value, schema[name])) {
            error(name, property, value, schema);
        }
    }
};

function error(attribute, property, actual, schema) {
    var message = schema.messages && schema.messages[property] || schema.message || "no default message";
    errors.push({
        attribute: attribute,
        property: property,
        expected: schema[attribute] || exports.defaultSchema[attribute],
        actual: actual,
        message: message
    });
}

