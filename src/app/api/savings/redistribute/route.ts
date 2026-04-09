import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const { data: savings, error: savingsError } = await supabase
      .from('kf_savings')
      .select('*')
      .eq('user_id', 'shared')
      .single()

    if (savingsError) {
      return NextResponse.json({ error: savingsError.message }, { status: 500 })
    }

    const totalBalance = savings.balance || 0

    const { data: activeTargets, error: targetsError } = await supabase
      .from('kf_savings_targets')
      .select('id, name, current_amount, target_amount, is_completed')
      .eq('user_id', 'shared')
      .eq('is_active', true)
      .eq('is_completed', false)

    if (targetsError) {
      return NextResponse.json({ error: targetsError.message }, { status: 500 })
    }

    const activeTargetsCount = activeTargets?.length || 0

    if (activeTargetsCount === 0) {
      return NextResponse.json({
        message: 'No active targets',
        targets: activeTargets || []
      })
    }

    const balancePerTarget = totalBalance / activeTargetsCount

    for (const target of activeTargets || []) {
      const isCompleted = balancePerTarget >= Number(target.target_amount)

      await supabase
        .from('kf_savings_targets')
        .update({
          current_amount: balancePerTarget,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', target.id)
    }

    await supabase
      .from('kf_savings_history')
      .insert({
        user_id: 'shared',
        type: 'auto_save',
        amount: totalBalance,
        balance_before: totalBalance,
        balance_after: totalBalance,
        description: `Re-distribute savings ke ${activeTargetsCount} target`
      })

    const { data: updatedTargets } = await supabase
      .from('kf_savings_targets')
      .select('*')
      .eq('user_id', 'shared')
      .order('priority', { ascending: true })

    return NextResponse.json({
      message: `Re-distributed ${totalBalance} to ${activeTargetsCount} targets`,
      amount_per_target: balancePerTarget,
      targets: updatedTargets
    })

  } catch (error) {
    console.error('Error redistributing savings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
