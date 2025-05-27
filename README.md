# 🎤 VoiceAI Desktop - Version Simplifiée

Application de reconnaissance vocale et traduction utilisant **Whisper seulement** (sans modèles GMM).

## 📋 Fonctionnalités

- ✅ **Détection de langue** avec Whisper
- ✅ **Transcription audio** en texte
- ✅ **Traduction** vers le français et autres langues
- ✅ **Synthèse vocale** (Text-to-Speech)
- ✅ **Interface web moderne** et intuitive

## 🚀 Installation et Lancement

### Méthode 1: Lancement automatique
```bash
python launch_voiceai.py
```

### Méthode 2: Lancement manuel
```bash
# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python backend_whisper_only.py
```

## 🌐 Accès à l'Interface

Une fois lancé, l'interface sera disponible sur:
**http://localhost:5000**

## 📁 Structure des Fichiers

```
VoiceAI_App/
├── index.html              # Interface web principale
├── style.css               # Styles CSS
├── script.js               # JavaScript frontend
├── backend_whisper_only.py # Backend Flask (Whisper seulement)
├── requirements.txt        # Dépendances Python
├── launch_voiceai.py       # Script de lancement
├── README.md              # Ce fichier
└── static/
    └── audio/             # Fichiers audio générés (TTS)
```

## 🎯 Utilisation

1. **Télécharger un fichier audio** (WAV, MP3, FLAC, M4A)
2. **Choisir le mode de traitement** :
   - Traduction automatique vers le français
   - Transcription seulement
   - Mode personnalisé
3. **Cliquer sur "Traiter l'Audio"**
4. **Voir les résultats** :
   - Langue détectée
   - Transcription
   - Traduction (si activée)
   - Synthèse vocale du résultat

## 🔧 Configuration

### Langues supportées
- **Arabe** (ar)
- **Anglais** (en)
- **Français** (fr)
- **Espagnol** (es)
- Et toutes les langues supportées par Whisper

### Formats audio supportés
- WAV
- MP3
- FLAC
- M4A

## ⚡ Avantages de cette version

- 🚀 **Plus rapide** : Pas de chargement de modèles GMM
- 🎯 **Plus simple** : Utilise seulement Whisper
- 💾 **Moins de mémoire** : Modèles plus légers
- 🔧 **Plus stable** : Moins de dépendances
- 🖥️ **Portable** : Fonctionne sur le bureau

## 🛠️ Dépannage

### Problème d'installation
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Problème de port
Si le port 5000 est occupé, modifiez la ligne dans `backend_whisper_only.py`:
```python
app.run(host='0.0.0.0', port=5001, debug=False)  # Changez 5000 en 5001
```

### Problème de mémoire
Utilisez un modèle Whisper plus petit dans `backend_whisper_only.py`:
```python
self.whisper_model = whisper.load_model('tiny')  # Au lieu de 'base'
```

## 📞 Support

Pour toute question ou problème, vérifiez les logs dans la console où vous avez lancé l'application.

---
**VoiceAI Desktop** - Version simplifiée pour un usage optimal 🎤