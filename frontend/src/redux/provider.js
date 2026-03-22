"use client"

import { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { Store } from './store'
import { setUser } from './reducers/auth'

function AuthInitializer({ children }) {
    const dispatch = useDispatch()

    useEffect(() => {
        const raw = localStorage.getItem('user_data')
        if (raw) {
            try {
                dispatch(setUser(JSON.parse(raw)))
            } catch {
                localStorage.removeItem('user_data')
            }
        }
    }, [dispatch])

    return children
}

export function Providers({ children }) {
    return (
        <Provider store={Store}>
            <AuthInitializer>
                {children}
            </AuthInitializer>
        </Provider>
    )
}
