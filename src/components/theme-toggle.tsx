'use client'

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './context/theme-context';
import { useState, useRef, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, actualTheme, setTheme, mounted } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const currentIcon = theme === 'system' 
    ? Monitor 
    : theme === 'dark' 
      ? Moon 
      : Sun;

  const IconComponent = currentIcon;

  // Show a placeholder while hydrating
  if (!mounted) {
    return (
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-surface shadow-sm">
        <Sun className="w-5 h-5 text-text-muted" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="
          inline-flex items-center justify-center w-10 h-10 rounded-lg 
          border border-border 
          bg-surface 
          text-text-primary
          hover:bg-surface/80 
          transition-nh 
          shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          focus:ring-offset-ring-offset
        "
        aria-label={`Current theme: ${theme}. Click to change theme`}
        aria-expanded={showDropdown}
        aria-haspopup="menu"
      >
        <IconComponent className="h-5 w-5" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-36 bg-surface border border-border rounded-lg shadow-nh z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {themeOptions.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setShowDropdown(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-sm transition-nh text-left
                    ${isSelected 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-text-primary hover:bg-surface/80'
                    }
                  `}
                  role="menuitem"
                  aria-label={`Switch to ${option.label.toLowerCase()} theme`}
                >
                  <OptionIcon className="h-4 w-4" />
                  <span>{option.label}</span>
                  {isSelected && (
                    <span className="ml-auto text-xs text-text-muted">
                      {option.value === 'system' ? `(${actualTheme})` : '✓'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
