import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, name_id, icon, color, group_type, is_active } = body

    const { data, error } = await supabase
      .from('kf_categories')
      .update({
        name,
        name_id: name_id || name,
        icon,
        color,
        group_type,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', 'shared')
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { error } = await supabase
      .from('kf_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', 'shared')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
