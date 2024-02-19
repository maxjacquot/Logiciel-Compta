import subprocess
import os
import requests
from packaging import version

def get_latest_release_info():
    # Assurez-vous de remplacer <username> et <repository> par vos propres informations
    api_url = "https://api.github.com/repos/PxMaax/Logiciel-Compta/releases/latest"
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Erreur lors de la récupération des informations de release: HTTP {response.status_code}")

def download_new_version(download_url, target_path):
    print('target_path : ' , target_path)
    response = requests.get(download_url)
    print('response' , response)
    with open(target_path, 'wb') as file:
        print('file : ', file)
        file.write(response.content)

def run_application(executable_path):
    # S'assure que le chemin vers l'exécutable est correct et le lance
    try:
        subprocess.run(executable_path, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors du lancement de {executable_path}: {e}")

def update_application():
    release_info = get_latest_release_info()
    latest_version = release_info['tag_name']
    # Supposons que vous stockez la version actuelle dans un fichier
    with open('current_version.txt', 'r') as file:
        current_version = file.read().strip()
    
    if version.parse(latest_version) > version.parse(current_version):
        print(f"Une nouvelle version {latest_version} est disponible.")
        asset = next((asset for asset in release_info['assets'] if asset['name'].lower() == 'main.exe'), None)
        print('asset' , asset)
        if asset:
            download_url = asset['browser_download_url']
            print('download_url : ', download_url)
            download_new_version(download_url, 'main.exe')
            print("Mise à jour téléchargée. Application mise à jour.")
            # Mettez à jour le fichier de version actuelle
            with open('current_version.txt', 'w') as file:
                file.write(latest_version)
            # Lancez l'application mise à jour
            run_application('main.exe')
        else:
            print("Aucun exécutable trouvé pour la mise à jour.")
    else:
        print("Votre application est à jour.")
        # Lancez l'application actuelle si aucune mise à jour n'est nécessaire
        run_application('main.exe')

if __name__ == "__main__":
    update_application()
