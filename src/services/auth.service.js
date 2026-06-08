import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Student from '../models/Student.js'


const registerStudent = async(studentData) => {
    const { firstName, lastName, email, password, university, program, level, courseOfStudy } = studentData

    // check if student exists
    const existingStudent = await Student.findOne({ email })
    if(existingStudent){
        throw new Error('A student with this email already exists')
    }

    // hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create the student
    const student = await Student.create({
        firstName, 
        lastName, 
        email, 
        password: hashedPassword,
        university,
        program,
        level,
        courseOfStudy,
    })

    // generate token
    const token = jwt.sign(
        {
            id:student._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    )

    return{
        student, token
    }
}

const loginStudent = async({email, password}) => {
    // check if student exists
    const student = await Student.findOne({ email })
    if(!student){
        throw new Error('Invalid email or password')
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, student.password)
    if(!isPasswordCorrect){
        throw new Error('Invalid email or password')
    }

    // generate token
    const token = jwt.sign(
        { id: student._id },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    )

    return { student, token }
}

export { registerStudent, loginStudent }