const schema = require('./schema.models');

const validateCreateUser = (data, schemaKey) => {
    const rules = schema[schemaKey];

    if (!rules) {
        throw new Error(`No validation rules defined for ${schemaKey}`);
    }

    const value = data[rules.path];

    if (typeof value !== rules.type.toLowerCase()) {
        return { valid: false, error: `${rules.path} should be of type ${rules.type}` };
    }

    if (rules.length) {
        if (value.length < rules.length.min || value.length > rules.length.max) {
            return {
                valid: false,
                error: `${rules.path} should be between ${rules.length.min} and ${rules.length.max} characters`,
            };
        }
    }

    if (rules.regex && !rules.regex.test(value)) {
        return { valid: false, error: `${rules.path} does not match the required pattern` };
    }

   if(rules.rules){
    const errors = rules.rules
    .filter(rule => !rule.regex.test(value))
    .map(rule => rule.error);

    return errors.length > 0 
        ? { valid: false, error: errors[0] }
        : { valid: true, message: 'Password is valid' };
   }

    return { valid: true };
};

module.exports = { validateCreateUser };
