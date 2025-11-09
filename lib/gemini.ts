import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ProjectContext {
  projectName: string
  projectDescription?: string
  tasks: Array<{
    id: string
    title: string
    description?: string
    status: string
    priority?: string
    assignee?: string
  }>
  dataSources: Array<{
    id: string
    file_name: string
    source_type: string
    mime_type?: string
    content?: string
  }>
}

/**
 * Build context prompt from project data
 */
export function buildContextPrompt(context: ProjectContext): string {
  let prompt = `You are an AI assistant for a project management application called Adjacent. You help users understand their project status, tasks, and uploaded documents.

PROJECT INFORMATION:
- Name: ${context.projectName}
${context.projectDescription ? `- Description: ${context.projectDescription}` : ''}

`

  // Add tasks information
  if (context.tasks.length > 0) {
    prompt += `TASKS (${context.tasks.length} total):\n`
    
    // Group tasks by status
    const tasksByStatus = context.tasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = []
      acc[task.status].push(task)
      return acc
    }, {} as Record<string, typeof context.tasks>)

    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
      prompt += `\n${status.toUpperCase()} (${tasks.length}):\n`
      tasks.forEach(task => {
        prompt += `- [${task.id}] ${task.title}`
        if (task.description) prompt += `: ${task.description}`
        if (task.priority) prompt += ` (Priority: ${task.priority})`
        if (task.assignee) prompt += ` (Assigned to: ${task.assignee})`
        prompt += '\n'
      })
    })
  } else {
    prompt += 'TASKS: No tasks created yet.\n'
  }

  // Add data sources information
  if (context.dataSources.length > 0) {
    prompt += `\nUPLOADED FILES (${context.dataSources.length} total):\n`
    
    const filesByType = context.dataSources.reduce((acc, file) => {
      if (!acc[file.source_type]) acc[file.source_type] = []
      acc[file.source_type].push(file)
      return acc
    }, {} as Record<string, typeof context.dataSources>)

    Object.entries(filesByType).forEach(([type, files]) => {
      prompt += `\n${type.toUpperCase()} FILES (${files.length}):\n`
      files.forEach(file => {
        prompt += `- ${file.file_name}`
        if (file.content) {
          prompt += `\n  Content preview: ${file.content.substring(0, 500)}${file.content.length > 500 ? '...' : ''}`
        }
        prompt += '\n'
      })
    })
  } else {
    prompt += '\nUPLOADED FILES: No files uploaded yet.\n'
  }

  prompt += `\n---

Please answer questions about this project based on the information above. Be helpful, concise, and specific. When referencing tasks, use their titles. When discussing uploaded files, mention their names. If asked about work that needs to be done, prioritize tasks based on their status and priority.`

  return prompt
}

/**
 * Generate AI response using Gemini
 */
export async function generateChatResponse(
  userMessage: string,
  context: ProjectContext,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Build the full context
    const systemPrompt = buildContextPrompt(context)

    // Combine conversation history with new message
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand the project context. I\'m ready to help you with questions about your tasks, files, and project status.' }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ]

    const chat = model.startChat({
      history: messages.slice(0, -1) as any,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    })

    const result = await chat.sendMessage(userMessage)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate response from AI')
  }
}

/**
 * Stream AI response using Gemini (for real-time responses)
 */
export async function streamChatResponse(
  userMessage: string,
  context: ProjectContext,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ReadableStream> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const systemPrompt = buildContextPrompt(context)

  const messages = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'I understand the project context. I\'m ready to help you with questions about your tasks, files, and project status.' }] },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
  ]

  const chat = model.startChat({
    history: messages as any,
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  })

  const result = await chat.sendMessageStream(userMessage)

  // Convert the async iterator to a ReadableStream
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          controller.enqueue(new TextEncoder().encode(text))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
