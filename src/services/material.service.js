import path from 'path'
import Material from '../models/Material.js'
import Course from '../models/Course.js'
import { extractText, chunkText } from './extraction.service.js'
import { generateMaterialContent } from './claude.service.js'

const uploadMaterial = async (studentId, courseId, file, title) => {
    // verify the course belongs to the student
    const course = await Course.findOne({_id: courseId, student: studentId})
    if(!course){
        throw new Error('Course not found')
    }

    // get file type from extension
    const fileType = path.extname(file.originalname).replace('.', '').toLowerCase()

    // create the material document immediately
    const material = await Material.create({
        student: studentId,
        course: courseId,
        title,
        fileType,
        isProcessed: false
    })

    // process in background - don't await this
    processMaterial(material._id, file.path, fileType, course.courseName)

    return material
}

const processMaterial = async (materialId, filePath, fileType, courseName) => {
    try {
        // extract text from the file
        const extractedText = await extractText(filePath, fileType)

        // chunk if too long
        const chunks = chunkText(extractedText)

        // use first chunk for now (good enough for most lecture notes)
        const content = await generateMaterialContent(chunks[0], courseName)

        // update the material with generated content
        await Material.findByIdAndUpdate(materialId,  {
            extractedText: chunks[0],
            questions: content.questions,
            flashcards: content.flashcards,
            summary: content.summary,
            isProcessed: true
        })
    } catch (error) {
        await Material.findByIdAndUpdate(materialId, {
            isProcessed: false,
            processingError: error.message
        })
    }
}

const getCourseMaterials =  async (studentId, courseId) => {
    const course = await Course.findOne({ _id: courseId, student: studentId })
    if(!course){
        throw new Error('Course not found')
    }

    const materials = await Material.find({ course: courseId, student: studentId }).select('-extractedText').sort({ createdAt: -1 })

    return materials
}

const getSingleMaterial = async (studentId, materialId) => {
    const material = await Material.findOne({ _id: materialId, student: studentId }).select('-extractedText').populate('course', 'courseName courseCode')
    if(!material){
        throw new Error('Material not found')
    }
    return material
}

const deleteMaterial = async (studentId, materialId) => {
    const material = await Material.findOneAndDelete({ _id: materialId, student: studentId })
    if(!material){
        throw new Error('Material not found')
    }
    return material
}

export {
    uploadMaterial,
    getCourseMaterials,
    getSingleMaterial,
    deleteMaterial
}