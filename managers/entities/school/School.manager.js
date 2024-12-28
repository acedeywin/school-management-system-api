module.exports = class School {
    constructor({ utils, mongoModels } = {}) {
        this.utils = utils;
        this.mongoModels = mongoModels;
        this.schoolsCollection = "schools";
        this.schoolExposed = ['createSchool', 'getSchools', 'getSchoolById', 'updateSchool', 'deleteSchool'];
    }

    // Create a new school
    async createSchool({ name, address, phoneNumber, email, website, administrators }) {

        const school = this.mongoModels.school

        if (!school) {
            return { error: 'School model is not loaded' };
        }

        // // Check if the school already exists
        const fieldsToCheck = { name, phoneNumber, email, website };
        const validationError = await this.utils.validateUniqueFields(school, fieldsToCheck, 'School');
            if (validationError) {
            return validationError;
        }

     await this.utils.validateAdministrators(administrators, this.mongoModels.school)

        // Create the school
        const newSchool = await school.create({
            name,
            address,
            phoneNumber,
            email,
            website,
            administrators,
            createdAt: new Date(),
        });

        return {
            success: true,
            school: newSchool,
        };
    }

    // Get a list of all schools
    async getSchools({ adminId, page = 1, limit = 10 }) {
         // Calculate the number of documents to skip
         const skip = (page - 1) * limit;
         const school = this.mongoModels.school;

         // Query schools with pagination and populate classrooms
         const schools = await school.find({
                 administrators: { $in: [adminId] },
             })
             .populate('classrooms') 
             .skip(skip) 
             .limit(limit);
 
         // Count the total number of matching schools for pagination metadata
         const totalSchools = await school.countDocuments({
             administrators: { $in: [adminId] },
         });
 
         if (!schools || schools.length === 0) {
             return { error: 'No school found for the given admin ID' };
         }
 
         return {
             success: true,
             schools,
             pagination: {
                 currentPage: page,
                 totalPages: Math.ceil(totalSchools / limit),
                 totalSchools,
             },
         };
    }

    // Get a single school by ID
    async getSchoolById({ schoolId, adminId }) {
        const school = await this.mongoModels.school.findOne({
            _id: schoolId,
            administrators: { $in: [adminId] },
        }).populate('classrooms');

        if (!school) {
            return { error: 'School not found or you do not have access to this school' };
        }

        return {
            success: true,
            school,
        };
    }

    // Update a school
    async updateSchool({ schoolId, updates, superadminId }) {

        // Fetch the school document
        const school = await this.mongoModels.school.findById(schoolId);

        if (!school) {
            return { error: 'School not found.' };
        }

        // Check if superadminId is part of administrators
        if (!school.administrators.includes(superadminId)) {
            return { error: 'Unauthorized. You are not an authorized administrator of this school.' };
        }

        // Handle administrators updates
        if (updates.administrators) {
            const { add = [], remove = [] } = updates.administrators;

            // Add administrators, ensuring no duplicates
            for (const adminId of add) {
                if (
                    !school.administrators.includes(adminId)
                ) {
                    school.administrators.push(adminId);
                }
            }

            // Remove administrators
            school.administrators = school.administrators.filter(
                adminId => !remove.includes(adminId.toString())
            );
        }

        // Update other fields
        const updatableFields = ['name', 'address', 'phoneNumber', 'email', 'website'];
        for (const field of updatableFields) {
            if (updates[field] !== undefined) {
                school[field] = updates[field];
            }
        }

        // Update the updatedAt field
        school.updatedAt = new Date();

        // Save the updated school document
        const updatedSchool = await school.save();

        return {
            success: true,
            school: updatedSchool,
        };
    }

    // Delete a school
    async deleteSchool({ schoolId, superadminId }) {

        const schoolModel = this.mongoModels.school

        // Fetch the school document
       const school = await schoolModel.findById(schoolId);

        if (!school) {
            return { error: 'School not found.' };
        }

        // Check if the superadminId is in the administrators array
        if (!school.administrators.includes(superadminId)) {
            return { error: 'Unauthorized. Only authorized administrators can delete this school.' };
        }

        // Delete the school
        const deletedSchool = await schoolModel.findByIdAndDelete({_id: schoolId});

        if (!deletedSchool) {
            return { error: 'Deletion failed. School not found.' };
        }

        return {
            success: true,
            message: 'School deleted successfully.',
        };
    }
};
