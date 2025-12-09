'use client'
import { useThemeContext } from './context/theme-context';

export default function ThemeDebug() {
  const { isDark, mounted } = useThemeContext();

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
      Theme: {isDark ? 'Dark' : 'Light'} | HTML Class: {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
    </div>
  );
}