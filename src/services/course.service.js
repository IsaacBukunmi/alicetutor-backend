import Course from "../models/Courses.js"


const createCourse = async (studentId, courseData) => {
    const { courseName, courseCode, courseUnit, description, examDate, lecturerName } = courseData

    const existingCourse = await Course.findOne({
        student: studentId,
        courseCode: courseCode.toUpperCase()
    })

    if(existingCourse){
        throw new Error('You have a course with this code')
    }

    const course = await Course.create({
        student: studentId,
        courseName,
        courseCode,
        courseUnit,
        description,
        examDate, 
        lecturerName
    })

    return course
}

const getStudentCourses = async (studentId) => {
    const courses = await Course.find({ student:studentId }).sort({ createdAt: -1 })
    return courses
}

const getSingleCourse = async (studentId, courseId) => {
    const course = await Course.findOne({
        _id: courseId,
        student: studentId,
    })
    if(!course){
        throw new Error('Course not found')
    }
    return course
}

const deleteCourse = async (studentId, courseId) => {
    const course = await Course.findOneAndDelete({
        _id: courseId,
        student: studentId
    })
    if(!course){
        throw new Error('Course not found')
    }
    return course
}

const updateCourse = async (studentId, courseId, updateData) => {
    const course = await Course.findOneAndUpdate(
        {_id: courseId, student: studentId},
        updateData,
        { new: true, runValidators: true }
    )
    if(!course){
        throw new Error('Course not found')
    }
    return course
}

export {
    createCourse,
    getStudentCourses,
    getSingleCourse,
    deleteCourse,
    updateCourse
}