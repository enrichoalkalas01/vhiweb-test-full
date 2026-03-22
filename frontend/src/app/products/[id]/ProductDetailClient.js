"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import Swal from 'sweetalert2'
import api from '@/lib/api'

const EMPTY_FORM = { title: '', slug: '', description: '', price: '', stock: '' }

export default function ProductDetailClient() {
    const { id } = useParams()
    const router = useRouter()
    const { isAuthenticated } = useSelector((state) => state.auth)

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showEdit, setShowEdit] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/product/${id}`)
                setProduct(res.data?.data)
            } catch {
                Swal.fire({ title: 'Error', text: 'Product not found', icon: 'error' }).then(() => router.push('/'))
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchProduct()
    }, [id, router])

    const openEdit = () => {
        setForm({
            title: product.title || '',
            slug: product.slug || '',
            description: product.description || '',
            price: product.price ?? '',
            stock: product.stock ?? '',
        })
        setShowEdit(true)
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

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const payload = { ...form, price: Number(form.price) || 0, stock: Number(form.stock) || 0 }
            await api.put(`/product/${id}`, payload)
            Swal.fire({ title: 'Updated!', icon: 'success', timer: 1200, showConfirmButton: false })
            setProduct((prev) => ({ ...prev, ...payload }))
            setShowEdit(false)
        } catch (err) {
            Swal.fire({ title: 'Failed', text: err?.response?.data?.message || err?.message, icon: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Delete Product',
            text: `Delete "${product?.title}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
        })
        if (!result.isConfirmed) return
        try {
            await api.delete(`/product/${id}`)
            Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1200, showConfirmButton: false }).then(() => router.push('/'))
        } catch (err) {
            Swal.fire({ title: 'Failed', text: err?.response?.data?.message || err?.message, icon: 'error' })
        }
    }

    const formatPrice = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        )
    }

    if (!product) return null

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex items-center gap-2 text-sm mb-6">
                    <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Products
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600 truncate max-w-xs">{product.title}</span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <div className="p-8">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                            <span className={`shrink-0 text-sm px-3 py-1 rounded-full font-medium ${(product.stock ?? 0) > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                Stock: {product.stock ?? 0}
                            </span>
                        </div>

                        {product.slug && (
                            <p className="text-xs text-gray-400 mb-6 font-mono">/{product.slug}</p>
                        )}

                        <div className="mb-8">
                            <p className="text-3xl font-bold text-indigo-600">{formatPrice(product.price)}</p>
                        </div>

                        {product.description && (
                            <div className="mb-8">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Description</h3>
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                            {product.relation?.companyname && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Company</p>
                                    <p className="text-sm font-semibold text-gray-900">{product.relation.companyname}</p>
                                </div>
                            )}
                            {product.relation?.createdBy && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Created by</p>
                                    <p className="text-sm font-semibold text-gray-900">{product.relation.createdBy}</p>
                                </div>
                            )}
                            {product.relation?.updatedBy && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Last updated by</p>
                                    <p className="text-sm font-semibold text-gray-900">{product.relation.updatedBy}</p>
                                </div>
                            )}
                        </div>

                        {isAuthenticated && (
                            <div className="flex gap-3">
                                <button
                                    onClick={openEdit}
                                    className="flex-1 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2.5 rounded-lg transition-colors"
                                >
                                    Edit Product
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2.5 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showEdit && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowEdit(false) }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
                            <button
                                onClick={() => setShowEdit(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                                <input name="title" value={form.title} onChange={handleFieldChange} required
                                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                                <input name="slug" value={form.slug} onChange={handleFieldChange}
                                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea name="description" value={form.description} onChange={handleFieldChange}
                                    rows={3} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (IDR)</label>
                                    <input name="price" value={form.price} onChange={handleFieldChange} type="number" min="0"
                                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                                    <input name="stock" value={form.stock} onChange={handleFieldChange} type="number" min="0"
                                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowEdit(false)}
                                    className="flex-1 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2.5 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
