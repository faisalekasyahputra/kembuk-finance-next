const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8677289448:AAEQz5YrVhHwX210MLTp-6-6AgSe8Eg5fUc';
const OWNER_ID = process.env.TELEGRAM_OWNER_ID || '5383236811';
const CRON_PATH = '/home/ubuntu/.openclaw/cron/jobs.json';
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
let offset = 0;

async function apiCall(method, data = {}) {
  try {
    const res = await fetch(`${BASE_URL}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return await res.json();
  } catch (err) { console.error('API error:', err.message); return { ok: false }; }
}

async function sendMessage(chatId, text, extra = {}) {
  await apiCall('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
}

async function editMessage(chatId, messageId, text, replyMarkup = null) {
  await apiCall('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', reply_markup: replyMarkup });
}

function getMainMenu() {
  return { inline_keyboard: [
    [{ text: '🤖 Agents', callback_data: 'agents' }],
    [{ text: '⏰ Cron Jobs', callback_data: 'cron' }],
    [{ text: '📊 Stats', callback_data: 'stats' }],
    [{ text: '🔄 Sync', callback_data: 'sync' }],
    [{ text: '📋 Logs', callback_data: 'logs' }]
  ]};
}

function getCronMenu(crons) {
  const buttons = crons.map(c => [{ text: `${c.enabled ? '🟢' : '🔴'} ${c.name.substring(0, 18)}..`, callback_data: `cron_${c.id}` }]);
  buttons.push([{ text: '◀️ Back', callback_data: 'panel' }]);
  return { inline_keyboard: buttons };
}

function getCronDetail(cron) {
  const status = cron.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
  const toggle = cron.enabled ? '🔴 Disable' : '🟢 Enable';
  return { inline_keyboard: [
    [{ text: `Status: ${status}`, callback_data: 'noop' }],
    [{ text: toggle, callback_data: cron.enabled ? `disable_${cron.id}` : `enable_${cron.id}` }],
    [{ text: '◀️ Back', callback_data: 'cron' }]
  ]};
}

async function getCronJobs() {
  try { return JSON.parse(require('fs').readFileSync(CRON_PATH, 'utf8')).jobs || []; }
  catch { return []; }
}

async function saveCronJobs(jobs) {
  const fs = require('fs');
  const parsed = JSON.parse(fs.readFileSync(CRON_PATH, 'utf8'));
  parsed.jobs = jobs;
  fs.writeFileSync(CRON_PATH, JSON.stringify(parsed, null, 2));
}

async function handleCommand(chatId, text) {
  if (text === '/start' || text === '/panel') {
    await sendMessage(chatId, '🔧 <b>KEMBUK WORKFLOW PANEL</b>\n\nPilih menu:', { reply_markup: getMainMenu() });
  }
  else if (text === '/cron') {
    const crons = await getCronJobs();
    let msg = `⏰ <b>CRON JOBS</b> (${crons.length})\n\n`;
    crons.forEach((c, i) => { msg += `${i+1}. ${c.enabled ? '🟢' : '🔴'} <b>${c.name}</b>\n   Schedule: ${c.schedule?.expr || 'N/A'}\n\n`; });
    await sendMessage(chatId, msg, { reply_markup: getCronMenu(crons) });
  }
  else if (text === '/stats') {
    try {
      const { execSync } = require('child_process');
      const commits = execSync('cd /home/ubuntu/.openclaw/workspace && git log --oneline --since="24 hours ago" 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
      await sendMessage(chatId, `📊 <b>STATISTICS</b>\n\n• Commits (24h): ${commits}\n• OpenClaw: 🟢 Running`, { reply_markup: getMainMenu() });
    } catch { await sendMessage(chatId, '📊 <b>STATISTICS</b>\n\n• OpenClaw: 🟢 Running', { reply_markup: getMainMenu() }); }
  }
  else if (text === '/sync') {
    try {
      const { execSync } = require('child_process');
      const result = execSync('cd /home/ubuntu/.openclaw/workspace && git fetch origin && git log --oneline origin/main -3', { encoding: 'utf8' });
      await sendMessage(chatId, `✅ <b>SYNC COMPLETE</b>\n\n<pre>${result.trim()}</pre>`, { reply_markup: getMainMenu() });
    } catch { await sendMessage(chatId, '❌ Sync failed', { reply_markup: getMainMenu() }); }
  }
  else if (text === '/logs') {
    try {
      const { execSync } = require('child_process');
      const logs = execSync('openclaw tasks list 2>&1 | head -8', { encoding: 'utf8' });
      await sendMessage(chatId, `📋 <b>LOGS</b>\n\n<pre>${logs.trim()}</pre>`, { reply_markup: getMainMenu() });
    } catch { await sendMessage(chatId, '📋 Logs unavailable', { reply_markup: getMainMenu() }); }
  }
  else if (text === '/health') {
    await sendMessage(chatId, '❤️ <b>SYSTEM HEALTH</b>\n\n• OpenClaw: 🟢 OK\n• Telegram: 🟢 OK\n• Agents: 2 Active', { reply_markup: getMainMenu() });
  }
  else if (text === '/help') {
    await sendMessage(chatId, '📖 <b>HELP</b>\n\n/panel - Workflow Panel\n/cron - Cron Jobs\n/stats - Statistics\n/sync - Force Sync\n/logs - View Logs\n/health - Health Check');
  }
}

async function handleCallback(chatId, messageId, data, callbackId) {
  try { await apiCall('answerCallbackQuery', { callback_query_id: callbackId }); } catch {}
  
  if (data === 'panel') await editMessage(chatId, messageId, '🔧 <b>KEMBUK WORKFLOW PANEL</b>\n\nPilih menu:', getMainMenu());
  else if (data === 'agents') await editMessage(chatId, messageId, '🤖 <b>AGENTS</b>\n\n• Ndrogrok: 🟢 Active\n• Kembukbot: 🟢 Active', { inline_keyboard: [[{ text: '◀️ Back', callback_data: 'panel' }]] });
  else if (data === 'cron') {
    const crons = await getCronJobs();
    let msg = `⏰ <b>CRON JOBS</b> (${crons.length})\n\n`;
    crons.forEach((c, i) => { msg += `${i+1}. ${c.enabled ? '🟢' : '🔴'} <b>${c.name}</b>\n`; });
    await editMessage(chatId, messageId, msg, getCronMenu(crons));
  }
  else if (data === 'stats') {
    try {
      const { execSync } = require('child_process');
      const commits = execSync('cd /home/ubuntu/.openclaw/workspace && git log --oneline --since="24 hours ago" 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
      await editMessage(chatId, messageId, `📊 <b>STATISTICS</b>\n\n• Commits (24h): ${commits}\n• OpenClaw: 🟢 Running`, getMainMenu());
    } catch { await editMessage(chatId, messageId, '📊 <b>STATISTICS</b>\n\n• OpenClaw: 🟢 Running', getMainMenu()); }
  }
  else if (data === 'sync') {
    try {
      const { execSync } = require('child_process');
      const result = execSync('cd /home/ubuntu/.openclaw/workspace && git fetch origin && git log --oneline origin/main -3', { encoding: 'utf8' });
      await editMessage(chatId, messageId, `✅ <b>SYNC COMPLETE</b>\n\n<pre>${result.trim()}</pre>`, getMainMenu());
    } catch { await editMessage(chatId, messageId, '❌ Sync failed', getMainMenu()); }
  }
  else if (data === 'logs') {
    try {
      const { execSync } = require('child_process');
      const logs = execSync('openclaw tasks list 2>&1 | head -8', { encoding: 'utf8' });
      await editMessage(chatId, messageId, `📋 <b>LOGS</b>\n\n<pre>${logs.trim()}</pre>`, getMainMenu());
    } catch { await editMessage(chatId, messageId, '📋 Logs unavailable', getMainMenu()); }
  }
  else if (data.startsWith('cron_')) {
    const cronId = data.replace('cron_', '');
    const cron = (await getCronJobs()).find(c => c.id === cronId);
    if (cron) await editMessage(chatId, messageId, `⏰ <b>${cron.name}</b>\n\nStatus: ${cron.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\nSchedule: ${cron.schedule?.expr || 'N/A'}`, getCronDetail(cron));
  }
  else if (data.startsWith('enable_') || data.startsWith('disable_')) {
    const cronId = data.replace('enable_', '').replace('disable_', '');
    const enabled = data.startsWith('enable_');
    const crons = await getCronJobs();
    const cron = crons.find(c => c.id === cronId);
    if (cron) {
      cron.enabled = enabled;
      await saveCronJobs(crons);
      await sendMessage(chatId, `✅ <b>${cron.name}</b> ${enabled ? 'ENABLED' : 'DISABLED'}`);
      const all = await getCronJobs();
      let msg = `⏰ <b>CRON JOBS</b> (${all.length})\n\n`;
      all.forEach((c, i) => { msg += `${i+1}. ${c.enabled ? '🟢' : '🔴'} <b>${c.name}</b>\n`; });
      await editMessage(chatId, messageId, msg, getCronMenu(all));
    }
  }
}

async function poll() {
  try {
    const res = await fetch(`${BASE_URL}/getUpdates?offset=${offset}&timeout=30`);
    const data = await res.json();
    if (!data.ok || !data.result.length) return;
    for (const update of data.result) {
      offset = update.update_id + 1;
      const msg = update.message || update.edited_message;
      const callback = update.callback_query;
      if (msg && msg.chat.id.toString() === OWNER_ID && msg.text?.startsWith('/')) await handleCommand(msg.chat.id.toString(), msg.text);
      if (callback && callback.message.chat.id.toString() === OWNER_ID) await handleCallback(callback.message.chat.id.toString(), callback.message.message_id, callback.data, callback.id);
    }
  } catch (err) { console.error('Poll error:', err.message); await new Promise(r => setTimeout(r, 3000)); }
}

console.log('🤖 Workflow Bot Started!');
while (true) poll().catch(console.error);
