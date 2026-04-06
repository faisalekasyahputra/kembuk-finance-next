'use client'

import { useState, useEffect, useRef } from 'react'
import { Wallet, Receipt, Printer, PiggyBank, User, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Menu, X, MessageCircle, Camera, Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/formatters'
import html2canvas from 'html2canvas'

type Transaction = {
  id: string
  type: 'income' | 'expense'
  category_id: string
  category_name: string
  category_group: string
  amount: number
  description: string
  date: string
  created_at: string
}

type Category = {
  id: string
  name: string
  icon: string
  group: string
}

const defaultCategories: Category[] = [
  { id: '1316db21-8b3e-4b16-9ac3-d7ad008f63ff', name: 'Bensin', icon: '⛽', group: 'expense' },
  { id: '1d235330-090a-447f-b3db-2aa47e01db67', name: 'Rokok', icon: '🚬', group: 'expense' },
  { id: 'ced99f4f-a3c1-4434-9496-edf78ed28d8f', name: 'Listrik', icon: '⚡', group: 'expense' },
  { id: '95593a08-6e21-4260-9064-d728a0b42813', name: 'Wifi', icon: '📶', group: 'expense' },
  { id: 'cbc83d63-0c37-4326-8038-df1ee127fb86', name: 'Service Motor', icon: '🔧', group: 'expense' },
  { id: '58728828-ee06-4d19-8f8e-c0bf8120057c', name: 'Cicilan Seserahan', icon: '💳', group: 'expense' },
  { id: '34b1475a-1bd6-4239-9e70-c8316b159b5f', name: 'Kuota Internet', icon: '📱', group: 'expense' },
  { id: '2a43d9f5-165a-46a6-a30f-0f6f683c2d7f', name: 'Google Drive', icon: '💾', group: 'expense' },
  { id: '48c948ff-f155-46b7-8b6e-c0d58cc117dc', name: 'iCloud', icon: '☁️', group: 'expense' },
  { id: 'cd2bf5ca-115d-4e94-8c0e-2df65206e5ea', name: 'CapCut', icon: '🎬', group: 'expense' },
  { id: '7a32aefb-2f84-459c-856e-b656e77666af', name: 'Laundry', icon: '👕', group: 'expense' },
  { id: '5606a0f2-8e20-44f8-9938-1b382f33fb68', name: 'Gemini AI', icon: '✨', group: 'expense' },
  { id: '4a1d493c-9faf-4823-8ac4-2d1668d92463', name: 'Twitter', icon: '🐦', group: 'expense' },
  { id: '7b317b60-3011-4205-8465-bd8f09cd88e0', name: 'SIR ANGKI', icon: '💼', group: 'income' },
  { id: '57a4fd47-8bc9-4113-ad02-ec0f822ea7a1', name: 'MELLY', icon: '💼', group: 'income' },
  { id: '1bdc4fab-9691-4822-870e-62d398b686ec', name: 'RAPID', icon: '💼', group: 'income' },
  { id: 'c7951d88-72f5-4261-bbac-50719a5342ad', name: 'ADHI', icon: '💼', group: 'income' },
  { id: 'ac0e5853-f9da-4ad9-aa4b-97304529550c', name: 'FLATYFOOS', icon: '💼', group: 'income' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', name: 'Lainnya', icon: '📦', group: 'expense' },
]

function ReceiptExportView({ transactions, balance, totalIncome, totalExpense, onClose }: {
  transactions: Transaction[]
  balance: number
  totalIncome: number
  totalExpense: number
  onClose: () => void
}) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [sending, setSending] = useState(false)

  const handleSendToTelegram = async () => {
    if (!receiptRef.current || sending) return
    setSending(true)

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      })

      canvas.toBlob(async (blob) => {
        const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || '5383236811'
        const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || ''
        
        if (blob) {
          const formData = new FormData()
          formData.append('chat_id', chatId)
          formData.append('photo', blob, 'receipt.png')
          
          await fetch(`https://api.telegram.org/${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData
          })
        }
        
        alert('Struk wes dikirim ke Telegram!')
        setSending(false)
      }, 'image/png')
    } catch (err) {
      console.error('Error:', err)
      alert('Gagal mengirim. Coba lagi.')
      setSending(false)
    }
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const receiptId = `KF${Date.now().toString(36).toUpperCase()}`

  const groupedByCategory = transactions.reduce((acc, t) => {
    const key = t.category_name
    if (!acc[key]) acc[key] = { count: 0, total: 0, type: t.type, descriptions: [] as string[] }
    acc[key].count++
    acc[key].total += t.amount
    acc[key].descriptions.push(t.description)
    return acc
  }, {} as Record<string, { count: number; total: number; type: string; descriptions: string[] }>)

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div 
          ref={receiptRef}
          id="receipt-export"
          className="bg-white text-black"
          style={{ 
            fontFamily: 'Courier New, monospace',
            padding: '16px',
            width: '280px',
            margin: '0 auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <div className="text-center" style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px' }}>KEMBUK FINANCE</div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>Struk Laporan Keuangan</div>
          </div>

          <div style={{ fontSize: '10px', padding: '4px 0', borderBottom: '1px dashed #ccc' }}>
            <div>Tanggal: {dateStr} {timeStr}</div>
            <div>ID: {receiptId}</div>
          </div>

          <div style={{ fontSize: '11px', padding: '8px 0', borderBottom: '1px dashed #000', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>RINGKASAN</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pemasukan (+):</span>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Rp {totalIncome.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pengeluaran (-):</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Rp {totalExpense.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {sortedTransactions.length > 0 && (
            <div style={{ fontSize: '10px', padding: '6px 0', borderBottom: '1px dashed #000', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>DETAIL TRANSAKSI</div>
              {sortedTransactions.slice(0, 10).map((t, i) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i+1}. {t.description}
                  </span>
                  <span style={{ color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                    {t.type === 'income' ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              {sortedTransactions.length > 10 && (
                <div style={{ color: '#666', fontStyle: 'italic' }}>...dan {sortedTransactions.length - 10} transaksi lagi</div>
              )}
            </div>
          )}

          <div style={{ 
            padding: '10px', 
            background: '#000', 
            color: '#fff', 
            textAlign: 'center', 
            marginTop: '8px',
            borderRadius: '4px'
          }}>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>SALDO AKHIR</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>
              Rp {balance.toLocaleString('id-ID')}
            </div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px dashed #ccc', marginTop: '8px' }}>
            <div style={{ fontSize: '9px', color: '#666' }}>================================</div>
            <div style={{ fontSize: '10px', marginTop: '6px' }}>Terima Kasih</div>
            <div style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>kembuk-finance.vercel.app</div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <div style={{ 
              display: 'inline-block', 
              border: '1px solid #ccc',
              padding: '4px 8px',
              fontSize: '8px',
              color: '#666'
            }}>
              |||||||||||||||||{receiptId}|||||||||||||||
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white font-medium transition-colors"
          >
            Tutup
          </button>
          <button 
            onClick={handleSendToTelegram} 
            disabled={sending}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                Kirim Telegram
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showReceiptExport, setShowReceiptExport] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('kf_transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        alert('Gagal mengambil data: ' + error.message)
        return
      }

      console.log('Fetched transactions:', data?.length || 0)
      setTransactions(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      alert('Gagal mengambil data dari database. Cek koneksi internet.')
      setTransactions([])
      calculateStats([])
    }
  }

  const calculateStats = (txns: Transaction[]) => {
    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    setTotalIncome(income)
    setTotalExpense(expense)
    setBalance(income - expense)
  }

  const handleAddTransaction = async () => {
    if (!formData.amount || !formData.category_id) return

    const category = defaultCategories.find(c => c.id === formData.category_id)
    
    const newTransaction = {
      id: crypto.randomUUID(),
      user_id: 'shared',
      type: formData.type,
      category_id: formData.category_id,
      category_name: category?.name || 'Lainnya',
      category_group: formData.type === 'income' ? 'income' : 'expense',
      amount: parseFloat(formData.amount),
      description: formData.description || 'Transaksi',
      date: formData.date,
      created_at: new Date().toISOString(),
    }

    try {
      const { error } = await supabase
        .from('kf_transactions')
        .insert([newTransaction])

      if (error) {
        console.error('Supabase insert error:', error)
        alert('Gagal menyimpan: ' + error.message)
        return
      }

      console.log('Transaction saved successfully')
      await fetchTransactions()
      
      sendTransactionReceipt(newTransaction)
      
      setShowAddModal(false)
      setFormData({
        type: 'expense',
        amount: '',
        category_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Gagal menyimpan transaksi. Cek koneksi internet.')
    }
  }

  const sendTransactionReceipt = async (transaction: Transaction) => {
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || '5383236811'
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || ''
    
    const now = new Date()
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const receiptId = `KF${Date.now().toString(36).toUpperCase()}`
    
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6289639052639'
    const whatsappMessage = `🧾 *BUKTI TRANSAKSI*

📅 ${dateStr} | ${timeStr} WIB
━━━━━━━━━━━━━━━━━

💰 *Jumlah:* ${transaction.type === 'income' ? '+' : '-'} Rp ${transaction.amount.toLocaleString('id-ID')}

📂 *Kategori:* ${transaction.category_name}
📝 *Jenis:* ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
📌 *Keterangan:* ${transaction.description}

━━━━━━━━━━━━━━━━━
🆔 ID: ${receiptId}
*Kembuk Finance*`
    
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappURL, '_blank')
    
    const receiptHTML = `
      <div style="font-family: 'Courier New', monospace; padding: 12px; width: 240px; background: #fff; color: #000; font-size: 11px;">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px;">
          <div style="font-size: 14px; font-weight: bold; letter-spacing: 1px;">KEMBUK FINANCE</div>
          <div style="font-size: 8px; color: #666;">BUKTI TRANSAKSI</div>
        </div>
        
        <div style="font-size: 9px; padding: 3px 0; border-bottom: 1px dashed #ccc;">
          <div>Tanggal: ${dateStr}</div>
          <div>Waktu: ${timeStr} WIB</div>
        </div>
        
        <div style="padding: 6px 0; border-bottom: 1px dashed #000;">
          <div style="margin-bottom: 4px;">
            <span style="color: ${transaction.type === 'income' ? '#22c55e' : '#ef4444'}; font-size: 18px; font-weight: bold;">
              ${transaction.type === 'income' ? '+' : '-'} Rp ${transaction.amount.toLocaleString('id-ID')}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Kategori:</span>
            <span style="font-weight: bold;">${transaction.category_name}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Jenis:</span>
            <span>${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
          </div>
        </div>
        
        <div style="padding: 4px 0; font-size: 9px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Keterangan:</span>
          </div>
          <div style="word-break: break-word;">${transaction.description}</div>
        </div>
        
        <div style="text-align: center; padding-top: 8px; border-top: 1px dashed #ccc; margin-top: 4px;">
          <div style="font-size: 8px; color: #666;">================================</div>
          <div style="font-size: 10px; margin-top: 4px;">TERIMA KASIH</div>
          <div style="font-size: 7px; color: #999; margin-top: 2px;">ID: ${receiptId}</div>
        </div>
      </div>
    `
    
    const container = document.createElement('div')
    container.innerHTML = receiptHTML
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    document.body.appendChild(container)
    
    try {
      const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      })
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData()
          formData.append('chat_id', chatId)
          formData.append('photo', blob, 'receipt.png')
          
          await fetch(`https://api.telegram.org/${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData
          })
        }
        document.body.removeChild(container)
      }, 'image/png')
    } catch (err) {
      console.error('Error sending receipt:', err)
      document.body.removeChild(container)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    
    try {
      await supabase.from('kf_transactions').delete().eq('id', id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      calculateStats(transactions.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting:', error)
      setTransactions(prev => prev.filter(t => t.id !== id))
      calculateStats(transactions.filter(t => t.id !== id))
    }
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAnalyzing(true)
    
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formDataUpload,
      })

      const result = await response.json()

      if (result.success) {
        const category = defaultCategories.find(c => 
          c.name.toLowerCase().includes(result.data.category?.toLowerCase() || '')
        ) || defaultCategories[9]

        setFormData({
          type: 'expense',
          amount: result.data.amount?.toString() || '0',
          category_id: category.id,
          description: result.data.description || 'Transaksi',
          date: result.data.date || new Date().toISOString().split('T')[0],
        })
        setShowReceiptModal(false)
        setShowAddModal(true)
      } else {
        alert('Gagal menganalisis struk: ' + (result.error || result.details || 'Unknown error'))
        console.error('Gemini error:', result)
      }
    } catch (error) {
      console.error('Error analyzing receipt:', error)
      alert('Gagal menganalisis struk. Coba lagi.')
    } finally {
      setAnalyzing(false)
    }
  }

  const navItems = [
    { id: 'home', icon: Wallet, label: 'Beranda' },
    { id: 'transactions', icon: Receipt, label: 'Transaksi' },
    { id: 'receipt', icon: Printer, label: 'Struk' },
    { id: 'savings', icon: PiggyBank, label: 'Tabungan' },
    { id: 'account', icon: User, label: 'Akun' },
  ]

  const todayTransactions = transactions.filter(
    t => t.date === new Date().toISOString().split('T')[0]
  )

  return (
    <div className="min-h-screen bg-black text-white pb-24 lg:pb-0">
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 bg-black border-r border-zinc-800 flex-col p-4 z-40">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Kembuk</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                if (item.id === 'receipt') setShowReceiptExport(true)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="lg:ml-60">
        <header className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-4 z-30 lg:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold">
              {activeTab === 'home' && 'Beranda'}
              {activeTab === 'transactions' && 'Transaksi'}
              {activeTab === 'savings' && 'Tabungan'}
              {activeTab === 'account' && 'Akun'}
            </h1>
          </div>
        </header>

        <main className="p-4 lg:p-6 max-w-3xl lg:mx-auto">
          {activeTab === 'home' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-5 border border-zinc-700">
                <p className="text-zinc-400 text-sm mb-1">Saldo</p>
                <h2 className="text-4xl font-bold font-mono text-white">
                  {formatCurrency(balance)}
                </h2>
              </div>

              <button
                onClick={() => setActiveTab('transactions')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 flex items-center justify-between hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                  <span className="text-white font-bold">Lihat Ringkasan</span>
                </div>
                <span className="text-white/70">→</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-zinc-400 text-xs">Masuk</span>
                  </div>
                  <p className="text-green-500 font-bold font-mono">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>

                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                    <span className="text-zinc-400 text-xs">Keluar</span>
                  </div>
                  <p className="text-red-500 font-bold font-mono">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
                  <span className="text-zinc-400 text-sm">Transaksi Hari Ini</span>
                  <span className="text-zinc-600 text-xs">{todayTransactions.length} item</span>
                </div>
                {todayTransactions.length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center py-6">Belum ada transaksi</p>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {todayTransactions.slice(0, 5).map((t) => (
                      <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {t.type === 'income' ? '💰' : '💸'}
                          </span>
                          <div>
                            <p className="text-white text-sm">{t.description}</p>
                            <p className="text-zinc-500 text-xs">{t.category_name}</p>
                          </div>
                        </div>
                        <span className={`font-mono text-sm ${
                          t.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Semua Transaksi</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white text-sm font-medium"
                >
                  + Tambah
                </button>
              </div>
              
              {transactions.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Belum ada transaksi</p>
              ) : (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                  {transactions.map((t) => (
                    <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{t.type === 'income' ? '💰' : '💸'}</span>
                        <div>
                          <p className="text-white text-sm">{t.description}</p>
                          <p className="text-zinc-500 text-xs">{t.category_name} • {t.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-sm ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="text-zinc-500 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'savings' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-green-900/30 to-black rounded-2xl p-5 border border-green-800/50">
                <p className="text-green-400/70 text-sm mb-1">Total Tabungan</p>
                <h2 className="text-3xl font-bold font-mono text-green-400">{formatCurrency(0)}</h2>
              </div>
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center">
                <PiggyBank className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-white font-medium">Fitur Tabungan</p>
                <p className="text-zinc-400 text-sm mt-1">Coming soon!</p>
                <p className="text-zinc-500 text-xs mt-3">Akan hadir:</p>
                <ul className="text-zinc-500 text-xs mt-2 space-y-1 text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Target tabungan bulanan</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Progress pencapaian</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Reminder tabungan</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-3">
              <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">FE</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Pengguna</h3>
                    <p className="text-zinc-500 text-sm">Kembuk Finance</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-800 rounded-xl">
                    <span className="text-zinc-500 text-sm">Total Transaksi</span>
                    <p className="text-white font-bold">{transactions.length}</p>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-xl">
                    <span className="text-zinc-500 text-sm">Total Pemasukan</span>
                    <p className="text-green-400 font-bold">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-xl">
                    <span className="text-zinc-500 text-sm">Total Pengeluaran</span>
                    <p className="text-red-400 font-bold">{formatCurrency(totalExpense)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                <h4 className="text-white font-medium mb-3">Statistik</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-800 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">{transactions.filter(t => t.type === 'income').length}</p>
                    <p className="text-zinc-500 text-xs">Pemasukan</p>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">{transactions.filter(t => t.type === 'expense').length}</p>
                    <p className="text-zinc-500 text-xs">Pengeluaran</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-around py-2 pb-5 z-50 lg:hidden">
        {navItems.map((item, index) => (
          item.id === 'receipt' ? (
            <button
              key={item.id}
              onClick={() => setShowAddOptions(true)}
              className="flex flex-col items-center -mt-6"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Plus className="w-7 h-7 text-white" />
              </div>
            </button>
          ) : (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 ${
                activeTab === item.id ? 'text-blue-400' : 'text-zinc-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          )
        ))}
      </nav>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-white font-bold">Tambah Transaksi</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-3 px-4 rounded-xl border transition-all ${
                    formData.type === 'income'
                      ? 'bg-green-600/20 border-green-600 text-green-500'
                      : 'border-zinc-700 text-zinc-400'
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-3 px-4 rounded-xl border transition-all ${
                    formData.type === 'expense'
                      ? 'bg-red-600/20 border-red-600 text-red-500'
                      : 'border-zinc-700 text-zinc-400'
                  }`}
                >
                  Keluar
                </button>
              </div>

              <div>
                <label className="text-zinc-400 text-sm">Jumlah</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="w-full mt-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-sm">Kategori</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Pilih kategori</option>
                  {defaultCategories
                    .filter(c => formData.type === 'income' ? c.group === 'income' : c.group === 'expense')
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 text-sm">Keterangan</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi transaksi"
                  className="w-full mt-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-sm">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full max-w-full mt-1 px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 appearance-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert"
                  style={{ colorScheme: 'dark' }}
                />
                <p className="text-zinc-500 text-xs mt-1">
                  {new Date(formData.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <button
                onClick={handleAddTransaction}
                disabled={!formData.amount || !formData.category_id}
                className="w-full py-4 bg-blue-600 rounded-xl text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Scan Struk</h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-zinc-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleReceiptUpload}
                disabled={analyzing}
                className="hidden"
              />
              <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer">
                {analyzing ? (
                  <div className="space-y-3">
                    <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
                    <p className="text-zinc-400">Menganalisis struk...</p>
                    <p className="text-zinc-500 text-xs">Menggunakan OCR lokal</p>
                  </div>
                ) : (
                  <>
                    <Printer className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
                    <p className="text-zinc-400">Klik untuk foto struk</p>
                    <p className="text-zinc-600 text-sm mt-1">ATAU pilih dari galeri</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {showReceiptExport && (
        <ReceiptExportView
          transactions={transactions}
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          onClose={() => setShowReceiptExport(false)}
        />
      )}

      {/* Hidden file input for receipt scanning */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleReceiptUpload}
        className="hidden"
      />

      {/* Add Options Modal */}
      {showAddOptions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4" onClick={() => setShowAddOptions(false)}>
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md border border-zinc-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-white font-bold">Tambah Transaksi</h3>
              <button onClick={() => setShowAddOptions(false)} className="text-zinc-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setShowAddOptions(false)
                  setShowAddModal(true)
                }}
                className="w-full flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Input Manual</p>
                  <p className="text-zinc-400 text-sm">Masukkan transaksi secara manual</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowAddOptions(false)
                  setShowReceiptModal(true)
                }}
                className="w-full flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Scan Struk</p>
                  <p className="text-zinc-400 text-sm">Ambil foto struk dari kamera</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowAddOptions(false)
                  fileInputRef.current?.click()
                }}
                className="w-full flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Pilih dari Galeri</p>
                  <p className="text-zinc-400 text-sm">Upload gambar struk dari galeri</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-white font-bold">Edit Transaksi</h3>
              <button onClick={() => setEditingTransaction(null)} className="text-zinc-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-zinc-400 text-sm">Deskripsi</label>
                <input
                  type="text"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm">Jumlah</label>
                <input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono mt-1"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm">Tanggal</label>
                <input
                  type="date"
                  value={editingTransaction.date}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                  className="w-full max-w-full mt-1 px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 appearance-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert"
                  style={{ colorScheme: 'dark' }}
                />
                <p className="text-zinc-500 text-xs mt-1">
                  {new Date(editingTransaction.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await supabase.from('kf_transactions').update({
                      description: editingTransaction.description,
                      amount: editingTransaction.amount,
                      date: editingTransaction.date,
                    }).eq('id', editingTransaction.id)
                    
                    setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? editingTransaction : t))
                    calculateStats(transactions.map(t => t.id === editingTransaction.id ? editingTransaction : t))
                    setEditingTransaction(null)
                  } catch (error) {
                    console.error('Error updating:', error)
                  }
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold"
              >
                Simpan
              </button>
              <button
                onClick={() => {
                  handleDeleteTransaction(editingTransaction.id)
                  setEditingTransaction(null)
                }}
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl text-red-500 font-medium"
              >
                Hapus Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
