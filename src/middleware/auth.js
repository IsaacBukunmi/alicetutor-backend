const jwt = require('jsonwebtoken')
const Student = require('../models/Students')

const protect = async (req, res, next) => {
    try {
        // check if token exists in the header
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided'
            })
        }

        // extract the token
        const token = authHeader.split(' ')[1]

        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // find the student and attach to request
        const student = await Student.findById(decoded.id).select('-password')
        if(!student){
            return res.status(401).json({
                success: false, 
                message: 'Access denied. Student not found'
            })
        }

        req.student = student
        next()
    } catch (error) {
        return res.status(401).json({
            success:false, 
            message: 'Access denied. Invalid token'
        })
    }
}

module.exports = { protect }