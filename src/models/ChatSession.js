import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    role:{
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
},{
   timestamps: true 
})

const chatSessionSchema = new mongoose.Schema({
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    type:{
        type: String,
        enum:['general', 'course_specific'],
        required: true
    },
    title:{
        type: String,
        trim: true,
        default: 'New Chat'
    },
    isTitleGenerated:{
        type: Boolean,
        default: false
    },
    messages: [messageSchema],
},{
    timestamps:true
})

const ChatSession = mongoose.model('ChatSession', chatSessionSchema)

export default ChatSession