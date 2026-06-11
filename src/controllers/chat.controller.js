import { createSession, deleteSession, getCourseSessions, getSession, getSessions, renameSession, sendMessage } from "../services/chat.service.js"

const create = async (req, res) => {
    try {
        const session = await createSession(req.student._id, req.body)
        res.status(201).json({
            success: true,
            session
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
        const session = await getSessions(req.student._id)
        res.status(200).json({
            success: true,
            session
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
        const session = await getSession(req.student._id, req.params.sessionId)
        res.status(200).json({
            success: true,
            session
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
        await deleteSession(req.student._id, req.params.sessionId)
        res.status(200).json({
            success: true,
            message: "Chat session deleted successfully"
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const rename = async (req, res) => {
    try {
        const { title } = req.body
        if(!title){
            return res.status(400).json({
                success:false,
                message: 'Title is required'
            })
        }
        const session = await renameSession(req.student._id, req.params.sessionId, title)
        res.status(200).json({
            success: true,
            session
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const message = async (req, res) => {
    try {
        const { content } = req.body
        if(!content){
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            })
        }

        // extract JWT from Authorization header
        const token = req.headers.authorization.split(' ')[1]

        const result = await sendMessage(req.student._id, req.params.sessionId, content, token)
        res.status(200).json({
            success: true,
            ...result
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const getCourseChats = async (req, res) => {
    try {
        const sessions = await getCourseSessions(req.student._id, req.params.courseId)
        res.status(200).json({
            success: true,
            sessions
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export {
    create,
    getAll,
    getOne,
    remove,
    rename,
    message,
    getCourseChats
}