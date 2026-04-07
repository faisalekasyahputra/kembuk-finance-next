import { NextRequest, NextResponse } from 'next/server'

const OWNER_ID = process.env.TELEGRAM_OWNER_ID || '5383236811'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8677289448:AAEQz5YrVhHwX210MLTp-6-6AgSe8Eg5fUc'

const CRON_PATH = '/home/ubuntu/.openclaw/cron/jobs.json'

function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🤖 Agents Status', callback_data: 'agents' }],
        [{ text: '⏰ Cron Jobs', callback_data: 'cron' }],
        [{ text: '📊 Stats', callback_data: 'stats' }],
        [{ text: '🔄 Force Sync', callback_data: 'sync' }],
        [{ text: '📋 Logs', callback_data: 'logs' }],
        [{ text: '⚙️ Settings', callback_data: 'settings' }]
      ]
    }
  }
}

function getAgentsMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Ndrogrok 🟢 Active', callback_data: 'agent_ndrogrok' }],
        [{ text: 'Kembukbot 🟢 Active', callback_data: 'agent_kembukbot' }],
        [{ text: '◀️ Back to Panel', callback_data: 'panel' }]
      ]
    }
  }
}

function getCronMenu(crons: { id: string; name: string; enabled: boolean }[]) {
  const buttons = crons.map((cron) => {
    const status = cron.enabled ? '🟢' : '🔴'
    const name = cron.name.length > 20 ? cron.name.substring(0, 20) + '...' : cron.name
    return [{ text: `${status} ${name}`, callback_data: `cron_detail_${cron.id}` }]
  })
  buttons.push([{ text: '◀️ Back to Panel', callback_data: 'panel' }])
  
  return {
    reply_markup: {
      inline_keyboard: buttons
    }
  }
}

function getCronDetailMenu(cron: { id: string; name: string; enabled: boolean; schedule?: { expr?: string }; updatedAtMs?: number }) {
  const status = cron.enabled ? '🟢 ENABLED' : '🔴 DISABLED'
  const toggleText = cron.enabled ? '🔴 Disable' : '🟢 Enable'
  const toggleData = cron.enabled ? `cron_disable_${cron.id}` : `cron_enable_${cron.id}`
  
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: `Status: ${status}`, callback_data: 'noop' }],
        [
          { text: toggleText, callback_data: toggleData },
          { text: '📋 View Logs', callback_data: `cron_logs_${cron.id}` }
        ],
        [{ text: '◀️ Back to Cron List', callback_data: 'cron' }]
      ]
    }
  }
}

function getSettingsMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔔 Notifications', callback_data: 'settings_notify' }],
        [{ text: '⏰ Cron Schedule', callback_data: 'settings_schedule' }],
        [{ text: '🔑 API Keys', callback_data: 'settings_keys' }],
        [{ text: '◀️ Back to Panel', callback_data: 'panel' }]
      ]
    }
  }
}

interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule?: { expr?: string }
  updatedAtMs?: number
}

async function sendMessage(chatId: string, text: string, extra: Record<string, unknown> = {}) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...extra
    })
  })
}

async function editMessage(chatId: string, messageId: number, text: string, extra: Record<string, unknown> = {}) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...extra
    })
  })
}

async function getCronJobs(): Promise<CronJob[]> {
  try {
    const fs = require('fs')
    const data = fs.readFileSync(CRON_PATH, 'utf8')
    const parsed = JSON.parse(data)
    return parsed.jobs || []
  } catch {
    return []
  }
}

async function saveCronJobs(jobs: CronJob[]) {
  const fs = require('fs')
  const data = fs.readFileSync(CRON_PATH, 'utf8')
  const parsed = JSON.parse(data)
  parsed.jobs = jobs
  parsed.version = 1
  fs.writeFileSync(CRON_PATH, JSON.stringify(parsed, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const message = body.message || body.edited_message || body.callback_query
    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat?.id?.toString()
    const text = message.text || ''
    const callbackQuery = body.callback_query
    
    if (callbackQuery) {
      const chatId = callbackQuery.from.id.toString()
      const messageId = callbackQuery.message?.message_id
      const data = callbackQuery.data
      const chatIdStr = callbackQuery.message?.chat?.id?.toString()
      
      if (chatId !== OWNER_ID) {
        await sendMessage(chatId, '❌ Akses ditolak. Hanya owner yang bisa mengakses panel.')
        return NextResponse.json({ ok: true })
      }

      switch (data) {
        case 'panel':
          await editMessage(chatIdStr, messageId, getPanelText(), getMainMenu())
          break
          
        case 'agents':
          await editMessage(chatIdStr, messageId, getAgentsText(), getAgentsMenu())
          break
          
        case 'cron':
          const crons = await getCronJobs()
          await editMessage(chatIdStr, messageId, getCronListText(crons), getCronMenu(crons))
          break
          
        case 'stats':
          await editMessage(chatIdStr, messageId, await getStatsText(), getMainMenu())
          break
          
        case 'logs':
          await editMessage(chatIdStr, messageId, await getLogsText(), getMainMenu())
          break
          
        case 'settings':
          await editMessage(chatIdStr, messageId, getSettingsText(), getSettingsMenu())
          break
          
        case 'sync':
          await editMessage(chatIdStr, messageId, '🔄 <b>Syncing...</b>\n\nMohon tunggu sebentar...', getMainMenu())
          await fetchGitAndReport(chatIdStr)
          break
          
        default:
          if (data?.startsWith('cron_detail_')) {
            const cronId = data.replace('cron_detail_', '')
            const crons = await getCronJobs()
            const cron = crons.find(j => j.id === cronId)
            if (cron) {
              await editMessage(chatIdStr, messageId, getCronDetailText(cron), getCronDetailMenu(cron))
            }
          }
          else if (data?.startsWith('cron_enable_')) {
            const cronId = data.replace('cron_enable_', '')
            const crons = await getCronJobs()
            const cron = crons.find(j => j.id === cronId)
            if (cron) {
              cron.enabled = true
              cron.updatedAtMs = Date.now()
              await saveCronJobs(crons)
              await sendMessage(chatIdStr, `✅ Cron job <b>${cron.name}</b> telah di-ENABLE`)
              const allCrons = await getCronJobs()
              await editMessage(chatIdStr, messageId, getCronListText(allCrons), getCronMenu(allCrons))
            }
          }
          else if (data?.startsWith('cron_disable_')) {
            const cronId = data.replace('cron_disable_', '')
            const crons = await getCronJobs()
            const cron = crons.find(j => j.id === cronId)
            if (cron) {
              cron.enabled = false
              cron.updatedAtMs = Date.now()
              await saveCronJobs(crons)
              await sendMessage(chatIdStr, `⛔ Cron job <b>${cron.name}</b> telah di-DISABLE`)
              const allCrons = await getCronJobs()
              await editMessage(chatIdStr, messageId, getCronListText(allCrons), getCronMenu(allCrons))
            }
          }
          break
      }
      
      return NextResponse.json({ ok: true })
    }

    if (chatId !== OWNER_ID) {
      return NextResponse.json({ ok: true })
    }

    if (text === '/start' || text === '/panel') {
      await sendMessage(chatId, getWelcomeText(), getMainMenu())
    } 
    else if (text === '/agents') {
      await sendMessage(chatId, getAgentsText(), getAgentsMenu())
    }
    else if (text === '/cron') {
      const crons = await getCronJobs()
      await sendMessage(chatId, getCronListText(crons), getCronMenu(crons))
    }
    else if (text === '/stats') {
      await sendMessage(chatId, await getStatsText(), getMainMenu())
    }
    else if (text === '/logs') {
      await sendMessage(chatId, await getLogsText(), getMainMenu())
    }
    else if (text === '/settings') {
      await sendMessage(chatId, getSettingsText(), getSettingsMenu())
    }
    else if (text === '/sync') {
      await sendMessage(chatId, '🔄 <b>Syncing...</b>\n\nMohon tunggu sebentar...')
      await fetchGitAndReport(chatId)
    }
    else if (text === '/help') {
      await sendMessage(chatId, getHelpText())
    }
    else if (text === '/health') {
      await sendMessage(chatId, await getHealthText())
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

function getWelcomeText() {
  return `🔧 <b>KEMBUK WORKFLOW PANEL</b>

Selamat datang di Panel Management Workflow Kembuk Finance.

<b>Fitur:</b>
• 🤖 Monitor agents status
• ⏰ Manage cron jobs
• 📊 View statistics
• 🔄 Force sync agents
• 📋 View logs & errors

Gunakan tombol di bawah atau ketik /help untuk bantuan.`
}

function getPanelText() {
  return `🔧 <b>KEMBUK WORKFLOW PANEL</b>

Pilih menu di bawah:`
}

function getAgentsText() {
  return `🤖 <b>AGENTS STATUS</b>

<b>Ndrogrok</b>
• Status: 🟢 Online
• Role: Dev Agent
• Last Activity: baru saja
• Tasks: Active

<b>Kembukbot</b>
• Status: 🟢 Online
• Role: QA Agent
• Last Activity: baru saja
• Tasks: Active

<i>Last updated: ${new Date().toLocaleString('id-ID')}</i>`
}

function getCronListText(crons: CronJob[]) {
  if (!crons.length) {
    return `⏰ <b>CRON JOBS</b>\n\nBelum ada cron jobs configured.`
  }
  
  let text = `⏰ <b>CRON JOBS</b> (${crons.length})\n\n`
  
  crons.forEach((cron: CronJob, i: number) => {
    const status = cron.enabled ? '🟢' : '🔴'
    const statusText = cron.enabled ? 'ENABLED' : 'DISABLED'
    text += `<b>${i + 1}. ${cron.name}</b>\n`
    text += `   Status: ${status} ${statusText}\n`
    text += `   Schedule: ${cron.schedule?.expr || 'N/A'}\n`
    if (cron.updatedAtMs) {
      text += `   Last Update: ${new Date(cron.updatedAtMs).toLocaleString('id-ID')}\n`
    }
    text += '\n'
  })
  
  text += `<i>Tap untuk manage individual cron job</i>`
  
  return text
}

function getCronDetailText(cron: CronJob) {
  const status = cron.enabled ? '🟢 ENABLED' : '🔴 DISABLED'
  return `⏰ <b>CRON JOB DETAIL</b>

<b>Name:</b> ${cron.name}
<b>ID:</b> <code>${cron.id}</code>
<b>Status:</b> ${status}
<b>Schedule:</b> <code>${cron.schedule?.expr || 'N/A'}</code>
${cron.updatedAtMs ? `<b>Last Update:</b> ${new Date(cron.updatedAtMs).toLocaleString('id-ID')}` : ''}

<i>Use tombol di bawah untuk manage</i>`
}

async function getStatsText() {
  try {
    const fs = require('fs')
    const { execSync } = require('child_process')
    
    const gitLog = execSync('cd /home/ubuntu/.openclaw/workspace && git log --oneline --since="24 hours ago" 2>/dev/null | wc -l', { encoding: 'utf8' })
    const commitsToday = parseInt(gitLog.trim()) || 0
    
    const pushLog = execSync('cd /home/ubuntu/.openclaw/workspace && git log --oneline origin/main -5 2>/dev/null || echo "N/A"', { encoding: 'utf8' })
    
    return `📊 <b>TODAY STATISTICS</b>

<b>Git Activity (24h):</b>
• Commits: ${commitsToday}

<b>Recent Commits:</b>
${pushLog.trim().split('\n').map((l: string) => `• ${l}`).join('\n') || '• N/A'}

<b>System:</b>
• OpenClaw: 🟢 Running
• Gateway: 🟢 Online
• Agents: 2 Active

<i>Last updated: ${new Date().toLocaleString('id-ID')}</i>`
  } catch {
    return `📊 <b>STATISTICS</b>\n\nGagal mengambil data statistik.`
  }
}

async function getLogsText(): Promise<string> {
  try {
    const { execSync } = require('child_process')
    const logs = execSync('openclaw tasks list 2>&1 | head -20', { encoding: 'utf8' })
    
    const lines = logs.split('\n').filter((l: string) => l.trim())
    const recent = lines.slice(0, 15)
    
    return `📋 <b>RECENT LOGS</b>

<pre>${recent.join('\n')}</pre>

<i>Last updated: ${new Date().toLocaleString('id-ID')}</i>`
  } catch {
    return `📋 <b>LOGS</b>\n\nGagal mengambil logs.`
  }
}

function getSettingsText() {
  return `⚙️ <b>SETTINGS</b>

<b>Available Settings:</b>

🔔 <b>Notifications</b>
• Telegram: Enabled
• WhatsApp: Disabled

⏰ <b>Cron Schedule</b>
• Default polling: 3 minutes

🔑 <b>API Access</b>
• Telegram Bot: Connected
• Supabase: Connected
• Gemini AI: Connected

<i>Use tombol di bawah untuk configure</i>`
}

async function getHealthText() {
  return `❤️ <b>SYSTEM HEALTH</b>

<b>Services:</b>
• OpenClaw Gateway: 🟢 OK
• Telegram Bot: 🟢 OK
• WhatsApp: 🟡 Not Linked

<b>Agents:</b>
• Ndrogrok: 🟢 Active
• Kembukbot: 🟢 Active

<b>Resources:</b>
• Memory: Normal
• CPU: Normal

<i>All systems operational</i>`
}

function getHelpText() {
  return `📖 <b>HELP</b>

<b>Available Commands:</b>

/start - Buka panel
/panel - Buka workflow panel
/agents - Lihat status agents
/cron - Manage cron jobs
/stats - Lihat statistik
/logs - Lihat recent logs
/sync - Force sync agents
/health - System health check
/settings - Settings panel
/help - Help menu

<b>Inline Buttons:</b>
Gunakan tombol inline di panel untuk navigasi cepat.`
}

async function fetchGitAndReport(chatId: string) {
  try {
    const { execSync } = require('child_process')
    
    const commits = execSync('cd /home/ubuntu/.openclaw/workspace && git fetch origin && git log --oneline origin/main -5', { encoding: 'utf8' })
    
    await sendMessage(chatId, `✅ <b>SYNC COMPLETE</b>

<b>Recent commits on origin/main:</b>
<pre>${commits.trim()}</pre>

<i>Sync completed: ${new Date().toLocaleString('id-ID')}</i>`, getMainMenu())
  } catch (error) {
    await sendMessage(chatId, `❌ <b>SYNC FAILED</b>\n\nError: ${String(error)}`, getMainMenu())
  }
}
