const Student = require('../../../../managers/entities/student/Student.manager')

describe('Student Class', () => {
  let student
  let mockUtils
  let mockStudentModels
  let mockSchoolModels
  let mockClassroomModels

  beforeEach(() => {
    mockUtils = {
      validateUniqueFields: jest.fn()
    }

    mockStudentModels = {
      student: {
        create: jest.fn(),
        findById: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn(),
        findByIdAndDelete: jest.fn()
      }
    }

    mockSchoolModels = {
      school: {
        findById: jest.fn()
      }
    }

    mockClassroomModels = {
      classroom: {
        findById: jest.fn(),
        save: jest.fn()
      }
    }

    student = new Student({
      utils: mockUtils,
      studentModels: mockStudentModels,
      schoolModels: mockSchoolModels,
      classroomModels: mockClassroomModels
    })
  })

  // 1. Test enrollStudent method
  describe('enrollStudent', () => {
    it('should enroll a student successfully', async () => {
      mockStudentModels.student.create.mockResolvedValue({
        _id: 'studentId',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        classroom: 'classroomId',
        school: 'schoolId'
      })

      mockClassroomModels.classroom.findById.mockResolvedValue({
        students: [],
        save: jest.fn().mockResolvedValue(true)
      })

      const result = await student.enrollStudent({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        dateOfBirth: new Date('2010-01-01'),
        schoolId: 'schoolId',
        classroomId: 'classroomId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Student enrolled successfully.',
        data: {
          _id: 'studentId',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          classroom: 'classroomId',
          school: 'schoolId'
        }
      })
    })
  })

  // 2. Test transferStudent method
  describe('transferStudent', () => {
    it('should transfer a student successfully', async () => {
      mockStudentModels.student.findById.mockResolvedValue({
        _id: 'studentId',
        school: 'oldSchoolId',
        classroom: 'oldClassroomId',
        transferHistory: [],
        save: jest.fn().mockResolvedValue({
          _id: 'studentId',
          school: 'newSchoolId',
          classroom: 'newClassroomId'
        })
      })

      const result = await student.transferStudent({
        toSchool: 'newSchoolId',
        toClassroom: 'newClassroomId',
        transferDate: new Date(),
        studentId: 'studentId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Student was transferred successfully.',
        data: {
          _id: 'studentId',
          school: 'newSchoolId',
          classroom: 'newClassroomId'
        }
      })
    })
  })

  // 3. Test getStudents method
  describe('getStudents', () => {
    it('should fetch students successfully', async () => {
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId']
      })
      mockStudentModels.student.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest
              .fn()
              .mockResolvedValue([
                { _id: 'studentId1', firstName: 'John', lastName: 'Doe' }
              ])
          })
        })
      })
      mockStudentModels.student.countDocuments.mockResolvedValue(1)

      const result = await student.getStudents({
        adminId: 'adminId',
        schoolId: 'schoolId',
        page: 1,
        limit: 10
      })

      expect(result).toEqual({
        success: true,
        message: 'Students fetched successfully.',
        data: [{ _id: 'studentId1', firstName: 'John', lastName: 'Doe' }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalStudents: 1
        }
      })
    })
  })

  // 4. Test getStudentById method
  describe('getStudentById', () => {
    it('should fetch a student successfully', async () => {
      mockStudentModels.student.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue({
              _id: 'studentId',
              firstName: 'John',
              lastName: 'Doe',
              school: { _id: 'schoolId' }
            })
          })
        })
      })
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId']
      })

      const result = await student.getStudentById({
        studentId: 'studentId',
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Student fetched successfully.',
        data: {
          _id: 'studentId',
          firstName: 'John',
          lastName: 'Doe',
          school: { _id: 'schoolId' }
        }
      })
    })
  })

  // 5. Test updateStudent method
  describe('updateStudent', () => {
    it('should update a student successfully', async () => {
      mockStudentModels.student.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'studentId',
          firstName: 'John',
          lastName: 'Doe',
          school: { _id: 'schoolId' },
          save: jest.fn().mockResolvedValue({
            _id: 'studentId',
            firstName: 'Johnny',
            lastName: 'Doe'
          })
        })
      })
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId']
      })

      const result = await student.updateStudent({
        studentId: 'studentId',
        updates: { firstName: 'Johnny' },
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Student updated successfully.',
        data: expect.objectContaining({
          _id: 'studentId',
          firstName: 'Johnny',
          lastName: 'Doe'
        })
      })
    })
  })

  // 6. Test deleteStudent method
  describe('deleteStudent', () => {
    it('should delete a student successfully', async () => {
      mockStudentModels.student.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            _id: 'studentId',
            classroom: { _id: 'classroomId', students: ['studentId'] },
            school: { _id: 'schoolId' }
          })
        })
      })
      mockClassroomModels.classroom.findById.mockResolvedValue({
        students: ['studentId'],
        save: jest.fn().mockResolvedValue(true)
      })
      mockSchoolModels.school.findById.mockResolvedValue({
        administrators: ['adminId']
      })

      const result = await student.deleteStudent({
        studentId: 'studentId',
        adminId: 'adminId'
      })

      expect(result).toEqual({
        success: true,
        message: 'Student deleted successfully.'
      })
    })
  })
})
