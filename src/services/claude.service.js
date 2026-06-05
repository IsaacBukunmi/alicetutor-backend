import Anthropic from '@anthropic-ai/sdk'


const generateMaterialContent = async (extractedText, courseName) => {
    console.log(process.env.ANTHROPIC_API_KEY)

    const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    })

    const prompt = `You are an expert academic tutor. A student has uploaded course material for "${courseName}".

    Analyse the following text and generate study content in valid JSON format only. Do not include any text outside the JSON.
    
    Generate:
    - 10 multiple choice questions across three difficulty levels (recall, application, analysis)
    - 10 flashcard pairs
    - A concise summary of the key concepts (200-300 words)
    
    Return this exact JSON structure:
    {
      "questions": [
        {
          "question": "question text here",
          "options": ["option A", "option B", "option C", "option D"],
          "correctAnswer": "the correct option text",
          "difficulty": "recall | application | analysis"
        }
      ],
      "flashcards": [
        {
          "front": "term or concept",
          "back": "definition or explanation"
        }
      ],
      "summary": "summary text here"
    }
    
    Course material: ${extractedText}`

    const response = await client.messages.create({
        model:'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    })

    const rawText = response.content[0].text

    // strip markdown code fences if Claude wraps the JSON
    const cleaned = rawText.replace(/```json|```/g, '').trim()

    const parsed = JSON.parse(cleaned)

    return parsed
}

export { generateMaterialContent }