import Course from "../models/Course.js"
import Material from "../models/Material.js"
import QuizResult from "../models/QuizResult.js"

const getAdaptiveQuiz =  async (studentId, courseId) => {
    // verify course belongs to student
    const course = await Course.findOne({ _id: courseId, student:studentId })

    if(!course){
        throw new Error('Course not found')
    }

    // get all processed materials for this course
    const materials = await Material.find({
        course: courseId,
        student: studentId,
        isProcessed: true
    })

    if(materials.length === 0){
        throw new Error('No Processed materials found for this course')
    }

    // get all past quiz results for this course
    const pastResults = await QuizResult.find({
        student: studentId,
        course: courseId
    })

    // calculate per-material accuracy from past results
    const accuracyMap = buildAccuracyMap(pastResults)

    // select questions adaptively
    const selectedQuestions = selectQuestions(materials, accuracyMap)

    return{
        courseId,
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length
    }

}

const buildAccuracyMap = (pastResults) => {
    // materialId -> { correct, total, accuracy }
    const map = {}

    for (const result of pastResults){
        const materialId = result.material.toString()
        if(!map[materialId]){
            map[materialId] = { correct:0, total:0 }
        }
        map[materialId].correct += result.correctCount
        map[materialId].total += result.totalQuestions
    }

    // calculate accuracy percentage for each material
    for (const materialId in map){
        const { correct, total } = map[materialId]
        map[materialId].accuracy = total > 0 ? (correct / total) * 100 : 0
    }

    return map
}

const selectQuestions = (materials, accuracyMap) => {
    // classify materials into bands
    const struggling = [] // accuracy < 50% or never attempted
    const developing = [] // accuracy 50 - 69%
    const mastered = [] // accuracy >= 70%

    for(const material of materials){
        const materialId = material._id.toString()
        const accuracyData = accuracyMap[materialId]

        if(!accuracyData){
            // never attempted - treat as struggling
            struggling.push(material)
        }else if(accuracyData.accuracy < 50){
            struggling.push(material)
        }else if(accuracyData.accuracy < 70){
            developing.push(material)
        }else {
            mastered.push(material)
        }
    }

    const selected = []

    // Pull questions based on band weights
    // struggling: 50% of questions, developing: 35%, mastered: 15%
    selected.push(...pullQuestions(struggling, 5, ['recall', 'applications']))
    selected.push(...pullQuestions(developing, 3, ['application', 'analysis']))
    selected.push(...pullQuestions(mastered, 2, ['analysis']))

    // if we don't have enough questions, fill from any material
    if(selected.length < 10){
        const all = [...struggling, ...developing, ...mastered]
        const remaining = fillRemainingQuestions(all, selected, 10 - selected.length)
        selected.push(...remaining)
    }

    return selected.slice(0, 10)
}

const pullQuestions = (materials, count, preferredDifficulties) => {
    const questions = []
    for (const material of materials){
        // first try preferred difficulties
        const preferred = material.questions.filter(q => preferredDifficulties.includes(q.difficulty))

        // fall back to any difficulty of not enough preferred
        const pool = preferred.length > 0 ? preferred : material.questions

        // shuffle and take what we need
        const shuffled = pool.sort(() => Math.random() - 0.5)

        // attach materialId to each question
        const withMaterialId = shuffled.slice(0, count).map(q => ({
            ...q.toObject(),
            materialId: material._id
        }))

        questions.push(...withMaterialId)

        if(questions.length >= count) break
    }

    return questions.slice(0, count)
}

const fillRemainingQuestions = (materials, alreadySelected, needed) => {
    const selectedIds = new Set(alreadySelected.map(q => q._id.toString()))
    const remaining = []

    for (const material of materials){
        for(const question of material.questions){
            if(!selectedIds.has(question._id.toString())){
                remaining.push({
                    ...question.toObject(),
                    materialId: material._id
                })
            }
        }
    }

    return remaining.sort(() => Math.random() - 0.5).slice(0, needed)
}

const submitQuizResult = async (studentId, courseId, materialId, answers) => {
    // verify material exists and belongs to the student
    const material = await Material.findOne({
        _id: materialId,
        student: studentId,
        course: courseId
    })

    if(!material){
        throw new Error('Material not found')
    }

    // build a map of questionId -> question for fast lookup
    const questionMap = {}
    for (const question of material.questions){
        questionMap[question._id.toString()] = question
    }

    // grade each answer
    const gradedAnswers = []
    let correctCount = 0
    const difficultyBreakdown = {
        recall: { total: 0, correct: 0 },
        application: { total: 0, correct: 0 },
        analysis: { total: 0, correct: 0 },
    }

    for(const answer of answers){
        const question = questionMap[answer.questionId]
        if(!question) continue
       
        const isCorrect = answer.selectedAnswer === question.correctAnswer
        if(isCorrect) correctCount++

        // track difficulty breakdown
        const difficulty = question.difficulty
        difficultyBreakdown[difficulty].total++
        if(isCorrect) difficultyBreakdown[difficulty].correct++

        gradedAnswers.push({
            questionId: question._id,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
            difficulty
        })

        const totalQuestions = gradedAnswers.length
        const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

        const quizResult = await QuizResult.create({
            student: studentId,
            course: courseId, 
            material: materialId, 
            answers: gradedAnswers,
            totalQuestions, 
            correctCount,
            accuracy,
            difficultyBreakdown
        })

        return quizResult

    }
}

const getCourseProgress = async (studentId, courseId) => {
    const course = await Course.findOne({  _id: courseId, student: studentId })
    if(!course){
        throw new Error('Course not found')
    }

    // get all materials for this course
    const materials = await Material.find({
        course: courseId,
        student: studentId,
        isProcessed: true,
    }).select('title')

    // get all quiz results for this course
    const results = await QuizResult.find({
        student: studentId,
        course: courseId
    }).sort({ createdAt: -1 })

    // build progress per material
    const progressByMaterial = materials.map(material => {
        const materialResults = results.filter(r => r.material.toString() === material._id.toString())

        if(materialResults.length === 0){
            return{
                materialId: material._id,
                title: material.title,
                attempts: 0,
                bestAccuracy: 0,
                latestAccuracy: 0,
                status: 'not_started'
            }
        }

        const accuracies = materialResults.map(r => r.accuracy)
        const bestAccuracy = Math.max(...accuracies)
        const latestAccuracy = materialResults[0].accuracy

        return {
            materialId: material._id,
            title: material.title,
            attempts: materialResults.length,
            bestAccuracy,
            latestAccuracy,
            status: bestAccuracy >= 70 ? 'mastered' : bestAccuracy >= 50 ? 'developing' : 'struggling'
        }
    })

    // overall course stats
    const totalAttempts = results.length
    const overallAccuracy = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length) : 0

    return {
        course:{
            id: course._id,
            courseName: course.courseName,
            courseCode: course.courseCode
        },
        overallAccuracy,
        totalAttempts,
        progressByMaterial
    }
}

export { getAdaptiveQuiz, submitQuizResult, getCourseProgress }