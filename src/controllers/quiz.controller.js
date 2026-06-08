import { getAdaptiveQuiz, getCourseProgress, submitQuizResult } from "../services/quiz.service.js"

const fetchQuiz = async (req, res) => {
    try {
        const quiz = await getAdaptiveQuiz(req.student._id, req.params.courseId)
        res.status(200).json({
            success: true,
            quiz
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const submitQuiz = async (req, res) => {
    try {
        const { materialId, answers } = req.body

        if(!materialId || !answers || !Array.isArray(answers)){
            return res.status(400).json({
                success: false,
                message: 'Please provide materialId and an answers array'
            })
        }

        const result = await submitQuizResult(
            req.student._id,
            req.params.courseId, 
            materialId,
            answers
        )

        res.status(201).json({
            success: true, 
            result
        })
    } catch (error) {
        res.status(400).json({
            success: false, 
            message: error.message
        })
    }
}

const getProgress = async (req, res) => {
    try {
        const progress = await getCourseProgress(req.student._id, req.params.courseId)
        res.status(200).json({
            success:true,
            progress
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export { fetchQuiz, submitQuiz, getProgress }