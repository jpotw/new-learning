interface QAPair {
  question: string;
  answer: string;
}

export function formatQAForSummary(qaPairs: QAPair[]): string {
  return qaPairs
    .map(
      ({ question, answer }, index) =>
        `${index + 1}. Question: ${question}\n   Answer: ${answer}`
    )
    .join('\n\n');
}

export function extractKeyPoints(summary: string): string[] {
  // Split the summary into sentences and filter out empty lines
  const sentences = summary
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Filter sentences that are likely to be key points
  // This is a simple heuristic - we could make this more sophisticated
  return sentences.filter((sentence) => {
    const lowercased = sentence.toLowerCase();
    return (
      sentence.length > 20 && // Avoid very short sentences
      !lowercased.startsWith('however') && // Avoid transition sentences
      !lowercased.startsWith('additionally') &&
      !lowercased.startsWith('moreover') &&
      !lowercased.startsWith('furthermore')
    );
  });
}

export function validateSummary(summary: string): boolean {
  // Basic validation to ensure the summary is meaningful
  return (
    summary.length >= 100 && // Minimum length
    summary.length <= 2000 && // Maximum length
    summary.split(' ').length >= 20 // Minimum word count
  );
}

export function generateSummaryPrompt(
  qaPairs: QAPair[],
  options: {
    focusAreas?: string[];
    maxLength?: number;
  } = {}
): string {
  const { focusAreas = [], maxLength = 500 } = options;

  let prompt = `Please provide a concise summary of the following Q&A session:\n\n`;
  prompt += formatQAForSummary(qaPairs);
  
  prompt += '\n\nIn your summary:';
  prompt += '\n- Focus on the main points and key insights';
  prompt += '\n- Highlight any important conclusions';
  
  if (focusAreas.length > 0) {
    prompt += `\n- Pay special attention to these areas: ${focusAreas.join(', ')}`;
  }
  
  prompt += `\n- Keep the summary under ${maxLength} characters`;
  
  return prompt;
} 