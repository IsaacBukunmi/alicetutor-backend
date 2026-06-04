const { uploadMaterial, getCourseMaterials, getSingleMaterial, deleteMaterial } = require("../services/material.service")

const upload = async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: "Please upload a file"
            })
        }

        const { title } = req.body
        if(!title){
            return res.status(400).json({
                success: false,
                message: 'Please provide a title for this material'
            })
        }

        const material = await uploadMaterial(
            req.student._id,
            req.params.courseId,
            req.file,
            title
        )

        // status 202 - Request received but being processed
        res.status(202).json({
            success: true,
            message: 'File uploaded successfully. Content is being generated',
            material
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const getAll = async (req, res) => {
    try {
        const materials = await getCourseMaterials(req.student._id, req.params.courseId)
        res.status(200).json({
            success: true,
            count: materials.length,
            materials
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const getOne = async (req, res) => {
    try {
        const material = await getSingleMaterial(req.student._id, req.params.materialId)
        res.status(200).json({
            success: true,
            material
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
        await deleteMaterial(req.student._id, req.params.materialId)
        res.status(400).json({
            success: true,
            message: 'Material  deleted successfully'
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = { upload, getAll, getOne, remove }