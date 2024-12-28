const bcrypt = require('bcrypt');

module.exports = class User {
    constructor({ utils, managers, userModels, roleModels } = {}) {
        this.utils = utils;
        this.userModels = userModels;
        this.roleModels = roleModels;
        this.tokenManager = managers.token;
        this.usersCollection = "users";
        this.userExposed = ['createUser'];
    }

    async createUser({ username, email, password, role }) {

        const user = this.userModels.user;

        // // Check if the user already exists
        const fieldsToCheck = { username, email };
        const validationError = await this.utils.validateUniqueFields(user, fieldsToCheck, 'User');
            if (validationError) {
            return validationError;
        }
       
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        if (!user) {
            return { error: 'User model is not loaded'};
        }

        // // Create the user in MongoDB
        const createdUser = await user.create({
            username,
            email,
            password: hashedPassword,
            role,
        });

        // Generate JWT Token
        // const token = this.tokenManager.genLongToken({
        //     userId: createdUser._id,
        //     userKey: createdUser.role,
        // });

        return {
            success: true,
            data: {
                id: createdUser._id,
                username: createdUser.username,
                email: createdUser.email,
                role: createdUser.role,
            },
            // token,
        };
  
    }

    async createSuperadmin({ username, email, password }){

        const role = await this.roleModels.role
        let permission = await role.findOne({ permission: 'superadmin' })

        if (!permission) {
            permission = role.create({ permission: 'superadmin' })
          }

       const superadmin = await this.createUser({ username, email, password, role: permission._id })

       return {
        success: true,
        data: superadmin
       }

    }
};
