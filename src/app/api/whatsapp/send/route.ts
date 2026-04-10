import { NextRequest, NextResponse } from 'next/server'

const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789'
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || 'f1512d8ed36e4ccfb192f8c939b709399167432b23853271'
const DEFAULT_WHATSAPP = process.env.DEFAULT_WHATSAPP_NUMBER || '+628993320808'

function formatReceipt(data: {
  type: string
  amount: number
  category: string
  description?: string
  targetName?: string
  targetStatus?: string
  balance?: number
  date?: string
}): string {
  const { type, amount, category, description, targetName, targetStatus, balance, date } = data
  
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)

  const formattedBalance = balance 
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(balance)
    : null

  const messageType = type === 'income' ? '💰 Pendapatan' : '💸 Pengeluaran'
  const dateStr = date 
    ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  let message = `🧾 *Struk Baru!*

━━━━━━━━━━━━━━━━━
📅 ${dateStr}, ${timeStr}
━━━━━━━━━━━━━━━━━

${messageType}
💰 *${formattedAmount}*

📂 Kategori: ${category}`

  if (description) {
    message += `\n📝 ${description}`
  }

  if (targetName) {
    const statusIcon = targetStatus === 'paid' ? '✅' : '⏳'
    const statusText = targetStatus === 'paid' ? 'LUNAS' : 'pending'
    message += `\n\n💡 Tagihan: ${targetName} (${statusIcon} ${statusText})`
  }

  if (formattedBalance) {
    message += `\n━━━━━━━━━━━━━━━━━
💼 Saldo: ${formattedBalance}`
  }

  return message
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel = 'whatsapp', target, message, type, amount, category, description, balance, date } = body

    const recipient = target || DEFAULT_WHATSAPP

    let finalMessage = message
    if (!finalMessage && type && amount && category) {
      finalMessage = formatReceipt({ type, amount, category, description, balance, date })
    }

    if (!finalMessage) {
      return NextResponse.json({ error: 'Message or transaction data required' }, { status: 400 })
    }

    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/rpc/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`
      },
      body: JSON.stringify({
        channel,
        target: recipient,
        message: finalMessage
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: 'Failed to send message', details: error }, { status: 500 })
    }

    const result = await response.json()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
