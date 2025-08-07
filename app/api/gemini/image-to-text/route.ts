import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log(
      'Using API key:',
      apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5)
    );

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Send to Gemini API
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Extract information from this invoice image and return it in a structured JSON format. 
                  The response should follow this structure:
                  {
                    "invoice_number": "",
                    "date_issued": "", 
                    "supplier_name": "",
                    "supplier_stock_number": "",
                    "products": [
                      { "name": "", "quantity": 0, "price": 0, "total": 0 }
                    ]
                  }
                  
                  Do not include any explanatory text, just return the JSON object.`
                },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generation_config: {
            temperature: 0.1,
            maxOutputTokens: 2048
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      let extractedText = response.data.candidates[0].content.parts[0].text;

      // Clean up the response to ensure it's valid JSON
      extractedText = extractedText.replace(/```json\n|\n```|```/g, '').trim();

      try {
        // Validate that the response is valid JSON
        JSON.parse(extractedText);
      } catch (jsonError) {
        console.warn('Response is not valid JSON:', extractedText);
      }

      return NextResponse.json({ text: extractedText });
    } catch (apiError: any) {
      console.error(
        'Gemini API Error:',
        apiError.response?.data || apiError.message
      );
      return NextResponse.json(
        {
          error: 'Error calling Gemini API',
          details: apiError.response?.data || apiError.message
        },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing image with Gemini:', error);
    return NextResponse.json(
      { error: 'Error processing image with Gemini', details: error.message },
      { status: 500 }
    );
  }
}
