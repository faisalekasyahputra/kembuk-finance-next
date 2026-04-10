const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789'
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || 'f1512d8ed36e4ccfb192f8c939b709399167432b23853271'
const DEFAULT_WHATSAPP = process.env.DEFAULT_WHATSAPP_NUMBER || '+628993320808'

export async function sendWhatsAppReceipt(data: {
  type: 'income' | 'expense'
  amount: number
  category: string
  description?: string
  targetName?: string
  targetStatus?: 'pending' | 'paid'
  balance?: number
  date?: string
}) {
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
  const dateStr = date || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const timeStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })

  let message = `🧾 Struk Baru!

━━━━━━━━━━━━━━━━━
📅 ${dateStr}, ${timeStr}
━━━━━━━━━━━━━━━━━

${messageType}
💰 ${formattedAmount}

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

  try {
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/rpc/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`
      },
      body: JSON.stringify({
        channel: 'whatsapp',
        target: DEFAULT_WHATSAPP,
        message
      })
    })

    if (!response.ok) {
      console.error('WhatsApp send failed:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return false
  }
}
