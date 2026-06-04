const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        email:{
            type: String,
            required: [true, 'Email is required'],
            unique:true,
            lowercase: true,
            trim:true
        },
        password:{
            type: String,
            required: [true, 'Password is required'],
            minLength: [6, 'Password must be at least 6 characters']
        },
        university: {
            type: String,
            required: [true, 'University is required'],
            trim: true,
        },
        program:{
            type: String,
            required: [true, 'Program is required'],
            enum: ['undergraduate', 'postgraduate']
        },
        level:{
            type: String,
            required: [true, 'Level is required'],
            enum: ['100', '200', '300', '400', '500', 'masters', 'phd']
        },
        courseOfStudy: {
            type: String,
            required: [true, 'Course of study is required'],
            trim: true,
        },
        studyStreak:{
            type: Number,
            default: 0
        },
        lastStudiedAt:{
            type: Date,
            default: null
        },
        enrolledSubjects:{
            type: [String],
            default: []
        },
    },
    {
        timestamps:true
    }
)

const Student = mongoose.model('Student', studentSchema)

module.exports = Student