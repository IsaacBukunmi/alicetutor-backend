import fs from 'fs'
import path from 'path'
import mammoth from 'mammoth'
import officeParser from 'officeparser'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const extractText = async (filePath, fileType) => {
    try{
        if (fileType === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath)
            const loadingTask = getDocument({ data: new Uint8Array(dataBuffer) })
            const pdfDocument = await loadingTask.promise
            let fullText = ''
      
            for (let i = 1; i <= pdfDocument.numPages; i++) {
              const page = await pdfDocument.getPage(i)
              const textContent = await page.getTextContent()
              const pageText = textContent.items.map(item => item.str).join(' ')
              fullText += pageText + '\n'
            }
      
            return fullText
        }

        if(fileType === 'docx'){
            const result = await mammoth.extractRawText({ path: filePath })
            return result.value
        }

        if(fileType === 'pptx'){
            const text = await new Promise((resolve, reject) => {
                officeParser.parseOffice(filePath, (data, err) => {
                    if(err) reject(err)
                    else resolve(data)
                })
            })
            return text
        }

        if(fileType === 'txt'){
            return fs.readFileSync(filePath, 'utf8')
        }

        throw new Error('Unsupported file type')
    } finally {
        // Always delete the file after extraction
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath)
        }
    }
}

const chunkText = (text, maxChunkSize = 60000) => {
    if(text.length <= maxChunkSize){
        return [text]
    }

    const chunks = []
    let start = 0

    while(start < text.length){
        let end = start + maxChunkSize
        if(end < text.length){
            const lastPeriod = text.lastIndexOf('.', end)
            if(lastPeriod > start){
                end = lastPeriod + 1
            }
        }
        chunks.push(text.slice(start, end))
        start = end
    }

    return chunks
}

export { extractText, chunkText}