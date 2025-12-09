'use client'

import FilterSidebar from "@/components/filter-side-bar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-start px-10 gap-10 max-h-[90vh] overflow-hidden ">
            <FilterSidebar onTypeChange={() => {}} />
            {children}
        </div>
    )
}