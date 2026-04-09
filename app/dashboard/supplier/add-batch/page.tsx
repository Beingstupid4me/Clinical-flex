'use client'

import { useEffect, useState } from 'react'

interface ProductOption {
  ProductID: number
  Product_Name: string
  SKU: string | null
  DosageForm: string | null
}

export default function SupplierAddBatchPage() {
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productId, setProductId] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [purchasePrice, setPurchasePrice] = useState(0)
  const [sellingPrice, setSellingPrice] = useState(0)
  const [batchNumber, setBatchNumber] = useState('')
  const [manufactureDate, setManufactureDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const run = async () => {
      const raw = localStorage.getItem('currentUser')
      if (!raw) {
        setError('Please login again')
        return
      }
      const user = JSON.parse(raw) as { UserID?: number }
      setSupplierId(user.UserID ?? null)

      const response = await fetch('/api/supplier/products')
      const payload = await response.json()
      if (response.ok) {
        setProducts(payload.data || [])
      }
    }

    void run()
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!supplierId) {
      setError('Supplier session not found')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/supplier/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          productId,
          quantity,
          unitPrice: purchasePrice,
          sellingPrice,
          batchNumber,
          manufacturerDate: manufactureDate,
          expiryDate,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to add batch')
        return
      }

      setMessage(`Batch received successfully (Batch ${payload.data.batchId})`)
      setProductId(0)
      setQuantity(1)
      setPurchasePrice(0)
      setSellingPrice(0)
      setBatchNumber('')
      setManufactureDate('')
      setExpiryDate('')
    } catch (err) {
      setError('Failed to add batch')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Receive New Inventory Batch</h2>
      <p className="mt-1 text-sm text-slate-600">Add a new batch and update inventory stock in one transaction.</p>

      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{message}</p>}

      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">Product</span>
          <select value={productId} onChange={(e) => setProductId(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2" required>
            <option value={0}>Select product</option>
            {products.map((product) => (
              <option key={product.ProductID} value={product.ProductID}>
                {product.Product_Name} ({product.DosageForm || 'General'})
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Batch Number</span>
          <input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Quantity</span>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Unit Price</span>
          <input type="number" min={0.01} step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Selling Price</span>
          <input type="number" min={0} step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Manufacture Date</span>
          <input type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Expiry Date</span>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>

        <div className="md:col-span-2">
          <button disabled={submitting} className="rounded-md bg-[#8EC641] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Receive Batch'}
          </button>
        </div>
      </form>
    </div>
  )
}
