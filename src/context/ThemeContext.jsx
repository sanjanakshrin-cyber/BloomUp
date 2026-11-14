// src/context/ThemeContext.jsx
// ─────────────────────────────────────────────────────────────
// BloomUp Theme Context
//
// This file does three things:
//   1. Creates a React Context that holds the current theme.
//   2. Provides a ThemeProvider component that wraps the app
//      so every component can read and change the theme.
//   3. Exports a useTheme hook so components can access the
//      theme without importing the Context object directly.
//
// Usage in main.jsx:
//   import { ThemeProvider } from './context/ThemeContext'
//   <ThemeProvider><App /></ThemeProvider>
//
// Usage in any component:
//   import { useTheme } from '../context/ThemeContext'
//   const { theme, toggleTheme } = useTheme()
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react'

// ─── Constants ───────────────────────────────────────────────

// The two valid theme values. Using constants avoids typos.
const LIGHT = 'light'
const DARK  = 'dark'

// The key we use to save the theme in the browser's localStorage.
// localStorage.setItem(STORAGE_KEY, 'dark') saves "dark" under this key.
const STORAGE_KEY = 'bloomup-theme'

// ─── Helper: read theme from localStorage ────────────────────

/**
 * Reads the saved theme from localStorage.
 * Returns 'light' or 'dark'. Falls back to 'light' when:
 *   - localStorage has never been set (returns null)
 *   - the saved value is not 'light' or 'dark' (corrupted data)
 *   - localStorage is blocked (private browsing on some browsers)
 */
function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    // Only accept exactly 'light' or 'dark'. Anything else is ignored.
    if (saved === LIGHT || saved === DARK) {
      return saved
    }

    // No saved value yet — check the user's OS preference as a
    // sensible first-visit default before falling back to light.
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches

    return prefersDark ? DARK : LIGHT
  } catch {
    // localStorage can throw in certain restricted environments.
    // Silently fall back to light so the app still works.
    return LIGHT
  }
}

// ─── Helper: apply theme to the HTML element ─────────────────

/**
 * Writes data-theme="light" or data-theme="dark" onto <html>.
 * Our CSS in tokens.css uses [data-theme="light"] and
 * [data-theme="dark"] selectors to swap all CSS variables.
 */
function applyThemeToDOM(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

// ─── Helper: save theme to localStorage ──────────────────────

/**
 * Persists the chosen theme so the next page load restores it.
 * Wrapped in try/catch in case storage is unavailable.
 */
function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage blocked — the theme still works for this session,
    // it just won't be remembered after a page refresh.
  }
}

// ─── 1. Create the Context ────────────────────────────────────

// ThemeContext holds the value that ThemeProvider will share.
// The default value here is only used if a component reads the
// context without a ThemeProvider above it in the tree — which
// shouldn't happen in BloomUp, but it's good practice to set
// sensible defaults anyway.
const ThemeContext = createContext(null)

// ─── 2. ThemeProvider Component ──────────────────────────────

/**
 * Wrap your entire app with <ThemeProvider> so every component
 * inside it can call useTheme() to read or change the theme.
 *
 * Example in main.jsx:
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 */
export function ThemeProvider({ children }) {
  const initialTheme = getSavedTheme()
  document.documentElement.setAttribute('data-theme', initialTheme)
  const [theme, setThemeState] = useState(initialTheme)

  // ── Sync to DOM whenever theme changes ────────────────────
  // useEffect runs after every render where `theme` changed.
  // It updates the HTML attribute and saves to localStorage.
  useEffect(() => {
    applyThemeToDOM(theme)
    saveTheme(theme)
  }, [theme]) // ← only re-runs when `theme` changes

  // ── Actions ───────────────────────────────────────────────

  /**
   * toggleTheme — switches between light and dark.
   * Call this from a button in your Topbar or Sidebar.
   *
   * Example:
   *   <button onClick={toggleTheme}>Toggle</button>
   */
  function toggleTheme() {
    setThemeState(current => (current === LIGHT ? DARK : LIGHT))
  }

  /**
   * setTheme — set the theme to a specific value.
   * Useful when you want explicit "Light" and "Dark" buttons.
   * Ignores any value that isn't 'light' or 'dark'.
   *
   * Example:
   *   <button onClick={() => setTheme('dark')}>Dark mode</button>
   */
  function setTheme(newTheme) {
    if (newTheme !== LIGHT && newTheme !== DARK) {
      // Silently ignore invalid values so the app stays stable.
      console.warn(
        `[BloomUp] setTheme received an invalid value: "${newTheme}". ` +
        `Expected "light" or "dark". Ignoring.`
      )
      return
    }
    setThemeState(newTheme)
  }

  // ── Context value ─────────────────────────────────────────
  // This object is what every useTheme() call will receive.
  const value = {
    theme,        // 'light' | 'dark'  — read the current theme
    toggleTheme,  // () => void        — flip between light/dark
    setTheme,     // (theme) => void   — set a specific theme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── 3. useTheme Hook ─────────────────────────────────────────

/**
 * useTheme — the hook every component uses to access the theme.
 *
 * Returns:
 *   theme        — the current theme string: 'light' or 'dark'
 *   toggleTheme  — function to flip between light and dark
 *   setTheme     — function to set a specific theme
 *
 * Throws a helpful error if used outside of <ThemeProvider>,
 * which makes debugging much easier for beginners.
 *
 * Example:
 *   const { theme, toggleTheme } = useTheme()
 *   const isDark = theme === 'dark'
 */
export function useTheme() {
  const context = useContext(ThemeContext)

  // If context is undefined, the hook was called outside of
  // ThemeProvider. Surface a clear error message instead of a
  // confusing "cannot read property of undefined" crash.
  if (!context) {
    throw new Error(
      '[BloomUp] useTheme() must be used inside a <ThemeProvider>. ' +
      'Make sure you have wrapped your app with <ThemeProvider> in main.jsx.'
    )
  }

  return context
}
