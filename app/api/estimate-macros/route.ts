import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { foodName, weight, weightUnit } = body;

    if (!foodName || !weight || !weightUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create prompt for GPT to estimate macros
    const prompt = `You are a nutrition expert. Estimate the nutritional information for the following food item.

Food: ${foodName}
Amount: ${weight} ${weightUnit}

Provide accurate estimates for:
- Calories (integer)
- Protein in grams (decimal)
- Carbs in grams (decimal)
- Fats in grams (decimal)

Respond ONLY with a JSON object in this exact format (no markdown, no extra text):
{"calories": 250, "protein": 30.5, "carbs": 0.0, "fats": 12.0}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition expert who provides accurate macro estimates. Always respond with only valid JSON, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const responseText = completion.choices[0].message.content?.trim() || '';

    // Parse the JSON response
    let macros;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      macros = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Invalid response format from AI');
    }

    // Validate the response
    if (
      typeof macros.calories !== 'number' ||
      typeof macros.protein !== 'number' ||
      typeof macros.carbs !== 'number' ||
      typeof macros.fats !== 'number'
    ) {
      throw new Error('Invalid macro data from AI');
    }

    // Round values appropriately
    const result = {
      calories: Math.round(macros.calories),
      protein: Math.round(macros.protein * 10) / 10,
      carbs: Math.round(macros.carbs * 10) / 10,
      fats: Math.round(macros.fats * 10) / 10,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error estimating macros:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to estimate macros' },
      { status: 500 }
    );
  }
}
