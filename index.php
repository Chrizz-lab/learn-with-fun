<!DOCTYPE html>
<html lang="de" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AufgabenTool</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="header">
            <div class="logo">
                <span class="logo-icon">⚡</span>
                <span class="logo-text">AufgabenTool</span>
            </div>
            
            <nav class="nav">
                <button class="theme-toggle" id="themeToggle" aria-label="Theme wechseln">
                    <span class="theme-icon sun">☀️</span>
                    <span class="theme-icon moon">🌙</span>
                    <span class="toggle-slider"></span>
                </button>
            </nav>
        </header>

        <!-- Main Content Area -->
        <main class="main-content">
            <div class="welcome-section">
                <h1>Willkommen</h1>
                <p class="subtitle">Dein Workflow-Assistent für intelligente Aufgabenverarbeitung</p>
            </div>

            <!-- Module Container - hier kommen später die Module rein -->
            <div class="modules-grid">
                <div class="module-placeholder">
                    <div class="placeholder-icon">📤</div>
                    <span>Modul 1</span>
                    <p class="placeholder-hint">Bald verfügbar</p>
                </div>
                <div class="module-placeholder">
                    <div class="placeholder-icon">🤖</div>
                    <span>Modul 2</span>
                    <p class="placeholder-hint">Bald verfügbar</p>
                </div>
                <div class="module-placeholder">
                    <div class="placeholder-icon">📋</div>
                    <span>Modul 3</span>
                    <p class="placeholder-hint">Bald verfügbar</p>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="footer">
            <p>&copy; <span id="year"></span> AufgabenTool</p>
            <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
        </footer>
    </div>

    <script src="assets/js/theme.js"></script>
</body>
</html>
