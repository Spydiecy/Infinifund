import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_KEY!,
})

const INFINITA_CITY_REVIEW_PROMPT = `
You are an AI reviewer for Infinita City - "The City That Never Dies" - a pioneering network city in Próspera, Roatán, Honduras, dedicated to advancing human longevity and frontier technology.

INFINITA CITY MISSION:
- Accelerate breakthroughs in Biotechnology and Longevity Science
- Advance Computational Science and AI
- Pioneer Cybernetics and Human Enhancement
- Foster Decentralized Science (DeSci) and Web3
- Extend healthy human lifespan and redefine civilization's future

EVALUATION CRITERIA:
1. Alignment with longevity/biotech/AI/Web3/cybernetics themes (30 points)
2. Innovation potential and scientific merit (25 points)
3. Feasibility and realistic milestones (20 points)
4. Potential impact on human flourishing (15 points)
5. Fit with Infinita City's vision of technological acceleration (10 points)

RESPONSE FORMAT (JSON):
{
  "approved": boolean,
  "feedback": "Detailed explanation of decision with specific reasons",
  "score": number (1-100),
  "suggestions": ["specific improvement suggestion 1", "specific improvement suggestion 2", "specific improvement suggestion 3"]
}

PROJECT TO REVIEW:
Name: {projectName}
Description: {projectDetails}
Milestones: {milestones}

Analyze this project thoroughly and provide your evaluation as JSON only. Be specific in your feedback and suggestions.
`

interface ProjectReviewData {
  projectName: string
  projectDetails: string
  milestones: string[]
}

interface AIReviewResult {
  approved: boolean
  feedback: string
  score: number
  suggestions: string[]
}

/**
 * Reviews a project using Gemini AI for Infinita City alignment
 * @param projectData - The project data to review
 * @returns The AI review result with approval status, feedback, score, and suggestions
 */
export async function reviewProjectWithAI(projectData: ProjectReviewData): Promise<AIReviewResult> {
  const prompt = INFINITA_CITY_REVIEW_PROMPT
    .replace("{projectName}", projectData.projectName)
    .replace("{projectDetails}", projectData.projectDetails)
    .replace("{milestones}", projectData.milestones.join("; "))

  try {
        const result = await ai.models.generateContent({ 
      model: "gemini-2.5-flash",
    contents: prompt,
       })
    const response = await result.text
    const text = response
    console.log("my text returned is::::::",text);
    

    // Try to parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0])
      return {
        approved: parsedResult.approved || false,
        feedback: parsedResult.feedback || "No feedback provided",
        score: parsedResult.score || 0,
        suggestions: parsedResult.suggestions || []
      }
    }

    // Fallback if no JSON found
    const approved = text.toLowerCase().includes("approved") || 
                    text.toLowerCase().includes("pass") ||
                    text.toLowerCase().includes("accept")
    
    return {
      approved,
      feedback: text,
      score:  75 ,
      suggestions: approved ? 
        ["Consider adding more technical details", "Expand on implementation timeline"] :
        ["Improve alignment with Infinita City mission", "Add more specific milestones", "Clarify innovation aspects"]
    }
  } catch (error: any) {
    console.error("Error reviewing project with AI:", error)
    throw new Error("Failed to review project with AI. Please try again.")
  }
}

/**
 * Extracts important information from data using Gemini AI
 * @param data - The input data object to extract info from
 * @returns The concise user prompt string containing extracted important info
 */
export async function extractImportantInfoFromData(data: any): Promise<string> {
  const IMPORTANT_INFO_PROMPT = `
You are an assistant that extracts only the most important information from a given dataset or text. 

Instructions:
- If the data contains prices or numeric values related to tokens, extract all of them.
- Summarize the extracted information into a concise user prompt, for example: "The price of this token is 3.00".
- If multiple tokens or prices are present, include all relevant prices clearly.
- Do NOT include recommendations, explanations, or unrelated details.
- If no important information is found, return a general informative message.
- Return ONLY the final user prompt text as a plain string, without any extra formatting or metadata.

If it is general msg then return the message only not general information written also.
`

  const prompt = `${IMPORTANT_INFO_PROMPT}\n\nInput:\n${JSON.stringify(data, null, 2)}\n\nOutput:`

  try {
          const result = await ai.models.generateContent({ 
      model: "gemini-2.5-flash",
    contents: prompt,
       })

    const response = await result.text;

    return response
  } catch (error: any) {
    console.error("Error extracting important info from data:", error)
    return "Unable to extract important data."
  }
}
