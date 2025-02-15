// app/api/generate.ts
import { init, LDContext, LDClient } from '@launchdarkly/node-server-sdk';
import { initAi, LDAIClient, LDAIConfig, LDFeedbackKind } from '@launchdarkly/server-sdk-ai';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from "openai";
import { NextResponse } from 'next/server';

interface GenerationError extends Error {
  message: string;
  code?: string;
}

export async function POST(req: Request) {
  const {
    aiModel,
    aiSdkKey,
    ldSdkKey,
    configClientId,
    numGenerations,
    goodFeedbackRatio
  } = await req.json();

  // Initialize OpenAI client
  const openaiClient = new OpenAI({ apiKey: aiSdkKey });

  // Initialize LaunchDarkly client
  const ldClient: LDClient = init(ldSdkKey);
  const context: LDContext = {
    kind: 'user',
    key: uuidv4(),
    name: 'DataGenerator',
  };

  try {
    await ldClient.waitForInitialization({ timeout: 10 });

    const aiClient: LDAIClient = initAi(ldClient);

    const fallbackConfig = {
      model: {
        name: aiModel === 'openai' ? 'gpt-4' : 'claude-2',
        parameters: { temperature: 0.8 }
      },
      messages: [{ role: 'system' as 'system', content: '' }],
      provider: { name: aiModel },
      enabled: true,
    };

    const aiConfig: LDAIConfig = await aiClient.config(
      configClientId,
      context,
      fallbackConfig,
      { 'example_variable': 'sample' },
    );

    const { tracker } = aiConfig;
    let completedGenerations = 0;
    let errors = [];

    // Calculate how many positive and negative feedbacks to generate
    const totalGenerations = numGenerations;
    const positiveCount = Math.round(totalGenerations * (goodFeedbackRatio / 100));
    let positiveGenerated = 0;
    let negativeGenerated = 0;

    for (let i = 0; i < totalGenerations; i++) {
      try {
        const completion = await tracker.trackOpenAIMetrics(async () =>
          openaiClient.chat.completions.create({
            messages: aiConfig.messages || [],
            model: aiConfig.model?.name || 'gpt-4',
            temperature: (aiConfig.model?.parameters?.temperature as number) ?? 0.5,
            max_tokens: (aiConfig.model?.parameters?.maxTokens as number) ?? 4096,
          }),
        );

        // Determine if this should be positive feedback
        // Only generate positive if we haven't hit our target yet
        const shouldBePositive = positiveGenerated < positiveCount;
        
        await tracker.trackFeedback({
          kind: shouldBePositive ? LDFeedbackKind.Positive : LDFeedbackKind.Negative
        } as const);

        // Track our progress
        if (shouldBePositive) {
          positiveGenerated++;
        } else {
          negativeGenerated++;
        }

        completedGenerations++;
        
        // Log progress for debugging
        console.log(`Generation ${i + 1}/${totalGenerations}:`, {
          feedback: shouldBePositive ? 'positive' : 'negative',
          positiveGenerated,
          negativeGenerated,
          targetPositive: positiveCount,
          targetNegative: totalGenerations - positiveCount
        });

      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  
      await ldClient.close();
      
      return NextResponse.json({
        success: true,
        completedGenerations,
        errors: errors.length > 0 ? errors : null
      });
  
    } catch (error) {
      const serverError = error as GenerationError;
      return NextResponse.json({
        success: false,
        error: serverError.message || 'An unexpected error occurred'
      }, { status: 500 });
    }
}