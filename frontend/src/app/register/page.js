"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Swal from 'sweetalert2'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        username: '',
        firstname: '',
        lastname: '',
        phonenumber: '',
        email: '',
        companyname: '',
        password: '',
    })

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios({
                url: `${process.env.NEXT_PUBLIC_BASE_URL_API}/authentication/register`,
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(form),
            })

            Swal.fire({
                title: 'Account Created!',
                text: response?.data?.message,
                icon: 'success',
                timer: 1800,
                showConfirmButton: false,
            })

            setTimeout(() => router.push('/login'), 1800)
        } catch (error) {
            const message = error?.response?.data?.message || error?.message
            Swal.fire({ title: 'Registration Failed', text: message, icon: 'error', confirmButtonText: 'Close' })
        } finally {
            setLoading(false)
        }
    }

    const fields = [
        { name: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username', autoComplete: 'username' },
        { name: 'firstname', label: 'First Name', type: 'text', placeholder: 'Your first name', autoComplete: 'given-name' },
        { name: 'lastname', label: 'Last Name', type: 'text', placeholder: 'Your last name', autoComplete: 'family-name' },
        { name: 'phonenumber', label: 'Phone Number', type: 'tel', placeholder: '08xxxxxxxxxx', autoComplete: 'tel' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
        { name: 'companyname', label: 'Company Name', type: 'text', placeholder: 'Your company or brand', autoComplete: 'organization' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters', autoComplete: 'new-password' },
    ]

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
                    <p className="text-sm text-gray-500 mt-1">Join Vhiweb today</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        {fields.map(({ name, label, type, placeholder, autoComplete }) => (
                            <div key={name}>
                                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {label} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id={name}
                                    name={name}
                                    type={type}
                                    required
                                    value={form[name]}
                                    onChange={handleChange}
                                    autoComplete={autoComplete}
                                    placeholder={placeholder}
                                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        ))}

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
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Sign in here
                    </a>
                </p>
            </div>
        </div>
    )
}
