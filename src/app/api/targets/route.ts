import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kf_targets')
      .select('*')
      .order('due_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ targets: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, amount, due_date, is_recurring } = body

    if (!name || !amount) {
      return NextResponse.json({ error: 'Name and amount are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('kf_targets')
      .insert({
        name,
        amount: parseFloat(amount),
        due_date: due_date || null,
        is_recurring: is_recurring ?? true,
        user_id: 'shared'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ target: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
