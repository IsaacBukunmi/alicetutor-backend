const { registerStudent, loginStudent } = require("../services/auth.service");

const register =  async (req, res) => {
    try{
        const { student, token } = await registerStudent(req.body)

        res.status(201).json({
            success:true,
            token,
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                university: student.university,
                program: student.program,
                level: student.level,
                courseOfStudy: student.courseOfStudy,
            }
        })
    }catch (error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const login = async (req, res) => {
    try {
        const { student, token } = await loginStudent(req.body) 

        res.status(200).json({
            success:true, 
            token,
            student:{
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                university: student.university,
                program: student.program,
                level: student.level,
                courseOfStudy: student.courseOfStudy,
            }
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }   
}

module.exports = { register, login }