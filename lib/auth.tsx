"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
    id: string
    username: string
}

interface AuthContextType {
    user: User | null
    login: (token: string, user: User) => void
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check local storage for mock session on load
        const token = localStorage.getItem("iris_token")
        const savedUser = localStorage.getItem("iris_user")

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                console.error("Failed to parse user session", e)
            }
        }
        setIsLoading(false)
    }, [])

    const login = (token: string, user: User) => {
        localStorage.setItem("iris_token", token)
        localStorage.setItem("iris_user", JSON.stringify(user))
        setUser(user)
        router.push("/")
    }

    const logout = () => {
        localStorage.removeItem("iris_token")
        localStorage.removeItem("iris_user")
        setUser(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
