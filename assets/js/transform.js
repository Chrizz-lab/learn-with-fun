/**
 * Modul 2: Aufgaben-Transformation
 * - Aufgaben aus Modul 1 übernehmen
 * - Themengebiet auswählen
 * - Aufgaben transformieren
 */

(function() {
    'use strict';
    
    // DOM Elements
    let moduleTransform, topicSelect, tasksList, transformBtn;
    let transformResults, transformedList, copyAllBtn;
    let toModule2Btn;
    
    // State
    let tasks = []; // Array of {fulltext, core} objects
    let transformedTasks = [];
    
    /**
     * Initialize Module
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Get DOM elements
        moduleTransform = document.getElementById('moduleTransform');
        topicSelect = document.getElementById('topicSelect');
        tasksList = document.getElementById('tasksList');
        transformBtn = document.getElementById('transformBtn');
        transformResults = document.getElementById('transformResults');
        transformedList = document.getElementById('transformedList');
        copyAllBtn = document.getElementById('copyAllTransformed');
        toModule2Btn = document.getElementById('toModule2Btn');
        
        if (!moduleTransform) return;
        
        // Event Listeners
        setupEventListeners();
    });
    
    /**
     * Setup Event Listeners
     */
    function setupEventListeners() {
        // Topic selection change
        topicSelect.addEventListener('change', checkReadyState);
        
        // Transform button
        transformBtn.addEventListener('click', transformAllTasks);
        
        // Copy all button
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', copyAllTransformed);
        }
        
        // "Weiter zu Modul 2" Button
        if (toModule2Btn) {
            toModule2Btn.addEventListener('click', showModule2);
        }
    }
    
    /**
     * Set tasks from Module 1 (called from upload.js)
     */
    window.setTasksForTransform = function(fulltextStr, coreStr) {
        // Parse tasks from strings
        tasks = parseTaskPairs(fulltextStr, coreStr);
        
        // Show "Weiter zu Modul 2" button
        if (toModule2Btn && tasks.length > 0) {
            toModule2Btn.style.display = 'block';
        }
    };
    
    /**
     * Parse task pairs from fulltext and core strings
     */
    function parseTaskPairs(fulltextStr, coreStr) {
        const pairs = [];
        
        // Split by numbered items (1., 2., etc.)
        const fulltextParts = splitByNumbers(fulltextStr);
        const coreParts = splitByNumbers(coreStr);
        
        // Create pairs
        const maxLength = Math.max(fulltextParts.length, coreParts.length);
        for (let i = 0; i < maxLength; i++) {
            pairs.push({
                number: i + 1,
                fulltext: fulltextParts[i] || '',
                core: coreParts[i] || ''
            });
        }
        
        return pairs.filter(p => p.fulltext.trim() || p.core.trim());
    }
    
    /**
     * Split text by numbered items
     */
    function splitByNumbers(text) {
        if (!text) return [];
        
        // Split by patterns like "1.", "2.", "1)", "a)", etc.
        const parts = [];
        const lines = text.split('\n');
        let currentPart = '';
        
        for (const line of lines) {
            // Check if line starts with a number pattern
            if (/^\s*\d+[\.\)]\s/.test(line) && currentPart.trim()) {
                parts.push(currentPart.trim());
                currentPart = line;
            } else {
                currentPart += '\n' + line;
            }
        }
        
        if (currentPart.trim()) {
            parts.push(currentPart.trim());
        }
        
        return parts;
    }
    
    /**
     * Show Module 2
     */
    function showModule2() {
        if (!moduleTransform) return;
        
        // Show module
        moduleTransform.style.display = 'block';
        
        // Scroll to module
        moduleTransform.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Populate topics dropdown
        populateTopics();
        
        // Render tasks
        renderTasks();
        
        // Reset results
        transformResults.style.display = 'none';
        transformedList.innerHTML = '';
        transformedTasks = [];
    }
    
    /**
     * Populate topics dropdown from settings
     */
    function populateTopics() {
        const settings = window.getSettings();
        
        // Clear existing options (except first)
        topicSelect.innerHTML = '<option value="">-- Themengebiet wählen --</option>';
        
        if (settings.topics && settings.topics.length > 0) {
            settings.topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '(Keine Themengebiete definiert)';
            option.disabled = true;
            topicSelect.appendChild(option);
        }
    }
    
    /**
     * Render tasks in the list
     */
    function renderTasks() {
        tasksList.innerHTML = '';
        
        if (tasks.length === 0) {
            tasksList.innerHTML = '<p class="settings-hint">Keine Aufgaben vorhanden. Bitte erst in Modul 1 Aufgaben analysieren.</p>';
            return;
        }
        
        tasks.forEach((task, index) => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <div class="task-header">
                    <span class="task-number">Aufgabe ${task.number}</span>
                </div>
                <div class="task-fulltext">${escapeHtml(task.fulltext)}</div>
                <div class="task-core-label">Kernaufgabe:</div>
                <div class="task-core">${escapeHtml(task.core)}</div>
            `;
            tasksList.appendChild(card);
        });
    }
    
    /**
     * Check if ready to transform
     */
    function checkReadyState() {
        const hasTopicSelected = topicSelect.value !== '';
        const hasTasks = tasks.length > 0;
        transformBtn.disabled = !(hasTopicSelected && hasTasks);
    }
    
    /**
     * Transform all tasks
     */
    async function transformAllTasks() {
        const settings = window.getSettings();
        const targetTopic = topicSelect.value;
        
        if (!settings.apiKey) {
            showToast('Bitte API Key in den Einstellungen hinterlegen', 'error');
            return;
        }
        
        if (!targetTopic) {
            showToast('Bitte Themengebiet auswählen', 'error');
            return;
        }
        
        // Start loading
        transformBtn.classList.add('loading');
        transformBtn.disabled = true;
        transformResults.style.display = 'block';
        transformedList.innerHTML = '<div class="loading" style="padding: 2rem; text-align: center; color: var(--text-muted);">Transformiere Aufgaben...</div>';
        
        try {
            transformedTasks = [];
            
            // Transform each task
            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                
                // Update progress
                transformedList.innerHTML = `<div class="loading" style="padding: 2rem; text-align: center; color: var(--text-muted);">Transformiere Aufgabe ${i + 1} von ${tasks.length}...</div>`;
                
                const modelText = settings.modelText || 'gpt-4o';
                const transformed = await transformTask(
                    settings.apiKey,
                    settings.promptTransform,
                    task.fulltext,
                    task.core,
                    targetTopic,
                    modelText
                );
                
                transformedTasks.push({
                    number: task.number,
                    topic: targetTopic,
                    content: transformed
                });
            }
            
            // Render results
            renderTransformedTasks();
            showToast('Transformation abgeschlossen!');
            
        } catch (error) {
            console.error('Transform Error:', error);
            transformedList.innerHTML = `<div style="padding: 2rem; color: #ef4444;">Fehler: ${error.message}</div>`;
            showToast('Fehler bei der Transformation', 'error');
        } finally {
            transformBtn.classList.remove('loading');
            transformBtn.disabled = false;
        }
    }
    
    /**
     * Transform a single task
     */
    async function transformTask(apiKey, promptTemplate, fulltext, core, targetTopic, model = 'gpt-4o') {
        const prompt = `${promptTemplate}

ORIGINAL-AUFGABE (Volltext):
${fulltext}

KERNAUFGABE (Rechnung):
${core}

ZIEL-THEMENGEBIET: ${targetTopic}

Wandle die Aufgabe jetzt in das Themengebiet "${targetTopic}" um:`;

        console.log(`Transform API - Modell: ${model}`);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1024
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API Fehler');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    /**
     * Render transformed tasks
     */
    function renderTransformedTasks() {
        transformedList.innerHTML = '';
        
        transformedTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'transformed-card';
            card.innerHTML = `
                <div class="transformed-header">
                    <span class="transformed-number">Aufgabe ${task.number}</span>
                    <span class="transformed-topic">${escapeHtml(task.topic)}</span>
                </div>
                <div class="transformed-content">${escapeHtml(task.content)}</div>
            `;
            transformedList.appendChild(card);
        });
    }
    
    /**
     * Copy all transformed tasks
     */
    async function copyAllTransformed() {
        const allText = transformedTasks.map(t => 
            `Aufgabe ${t.number} (${t.topic}):\n${t.content}`
        ).join('\n\n---\n\n');
        
        try {
            await navigator.clipboard.writeText(allText);
            copyAllBtn.classList.add('copied');
            setTimeout(() => copyAllBtn.classList.remove('copied'), 2000);
            showToast('Alle Aufgaben kopiert!');
        } catch (err) {
            showToast('Kopieren fehlgeschlagen', 'error');
        }
    }
    
    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Show Toast
     */
    function showToast(message, type = 'success') {
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
        }, 3000);
    }
})();
