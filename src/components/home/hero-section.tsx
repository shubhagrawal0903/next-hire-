"use client"

import { Search, MapPin, Briefcase } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function HeroSection() {
    const [searchValue, setSearchValue] = useState("")
    const router = useRouter()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchValue.trim()) {
            router.push(`/?search=${encodeURIComponent(searchValue.trim())}`)
        } else {
            router.push("/")
        }
    }

    return (
        <div className="relative overflow-hidden bg-surface border-b border-border">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl opacity-50" />
                <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl opacity-50" />
            </div>

            <div className="container relative mx-auto px-4 py-16 md:py-24 max-w-screen-2xl">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary">
                            Find your <span className="text-text-primary">dream job</span> <br />
                            with confidence
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                            Connect with top companies and uncover opportunities that match your skills and aspirations.
                        </p>
                    </div>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
                        <div className="relative flex items-center bg-card shadow-lg rounded-full border border-border p-2 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 group-hover:shadow-xl">
                            <div className="pl-4 text-muted-foreground flex items-center pointer-events-none">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Job title, keywords, or company..."
                                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-text-primary placeholder:text-muted-foreground h-12"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all active:scale-95"
                            >
                                Search Jobs
                            </button>
                            <button
                                type="submit"
                                className="sm:hidden bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-all"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>


                    </form>



                </div>
            </div>
        </div>
    )
}
