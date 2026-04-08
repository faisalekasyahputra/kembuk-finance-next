import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kf_savings')
      .select('*')
      .eq('user_id', 'shared')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ savings: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { auto_save_percent, balance } = body

    const updateData: { auto_save_percent?: number; balance?: number; updated_at: string } = {
      updated_at: new Date().toISOString()
    }
    
    if (auto_save_percent !== undefined) {
      updateData.auto_save_percent = auto_save_percent
    }
    if (balance !== undefined) {
      updateData.balance = balance
    }

    const { data, error } = await supabase
      .from('kf_savings')
      .update(updateData)
      .eq('user_id', 'shared')
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ savings: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
