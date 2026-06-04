const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
    {
        student:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        courseName:{
            type: String,
            required: [true, 'Course name is required'],
            trim:true
        },
        courseCode:{
            type: String,
            required: [true, 'Course code is required'],
            trim:true,
            uppercase:true,
        },
        courseUnit:{
            type: Number,
            required: [true, 'Course unit is required']
        },
        description:{
            type: String,
            default: null
        }, 
        examDate: {
            type: Date,
            default: null
        },
        lecturerName:{
            type: String, 
            trim: true,
            default: null
        }
    },
    {
        timestamps:true
    }
)

const Course = mongoose.model('Course', courseSchema)

module.exports = Course