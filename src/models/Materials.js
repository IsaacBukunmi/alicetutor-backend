import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    question:{
        type: String,
        required: true
    }, 
    options:{
        type: [String],
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['recall', 'application', 'analysis'],
        required:true
    }
})

const flashcardSchema = new mongoose.Schema({
    front: {
        type: String,
        required: true
    },
    back: {
        type: String,
        required:true 
    }
})

const materialSchema = new mongoose.Schema(
    {
        student:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        course:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        title:{
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        fileType: {
            type: String,
            enum: ['pdf', 'docx', 'txt', 'pptx'],
            required: true,
        },
        extractedText: {
            type: String,
            select: false
        },
        questions: [questionSchema],
        flashcards: [flashcardSchema],
        summary:{
            type: String,
            default: '',
        }, 
        isProcessed: {
            type: Boolean,
            default: false
        }, 
        processingError:{
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
)

const Material = mongoose.model('Material', materialSchema)

export default Material
