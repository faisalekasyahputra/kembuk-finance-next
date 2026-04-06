'use client'

import { useState, useEffect, useRef } from 'react'
import { Wallet, Receipt, Printer, PiggyBank, User, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Menu, X, MessageCircle, Camera, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/formatters'

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
  { id: '1', name: 'Gaji', icon: '💰', group: 'income' },
  { id: '2', name: 'Freelance', icon: '💻', group: 'income' },
  { id: '3', name: 'Investasi', icon: '📈', group: 'income' },
  { id: '4', name: 'Makanan', icon: '🍔', group: 'expense' },
  { id: '5', name: 'Transport', icon: '🚗', group: 'expense' },
  { id: '6', name: 'Belanja', icon: '🛒', group: 'expense' },
  { id: '7', name: 'Hiburan', icon: '🎬', group: 'expense' },
  { id: '8', name: 'Kesehatan', icon: '🏥', group: 'expense' },
  { id: '9', name: 'Tagihan', icon: '📄', group: 'expense' },
  { id: '10', name: 'Lainnya', icon: '📦', group: 'expense' },
]

function ReceiptExportView({ transactions, balance, totalIncome, totalExpense, onClose }: {
  transactions: Transaction[]
  balance: number
  totalIncome: number
  totalExpense: number
  onClose: () => void
}) {
  const handleSendToTelegram = async () => {
    const receiptEl = document.getElementById('receipt-export')
    if (!receiptEl) return

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const scale = 2
      
      canvas.width = receiptEl.offsetWidth * scale
      canvas.height = receiptEl.offsetHeight * scale
      
      const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${receiptEl.offsetWidth}" height="${receiptEl.offsetHeight}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${receiptEl.innerHTML}</div></foreignObject></svg>`
      
      const img = new Image()
      img.onload = async () => {
        if (ctx) {
          ctx.scale(scale, scale)
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              const formData = new FormData()
              formData.append('chat_id', '5383236811')
              formData.append('photo', blob, 'receipt.png')
              formData.append('caption', '🧾 Struk Kembuk Finance')
              
              await fetch('https://api.telegram.org/bot8677289448:AAEQz5YrVhHwX210MLTp-6-6AgSe8Eg5fUc/sendPhoto', {
                method: 'POST',
                body: formData
              })
              
              alert('Struk wes dikirim ke Telegram!')
            }
          }, 'image/png')
        }
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    } catch (err) {
      console.error('Error:', err)
      alert('Gagal mengirim. Cek console.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div id="receipt-export" className="bg-white text-black rounded-lg overflow-hidden shadow-2xl">
          <div className="bg-blue-600 text-white p-4 text-center">
            <h2 className="font-bold text-lg">KEMBUK FINANCE</h2>
            <p className="text-blue-100 text-xs">Struk Transaksi</p>
          </div>
          
          <div className="p-4 space-y-3 text-sm">
            <div className="text-center border-b border-dashed border-gray-300 pb-2">
              <p className="text-gray-500 text-xs">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pemasukan</span>
                <span className="text-green-600 font-mono font-semibold">+ Rp {totalIncome.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pengeluaran</span>
                <span className="text-red-600 font-mono font-semibold">- Rp {totalExpense.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div className="border-t border-dashed border-gray-300 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">SALDO</span>
                <span className={`font-bold font-mono text-lg ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rp {balance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            
            <div className="text-center text-gray-400 text-xs border-t border-dashed border-gray-300 pt-2">
              <p>Total {transactions.length} transaksi</p>
              <p className="mt-1">_ _ _ _ _ _ _ _ _ _ _ _ _ _ _</p>
              <p className="mt-1">Generated by Kembuk Finance</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white font-medium transition-colors">
            Tutup
          </button>
          <button onClick={handleSendToTelegram} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors">
            <MessageCircle className="w-5 h-5" />
            Kirim Telegram
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

      if (error) throw error

      setTransactions(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
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

      if (error) throw error

      await fetchTransactions()
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
      setTransactions([newTransaction, ...transactions])
      calculateStats([newTransaction, ...transactions])
      setShowAddModal(false)
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
          c.name.toLowerCase().includes(result.data.category.toLowerCase())
        ) || defaultCategories[9]

        setFormData({
          type: 'expense',
          amount: result.data.amount.toString(),
          category_id: category.id,
          description: result.data.description,
          date: result.data.date,
        })
        setShowReceiptModal(false)
        setShowAddModal(true)
      } else {
        alert('Gagal menganalisis struk: ' + result.error)
      }
    } catch (error) {
      console.error('Error analyzing receipt:', error)
      alert('Terjadi kesalahan saat menganalisis struk')
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
                <p className="text-zinc-400">Fitur tabungan dalam pengembangan</p>
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
                <div className="space-y-2">
                  <div className="p-3 bg-zinc-800 rounded-xl text-zinc-300">
                    <span className="text-zinc-500 text-sm">Total Transaksi</span>
                    <p className="text-white font-bold">{transactions.length}</p>
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
                    <div className="w-12 h-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-400">Menganalisis struk...</p>
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
