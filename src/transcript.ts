// src/transcript.ts
import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import chalk from 'chalk';

export async function getTranscript(videoId: string, force = false): Promise<string | null> {
  // === METHOD 1: Try youtube-transcript library (most reliable) ===
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en',
    });
    
    if (transcript && transcript.length > 0) {
      const text = transcript
        .map(item => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (text.length > 200) {
        console.log(chalk.gray('Transcript loaded via youtube-transcript library'));
        return text;
      }
    }
  } catch (error) {
    console.log(chalk.yellow('YouTube transcript library failed:'), error instanceof Error ? error.message : 'Unknown error');
  }

  // === METHOD 2: Try with different languages ===
  try {
    const langCodes = ['en-US', 'en-GB', 'en-CA'];
    
    for (const lang of langCodes) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
          lang,
        });
        
        if (transcript && transcript.length > 0) {
          const text = transcript
            .map(item => item.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (text.length > 200) {
            console.log(chalk.gray(`Transcript loaded via youtube-transcript (${lang})`));
            return text;
          }
        }
      } catch (e) {
        continue;
      }
    }
  } catch (error) {
    console.log(chalk.yellow('Multi-language transcript failed:'), error instanceof Error ? error.message : 'Unknown error');
  }

  if (!force) return null;

  // === METHOD 3: Fallback to manual extraction ===
  console.log(chalk.gray('Attempting manual extraction...'));
  
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (transcript && transcript.length > 0) {
      const text = transcript
        .map(item => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (text.length > 200) {
        console.log(chalk.green(`Success! Transcript ready (${(text.length / 1000).toFixed(1)}k chars)`));
        return text;
      }
    }
  } catch (err: any) {
    console.log(chalk.red('Manual extraction failed:'), err.message);
  }

  return null;
}