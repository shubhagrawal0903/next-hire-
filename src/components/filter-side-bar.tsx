'use client'
import { useState } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

type FilterSidebarProps = {
    onTypeChange: (type: string) => void;
};

export default function FilterSidebar({ onTypeChange }: FilterSidebarProps) {
    const [open, setOpen] = useState(true);
    const [selectedType, setSelectedType] = useState("");

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        onTypeChange(type);
    };

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border bg-surface/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-primary font-semibold">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                </div>
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden text-text-muted hover:text-text-primary"
                >
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Filter Content */}
            <div className={`${open ? 'block' : 'hidden md:block'} p-4 animate-in fade-in slide-in-from-top-2 duration-200`}>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-text-primary mb-3">Employment Type</h3>
                        <div className="space-y-2">
                            {[
                                { value: "", label: "All Types" },
                                { value: "Full-time", label: "Full Time" },
                                { value: "Part-time", label: "Part Time" },
                                { value: "Internship", label: "Internship" }
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`
                                        flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border
                                        ${selectedType === option.value
                                            ? 'bg-primary/5 border-primary/20'
                                            : 'hover:bg-surface border-transparent'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-4 h-4 rounded-full border flex items-center justify-center
                                            ${selectedType === option.value
                                                ? 'border-primary bg-primary'
                                                : 'border-input-border'
                                            }
                                        `}>
                                            {selectedType === option.value && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                            )}
                                        </div>
                                        <span className={`text-sm ${selectedType === option.value ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                                            {option.label}
                                        </span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="employment-type"
                                        value={option.value}
                                        checked={selectedType === option.value}
                                        onChange={() => handleTypeChange(option.value)}
                                        className="hidden"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Placeholder for future filters */}
                    <div className="pt-4 border-t border-border mt-4">
                        <p className="text-xs text-text-muted text-center">
                            More filters coming soon
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}