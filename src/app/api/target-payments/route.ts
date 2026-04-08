import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { data, error } = await supabase
      .from('kf_target_payments')
      .select('*, kf_targets(*)')
      .gte('paid_at', startOfMonth)
      .lte('paid_at', endOfMonth)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ payments: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { target_id, amount, transaction_id } = body

    if (!target_id || !amount) {
      return NextResponse.json({ error: 'Target ID and amount are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('kf_target_payments')
      .insert({
        target_id,
        amount: parseFloat(amount),
        transaction_id: transaction_id || null,
        user_id: 'shared',
        paid_at: new Date().toISOString()
      })
      .select('*, kf_targets(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ payment: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
