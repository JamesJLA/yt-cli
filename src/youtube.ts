// src/youtube.ts
import axios from 'axios';
import chalk from 'chalk';

export function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1]! : null;
}

export async function getVideoMetadata(videoId: string): Promise<{ title: string; description: string; channel: string } | null> {
  try {
    const { data } = await axios.get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (data.title) {
      return {
        title: data.title,
        description: data.description || '',
        channel: data.author_name || 'Unknown'
      };
    }
  } catch (error) {
    console.log(chalk.yellow('Failed to fetch video metadata'));
  }
  return null;
}
