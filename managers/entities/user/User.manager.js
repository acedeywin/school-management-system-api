const bcrypt = require('bcrypt');

module.exports = class User {
    constructor({ utils, managers, mongomodels } = {}) {
        this.utils = utils;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "users";
        this.userExposed = ['createUser'];
    }

    async createUser({ username, email, password, role }) {

        // // Check if the user already exists
        const fieldsToCheck = { username, email };
        const validationError = await this.utils.validateUniqueFields(this.mongomodels.user, fieldsToCheck);
            if (validationError) {
            return validationError;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        if (!this.mongomodels.user) {
            throw new Error('User model is not loaded');
        }

        // // Create the user in MongoDB
        const createdUser = await this.mongomodels.user.create({
            username,
            email,
            password: hashedPassword,
            role,
        });

        // Generate JWT Token
        const token = this.tokenManager.genLongToken({
            userId: createdUser._id,
            userKey: createdUser.role,
        });

        return {
            success: true,
            user: {
                id: createdUser._id,
                username: createdUser.username,
                email: createdUser.email,
                role: createdUser.role,
            },
            token,
        };
  
    }
};
