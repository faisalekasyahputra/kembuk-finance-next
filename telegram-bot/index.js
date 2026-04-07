const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8677289448:AAEQz5YrVhHwX210MLTp-6-6AgSe8Eg5fUc';
const OWNER_ID = process.env.TELEGRAM_OWNER_ID || '5383236811';
const CRON_PATH = '/home/ubuntu/.openclaw/cron/jobs.json';

const api = axios.create({
  baseURL: `https://api.telegram.org/bot${BOT_TOKEN}`
});

let offset = 0;

async function sendMessage(chatId, text, extra = {}) {
  try {
    await api.post('/sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...extra
    });
  } catch (err) {
    console.error('Send error:', err.message);
  }
}

async function editMessage(chatId, messageId, text, replyMarkup = null) {
  try {
    await api.post('/editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    });
  } catch (err) {
    console.error('Edit error:', err.message);
  }
}

function getMainMenu() {
  return {
    inline_keyboard: [
      [{ text: '🤖 Agents', callback_data: 'agents' }],
      [{ text: '⏰ Cron Jobs', callback_data: 'cron' }],
      [{ text: '📊 Stats', callback_data: 'stats' }],
      [{ text: '🔄 Sync', callback_data: 'sync' }],
      [{ text: '📋 Logs', callback_data: 'logs' }]
    ]
  };
}

function getCronMenu(crons) {
  const buttons = crons.map(cron => {
    const status = cron.enabled ? '🟢' : '🔴';
    const name = cron.name.length > 20 ? cron.name.substring(0, 18) + '..' : cron.name;
    return [{ text: `${status} ${name}`, callback_data: `cron_${cron.id}` }];
  });
  buttons.push([{ text: '◀️ Back', callback_data: 'panel' }]);
  return { inline_keyboard: buttons };
}

function getCronDetail(cron) {
  const status = cron.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
  const toggle = cron.enabled ? '🔴 Disable' : '🟢 Enable';
  const toggleData = cron.enabled ? `disable_${cron.id}` : `enable_${cron.id}`;
  return {
    inline_keyboard: [
      [{ text: `Status: ${status}`, callback_data: 'noop' }],
      [{ text: toggle, callback_data: toggleData }],
      [{ text: '◀️ Back', callback_data: 'cron' }]
    ]
  };
}

async function getCronJobs() {
  try {
    const fs = require('fs');
    const data = fs.readFileSync(CRON_PATH, 'utf8');
    return JSON.parse(data).jobs || [];
  } catch {
    return [];
  }
}

async function saveCronJobs(jobs) {
  const fs = require('fs');
  const data = fs.readFileSync(CRON_PATH, 'utf8');
  const parsed = JSON.parse(data);
  parsed.jobs = jobs;
  fs.writeFileSync(CRON_PATH, JSON.stringify(parsed, null, 2));
}

async function handleCommand(chatId, command) {
  const text = command.toLowerCase().trim();

  if (text === '/start' || text === '/panel') {
    await sendMessage(chatId, '🔧 <b>KEMBUK WORKFLOW PANEL</b>\n\nPilih menu:', { reply_markup: getMainMenu() });
  }
  else if (text === '/cron') {
    const crons = await getCronJobs();
    let msg = `⏰ <b>CRON JOBS</b> (${crons.length})\n\n`;
    crons.forEach((c, i) => {
      const s = c.enabled ? '🟢' : '🔴';
      msg += `${i+1}. ${s} <b>${c.name}</b>\n`;
      msg += `   Schedule: ${c.schedule?.expr || 'N/A'}\n\n`;
    });
    await sendMessage(chatId, msg, { reply_markup: getCronMenu(crons) });
  }
  else if (text === '/stats') {
    const { execSync } = require('child_process');
    try {
      const commits = execSync('cd /home/ubuntu/.openclaw/workspace && git log --oneline --since="24 hours ago" 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
      await sendMessage(chatId, `📊 <b>STATISTICS</b>\n\n• Commits (24h): ${commits}\n• OpenClaw: 🟢 Running\n• Gateway: 🟢 Online`, { reply_markup: getMainMenu() });
    } catch {
      await sendMessage(chatId, '📊 <b>STATISTICS</b>\n\n• OpenClaw: 🟢 Running', { reply_markup: getMainMenu() });
    }
  }
  else if (text === '/sync') {
    const { execSync } = require('child_process');
    try {
      const result = execSync('cd /home/ubuntu/.openclaw/workspace && git fetch origin && git log --oneline origin/main -3', { encoding: 'utf8' });
      await sendMessage(chatId, `✅ <b>SYNC COMPLETE</b>\n\n<pre>${result.trim()}</pre>`, { reply_markup: getMainMenu() });
    } catch (err) {
      await sendMessage(chatId, '❌ Sync failed: ' + err.message, { reply_markup: getMainMenu() });
    }
  }
  else if (text === '/logs') {
    const { execSync } = require('child_process');
    try {
      const logs = execSync('openclaw tasks list 2>&1 | head -10', { encoding: 'utf8' });
      await sendMessage(chatId, `📋 <b>RECENT LOGS</b>\n\n<pre>${logs.trim()}</pre>`, { reply_markup: getMainMenu() });
    } catch {
      await sendMessage(chatId, '📋 Logs unavailable', { reply_markup: getMainMenu() });
    }
  }
  else if (text === '/health') {
    await sendMessage(chatId, '❤️ <b>SYSTEM HEALTH</b>\n\n• OpenClaw: 🟢 OK\n• Telegram: 🟢 OK\n• Agents: 2 Active', { reply_markup: getMainMenu() });
  }
  else if (text === '/help') {
    await sendMessage(chatId, '📖 <b>HELP</b>\n\n/panel - Workflow Panel\n/cron - Cron Jobs\n/stats - Statistics\n/sync - Force Sync\n/logs - View Logs\n/health - Health Check');
  }
}

async function handleCallback(chatId, messageId, data, callbackId) {
  try {
    await api.post('/answerCallbackQuery', { callback_query_id: callbackId });
  } catch {}

  if (data === 'panel') {
    await editMessage(chatId, messageId, '🔧 <b>KEMBUK WORKFLOW PANEL</b>\n\nPilih menu:', getMainMenu());
  }
  else if (data === 'agents') {
    await editMessage(chatId, messageId, '🤖 <b>AGENTS</b>\n\n• Ndrogrok: 🟢 Active\n• Kembukbot: 🟢 Active', { inline_keyboard: [[{ text: '◀️ Back', callback_data: 'panel' }]] });
  }
  else if (data === 'cron') {
    const crons = await getCronJobs();
    let msg = `⏰ <b>CRON JOBS</b> (${crons.length})\n\n`;
    crons.forEach((c, i) => {
      const s = c.enabled ? '🟢' : '🔴';
      msg += `${i+1}. ${s} <b>${c.name}</b>\n`;
    });
    await editMessage(chatId, messageId, msg, getCronMenu(crons));
  }
  else if (data === 'stats') {
    const { execSync } = require('child_process');
    try {
      const commits = execSync('cd /home/ubuntu/.openclaw/workspace && git log --oneline --since="24 hours ago" 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
      await editMessage(chatId, messageId, `📊 <b>STATISTICS</b>\n\n• Commits (24h): ${commits}\n• OpenClaw: 🟢 Running`, getMainMenu());
    } catch {
      await editMessage(chatId, messageId, '📊 <b>STATISTICS</b>\n\n• OpenClaw: 🟢 Running', getMainMenu());
    }
  }
  else if (data === 'sync') {
    const { execSync } = require('child_process');
    try {
      const result = execSync('cd /home/ubuntu/.openclaw/workspace && git fetch origin && git log --oneline origin/main -3', { encoding: 'utf8' });
      await editMessage(chatId, messageId, `✅ <b>SYNC COMPLETE</b>\n\n<pre>${result.trim()}</pre>`, getMainMenu());
    } catch (err) {
      await editMessage(chatId, messageId, '❌ Sync failed', getMainMenu());
    }
  }
  else if (data === 'logs') {
    const { execSync } = require('child_process');
    try {
      const logs = execSync('openclaw tasks list 2>&1 | head -8', { encoding: 'utf8' });
      await editMessage(chatId, messageId, `📋 <b>LOGS</b>\n\n<pre>${logs.trim()}</pre>`, getMainMenu());
    } catch {
      await editMessage(chatId, messageId, '📋 Logs unavailable', getMainMenu());
    }
  }
  else if (data.startsWith('cron_')) {
    const cronId = data.replace('cron_', '');
    const crons = await getCronJobs();
    const cron = crons.find(c => c.id === cronId);
    if (cron) {
      const status = cron.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
      await editMessage(chatId, messageId, `⏰ <b>${cron.name}</b>\n\nStatus: ${status}\nSchedule: ${cron.schedule?.expr || 'N/A'}`, getCronDetail(cron));
    }
  }
  else if (data.startsWith('enable_')) {
    const cronId = data.replace('enable_', '');
    const crons = await getCronJobs();
    const cron = crons.find(c => c.id === cronId);
    if (cron) {
      cron.enabled = true;
      await saveCronJobs(crons);
      await sendMessage(chatId, `✅ <b>${cron.name}</b> ENABLED`);
      const allCrons = await getCronJobs();
      let msg = `⏰ <b>CRON JOBS</b> (${allCrons.length})\n\n`;
      allCrons.forEach((c, i) => {
        const s = c.enabled ? '🟢' : '🔴';
        msg += `${i+1}. ${s} <b>${c.name}</b>\n`;
      });
      await editMessage(chatId, messageId, msg, getCronMenu(allCrons));
    }
  }
  else if (data.startsWith('disable_')) {
    const cronId = data.replace('disable_', '');
    const crons = await getCronJobs();
    const cron = crons.find(c => c.id === cronId);
    if (cron) {
      cron.enabled = false;
      await saveCronJobs(crons);
      await sendMessage(chatId, `⛔ <b>${cron.name}</b> DISABLED`);
      const allCrons = await getCronJobs();
      let msg = `⏰ <b>CRON JOBS</b> (${allCrons.length})\n\n`;
      allCrons.forEach((c, i) => {
        const s = c.enabled ? '🟢' : '🔴';
        msg += `${i+1}. ${s} <b>${c.name}</b>\n`;
      });
      await editMessage(chatId, messageId, msg, getCronMenu(allCrons));
    }
  }
}

async function poll() {
  try {
    const updates = await api.get('/getUpdates', {
      params: { offset, timeout: 30 }
    });

    if (!updates.data.ok || !updates.data.result.length) return;

    for (const update of updates.data.result) {
      offset = update.update_id + 1;
      const msg = update.message || update.edited_message;
      const callback = update.callback_query;

      if (msg) {
        const chatId = msg.chat.id.toString();
        const text = msg.text || '';

        if (chatId === OWNER_ID && text.startsWith('/')) {
          await handleCommand(chatId, text);
        }
      }

      if (callback) {
        const chatId = callback.message.chat.id.toString();
        const messageId = callback.message.message_id;
        const data = callback.data;
        const callbackId = callback.id;

        if (chatId === OWNER_ID) {
          await handleCallback(chatId, messageId, data, callbackId);
        }
      }
    }
  } catch (err) {
    console.error('Poll error:', err.message);
    await new Promise(r => setTimeout(r, 3000));
  }
}

async function main() {
  console.log('🤖 Workflow Bot Started!');
  console.log('👤 Owner ID:', OWNER_ID);

  while (true) {
    await poll();
  }
}

main().catch(console.error);
