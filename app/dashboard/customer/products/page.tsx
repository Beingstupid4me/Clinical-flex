'use client'

import { useEffect, useMemo, useState } from 'react'

interface ProductRow {
  ProductID: number
  Product_Name: string
  SKU: string | null
  Manufacturer: string | null
  Strength: string | null
  DosageForm: string | null
  IsPrescriptionRequired: boolean
  MinPrice: number | null
  TotalStock: number
}

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  prescription: boolean
}

const CART_KEY = 'customerCart'

export default function CustomerProductsPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'OTC' | 'Prescription'>('ALL')
  const [products, setProducts] = useState<ProductRow[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (query.trim()) {
        params.set('query', query.trim())
      }
      params.set('type', filter)

      const response = await fetch(`/api/customer/products?${params.toString()}`)
      const payload = await response.json()

      if (!response.ok) {
        setError(payload.error || 'Failed to load products')
        return
      }

      setProducts(payload.data || [])
    } catch (err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const addToCart = (product: ProductRow) => {
    const quantity = quantities[product.ProductID] ?? 1
    if (!product.MinPrice || quantity <= 0) {
      return
    }

    const raw = localStorage.getItem(CART_KEY)
    const existing: CartItem[] = raw ? JSON.parse(raw) : []
    const current = existing.find((row) => row.productId === product.ProductID)

    if (current) {
      current.quantity += quantity
    } else {
      existing.push({
        productId: product.ProductID,
        name: product.Product_Name,
        price: product.MinPrice,
        quantity,
        prescription: product.IsPrescriptionRequired,
      })
    }

    localStorage.setItem(CART_KEY, JSON.stringify(existing))
    setMessage(`${product.Product_Name} added to cart`)
    setTimeout(() => setMessage(''), 1500)
  }

  const filtered = useMemo(() => {
    return products.filter((item) => {
      const type = item.IsPrescriptionRequired ? 'Prescription' : 'OTC'
      const matchText = item.Product_Name.toLowerCase().includes(query.toLowerCase())
      const matchType = filter === 'ALL' || type === filter
      return matchText && matchType
    })
  }, [products, query, filter])

  return (
    <div className="space-y-5">
      <section className="cf-card">
        <h2 className="text-xl font-semibold text-slate-900">Find your meds quick</h2>
        <p className="mt-1 text-sm text-slate-600">Live product list from MySQL inventory. Search and add items to cart.</p>

        {error && <p className="mt-3 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-3 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{message}</p>}

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Drug Name"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#8EC641]"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'ALL' | 'OTC' | 'Prescription')}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="OTC">OTC</option>
            <option value="Prescription">Prescription</option>
          </select>
          <button onClick={loadProducts} className="rounded-md bg-[#8EC641] px-4 py-2 text-sm font-semibold text-white">Check</button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {loading && <p className="text-sm text-slate-600">Loading products...</p>}
        {!loading && filtered.length === 0 && (
          <article className="cf-card md:col-span-2">
            <p className="text-sm text-slate-600">No products found for current filters.</p>
          </article>
        )}
        {filtered.map((item) => (
          <article key={item.ProductID} className="cf-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{item.Product_Name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {item.IsPrescriptionRequired ? 'Prescription medicine' : 'OTC medicine'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.Manufacturer || 'Unknown Manufacturer'}
                  {item.Strength ? ` • ${item.Strength}` : ''}
                </p>
              </div>
              <span className={`cf-chip ${item.IsPrescriptionRequired ? 'bg-amber-100 text-amber-700' : ''}`}>
                {item.IsPrescriptionRequired ? 'Prescription' : 'OTC'}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-600">Stock: {item.TotalStock}</span>
              <span className="font-semibold text-slate-900">Rs. {item.MinPrice ?? '--'}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={item.TotalStock}
                value={quantities[item.ProductID] ?? 1}
                onChange={(e) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [item.ProductID]: Number(e.target.value),
                  }))
                }
                className="w-20 rounded-md border border-slate-300 px-2 py-2 text-sm"
              />
              <button
                onClick={() => addToCart(item)}
                className="w-full rounded-md bg-[#0f644c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a4b39]"
              >
              Add to cart
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
