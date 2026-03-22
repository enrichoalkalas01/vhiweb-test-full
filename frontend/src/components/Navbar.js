"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { clearUser } from '@/redux/reducers/auth'
import Swal from 'sweetalert2'

export default function Navbar() {
    const { user, isAuthenticated } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, logout',
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user_data')
                dispatch(clearUser())
                router.push('/login')
            }
        })
    }

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo + nav links */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold text-indigo-600 tracking-tight">
                            Vhiweb
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                                Products
                            </Link>
                            {isAuthenticated && (
                                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right side – desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-500">
                                    Hi,{' '}
                                    <span className="font-semibold text-gray-900">
                                        {user?.firstname || user?.username}
                                    </span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 px-4 py-1.5 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-1.5 rounded-lg transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Hamburger – mobile */}
                    <button
                        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            }
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
                        <Link href="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                            Products
                        </Link>
                        {isAuthenticated && (
                            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                                Dashboard
                            </Link>
                        )}
                        <div className="pt-2 border-t border-gray-100">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => { setMenuOpen(false); handleLogout() }}
                                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                                        Login
                                    </Link>
                                    <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
