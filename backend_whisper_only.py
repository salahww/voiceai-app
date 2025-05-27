#!/usr/bin/env python3
"""
Backend Flask simplifié pour VoiceAI - Whisper seulement
Fonctionnalités : transcription, traduction, TTS
"""

from flask import Flask, request, jsonify, send_file, render_template_string
import os
import tempfile
import numpy as np
import librosa
import soundfile as sf
from pathlib import Path
import io
import base64
import threading
import time
import json
from datetime import datetime
import logging
import uuid

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import des bibliothèques requises
try:
    import whisper
    WHISPER_AVAILABLE = True
    logger.info("✅ Whisper disponible")
except ImportError:
    WHISPER_AVAILABLE = False
    logger.error("❌ Whisper non disponible")

try:
    from googletrans import Translator
    TRANSLATOR_AVAILABLE = True
    logger.info("✅ Google Translate disponible")
except ImportError:
    TRANSLATOR_AVAILABLE = False
    logger.error("❌ Google Translate non disponible")

try:
    from gtts import gTTS
    TTS_AVAILABLE = True
    logger.info("✅ gTTS disponible")
except ImportError:
    TTS_AVAILABLE = False
    logger.error("❌ gTTS non disponible")

class VoiceAIBackend:
    def __init__(self):
        self.whisper_model = None
        self.translator = Translator() if TRANSLATOR_AVAILABLE else None
        
        # Mapping des langues
        self.lang_map = {
            'arabic': 'ar',
            'english': 'en', 
            'french': 'fr',
            'spanish': 'es'
        }
        
        self.lang_names_french = {
            'ar': 'Arabe',
            'en': 'Anglais',
            'fr': 'Français',
            'es': 'Espagnol'
        }
        
        # Créer le dossier static/audio s'il n'existe pas
        os.makedirs('static/audio', exist_ok=True)
        
        logger.info("✅ VoiceAI Backend initialisé (Whisper seulement)")
    
    def load_whisper_model(self, model_size='base'):
        """Charge le modèle Whisper"""
        if not WHISPER_AVAILABLE:
            return None
            
        if self.whisper_model is None:
            try:
                logger.info(f"Chargement du modèle Whisper {model_size}...")
                self.whisper_model = whisper.load_model(model_size)
                logger.info(f"✅ Modèle Whisper {model_size} chargé")
            except Exception as e:
                logger.error(f"❌ Erreur chargement Whisper: {e}")
                return None
        
        return self.whisper_model
    
    def detect_language_whisper(self, audio_file):
        """Détection de langue avec Whisper seulement"""
        model = self.load_whisper_model()
        if model is None:
            return None, {}
        
        try:
            # Charger l'audio
            audio = whisper.load_audio(audio_file)
            audio = whisper.pad_or_trim(audio)
            
            # Faire la détection de langue
            mel = whisper.log_mel_spectrogram(audio).to(model.device)
            _, probs = model.detect_language(mel)
            
            # Obtenir la langue la plus probable
            detected_lang = max(probs, key=probs.get)
            confidence = probs[detected_lang]
            
            # Convertir les scores en format attendu (top 4 langues)
            top_langs = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:4]
            scores = {lang: float(prob) for lang, prob in top_langs}
            
            logger.info(f"Langue détectée par Whisper: {detected_lang} (confiance: {confidence:.3f})")
            logger.info(f"Top langues: {[(lang, f'{prob:.3f}') for lang, prob in top_langs[:3]]}")
            
            return detected_lang, scores
            
        except Exception as e:
            logger.error(f"Erreur détection Whisper: {e}")
            return None, {}
    
    def transcribe_audio(self, audio_file, language=None):
        """Transcription audio avec Whisper"""
        model = self.load_whisper_model()
        if model is None:
            return "Whisper non disponible"
        
        try:
            # Options de transcription simplifiées
            options = {
                'fp16': False,
                'temperature': 0.0,
                'best_of': 1,
                'beam_size': 1
            }
            
            # Ajouter la langue si spécifiée
            if language:
                options['language'] = language
            
            result = model.transcribe(audio_file, **options)
            text = result["text"].strip()
            
            logger.info(f"Transcription réussie: {text[:50]}...")
            return text if text else "Aucun texte détecté"
            
        except Exception as e:
            logger.error(f"Erreur transcription: {e}")
            return f"Erreur de transcription: {str(e)}"
    
    def translate_text(self, text, target_lang='fr'):
        """Traduction de texte"""
        if not self.translator:
            return "Traduction non disponible"
        
        try:
            result = self.translator.translate(text, dest=target_lang)
            translated_text = result.text
            logger.info(f"Traduction réussie vers {target_lang}")
            return translated_text
        except Exception as e:
            logger.error(f"Erreur traduction: {e}")
            return f"Erreur de traduction: {str(e)}"
    
    def text_to_speech_gtts(self, text, lang='fr'):
        """Synthèse vocale avec gTTS"""
        if not TTS_AVAILABLE:
            return None
        
        try:
            # Générer un nom de fichier unique
            filename = f"tts_{uuid.uuid4().hex[:8]}.mp3"
            filepath = os.path.join('static', 'audio', filename)
            
            # Générer l'audio
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(filepath)
            
            logger.info(f"TTS généré: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Erreur TTS: {e}")
            return None

# Initialiser le backend
voice_backend = VoiceAIBackend()

# Initialiser Flask
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

@app.route('/')
def serve_index():
    """Servir le fichier HTML principal"""
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Interface web non trouvée. Assurez-vous que index.html est dans le même dossier.", 404

@app.route('/<path:filename>')
def serve_static(filename):
    """Servir les fichiers statiques"""
    try:
        if filename.endswith('.js'):
            with open(filename, 'r', encoding='utf-8') as f:
                return f.read(), 200, {'Content-Type': 'application/javascript'}
        elif filename.endswith('.css'):
            with open(filename, 'r', encoding='utf-8') as f:
                return f.read(), 200, {'Content-Type': 'text/css'}
        elif filename.startswith('static/'):
            return send_file(filename)
        else:
            return "Fichier non trouvé", 404
    except FileNotFoundError:
        return "Fichier non trouvé", 404

@app.route('/api/process-audio', methods=['POST'])
def api_process_audio():
    """API endpoint pour le traitement audio complet"""
    tmp_file_path = None
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Aucun fichier audio fourni'}), 400
        
        audio_file = request.files['audio']
        mode = request.form.get('mode', 'auto')
        
        logger.info(f"Traitement audio - Mode: {mode}")
        
        # Sauvegarder temporairement
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            tmp_file_path = tmp_file.name
            audio_file.save(tmp_file_path)
        
        results = {}
        
        # Étape 1: Détection de langue avec Whisper
        logger.info("Détection de langue avec Whisper...")
        detected_lang, scores = voice_backend.detect_language_whisper(tmp_file_path)
        
        if detected_lang:
            results['detected_language'] = detected_lang
            results['detected_language_code'] = detected_lang
            results['detected_language_french'] = voice_backend.lang_names_french.get(detected_lang, detected_lang.capitalize())
            results['confidence_scores'] = scores
            logger.info(f"Langue détectée: {detected_lang} -> {results['detected_language_french']}")
        
        # Étape 2: Transcription
        logger.info("Transcription...")
        transcription = voice_backend.transcribe_audio(tmp_file_path, detected_lang)
        results['transcription'] = transcription
        logger.info(f"Transcription: {transcription[:100]}...")
        
        # Étape 3: Traduction (si transcription réussie)
        if transcription and not transcription.startswith("Erreur"):
            if mode == 'auto':
                logger.info("Traduction vers le français...")
                translation = voice_backend.translate_text(transcription, 'fr')
                results['translation'] = translation
                logger.info(f"Traduction: {translation[:100]}...")
        
        logger.info("Traitement terminé avec succès")
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Erreur traitement audio: {e}")
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Nettoyer le fichier temporaire
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)
            logger.info("Fichier temporaire nettoyé")

@app.route('/api/text-to-speech', methods=['POST'])
def api_text_to_speech():
    """API endpoint pour la synthèse vocale"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        lang = data.get('language', 'fr')
        
        if not text:
            return jsonify({'error': 'Aucun texte fourni'}), 400
        
        logger.info(f"Génération TTS - Langue: {lang}")
        
        # Générer l'audio
        audio_file = voice_backend.text_to_speech_gtts(text, lang)
        
        if audio_file:
            # Retourner l'URL du fichier audio
            audio_url = f"/{audio_file}"
            return jsonify({
                'success': True,
                'audio_url': audio_url,
                'message': 'Synthèse vocale réussie'
            })
        else:
            return jsonify({'error': 'Génération TTS échouée'}), 500
                
    except Exception as e:
        logger.error(f"Erreur TTS: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def api_health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'whisper_available': WHISPER_AVAILABLE,
        'translator_available': TRANSLATOR_AVAILABLE,
        'tts_available': TTS_AVAILABLE,
        'model_loaded': True,  # Toujours vrai car on charge à la demande
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("="*60)
    print("🎤 VOICEAI - BACKEND WHISPER SEULEMENT")
    print("="*60)
    print(f"✅ Whisper: {'Disponible' if WHISPER_AVAILABLE else 'Non disponible'}")
    print(f"✅ Traducteur: {'Disponible' if TRANSLATOR_AVAILABLE else 'Non disponible'}")
    print(f"✅ TTS: {'Disponible' if TTS_AVAILABLE else 'Non disponible'}")
    print("="*60)
    print("🌐 Interface disponible sur: http://localhost:5000")
    print("="*60)
    
    app.run(host='0.0.0.0', port=5000, debug=False)