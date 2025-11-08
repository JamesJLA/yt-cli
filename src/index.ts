#!/usr/bin/env node

import { Command } from 'commander';
import { extractVideoId, getVideoMetadata } from './youtube.js';
import { getTranscript } from './transcript.js';
import { summarizeWithOllama } from './summarizer.js';
import ora from 'ora';
import chalk from 'chalk';

const program = new Command();

program
  .name('yt-summarize')
  .description('FREE YouTube summarizer using local Ollama')
  .version('1.0.0')
  .argument('<url>', 'YouTube URL')
  .option('-m, --model <model>', 'Ollama model', 'llama3.2')
  .option('-f, --force', 'Force fetch hidden captions (slower but works)')
  .action(async (url: string, options: { model: string; force?: boolean }) => {
    const spinner = ora(chalk.cyan('Starting...')).start();

    // 1. Extract ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      spinner.fail(chalk.red('Invalid YouTube URL'));
      process.exit(1);
    }
    spinner.succeed(chalk.green(`Video ID: ${videoId}`));

    // 2. Get transcript
    spinner.start('Fetching transcript (no API key)...');
    let transcript: string | null = null;
    try {
      transcript = await getTranscript(videoId, !!options.force);
      if (!transcript) throw new Error('Empty transcript');
      spinner.succeed(`Transcript ready (${(transcript.length / 1000).toFixed(1)}k chars)`);
    } catch (e) {
      // Fallback to video metadata if transcript fails
      spinner.start('No transcript found, trying video metadata...');
      const metadata = await getVideoMetadata(videoId);
      if (metadata && (metadata.title || metadata.description)) {
        spinner.succeed('Using video metadata as fallback');
        transcript = `Title: ${metadata.title}\n\nChannel: ${metadata.channel}\n\nDescription: ${metadata.description}`;
      } else {
        spinner.fail(chalk.red('No captions found or video unavailable'));
        console.log(chalk.gray('Try --force flag or a video with auto-captions'));
        process.exit(1);
      }
    }

    // 3. Summarize locally
    spinner.start(`Summarizing with ${options.model} (local & free)...`);
    const summary = await summarizeWithOllama(transcript, options.model);
    spinner.succeed(chalk.bold('Done!'));

    console.log('\n' + chalk.bgCyan.black(' SUMMARY ') + '\n');
    console.log(chalk.white(summary));
    console.log('\n' + chalk.gray('Powered by Ollama • 100% Free • Runs on your machine'));
  });

program.parse();
