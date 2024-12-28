module.exports = class UserController {
    constructor({ userManager }) {
        this.userManager = userManager;
    }

    async createUser(req, res) {
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
            return res.status(403).json({ error }) 
        }
    }

    async createSuperadmin(req, res){
        try {
            const { username, email, password } = req.body;

            // Call to userManager to create a user
            const result = await this.userManager.createSuperadmin({ username, email, password });

             // Check for errors in the result
             if (result.error) {
                return res.status(400).json({ success: false, error: result.error });
            }

            // Successful creation
            return res.status(201).json(result);
            
        } catch (error) {
            return res.status(403).json({ error }) 
        }
    }
};
