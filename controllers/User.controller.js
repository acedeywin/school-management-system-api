module.exports = class UserController {
    constructor({ userManager }) {
        this.userManager = userManager;
    }

    async createUser(req, res, next) {
        try {
            const { username, email, password, role } = req.body;

            // Call to userManager to create a user
            const result = await this.userManager.createUser({ username, email, password, role });

            // Check for errors in the result
            if (result.error) {
                return res.status(400).json({ success: false, error: result.error });
            }

            // Successful creation
            return res.status(201).json(result);
        } catch (error) {
            console.error('error', error);
            next(error)

            // Return internal server error
            // return res.status(500).json({ error: error.message });
        }
    }
};
