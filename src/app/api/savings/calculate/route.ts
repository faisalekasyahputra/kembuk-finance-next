import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const { data: totals, error: totalsError } = await supabase
      .from('kf_transactions')
      .select('type, amount')
      .eq('user_id', 'shared')

    if (totalsError) {
      return NextResponse.json({ error: totalsError.message }, { status: 500 })
    }

    const totalIncome = totals?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const totalExpense = totals?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const sisa = totalIncome - totalExpense

    const { data: savings, error: savingsError } = await supabase
      .from('kf_savings')
      .select('*')
      .eq('user_id', 'shared')
      .single()

    if (savingsError) {
      return NextResponse.json({ error: savingsError.message }, { status: 500 })
    }

    if (totalIncome !== (savings.last_total_income || 0) || totalExpense !== (savings.last_total_expense || 0)) {
      const autoSavePercent = savings.auto_save_percent || 0
      const autoSave = sisa * (autoSavePercent / 100)
      const balanceBefore = savings.balance || 0

      const { data: activeTargets, error: targetsError } = await supabase
        .from('kf_savings_targets')
        .select('id, current_amount, target_amount')
        .eq('user_id', 'shared')
        .eq('is_active', true)
        .eq('is_completed', false)

      if (targetsError) {
        return NextResponse.json({ error: targetsError.message }, { status: 500 })
      }

      const activeTargetsCount = activeTargets?.length || 0
      let amountPerTarget = 0

      if (activeTargetsCount > 0 && autoSave > 0) {
        amountPerTarget = autoSave / activeTargetsCount

        for (const target of activeTargets || []) {
          const newCurrent = Number(target.current_amount) + amountPerTarget
          const isCompleted = newCurrent >= Number(target.target_amount)

          await supabase
            .from('kf_savings_targets')
            .update({
              current_amount: newCurrent,
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
            amount: autoSave,
            balance_before: balanceBefore,
            balance_after: autoSave,
            description: `Auto-save dari ${activeTargetsCount} target aktif`
          })
      }

      await supabase
        .from('kf_savings')
        .update({
          balance: autoSave,
          last_total_income: totalIncome,
          last_total_expense: totalExpense,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', 'shared')
    }

    const { data: updatedSavings } = await supabase
      .from('kf_savings')
      .select('*')
      .eq('user_id', 'shared')
      .single()

    const { data: updatedTargets } = await supabase
      .from('kf_savings_targets')
      .select('*')
      .eq('user_id', 'shared')
      .order('priority', { ascending: true })

    return NextResponse.json({
      savings: updatedSavings,
      targets: updatedTargets
    })

  } catch (error) {
    console.error('Error calculating auto-save:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
