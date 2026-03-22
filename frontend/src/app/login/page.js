"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import axios from "axios"
import Swal from 'sweetalert2'
import { setUser } from "@/redux/reducers/auth"

export default function LoginPage() {
    const dispatch = useDispatch()
    const router = useRouter()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleForm = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await axios({
                url: `${process.env.NEXT_PUBLIC_BASE_URL_API}/authentication/login`,
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ username, password }),
            })

            const data = response?.data?.data
            const token = data?.token

            // Persist tokens
            localStorage.setItem('access_token', token?.access_token || '')
            localStorage.setItem('refresh_token', token?.refresh_token || '')

            // Persist user info (without token) and hydrate Redux
            const { token: _token, ...userInfo } = data
            localStorage.setItem('user_data', JSON.stringify(userInfo))
            dispatch(setUser(userInfo))

            Swal.fire({
                title: 'Welcome back!',
                text: `Hi, ${userInfo?.firstname || userInfo?.username}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            })

            setTimeout(() => router.push('/'), 1500)
        } catch (error) {
            const message = error?.response?.data?.message || error?.message
            Swal.fire({ title: 'Login Failed', text: message, icon: 'error', confirmButtonText: 'Try Again' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
                    <p className="text-sm text-gray-500 mt-1">Welcome back to Vhiweb</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <form onSubmit={handleForm} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Username or Email
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                placeholder="Enter your username or email"
                                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-500 active:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Register here
                    </a>
                </p>
            </div>
        </div>
    )
}
