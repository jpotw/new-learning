import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db/db';
import { qa_sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function generateSummary(sessionId: string) {
  try {
    // Fetch the Q&A session data
    const session = await db.query.qa_sessions.findFirst({
      where: eq(qa_sessions.id, sessionId),
      with: {
        questions: true,
        answers: true,
      },
    });

    if (!session) {
      throw new Error('Q&A session not found');
    }

    // Format the conversation for the AI
    const conversation = session.questions.map((q, i) => ({
      question: q.content,
      answer: session.answers[i]?.content || '',
    }));

    // Create the prompt for summary generation
    const prompt = `Please provide a concise summary of the following Q&A session:
    ${conversation.map(({ question, answer }) => `
    Q: ${question}
    A: ${answer}`).join('\n')}
    
    Focus on the main points, key insights, and any important conclusions.`;

    // Generate summary using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Store the summary in the database
    await db.insert(qa_sessions).values({
      id: sessionId,
      summary: summary,
      updated_at: new Date(),
    }).onConflictDoUpdate({
      target: qa_sessions.id,
      set: {
        summary: summary,
        updated_at: new Date(),
      },
    });

    return { success: true, summary };
  } catch (error) {
    console.error('Error generating summary:', error);
    return { success: false, error: 'Failed to generate summary' };
  }
}

export async function updateSummary(sessionId: string, summary: string) {
  try {
    await db.update(qa_sessions)
      .set({ 
        summary,
        updated_at: new Date()
      })
      .where(eq(qa_sessions.id, sessionId));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating summary:', error);
    return { success: false, error: 'Failed to update summary' };
  }
}

export async function getSummary(sessionId: string) {
  try {
    const session = await db.query.qa_sessions.findFirst({
      where: eq(qa_sessions.id, sessionId),
      columns: {
        summary: true,
      },
    });
    
    return { success: true, summary: session?.summary };
  } catch (error) {
    console.error('Error fetching summary:', error);
    return { success: false, error: 'Failed to fetch summary' };
  }
} 