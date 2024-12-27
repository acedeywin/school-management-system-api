module.exports = class AuthController {
    constructor({ authManager }) {
        this.authManager = authManager;
    }

    async login(req, res, next){
        try {
            const { identifier, password } = req.body
            const deviceInfo = req.headers['user-agent'];

            const result = await this.authManager.login({ identifier, password, deviceInfo })

            // Check for errors in the result
            if (result.error) {
                return res.status(400).json({ success: false, error: result.error });
            }

            // Successful creation
            return res.status(201).json(result);
            
        } catch (error) {
            console.error('error', error);
            next(error)
        }
    }

    async logout(req, res, next){
        try {

            const { token } = req.query

            const result = await this.authManager.logout({ token })

             // Check for errors in the result
             if (result.error) {
                return res.status(400).json({ success: false, error: result.error });
            }

            // Successful creation
            return res.status(201).json(result);
          
        } catch (error) {
            console.error('error', error);
            next(error) 
        }
    }
}