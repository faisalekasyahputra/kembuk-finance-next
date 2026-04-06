import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const mimeType = image.type || 'image/jpeg'
    const dataUri = `data:${mimeType};base64,${base64Image}`

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const prompt = `Analyze this receipt/invoice image. Extract the following information and return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "amount": number (the total amount from the receipt),
  "description": string (brief description of what the receipt is for),
  "date": string (date from receipt in YYYY-MM-DD format, or today's date if not visible),
  "category": string (suggested category: Food, Transport, Utilities, Shopping, Healthcare, Entertainment, Other)
}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              inlineData: {
                mimeType,
                data: base64Image
              }
            }, {
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json({ error: 'Failed to analyze receipt' }, { status: 500 })
    }

    const geminiData = await geminiResponse.json()
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      return NextResponse.json({ error: 'No analysis result from Gemini' }, { status: 500 })
    }

    let parsedResult
    try {
      const cleanedText = generatedText.replace(/```json\n?|```\n?/g, '').trim()
      parsedResult = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Raw text:', generatedText)
      return NextResponse.json({ error: 'Failed to parse Gemini response' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        amount: parsedResult.amount,
        description: parsedResult.description || 'Struk',
        date: parsedResult.date || new Date().toISOString().split('T')[0],
        category: parsedResult.category || 'Other',
      }
    })
  } catch (error) {
    console.error('Receipt analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
