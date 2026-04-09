'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Wallet, Receipt, Printer, PiggyBank, User, Plus, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Menu, X, MessageCircle, Camera, Upload, Loader2, Fuel, Cigarette, 
  Zap, Wifi, Wrench, CreditCard, Smartphone, HardDrive, Cloud, Film, Shirt, 
  Sparkles, Bird, Briefcase, Package, Utensils, Car, Heart, Tv, ShoppingBag,
  ArrowLeftRight, Building2, Plane, Gift, Home, Gamepad2, GraduationCap, Baby,
  TrendingDown, DollarSign, Percent, Calendar, Search, Bell, Settings, LogOut,
  ChevronRight, ChevronDown, MoreVertical, Edit3, Trash2, Download, Share2,
  Send, Image, Moon, Sun, PieChart, Target, Check, AlertCircle, Trash, History
} from 'lucide-react'
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
  target_ids?: string[]
}

type Category = {
  id: string
  name: string
  name_id: string
  icon: string
  color: string
  group_type: string
}

type Target = {
  id: string
  name: string
  amount: number
  due_date: string | null
  is_recurring: boolean
  category_id: string | null
  created_at: string
}

type TargetPayment = {
  id: string
  target_id: string
  amount: number
  paid_at: string
  transaction_id: string | null
  kf_targets?: Target
}

const iconMap: Record<string, React.ComponentType<{className?: string, size?: number}>> = {
  Fuel, Cigarette, Zap, Wifi, Wrench, CreditCard, Smartphone, HardDrive, Cloud,
  Tv, Shirt, Sparkles, Bird, Package, Briefcase, DollarSign, Plane, Building2, Gift,
  Utensils, Car, Heart, ShoppingBag, Gamepad2, GraduationCap, Baby, TrendingDown,
  ArrowLeftRight, Home, TrendingUp, Wallet
}

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="skeuo-card p-6 flex flex-col relative">
          <div className="absolute inset-x-0 -top-2 h-4 flex justify-around pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700/50 shadow-inner" />
            ))}
          </div>

          <div 
            ref={receiptRef}
            id="receipt-export"
            className="bg-[#f8f8f0] text-black shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_-2px_5px_rgba(0,0,0,0.1)] transform rotate-[-0.5deg]"
            style={{ 
              fontFamily: 'Courier New, monospace',
              padding: '24px 20px',
              width: '100%',
              margin: '0 auto',
              backgroundImage: 'radial-gradient(#dcdcdc 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            <div className="text-center" style={{ borderBottom: '2px dashed #000', paddingBottom: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '3px' }}>KEMBUK FINANCE</div>
              <div style={{ fontSize: '11px', color: '#444', marginTop: '6px', fontWeight: 'bold' }}>STRUK LAPORAN RESMI</div>
            </div>

            <div style={{ fontSize: '11px', padding: '6px 0', borderBottom: '1px dashed #444', marginBottom: '12px' }}>
              <div className="flex justify-between">
                <span>TANGGAL:</span>
                <span>{dateStr} {timeStr}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>ID STRUK:</span>
                <span>{receiptId}</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', padding: '10px 0', borderBottom: '2px dashed #000', marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', letterSpacing: '1px' }}>=== RINGKASAN ===</div>
              <div className="flex justify-between mb-2">
                <span>PEMASUKAN (+)</span>
                <span style={{ color: '#059669', fontWeight: 'bold' }}>Rp {totalIncome.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>PENGELUARAN (-)</span>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Rp {totalExpense.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {sortedTransactions.length > 0 && (
              <div style={{ fontSize: '11px', padding: '8px 0', borderBottom: '2px dashed #000', marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>DETAIL TRANSAKSI</div>
                {sortedTransactions.slice(0, 10).map((t, i) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i+1}. {t.description.toUpperCase()}
                    </span>
                    <span style={{ color: t.type === 'income' ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                {sortedTransactions.length > 10 && (
                  <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '4px', fontSize: '9px' }}>
                    ... DAN {sortedTransactions.length - 10} TRANSAKSI LAINNYA
                  </div>
                )}
              </div>
            )}

            <div style={{ 
              padding: '12px', 
              background: '#000', 
              color: '#0f6', 
              textAlign: 'center', 
              marginTop: '12px',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,1)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '2px' }}>SALDO AKHIR</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', textShadow: '0 0 5px rgba(0,255,102,0.5)' }}>
                RP {balance.toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '2px dashed #000', marginTop: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>TERIMA KASIH TELAH MENGGUNAKAN</div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px', letterSpacing: '1px' }}>KEMBUK FINANCE APP</div>
              <div style={{ fontSize: '9px', color: '#666', marginTop: '8px' }}>WWW.KEMBUK-FINANCE.COM</div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <div className="font-mono text-[10px] tracking-tighter opacity-50 whitespace-nowrap overflow-hidden">
                || |||| ||| || |||| || ||| |||| || ||| |||| || ||| |||| || {receiptId} || ||| |||| || ||| |||| || ||| ||||
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            <button 
              onClick={handleSendToTelegram} 
              disabled={sending}
              className="w-full btn-skeuo py-4 rounded-xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-blue-400">MENGIRIM...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">KIRIM KE TELEGRAM</span>
                </span>
              )}
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-4 skeuo-panel-inner rounded-xl text-zinc-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors active:scale-[0.98]"
            >
              BATALKAN / TUTUP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SavingsTargetModal({ onClose, onSuccess, onCreate }: { onClose: () => void; onSuccess: () => void; onCreate?: () => void }) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name || !targetAmount) return
    setLoading(true)
    try {
      const res = await fetch('/api/savings-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, target_amount: targetAmount }),
      })
      const data = await res.json()
      if (data.target) {
        if (onCreate) onCreate()
        
        await fetch('/api/savings/redistribute', { method: 'POST' })
        
        onSuccess()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-3 lg:p-4" onClick={onClose}>
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        <div className="skeuo-card p-0 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.1)]">
          <div className="relative">
            <div className="p-4 lg:p-5 border-b border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 skeuo-panel-inner rounded-xl">
                  <PiggyBank className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                </div>
                <h3 className="text-white font-bold text-base lg:text-lg tracking-wide uppercase text-shadow-glow">Target Tabungan</h3>
              </div>
              <button onClick={onClose} className="p-2 skeuo-panel-inner rounded-xl hover:brightness-110 active:scale-95 transition-all">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Nama Barang</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Sepatu Nike Air Max"
                  className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 text-sm transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Harga Target</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm tracking-widest">Rp</span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white font-mono tracking-wider placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!name || !targetAmount || loading}
                className="w-full btn-skeuo mt-2 py-4 shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
              >
                {loading ? 'Menyimpan...' : 'Simpan Target'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [targets, setTargets] = useState<Target[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [targetPayments, setTargetPayments] = useState<TargetPayment[]>([])
  const [monthlyLogs, setMonthlyLogs] = useState<{ month: string; paid: number; total: number; amount_paid: number; amount_total: number }[]>([])
  const [savings, setSavings] = useState<{ balance: number; auto_save_percent: number } | null>(null)
  const [savingsTargets, setSavingsTargets] = useState<{ id: string; name: string; target_amount: number; current_amount: number; icon: string; color: string; is_completed: boolean }[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showReceiptExport, setShowReceiptExport] = useState(false)
  const [showAddTargetModal, setShowAddTargetModal] = useState(false)
  const [showAddSavingsTargetModal, setShowAddSavingsTargetModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    target_ids: [] as string[],
  })
  const [newTarget, setNewTarget] = useState({
    name: '',
    amount: '',
    due_date: '',
    is_recurring: true,
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchTransactions()
    fetchTargets()
    fetchTargetPayments()
    fetchCategories()
    fetchSavings()
    fetchSavingsTargets()
    calculateAutoSave()
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      fetchTransactions()
      fetchTargets()
      fetchTargetPayments()
      fetchCategories()
      fetchSavings()
      fetchSavingsTargets()
      calculateAutoSave()
      fetchSavingsTargets()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('kf_transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        showToast('Gagal mengambil data', 'error')
        return
      }

      console.log('Fetched transactions:', data?.length || 0)
      setTransactions(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      showToast('Gagal mengambil data dari database', 'error')
      setTransactions([])
      calculateStats([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (txns: Transaction[]) => {
    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    setTotalIncome(income)
    setTotalExpense(expense)
    setBalance(income - expense)
  }

  const fetchTargets = async () => {
    try {
      const res = await fetch('/api/targets')
      const data = await res.json()
      if (data.targets) {
        setTargets(data.targets)
      }
    } catch (error) {
      console.error('Error fetching targets:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('kf_categories')
        .select('*')
        .order('name', { ascending: true })
      if (data) {
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSavings = async () => {
    try {
      const res = await fetch('/api/savings')
      const data = await res.json()
      if (data.savings) {
        setSavings(data.savings)
      }
    } catch (error) {
      console.error('Error fetching savings:', error)
    }
  }

  const fetchSavingsTargets = async () => {
    try {
      const res = await fetch('/api/savings-targets')
      const data = await res.json()
      if (data.targets) {
        setSavingsTargets(data.targets)
      }
    } catch (error) {
      console.error('Error fetching savings targets:', error)
    }
  }

  const calculateAutoSave = async () => {
    try {
      const res = await fetch('/api/savings/calculate', { method: 'POST' })
      const data = await res.json()
      if (data.savings) {
        setSavings(data.savings)
      }
      if (data.targets) {
        setSavingsTargets(data.targets)
      }
    } catch (error) {
      console.error('Error calculating auto-save:', error)
    }
  }

  const fetchTargetPayments = async () => {
    try {
      const res = await fetch('/api/target-payments')
      const data = await res.json()
      if (data.payments) {
        setTargetPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching target payments:', error)
    }
  }

  useEffect(() => {
    if (targets.length > 0 && targetPayments.length >= 0) {
      calculateMonthlyLogs(targetPayments, targets)
    }
  }, [targets, targetPayments])

  const calculateMonthlyLogs = (payments: TargetPayment[], currentTargets: Target[]) => {
    const monthlyData: Record<string, { paid: number; total: number; amount_paid: number; amount_total: number }> = {}
    
    payments.forEach(payment => {
      const monthKey = new Date(payment.paid_at).toISOString().slice(0, 7)
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { paid: 0, total: 0, amount_paid: 0, amount_total: 0 }
      }
      monthlyData[monthKey].paid += 1
      monthlyData[monthKey].amount_paid += Number(payment.amount)
    })
    
    currentTargets.forEach(target => {
      const createdMonth = new Date(target.created_at).toISOString().slice(0, 7)
      const now = new Date()
      const startMonth = new Date(createdMonth)
      
      for (let d = new Date(startMonth); d <= now; d.setMonth(d.getMonth() + 1)) {
        const monthKey = d.toISOString().slice(0, 7)
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { paid: 0, total: 0, amount_paid: 0, amount_total: 0 }
        }
        monthlyData[monthKey].total += 1
        monthlyData[monthKey].amount_total += Number(target.amount)
      }
    })
    
    const logs = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6)
    
    setMonthlyLogs(logs)
  }

  const handleAddTarget = async () => {
    if (!newTarget.name || !newTarget.amount) {
      showToast('Nama dan jumlah harus diisi', 'error')
      return
    }

    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTarget.name,
          amount: parseFloat(newTarget.amount),
          due_date: newTarget.due_date || null,
          is_recurring: newTarget.is_recurring,
        }),
      })
      const data = await res.json()
      if (data.target) {
        showToast('Target berhasil ditambahkan', 'success')
        setTargets([...targets, data.target])
        setNewTarget({ name: '', amount: '', due_date: '', is_recurring: true })
        setShowAddTargetModal(false)
      }
    } catch (error) {
      showToast('Gagal menambahkan target', 'error')
    }
  }

  const handleDeleteTarget = async (id: string) => {
    try {
      const res = await fetch(`/api/targets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Target berhasil dihapus', 'success')
        setTargets(targets.filter(t => t.id !== id))
      }
    } catch (error) {
      showToast('Gagal menghapus target', 'error')
    }
  }

  const handleToggleTargetPayment = async (target: Target) => {
    const existingPayment = targetPayments.find(
      p => p.target_id === target.id && 
           new Date(p.paid_at).getMonth() === new Date().getMonth()
    )

    if (existingPayment) {
      try {
        const res = await fetch(`/api/target-payments/${existingPayment.id}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          setTargetPayments(targetPayments.filter(p => p.id !== existingPayment.id))
          showToast('Target取消标记为未完成', 'info')
        }
      } catch (error) {
        showToast('Gagal mengupdate target', 'error')
      }
    } else {
      try {
        const res = await fetch('/api/target-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_id: target.id,
            amount: target.amount,
          }),
        })
        const data = await res.json()
        if (data.payment) {
          setTargetPayments([...targetPayments, data.payment])
          showToast('Target berhasil dibayar', 'success')
        }
      } catch (error) {
        showToast('Gagal mengupdate target', 'error')
      }
    }
  }

  const handleAddTransaction = async () => {
    if (!formData.amount) return

    const category = categories.find(c => c.id === formData.category_id)
    
    const newTransaction = {
      id: crypto.randomUUID(),
      user_id: 'shared',
      type: formData.type,
      category_id: formData.category_id || '',
      category_name: category?.name || 'Lainnya',
      category_group: category?.group_type || formData.type,
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
        showToast('Gagal menyimpan transaksi', 'error')
        return
      }

      if (formData.target_ids.length > 0) {
        for (const targetId of formData.target_ids) {
          await fetch('/api/target-payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              target_id: targetId,
              amount: parseFloat(formData.amount) / formData.target_ids.length,
              transaction_id: newTransaction.id,
            }),
          })
        }
        await fetchTargetPayments()
      }

      console.log('Transaction saved successfully')
      await fetchTransactions()
      
      await calculateAutoSave()
      
      sendTransactionReceipt(newTransaction)
      
      showToast('Transaksi berhasil disimpan!', 'success')
      setShowAddModal(false)
      setFormData({
        type: 'expense',
        amount: '',
        category_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        target_ids: [],
      })
    } catch (error) {
      console.error('Error adding transaction:', error)
      showToast('Gagal menyimpan transaksi', 'error')
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
        const category = categories.find(c => 
          c.name.toLowerCase().includes(result.data.category?.toLowerCase() || '')
        ) || categories[9]

        setFormData({
          type: 'expense',
          amount: result.data.amount?.toString() || '0',
          category_id: category.id,
          description: result.data.description || 'Transaksi',
          date: result.data.date || new Date().toISOString().split('T')[0],
          target_ids: [],
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
    { id: 'targets', icon: Target, label: 'Target' },
    { id: 'savings', icon: PiggyBank, label: 'Tabungan' },
    { id: 'transactions', icon: Receipt, label: 'Transaksi' },
    { id: 'receipt', icon: Printer, label: 'Struk' },
    { id: 'account', icon: User, label: 'Akun' },
  ]

  const todayTransactions = transactions.filter(
    t => t.date === new Date().toISOString().split('T')[0]
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 pb-24 lg:pb-0 font-sans">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 skeuo-card !rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-10 duration-300">
          <div className="skeuo-panel-inner p-2.5 rounded-xl">
            {toast.type === 'success' && <TrendingUp className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />}
            {toast.type === 'error' && <X className="w-5 h-5 text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />}
            {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />}
          </div>
          <span className="text-white font-bold uppercase tracking-widest text-xs drop-shadow-md">{toast.message}</span>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-900 shadow-[0_0_20px_rgba(0,0,0,1),inset_0_0_10px_rgba(0,0,0,1)]" />
              <div className="absolute inset-0 rounded-full border-t-4 border-green-500 animate-spin glow-border shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
              <div className="absolute inset-4 rounded-full border-b-2 border-green-400/30 animate-spin-slow opacity-50" />
              <div className="absolute inset-x-0 top-0 flex justify-center -translate-y-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,1)] animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-green-500 font-mono text-sm uppercase tracking-[0.3em] animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">System Initializing</span>
              <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-tighter">Please Wait...</span>
            </div>
          </div>
        </div>
      )}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-[#0f0f0f] shadow-[inset_-2px_0_10px_rgba(0,0,0,0.5)] flex-col p-5 z-40">
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
            <Wallet className="w-6 h-6 text-zinc-300" />
          </div>
          <div>
            <span className="text-white font-bold text-xl">Kembuk</span>
            <p className="text-zinc-500 text-xs">Finance Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.filter(item => item.id !== 'receipt').map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden ${
                activeTab === item.id
                  ? 'skeuo-card text-green-500 shadow-[0_0_15px_rgba(0,255,102,0.15)] border-green-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_5px_rgba(0,255,102,0.5)]' : ''}`} />
              <span className={`font-mono text-sm tracking-wider uppercase ${activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(0,255,102,0.3)]' : ''}`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-green-500 rounded-l-full shadow-[0_0_10px_rgba(0,255,102,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-zinc-800 mt-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center border border-zinc-600">
              <User className="w-5 h-5 text-zinc-300" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">Kembuk</p>
              <p className="text-zinc-500 text-xs">Premium User</p>
            </div>
            <button className="p-2 bg-zinc-700/50 rounded-lg border border-zinc-600/50 hover:bg-zinc-700 transition-colors">
              <Settings className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-60">
        <header className="sticky top-0 bg-[#111]/90 backdrop-blur-md border-b border-[#0f0f0f] px-4 py-4 z-30 lg:hidden shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold tracking-wide">
              {activeTab === 'home' && 'Beranda'}
              {activeTab === 'targets' && 'Target'}
              {activeTab === 'transactions' && 'Transaksi'}
              {activeTab === 'account' && 'Akun'}
            </h1>
          </div>
        </header>

        <main className="p-3 lg:p-6 max-w-3xl lg:mx-auto pb-24">
          {activeTab === 'home' && (
            <div className="space-y-4">
              <div className="skeuo-card p-4 lg:p-6 mb-4">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 skeuo-panel-inner rounded-xl flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-zinc-300 text-[10px] lg:text-sm font-medium tracking-[0.2em] font-mono uppercase">SALDO</p>
                      <p className="hidden lg:block text-zinc-500 text-xs">Total Keseluruhan</p>
                    </div>
                  </div>
                  <div className="p-2 skeuo-panel-inner rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                
                <div className="skeuo-panel-inner p-4 lg:p-5 flex items-baseline gap-2">
                  <span className="text-green-600 text-lg lg:text-xl font-mono">Rp</span>
                  <span className="text-3xl lg:text-4xl font-bold font-mono text-green-500 tracking-wider" style={{ textShadow: '0 0 5px rgba(0,255,102,0.3)' }}>
                    {balance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('transactions')}
                className="w-full btn-skeuo mb-4"
              >
                <TrendingUp className="w-6 h-6" />
                <span>Lihat Ringkasan</span>
              </button>

              <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4">
                <div className="skeuo-card p-3 lg:p-4">
                  <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                    <div className="p-1.5 lg:p-2 skeuo-panel-inner rounded-xl flex items-center justify-center">
                      <ArrowUpRight className="w-4 lg:w-5 h-4 lg:h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-green-500 text-[9px] lg:text-xs font-medium uppercase tracking-wider">MASUK</p>
                      <p className="text-zinc-500 text-[8px] lg:text-[10px]">Bulan ini</p>
                    </div>
                  </div>
                  <div className="skeuo-panel-inner p-2.5 lg:p-3">
                    <p className="text-green-500 font-bold font-mono text-xs lg:text-sm tracking-wide" style={{ textShadow: '0 0 5px rgba(0,255,102,0.3)' }}>
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                </div>

                <div className="skeuo-card p-3 lg:p-4">
                  <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                    <div className="p-1.5 lg:p-2 skeuo-panel-inner rounded-xl flex items-center justify-center">
                      <ArrowDownRight className="w-4 lg:w-5 h-4 lg:h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-red-500 text-[9px] lg:text-xs font-medium uppercase tracking-wider">KELUAR</p>
                      <p className="text-zinc-500 text-[8px] lg:text-[10px]">Bulan ini</p>
                    </div>
                  </div>
                  <div className="skeuo-panel-inner p-2.5 lg:p-3">
                    <p className="text-red-500 font-bold font-mono text-xs lg:text-sm tracking-wide" style={{ textShadow: '0 0 5px rgba(255,0,0,0.3)' }}>
                      {formatCurrency(totalExpense)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-4">
                <button 
                  onClick={() => {
                    setShowAddOptions(false)
                    setShowAddModal(true)
                  }}
                  className="btn-skeuo flex flex-col py-3 lg:py-4 gap-1 items-center active:scale-95 transition-transform"
                >
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                  <span className="text-[10px] lg:text-xs uppercase font-bold tracking-tighter lg:tracking-widest">Pemasukan</span>
                </button>

                <button 
                  onClick={() => {
                    setShowAddOptions(false)
                    setShowAddModal(true)
                    setFormData({...formData, type: 'expense'})
                  }}
                  className="btn-skeuo flex flex-col py-3 lg:py-4 gap-1 items-center active:scale-95 transition-transform"
                >
                  <ArrowDownRight className="w-5 h-5 text-red-500" />
                  <span className="text-[10px] lg:text-xs uppercase font-bold tracking-tighter lg:tracking-widest">Pengeluaran</span>
                </button>

                <button 
                  onClick={() => {
                    setShowReceiptModal(true)
                  }}
                  className="btn-skeuo flex flex-col py-3 lg:py-4 gap-1 items-center active:scale-95 transition-transform"
                >
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px] lg:text-xs uppercase font-bold tracking-tighter lg:tracking-widest">Scan Struk</span>
                </button>
              </div>

              <div className="skeuo-card mb-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#0f0f0f]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 skeuo-panel-inner rounded-lg">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-white text-sm font-medium tracking-wide">Ringkasan Minggu Ini</span>
                  </div>
                </div>
                <div className="p-4">
                  {(() => {
                    const now = new Date()
                    const startOfWeek = new Date(now)
                    startOfWeek.setDate(now.getDate() - now.getDay())
                    startOfWeek.setHours(0, 0, 0, 0)
                    
                    const weekTransactions = transactions.filter(t => {
                      const txDate = new Date(t.date)
                      return txDate >= startOfWeek && txDate <= now
                    })
                    
                    const weekIncome = weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
                    const weekExpense = weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1 skeuo-panel-inner rounded-lg p-2.5">
                            <p className="text-green-500 text-xs mb-0.5 tracking-wider uppercase">Masuk</p>
                            <p className="text-green-500 font-bold font-mono text-sm drop-shadow-[0_0_3px_rgba(0,255,102,0.3)]">{formatCurrency(weekIncome)}</p>
                          </div>
                          <div className="flex-1 skeuo-panel-inner rounded-lg p-2.5">
                            <p className="text-red-500 text-xs mb-0.5 tracking-wider uppercase">Keluar</p>
                            <p className="text-red-500 font-bold font-mono text-sm drop-shadow-[0_0_3px_rgba(255,0,0,0.3)]">{formatCurrency(weekExpense)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">{weekTransactions.length} transaksi</span>
                          <span className={`font-medium tracking-wider ${weekIncome - weekExpense >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            Sisa: {formatCurrency(weekIncome - weekExpense)}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="skeuo-card mb-4 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#0f0f0f]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 skeuo-panel-inner rounded-lg">
                      <Receipt className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-white text-sm font-medium tracking-wide">Transaksi Hari Ini</span>
                  </div>
                  <span className="text-zinc-400 text-xs font-medium px-2 py-1 skeuo-panel-inner rounded-lg">{todayTransactions.length} items</span>
                </div>
                {todayTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-14 h-14 skeuo-panel-inner rounded-xl flex items-center justify-center mb-3">
                      <Receipt className="w-7 h-7 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">Belum ada transaksi hari ini</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#0f0f0f] bg-[#111]">
                    {todayTransactions.slice(0, 5).map((t) => {
                      const category = categories.find(c => c.id === t.category_id)
                      const IconComponent = iconMap[category?.icon || 'Package'] || Package
                      return (
                        <div key={t.id} 
                          className="px-2 py-2 lg:px-4 lg:py-3 flex items-center justify-between hover:bg-[#1a1a1a] active:bg-[#151515] transition-all group cursor-pointer border-l-2 border-transparent hover:border-green-500/50"
                          onClick={() => {
                            setEditingTransaction(t);
                            setFormData({
                              amount: t.amount.toString(),
                              category_id: t.category_id,
                              description: t.description,
                              type: t.type,
                              date: new Date(t.date).toISOString().split('T')[0]
                            });
                          }}
                        >
                          <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center skeuo-panel-inner group-hover:shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] shrink-0">
                              <IconComponent className={`w-3.5 h-3.5 lg:w-5 lg:h-5 transition-transform group-hover:scale-110 ${t.type === 'income' ? 'text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]' : 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]'}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-zinc-100 text-xs lg:text-sm font-bold tracking-wide group-hover:text-white truncate">{t.description}</p>
                              <p className="text-zinc-500 text-[8px] lg:text-[10px] tracking-[0.1em] uppercase group-hover:text-zinc-400 truncate">{t.category_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 lg:gap-3 shrink-0">
                            <span className={`font-mono text-[10px] lg:text-sm font-bold tracking-tighter lg:tracking-wider ${
                              t.type === 'income' ? 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                            }`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                            <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTransaction(t.id);
                                }}
                                className="text-zinc-500 lg:text-zinc-600 hover:text-red-500 p-1 lg:p-1.5 skeuo-panel-inner rounded-md active:scale-75 transition-transform"
                              >
                                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="skeuo-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold flex items-center gap-2 tracking-wide">
                    <Receipt className="w-5 h-5 text-zinc-400" />
                    Semua Transaksi
                  </h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-skeuo !px-3 !py-1.5 !text-xs"
                  >
                    + Tambah
                  </button>
                </div>
                
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    className="w-full pl-10 pr-4 py-3 skeuo-input"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 skeuo-panel-inner rounded-lg text-green-500 text-xs font-medium border border-green-500/50">
                    Semua
                  </button>
                  <button className="px-3 py-1.5 skeuo-panel-inner rounded-lg text-zinc-400 text-xs font-medium hover:text-green-500 transition-colors">
                    Masuk
                  </button>
                  <button className="px-3 py-1.5 skeuo-panel-inner rounded-lg text-zinc-400 text-xs font-medium hover:text-red-500 transition-colors">
                    Keluar
                  </button>
                </div>
              </div>
              
              {transactions.length === 0 ? (
                <div className="skeuo-card p-8 text-center">
                  <div className="w-16 h-16 skeuo-panel-inner rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <Receipt className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 font-medium">Belum ada transaksi</p>
                  <p className="text-zinc-600 text-sm mt-1">Tambah transaksi pertama kamu</p>
                </div>
              ) : (
                <div className="skeuo-card overflow-hidden">
                  <div className="divide-y divide-[#0f0f0f] bg-[#111]">
                    {transactions.map((t) => {
                      const category = categories.find(c => c.id === t.category_id)
                      const IconComponent = iconMap[category?.icon || 'Package'] || Package
                      return (
                        <div key={t.id} 
                          className="px-2 py-2 lg:px-4 lg:py-3 flex items-center justify-between hover:bg-[#1a1a1a] active:bg-[#151515] transition-all group cursor-pointer border-l-2 border-transparent hover:border-green-500/30"
                          onClick={() => {
                            setEditingTransaction(t);
                            setFormData({
                              amount: t.amount.toString(),
                              category_id: t.category_id,
                              description: t.description,
                              type: t.type,
                              date: new Date(t.date).toISOString().split('T')[0]
                            });
                          }}
                        >
                          <div className="flex items-center gap-2.5 lg:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 skeuo-panel-inner rounded-lg flex items-center justify-center shrink-0 group-hover:shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                              <IconComponent className={`w-3.5 h-3.5 lg:w-5 lg:h-5 transition-transform group-hover:scale-110 ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white text-xs lg:text-sm font-bold tracking-wide truncate group-hover:text-white">{t.description}</p>
                              <p className="text-zinc-500 text-[8px] lg:text-xs tracking-wider line-clamp-1 uppercase font-mono opacity-80">{t.category_name} • {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 lg:gap-3 shrink-0 ml-2">
                            <span className={`font-mono text-[10px] lg:text-sm font-bold tracking-tighter lg:tracking-wider ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                            <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTransaction(t.id);
                                }}
                                className="text-zinc-500 lg:text-zinc-600 hover:text-red-500 p-1 lg:p-1.5 skeuo-panel-inner rounded-md active:scale-75 transition-transform"
                              >
                                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'targets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg tracking-wide">Target Checklist</h2>
                <button
                  onClick={() => setShowAddTargetModal(true)}
                  className="btn-skeuo !px-4 !py-2 !text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>

              {targets.length === 0 ? (
                <div className="skeuo-card p-8 text-center">
                  <div className="w-16 h-16 skeuo-panel-inner rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 mb-2 font-medium">Belum ada target</p>
                  <p className="text-zinc-600 text-sm">Tambah target pengeluaran tetap</p>
                </div>
              ) : (
                <>
                  <div className="skeuo-card p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-zinc-400 text-sm font-medium tracking-wide">
                        {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-zinc-500 text-sm font-mono">
                        {targetPayments.length}/{targets.length} selesai
                      </span>
                    </div>
                    <div className="w-full h-2 skeuo-panel-inner rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300 shadow-[0_0_8px_var(--neon-green-glow)]"
                        style={{ width: `${targets.length > 0 ? (targetPayments.length / targets.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="mt-3 text-right">
                      <span className="text-green-500 font-bold font-mono text-sm tracking-wide" style={{ textShadow: '0 0 5px rgba(0,255,102,0.3)' }}>
                        Total: {formatCurrency(targets.reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {targets.map((target) => {
                      const isPaid = targetPayments.some(
                        p => p.target_id === target.id &&
                             new Date(p.paid_at).getMonth() === new Date().getMonth()
                      )
                      return (
                        <div
                          key={target.id}
                          className={`px-3 py-2 lg:p-4 skeuo-panel-inner transition-all group border-l-2 ${
                            isPaid ? 'border-green-600/50 bg-green-500/5' : 'border-zinc-800 hover:border-zinc-600 cursor-pointer active:bg-zinc-800/20'
                          }`}
                          onClick={() => !isPaid && handleToggleTargetPayment(target)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 lg:gap-3 min-w-0 flex-1">
                              <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                isPaid ? 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(0,255,102,0.3)]' : 'border-zinc-700 bg-[#0f0f0f] shadow-inner'
                              }`}>
                                {isPaid ? <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-black font-bold" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs lg:text-sm font-bold tracking-wide truncate ${isPaid ? 'text-green-500 line-through opacity-70' : 'text-white'}`}>
                                  {target.name}
                                </p>
                                {target.due_date && (
                                  <p className="text-zinc-600 text-[8px] lg:text-[10px] tracking-widest uppercase mt-0.5">
                                    {new Date(target.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 lg:gap-4 ml-2">
                              <span className={`font-mono text-xs lg:text-sm font-bold tracking-tighter lg:tracking-normal ${isPaid ? 'text-green-500/50' : 'text-red-500'}`}>
                                {formatCurrency(target.amount)}
                              </span>
                              <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteTarget(target.id)
                                  }}
                                  className="p-1.5 lg:p-2 skeuo-panel-inner text-zinc-600 hover:text-red-500 transition-all active:scale-75"
                                >
                                  <Trash className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {monthlyLogs.length > 0 && (
                    <div className="skeuo-card p-4 mt-4">
                      <h3 className="text-zinc-400 text-sm font-medium mb-4 flex items-center gap-2 tracking-wide">
                        <History className="w-4 h-4" />
                        Riwayat Bulanan
                      </h3>
                      <div className="space-y-3">
                        {monthlyLogs.map((log, idx) => {
                          const percent = log.total > 0 ? Math.round((log.paid / log.total) * 100) : 0
                          const monthDate = new Date(log.month + '-01')
                          const monthLabel = monthDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
                          return (
                            <div key={log.month} className="skeuo-panel-inner p-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 text-sm">
                              <div className="flex items-center gap-3 flex-1 min-w-[150px]">
                                <span className="text-white font-bold tracking-tight w-20 uppercase text-[10px] lg:text-xs">{monthLabel}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 skeuo-panel-inner bg-black/50 rounded-full overflow-hidden border border-zinc-800/50">
                                    <div 
                                      className={`h-full transition-all duration-1000 ${percent === 100 ? 'bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-bold font-mono tracking-tight ${percent === 100 ? 'text-green-500' : 'text-zinc-400'}`}>
                                    {percent}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end border-l border-zinc-800/50 pl-2 lg:pl-3">
                                <span className="text-white font-mono text-[11px] lg:text-xs tracking-tight">{formatCurrency(log.amount_paid)}</span>
                                <span className="text-zinc-500 font-mono text-[9px] tracking-tight border-t border-zinc-800/30 mt-0.5 pt-0.5">{formatCurrency(log.amount_total)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'savings' && (
            <div className="space-y-3">
              <div className="skeuo-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 skeuo-panel-inner rounded-xl flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-[10px] tracking-wider uppercase">Total Tabungan</p>
                      <h2 className="text-2xl font-bold font-mono text-green-500 drop-shadow-[0_0_5px_rgba(0,255,102,0.3)]">{formatCurrency(savings?.balance || 0)}</h2>
                    </div>
                  </div>
                  <div className="text-right p-2 skeuo-panel-inner rounded-lg">
                    <p className="text-zinc-500 text-[10px] uppercase">Auto Save</p>
                    <p className="text-yellow-500 text-sm font-bold drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]">{savings?.auto_save_percent || 0}%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddSavingsTargetModal(true)}
                    className="flex-1 btn-skeuo !px-3 !py-3 !text-xs w-full"
                  >
                    + Tambah Target
                  </button>
                </div>
              </div>

              {savingsTargets.filter(t => !t.is_completed).length > 0 && (
                <div className="skeuo-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#0f0f0f]">
                    <h3 className="text-white font-semibold flex items-center gap-2 tracking-wide">
                      <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                      Target Aktif ({savingsTargets.filter(t => !t.is_completed).length})
                    </h3>
                  </div>
                  <div className="p-3 space-y-3 bg-[#111]">
                    {savingsTargets.filter(t => !t.is_completed).map((target) => {
                      const percent = Math.min(100, Math.round((target.current_amount / target.target_amount) * 100))
                      return (
                        <div key={target.id} className="skeuo-panel-inner p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium tracking-wide">{target.name}</span>
                            <span className="text-xs text-yellow-500 font-mono drop-shadow-[0_0_3px_rgba(234,179,8,0.3)]">{percent}%</span>
                          </div>
                          <div className="h-2.5 bg-black rounded-full overflow-hidden mb-3 border border-[#222]">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ width: `${percent}%`, backgroundColor: target.color }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-500 font-mono tracking-wider">{formatCurrency(target.current_amount)}</span>
                            <span className="text-zinc-500 font-mono tracking-wider">{formatCurrency(target.target_amount)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {savingsTargets.filter(t => t.is_completed).length > 0 && (
                <div className="skeuo-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#0f0f0f]">
                    <h3 className="text-white font-semibold flex items-center gap-2 tracking-wide">
                      <Check className="w-4 h-4 text-green-500" />
                      Target Selesai ({savingsTargets.filter(t => t.is_completed).length})
                    </h3>
                  </div>
                  <div className="p-3 space-y-3 bg-[#111]">
                    {savingsTargets.filter(t => t.is_completed).map((target) => (
                      <div key={target.id} className="skeuo-panel-inner p-3 opacity-60 grayscale">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium line-through tracking-wide">{target.name}</span>
                          <span className="text-green-500 text-xs font-mono drop-shadow-[0_0_3px_rgba(0,255,102,0.3)]">COMPLETED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {savingsTargets.length === 0 && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-xl mx-auto mb-3 flex items-center justify-center border border-zinc-700">
                      <PiggyBank className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400 font-medium mb-1">Belum ada target tabungan</p>
                    <p className="text-zinc-500 text-sm">Buat target untuk mulai menabung</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-3">
              <div className="skeuo-card p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 skeuo-panel-inner rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg font-bold">FE</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide">Pengguna</h3>
                    <p className="text-zinc-500 text-xs">Kembuk Finance</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 skeuo-panel-inner rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_var(--neon-green-glow)]"></span>
                      <span className="text-green-500 text-[10px] font-bold tracking-widest uppercase">Premium</span>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="skeuo-panel-inner p-3 text-center">
                    <p className="text-xl font-bold text-white font-mono">{transactions.length}</p>
                    <p className="text-zinc-500 text-[10px] tracking-wider uppercase mt-1">Total</p>
                  </div>
                  <div className="skeuo-panel-inner p-3 text-center">
                    <p className="text-lg font-bold text-green-500 font-mono drop-shadow-[0_0_3px_rgba(0,255,102,0.3)]">{transactions.filter(t => t.type === 'income').length}</p>
                    <p className="text-green-500/70 text-[10px] tracking-wider uppercase mt-1">Masuk</p>
                  </div>
                  <div className="skeuo-panel-inner p-3 text-center">
                    <p className="text-lg font-bold text-red-500 font-mono drop-shadow-[0_0_3px_rgba(239,68,68,0.3)]">{transactions.filter(t => t.type === 'expense').length}</p>
                    <p className="text-red-500/70 text-[10px] tracking-wider uppercase mt-1">Keluar</p>
                  </div>
                </div>
              </div>

              <div className="skeuo-card p-5">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2 tracking-wide">
                  <TrendingUp className="w-4 h-4 text-zinc-400" />
                  Ringkasan Keuangan
                </h4>
                <div className="space-y-3 bg-[#111]">
                  <div className="flex items-center justify-between p-3 skeuo-panel-inner">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center skeuo-card p-1">
                        <ArrowUpRight className="w-4 h-4 text-green-500 drop-shadow-[0_0_3px_rgba(0,255,102,0.5)]" />
                      </div>
                      <span className="text-white font-medium tracking-wide">Total Pemasukan</span>
                    </div>
                    <span className="text-green-500 font-bold font-mono text-sm drop-shadow-[0_0_3px_rgba(0,255,102,0.3)]">{formatCurrency(totalIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 skeuo-panel-inner">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center skeuo-card p-1">
                        <ArrowDownRight className="w-4 h-4 text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]" />
                      </div>
                      <span className="text-white font-medium tracking-wide">Total Pengeluaran</span>
                    </div>
                    <span className="text-red-500 font-bold font-mono text-sm drop-shadow-[0_0_3px_rgba(239,68,68,0.3)]">{formatCurrency(totalExpense)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 skeuo-panel-inner">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center skeuo-card p-1">
                        <Wallet className="w-4 h-4 text-zinc-400" />
                      </div>
                      <span className="text-white font-medium tracking-wide">Saldo</span>
                    </div>
                    <span className={`font-bold font-mono text-sm ${balance >= 0 ? 'text-zinc-300' : 'text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.3)]'}`}>{formatCurrency(balance)}</span>
                  </div>
                </div>
              </div>

              <div className="skeuo-card p-5">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2 tracking-wide">
                  <PieChart className="w-4 h-4 text-zinc-400" />
                  Kategori Pengeluaran Terbesar
                </h4>
                {(() => {
                  const expenseByCategory = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, t) => {
                      acc[t.category_name] = (acc[t.category_name] || 0) + t.amount
                      return acc
                    }, {} as Record<string, number>)
                  
                  const sortedCategories = Object.entries(expenseByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                  
                  if (sortedCategories.length === 0) {
                    return (
                      <div className="text-center py-4 opacity-50 grayscale">
                        <Receipt className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm">Belum ada data pengeluaran</p>
                      </div>
                    )
                  }
                  
                  const maxAmount = sortedCategories[0][1]
                  
                  return (
                    <div className="space-y-4">
                      {sortedCategories.map(([category, amount], i) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white font-medium tracking-wide">{category}</span>
                            <span className="text-zinc-400 font-mono text-xs">{formatCurrency(amount)}</span>
                          </div>
                          <div className="h-2 skeuo-panel-inner rounded-full bg-black overflow-hidden border border-[#222]">
                            <div 
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${(amount / maxAmount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-[#000] shadow-[0_-10px_30px_rgba(0,0,0,0.9)] flex items-center justify-around py-3 pb-8 z-50 lg:hidden">
        {navItems.map((item) => (
          item.id === 'receipt' ? (
            <button
              key={item.id}
              onClick={() => setShowAddOptions(true)}
              className="flex flex-col items-center relative -mt-10 group"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center skeuo-card p-1 bg-[#111] transition-all active:scale-90 relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-[inset_0_2px_8px_rgba(255,255,255,0.4),0_0_25px_rgba(34,197,94,0.4)] relative z-10">
                  <Plus className="w-8 h-8 text-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                </div>
              </div>
            </button>
          ) : (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 relative ${
                activeTab === item.id 
                  ? 'text-green-500 scale-110' 
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-all ${activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(0,255,102,0.6)]' : ''}`} />
              <span className={`text-[9px] font-mono font-bold tracking-[0.15em] uppercase transition-all ${activeTab === item.id ? 'drop-shadow-[0_0_5px_rgba(0,255,102,0.4)]' : ''}`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="absolute -bottom-1 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(0,255,102,1)]" />
              )}
            </button>
          )
        ))}
      </nav>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-3 lg:p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md max-h-[95vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="skeuo-card p-0 flex flex-col max-h-[95vh] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.1)]">
              <div className="p-3 lg:p-5 border-b border-zinc-800/60 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 skeuo-panel-inner rounded-xl">
                    <Plus className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg tracking-wide uppercase text-shadow-glow">Tambah Transaksi</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 skeuo-panel-inner rounded-xl hover:brightness-110 active:scale-95 transition-all">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="p-3 lg:p-4 space-y-3 lg:space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
                    className={`py-3 px-4 rounded-xl transition-all ${
                      formData.type === 'income'
                        ? 'skeuo-panel-inner border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                        : 'bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                       <ArrowUpRight className={`w-4 h-4 ${formData.type === 'income' ? 'text-green-400' : 'text-zinc-500'}`} />
                      <span className={`font-bold tracking-wide uppercase text-xs lg:text-sm ${formData.type === 'income' ? 'text-green-400' : 'text-zinc-500'}`}>Masuk</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
                    className={`py-3 px-4 rounded-xl transition-all ${
                      formData.type === 'expense'
                        ? 'skeuo-panel-inner border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.2)]'
                        : 'bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDownRight className={`w-4 h-4 ${formData.type === 'expense' ? 'text-red-400' : 'text-zinc-500'}`} />
                      <span className={`font-bold tracking-wide uppercase text-xs lg:text-sm ${formData.type === 'expense' ? 'text-red-400' : 'text-zinc-500'}`}>Keluar</span>
                    </div>
                  </button>
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Kategori</label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                    {categories
                      .filter(cat => cat.group_type === formData.type)
                      .map((cat) => {
                        const IconComponent = iconMap[cat.icon] || Package
                        const isSelected = formData.category_id === cat.id
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setFormData({ ...formData, category_id: cat.id })}
                            className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                              isSelected
                                ? formData.type === 'income'
                                  ? 'skeuo-panel-inner border-green-500/30'
                                  : 'skeuo-panel-inner border-red-500/30'
                                : 'bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
                            }`}
                          >
                            <IconComponent className={`w-6 h-6 ${isSelected ? (formData.type === 'income' ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]') : 'text-zinc-500'}`} />
                            <span className={`text-[10px] font-medium tracking-wide text-center leading-tight ${isSelected ? 'text-white' : 'text-zinc-500'}`}>{cat.name}</span>
                          </button>
                        )
                      })}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm tracking-widest">Rp</span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white font-mono tracking-wider placeholder-zinc-600 focus:outline-none focus:border-green-500/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-colors"
                    />
                  </div>
                </div>

                {formData.type === 'expense' && (
                  <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Target (opsional)</label>
                    <div className="border border-zinc-700/60 rounded-xl overflow-hidden bg-zinc-950/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                      <div className="p-2 max-h-32 lg:max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                        {targets.length === 0 ? (
                          <p className="text-zinc-500 text-xs p-3 text-center">Belum ada target.</p>
                        ) : (
                          targets.map((target) => {
                            const isSelected = formData.target_ids.includes(target.id)
                            return (
                              <label
                                key={target.id}
                                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                                  isSelected ? 'skeuo-panel-inner border-green-500/30' : 'bg-transparent hover:bg-zinc-900'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        target_ids: [...formData.target_ids, target.id],
                                        category_id: target.category_id || '',
                                        amount: target.amount.toString(),
                                      })
                                    } else {
                                      setFormData({
                                        ...formData,
                                        target_ids: formData.target_ids.filter(id => id !== target.id),
                                      })
                                    }
                                  }}
                                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-green-500 focus:ring-green-500"
                                />
                                <div className="flex-1">
                                  <span className={`text-xs ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{target.name}</span>
                                </div>
                                <span className={`text-[10px] font-mono tracking-wide ${isSelected ? 'text-green-400' : 'text-zinc-500'}`}>
                                  {formatCurrency(target.amount)}
                                </span>
                              </label>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Keterangan</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi transaksi"
                    className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-green-500/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50 appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <button
                  onClick={handleAddTransaction}
                  disabled={!formData.amount || !formData.category_id}
                  className="w-full btn-skeuo mt-2 py-4 shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                >
                  Simpan Transaksi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="skeuo-card p-0 overflow-hidden relative">
              <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 skeuo-panel-inner rounded-xl">
                    <Camera className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-wide uppercase text-shadow-glow">Scan Struk</h3>
                    <p className="text-green-500/80 text-xs tracking-wider uppercase font-bold mt-1">AI Pembaca Struk</p>
                  </div>
                </div>
                <button onClick={() => setShowReceiptModal(false)} className="p-2 skeuo-panel-inner rounded-xl hover:brightness-110 active:scale-95 transition-all">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="p-5">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleReceiptUpload}
                    disabled={analyzing}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-zinc-600/50 rounded-2xl p-6 text-center hover:border-green-500/50 cursor-pointer transition-all bg-zinc-950/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                    {analyzing ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto skeuo-panel-inner rounded-xl flex items-center justify-center">
                          <Sparkles className="w-7 h-7 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)] animate-pulse" />
                        </div>
                        <div>
                          <p className="text-green-400 font-bold uppercase tracking-widest text-sm text-shadow-glow">Menganalisis struk...</p>
                          <p className="text-zinc-500 font-mono text-xs mt-1">GEMINI AI ENGINE</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto skeuo-panel-inner rounded-xl flex items-center justify-center">
                          <Printer className="w-7 h-7 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                        </div>
                        <div>
                          <p className="text-zinc-300 font-bold uppercase tracking-wider text-sm">Ambil foto struk</p>
                          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">ATAU pilih dari galeri</p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                <div className="mt-4 flex items-center gap-3 p-3 skeuo-panel-inner rounded-xl border border-green-500/20">
                  <Sparkles className="w-5 h-5 text-green-400 shrink-0" />
                  <p className="text-zinc-400 text-xs leading-relaxed">AI akan otomatis isi <span className="text-white font-medium">jumlah</span>, <span className="text-white font-medium">kategori</span>, dan <span className="text-white font-medium">tanggal</span></p>
                </div>
              </div>
            </div>
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

      {/* Add Target Modal */}
      {showAddTargetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-3 lg:p-4" onClick={() => setShowAddTargetModal(false)}>
          <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="skeuo-card p-0 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.1)]">
              <div className="p-4 lg:p-5 border-b border-zinc-800/60 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 skeuo-panel-inner rounded-xl">
                    <Target className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg tracking-wide uppercase text-shadow-glow">Tambah Tagihan</h3>
                </div>
                <button onClick={() => setShowAddTargetModal(false)} className="p-2 skeuo-panel-inner rounded-xl hover:brightness-110 active:scale-95 transition-all">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Nama Tagihan</label>
                  <input
                    type="text"
                    value={newTarget.name}
                    onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                    placeholder="Contoh: Listrik PLN"
                    className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-green-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm tracking-widest">Rp</span>
                    <input
                      type="number"
                      value={newTarget.amount}
                      onChange={(e) => setNewTarget({ ...newTarget, amount: e.target.value })}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white font-mono tracking-wider placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Jatuh Tempo (opsional)</label>
                  <input
                    type="date"
                    value={newTarget.due_date || ''}
                    onChange={(e) => setNewTarget({ ...newTarget, due_date: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="flex items-center gap-3 p-2">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={newTarget.is_recurring}
                    onChange={(e) => setNewTarget({ ...newTarget, is_recurring: e.target.checked })}
                    className="w-5 h-5 rounded bg-zinc-900 border-zinc-700 text-green-500 focus:ring-green-500"
                  />
                  <label htmlFor="is_recurring" className="text-zinc-300 font-medium text-xs lg:text-sm tracking-wide">
                    Berulang setiap bulan
                  </label>
                </div>

                <button
                  onClick={handleAddTarget}
                  className="w-full btn-skeuo mt-2 py-4 shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                >
                  Simpan Tagihan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Savings Target Modal */}
      {showAddSavingsTargetModal && (
        <SavingsTargetModal 
          onClose={() => setShowAddSavingsTargetModal(false)} 
          onSuccess={() => { fetchSavingsTargets(); setShowAddSavingsTargetModal(false); }} 
          onCreate={() => calculateAutoSave()} 
        />
      )}

      {/* Add Options Modal */}
      {showAddOptions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-3 lg:p-4" onClick={() => setShowAddOptions(false)}>
          <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="skeuo-card p-0 flex flex-col max-h-[95vh] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.1)]">
              <div className="p-4 lg:p-5 border-b border-zinc-800/60 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 skeuo-panel-inner rounded-xl">
                    <Plus className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg tracking-wide uppercase text-shadow-glow">Opsi Input</h3>
                </div>
                <button onClick={() => setShowAddOptions(false)} className="p-2 skeuo-panel-inner rounded-xl hover:brightness-110 active:scale-95 transition-all">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              
              <div className="p-4 lg:p-5 space-y-3 lg:space-y-4">
                <button
                  onClick={() => {
                    setShowAddOptions(false);
                    setShowAddModal(true);
                  }}
                  className="w-full flex items-center gap-3 lg:gap-4 p-3 lg:p-4 skeuo-panel-inner hover:brightness-110 active:scale-[0.98] transition-all rounded-2xl border border-zinc-700/50 group shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center shrink-0 skeuo-panel rounded-xl group-hover:shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all">
                    <Edit3 className="w-5 h-5 lg:w-6 lg:h-6 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left flex-1 border-l border-zinc-700/50 pl-3 lg:pl-4">
                    <p className="text-white font-bold uppercase tracking-wider text-xs lg:text-sm drop-shadow-md">Input Manual</p>
                    <p className="text-zinc-500 text-[10px] lg:text-xs mt-0.5 lg:mt-1 uppercase tracking-widest font-mono">Manual Entry</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-green-500/50 transition-colors" />
                </button>

                <button
                  onClick={() => {
                    setShowAddOptions(false);
                    setShowReceiptModal(true);
                  }}
                  className="w-full flex items-center gap-3 lg:gap-4 p-3 lg:p-4 skeuo-panel-inner hover:brightness-110 active:scale-[0.98] transition-all rounded-2xl border border-zinc-700/50 group shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center shrink-0 skeuo-panel rounded-xl group-hover:shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all">
                    <Camera className="w-5 h-5 lg:w-6 lg:h-6 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left flex-1 border-l border-zinc-700/50 pl-3 lg:pl-4">
                    <p className="text-white font-bold uppercase tracking-wider text-xs lg:text-sm drop-shadow-md">Scan Struk</p>
                    <p className="text-green-500/70 text-[10px] lg:text-xs mt-0.5 lg:mt-1 uppercase tracking-widest font-bold font-mono">Powered by Gemini AI</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-green-500/50 transition-colors" />
                </button>

                <button
                  onClick={() => {
                    setShowAddOptions(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-3 lg:gap-4 p-3 lg:p-4 skeuo-panel-inner hover:brightness-110 active:scale-[0.98] transition-all rounded-2xl border border-zinc-700/50 group shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center shrink-0 skeuo-panel rounded-xl group-hover:shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all">
                    <Upload className="w-5 h-5 lg:w-6 lg:h-6 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left flex-1 border-l border-zinc-700/50 pl-3 lg:pl-4">
                    <p className="text-white font-bold uppercase tracking-wider text-xs lg:text-sm drop-shadow-md">Pilih dari Galeri</p>
                    <p className="text-zinc-500 text-[10px] lg:text-xs mt-0.5 lg:mt-1 uppercase tracking-widest font-mono">Upload Image</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-green-500/50 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-3 lg:p-4" onClick={() => setEditingTransaction(null)}>
          <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300 max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="skeuo-card p-0 flex flex-col max-h-[95vh] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.1)]">
              <div className="p-4 lg:p-5 border-b border-zinc-800/60 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 skeuo-panel-inner rounded-xl">
                    <Wallet className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg tracking-wide uppercase text-shadow-glow">Edit Transaksi</h3>
                </div>
                <button onClick={() => setEditingTransaction(null)} className="p-2 skeuo-panel-inner rounded-xl hover:brightness-110 active:scale-95 transition-all">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditingTransaction({ ...editingTransaction, type: 'income', category_id: '' })}
                    className={`py-3 px-4 rounded-xl transition-all ${
                      editingTransaction.type === 'income'
                        ? 'skeuo-panel-inner border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                        : 'bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpRight className={`w-4 h-4 ${editingTransaction.type === 'income' ? 'text-green-400' : 'text-zinc-500'}`} />
                      <span className={`font-bold tracking-wide uppercase text-xs lg:text-sm ${editingTransaction.type === 'income' ? 'text-green-400' : 'text-zinc-500'}`}>Masuk</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setEditingTransaction({ ...editingTransaction, type: 'expense', category_id: '' })}
                    className={`py-3 px-4 rounded-xl transition-all ${
                      editingTransaction.type === 'expense'
                        ? 'skeuo-panel-inner border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.2)]'
                        : 'bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDownRight className={`w-4 h-4 ${editingTransaction.type === 'expense' ? 'text-red-400' : 'text-zinc-500'}`} />
                      <span className={`font-bold tracking-wide uppercase text-xs lg:text-sm ${editingTransaction.type === 'expense' ? 'text-red-400' : 'text-zinc-500'}`}>Keluar</span>
                    </div>
                  </button>
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block ml-1">Kategori</label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                    {categories
                      .filter(cat => cat.group_type === editingTransaction.type)
                      .map((cat) => {
                        const IconComponent = iconMap[cat.icon] || Package
                        const isSelected = editingTransaction.category_id === cat.id
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setEditingTransaction({ ...editingTransaction, category_id: cat.id })}
                            className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                              isSelected
                                ? editingTransaction.type === 'income'
                                  ? 'skeuo-panel-inner border-green-500/30'
                                  : 'skeuo-panel-inner border-red-500/30'
                                : 'bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
                            }`}
                          >
                            <IconComponent className={`w-6 h-6 ${isSelected ? (editingTransaction.type === 'income' ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]') : 'text-zinc-500'}`} />
                            <span className={`text-[10px] font-medium tracking-wide text-center leading-tight ${isSelected ? 'text-white' : 'text-zinc-500'}`}>{cat.name}</span>
                          </button>
                        )
                      })}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-2 ml-1">Deskripsi</label>
                  <input
                    type="text"
                    value={editingTransaction.description}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                    className="w-full bg-zinc-950/80 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:outline-none focus:border-green-500/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-2 ml-1">Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm tracking-widest">Rp</span>
                    <input
                      type="number"
                      value={editingTransaction.amount}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white font-mono font-bold text-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:outline-none focus:border-green-500/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-2 ml-1">Tanggal</label>
                  <input
                    type="date"
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                    className="w-full bg-zinc-950/80 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:outline-none focus:border-green-500/50 transition-all font-mono appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
              <div className="p-4 lg:p-5 border-t border-zinc-800/60 flex flex-col gap-3 flex-shrink-0">
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase.from('kf_transactions').update({
                        description: editingTransaction.description,
                        amount: editingTransaction.amount,
                        date: editingTransaction.date,
                        type: editingTransaction.type,
                        category_id: editingTransaction.category_id,
                      }).eq('id', editingTransaction.id)

                      if (error) throw error
                      
                      const updatedTransactions = transactions.map(t => t.id === editingTransaction.id ? editingTransaction : t)
                      setTransactions(updatedTransactions)
                      calculateStats(updatedTransactions)
                      setEditingTransaction(null)
                      showToast('Transaksi diperbarui', 'success')
                    } catch (error) {
                      console.error('Error updating:', error)
                      showToast('Gagal memperbarui transaksi', 'error')
                    }
                  }}
                  disabled={!editingTransaction.amount || !editingTransaction.category_id}
                  className="w-full btn-skeuo rounded-xl py-4 active:scale-[0.98] transition-transform shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    <span className="text-white font-bold uppercase tracking-wider text-sm drop-shadow-md">Simpan Perubahan</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Hapus transaksi ini?')) {
                      handleDeleteTransaction(editingTransaction.id)
                      setEditingTransaction(null)
                    }
                  }}
                  className="w-full py-4 skeuo-panel-inner rounded-xl border border-red-500/30 text-red-500 font-bold uppercase tracking-wider text-xs lg:text-sm hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Hapus Transaksi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
