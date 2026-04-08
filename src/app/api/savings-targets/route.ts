import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kf_savings_targets')
      .select('*')
      .eq('user_id', 'shared')
      .order('priority', { ascending: true })

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
    const { name, target_amount, icon, color, priority } = body

    if (!name || !target_amount) {
      return NextResponse.json({ error: 'Name and target_amount are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('kf_savings_targets')
      .insert({
        name,
        target_amount: parseFloat(target_amount),
        current_amount: 0,
        icon: icon || 'PiggyBank',
        color: color || '#22c55e',
        priority: priority || 0,
        user_id: 'shared',
        is_active: true,
        is_completed: false,
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
