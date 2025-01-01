const Classroom = require('../../../../managers/entities/classroom/Classroom.manager')

describe('Classroom Class', () => {
  let classroom
  let mockUtils
  let mockSchoolModels
  let mockClassroomModels

  beforeEach(() => {
    mockUtils = {
      validateUniqueFields: jest.fn()
    }

    mockSchoolModels = {
      school: {
        findById: jest.fn(),
        save: jest.fn()
      }
    }

    mockClassroomModels = {
      classroom: {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndDelete: jest.fn(),
        countDocuments: jest.fn()
      }
    }

    mockClassroomModels.classroom.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      })
    })

    classroom = new Classroom({
      utils: mockUtils,
      schoolModels: mockSchoolModels,
      classroomModels: mockClassroomModels
    })
  })

  // 1. Test createClassroom method
  describe('createClassroom', () => {
    it('should return error if classroom or school model is not loaded', async () => {
      classroom.classroomModels.classroom = null

      const result = await classroom.createClassroom({
        name: 'Test Classroom',
        schoolId: 'schoolId',
        capacity: 30,
        resources: [],
        adminId: 'adminId'
      })

      expect(result).toEqual({
        errors: 'Classroom or School model is not loaded'
      })
    })

    it('should return error if admin is not associated with the school', async () => {
      mockSchoolModels.school.findById.mockResolvedValue({ administrators: [] })

      const result = await classroom.createClassroom({
        name: 'Test Classroom',
        schoolId: 'schoolId',
        capacity: 30,
        resources: [],
        adminId: 'adminId'
      })

      expect(result).toEqual({
        errors: 'The provided administrator is not associated with this school'
      })
    })

    it('should create a classroom successfully', async () => {
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId'],
        classrooms: [],
        save: jest.fn()
      })
      mockUtils.validateUniqueFields.mockResolvedValue(null)
      mockClassroomModels.classroom.create.mockResolvedValue({
        _id: 'classroomId',
        name: 'Test Classroom',
        school: 'schoolId',
        managedBy: 'adminId',
        capacity: 30,
        resources: []
      })

      const result = await classroom.createClassroom({
        name: 'Test Classroom',
        schoolId: 'schoolId',
        capacity: 30,
        resources: [],
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Classroom created successfully.',
        data: {
          _id: 'classroomId',
          name: 'Test Classroom',
          school: 'schoolId',
          managedBy: 'adminId',
          capacity: 30,
          resources: []
        }
      })
    })
  })

  // 2. Test getClassrooms method
  describe('getClassrooms', () => {
    it('should return error if classroom or school model is not loaded', async () => {
      classroom.classroomModels.classroom = null

      const result = await classroom.getClassrooms({
        adminId: 'adminId',
        schoolId: 'schoolId'
      })

      expect(result).toEqual({
        errors: 'Classroom or School model is not loaded'
      })
    })

    it('should return error if admin is not associated with the school', async () => {
      mockSchoolModels.school.findById.mockResolvedValue({ administrators: [] })

      const result = await classroom.getClassrooms({
        adminId: 'adminId',
        schoolId: 'schoolId'
      })

      expect(result).toEqual({
        errors: 'The provided administrator is not associated with this school'
      })
    })

    it('should fetch classrooms successfully', async () => {
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId']
      })
      mockClassroomModels.classroom.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest
                .fn()
                .mockResolvedValue([
                  { _id: 'classroomId1', name: 'Classroom 1' }
                ])
            })
          })
        })
      })
      mockClassroomModels.classroom.countDocuments.mockResolvedValue(1)

      const result = await classroom.getClassrooms({
        adminId: 'adminId',
        schoolId: 'schoolId',
        page: 1,
        limit: 10
      })

      expect(result).toEqual({
        success: true,
        message: 'Classrooms fetched successfully.',
        data: [{ _id: 'classroomId1', name: 'Classroom 1' }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalClassrooms: 1
        }
      })
    })
  })

  // 3. Test getClassroomById method
  describe('getClassroomById', () => {
    it('should return error if classroom is not found', async () => {
      mockClassroomModels.classroom.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null) // No classroom found
          })
        })
      })

      const result = await classroom.getClassroomById({
        classroomId: 'classroomId',
        adminId: 'adminId'
      })

      expect(result).toEqual({ errors: 'Classroom not found' })
    })

    it('should fetch classroom successfully', async () => {
      mockClassroomModels.classroom.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue({
              _id: 'classroomId',
              name: 'Classroom 1',
              school: { _id: 'schoolId' },
              managedBy: { _id: 'adminId', name: 'Admin User' },
              students: []
            })
          })
        })
      })
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId']
      })

      const result = await classroom.getClassroomById({
        classroomId: 'classroomId',
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Classroom fetched successfully.',
        data: {
          _id: 'classroomId',
          name: 'Classroom 1',
          school: { _id: 'schoolId' },
          managedBy: { _id: 'adminId', name: 'Admin User' },
          students: []
        }
      })
    })
  })

  // 4. Test updateClassroom method
  describe('updateClassroom', () => {
    it('should return error if classroom is not found', async () => {
      mockClassroomModels.classroom.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue(null) // No classroom found
      })

      const result = await classroom.updateClassroom({
        classroomId: 'classroomId',
        updates: { name: 'Updated Classroom' },
        adminId: 'adminId'
      })

      expect(result).toEqual({ errors: 'Classroom not found.' })
    })

    it('should update classroom successfully', async () => {
      mockClassroomModels.classroom.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'classroomId',
          name: 'Old Classroom',
          resources: [],
          school: { _id: 'schoolId' },
          save: jest.fn().mockResolvedValue({
            _id: 'classroomId',
            name: 'Updated Classroom'
          })
        })
      })
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId']
      })

      const result = await classroom.updateClassroom({
        classroomId: 'classroomId',
        updates: { name: 'Updated Classroom' },
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Classroom updated successfully.',
        data: {
          _id: 'classroomId',
          name: 'Updated Classroom'
        }
      })
    })
  })

  // 5. Test deleteClassroom method
  describe('deleteClassroom', () => {
    it('should return error if classroom is not found', async () => {
      mockClassroomModels.classroom.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      })

      const result = await classroom.deleteClassroom({
        classroomId: 'classroomId',
        adminId: 'adminId'
      })

      expect(result).toEqual({ errors: 'Classroom not found.' })
    })

    it('should delete classroom successfully', async () => {
      mockClassroomModels.classroom.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'classroomId',
          school: { _id: 'schoolId', classrooms: ['classroomId'] }
        })
      })
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId'],
        classrooms: ['classroomId'],
        save: jest.fn()
      })

      const result = await classroom.deleteClassroom({
        classroomId: 'classroomId',
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Classroom deleted successfully.'
      })
    })
  })
})
