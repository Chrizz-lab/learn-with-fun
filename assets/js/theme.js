/**
 * Theme Toggle System
 * Speichert die Auswahl im localStorage
 */

(function() {
    'use strict';
    
    const THEME_KEY = 'aufgabentool-theme';
    const DARK = 'dark';
    const LIGHT = 'light';
    
    // Theme aus localStorage laden oder System-Präferenz nutzen
    function getStoredTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) return stored;
        
        // System-Präferenz prüfen
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return LIGHT;
        }
        return DARK;
    }
    
    // Theme setzen
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }
    
    // Theme umschalten
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === DARK ? LIGHT : DARK;
        setTheme(newTheme);
    }
    
    // Initial Theme setzen
    setTheme(getStoredTheme());
    
    // Event Listener für Toggle Button
    document.addEventListener('DOMContentLoaded', function() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
    });
    
    // Auf System-Änderungen reagieren
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem(THEME_KEY)) {
                setTheme(e.matches ? DARK : LIGHT);
            }
        });
    }
})();
