const School = require('../../../../managers/entities/school/School.manager')

describe('School Class', () => {
  let school
  let mockUtils
  let mockMongoModels

  beforeEach(() => {
    mockUtils = {
      validateUniqueFields: jest.fn(),
      validateAdministrators: jest.fn()
    }

    mockMongoModels = {
      school: {
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndDelete: jest.fn(),
        countDocuments: jest.fn(),
        save: jest.fn()
      }
    }

    mockMongoModels.school.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]) // Or mocked data for the success case
        })
      })
    })

    mockMongoModels.school.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null) // Or mocked data for the success case
    })

    school = new School({ utils: mockUtils, mongoModels: mockMongoModels })
  })

  describe('createSchool', () => {
    it('should return error if school model is not loaded', async () => {
      school.mongoModels.school = null

      const result = await school.createSchool({
        name: 'Test School',
        address: '123 Test Street',
        phoneNumber: '1234567890',
        email: 'test@example.com',
        website: 'www.testschool.com',
        administrators: [],
        adminId: 'adminId'
      })

      expect(result).toEqual({ errors: 'School model is not loaded' })
    })

    it('should create a school successfully', async () => {
      mockUtils.validateUniqueFields.mockResolvedValue(null)
      mockUtils.validateAdministrators.mockResolvedValue(null)
      mockMongoModels.school.create.mockResolvedValue({
        _id: 'schoolId',
        name: 'Test School',
        address: '123 Test Street',
        phoneNumber: '1234567890',
        email: 'test@example.com',
        website: 'www.testschool.com',
        administrators: ['adminId']
      })

      const result = await school.createSchool({
        name: 'Test School',
        address: '123 Test Street',
        phoneNumber: '1234567890',
        email: 'test@example.com',
        website: 'www.testschool.com',
        administrators: [],
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'School created successfully.',
        data: {
          _id: 'schoolId',
          name: 'Test School',
          address: '123 Test Street',
          phoneNumber: '1234567890',
          email: 'test@example.com',
          website: 'www.testschool.com',
          administrators: ['adminId']
        }
      })
    })
  })

  describe('getSchools', () => {
    it('should return error if no schools are found', async () => {
      mockMongoModels.school.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]) // No schools found
          })
        })
      })

      const result = await school.getSchools({
        adminId: 'adminId',
        page: 1,
        limit: 10
      })

      expect(result).toEqual({
        errors: 'No school found for the given admin ID'
      })
    })

    it('should fetch schools successfully', async () => {
      mockMongoModels.school.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest
              .fn()
              .mockResolvedValue([
                { _id: 'schoolId1', name: 'School 1', classrooms: [] }
              ]) // Mocked school data
          })
        })
      })

      mockMongoModels.school.countDocuments.mockResolvedValue(1)

      const result = await school.getSchools({
        adminId: 'adminId',
        page: 1,
        limit: 10
      })

      expect(result).toEqual({
        success: true,
        message: 'Schools fetched successfully.',
        data: [{ _id: 'schoolId1', name: 'School 1', classrooms: [] }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalSchools: 1
        }
      })
    })
  })

  describe('getSchoolById', () => {
    it('should return error if school is not found', async () => {
      mockMongoModels.school.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null) // No school found
      })

      const result = await school.getSchoolById({
        schoolId: 'schoolId',
        adminId: 'adminId'
      })

      expect(result).toEqual({
        errors: 'School not found or you do not have access to this school'
      })
    })

    it('should fetch school successfully', async () => {
      mockMongoModels.school.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'schoolId',
          name: 'Test School',
          classrooms: []
        }) // Mocked school data
      })

      const result = await school.getSchoolById({
        schoolId: 'schoolId',
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'School fetched successfully.',
        data: {
          _id: 'schoolId',
          name: 'Test School',
          classrooms: []
        }
      })
    })
  })

  describe('updateSchool', () => {
    it('should return error if school is not found', async () => {
      mockMongoModels.school.findById.mockResolvedValue(null)

      const result = await school.updateSchool({
        schoolId: 'schoolId',
        updates: {},
        superadminId: 'superadminId'
      })

      expect(result).toEqual({ errors: 'School not found.' })
    })

    it('should update school successfully', async () => {
      mockMongoModels.school.findById.mockResolvedValue({
        _id: 'schoolId',
        name: 'Old School',
        administrators: ['superadminId'],
        save: jest.fn().mockResolvedValue({
          _id: 'schoolId',
          name: 'Updated School'
        })
      })

      const result = await school.updateSchool({
        schoolId: 'schoolId',
        updates: { name: 'Updated School' },
        superadminId: 'superadminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'School updated successfully.',
        data: {
          _id: 'schoolId',
          name: 'Updated School'
        }
      })
    })
  })

  describe('deleteSchool', () => {
    it('should return error if school is not found', async () => {
      mockMongoModels.school.findById.mockResolvedValue(null)

      const result = await school.deleteSchool({
        schoolId: 'schoolId',
        superadminId: 'superadminId'
      })

      expect(result).toEqual({ errors: 'School not found.' })
    })

    it('should delete school successfully', async () => {
      mockMongoModels.school.findById.mockResolvedValue({
        _id: 'schoolId',
        administrators: ['superadminId']
      })
      mockMongoModels.school.findByIdAndDelete.mockResolvedValue(true)

      const result = await school.deleteSchool({
        schoolId: 'schoolId',
        superadminId: 'superadminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'School deleted successfully.'
      })
    })
  })
})
