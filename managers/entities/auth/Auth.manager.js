const bcrypt = require('bcrypt');
const jwt        = require('jsonwebtoken');

module.exports = class Auth {
    constructor({ config, managers, mongomodels } = {}) {
        this.config = config;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.authsCollection = "Auths";
        this.authExposed = ['login', 'logout'];
    }

    async login({ identifier, password, deviceInfo }) {
        if (!this.mongomodels.user) {
            throw new Error('User model is not loaded');
        }

        const error = 'Invalid email or password.'

        // Find the user by email or username
        const user = await this.mongomodels.user.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user) {
            return { error };
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { error };
        }

        // Generate long token
        const longToken = this.tokenManager.genLongToken({
            userId: user._id,
            userKey: user.role,
        });


   // Generate short token
   const shortToken = this.tokenManager.v1_createShortToken({
    __longToken: longToken,
    __device: deviceInfo,
});


        return {
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            tokens: {
                longToken,
                shortToken,
            },
        };
    }

    async logout({ token }) {
        if (!token) {
            throw new Error('Token is required for logout');
        }
    
        // Add the token to the blacklist
        const decoded = jwt.decode(token);
        if (!decoded) {
            return { error: 'Invalid token' };
        }

        const blacklisted = await this.tokenManager.isBlacklisted(token)

        if(blacklisted){
            return { error: 'You are already logged out' };
        }
    
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        await this.tokenManager.addToBlacklist(token, expiresIn);
    
        return { success: true, message: 'Logged out successfully.' };
    }

    async authenticate({ token, isShortToken = false }) {
        const secret = isShortToken
            ? this.config.dotEnv.SHORT_TOKEN_SECRET
            : this.config.dotEnv.LONG_TOKEN_SECRET;
    
        try {
            const decoded = await this.tokenManager.verifyToken({ token, secret, isShortToken });
            return { success: true, user: decoded };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}