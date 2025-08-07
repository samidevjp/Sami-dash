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
                  text: `You are an expert in extracting information from invoices. I have a PDF invoice that I need to extract information from.

                  Your task is to carefully analyze the content and extract the following information:
                  
                  1. Invoice Number: Look for numbers labeled as "Invoice #", "Invoice Number", "No.", etc.
                  2. Date Issued: Look for dates labeled as "Date", "Invoice Date", etc.
                  3. Supplier Name: Look for the company name, usually at the top of the invoice.
                  4. Supplier Stock Number: Look for any supplier reference numbers.
                  5. Products: Look for a table or list of items with quantities, prices, and totals.
                  
                  Return the information in this JSON format:
                  {
                    "invoice_number": "",
                    "date_issued": "", 
                    "supplier_name": "",
                    "supplier_stock_number": "",
                    "products": [
                      { "name": "", "quantity": 0, "price": 0, "total": 0 }
                    ]
                  }
                  
                  If you can't determine a value, use null, but try your best to extract all information.
                  Do not include any explanatory text, just return the JSON object.`
                },
                {
                  inline_data: {
                    mime_type: file.type || 'application/pdf',
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

        // If the response is not valid JSON, try to extract JSON from it
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedText = jsonMatch[0];
          try {
            JSON.parse(extractedText);
          } catch (e) {
            console.warn('Extracted JSON is still not valid');
          }
        }
      }

      return NextResponse.json({ text: extractedText });
    } catch (apiError: any) {
      console.error(
        'Gemini API Error:',
        apiError.response?.data || apiError.message
      );

      // If the model fails, provide a user-friendly fallback
      try {
        // Return a structured response with placeholders
        const fallbackResponse = {
          invoice_number: 'Please enter manually',
          date_issued: 'Please enter manually',
          supplier_name: 'Please enter manually',
          supplier_stock_number: 'Please enter manually',
          products: [
            {
              name: 'Please add products manually',
              quantity: 0,
              price: 0,
              total: 0
            }
          ]
        };

        return NextResponse.json({
          text: JSON.stringify(fallbackResponse, null, 2),
          note: 'PDF extraction failed. Please enter the invoice details manually.'
        });
      } catch (fallbackError: any) {
        console.error('Fallback Error:', fallbackError);
        return NextResponse.json(
          {
            error: 'Error processing PDF',
            details: fallbackError.message || 'Unknown error'
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Error processing PDF', details: error.message },
      { status: 500 }
    );
  }
}
