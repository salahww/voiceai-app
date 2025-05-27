#!/usr/bin/env python3
"""
Script de lancement pour VoiceAI Desktop
"""

import os
import sys
import subprocess
import webbrowser
import time

def check_requirements():
    """Vérifier si les dépendances sont installées"""
    try:
        import flask
        import whisper
        import googletrans
        import gtts
        import librosa
        print("✅ Toutes les dépendances sont installées")
        return True
    except ImportError as e:
        print(f"❌ Dépendance manquante: {e}")
        print("📦 Installation des dépendances...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Dépendances installées avec succès")
            return True
        except subprocess.CalledProcessError:
            print("❌ Erreur lors de l'installation des dépendances")
            return False

def main():
    """Fonction principale"""
    print("="*60)
    print("🎤 LANCEMENT DE VOICEAI DESKTOP")
    print("="*60)
    
    # Vérifier les dépendances
    if not check_requirements():
        input("Appuyez sur Entrée pour quitter...")
        return
    
    print("🚀 Démarrage du serveur...")
    
    # Démarrer le serveur en arrière-plan
    try:
        # Lancer le backend
        process = subprocess.Popen([sys.executable, "backend_whisper_only.py"])
        
        # Attendre que le serveur démarre
        time.sleep(3)
        
        # Ouvrir le navigateur
        print("🌐 Ouverture de l'interface web...")
        webbrowser.open("http://localhost:5000")
        
        print("="*60)
        print("✅ VoiceAI Desktop est maintenant en cours d'exécution!")
        print("🌐 Interface: http://localhost:5000")
        print("❌ Pour arrêter: Ctrl+C ou fermez cette fenêtre")
        print("="*60)
        
        # Attendre que l'utilisateur arrête le serveur
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Arrêt du serveur...")
            process.terminate()
            process.wait()
            print("✅ VoiceAI Desktop arrêté")
            
    except Exception as e:
        print(f"❌ Erreur lors du démarrage: {e}")
        input("Appuyez sur Entrée pour quitter...")

if __name__ == "__main__":
    main()