// app/page.tsx
'use client';

import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';
import * as Label from '@radix-ui/react-label';
import { ChevronDown, Check } from 'lucide-react';

interface FormData {
  aiModel: string;
  aiSdkKey: string;
  ldSdkKey: string;
  configClientId: string;
  numGenerations: number | '';
  goodFeedbackRatio: number;
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    aiModel: '',
    aiSdkKey: '',
    ldSdkKey: '',
    configClientId: '',
    numGenerations: 100,
    goodFeedbackRatio: 80,
  });

  const handleGenerate = async () => {
    // Validate all required fields
    if (!formData.aiModel || !formData.aiSdkKey || !formData.ldSdkKey || 
        !formData.configClientId || formData.numGenerations === '') {
      // Add error handling for missing fields
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Add success notification
      console.log(`Successfully generated ${data.completedGenerations} items`);
      
      if (data.errors) {
        // Handle any non-fatal errors that occurred during generation
        console.warn('Some generations had errors:', data.errors);
      }

    } catch (error) {
      // Add error notification
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            LaunchDarkly Data Generator
          </h1>
          <p className="text-gray-400 mb-8">
            Generate sample data for your LaunchDarkly implementation
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label.Root className="text-white text-sm">AI Model</Label.Root>
            <Select.Root onValueChange={(value) => updateFormData('aiModel', value)}>
              <Select.Trigger className="inline-flex items-center justify-between w-full px-4 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556cfe] focus:ring-offset-2 focus:ring-offset-black">
                <Select.Value placeholder="Select AI Model" />
                <Select.Icon>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden bg-gray-900 border border-gray-700 rounded-md">
                  <Select.Viewport>
                    <Select.Item value="claude" className="flex items-center h-10 px-4 py-2 text-sm text-white select-none hover:bg-gray-800 focus:bg-gray-800 focus:outline-none cursor-pointer">
                      <Select.ItemText>Claude</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                        <Check className="w-4 h-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item value="openai" className="flex items-center h-10 px-4 py-2 text-sm text-white select-none hover:bg-gray-800 focus:bg-gray-800 focus:outline-none cursor-pointer">
                      <Select.ItemText>OpenAI</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                        <Check className="w-4 h-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="space-y-2">
            <Label.Root className="text-white text-sm">AI SDK Key</Label.Root>
            <input
              type="password"
              placeholder="Enter AI SDK Key"
              className="w-full px-4 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556cfe] focus:ring-offset-2 focus:ring-offset-black"
              value={formData.aiSdkKey}
              onChange={(e) => updateFormData('aiSdkKey', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label.Root className="text-white text-sm">LaunchDarkly SDK Key</Label.Root>
            <input
              type="password"
              placeholder="Enter LaunchDarkly SDK Key"
              className="w-full px-4 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556cfe] focus:ring-offset-2 focus:ring-offset-black"
              value={formData.ldSdkKey}
              onChange={(e) => updateFormData('ldSdkKey', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label.Root className="text-white text-sm">AI Config Client ID</Label.Root>
            <input
              type="text"
              placeholder="Enter Config Client ID"
              className="w-full px-4 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556cfe] focus:ring-offset-2 focus:ring-offset-black"
              value={formData.configClientId}
              onChange={(e) => updateFormData('configClientId', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label.Root className="text-white text-sm">Number of Generations</Label.Root>
            <input
              type="number"
              min="1"
              max="1000"
              className="w-full px-4 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556cfe] focus:ring-offset-2 focus:ring-offset-black"
              value={formData.numGenerations}
              onChange={(e) => updateFormData('numGenerations', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label.Root className="text-white text-sm">Good Feedback Ratio</Label.Root>
              <span className="text-white text-sm">{formData.goodFeedbackRatio}%</span>
            </div>
            <div className="flex gap-4">
              <Slider.Root
                className="relative flex items-center w-full h-5"
                value={[formData.goodFeedbackRatio]}
                max={100}
                step={1}
                onValueChange={(value) => updateFormData('goodFeedbackRatio', value[0])}
              >
                <Slider.Track className="relative h-2 grow rounded-full bg-gray-700">
                  <Slider.Range className="absolute h-full rounded-full bg-[#556cfe]" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-5 h-5 bg-white border-2 border-[#556cfe] rounded-full focus:outline-none focus:ring-2 focus:ring-[#556cfe] focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Good Feedback Ratio"
                />
              </Slider.Root>
              <input
                type="number"
                min="0"
                max="100"
                className="w-20 px-4 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556cfe] focus:ring-offset-2 focus:ring-offset-black"
                value={formData.goodFeedbackRatio}
                onChange={(e) => updateFormData('goodFeedbackRatio', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`
            w-full py-6 text-lg font-medium text-white
            bg-gradient-to-r from-[#556cfe] to-[#6b7fff]
            hover:from-[#4a5fe6] hover:to-[#5f73ff]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 ease-in-out
            shadow-lg hover:shadow-xl
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[#556cfe] focus:ring-offset-2 focus:ring-offset-black
          `}
        >
          {isGenerating ? 'Generating...' : 'Generate Data'}
        </button>
      </div>
    </main>
  );
}