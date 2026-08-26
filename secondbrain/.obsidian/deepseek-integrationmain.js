// DeepSeek Obsidian Integration Plugin
// Ermöglicht direkte Dateioperationen durch den Assistenten

const { Plugin, Notice, TFile } = require('obsidian');

module.exports = class DeepSeekPlugin extends Plugin {
    async onload() {
        // Command: Datei für DeepSeek extrahieren
        this.addCommand({
            id: 'extract-for-deepseek',
            name: 'Datei für DeepSeek extrahieren',
            callback: () => this.extractCurrentFile()
        });

        // Command: DeepSeek-Antwort speichern
        this.addCommand({
            id: 'save-deepseek-response',
            name: 'DeepSeek-Antwort speichern',
            callback: () => this.saveDeepSeekResponse()
        });

        // Command: Batch-Migration durchführen
        this.addCommand({
            id: 'migrate-claude-to-deepseek',
            name: 'Claude → DeepSeek migrieren',
            callback: () => this.migrateScripts()
        });

        console.log('DeepSeek Plugin geladen');
    }

    async extractCurrentFile() {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
            new Notice('Keine aktive Datei');
            return;
        }

        const content = await this.app.vault.read(file);
        const output = `📤 **Datei für DeepSeek**\n\n**Pfad:** ${file.path}\n**Name:** ${file.name}\n\n\`\`\`\n${content}\n\`\`\``;
        
        // In Zwischenablage kopieren
        await navigator.clipboard.writeText(output);
        new Notice(`📋 ${file.name} kopiert für DeepSeek`);
    }

    async saveDeepSeekResponse() {
        // Liest aus Clipboard und erstellt Datei
        const clipboard = await navigator.clipboard.readText();
        
        if (clipboard.includes('# Dateiname:')) {
            const match = clipboard.match(/# Dateiname:\s*(.+)/);
            const filename = match ? match[1].trim() : `deepseek_${Date.now()}.md`;
            
            const content = clipboard.replace(/^# Dateiname:.*\n/, '');
            const path = `.deepseek/scripts/${filename}`;
            
            await this.app.vault.create(path, content);
            new Notice(`✅ ${filename} gespeichert`);
        } else {
            new Notice('❌ Keine DeepSeek-Antwort erkannt');
        }
    }

    async migrateScripts() {
        // Automatische Migration aller Claude-Skripte
        const claudeFiles = this.app.vault.getFiles().filter(f => 
            f.path.includes('.claude/scripts')
        );

        for (const file of claudeFiles) {
            let content = await this.app.vault.read(file);
            
            // Claude → DeepSeek ersetzen
            content = content
                .replace(/\.claude\//g, '.deepseek/')
                .replace(/claude-sonnet/g, 'deepseek-chat')
                .replace(/ANTHROPIC_API_KEY/g, 'DEEPSEEK_API_KEY')
                .replace(/Claude/g, 'DeepSeek')
                .replace(/claude/gi, 'deepseek');
            
            const newPath = file.path.replace('.claude/', '.deepseek/');
            await this.app.vault.create(newPath, content);
        }

        new Notice(`✅ ${claudeFiles.length} Dateien migriert`);
    }
};