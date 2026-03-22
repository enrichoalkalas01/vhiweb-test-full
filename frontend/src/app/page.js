"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import Swal from 'sweetalert2'
import api from '@/lib/api'

const EMPTY_FORM = { title: '', slug: '', description: '', price: '', stock: '' }

export default function ProductsPage() {
    const { isAuthenticated } = useSelector((state) => state.auth)

    const [products, setProducts] = useState([])
    const [pagination, setPagination] = useState({ page: 1, size: 8, totalPages: 1, totalData: 0 })
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('create')
    const [editId, setEditId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)

    const fetchProducts = useCallback(async (page = 1, search = '') => {
        setLoading(true)
        try {
            const res = await api.get('/product', {
                params: {
                    page,
                    size: 8,
                    ...(search ? { query: search } : {}),
                    sort_by: 'createdAt',
                    order_by: 'desc',
                },
            })
            setProducts(res.data?.data || [])
            setPagination((prev) => ({
                ...prev,
                page,
                totalPages: res.data?.pagination?.totalPages || 1,
                totalData: res.data?.pagination?.totalData || 0,
            }))
        } catch (err) {
            console.error('Fetch products error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProducts(1, '')
    }, [fetchProducts])

    const handleSearch = (e) => {
        e.preventDefault()
        fetchProducts(1, query)
    }

    const handlePage = (p) => {
        if (p >= 1 && p <= pagination.totalPages) fetchProducts(p, query)
    }

    /* ---------- modal helpers ---------- */
    const openCreate = () => {
        setForm(EMPTY_FORM)
        setModalMode('create')
        setEditId(null)
        setShowModal(true)
    }

    const openEdit = (product) => {
        setForm({
            title: product.title || '',
            slug: product.slug || '',
            description: product.description || '',
            price: product.price ?? '',
            stock: product.stock ?? '',
        })
        setModalMode('edit')
        setEditId(product._id)
        setShowModal(true)
    }

    const handleFieldChange = (e) => {
        const { name, value } = e.target
        if (name === 'title') {
            setForm((prev) => ({
                ...prev,
                title: value,
                slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            }))
        } else {
            setForm((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const payload = {
                ...form,
                price: Number(form.price) || 0,
                stock: Number(form.stock) || 0,
            }
            if (modalMode === 'create') {
                await api.post('/product', payload)
                Swal.fire({ title: 'Success', text: 'Product created!', icon: 'success', timer: 1500, showConfirmButton: false })
            } else {
                await api.put(`/product/${editId}`, payload)
                Swal.fire({ title: 'Success', text: 'Product updated!', icon: 'success', timer: 1500, showConfirmButton: false })
            }
            setShowModal(false)
            fetchProducts(pagination.page, query)
        } catch (err) {
            Swal.fire({
                title: 'Failed',
                text: err?.response?.data?.message || err?.message,
                icon: 'error',
                confirmButtonText: 'Close',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id, title) => {
        const result = await Swal.fire({
            title: 'Delete Product',
            text: `Delete "${title}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
        })
        if (!result.isConfirmed) return
        try {
            await api.delete(`/product/${id}`)
            Swal.fire({ title: 'Deleted', icon: 'success', timer: 1200, showConfirmButton: false })
            const newPage = products.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page
            fetchProducts(newPage, query)
        } catch (err) {
            Swal.fire({ title: 'Failed', text: err?.response?.data?.message || err?.message, icon: 'error' })
        }
    }

    const formatPrice = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)

    const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2
    )

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {pagination.totalData} product{pagination.totalData !== 1 ? 's' : ''} available
                        </p>
                    </div>
                    {isAuthenticated && (
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                        </button>
                    )}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                    <input
                        type="text"
                        placeholder="Search products by title or description..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
                    >
                        Search
                    </button>
                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); fetchProducts(1, '') }}
                            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </form>

                {/* Product grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-32">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                        </svg>
                        <p className="text-gray-400 text-lg font-medium">No products found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {query ? 'Try a different search term.' : isAuthenticated ? 'Be the first to add a product!' : 'No products yet.'}
                        </p>
                        {isAuthenticated && !query && (
                            <button
                                onClick={openCreate}
                                className="mt-5 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                            >
                                <span>+</span> Add your first product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                            >
                                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl" />
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1.5">
                                            {product.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                                            {product.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-indigo-600 font-bold text-sm">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${(product.stock ?? 0) > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                Stock: {product.stock ?? 0}
                                            </span>
                                        </div>
                                        {product.ownedBy && (
                                            <p className="text-xs text-gray-400 truncate">
                                                <span className="font-medium">by</span> {product.ownedBy}
                                            </p>
                                        )}
                                        <div className="flex gap-2 pt-1">
                                            <Link
                                                href={`/products/${product._id}`}
                                                className="flex-1 text-center text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                Detail
                                            </Link>
                                            {isAuthenticated && (
                                                <>
                                                    <button
                                                        onClick={() => openEdit(product)}
                                                        className="flex-1 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id, product.title)}
                                                        className="flex-1 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-10">
                        <button
                            onClick={() => handlePage(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Prev
                        </button>
                        {pages.map((p, idx) => (
                            <span key={p} className="flex items-center gap-1.5">
                                {idx > 0 && pages[idx - 1] !== p - 1 && (
                                    <span className="px-1 text-gray-400 text-sm">…</span>
                                )}
                                <button
                                    onClick={() => handlePage(p)}
                                    className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${p === pagination.page
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {p}
                                </button>
                            </span>
                        ))}
                        <button
                            onClick={() => handlePage(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* ============ Create / Edit Modal ============ */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleFieldChange}
                                    required
                                    placeholder="Product title"
                                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                                <input
                                    name="slug"
                                    value={form.slug}
                                    onChange={handleFieldChange}
                                    placeholder="auto-generated from title"
                                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleFieldChange}
                                    rows={3}
                                    placeholder="Product description..."
                                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (IDR)</label>
                                    <input
                                        name="price"
                                        value={form.price}
                                        onChange={handleFieldChange}
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                                    <input
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleFieldChange}
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2.5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
