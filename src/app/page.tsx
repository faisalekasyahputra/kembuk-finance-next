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
  Send, Image, Moon, Sun, PieChart, Target, Check, AlertCircle, Trash
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
  icon: string
  group: string
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

const defaultCategories: Category[] = [
  { id: '1316db21-8b3e-4b16-9ac3-d7ad008f63ff', name: 'Bensin', icon: 'Fuel', group: 'expense' },
  { id: '1d235330-090a-447f-b3db-2aa47e01db67', name: 'Rokok', icon: 'Cigarette', group: 'expense' },
  { id: 'ced99f4f-a3c1-4434-9496-edf78ed28d8f', name: 'Listrik', icon: 'Zap', group: 'expense' },
  { id: '95593a08-6e21-4260-9064-d728a0b42813', name: 'Wifi', icon: 'Wifi', group: 'expense' },
  { id: 'cbc83d63-0c37-4326-8038-df1ee127fb86', name: 'Service Motor', icon: 'Wrench', group: 'expense' },
  { id: '58728828-ee06-4d19-8f8e-c0bf8120057c', name: 'Cicilan', icon: 'CreditCard', group: 'expense' },
  { id: '34b1475a-1bd6-4239-9e70-c8316b159b5f', name: 'Kuota', icon: 'Smartphone', group: 'expense' },
  { id: '2a43d9f5-165a-46a6-a30f-0f6f683c2d7f', name: 'Google Drive', icon: 'HardDrive', group: 'expense' },
  { id: '48c948ff-f155-46b7-8b6e-c0d58cc117dc', name: 'iCloud', icon: 'Cloud', group: 'expense' },
  { id: 'cd2bf5ca-115d-4e94-8c0e-2df65206e5ea', name: 'Streaming', icon: 'Tv', group: 'expense' },
  { id: '7a32aefb-2f84-459c-856e-b656e77666af', name: 'Laundry', icon: 'Shirt', group: 'expense' },
  { id: '5606a0f2-8e20-44f8-9938-1b382f33fb68', name: 'Gemini AI', icon: 'Sparkles', group: 'expense' },
  { id: '4a1d493c-9faf-4823-8ac4-2d1668d92463', name: 'Twitter', icon: 'Bird', group: 'expense' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', name: 'Lainnya', icon: 'Package', group: 'expense' },
  { id: '7b317b60-3011-4205-8465-bd8f09cd88e0', name: 'SIR ANGKI', icon: 'Briefcase', group: 'income' },
  { id: '57a4fd47-8bc9-4113-ad02-ec0f822ea7a1', name: 'MELLY', icon: 'DollarSign', group: 'income' },
  { id: '1bdc4fab-9691-4822-870e-62d398b686ec', name: 'RAPID', icon: 'Plane', group: 'income' },
  { id: 'c7951d88-72f5-4261-bbac-50719a5342ad', name: 'ADHI', icon: 'Building2', group: 'income' },
  { id: 'ac0e5853-f9da-4ad9-aa4b-97304529550c', name: 'FLATYFOOS', icon: 'Gift', group: 'income' },
]

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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [targets, setTargets] = useState<Target[]>([])
  const [targetPayments, setTargetPayments] = useState<TargetPayment[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showReceiptExport, setShowReceiptExport] = useState(false)
  const [showAddTargetModal, setShowAddTargetModal] = useState(false)
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
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      fetchTransactions()
      fetchTargets()
      fetchTargetPayments()
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
          showToast('Target取消标记为未支付', 'info')
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

    const category = defaultCategories.find(c => c.id === formData.category_id)
    
    const newTransaction = {
      id: crypto.randomUUID(),
      user_id: 'shared',
      type: formData.type,
      category_id: formData.category_id || null,
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
    <div className="min-h-screen bg-zinc-950 text-white pb-24 lg:pb-0">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg backdrop-blur-xl flex items-center gap-3 animate-pulse ${
          toast.type === 'success' ? 'bg-green-600/90 border border-green-500/30' : toast.type === 'error' ? 'bg-red-600/90 border border-red-500/30' : 'bg-blue-600/90 border border-blue-500/30'
        }`}>
          {toast.type === 'success' && <TrendingUp className="w-5 h-5 text-green-200" />}
          {toast.type === 'error' && <X className="w-5 h-5 text-red-200" />}
          {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-200" />}
          <span className="text-white text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="text-white text-sm">Memuat data...</span>
          </div>
        </div>
      )}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex-col p-5 z-40">
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
            <Wallet className="w-6 h-6 text-zinc-300" />
          </div>
          <div>
            <span className="text-white font-bold text-xl">Kembuk</span>
            <p className="text-zinc-500 text-xs">Finance Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.filter(item => item.id !== 'receipt').map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
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
        <header className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-4 z-30 lg:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold">
              {activeTab === 'home' && 'Beranda'}
              {activeTab === 'targets' && 'Target'}
              {activeTab === 'transactions' && 'Transaksi'}
              {activeTab === 'account' && 'Akun'}
            </h1>
          </div>
        </header>

        <main className="p-4 lg:p-6 max-w-3xl lg:mx-auto">
          {activeTab === 'home' && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-600 rounded-[22px] opacity-40 blur-sm" />
                <div className="relative bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-850 rounded-2xl p-6 border border-zinc-600/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_25px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent rounded-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-blue-500/30 rounded-xl blur-md" />
                        <div className="relative p-2 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 rounded-xl border-t border-l border-zinc-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.3)]">
                          <Wallet className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-300 text-sm font-medium tracking-wide">SALDO</p>
                        <p className="text-zinc-500 text-xs">Total Keseluruhan</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/15 via-emerald-500/15 to-green-500/15 rounded-xl blur-sm" />
                    <div className="relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-xl p-5 border-t border-l border-zinc-700/60 shadow-[inset_0_3px_6px_rgba(0,0,0,0.7),inset_0_-1px_1px_rgba(255,255,255,0.03)]">
                      <div className="flex items-baseline gap-2">
                        <span className="text-zinc-500 text-xl font-mono">Rp</span>
                        <span className="text-4xl font-bold font-mono text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {balance.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 rounded-[18px] opacity-50 blur-sm" />
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="relative w-full bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 rounded-xl p-5 border-t border-l border-blue-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.4),0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.5),0_6px_20px_rgba(59,130,246,0.5)] transition-all active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-[1px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-xl pointer-events-none" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.3)] backdrop-blur-sm border border-white/20">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="text-white font-bold text-lg block drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Lihat Ringkasan</span>
                        <span className="text-blue-200/80 text-sm">Semua transaksi kamu</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <ChevronRight className="w-6 h-6 text-white/80" />
                    </div>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-b from-green-600/30 to-green-700/30 rounded-[16px] blur-sm" />
                  <div className="relative bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-850 rounded-xl p-4 border-t border-l border-zinc-600/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.4)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent rounded-xl pointer-events-none" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-xl flex items-center justify-center border-t border-l border-green-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.3)]">
                        <ArrowUpRight className="w-5 h-5 text-green-200" />
                      </div>
                      <div>
                        <p className="text-green-400/80 text-xs font-medium">PEMASUKAN</p>
                        <p className="text-green-500/60 text-[10px]">Bulan ini</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-green-500/10 rounded-lg blur-sm" />
                      <div className="relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-lg p-3 border-t border-l border-green-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                        <p className="text-green-400 font-bold font-mono text-lg tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                          {formatCurrency(totalIncome)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-b from-red-600/30 to-red-700/30 rounded-[16px] blur-sm" />
                  <div className="relative bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-850 rounded-xl p-4 border-t border-l border-zinc-600/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.4)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent rounded-xl pointer-events-none" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-xl flex items-center justify-center border-t border-l border-red-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.3)]">
                        <ArrowDownRight className="w-5 h-5 text-red-200" />
                      </div>
                      <div>
                        <p className="text-red-400/80 text-xs font-medium">PENGELUARAN</p>
                        <p className="text-red-500/60 text-[10px]">Bulan ini</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-red-500/10 rounded-lg blur-sm" />
                      <div className="relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-lg p-3 border-t border-l border-red-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                        <p className="text-red-400 font-bold font-mono text-lg tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                          {formatCurrency(totalExpense)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => {
                    setShowAddOptions(false)
                    setShowAddModal(true)
                  }}
                  className="bg-zinc-800 rounded-xl p-3 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 bg-zinc-700 rounded-lg flex items-center justify-center border border-zinc-600">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-green-400 text-xs font-medium">Pemasukan</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowAddOptions(false)
                    setShowAddModal(true)
                    setFormData({...formData, type: 'expense'})
                  }}
                  className="bg-zinc-800 rounded-xl p-3 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 bg-zinc-700 rounded-lg flex items-center justify-center border border-zinc-600">
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-red-400 text-xs font-medium">Pengeluaran</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowReceiptModal(true)
                  }}
                  className="bg-zinc-800 rounded-xl p-3 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 bg-zinc-700 rounded-lg flex items-center justify-center border border-zinc-600">
                      <Camera className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-blue-400 text-xs font-medium">Scan Struk</span>
                  </div>
                </button>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-white text-sm font-medium">Ringkasan Minggu Ini</span>
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
                          <div className="flex-1 bg-zinc-950 rounded-lg p-2.5 border border-zinc-800">
                            <p className="text-green-400/70 text-xs mb-0.5">Masuk</p>
                            <p className="text-green-400 font-bold font-mono text-sm">{formatCurrency(weekIncome)}</p>
                          </div>
                          <div className="flex-1 bg-zinc-950 rounded-lg p-2.5 border border-zinc-800">
                            <p className="text-red-400/70 text-xs mb-0.5">Keluar</p>
                            <p className="text-red-400 font-bold font-mono text-sm">{formatCurrency(weekExpense)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">{weekTransactions.length} transaksi</span>
                          <span className={`font-medium ${weekIncome - weekExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            Sisa: {formatCurrency(weekIncome - weekExpense)}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
                      <Receipt className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-white text-sm font-medium">Transaksi Hari Ini</span>
                  </div>
                  <span className="text-zinc-400 text-xs font-medium px-2 py-1 bg-zinc-800 rounded-lg border border-zinc-700">{todayTransactions.length} items</span>
                </div>
                {todayTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-3 border border-zinc-700">
                      <Receipt className="w-7 h-7 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">Belum ada transaksi hari ini</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {todayTransactions.slice(0, 5).map((t) => {
                      const category = defaultCategories.find(c => c.id === t.category_id)
                      const IconComponent = iconMap[category?.icon || 'Package'] || Package
                      return (
                        <div key={t.id} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                              t.type === 'income' 
                                ? 'bg-zinc-800 border-zinc-700' 
                                : 'bg-zinc-800 border-zinc-700'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`} />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{t.description}</p>
                              <p className="text-zinc-500 text-xs">{t.category_name}</p>
                            </div>
                          </div>
                          <span className={`font-mono text-sm font-semibold ${
                            t.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {t.type === 'income' ? '+' : '-'}
                            {formatCurrency(t.amount)}
                          </span>
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
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-zinc-400" />
                    Semua Transaksi
                  </h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium border border-blue-500 transition-colors"
                  >
                    + Tambah
                  </button>
                </div>
                
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-xs font-medium">
                    Semua
                  </button>
                  <button className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-xs font-medium hover:bg-zinc-700 transition-colors">
                    Masuk
                  </button>
                  <button className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-xs font-medium hover:bg-zinc-700 transition-colors">
                    Keluar
                  </button>
                </div>
              </div>
              
              {transactions.length === 0 ? (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
                  <Receipt className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">Belum ada transaksi</p>
                  <p className="text-zinc-600 text-sm mt-1">Tambah transaksi pertama kamu</p>
                </div>
              ) : (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                  <div className="divide-y divide-zinc-800">
                    {transactions.map((t) => {
                      const category = defaultCategories.find(c => c.id === t.category_id)
                      const IconComponent = iconMap[category?.icon || 'Package'] || Package
                      return (
                        <div key={t.id} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                              <IconComponent className={`w-4 h-4 ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`} />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{t.description}</p>
                              <p className="text-zinc-500 text-xs">{t.category_name} • {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-sm font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-zinc-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                <h2 className="text-white font-bold text-lg">Target Checklist</h2>
                <button
                  onClick={() => setShowAddTargetModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>

              {targets.length === 0 ? (
                <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center">
                  <Target className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 mb-2">Belum ada target</p>
                  <p className="text-zinc-600 text-sm">Tambah target pengeluaran tetap</p>
                </div>
              ) : (
                <>
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-zinc-400 text-sm">
                        {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-zinc-500 text-sm">
                        {targetPayments.length}/{targets.length} selesai
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${targets.length > 0 ? (targetPayments.length / targets.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-green-400 font-bold">
                        Total: {formatCurrency(targets.reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {targets.map((target) => {
                      const isPaid = targetPayments.some(
                        p => p.target_id === target.id &&
                             new Date(p.paid_at).getMonth() === new Date().getMonth()
                      )
                      return (
                        <div
                          key={target.id}
                          className={`bg-zinc-900 rounded-xl p-4 border transition-all cursor-pointer ${
                            isPaid ? 'border-green-600/50 bg-green-900/20' : 'border-zinc-800 hover:border-zinc-700'
                          }`}
                          onClick={() => handleToggleTargetPayment(target)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                isPaid ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                              }`}>
                                {isPaid && <Check className="w-4 h-4 text-white" />}
                              </div>
                              <div>
                                <p className={`font-medium ${isPaid ? 'text-green-400 line-through' : 'text-white'}`}>
                                  {target.name}
                                </p>
                                {target.due_date && (
                                  <p className="text-zinc-500 text-xs">
                                    Jatuh tempo: {new Date(target.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-mono font-bold ${isPaid ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(target.amount)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteTarget(target.id)
                                }}
                                className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'savings' && (
            <div className="space-y-3">
              <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700">
                    <PiggyBank className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Total Tabungan</p>
                    <h2 className="text-2xl font-bold font-mono text-green-500">{formatCurrency(0)}</h2>
                  </div>
                </div>
              </div>

              <button className="w-full bg-zinc-800 rounded-xl p-4 flex items-center justify-between border border-zinc-700 hover:bg-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-zinc-700 rounded-lg flex items-center justify-center border border-zinc-600">
                    <Plus className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-white font-medium">Tambah Target Tabungan</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </button>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Target Aktif
                  </h3>
                </div>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-zinc-800 rounded-xl mx-auto mb-3 flex items-center justify-center border border-zinc-700">
                    <PiggyBank className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 font-medium mb-1">Belum ada target tabungan</p>
                  <p className="text-zinc-500 text-sm">Buat target untuk mulai menabung</p>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-zinc-400" />
                    Tips Menabung
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start gap-3 p-2.5 bg-zinc-800 rounded-lg">
                    <div className="w-5 h-5 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-zinc-400 text-xs font-bold">1</span>
                    </div>
                    <p className="text-zinc-300 text-sm">Catat setiap pengeluaran untuk Awareness</p>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 bg-zinc-800 rounded-lg">
                    <div className="w-5 h-5 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-zinc-400 text-xs font-bold">2</span>
                    </div>
                    <p className="text-zinc-300 text-sm">Pisahkan uang kebutuhan dan keinginan</p>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 bg-zinc-800 rounded-lg">
                    <div className="w-5 h-5 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-zinc-400 text-xs font-bold">3</span>
                    </div>
                    <p className="text-zinc-300 text-sm">Transfer otomatis ke rekening tabungan</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-3">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                    <span className="text-white text-lg font-bold">FE</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Pengguna</h3>
                    <p className="text-zinc-500 text-sm">Kembuk Finance</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-zinc-800 rounded-full border border-zinc-700">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      <span className="text-zinc-400 text-xs font-medium">Premium</span>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-950 rounded-lg p-2.5 border border-zinc-800 text-center">
                    <p className="text-xl font-bold text-white font-mono">{transactions.length}</p>
                    <p className="text-zinc-500 text-xs">Total</p>
                  </div>
                  <div className="bg-zinc-950 rounded-lg p-2.5 border border-zinc-800 text-center">
                    <p className="text-lg font-bold text-green-400 font-mono">{transactions.filter(t => t.type === 'income').length}</p>
                    <p className="text-green-400/70 text-xs">Masuk</p>
                  </div>
                  <div className="bg-zinc-950 rounded-lg p-2.5 border border-zinc-800 text-center">
                    <p className="text-lg font-bold text-red-400 font-mono">{transactions.filter(t => t.type === 'expense').length}</p>
                    <p className="text-red-400/70 text-xs">Keluar</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-zinc-400" />
                  Ringkasan Keuangan
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-zinc-300 text-sm">Total Pemasukan</span>
                    </div>
                    <span className="text-green-400 font-bold font-mono text-sm">{formatCurrency(totalIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-zinc-300 text-sm">Total Pengeluaran</span>
                    </div>
                    <span className="text-red-400 font-bold font-mono text-sm">{formatCurrency(totalExpense)}</span>
                  </div>
                  <div className="border-t border-zinc-800 my-1" />
                  <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                        <Wallet className="w-4 h-4 text-zinc-400" />
                      </div>
                      <span className="text-white text-sm font-medium">Saldo</span>
                    </div>
                    <span className={`font-bold font-mono text-sm ${balance >= 0 ? 'text-zinc-300' : 'text-red-400'}`}>{formatCurrency(balance)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
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
                      <div className="text-center py-4">
                        <Receipt className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm">Belum ada data pengeluaran</p>
                      </div>
                    )
                  }
                  
                  const maxAmount = sortedCategories[0][1]
                  
                  return (
                    <div className="space-y-2">
                      {sortedCategories.map(([category, amount], i) => (
                        <div key={category} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-300">{category}</span>
                            <span className="text-zinc-400 font-mono text-xs">{formatCurrency(amount)}</span>
                          </div>
                          <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                            <div 
                              className="h-full bg-zinc-500 rounded-full"
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

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around py-2 pb-6 z-50 lg:hidden">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-3xl" />
        {navItems.map((item) => (
          item.id === 'receipt' ? (
            <button
              key={item.id}
              onClick={() => setShowAddOptions(true)}
              className="flex flex-col items-center -mt-8 relative"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center border-4 border-zinc-900">
                <Plus className="w-6 h-6 text-white" />
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
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        ))}
      </nav>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
                    <Plus className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold">Tambah Transaksi</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-3 px-4 rounded-lg border ${
                      formData.type === 'income'
                        ? 'bg-zinc-800 border-green-500 text-green-400'
                        : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="font-medium text-sm">Masuk</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-3 px-4 rounded-lg border ${
                      formData.type === 'expense'
                        ? 'bg-zinc-800 border-red-500 text-red-400'
                        : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDownRight className="w-4 h-4" />
                      <span className="font-medium text-sm">Keluar</span>
                    </div>
                  </button>
                </div>

                <div>
                  <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">Rp</span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Target (opsional)</label>
                  <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-950">
                    <div className="p-2 max-h-40 overflow-y-auto space-y-1">
                      {targets.length === 0 ? (
                        <p className="text-zinc-500 text-sm p-2">Belum ada target. Tambah di tab Target.</p>
                      ) : (
                        targets.map((target) => {
                          const isSelected = formData.target_ids.includes(target.id)
                          return (
                            <label
                              key={target.id}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected ? 'bg-green-900/30' : 'hover:bg-zinc-800/50'
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
                                      amount: target.amount.toString(),
                                    })
                                  } else {
                                    setFormData({
                                      ...formData,
                                      target_ids: formData.target_ids.filter(id => id !== target.id),
                                    })
                                  }
                                }}
                                className="w-4 h-4 rounded border-zinc-600 text-green-500 focus:ring-green-500"
                              />
                              <div className="flex-1">
                                <span className="text-white text-sm">{target.name}</span>
                              </div>
                              <span className="text-zinc-400 text-xs font-mono">
                                {formatCurrency(target.amount)}
                              </span>
                            </label>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Keterangan</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi transaksi"
                    className="w-full px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-600 appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <button
                  onClick={handleAddTransaction}
                  disabled={!formData.amount || !formData.category_id}
                  className="w-full py-3 bg-blue-600 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors border border-blue-500"
                >
                  Simpan Transaksi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
                    <Camera className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Scan Struk</h3>
                    <p className="text-zinc-500 text-xs">AI akan membaca struk kamu</p>
                  </div>
                </div>
                <button onClick={() => setShowReceiptModal(false)} className="p-1.5 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="p-4">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleReceiptUpload}
                    disabled={analyzing}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-zinc-600 rounded-xl p-6 text-center hover:border-zinc-500 cursor-pointer">
                    {analyzing ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                          <Sparkles className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <p className="text-green-500 font-medium text-sm">Menganalisis struk...</p>
                          <p className="text-zinc-500 text-xs mt-1">Gemini AI</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                          <Printer className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <p className="text-zinc-300 font-medium text-sm">Ambil foto struk</p>
                          <p className="text-zinc-500 text-xs mt-1">ATAU pilih dari galeri</p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                <div className="mt-3 flex items-center gap-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  <p className="text-zinc-400 text-xs">AI akan otomatis isi jumlah, kategori, dan tanggal</p>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md" onClick={() => setShowAddTargetModal(false)}>
            <div className="relative bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-950/95 rounded-3xl border border-zinc-700/50 shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl" onClick={e => e.stopPropagation()}>
              <div className="absolute inset-[1px] rounded-[22px] bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between bg-gradient-to-r from-zinc-900/50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl border border-green-500/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Tambah Target</h3>
                  </div>
                  <button onClick={() => setShowAddTargetModal(false)} className="p-2 bg-zinc-800/60 rounded-xl border border-zinc-700/40 hover:bg-zinc-700/60 transition-colors">
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-zinc-400 text-sm font-medium mb-2 block">Nama Target</label>
                    <input
                      type="text"
                      value={newTarget.name}
                      onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                      placeholder="Contoh: Listrik PLN"
                      className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-sm font-medium mb-2 block">Jumlah</label>
                    <input
                      type="number"
                      value={newTarget.amount}
                      onChange={(e) => setNewTarget({ ...newTarget, amount: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-sm font-medium mb-2 block">Tanggal Jatuh Tempo (opsional)</label>
                    <input
                      type="date"
                      value={newTarget.due_date}
                      onChange={(e) => setNewTarget({ ...newTarget, due_date: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_recurring"
                      checked={newTarget.is_recurring}
                      onChange={(e) => setNewTarget({ ...newTarget, is_recurring: e.target.checked })}
                      className="w-5 h-5 rounded bg-zinc-950 border-zinc-700 text-green-500 focus:ring-green-500"
                    />
                    <label htmlFor="is_recurring" className="text-zinc-400 text-sm">
                      Berulang setiap bulan
                    </label>
                  </div>

                  <button
                    onClick={handleAddTarget}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-xl text-white font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30 border border-green-500/30"
                  >
                    Simpan Target
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Options Modal */}
      {showAddOptions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-end lg:items-center justify-center p-4" onClick={() => setShowAddOptions(false)}>
          <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-950/95 rounded-3xl border border-zinc-700/50 shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-[1px] rounded-[22px] bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between bg-gradient-to-r from-zinc-900/50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl border border-blue-500/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                      <Plus className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Tambah Transaksi</h3>
                  </div>
                  <button onClick={() => setShowAddOptions(false)} className="p-2 bg-zinc-800/60 rounded-xl border border-zinc-700/40 hover:bg-zinc-700/60 transition-colors">
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
                
                <div className="p-5 space-y-3">
                  <button
                    onClick={() => {
                      setShowAddOptions(false)
                      setShowAddModal(true)
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 hover:from-zinc-800 hover:to-zinc-900 rounded-xl transition-all border border-zinc-700/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
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
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 hover:from-zinc-800 hover:to-zinc-900 rounded-xl transition-all border border-zinc-700/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl flex items-center justify-center border border-green-500/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
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
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 hover:from-zinc-800 hover:to-zinc-900 rounded-xl transition-all border border-zinc-700/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
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
