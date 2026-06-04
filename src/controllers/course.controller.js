const { createCourse, getStudentCourses, getSingleCourse, deleteCourse, updateCourse } = require("../services/course.service")

const create = async (req, res) => {
    try{
        const course = await createCourse(req.student._id, req.body)
        res.status(201).json({
            success: true,
            course
        })
    } catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const getAll = async (req, res) => {
    try{
        const courses = await getStudentCourses(req.student._id)
        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        })
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const getOne = async (req, res) => {
    try {
        const course = await getSingleCourse(req.student._id, req.params.id)
        res.status(200).json({
            success: true, 
            course
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const remove = async (req, res) => {
    try {
        await deleteCourse(req.student._id, req.params.id)
        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const update = async (req, res) => {
    try {
        const course = await updateCourse(req.student._id, req.params.id, req.body)
        res.status(200).json({
            success: true,
            course
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    create, 
    getAll,
    getOne, 
    remove,
    update
}