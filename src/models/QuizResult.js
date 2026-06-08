import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedAnswer: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['recall', 'application', 'analysis'],
        required: true
    }
})

const quizResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctCount: {
        type: Number,
        required: true
    }, 
    accuracy: {
        type: Number,
        required: true
    },
    difficultyBreakdown: {
        recall: { total: Number, correct: Number },
        application: { total: Number, correct: Number },
        analysis: { total: Number, correct: Number }
    },
    answers: [answerSchema],
},
{
    timestamps: true
})

const QuizResult = mongoose.model('QuizResult', quizResultSchema)

export default QuizResult