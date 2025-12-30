# Netlify Deployment Guide

Dieses Projekt ist für das Deployment auf Netlify als Progressive Web App (PWA) optimiert.

## Schritte zum Deployment

1. **Repository verbinden**:
   - Loggen Sie sich bei [Netlify](https://app.netlify.com/) ein.
   - Klicken Sie auf "Add new site" > "Import an existing project".
   - Wählen Sie Ihren Git-Provider (GitHub, GitLab, etc.) und das Repository aus.

2. **Build-Einstellungen**:
   Netlify sollte die Einstellungen automatisch aus der `netlify.toml` übernehmen:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: (leer lassen)

3. **Umgebungsvariablen (WICHTIG)**:
   - Gehen Sie zu **Site configuration** > **Environment variables**.
   - Fügen Sie folgende Variable hinzu:
     - `GEMINI_API_KEY`: Ihr Google Gemini API Schlüssel.
   - Optional (falls Build-Probleme auftreten):
     - `NODE_VERSION`: `20`

4. **Deploy**:
   - Klicken Sie auf "Deploy site".
   - Nach wenigen Minuten ist Ihre App unter einer `.netlify.app` URL erreichbar.

## PWA Features

Nach dem Deployment auf Netlify (HTTPS ist erforderlich und wird von Netlify automatisch bereitgestellt):

- **Installation**: Auf Desktop (Chrome/Edge) erscheint ein Installations-Icon in der Adressleiste. Auf Mobile (iOS/Android) können Sie die App zum Home-Bildschirm hinzufügen.
- **Offline-Support**: Die App lädt statische Inhalte (UI, Styles, Scripts) auch ohne Internetverbindung aus dem Cache. Für die AI-Generierung ist weiterhin eine Internetverbindung erforderlich.
- **Updates**: Neue Versionen werden automatisch im Hintergrund geladen und beim nächsten Start aktiviert.

## Lokales Testen (Build)

Falls Sie den Build lokal testen möchten, nutzen Sie:
```bash
npm run build
npm run preview
```
*(Hinweis: Bei Pfaden mit Sonderzeichen kann es lokal zu Problemen kommen; Netlify ist davon nicht betroffen).*
