"use client"

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import api from '@/lib/api'

export default function DashboardPage() {
    const { user, isAuthenticated } = useSelector((state) => state.auth)
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [authChecked, setAuthChecked] = useState(false)

    // Wait for auth to hydrate from localStorage, then check
    useEffect(() => {
        const timer = setTimeout(() => {
            setAuthChecked(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (authChecked && !isAuthenticated) {
            router.push('/login')
        }
    }, [authChecked, isAuthenticated, router])

    useEffect(() => {
        if (!isAuthenticated) return

        const fetchProducts = async () => {
            setLoadingProducts(true)
            try {
                const res = await api.get('/product', {
                    params: { size: 100, sort_by: 'createdAt', order_by: 'desc' },
                })
                const all = res.data?.data || []
                // Filter by logged-in user's company name
                const mine = user?.companyname
                    ? all.filter((p) => p.ownedBy === user.companyname)
                    : []
                setProducts(mine)
            } catch (err) {
                console.error('Dashboard fetch error:', err)
            } finally {
                setLoadingProducts(false)
            }
        }

        fetchProducts()
    }, [isAuthenticated, user])

    const handleDelete = async (id, title) => {
        const result = await Swal.fire({
            title: 'Delete Product',
            text: `Delete "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        })
        if (!result.isConfirmed) return
        try {
            await api.delete(`/product/${id}`)
            setProducts((prev) => prev.filter((p) => p._id !== id))
            Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1200, showConfirmButton: false })
        } catch (err) {
            Swal.fire({ title: 'Failed', text: err?.response?.data?.message || err?.message, icon: 'error' })
        }
    }

    const formatPrice = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)

    if (!authChecked || !isAuthenticated) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        )
    }

    const initials = (user?.firstname || user?.username || 'U')[0].toUpperCase()

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* ---- Profile Card ---- */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />
                    <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-10 mb-4">
                            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                {initials}
                            </div>
                            <div className="pb-1">
                                <h1 className="text-xl font-bold text-gray-900">
                                    {user?.firstname && user?.lastname
                                        ? `${user.firstname} ${user.lastname}`
                                        : user?.username || 'User'}
                                </h1>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                            <InfoField label="Username" value={user?.username} />
                            <InfoField label="Phone" value={user?.phonenumber} />
                            <InfoField label="Company" value={user?.companyname} />
                            <InfoField label="Account Type" value={user?.typeUser || 'User'} />
                        </div>
                    </div>
                </div>

                {/* ---- Stats ---- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="My Products"
                        value={products.length}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                        }
                        color="indigo"
                    />
                    <StatCard
                        label="Total Stock"
                        value={products.reduce((s, p) => s + (p.stock ?? 0), 0)}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h7" />
                            </svg>
                        }
                        color="green"
                    />
                    <StatCard
                        label="Total Value"
                        value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact', maximumFractionDigits: 1 }).format(
                            products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0)
                        )}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="purple"
                    />
                </div>

                {/* ---- My Products ---- */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">My Products</h2>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                        </Link>
                    </div>

                    {loadingProducts ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                            <p className="text-gray-400 font-medium">No products yet</p>
                            <Link href="/" className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                                Add your first product →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <div key={product._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl" />
                                    <div className="p-5">
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                                            {product.description || 'No description'}
                                        </p>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-indigo-600 font-bold text-sm">{formatPrice(product.price)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(product.stock ?? 0) > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                Stock: {product.stock ?? 0}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/products/${product._id}`}
                                                className="flex-1 text-center text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product._id, product.title)}
                                                className="flex-1 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function InfoField({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-gray-900">{value || '-'}</p>
        </div>
    )
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    }
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}
