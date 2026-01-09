# learn-with-fun
Ein intelligenter Workflow-Assistent zur Verarbeitung und Transformation von Aufgaben mit KI-Unterstützung.



> ⚠️ **Hinweis zur Entstehung**  
> Dieses Tool wurde **zweckmäßig mit KI-generiertem Code** (Claude/Cursor) erstellt und dient primär als funktionaler Prototyp. Es erhebt keinen Anspruch auf durchdachte Softwareentwicklung, Best Practices oder produktionsreife Codequalität. Der Fokus lag auf schneller Umsetzung der gewünschten Funktionalität – nicht auf Architektur, Wartbarkeit oder Skalierbarkeit.

---

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Features](#-features)
- [Installation](#-installation)
- [Einstellungen](#-einstellungen)
- [Workflow](#-workflow)
- [Module im Detail](#-module-im-detail)
- [Technische Details](#-technische-details)

---

## 🎯 Überblick

Das **AufgabenTool** ermöglicht es, Aufgaben aus PDF-Dokumenten zu extrahieren, auf ihre Kernaussage zu reduzieren und anschließend in ein völlig neues Themengebiet zu transformieren – alles mithilfe von OpenAI's KI-Modellen.

### Anwendungsbeispiel

> **Original-Aufgabe (Schiff):**  
> "Ein Schiff mit 15 Mann Besatzung hat Vorrat für 40 Tage. Wie lange reicht der Vorrat für 8 Mann?"
>
> **Transformiert (Fortnite):**  
> "Ein Squad von 15 Spielern hat 40 Medkits. Wie viele Medkits stehen jedem Spieler zur Verfügung, wenn nur noch 8 Spieler übrig sind?"

---

## ✨ Features

- 🌙 **Dark/Light Mode** – Automatische Speicherung der Präferenz
- 📤 **PDF Upload** – Drag & Drop oder Dateiauswahl
- 🔍 **OCR mit Vision API** – Texterkennung aus Bildern/PDFs
- 🎯 **Kernaufgaben-Extraktion** – Reduziert Textaufgaben auf mathematische Formeln
- 🔄 **Themen-Transformation** – Wandelt Aufgaben in neue Kontexte um
- ⚙️ **Flexible Modellauswahl** – Wähle zwischen verschiedenen GPT-Modellen
- 💾 **Persistente Einstellungen** – Alle Einstellungen werden lokal gespeichert

---

## 🚀 Installation

### Voraussetzungen

- Node.js (für den lokalen Entwicklungsserver)
- PHP oder Apache auf dem System installiert
- OpenAI API Key

### Server starten

```bash
# In das Projektverzeichnis wechseln
cd C:\Users\chwin\Desktop\Projekte\AufgabenTool

# Server starten (PowerShell)
npx serve -p 3000

# Oder mit npm serve global installiert
serve -p 3000
```

Öffne dann im Browser: **http://localhost:3000**

---

## ⚙️ Einstellungen

Klicke auf das **Zahnrad-Symbol** (⚙️) oben rechts, um die Einstellungen zu öffnen.

### 1. 🔑 OpenAI API Key

**Pflichtfeld** – Ohne API Key funktioniert das Tool nicht.

1. Besuche [platform.openai.com](https://platform.openai.com/api-keys)
2. Erstelle einen neuen API Key
3. Kopiere den Key (beginnt mit `sk-...`)
4. Füge ihn im Einstellungs-Dialog ein

### 2. 🤖 KI-Modelle

Wähle die Modelle für verschiedene Aufgaben:

| Modell | Vision (OCR) | Text-Verarbeitung | Empfehlung |
|--------|--------------|-------------------|------------|
| **GPT-4o** | ✅ | ✅ | Beste Qualität |
| **GPT-4o Mini** | ✅ | ✅ | Schneller & günstiger |
| **GPT-4 Turbo** | ✅ | ✅ | Alternative |
| **GPT-3.5 Turbo** | ❌ | ✅ | Günstigste Option |

**Empfehlung:**
- **Vision (OCR):** GPT-4o oder GPT-4o Mini
- **Text-Verarbeitung:** GPT-4o Mini (gutes Preis-Leistungs-Verhältnis)

### 3. 📚 Themengebiete

Definiere Themengebiete, in die Aufgaben transformiert werden können.

**Beispiele:**
- Fortnite
- Minecraft
- Harry Potter
- Fußball
- Kochen
- Weltraum

**So fügst du ein Thema hinzu:**
1. Gib das Thema im Eingabefeld ein
2. Klicke auf **+** oder drücke **Enter**
3. Das Thema erscheint als Tag

### 4. 📝 Prompts anpassen (optional)

Du kannst die KI-Prompts anpassen:

| Prompt | Funktion |
|--------|----------|
| **Volltext-Extraktion** | Liest den kompletten Text aus dem PDF |
| **Kernaufgaben-Extraktion** | Extrahiert nur die mathematische Formel |
| **Aufgaben-Transformation** | Wandelt in neues Themengebiet um |

> **Tipp:** Die Standard-Prompts sind bereits optimiert. Ändere sie nur, wenn du spezielle Anforderungen hast.

---

## 🔄 Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  SCHRITT 1: PDF hochladen                                   │
│  ─────────────────────────                                  │
│  • PDF per Drag & Drop oder Klick hochladen                 │
│  • Dateiinfo wird angezeigt (Name, Seitenzahl)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SCHRITT 2: Aufgaben analysieren                            │
│  ───────────────────────────────                            │
│  • Klick auf "Aufgaben analysieren"                         │
│  • Vision API liest den Volltext                            │
│  • Text API extrahiert Kernaufgaben                         │
│  • Ergebnisse in zwei Tabs anzeigen                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SCHRITT 3: Weiter zu Transformation                        │
│  ───────────────────────────────────                        │
│  • Button "Weiter zu Transformation →" erscheint            │
│  • Klick öffnet Modul 2                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SCHRITT 4: Themengebiet wählen                             │
│  ──────────────────────────────                             │
│  • Dropdown mit deinen Themengebieten                       │
│  • Wähle das Ziel-Thema aus                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SCHRITT 5: Aufgaben transformieren                         │
│  ─────────────────────────────────                          │
│  • Klick auf "Alle Aufgaben transformieren"                 │
│  • KI wandelt jede Aufgabe ins neue Thema um                │
│  • Ergebnisse werden angezeigt                              │
│  • "Alle kopieren" Button zum Export                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Module im Detail

### Modul 1: Aufgaben einlesen

<img width="1110" height="304" alt="image" src="https://github.com/user-attachments/assets/61a50af8-0375-4a83-8ced-b3f09d1e16ed" />


**Funktion:** Extrahiert Aufgaben aus PDF-Dokumenten

**Ablauf:**
1. **PDF Upload** – Drag & Drop oder Durchsuchen
2. **PDF zu Bild** – Jede Seite wird in ein Bild konvertiert (via PDF.js)
3. **Vision API** – Bilder werden an OpenAI gesendet, Volltext wird extrahiert
4. **Text API** – Volltext wird analysiert, Kernaufgaben werden extrahiert

**Ausgabe:**
- **Tab "Volltext"** – Der komplette Aufgabentext
- **Tab "Kernaufgaben"** – Nur die mathematischen Formeln

**Beispiel Kernaufgabe:**
```
1. a) (15 × 40) ÷ 8 = ?
   b) (15 × 40) ÷ 30 = ?
```

### Modul 2: Aufgaben transformieren


**Funktion:** Wandelt Aufgaben in ein neues Themengebiet um

**Ablauf:**
1. **Aufgaben laden** – Automatisch aus Modul 1 übernommen
2. **Thema wählen** – Aus deinen definierten Themengebieten
3. **Transformieren** – KI erstellt neue Aufgaben im gewählten Kontext

**Beispiel:**
```
Original (Schiff):
"15 Mann haben Vorrat für 40 Tage. Wie lange für 8 Mann?"

Transformiert (Fortnite):
"Ein Team von 15 Spielern hat 40 Shield Potions. 
Wie viele Shield Potions hat jeder Spieler zur Verfügung, 
wenn nur noch 8 Spieler übrig sind?"
```
<img width="1082" height="807" alt="image" src="https://github.com/user-attachments/assets/8e390ef6-8247-45a3-892e-dc161145166e" />

### Modul 3: Export (geplant)

**Status:** In Entwicklung

**Geplante Funktionen:**
- Export als PDF
- Export als Word-Dokument
- Kopieren in Zwischenablage (bereits verfügbar)

---

## 🛠️ Technische Details

### Verwendete Technologien

| Technologie | Verwendung |
|-------------|------------|
| **HTML5** | Struktur |
| **CSS3** | Styling mit CSS Variables |
| **JavaScript (ES6+)** | Logik & API-Aufrufe |
| **PDF.js** | PDF zu Bild Konvertierung |
| **OpenAI API** | Vision & Chat Completions |
| **LocalStorage** | Persistente Einstellungen |

### Dateistruktur

```
AufgabenTool/
├── index.html          # Hauptseite
├── README.md           # Diese Dokumentation
└── assets/
    ├── css/
    │   └── style.css   # Alle Styles
    └── js/
        ├── theme.js    # Dark/Light Mode
        ├── settings.js # Einstellungs-Modal
        ├── upload.js   # Modul 1: PDF Upload & Analyse
        └── transform.js # Modul 2: Transformation
```

### API-Kosten (geschätzt)

| Aktion | Modell | Kosten (ca.) |
|--------|--------|--------------|
| PDF lesen (1 Seite) | GPT-4o | ~$0.01-0.03 |
| Kernaufgaben extrahieren | GPT-4o | ~$0.005 |
| Transformation (1 Aufgabe) | GPT-4o | ~$0.005 |

> **Tipp:** Nutze GPT-4o Mini für geringere Kosten bei ähnlicher Qualität.

---

## 🔒 Datenschutz

- Alle Einstellungen werden **lokal im Browser** gespeichert
- PDFs werden **nicht auf einem Server** gespeichert
- Die Kommunikation mit OpenAI erfolgt **direkt aus dem Browser**
- Dein API Key wird **nur lokal** gespeichert und nie an Dritte übermittelt

---

## 🐛 Fehlerbehebung

### "API Key fehlt"
→ Trage deinen OpenAI API Key in den Einstellungen ein

### "Keine Themengebiete definiert"
→ Füge mindestens ein Themengebiet in den Einstellungen hinzu

### "Vision API Fehler"
→ Überprüfe, ob dein API Key gültig ist und Guthaben vorhanden ist

### Kernaufgaben enthalten noch Text
→ Der Prompt kann in den Einstellungen angepasst werden

---

## 📄 Lizenz

Dieses Projekt ist für den persönlichen Gebrauch bestimmt.

---

**Erstellt mit ❤️ und KI-Unterstützung**
