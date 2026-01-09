/**
 * Settings Modal & Storage System
 */

(function() {
    'use strict';
    
    const STORAGE_KEY = 'aufgabentool-settings';
    
    // Default Settings mit umfangreichen Prompts
    const defaultSettings = {
        apiKey: '',
        modelVision: 'gpt-4o',
        modelText: 'gpt-4o',
        topics: [],
        promptFullText: `Du bist ein Experte für das Erfassen und Transkribieren von Aufgaben aus Dokumenten.

DEINE AUFGABE:
Analysiere das folgende Bild/PDF und extrahiere den VOLLSTÄNDIGEN TEXT aller Aufgaben, die du findest.

WICHTIGE REGELN:
1. Gib den Text EXAKT so wieder, wie er im Dokument steht
2. Behalte die originale Nummerierung bei (1., 2., a), b), etc.)
3. Übernimm alle Formeln, Zahlen und Sonderzeichen korrekt
4. Behalte Absätze und Strukturierung bei
5. Wenn Bilder/Grafiken Teil der Aufgabe sind, beschreibe diese kurz in [eckigen Klammern]
6. Ignoriere Kopf-/Fußzeilen, Seitenzahlen und irrelevante Randinformationen

FORMAT DER AUSGABE:
- Jede Aufgabe mit ihrer originalen Nummer
- Vollständiger Wortlaut
- Unteraufgaben eingerückt darstellen`,

        promptCore: `Wandle die Textaufgaben in einfache mathematische Rechnungen um.

REGELN:
- KEIN LaTeX (kein \\text, kein \\frac, keine \\( \\) Klammern)
- Nur einfache Zeichen: × ÷ + - = ( )
- Kurz und simpel halten
- Nummerierung beibehalten

BEISPIELE:
"3 Äpfel für je 2€" → 3 × 2 = ?
"100km in 2h Geschwindigkeit" → 100 ÷ 2 = ?
"25% von 80" → 80 × 0,25 = ?
"15 Mann Vorrat für 40 Tage, wie lange für 8 Mann?" → (15 × 40) ÷ 8 = ?

Schreibe für jede Aufgabe NUR die einfache Rechnung:`,

        promptTransform: `Du bist ein Experte für das Umwandeln von Aufgaben in andere Themengebiete.

DEINE AUFGABE:
Wandle die gegebene Aufgabe in das neue Themengebiet um. Behalte dabei die mathematische Struktur und Schwierigkeit bei, aber ändere den Kontext komplett.

REGELN:
1. Die mathematische Rechnung/Logik muss IDENTISCH bleiben
2. Nur der Kontext/die Geschichte ändert sich
3. Die Zahlen können gleich bleiben oder sinnvoll angepasst werden
4. Die neue Aufgabe muss zum Themengebiet passen
5. Formuliere eine vollständige, gut lesbare Textaufgabe

BEISPIEL:
Original (Schiff): "Ein Schiff mit 15 Mann hat Vorrat für 40 Tage. Wie lange reicht er für 8 Mann?"
Thema "Kochen": "Ein Rezept für 15 Personen benötigt 40 Eier. Wie viele Eier braucht man für 8 Personen?"

Gib NUR die neue Aufgabe aus, ohne Erklärungen.`
    };
    
    // DOM Elements
    let modal, settingsBtn, modalClose, modalCancel, modalSave;
    let apiKeyInput, toggleApiKeyBtn, tagsContainer, newTagInput, addTagBtn;
    let promptFullTextarea, promptCoreTextarea, promptTransformTextarea;
    let modelVisionSelect, modelTextSelect;
    
    // Current settings state
    let currentSettings = { ...defaultSettings };
    
    /**
     * Load settings from localStorage
     */
    function loadSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                currentSettings = { ...defaultSettings, ...parsed };
            }
        } catch (e) {
            console.error('Fehler beim Laden der Einstellungen:', e);
        }
        return currentSettings;
    }
    
    /**
     * Save settings to localStorage
     */
    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
            return true;
        } catch (e) {
            console.error('Fehler beim Speichern der Einstellungen:', e);
            return false;
        }
    }
    
    /**
     * Open modal
     */
    function openModal() {
        loadSettings();
        populateForm();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close modal
     */
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    /**
     * Populate form with current settings
     */
    function populateForm() {
        apiKeyInput.value = currentSettings.apiKey;
        promptFullTextarea.value = currentSettings.promptFullText;
        promptCoreTextarea.value = currentSettings.promptCore;
        if (promptTransformTextarea) {
            promptTransformTextarea.value = currentSettings.promptTransform;
        }
        if (modelVisionSelect) {
            modelVisionSelect.value = currentSettings.modelVision || 'gpt-4o';
        }
        if (modelTextSelect) {
            modelTextSelect.value = currentSettings.modelText || 'gpt-4o';
        }
        renderTags();
    }
    
    /**
     * Render topic tags
     */
    function renderTags() {
        tagsContainer.innerHTML = '';
        
        if (currentSettings.topics.length === 0) {
            tagsContainer.innerHTML = '<span class="settings-hint" style="margin: 0;">Noch keine Themengebiete hinzugefügt</span>';
            return;
        }
        
        currentSettings.topics.forEach((topic, index) => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `
                ${escapeHtml(topic)}
                <button class="tag-remove" data-index="${index}" aria-label="Entfernen">×</button>
            `;
            tagsContainer.appendChild(tag);
        });
    }
    
    /**
     * Add a new topic
     */
    function addTopic() {
        const topic = newTagInput.value.trim();
        
        if (!topic) return;
        
        // Check for duplicates
        if (currentSettings.topics.includes(topic)) {
            newTagInput.classList.add('shake');
            setTimeout(() => newTagInput.classList.remove('shake'), 500);
            return;
        }
        
        currentSettings.topics.push(topic);
        newTagInput.value = '';
        renderTags();
        newTagInput.focus();
    }
    
    /**
     * Remove a topic by index
     */
    function removeTopic(index) {
        currentSettings.topics.splice(index, 1);
        renderTags();
    }
    
    /**
     * Toggle API key visibility
     */
    function toggleApiKeyVisibility() {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        toggleApiKeyBtn.innerHTML = isPassword 
            ? `<svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
               </svg>`
            : `<svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
               </svg>`;
    }
    
    /**
     * Save form values to settings
     */
    function saveForm() {
        currentSettings.apiKey = apiKeyInput.value.trim();
        currentSettings.promptFullText = promptFullTextarea.value.trim() || defaultSettings.promptFullText;
        currentSettings.promptCore = promptCoreTextarea.value.trim() || defaultSettings.promptCore;
        if (promptTransformTextarea) {
            currentSettings.promptTransform = promptTransformTextarea.value.trim() || defaultSettings.promptTransform;
        }
        if (modelVisionSelect) {
            currentSettings.modelVision = modelVisionSelect.value;
        }
        if (modelTextSelect) {
            currentSettings.modelText = modelTextSelect.value;
        }
        
        if (saveSettings()) {
            closeModal();
            showToast('Einstellungen gespeichert!');
        } else {
            showToast('Fehler beim Speichern!', 'error');
        }
    }
    
    /**
     * Show a toast notification
     */
    function showToast(message, type = 'success') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: ${type === 'success' ? 'var(--accent-primary)' : '#ef4444'};
            color: white;
            border-radius: 8px;
            font-weight: 500;
            z-index: 2000;
            animation: toastIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Get settings (for use by other modules)
     */
    window.getSettings = function() {
        return loadSettings();
    };
    
    /**
     * Initialize
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Get DOM elements
        modal = document.getElementById('settingsModal');
        settingsBtn = document.getElementById('settingsBtn');
        modalClose = document.getElementById('modalClose');
        modalCancel = document.getElementById('modalCancel');
        modalSave = document.getElementById('modalSave');
        apiKeyInput = document.getElementById('apiKey');
        toggleApiKeyBtn = document.getElementById('toggleApiKey');
        tagsContainer = document.getElementById('tagsContainer');
        newTagInput = document.getElementById('newTagInput');
        addTagBtn = document.getElementById('addTagBtn');
        promptFullTextarea = document.getElementById('promptFullText');
        promptCoreTextarea = document.getElementById('promptCore');
        promptTransformTextarea = document.getElementById('promptTransform');
        modelVisionSelect = document.getElementById('modelVision');
        modelTextSelect = document.getElementById('modelText');
        
        // Load initial settings
        loadSettings();
        
        // Event Listeners
        settingsBtn.addEventListener('click', openModal);
        modalClose.addEventListener('click', closeModal);
        modalCancel.addEventListener('click', closeModal);
        modalSave.addEventListener('click', saveForm);
        
        // Close modal on overlay click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
        
        // Close modal on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Toggle API key visibility
        toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
        
        // Add topic
        addTagBtn.addEventListener('click', addTopic);
        newTagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTopic();
            }
        });
        
        // Remove topic (event delegation)
        tagsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('tag-remove')) {
                const index = parseInt(e.target.dataset.index);
                removeTopic(index);
            }
        });
        
        // Add toast animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes toastOut {
                from { opacity: 1; transform: translateX(-50%) translateY(0); }
                to { opacity: 0; transform: translateX(-50%) translateY(20px); }
            }
            .shake {
                animation: shake 0.5s ease-in-out;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-8px); }
                75% { transform: translateX(8px); }
            }
        `;
        document.head.appendChild(style);
    });
})();
