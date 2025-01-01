const validateEnrollmentMiddleware = require('../../mws/__enroll.mw')

describe('Validate Enrollment Middleware', () => {
  let req, res, next
  let mockManagers
  let mockMongoModels

  beforeEach(() => {
    req = {
      user: { userId: 'adminId' },
      query: { classroomId: 'classroomId', schoolId: 'schoolId' }
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
        student: {}
      }
    }
  })

  it('should return an error if classroom, school, or student models are not loaded', async () => {
    mockMongoModels.classroomModels.classroom = null

    const middleware = validateEnrollmentMiddleware({
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

  it('should return an error if the school is not found', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue(null)

    const middleware = validateEnrollmentMiddleware({
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

  it('should return an error if the admin is not associated with the school', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      administrators: [],
      classrooms: ['classroomId']
    })

    const middleware = validateEnrollmentMiddleware({
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

  it('should return an error if the classroom is not associated with the school', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      administrators: ['adminId'],
      classrooms: []
    })

    const middleware = validateEnrollmentMiddleware({
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

  it('should return an error if the classroom is not found', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      administrators: ['adminId'],
      classrooms: ['classroomId']
    })
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue(null)

    const middleware = validateEnrollmentMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })
    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 404,
      errors: 'Classroom not found.'
    })
  })

  it('should return an error if the classroom is at maximum capacity', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      administrators: ['adminId'],
      classrooms: ['classroomId']
    })
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue({
      students: Array(30),
      capacity: 30
    })

    const middleware = validateEnrollmentMiddleware({
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

  it('should call next if all validations pass', async () => {
    mockMongoModels.schoolModels.school.findById.mockResolvedValue({
      administrators: ['adminId'],
      classrooms: ['classroomId']
    })
    mockMongoModels.classroomModels.classroom.findById.mockResolvedValue({
      students: [],
      capacity: 30
    })

    const middleware = validateEnrollmentMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })
    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should handle errors and return a 500 response', async () => {
    mockMongoModels.schoolModels.school.findById.mockImplementation(() => {
      throw new Error('Database error')
    })

    const middleware = validateEnrollmentMiddleware({
      managers: mockManagers,
      mongoModels: mockMongoModels
    })
    await middleware(req, res, next)

    expect(mockManagers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 500,
      errors: 'Something went wrong.'
    })
  })
})
