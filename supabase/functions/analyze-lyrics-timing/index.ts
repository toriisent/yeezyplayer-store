
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, lyrics } = await req.json();
    
    if (!audioUrl || !lyrics) {
      throw new Error('Audio URL and lyrics are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // First, we'll use OpenAI to analyze the lyrics structure and estimate timing
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert in music timing and lyrics synchronization. Given lyrics text, estimate realistic timing for each word based on typical song patterns. 

Return a JSON array where each element represents a line with this structure:
{
  "time": <start_time_in_seconds>,
  "words": [
    {
      "word": "<word>",
      "start": <start_time_in_seconds>,
      "end": <end_time_in_seconds>
    }
  ]
}

Guidelines:
- Average song tempo is 120 BPM (2 beats per second)
- Average word duration is 0.3-0.6 seconds
- Leave small gaps (0.1-0.2s) between words
- Consider natural breathing pauses between lines
- Typical verse line lasts 3-5 seconds
- Chorus lines might be faster/slower based on energy`
          },
          {
            role: 'user',
            content: `Please analyze these lyrics and provide timing estimates:\n\n${lyrics}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let timedLyrics;
    
    try {
      const parsedResponse = JSON.parse(data.choices[0].message.content);
      timedLyrics = parsedResponse.lines || parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback: create simple timing based on word count
      const lines = lyrics.split('\n').filter(line => line.trim());
      timedLyrics = lines.map((line, lineIndex) => {
        const words = line.trim().split(/\s+/);
        const lineStartTime = lineIndex * 4; // 4 seconds per line
        
        return {
          time: lineStartTime,
          words: words.map((word, wordIndex) => ({
            word,
            start: lineStartTime + (wordIndex * 0.5),
            end: lineStartTime + ((wordIndex + 1) * 0.5)
          }))
        };
      });
    }

    return new Response(JSON.stringify({ timedLyrics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-lyrics-timing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
