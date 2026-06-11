import Anthropic from "@anthropic-ai/sdk"
import ChatSession from "../models/ChatSession.js"
import Course from "../models/Course.js"

const createSession = async (studentId, {type, courseId}) => {
    // validate course exists and belongs to student if course_specific
    if(type === "course_specific"){
        if(!courseId){
            throw new Error('courseId is required for course specific sessions')
        }
        const course =  await Course.findOne({_id:courseId, student:studentId})
        if(!course){
            throw new Error('Course not found')
        }
    }

    const session = await ChatSession.create({
        student: studentId,
        type,
        course: courseId || null
    })

    return session
}

const getSessions = async (studentId) => {
    const sessions = await ChatSession.find({ student: studentId })
    .select('-messages')
    .populate('course', 'courseName courseCode')
    .sort({updatedAt: -1})

    return sessions
}

const getCourseSessions = async (studentId, courseId) => {
    const course = await Course.findOne({ _id: courseId, student: studentId })
    if(!course) throw new Error('Course not found')

    const courseSessions = await ChatSession.find({ student: studentId, type:'course_specific' })
    .select('-messages')
    .sort({ updatedAt: -1 })

    return courseSessions
}

const getSession = async (studentId, sessionId) => {
    const session = await ChatSession.findOne({_id: sessionId, student:studentId})
    .populate('course', 'courseName  courseCode')
    if(!session) throw new Error('Chat session not found')

    return session
}

const deleteSession = async (studentId, sessionId) => {
    const session = await ChatSession.findOneAndDelete({ _id: sessionId, student: studentId })
    if(!session){
        throw new Error('Chat session not found')
    }

    return session
}

const renameSession = async (studentId, sessionId, title) => {
    const session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, student: studentId },
        { title },
        { new:true }
    )

    if(!session) throw new Error('Chat session not found')

    return session
}

const sendMessage = async (studentId, sessionId, content, token) => {
    // get the session
    const session = await ChatSession.findOne({
        _id: sessionId,  
        student: studentId
    }).populate('course', 'courseName courseCode')

    if(!session) throw new Error('Chat session not found')

    // add user message to session
    session.messages.push({
        role: 'user',
        content
    })
    await session.save()

    // build conversation history for claude
    const conversationHistory = session.messages.map(msg => ({
        role: msg.role,
        content: msg.content
    }))

    // build system prompt
    const courseContext = session.course ? `The student is currently studying ${session.course.courseName} (${session.course.courseCode}). Focus your responses on this course when relevant.`  : 'This is a general study session. Help the student with any academic or spontaneous questions.'

    const systemPrompt = `You are Alice from AliceTutor, a personal AI tutor for Nigerian university students. You are helpful, encouraging, and knowledgeable.
    ${courseContext}

    The student's ID is: ${studentId}

    You have access to tools that give you real-time data about this student — their quiz history, weak topics, uploaded materials, study streak, enrolled courses, etc. Always use these tools before giving study advice so your responses are personalised to their actual performance data.

    Keep responses concise, practical, and encouraging. Use examples relevant to Nigerian university contexts where appropriate.`

    // call claude with MCP attached
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // const response = await client.messages.create({
    //     model:"claude-sonnet-4-5-20250929",
    //     max_tokens:1024,
    //     system: systemPrompt,
    //     messages: conversationHistory,
    //     mcp_servers:[
    //         {
    //             type: 'url',
    //             url: process.env.MCP_SERVER_URL,
    //             name: 'alicetutor',
    //             authorization_token: token
    //         }
    //     ]
    // })

    const response = await client.beta.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        messages: conversationHistory,
        mcp_servers: [
          {
            type: "url",
            url: process.env.MCP_SERVER_URL,
            name: "alicetutor-mcp",
            authorization_token: token
          }
        ],
        tools: [
          {
            type: "mcp_toolset",
            mcp_server_name: "alicetutor-mcp"
          }
        ],
        betas: ["mcp-client-2025-11-20"]
    });
      

    // extract text response from Claude
    const assistantMessage =  response.content
        .filter((block) => block.type === "text") 
        .map(block => block.text)
        .join("")

    // add assistant response to session
    session.messages.push({
        role:'assistant',
        content: assistantMessage
    })

    // auto generate title on first message
    if(!session.isTitleGenerated){
        const title = await generateTitle(content, client)
        session.title = title
        session.isTitleGenerated = true
    }

    await session.save()

    return{
        message: assistantMessage,
        session:{
            id: session._id,
            title: session.title
        }
    }
}

const generateTitle = async (firstMessage, client) => {
    try {
        const response = await client.messages.create({
            model:"claude-haiku-4-5",
            max_tokens: 20,
            messages: [
                {
                    role: "user",
                    content: `Summarise this message as a chat title in 4-5 words maximum. Return only the title, no punctuation: "${firstMessage}"`,
                }
            ]
        })  
        return response.content[0].text.trim()
    } catch (error) {
        return 'Study Session'
    }
}

export {
    createSession,
    getSessions,
    getCourseSessions,
    getSession,
    deleteSession,
    renameSession,
    sendMessage
}

