'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  prescription: boolean
}

const CART_KEY = 'customerCart'

export default function CustomerCheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const userRaw = localStorage.getItem('currentUser')
    const cartRaw = localStorage.getItem(CART_KEY)

    if (userRaw) {
      const parsed = JSON.parse(userRaw) as { UserID?: number }
      setCustomerId(parsed.UserID ?? null)
    }

    if (cartRaw) {
      setCartItems(JSON.parse(cartRaw) as CartItem[])
    }
  }, [])

  const syncCart = (next: CartItem[]) => {
    setCartItems(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cartItems]
  )

  const placeOrder = async () => {
    if (!customerId) {
      setError('Customer session not found. Please login again.')
      return
    }
    if (cartItems.length === 0) {
      setError('Cart is empty.')
      return
    }

    try {
      setPlacingOrder(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to place order')
        return
      }

      localStorage.removeItem(CART_KEY)
      setCartItems([])
      setSuccess(`Order placed successfully. Order ID: ${payload.data.orderId}`)
    } catch (err) {
      setError('Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="space-y-4 lg:col-span-2">
        <article className="cf-card">
          <h2 className="text-xl font-semibold text-slate-900">Checkout</h2>
          <p className="mt-1 text-sm text-slate-600">This flow creates Order, OrderItems, inventory deduction, and inventory transactions in MySQL.</p>
          {error && <p className="mt-3 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
          {success && <p className="mt-3 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{success}</p>}
        </article>

        <article className="cf-card">
          <h3 className="text-lg font-semibold text-slate-900">Cart Items</h3>
          {cartItems.length === 0 && (
            <p className="mt-3 text-sm text-slate-600">Your cart is empty. Add products from the products page.</p>
          )}
          <div className="mt-4 space-y-3">
            {cartItems.map((item, index) => (
              <div key={item.productId} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          const next = [...cartItems]
                          next[index] = {
                            ...next[index],
                            quantity: Math.max(1, next[index].quantity - 1),
                          }
                          syncCart(next)
                        }}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        -
                      </button>
                      <span className="text-sm text-slate-600">Qty: {item.quantity}</span>
                      <button
                        onClick={() => {
                          const next = [...cartItems]
                          next[index] = {
                            ...next[index],
                            quantity: next[index].quantity + 1,
                          }
                          syncCart(next)
                        }}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">Rs. {item.price * item.quantity}</p>
                    {item.prescription && <span className="cf-chip bg-amber-100 text-amber-700">Prescription Required</span>}
                    <button
                      onClick={() => syncCart(cartItems.filter((_, i) => i !== index))}
                      className="mt-2 block w-full rounded border border-rose-200 px-2 py-1 text-xs text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <aside className="space-y-4">
        <article className="cf-card">
          <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Items</span><span>{cartItems.length}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>Rs. 40</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900"><span>Total</span><span>Rs. {total + 40}</span></div>
          </div>
          <button
            onClick={placeOrder}
            disabled={placingOrder || cartItems.length === 0}
            className="mt-4 w-full rounded-md bg-[#8EC641] px-4 py-2 text-sm font-semibold text-white hover:bg-[#79ae35] disabled:opacity-50"
          >
            {placingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </article>

        <article className="cf-card">
          <h3 className="text-lg font-semibold text-slate-900">Need prescriptions?</h3>
          <p className="mt-1 text-sm text-slate-600">Review your valid prescription records before placing the order.</p>
          <Link href="/dashboard/customer/prescriptions" className="mt-3 inline-block rounded-md bg-[#0f644c] px-3 py-2 text-sm font-semibold text-white">
            Open Prescriptions
          </Link>
        </article>
      </aside>
    </div>
  )
}
