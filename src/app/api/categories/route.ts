import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kf_categories')
      .select('*')
      .eq('user_id', 'shared')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories: data })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, name_id, icon, color, group_type } = body

    if (!name || !group_type) {
      return NextResponse.json({ error: 'Name and group_type are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('kf_categories')
      .insert([
        {
          user_id: 'shared',
          name,
          name_id: name_id || name,
          icon: icon || 'Package',
          color: color || '#A1A1AA',
          group_type,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
