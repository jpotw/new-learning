import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google-ai/generativelanguage';
import { GoogleAuth } from 'google-auth-library';

// Check if API key is available
if (!process.env.GOOGLE_GEMINI_API_KEY) {
  console.warn('GOOGLE_GEMINI_API_KEY is not set. Gemini API will not function properly.');
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Default generation config
const defaultGenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

/**
 * Generate a response from Gemini based on a prompt and context
 * @param prompt The user's question or prompt
 * @param context Optional document context to provide to the model
 * @returns The generated response text
 */
export async function generateResponse(prompt: string, context?: string): Promise<string> {
  try {
    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Prepare the content with context if available
    const fullPrompt = context 
      ? `Context information:\n${context}\n\nQuestion: ${prompt}\n\nAnswer based on the context provided:`
      : prompt;
    
    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: defaultGenerationConfig,
      safetySettings,
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response from Gemini:', error);
    throw new Error('Failed to generate response from AI');
  }
}

/**
 * Generate a summary of document content
 * @param documentText The text content to summarize
 * @returns A summary of the document
 */
export async function generateSummary(documentText: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Please provide a concise summary of the following document content:\n\n${documentText}\n\nSummary:`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        ...defaultGenerationConfig,
        maxOutputTokens: 2048, // Allow longer summaries
      },
      safetySettings,
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary from Gemini:', error);
    throw new Error('Failed to generate document summary');
  }
}

/**
 * Generate a structured Q&A summary from a conversation history
 * @param conversationHistory Array of Q&A pairs
 * @returns A structured summary of the conversation
 */
export async function generateQASummary(
  conversationHistory: Array<{ question: string; answer: string }>
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Format the conversation history
    const formattedHistory = conversationHistory
      .map((qa, index) => `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer}`)
      .join('\n\n');
    
    const prompt = `Please create a structured summary of the following Q&A session, 
    highlighting the key points, insights, and conclusions:
    
    ${formattedHistory}
    
    Summary:`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        ...defaultGenerationConfig,
        maxOutputTokens: 2048,
      },
      safetySettings,
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Q&A summary from Gemini:', error);
    throw new Error('Failed to generate Q&A summary');
  }
} 