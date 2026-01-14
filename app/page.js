'use client'

import { useState, useEffect } from 'react'
import { db, tx, id } from '@/lib/instantdb'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import {
  Users,
  Package,
  DollarSign,
  Store,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Building2,
  ChevronRight,
  Wifi,
  WifiOff,
  Plus,
  Upload,
  Clipboard,
  AlertCircle,
  Award,
  UserCheck,
  Calendar,
  FileText,
  Wrench,
  Sun,
  Moon,
  Shield,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  UserCog,
  ChevronDown,
  ArrowLeft,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

// ==================== CONSTANTS ====================
const STORES = [
  { id: 'NCF-001', name: 'Archer', address: 'Archer, FL' },
  { id: 'NCF-002', name: 'Newberry', address: 'Newberry, FL' },
  { id: 'NCF-003', name: 'Chiefland', address: 'Chiefland, FL' },
  { id: 'NCF-004', name: 'Inverness', address: 'Inverness, FL' },
  { id: 'NCF-005', name: 'Homosassa', address: 'Homosassa, FL' },
  { id: 'NCF-006', name: 'Crystal River', address: 'Crystal River, FL' },
]

const ROLES = {
  ADMIN: 'admin',
  RSM: 'rsm',
  EMPLOYEE: 'employee',
}

const ROLE_LABELS = {
  admin: 'Administrator',
  rsm: 'Retail Store Manager',
  employee: 'Store Employee',
}

// ==================== OFFLINE QUEUE HOOK ====================
function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true)
  const [queue, setQueue] = useState([])

  const syncQueue = async () => {
    const savedQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]')
    if (savedQueue.length === 0) return

    toast.info(`Syncing ${savedQueue.length} offline items...`)
    
    for (const item of savedQueue) {
      try {
        if (item.transaction) {
          await db.transact(item.transaction)
        }
      } catch (error) {
        console.error('Sync error:', error)
      }
    }

    localStorage.setItem('offlineQueue', '[]')
    setQueue([])
    toast.success('All items synced!')
  }

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => {
      setIsOnline(true)
      syncQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const savedQueue = localStorage.getItem('offlineQueue')
    if (savedQueue) setQueue(JSON.parse(savedQueue))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addToQueue = (action) => {
    const newQueue = [...queue, { ...action, id: Date.now(), timestamp: new Date().toISOString() }]
    setQueue(newQueue)
    localStorage.setItem('offlineQueue', JSON.stringify(newQueue))
    toast.info('Saved offline - will sync when online')
  }

  return { isOnline, queue, addToQueue, syncQueue }
}

// ==================== AUTH COMPONENT ====================
function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      await db.auth.sendMagicCode({ email })
      setSentEmail(email)
      toast.success('Magic code sent! Check your email')
    } catch (error) {
      toast.error(error.message || 'Failed to send code')
    }
    setLoading(false)
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!code) return toast.error('Enter the code')
    setLoading(true)
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code })
      toast.success('Signed in!')
    } catch (error) {
      toast.error(error.message || 'Invalid code')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-metro-yellow flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="relative">
              <Shield className="w-24 h-24 text-black" strokeWidth={2.5} />
              <CheckCircle className="w-10 h-10 text-metro-purple absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tight">Compliance Hub</h1>
          <p className="text-lg font-medium mt-2">Metro by T-Mobile</p>
        </div>

        {/* Auth Card */}
        <div className="brutal-card p-8">
          <h2 className="text-2xl font-bold mb-6 uppercase">
            {sentEmail ? 'Enter Code' : 'Sign In'}
          </h2>

          {!sentEmail ? (
            <form onSubmit={handleSendCode}>
              <label className="block text-sm font-bold uppercase mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="brutal-input w-full mb-4"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="brutal-btn w-full bg-metro-purple text-white py-4 text-lg"
              >
                {loading ? 'Sending...' : 'Get Magic Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <p className="text-sm mb-4 bg-muted p-3 brutal-border">
                Code sent to <strong>{sentEmail}</strong>
              </p>
              <label className="block text-sm font-bold uppercase mb-2">Magic Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="brutal-input w-full mb-4 text-center text-2xl tracking-widest"
                disabled={loading}
                maxLength={6}
              />
              <button
                type="submit"
                disabled={loading}
                className="brutal-btn w-full bg-metro-green text-black py-4 text-lg"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setSentEmail('')}
                className="w-full mt-3 text-sm font-bold underline"
              >
                Use different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== STORE SELECTION MODAL ====================
function StoreSelectionModal({ onSelectStore, userRole }) {
  const [selectedStore, setSelectedStore] = useState(null)

  const handleContinue = () => {
    if (!selectedStore) {
      return toast.error('Please select a store')
    }
    onSelectStore(selectedStore)
  }

  return (
    <div className="min-h-screen bg-metro-blue flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Building2 className="w-16 h-16 mx-auto text-white mb-4" />
          <h1 className="text-3xl font-bold text-white uppercase">Select Your Store</h1>
          <p className="text-white/80 mt-2">Choose your current location to continue</p>
          <div className={`inline-block mt-4 brutal-border px-4 py-2 font-bold ${
            userRole === ROLES.ADMIN ? 'bg-metro-red text-white' :
            userRole === ROLES.RSM ? 'bg-metro-yellow text-black' : 'bg-white text-black'
          }`}>
            {ROLE_LABELS[userRole]}
          </div>
        </div>

        <div className="brutal-card p-6">
          {/* Store Selection */}
          <label className="block text-sm font-bold uppercase mb-3">Store Location</label>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {STORES.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`brutal-border w-full p-4 text-left flex items-center justify-between transition-all ${
                  selectedStore?.id === store.id
                    ? 'bg-metro-yellow brutal-shadow-yellow'
                    : 'bg-white hover:bg-muted brutal-shadow'
                }`}
              >
                <div>
                  <span className="font-bold block">{store.name}</span>
                  <span className="text-sm text-muted-foreground">{store.address}</span>
                  <span className="text-xs font-mono bg-black text-white px-2 py-0.5 mt-1 inline-block">
                    {store.id}
                  </span>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedStore}
            className="brutal-btn w-full bg-black text-white py-4 text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== DASHBOARD CARD ====================
function DashboardCard({ title, icon: Icon, color, shadowColor, onClick, disabled, badge }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`brutal-border p-6 text-left w-full transition-all ${color} ${shadowColor} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-[2px] hover:translate-y-[2px]'
      }`}
      style={{ boxShadow: disabled ? 'none' : undefined }}
    >
      <div className="flex items-start justify-between">
        <Icon className="w-12 h-12 mb-4" />
        {badge && (
          <span className="bg-metro-red text-white text-xs font-bold px-2 py-1 brutal-border">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold uppercase">{title}</h3>
    </button>
  )
}

// ==================== FORM MODAL BASE ====================
function FormModal({ isOpen, onClose, title, children, color = 'bg-white' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`brutal-card w-full max-w-2xl max-h-[90vh] overflow-y-auto ${color}`}>
        <div className="sticky top-0 bg-inherit border-b-[3px] border-black p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase">{title}</h2>
          <button
            onClick={onClose}
            className="brutal-btn bg-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ==================== EMPLOYEE ACTION FORM ====================
function EmployeeActionForm({ onClose, onSubmit, store }) {
  const [formData, setFormData] = useState({
    type: 'incident',
    employeeName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      storeId: store.id,
      storeName: store.name,
      category: 'employee_action',
      createdAt: Date.now(),
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold uppercase mb-2">Action Type</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'incident', label: 'Incident', icon: AlertTriangle, color: 'bg-metro-red' },
            { value: 'kudos', label: 'Kudos', icon: Award, color: 'bg-metro-green' },
            { value: 'attendance', label: 'Attendance', icon: Calendar, color: 'bg-metro-blue' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: type.value })}
              className={`brutal-border p-3 flex flex-col items-center gap-2 ${
                formData.type === type.value ? `${type.color} text-white` : 'bg-white'
              }`}
            >
              <type.icon className="w-6 h-6" />
              <span className="text-xs font-bold">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Employee Name</label>
        <input
          type="text"
          value={formData.employeeName}
          onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
          className="brutal-input w-full"
          placeholder="Enter employee name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="brutal-input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="brutal-input w-full h-32 resize-none"
          placeholder="Describe the incident, kudos, or attendance note..."
          required
        />
      </div>

      <button type="submit" className="brutal-btn w-full bg-metro-purple text-white py-4">
        <Send className="w-5 h-5 inline mr-2" />
        Submit Employee Action
      </button>
    </form>
  )
}

// ==================== INVENTORY ACTION FORM ====================
function InventoryActionForm({ onClose, onSubmit, store, isAudit = false }) {
  const [formData, setFormData] = useState({
    type: isAudit ? 'audit' : 'problem',
    itemName: '',
    sku: '',
    quantity: '',
    problemType: 'damaged',
    notes: '',
    photoUrl: null,
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress('Compressing...')

    try {
      // Show original file size
      const originalSize = (file.size / 1024 / 1024).toFixed(2)
      toast.info(`Original size: ${originalSize}MB - Compressing...`)

      // Compression options
      const options = {
        maxSizeMB: 0.5, // Max 500KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8,
      }

      // Compress the image
      const compressedFile = await imageCompression(file, options)
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2)
      toast.success(`Compressed to ${compressedSize}MB`)

      // Create preview
      const previewUrl = URL.createObjectURL(compressedFile)
      setPhotoPreview(previewUrl)

      // Upload to Cloudinary
      setUploadProgress('Uploading to cloud...')
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      const cloudinaryFormData = new FormData()
      cloudinaryFormData.append('file', compressedFile)
      cloudinaryFormData.append('upload_preset', uploadPreset)
      cloudinaryFormData.append('folder', `compliance_hub/${store.id}`)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: cloudinaryFormData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      
      setFormData(prev => ({ 
        ...prev, 
        photoUrl: data.secure_url,
      }))
      
      toast.success('Photo uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload photo: ' + error.message)
      // Clear preview on error
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
        setPhotoPreview(null)
      }
    } finally {
      setIsUploading(false)
      setUploadProgress('')
    }
  }

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoPreview(null)
    setFormData(prev => ({ ...prev, photoUrl: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      storeId: store.id,
      storeName: store.name,
      category: 'inventory_action',
      createdAt: Date.now(),
    })
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isAudit && (
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Problem Type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'damaged', label: 'Damaged', color: 'bg-metro-red' },
              { value: 'missing', label: 'Missing', color: 'bg-metro-orange' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, problemType: type.value })}
                className={`brutal-border p-3 font-bold ${
                  formData.problemType === type.value ? `${type.color} text-white` : 'bg-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Item Name</label>
          <input
            type="text"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            className="brutal-input w-full"
            placeholder="e.g., iPhone 15 Case"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-2">SKU</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="brutal-input w-full"
            placeholder="e.g., SKU-12345"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Quantity</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="brutal-input w-full"
          placeholder="Enter quantity"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Photo Evidence</label>
        <div className="brutal-border p-4 bg-muted">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Loader2 className="w-10 h-10 mb-2 text-metro-purple animate-spin" />
              <span className="text-sm font-bold">{uploadProgress}</span>
            </div>
          ) : photoPreview || formData.photoUrl ? (
            <div className="relative">
              <img 
                src={photoPreview || formData.photoUrl} 
                alt="Evidence" 
                className="w-full h-48 object-cover brutal-border" 
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 brutal-btn bg-metro-red text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
              {formData.photoUrl && (
                <div className="absolute bottom-2 left-2 bg-metro-green text-black text-xs font-bold px-2 py-1 brutal-border">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Uploaded to Cloud
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-muted/80 transition-colors">
              <ImageIcon className="w-10 h-10 mb-2 text-muted-foreground" />
              <span className="text-sm font-bold">Click to upload photo</span>
              <span className="text-xs text-muted-foreground mt-1">Auto-compressed before upload</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="brutal-input w-full h-24 resize-none"
          placeholder="Additional details..."
        />
      </div>

      <button 
        type="submit" 
        className="brutal-btn w-full bg-metro-blue text-white py-4"
        disabled={isUploading}
      >
        <Send className="w-5 h-5 inline mr-2" />
        {isAudit ? 'Submit Stock Audit' : 'Report Inventory Problem'}
      </button>
    </form>
  )
}

// ==================== CASH ACTION FORM ====================
function CashActionForm({ onClose, onSubmit, store, isShortage = false }) {
  const [formData, setFormData] = useState({
    type: isShortage ? 'shortage' : 'reconciliation',
    drawerNumber: '',
    expectedAmount: '',
    actualAmount: '',
    variance: '',
    notes: '',
  })

  useEffect(() => {
    const expected = parseFloat(formData.expectedAmount) || 0
    const actual = parseFloat(formData.actualAmount) || 0
    setFormData(prev => ({ ...prev, variance: (actual - expected).toFixed(2) }))
  }, [formData.expectedAmount, formData.actualAmount])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      storeId: store.id,
      storeName: store.name,
      category: 'cash_action',
      priority: isShortage || parseFloat(formData.variance) < -10 ? 'high' : 'normal',
      createdAt: Date.now(),
    })
    onClose()
  }

  const variance = parseFloat(formData.variance) || 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isShortage && (
        <div className="bg-metro-red text-white p-4 brutal-border flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <span className="font-bold block">HIGH PRIORITY ALERT</span>
            <span className="text-sm">Cash shortage reports require immediate attention</span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Drawer Number</label>
        <input
          type="text"
          value={formData.drawerNumber}
          onChange={(e) => setFormData({ ...formData, drawerNumber: e.target.value })}
          className="brutal-input w-full"
          placeholder="e.g., Drawer 1"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Expected Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.expectedAmount}
            onChange={(e) => setFormData({ ...formData, expectedAmount: e.target.value })}
            className="brutal-input w-full"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Actual Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.actualAmount}
            onChange={(e) => setFormData({ ...formData, actualAmount: e.target.value })}
            className="brutal-input w-full"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className={`brutal-border p-4 text-center ${
        variance < 0 ? 'bg-metro-red text-white' : variance > 0 ? 'bg-metro-green' : 'bg-muted'
      }`}>
        <span className="text-sm font-bold block uppercase">Variance</span>
        <span className="text-3xl font-bold">
          {variance >= 0 ? '+' : ''}${formData.variance || '0.00'}
        </span>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="brutal-input w-full h-24 resize-none"
          placeholder="Explain any variance or add notes..."
          required={variance !== 0}
        />
      </div>

      <button 
        type="submit" 
        className={`brutal-btn w-full py-4 ${
          isShortage ? 'bg-metro-red text-white' : 'bg-metro-green text-black'
        }`}
      >
        <Send className="w-5 h-5 inline mr-2" />
        {isShortage ? 'Report Cash Shortage' : 'Submit Reconciliation'}
      </button>
    </form>
  )
}

// ==================== STORE ACTION FORM ====================
function StoreActionForm({ onClose, onSubmit, store, actionType = 'checklist' }) {
  const openingChecklistItems = [
    { id: 'alarm', label: 'Disarm security alarm' },
    { id: 'lights', label: 'Turn on all lights' },
    { id: 'hvac', label: 'Check HVAC system' },
    { id: 'displays', label: 'Power on all displays' },
    { id: 'registers', label: 'Open and count cash drawers' },
    { id: 'pos', label: 'Boot up POS systems' },
    { id: 'inventory', label: 'Check floor inventory stock' },
    { id: 'signage', label: 'Set up promotional signage' },
  ]

  const closingChecklistItems = [
    { id: 'transactions', label: 'Complete all pending transactions' },
    { id: 'cash', label: 'Count and reconcile cash drawers' },
    { id: 'pos', label: 'Power down POS systems properly' },
    { id: 'inventory', label: 'Secure all inventory and displays' },
    { id: 'clean', label: 'Clean and organize sales floor' },
    { id: 'trash', label: 'Empty trash and recycling' },
    { id: 'restrooms', label: 'Check restrooms and break areas' },
    { id: 'alarm', label: 'Set alarm and lock all doors' },
  ]

  const [checkedItems, setCheckedItems] = useState({})
  const [checklistType, setChecklistType] = useState('open')
  const [maintenanceData, setMaintenanceData] = useState({
    issue: '',
    location: '',
    priority: 'medium',
    description: '',
  })

  const checklistItems = checklistType === 'open' ? openingChecklistItems : closingChecklistItems

  const toggleItem = (itemId) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  // Reset checked items when switching checklist type
  const handleChecklistTypeChange = (type) => {
    setChecklistType(type)
    setCheckedItems({})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (actionType === 'checklist') {
      onSubmit({
        type: 'store_checklist',
        checklistType,
        items: checkedItems,
        completedItems: Object.values(checkedItems).filter(Boolean).length,
        totalItems: checklistItems.length,
        storeId: store.id,
        storeName: store.name,
        category: 'store_action',
        timestamp: new Date().toISOString(),
        createdAt: Date.now(),
      })
    } else {
      onSubmit({
        type: 'maintenance_request',
        ...maintenanceData,
        storeId: store.id,
        storeName: store.name,
        category: 'store_action',
        createdAt: Date.now(),
      })
    }
    onClose()
  }

  if (actionType === 'maintenance') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Issue Type</label>
          <input
            type="text"
            value={maintenanceData.issue}
            onChange={(e) => setMaintenanceData({ ...maintenanceData, issue: e.target.value })}
            className="brutal-input w-full"
            placeholder="e.g., HVAC, Electrical, Plumbing"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">Location in Store</label>
          <input
            type="text"
            value={maintenanceData.location}
            onChange={(e) => setMaintenanceData({ ...maintenanceData, location: e.target.value })}
            className="brutal-input w-full"
            placeholder="e.g., Back office, Sales floor"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">Priority</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'low', label: 'Low', color: 'bg-metro-green' },
              { value: 'medium', label: 'Medium', color: 'bg-metro-yellow' },
              { value: 'high', label: 'High', color: 'bg-metro-red' },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setMaintenanceData({ ...maintenanceData, priority: p.value })}
                className={`brutal-border p-3 font-bold ${
                  maintenanceData.priority === p.value ? `${p.color} ${p.value === 'high' ? 'text-white' : 'text-black'}` : 'bg-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">Description</label>
          <textarea
            value={maintenanceData.description}
            onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })}
            className="brutal-input w-full h-32 resize-none"
            placeholder="Describe the maintenance issue in detail..."
            required
          />
        </div>

        <button type="submit" className="brutal-btn w-full bg-metro-orange text-black py-4">
          <Wrench className="w-5 h-5 inline mr-2" />
          Submit Maintenance Request
        </button>
      </form>
    )
  }

  const completedCount = Object.values(checkedItems).filter(Boolean).length

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold uppercase mb-2">Checklist Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChecklistTypeChange('open')}
            className={`brutal-border p-4 flex items-center gap-3 ${
              checklistType === 'open' ? 'bg-metro-yellow' : 'bg-white'
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="font-bold">Opening</span>
          </button>
          <button
            type="button"
            onClick={() => handleChecklistTypeChange('close')}
            className={`brutal-border p-4 flex items-center gap-3 ${
              checklistType === 'close' ? 'bg-metro-purple text-white' : 'bg-white'
            }`}
          >
            <Moon className="w-6 h-6" />
            <span className="font-bold">Closing</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold uppercase">
            {checklistType === 'open' ? 'Opening' : 'Closing'} Checklist
          </label>
          <span className="text-sm font-bold bg-black text-white px-2 py-1">
            {completedCount}/{checklistItems.length}
          </span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {checklistItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`brutal-border w-full p-3 flex items-center gap-3 text-left transition-all ${
                checkedItems[item.id] ? 'bg-metro-green' : 'bg-white'
              }`}
            >
              <div className={`w-6 h-6 brutal-border flex items-center justify-center ${
                checkedItems[item.id] ? 'bg-black' : 'bg-white'
              }`}>
                {checkedItems[item.id] && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className="font-medium">{index + 1}. {item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="brutal-border p-4 bg-muted">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>Timestamp: <strong>{new Date().toLocaleString()}</strong></span>
        </div>
      </div>

      <button 
        type="submit" 
        className="brutal-btn w-full bg-metro-green text-black py-4"
        disabled={completedCount === 0}
      >
        <Clipboard className="w-5 h-5 inline mr-2" />
        Complete {checklistType === 'open' ? 'Opening' : 'Closing'} Checklist
      </button>
    </form>
  )
}

// ==================== REPORTS LIST ====================
function ReportsList({ reports, title, showStore = true }) {
  if (!reports || reports.length === 0) {
    return (
      <div className="brutal-border p-8 text-center bg-muted">
        <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="font-bold">No reports yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {title && <h3 className="text-lg font-bold uppercase">{title}</h3>}
      {reports.map((report) => (
        <div key={report.id} className="brutal-border p-4 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <span className={`text-xs font-bold px-2 py-1 ${
                report.category === 'employee_action' ? 'bg-metro-purple text-white' :
                report.category === 'inventory_action' ? 'bg-metro-blue text-white' :
                report.category === 'cash_action' ? 'bg-metro-green text-black' :
                'bg-metro-yellow text-black'
              }`}>
                {report.category?.replace('_', ' ').toUpperCase()}
              </span>
              {report.priority === 'high' && (
                <span className="ml-2 text-xs font-bold px-2 py-1 bg-metro-red text-white">
                  HIGH PRIORITY
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          
          {/* Submitted by */}
          {report.userEmail && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              Submitted by: <span className="font-medium">{report.userEmail}</span>
            </p>
          )}
          
          {showStore && <p className="mt-2 font-medium">{report.storeName}</p>}
          
          {/* Type badge */}
          {report.type && (
            <span className="text-xs font-mono bg-black text-white px-2 py-0.5 mt-2 inline-block">
              {report.type}
            </span>
          )}
          
          {/* Employee Action Details */}
          {report.category === 'employee_action' && (
            <div className="mt-2 text-sm">
              {report.employeeName && <p><strong>Employee:</strong> {report.employeeName}</p>}
              {report.date && <p><strong>Date:</strong> {report.date}</p>}
              {report.description && <p className="text-muted-foreground mt-1">{report.description}</p>}
            </div>
          )}
          
          {/* Inventory Action Details */}
          {report.category === 'inventory_action' && (
            <div className="mt-2 text-sm">
              {report.itemName && <p><strong>Item:</strong> {report.itemName}</p>}
              {report.sku && <p><strong>SKU:</strong> {report.sku}</p>}
              {report.quantity && <p><strong>Quantity:</strong> {report.quantity}</p>}
              {report.problemType && <p><strong>Problem:</strong> <span className="capitalize">{report.problemType}</span></p>}
              {report.notes && <p className="text-muted-foreground mt-1">{report.notes}</p>}
              {report.photoUrl && (
                <a href={report.photoUrl} target="_blank" rel="noopener noreferrer" 
                   className="text-metro-blue underline text-xs mt-1 inline-block">
                  View Photo Evidence
                </a>
              )}
            </div>
          )}
          
          {/* Cash Action Details */}
          {report.category === 'cash_action' && (
            <div className="mt-2 text-sm">
              {report.drawerNumber && <p><strong>Drawer:</strong> {report.drawerNumber}</p>}
              <div className="flex gap-4">
                {report.expectedAmount && <p><strong>Expected:</strong> ${report.expectedAmount}</p>}
                {report.actualAmount && <p><strong>Actual:</strong> ${report.actualAmount}</p>}
              </div>
              {report.variance && (
                <p className={`font-bold ${parseFloat(report.variance) < 0 ? 'text-metro-red' : 'text-metro-green'}`}>
                  Variance: {parseFloat(report.variance) >= 0 ? '+' : ''}${report.variance}
                </p>
              )}
              {report.notes && <p className="text-muted-foreground mt-1">{report.notes}</p>}
            </div>
          )}
          
          {/* Store Checklist Details */}
          {report.category === 'store_action' && report.type === 'store_checklist' && (
            <div className="mt-2 text-sm">
              <p><strong>Type:</strong> {report.checklistType === 'open' ? '🌅 Opening' : '🌙 Closing'} Checklist</p>
              <p><strong>Completed:</strong> {report.completedItems}/{report.totalItems} items</p>
              {report.timestamp && <p><strong>Timestamp:</strong> {new Date(report.timestamp).toLocaleString()}</p>}
              
              {/* Show completed items */}
              {report.items && Object.keys(report.items).length > 0 && (
                <div className="mt-2 brutal-border p-2 bg-muted">
                  <p className="text-xs font-bold uppercase mb-1">Completed Items:</p>
                  <ul className="text-xs space-y-1">
                    {Object.entries(report.items)
                      .filter(([_, checked]) => checked)
                      .map(([itemId]) => (
                        <li key={itemId} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-metro-green" />
                          <span className="capitalize">{itemId.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Maintenance Request Details */}
          {report.category === 'store_action' && report.type === 'maintenance_request' && (
            <div className="mt-2 text-sm">
              {report.issue && <p><strong>Issue:</strong> {report.issue}</p>}
              {report.location && <p><strong>Location:</strong> {report.location}</p>}
              {report.priority && (
                <p><strong>Priority:</strong> 
                  <span className={`ml-1 px-2 py-0.5 text-xs font-bold ${
                    report.priority === 'high' ? 'bg-metro-red text-white' :
                    report.priority === 'medium' ? 'bg-metro-yellow text-black' :
                    'bg-metro-green text-black'
                  }`}>
                    {report.priority.toUpperCase()}
                  </span>
                </p>
              )}
              {report.description && <p className="text-muted-foreground mt-1">{report.description}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ==================== DETAILED REPORT VIEW MODAL ====================
function ReportDetailModal({ report, isOpen, onClose }) {
  if (!isOpen || !report) return null

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Submission Details">
      <div className="space-y-4">
        {/* Header Info */}
        <div className="brutal-border p-4 bg-muted">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Category</p>
              <p className="font-bold capitalize">{report.category?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Type</p>
              <p className="font-bold">{report.type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Store</p>
              <p className="font-bold">{report.storeName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Store ID</p>
              <p className="font-mono text-xs">{report.storeId}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Submitted By</p>
              <p className="font-bold text-xs">{report.userEmail || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Date/Time</p>
              <p className="font-bold text-xs">{new Date(report.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Full Details */}
        <div className="brutal-border p-4">
          <h4 className="font-bold uppercase mb-3">Full Details</h4>
          <pre className="text-xs bg-muted p-3 overflow-x-auto whitespace-pre-wrap brutal-border">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      </div>
    </FormModal>
  )
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard({ user, store, onLogout, onChangeStore, onBackToDashboard }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [editingUser, setEditingUser] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [filters, setFilters] = useState({
    store: 'all',
    category: 'all',
    dateRange: 'all',
    search: '',
  })
  
  // Query data
  const { data: reportsData } = db.useQuery({ reports: {} })
  const { data: usersData } = db.useQuery({ users: {} })
  
  const reports = reportsData?.reports || []
  const users = usersData?.users || []

  const handleRoleChange = async (userId, newRole) => {
    try {
      await db.transact(tx.users[userId].update({ role: newRole }))
      toast.success(`Role updated to ${ROLE_LABELS[newRole]}`)
      setEditingUser(null)
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await db.transact(tx.users[userId].delete())
      toast.success('User deleted')
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  // Stats
  const stats = {
    totalReports: reports.length,
    highPriority: reports.filter(r => r.priority === 'high').length,
    totalUsers: users.length,
    byCategory: {
      employee: reports.filter(r => r.category === 'employee_action').length,
      inventory: reports.filter(r => r.category === 'inventory_action').length,
      cash: reports.filter(r => r.category === 'cash_action').length,
      store: reports.filter(r => r.category === 'store_action').length,
    },
    byStore: STORES.reduce((acc, store) => {
      acc[store.id] = reports.filter(r => r.storeId === store.id).length
      return acc
    }, {}),
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="brutal-border border-t-0 border-x-0 bg-metro-red text-white p-3 sm:p-4">
        <div className="container">
          {/* Top row - back button and title */}
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <button onClick={onBackToDashboard} className="brutal-btn bg-white text-black p-2 flex-shrink-0">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold uppercase flex items-center gap-2">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="truncate">Admin Dashboard</span>
              </h1>
              <p className="text-xs sm:text-sm opacity-80 hidden sm:block">Compliance Hub Management</p>
            </div>
            <button onClick={onLogout} className="brutal-btn bg-white text-black p-2 flex-shrink-0 sm:hidden">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          {/* Bottom row on mobile - email and logout */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0 sm:absolute sm:right-4 sm:top-4">
            <span className="brutal-border bg-white text-black px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-none">
              {user.email}
            </span>
            <button onClick={onLogout} className="brutal-btn bg-white text-black p-2 hidden sm:block">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container py-3 sm:py-4 px-3 sm:px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'users', label: 'Users', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`brutal-btn px-3 sm:px-4 py-2 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                activeTab === tab.id ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="container pb-8 px-3 sm:px-4">
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="brutal-card p-3 sm:p-4 bg-metro-purple">
                <p className="text-xs sm:text-sm font-bold uppercase text-black">Total Reports</p>
                <p className="text-3xl sm:text-4xl font-bold text-black">{stats.totalReports}</p>
              </div>
              <div className="brutal-card p-3 sm:p-4 bg-metro-red">
                <p className="text-xs sm:text-sm font-bold uppercase text-black">High Priority</p>
                <p className="text-3xl sm:text-4xl font-bold text-black">{stats.highPriority}</p>
              </div>
              <div className="brutal-card p-3 sm:p-4 bg-metro-blue">
                <p className="text-xs sm:text-sm font-bold uppercase text-black">Total Users</p>
                <p className="text-3xl sm:text-4xl font-bold text-black">{stats.totalUsers}</p>
              </div>
              <div className="brutal-card p-3 sm:p-4 bg-metro-green">
                <p className="text-xs sm:text-sm font-bold uppercase text-black">Stores</p>
                <p className="text-3xl sm:text-4xl font-bold text-black">{STORES.length}</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="brutal-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold uppercase mb-4">Reports by Category</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="brutal-border p-3 sm:p-4 bg-metro-purple/10">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-metro-purple" />
                  <p className="text-xl sm:text-2xl font-bold">{stats.byCategory.employee}</p>
                  <p className="text-xs sm:text-sm">Employee</p>
                </div>
                <div className="brutal-border p-3 sm:p-4 bg-metro-blue/10">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-metro-blue" />
                  <p className="text-xl sm:text-2xl font-bold">{stats.byCategory.inventory}</p>
                  <p className="text-xs sm:text-sm">Inventory</p>
                </div>
                <div className="brutal-border p-3 sm:p-4 bg-metro-green/10">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-metro-green" />
                  <p className="text-xl sm:text-2xl font-bold">{stats.byCategory.cash}</p>
                  <p className="text-xs sm:text-sm">Cash</p>
                </div>
                <div className="brutal-border p-3 sm:p-4 bg-metro-yellow/10">
                  <Store className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-metro-orange" />
                  <p className="text-xl sm:text-2xl font-bold">{stats.byCategory.store}</p>
                  <p className="text-xs sm:text-sm">Store</p>
                </div>
              </div>
            </div>

            {/* Store Breakdown */}
            <div className="brutal-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold uppercase mb-4">Reports by Store</h3>
              <div className="space-y-2">
                {STORES.map((store) => (
                  <div key={store.id} className="brutal-border p-2 sm:p-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm sm:text-base block truncate">{store.name}</span>
                      <span className="text-xs font-mono bg-black text-white px-1 sm:px-2 py-0.5">
                        {store.id}
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold ml-2 flex-shrink-0">{stats.byStore[store.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="brutal-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold uppercase mb-4">All Submissions ({reports.length})</h3>
            <ReportsList reports={reports.sort((a, b) => b.createdAt - a.createdAt)} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="brutal-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold uppercase">Users ({users.length})</h3>
            </div>
            
            {users.length === 0 ? (
              <div className="brutal-border p-6 sm:p-8 text-center bg-muted">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-bold">No users yet</p>
                <p className="text-sm text-muted-foreground">Users will appear here after they sign in</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="brutal-border p-4 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold px-2 py-1 ${
                          u.role === ROLES.ADMIN ? 'bg-metro-red text-white' :
                          u.role === ROLES.RSM ? 'bg-metro-yellow text-black' :
                          'bg-muted text-black'
                        }`}>
                          {ROLE_LABELS[u.role] || 'Employee'}
                        </span>
                        {u.storeId && (
                          <span className="text-xs font-mono bg-black text-white px-2 py-0.5">
                            {u.storeId}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingUser === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="brutal-input text-sm py-1"
                            defaultValue={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          >
                            <option value={ROLES.EMPLOYEE}>Employee</option>
                            <option value={ROLES.RSM}>RSM</option>
                            <option value={ROLES.ADMIN}>Admin</option>
                          </select>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="brutal-btn bg-muted p-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingUser(u.id)}
                            className="brutal-btn bg-metro-blue text-white p-2"
                            title="Edit Role"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="brutal-btn bg-metro-red text-white p-2"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ==================== MAIN DASHBOARD ====================
function Dashboard({ user, userProfile, store, onLogout, onChangeStore }) {
  const { isOnline, queue, addToQueue } = useOfflineQueue()
  const [activeModal, setActiveModal] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)

  const role = userProfile?.role || ROLES.EMPLOYEE

  // Query reports from InstantDB
  const { data, isLoading } = db.useQuery({ reports: {} })
  const reports = data?.reports || []

  // Filter reports for the dashboard's Recent Activity
  // 1. Always filter by current store (everyone sees only their store's activity)
  // 2. Employee Actions are only visible to the submitter or admins
  const filteredReports = reports.filter(r => {
    // Must be from the current store
    if (r.storeId !== store.id) return false
    
    // Employee Actions are restricted
    if (r.category === 'employee_action') {
      // Only admins or the person who submitted it can see it
      if (role === ROLES.ADMIN) return true
      if (r.userEmail === user.email) return true
      return false
    }
    
    // All other reports are visible to everyone at that store
    return true
  })

  const handleSubmitReport = async (reportData) => {
    const reportId = id()
    const transaction = tx.reports[reportId].update({
      ...reportData,
      id: reportId,
      oduserId: user.id,
      userEmail: user.email,
    })

    if (isOnline) {
      try {
        await db.transact(transaction)
        toast.success('Report submitted successfully!')
      } catch (error) {
        toast.error('Failed to submit. Saving offline...')
        addToQueue({ transaction })
      }
    } else {
      addToQueue({ transaction })
    }
  }

  const isEmployee = role === ROLES.EMPLOYEE
  const isAdmin = role === ROLES.ADMIN

  if (showAdminDashboard && isAdmin) {
    return (
      <AdminDashboard
        user={user}
        store={store}
        onLogout={onLogout}
        onChangeStore={onChangeStore}
        onBackToDashboard={() => setShowAdminDashboard(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="brutal-border border-t-0 border-x-0 bg-metro-purple text-white p-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="brutal-btn bg-white text-black p-2 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold uppercase">Compliance Hub</h1>
              <p className="text-sm opacity-80">Metro by T-Mobile</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Online Status */}
            <div className={`brutal-border px-3 py-1 text-sm font-bold flex items-center gap-2 ${
              isOnline ? 'bg-metro-green text-black' : 'bg-metro-red text-white'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? 'Online' : 'Offline'}
              {queue.length > 0 && (
                <span className="ml-1">({queue.length})</span>
              )}
            </div>

            {/* Store Info */}
            <button
              onClick={onChangeStore}
              className="brutal-btn bg-white text-black px-3 py-1 text-sm hidden sm:flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              {store.name}
            </button>

            {/* Role Badge */}
            <span className={`brutal-border px-3 py-1 text-sm font-bold hidden sm:block ${
              role === ROLES.ADMIN ? 'bg-metro-red text-white' :
              role === ROLES.RSM ? 'bg-metro-yellow text-black' : 'bg-white text-black'
            }`}>
              {role === ROLES.ADMIN ? 'Admin' : role === ROLES.RSM ? 'RSM' : 'Employee'}
            </span>

            {/* Admin Dashboard Button */}
            {isAdmin && (
              <button
                onClick={() => setShowAdminDashboard(true)}
                className="brutal-btn bg-metro-red text-white p-2"
                title="Admin Dashboard"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="brutal-btn bg-white text-black p-2"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="brutal-card w-80 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b-[3px] border-black flex items-center justify-between">
              <span className="font-bold">Menu</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="brutal-border p-3 bg-muted">
                <p className="text-sm font-bold">Store</p>
                <p>{store.name}</p>
              </div>
              <div className="brutal-border p-3 bg-muted">
                <p className="text-sm font-bold">Role</p>
                <p>{ROLE_LABELS[role]}</p>
              </div>
              <div className="brutal-border p-3 bg-muted">
                <p className="text-sm font-bold">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>
              <button
                onClick={onChangeStore}
                className="brutal-btn w-full bg-metro-blue text-white py-3"
              >
                Change Store
              </button>
              {isAdmin && (
                <button
                  onClick={() => { setSidebarOpen(false); setShowAdminDashboard(true); }}
                  className="brutal-btn w-full bg-metro-red text-white py-3"
                >
                  <Shield className="w-5 h-5 inline mr-2" />
                  Admin Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Banner */}
        <div className="brutal-card bg-metro-yellow p-6 mb-8">
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-lg">
            {store.name} • {ROLE_LABELS[role]}
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Employee Action - RSM & Admin Only */}
          <DashboardCard
            title="Employee Action"
            icon={Users}
            color="bg-metro-purple text-white"
            shadowColor="brutal-shadow-purple"
            onClick={() => setActiveModal('employee')}
            disabled={isEmployee}
            badge={isEmployee ? 'RSM Only' : null}
          />

          {/* Inventory Action */}
          <DashboardCard
            title="Inventory Action"
            icon={Package}
            color="bg-metro-blue text-white"
            shadowColor="brutal-shadow-blue"
            onClick={() => setActiveModal('inventory')}
          />

          {/* Cash Action */}
          <DashboardCard
            title="Cash Action"
            icon={DollarSign}
            color="bg-metro-green text-black"
            shadowColor="brutal-shadow-green"
            onClick={() => setActiveModal('cash')}
          />

          {/* Store Action */}
          <DashboardCard
            title="Store Action"
            icon={Store}
            color="bg-metro-yellow text-black"
            shadowColor="brutal-shadow-yellow"
            onClick={() => setActiveModal('store')}
          />
        </div>

        {/* Recent Reports */}
        <div className="brutal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold uppercase">Recent Activity</h3>
            {isLoading && <span className="text-sm text-muted-foreground">Loading...</span>}
          </div>
          <ReportsList 
            reports={filteredReports.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)} 
            showStore={false}
          />
        </div>
      </main>

      {/* Modals */}
      <FormModal
        isOpen={activeModal === 'employee'}
        onClose={() => setActiveModal(null)}
        title="Employee Action"
        color="bg-metro-purple/10"
      >
        <EmployeeActionForm
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitReport}
          store={store}
        />
      </FormModal>

      <FormModal
        isOpen={activeModal === 'inventory'}
        onClose={() => setActiveModal(null)}
        title="Inventory Action"
        color="bg-metro-blue/10"
      >
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setActiveModal('inventory-problem')}
              className="brutal-btn bg-metro-red text-white p-4"
            >
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              Report Problem
            </button>
            <button
              onClick={() => setActiveModal('inventory-audit')}
              className="brutal-btn bg-metro-blue text-white p-4"
            >
              <Clipboard className="w-8 h-8 mx-auto mb-2" />
              Stock Audit
            </button>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={activeModal === 'inventory-problem'}
        onClose={() => setActiveModal(null)}
        title="Report Inventory Problem"
        color="bg-metro-red/10"
      >
        <InventoryActionForm
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitReport}
          store={store}
          isAudit={false}
        />
      </FormModal>

      <FormModal
        isOpen={activeModal === 'inventory-audit'}
        onClose={() => setActiveModal(null)}
        title="Stock Audit"
        color="bg-metro-blue/10"
      >
        <InventoryActionForm
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitReport}
          store={store}
          isAudit={true}
        />
      </FormModal>

      <FormModal
        isOpen={activeModal === 'cash'}
        onClose={() => setActiveModal(null)}
        title="Cash Action"
        color="bg-metro-green/10"
      >
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setActiveModal('cash-shortage')}
              className="brutal-btn bg-metro-red text-white p-4"
            >
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              Cash Shortage
            </button>
            <button
              onClick={() => setActiveModal('cash-reconciliation')}
              className="brutal-btn bg-metro-green text-black p-4"
            >
              <DollarSign className="w-8 h-8 mx-auto mb-2" />
              Reconciliation
            </button>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={activeModal === 'cash-shortage'}
        onClose={() => setActiveModal(null)}
        title="Report Cash Shortage"
        color="bg-metro-red/10"
      >
        <CashActionForm
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitReport}
          store={store}
          isShortage={true}
        />
      </FormModal>

      <FormModal
        isOpen={activeModal === 'cash-reconciliation'}
        onClose={() => setActiveModal(null)}
        title="Cash Reconciliation"
        color="bg-metro-green/10"
      >
        <CashActionForm
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitReport}
          store={store}
          isShortage={false}
        />
      </FormModal>

      <FormModal
        isOpen={activeModal === 'store'}
        onClose={() => setActiveModal(null)}
        title="Store Action"
        color="bg-metro-yellow/10"
      >
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setActiveModal('store-checklist')}
              className="brutal-btn bg-metro-yellow text-black p-4"
            >
              <Clipboard className="w-8 h-8 mx-auto mb-2" />
              Open/Close Checklist
            </button>
            <button
              onClick={() => setActiveModal('store-maintenance')}
              className="brutal-btn bg-metro-orange text-black p-4"
            >
              <Wrench className="w-8 h-8 mx-auto mb-2" />
              Maintenance Request
            </button>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={activeModal === 'store-checklist'}
        onClose={() => setActiveModal(null)}
        title="Store Checklist"
        color="bg-metro-yellow/10"
      >
        <StoreActionForm
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitReport}
          store={store}
          actionType="checklist"
        />
      </FormModal>

      <FormModal
        isOpen={activeModal === 'store-maintenance'}
        onClose={() => setActiveModal(null)}
        title="Maintenance Request"
        color="bg-metro-orange/10"
      >
        <StoreActionForm
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitReport}
          store={store}
          actionType="maintenance"
        />
      </FormModal>
    </div>
  )
}

// ==================== MAIN APP ====================
export default function App() {
  const { isLoading: authLoading, user, error } = db.useAuth()
  const [selectedStore, setSelectedStore] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Query user profile from database
  const { data: usersData, isLoading: usersLoading } = db.useQuery(
    user ? { users: { $: { where: { odEmail: user.email } } } } : null
  )

  // Create or fetch user profile when user logs in
  useEffect(() => {
    const setupUserProfile = async () => {
      if (!user || usersLoading) return
      
      setProfileLoading(true)
      const existingUsers = usersData?.users || []
      
      if (existingUsers.length > 0) {
        // User exists, use their profile
        setUserProfile(existingUsers[0])
      } else {
        // New user, create profile with default employee role
        const userId = id()
        try {
          await db.transact(tx.users[userId].update({
            id: userId,
            odEmail: user.email,
            odId: user.id,
            role: ROLES.EMPLOYEE, // Default role
            createdAt: Date.now(),
          }))
          setUserProfile({
            id: userId,
            odEmail: user.email,
            odId: user.id,
            role: ROLES.EMPLOYEE,
          })
          toast.success('Welcome! Your account has been created.')
        } catch (error) {
          console.error('Failed to create user profile:', error)
        }
      }
      setProfileLoading(false)
    }

    setupUserProfile()
  }, [user, usersData, usersLoading])

  // Update userProfile when data changes (e.g., role updated by admin)
  useEffect(() => {
    if (usersData?.users?.length > 0) {
      setUserProfile(usersData.users[0])
    }
  }, [usersData])

  // Load stored store preference
  useEffect(() => {
    const storedStore = localStorage.getItem('selectedStore')
    if (storedStore) setSelectedStore(JSON.parse(storedStore))
  }, [])

  // Save store preference
  useEffect(() => {
    if (selectedStore) localStorage.setItem('selectedStore', JSON.stringify(selectedStore))
  }, [selectedStore])

  const handleLogout = async () => {
    await db.auth.signOut()
    setSelectedStore(null)
    setUserProfile(null)
    localStorage.removeItem('selectedStore')
    toast.success('Signed out')
  }

  const handleChangeStore = () => {
    setSelectedStore(null)
  }

  // Loading state
  if (authLoading || profileLoading || (user && usersLoading)) {
    return (
      <div className="min-h-screen bg-metro-purple flex items-center justify-center">
        <div className="text-center text-white">
          <div className="brutal-card bg-white p-8 inline-block mb-4">
            <Store className="w-16 h-16 animate-pulse" />
          </div>
          <p className="text-xl font-bold">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return <AuthScreen />
  }

  // Waiting for profile
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-metro-purple flex items-center justify-center">
        <div className="text-center text-white">
          <div className="brutal-card bg-white p-8 inline-block mb-4">
            <UserCheck className="w-16 h-16 animate-pulse" />
          </div>
          <p className="text-xl font-bold">Setting up your account...</p>
        </div>
      </div>
    )
  }

  // Store not selected
  if (!selectedStore) {
    return (
      <StoreSelectionModal
        onSelectStore={setSelectedStore}
        userRole={userProfile.role}
      />
    )
  }

  // Dashboard
  return (
    <Dashboard
      user={user}
      userProfile={userProfile}
      store={selectedStore}
      onLogout={handleLogout}
      onChangeStore={handleChangeStore}
    />
  )
}
