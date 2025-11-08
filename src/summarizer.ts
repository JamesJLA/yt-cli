import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export async function summarizeWithOllama(text: string, model: string = 'llama3.2'): Promise<string> {
  // Check if model is available, fallback to a common one if not
  try {
    await ollama.list();
  } catch (error) {
    throw new Error('Ollama is not running. Please start Ollama first: ollama serve');
  }
  const prompt = `
You are an expert summarizer. Create a concise, insightful summary of this YouTube video in 5 bullet points.
Focus on: main ideas, key arguments, examples, and conclusions.
Use clear language.

Transcript:
${text.slice(0, 30000)}

Summary:`;

  const response = await ollama.generate({
    model,
    prompt,
    stream: false,
  }).catch((error: any) => {
    if (error.message?.includes('model')) {
      throw new Error(`Model "${model}" not found. Available models: Run "ollama list" to see installed models, or "ollama pull ${model}" to install it.`);
    }
    throw error;
  });

  return response.response.trim();
}
