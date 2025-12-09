'use client'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation';

type SearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    /** Optional handler when Enter is pressed. If provided, it will be called instead of the default navigation. */
    onEnter?: (value: string) => void;
};

export default function SearchInput({ value, onChange, onEnter }: SearchInputProps) {
    const router = useRouter();
    function handleKeyDown(e : React.KeyboardEvent<HTMLInputElement>) {
        if(e.key === "Enter" && value && value.trim() !== "") {
            if (onEnter) {
                onEnter(value);
            } else {
                router.push("/search?q="+encodeURIComponent(value));
            }
        }
    }
    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    onChange={e=>onChange(e.target.value)} 
                    value={value} 
                    onKeyDown={handleKeyDown} 
                    placeholder="Search for jobs…"
                    className="nh-input w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh relative z-10 bg-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted z-0 pointer-events-none" />
            </div>
        </div>
    )
}