import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const base64Data = await fileToBase64(file);

    // Extract text using Google Vision
    const recognizedText = await extractTextFromImage(base64Data);

    // Parse menu items using GPT
    const menuData = await parseMenuWithGPT(recognizedText);
    return NextResponse.json(menuData);
  } catch (error) {
    console.error('Menu scanning error:', error);
    return NextResponse.json(
      { error: 'Failed to process menu' },
      { status: 500 }
    );
  }
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

async function extractTextFromImage(base64Image: string) {
  const apiKey = process.env.GOOGLE_API_KEY;

  const requestBody = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'TEXT_DETECTION' }]
      }
    ]
  };

  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    requestBody,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );

  return response.data.responses[0].fullTextAnnotation.text;
}

async function parseMenuWithGPT(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a menu analyzer. Extract menu items and categories from the text.'
        },
        {
          role: 'user',
          content: `Extract menu items and categories from this menu text. Format the response as JSON with this structure:
            {
              "categories": [
                { "name": "Category Name", "color": "#HEX_COLOR", "order": number }
              ],
              "products": [
                {
                  "title": "Product Name",
                  "price": number,
                  "code": "string",
                  "stock": "0",
                  "description": "string",
                  "category_id": number
                }
              ]
            }
            
            Text: ${text}`
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      }
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
}
