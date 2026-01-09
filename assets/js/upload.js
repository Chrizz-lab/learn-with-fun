/**
 * Modul 1: PDF Upload & KI-Analyse
 * - PDF hochladen
 * - PDF zu Bildern konvertieren
 * - Schritt 1: Vision API für Volltext-Extraktion
 * - Schritt 2: Text API für Kernaufgaben-Extraktion
 */

(function() {
    'use strict';
    
    // PDF.js Worker konfigurieren
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    // DOM Elements
    let uploadZone, pdfInput, fileInfo, fileName, filePages, fileRemove;
    let analyzeBtn, resultsContainer, fulltextContent, coreContent;
    let tabBtns;
    
    // State
    let currentPDF = null;
    let pdfImages = [];
    
    /**
     * Initialize Module
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Get DOM elements
        uploadZone = document.getElementById('uploadZone');
        pdfInput = document.getElementById('pdfInput');
        fileInfo = document.getElementById('fileInfo');
        fileName = document.getElementById('fileName');
        filePages = document.getElementById('filePages');
        fileRemove = document.getElementById('fileRemove');
        analyzeBtn = document.getElementById('analyzeBtn');
        resultsContainer = document.getElementById('resultsContainer');
        fulltextContent = document.getElementById('fulltextContent');
        coreContent = document.getElementById('coreContent');
        tabBtns = document.querySelectorAll('.tab-btn');
        
        if (!uploadZone) return;
        
        // Event Listeners
        setupUploadEvents();
        setupTabEvents();
        setupCopyButtons();
    });
    
    /**
     * Setup Upload Events
     */
    function setupUploadEvents() {
        // Click to upload
        uploadZone.addEventListener('click', () => pdfInput.click());
        
        // File input change
        pdfInput.addEventListener('change', handleFileSelect);
        
        // Drag & Drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                handleFile(files[0]);
            } else {
                showToast('Bitte nur PDF-Dateien hochladen', 'error');
            }
        });
        
        // Remove file
        fileRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            resetUpload();
        });
        
        // Analyze button
        analyzeBtn.addEventListener('click', analyzeDocument);
    }
    
    /**
     * Setup Tab Events
     */
    function setupTabEvents() {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show target panel
                document.querySelectorAll('.result-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                document.getElementById(`result${capitalize(targetTab)}`).classList.add('active');
            });
        });
    }
    
    /**
     * Setup Copy Buttons
     */
    function setupCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = btn.dataset.target;
                const content = document.querySelector(`#${targetId} .result-text`).textContent;
                
                try {
                    await navigator.clipboard.writeText(content);
                    btn.classList.add('copied');
                    setTimeout(() => btn.classList.remove('copied'), 2000);
                    showToast('In Zwischenablage kopiert!');
                } catch (err) {
                    showToast('Kopieren fehlgeschlagen', 'error');
                }
            });
        });
    }
    
    /**
     * Handle File Selection
     */
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) handleFile(file);
    }
    
    /**
     * Handle File
     */
    async function handleFile(file) {
        if (file.type !== 'application/pdf') {
            showToast('Bitte nur PDF-Dateien hochladen', 'error');
            return;
        }
        
        currentPDF = file;
        fileName.textContent = file.name;
        
        try {
            // Load PDF and get page count
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const pageCount = pdf.numPages;
            
            filePages.textContent = `${pageCount} Seite${pageCount !== 1 ? 'n' : ''}`;
            
            // Convert PDF pages to images
            pdfImages = await convertPDFToImages(pdf);
            
            // Show file info
            uploadZone.style.display = 'none';
            fileInfo.style.display = 'flex';
            analyzeBtn.disabled = false;
            
        } catch (error) {
            console.error('PDF Error:', error);
            showToast('Fehler beim Laden der PDF', 'error');
            resetUpload();
        }
    }
    
    /**
     * Convert PDF to Base64 Images
     */
    async function convertPDFToImages(pdf) {
        const images = [];
        const scale = 2; // Higher quality
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // Render page
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // Convert to base64
            const imageData = canvas.toDataURL('image/png').split(',')[1];
            images.push(imageData);
        }
        
        return images;
    }
    
    /**
     * Reset Upload
     */
    function resetUpload() {
        currentPDF = null;
        pdfImages = [];
        pdfInput.value = '';
        uploadZone.style.display = 'block';
        fileInfo.style.display = 'none';
        analyzeBtn.disabled = true;
        resultsContainer.style.display = 'none';
    }
    
    /**
     * Analyze Document - 2-Schritt-Verfahren
     * Schritt 1: Vision API liest den Text aus dem PDF
     * Schritt 2: Text wird an normale API gesendet für Kernaufgaben
     */
    async function analyzeDocument() {
        const settings = window.getSettings();
        
        // Check API Key
        if (!settings.apiKey) {
            showToast('Bitte zuerst einen OpenAI API Key in den Einstellungen hinterlegen', 'error');
            return;
        }
        
        // Start loading
        analyzeBtn.classList.add('loading');
        analyzeBtn.disabled = true;
        resultsContainer.style.display = 'block';
        fulltextContent.innerHTML = '<div class="loading">Schritt 1: Lese Text aus PDF...</div>';
        coreContent.innerHTML = '<div class="loading">Warte auf Volltext...</div>';
        fulltextContent.classList.add('loading');
        coreContent.classList.add('loading');
        
        try {
            // ===== SCHRITT 1: Vision API - Volltext extrahieren =====
            console.log('Schritt 1: Volltext-Extraktion mit Vision API...');
            const modelVision = settings.modelVision || 'gpt-4o';
            const fulltextResult = await callOpenAIVision(settings.apiKey, settings.promptFullText, pdfImages, modelVision);
            
            // Display Volltext
            fulltextContent.classList.remove('loading');
            fulltextContent.textContent = fulltextResult;
            
            // Update Status für Schritt 2
            coreContent.innerHTML = '<div class="loading">Schritt 2: Extrahiere Kernaufgaben...</div>';
            
            // ===== SCHRITT 2: Text API - Kernaufgaben extrahieren =====
            console.log('Schritt 2: Kernaufgaben-Extraktion mit Text API...');
            const modelText = settings.modelText || 'gpt-4o';
            const coreResult = await callOpenAIText(settings.apiKey, settings.promptCore, fulltextResult, modelText);
            
            // Display Kernaufgaben
            coreContent.classList.remove('loading');
            coreContent.textContent = coreResult;
            
            // Übergabe an Modul 2
            if (typeof window.setTasksForTransform === 'function') {
                window.setTasksForTransform(fulltextResult, coreResult);
            }
            
            showToast('Analyse abgeschlossen!');
            
        } catch (error) {
            console.error('API Error:', error);
            fulltextContent.classList.remove('loading');
            coreContent.classList.remove('loading');
            
            if (!fulltextContent.textContent || fulltextContent.textContent.includes('Schritt')) {
                fulltextContent.textContent = `Fehler: ${error.message}`;
            }
            coreContent.textContent = `Fehler: ${error.message}`;
            showToast('Fehler bei der Analyse', 'error');
        } finally {
            analyzeBtn.classList.remove('loading');
            analyzeBtn.disabled = false;
        }
    }
    
    /**
     * Call OpenAI Vision API (für Bilder/PDF)
     */
    async function callOpenAIVision(apiKey, prompt, images, model = 'gpt-4o') {
        // Build content array with images
        const content = [
            { type: 'text', text: prompt }
        ];
        
        // Add images
        images.forEach(imageBase64 => {
            content.push({
                type: 'image_url',
                image_url: {
                    url: `data:image/png;base64,${imageBase64}`,
                    detail: 'high'
                }
            });
        });
        
        console.log(`Vision API - Modell: ${model}`);
        
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
                        content: content
                    }
                ],
                max_tokens: 4096
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Vision API Fehler');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    /**
     * Call OpenAI Text API (für reine Text-Verarbeitung)
     */
    async function callOpenAIText(apiKey, prompt, inputText, model = 'gpt-4o') {
        const fullPrompt = `${prompt}

Hier ist der Text mit den Aufgaben:

${inputText}`;

        console.log(`Text API - Modell: ${model}`);

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
                        content: fullPrompt
                    }
                ],
                max_tokens: 4096
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Text API Fehler');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    /**
     * Show Toast Notification
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
    
    /**
     * Capitalize first letter
     */
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
})();
