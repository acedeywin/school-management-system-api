const transferValidationMiddleware = require('../../mws/__transfer.mw')

describe('Transfer Validation Middleware', () => {
  let req, res, next, mockManagers, mockMongoModels

  beforeEach(() => {
    req = {
      user: { userId: 'adminId' },
      query: { studentId: 'studentId' },
      body: {
        transferHistory: {
          toSchool: 'toSchoolId',
          toClassroom: 'toClassroomId'
        }
      }
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    next = jest.fn()

    mockManagers = {
      responseDispatcher: {
        dispatch: jest.fn()
      }
    }

    mockMongoModels = {
      classroomModels: {
        classroom: {
          findById: jest.fn()
        }
      },
      schoolModels: {
        school: {
          findById: jest.fn()
        }
      },
      studentModels: {
        student: {
          findById: jest.fn()
        }
      }
    }
  })

  it('should return 500 if any model is not loaded', async () => {
    mockMongoModels.classroomModels.classroom = null

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      code: 500,
      errors: 'Classroom or School or Student model is not loaded.'
    })
  })

  it('should return 404 if the receiving school is not found', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue(null)

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 404,
      errors: 'Receiving school not found.'
    })
  })

  it('should return 404 if the receiving classroom is not associated with the receiving school', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      classrooms: ['someOtherClassroomId']
    })

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 404,
      errors: 'The provided classroom is not associated with this school.'
    })
  })

  it('should return 404 if the receiving classroom is not found', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      classrooms: ['toClassroomId']
    })
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue(null)

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 404,
      errors: 'The provided classroom is not associated with this school.'
    })
  })

  it('should return 404 if the receiving classroom has reached its maximum capacity', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      classrooms: ['toClassroomId']
    })
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue({
      students: Array(30), // Assume capacity is 30
      capacity: 30
    })

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 404,
      errors: 'The provided classroom has reached its maximum capacity.'
    })
  })

  it('should return 404 if the student is not found', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      classrooms: ['toClassroomId']
    })
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue({
      students: Array(20),
      capacity: 30
    })
    mockMongoModels.studentModels.student.findById.mockResolvedValue(null)

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 404,
      errors: 'Student not found.'
    })
  })

  it('should return 404 if the school for the student is not found', async () => {
    mockMongoModels.schoolModels.school.findById
      .mockResolvedValueOnce({
        classrooms: ['toClassroomId']
      })
      .mockResolvedValueOnce(null) // For the student's current school
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue({
      students: Array(20),
      capacity: 30
    })
    mockMongoModels.studentModels.student.findById.mockResolvedValue({
      school: { _id: 'currentSchoolId' },
      classroom: { _id: 'currentClassroomId' }
    })

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 404,
      errors: 'School not found.'
    })
  })

  it("should return 404 if the admin is not associated with the student's school", async () => {
    mockMongoModels.schoolModels.school.findById
      .mockResolvedValueOnce({
        classrooms: ['toClassroomId']
      })
      .mockResolvedValueOnce({
        administrators: ['someOtherAdminId']
      })
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue({
      students: Array(20),
      capacity: 30
    })
    mockMongoModels.studentModels.student.findById.mockResolvedValue({
      school: { _id: 'currentSchoolId' },
      classroom: { _id: 'currentClassroomId' }
    })

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 404,
      errors: 'The provided administrator is not associated with this school.'
    })
  })

  it('should call next if all validations pass', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      classrooms: ['toClassroomId'],
      administrators: ['adminId']
    })
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue({
      students: Array(20),
      capacity: 30
    })
    mockMongoModels.studentModels.student.findById.mockResolvedValue({
      school: { _id: 'currentSchoolId' },
      classroom: { _id: 'currentClassroomId' }
    })

    const middleware = transferValidationMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
