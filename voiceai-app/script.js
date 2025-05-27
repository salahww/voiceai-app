class VoiceAI {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.processingMode = 'auto';
        this.selectedFile = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupTeamDropdown();
        this.setupFileUpload();
        this.setupRecording();
        this.setupConfigCards();
        this.setupProcessButton();
        this.showTab('upload'); // Commencer avec l'onglet upload actif
        this.showToast('Application initialisée avec succès!', 'success');
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.querySelector('.sidebar');
        
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
                
                // Create overlay if not exists
                let overlay = document.querySelector('.sidebar-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'sidebar-overlay';
                    document.body.appendChild(overlay);
                    
                    overlay.addEventListener('click', () => {
                        sidebar.classList.remove('mobile-open');
                        overlay.classList.remove('active');
                    });
                }
                
                overlay.classList.toggle('active');
            });
        }
    }

    setupTeamDropdown() {
        const teamToggle = document.getElementById('teamToggle');
        const teamDropdown = document.getElementById('teamDropdown');
        
        if (teamToggle && teamDropdown) {
            teamToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                teamToggle.classList.toggle('active');
                teamDropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!teamToggle.contains(e.target) && !teamDropdown.contains(e.target)) {
                    teamToggle.classList.remove('active');
                    teamDropdown.classList.remove('show');
                }
            });
        }
    }

    setupEventListeners() {
        // Navigation with smooth transitions
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                this.showTab(tab);
            });
        });

        // Duration slider with real-time feedback
        const durationSlider = document.getElementById('durationSlider');
        const durationValue = document.getElementById('durationValue');
        
        if (durationSlider && durationValue) {
            durationSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                durationValue.textContent = `${value} seconds`;
            });
        }
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const audioFile = document.getElementById('audioFile');
        
        if (!uploadArea || !audioFile) return;

        // File input change
        audioFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelect(file);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            audioFile.click();
        });
    }

    setupRecording() {
        // Check microphone permissions on load
        this.checkMicrophonePermissions();
    }

    setupConfigCards() {
        document.querySelectorAll('.config-card').forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                document.querySelectorAll('.config-card').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                card.classList.add('active');
                
                // Update processing mode
                const mode = card.getAttribute('data-mode');
                this.processingMode = mode;
                
                // Show/hide language selector for custom mode
                const languageSelector = document.getElementById('languageSelector');
                if (mode === 'custom' && languageSelector) {
                    languageSelector.style.display = 'block';
                } else if (languageSelector) {
                    languageSelector.style.display = 'none';
                }
                
                this.showToast(`Configuration sélectionnée: ${this.getModeDisplayName(mode)}`, 'success');
            });
        });
    }

    setupProcessButton() {
        // Masquer initialement le bouton de traitement
        const processSection = document.getElementById('processSection');
        if (processSection) {
            processSection.style.display = 'none';
        }
    }

    handleFileSelect(file) {
        // Valider le type de fichier
        const validTypes = ['audio/wav', 'audio/mp3', 'audio/flac', 'audio/m4a', 'audio/mpeg'];
        const validExtensions = /\.(wav|mp3|flac|m4a)$/i;
        
        if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
            this.showToast('Format de fichier non supporté. Utilisez WAV, MP3, FLAC ou M4A.', 'error');
            return;
        }

        this.selectedFile = file;
        this.displayFileInfo(file);
        this.showToast(`Fichier sélectionné: ${file.name}`, 'success');
        
        // Afficher le bouton de traitement
        this.showProcessButton();
    }

    showProcessButton() {
        const processSection = document.getElementById('processSection');
        if (processSection) {
            processSection.style.display = 'block';
            // Ajouter une classe pour l'animation
            setTimeout(() => {
                processSection.classList.add('show');
            }, 100);
        }
    }

    processAudio() {
        if (!this.selectedFile) {
            this.showToast('Aucun fichier sélectionné', 'error');
            return;
        }

        this.showToast('Traitement du fichier en cours...', 'info');
        this.showLoading('Traitement de l\'audio en cours...', 'Analyse du fichier audio et détection de la langue...');
        
        // Simuler le traitement (remplacer par l'appel API réel)
        setTimeout(() => {
            this.hideLoading();
            
            // Simuler des résultats de traitement
            const originalText = "Bonjour, comment allez-vous aujourd'hui?";
            const translatedText = "Hello, how are you today?";
            const detectedLang = "fr";
            const targetLang = document.getElementById('targetLanguage')?.value || "en";
            
            this.showResults(originalText, translatedText, detectedLang, targetLang);
            this.showToast('Traitement terminé avec succès!', 'success');
        }, 3000);
    }

    showResults(originalText, translatedText, detectedLang, targetLang) {
        const resultsSection = document.getElementById('resultsSection');
        const processingStatus = document.getElementById('processingStatus');
        const originalTextCard = document.getElementById('originalTextCard');
        const translatedTextCard = document.getElementById('translatedTextCard');
        const originalTextEl = document.getElementById('originalText');
        const translatedTextEl = document.getElementById('translatedText');
        const detectedLanguage = document.getElementById('detectedLanguage');
        const targetLanguageBadge = document.getElementById('targetLanguageBadge');

        if (resultsSection) {
            resultsSection.style.display = 'block';
            
            // Mettre à jour le statut
            processingStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Traitement terminé avec succès!</span>';
            processingStatus.className = 'processing-status success';
            
            // Afficher le texte original
            if (originalText && originalTextCard) {
                originalTextCard.style.display = 'block';
                originalTextEl.textContent = originalText;
                detectedLanguage.textContent = this.getLanguageName(detectedLang);
            }
            
            // Afficher le texte traduit
            if (translatedText && translatedTextCard) {
                translatedTextCard.style.display = 'block';
                translatedTextEl.textContent = translatedText;
                targetLanguageBadge.textContent = this.getLanguageName(targetLang);
            }
        }
    }

    getLanguageName(code) {
        const languages = {
            'fr': 'Français',
            'en': 'Anglais', 
            'es': 'Espagnol',
            'ar': 'Arabe'
        };
        return languages[code] || code;
    }

    // Fonctions TTS
    playTTS() {
        const translatedText = document.getElementById('translatedText').textContent;
        const targetLang = document.getElementById('targetLanguage')?.value || 'fr';
        
        if (!translatedText) {
            this.showToast('Aucun texte à synthétiser', 'error');
            return;
        }

        this.showToast('Génération de la synthèse vocale...', 'info');
        
        // Simuler la génération TTS (remplacer par l'appel API réel)
        setTimeout(() => {
            this.generateTTSAudio(translatedText, targetLang);
        }, 1000);
    }

    generateTTSAudio(text, lang) {
        // Simulation de génération TTS
        // Dans un vrai projet, ceci ferait appel à une API TTS
        const audioElement = document.getElementById('ttsAudio');
        const downloadBtn = document.getElementById('downloadTtsBtn');
        
        // Créer un fichier audio simulé (remplacer par la vraie URL de l'API)
        const audioUrl = `static/audio/tts_${Math.random().toString(36).substr(2, 8)}.mp3`;
        
        if (audioElement) {
            audioElement.src = audioUrl;
            audioElement.style.display = 'block';
            audioElement.load();
            
            // Jouer automatiquement
            audioElement.play().catch(e => {
                console.log('Lecture automatique bloquée:', e);
                this.showToast('Cliquez sur le bouton de lecture pour écouter', 'info');
            });
            
            if (downloadBtn) {
                downloadBtn.style.display = 'inline-block';
                downloadBtn.onclick = () => this.downloadTTS(audioUrl);
            }
            
            this.showToast('Synthèse vocale générée avec succès!', 'success');
        }
    }

    downloadTTS(audioUrl) {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `voiceai_tts_${Date.now()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Téléchargement de l\'audio démarré', 'success');
    }

    // Fonctions utilitaires pour les résultats
    saveToHistory() {
        const originalText = document.getElementById('originalText').textContent;
        const translatedText = document.getElementById('translatedText').textContent;
        
        if (!originalText || !translatedText) {
            this.showToast('Aucun résultat à sauvegarder', 'error');
            return;
        }

        // Sauvegarder dans localStorage (ou envoyer à l'API)
        const historyItem = {
            id: Date.now(),
            originalText,
            translatedText,
            timestamp: new Date().toISOString(),
            mode: this.processingMode
        };

        let history = JSON.parse(localStorage.getItem('voiceai_history') || '[]');
        history.unshift(historyItem);
        
        // Garder seulement les 50 derniers éléments
        history = history.slice(0, 50);
        
        localStorage.setItem('voiceai_history', JSON.stringify(history));
        
        this.showToast('Résultat sauvegardé dans l\'historique', 'success');
    }

    copyToClipboard() {
        const translatedText = document.getElementById('translatedText').textContent;
        
        if (!translatedText) {
            this.showToast('Aucun texte à copier', 'error');
            return;
        }

        navigator.clipboard.writeText(translatedText).then(() => {
            this.showToast('Texte copié dans le presse-papiers', 'success');
        }).catch(err => {
            console.error('Erreur de copie:', err);
            this.showToast('Erreur lors de la copie', 'error');
        });
    }

    resetResults() {
        const resultsSection = document.getElementById('resultsSection');
        const processSection = document.getElementById('processSection');
        
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        
        if (processSection) {
            processSection.style.display = 'none';
        }
        
        // Réinitialiser le fichier sélectionné
        this.selectedFile = null;
        const audioFile = document.getElementById('audioFile');
        if (audioFile) {
            audioFile.value = '';
        }
        
        this.showToast('Interface réinitialisée', 'info');
    }

    displayFileInfo(file) {
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">🎵</div>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                        <div class="file-type">${file.type || 'Type inconnu'}</div>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="document.getElementById('audioFile').click()">
                        <i class="fas fa-edit"></i>
                        Changer
                    </button>
                </div>
            `;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getModeDisplayName(mode) {
        const modes = {
            'auto': 'Traduction automatique vers le français',
            'transcribe': 'Transcription seulement',
            'custom': 'Traduction personnalisée'
        };
        return modes[mode] || mode;
    }

    async checkMicrophonePermissions() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone permissions granted');
            stream.getTracks().forEach(track => track.stop());
            this.showToast('Microphone accessible', 'success');
        } catch (error) {
            console.error('Microphone access denied:', error);
            this.showToast('Accès au microphone refusé. Vérifiez les permissions.', 'warning');
        }
    }

    showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to corresponding nav item
        const navItem = document.querySelector(`[data-tab="${tabName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Close mobile menu if open
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showLoading(title, message) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(loadingOverlay);
        setTimeout(() => loadingOverlay.classList.add('show'), 100);
    }

    hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
            setTimeout(() => document.body.removeChild(loadingOverlay), 300);
        }
    }

    updateActivityFeed() {
        const activities = [
            { icon: '🎤', text: 'Nouveau fichier audio traité', time: 'Il y a 2 minutes' },
            { icon: '🌍', text: 'Traduction FR → EN terminée', time: 'Il y a 5 minutes' },
            { icon: '📊', text: 'Analyse de qualité audio', time: 'Il y a 10 minutes' },
            { icon: '🔄', text: 'Synchronisation des données', time: 'Il y a 15 minutes' }
        ];

        const activityList = document.getElementById('activityList');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.text}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Fonctions globales pour les événements HTML
function toggleRecording() {
    if (window.app) {
        window.app.toggleRecording();
    }
}

function playTTS() {
    if (window.app) {
        window.app.playTTS();
    }
}

function downloadTTS() {
    if (window.app) {
        window.app.downloadTTS();
    }
}

function saveToHistory() {
    if (window.app) {
        window.app.saveToHistory();
    }
}

function copyToClipboard() {
    if (window.app) {
        window.app.copyToClipboard();
    }
}

function resetResults() {
    if (window.app) {
        window.app.resetResults();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VoiceAI();
});
