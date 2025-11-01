# StariumJS
<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1>✨ StariumJS</h1>

  <p align="center">
    Un jeu rétro en mode texte dans l'espace - Inspiré de Trek 73
    <br />
    Ce projet recrée un jeu qui tournait sur Apple II dans les années 80, maintenant accessible depuis n'importe quel navigateur moderne grâce à JavaScript.
    <br />
    <br />
    <a href="https://github.com/brewalan/StariumJS"><strong>Explorer le code »</strong></a>
    <br />
    <br />
    <a href="https://github.com/brewalan/StariumJS/issues">Signaler un bug</a>
    ·
    <a href="https://github.com/brewalan/StariumJS/issues">Demander une fonctionnalité</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## À propos du projet

StariumJS est un jeu de stratégie spatiale en mode texte qui se joue entièrement au clavier. Vous incarnez le capitaine d'un vaisseau spatial qui doit pacifier une zone de l'espace en neutralisant tous les vaisseaux ennemis (les Kipicks).

### Caractéristiques principales

- 🎮 **Jeu au clavier** : Toutes les commandes sont accessibles au clavier pour une expérience de jeu fluide
- 🚀 **Rétro gaming** : Inspiration directe des jeux spatiaux des années 70-80
- 🌐 **100% JavaScript** : Aucune dépendance backend, tout fonctionne dans le navigateur
- 📱 **Responsive** : Compatible desktop et tablette (expérience optimale sur ordinateur)
- ✨ **Sans dépendances payantes** : Utilise uniquement des technologies open-source et gratuites

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Structure du projet

```
StariumJS/
├── index.html          # Page d'accueil
├── game.html           # Interface de jeu principale
├── aide.html           # Documentation et aide en ligne
├── privacy.html        # Politique de confidentialité
├── icons.css           # Icônes Unicode (remplace FontAwesome)
├── starium.js          # Logique principale du jeu
├── stariumObject.js    # Définition des objets du jeu
├── settings.js         # Configuration et constantes
├── tableau.js          # Gestion de la carte spatiale
├── sitemap.xml         # Plan du site pour SEO
├── manifest.json       # Web App Manifest
└── images/             # Ressources graphiques
```

### Technologies utilisées

- **HTML5** : Structure sémantique des pages
- **CSS3** : Styles personnalisés et icônes Unicode
- **JavaScript (Vanilla)** : Logique du jeu sans framework
- **Bootstrap 5.2** : Framework CSS pour le responsive design
- **Unicode Emojis** : Icônes gratuites sans dépendance externe

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Démarrage rapide

### Prérequis

Vous avez seulement besoin d'un navigateur web moderne :
- Chrome/Edge (recommandé)
- Firefox
- Safari

### Installation

**Option 1 : Utilisation locale**
```bash
# Cloner le repository
git clone https://github.com/brewalan/StariumJS.git

# Ouvrir le projet
cd StariumJS

# Lancer index.html dans votre navigateur
# Sur Mac/Linux
open index.html

# Sur Windows
start index.html
```

**Option 2 : Serveur local (recommandé pour le développement)**
```bash
# Utiliser Python 3
python -m http.server 8000

# Ou avec Node.js
npx http-server

# Puis ouvrir http://localhost:8000 dans votre navigateur
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Comment jouer

1. Ouvrez `game.html` dans votre navigateur
2. Cliquez sur "Nouvelle partie" et configurez la difficulté
3. Utilisez les commandes au clavier pour contrôler votre vaisseau
4. Consultez `aide.html` pour la liste complète des commandes

### Commandes principales

- **1** : Mouvement du vaisseau (tableau ou secteur)
- **2** : Régénération d'énergie
- **3** : Radar longue portée
- **4** : Tir laser
- **5** : Lancement de torpille
- **8** : Envoyer une sonde
- **9** : Ajuster le bouclier

_Pour plus de détails, consultez le fichier [aide.html](aide.html)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Migration des icônes FontAwesome vers Unicode (gratuit)
- [x] Support responsive pour tablettes
- [x] Ajout d'un système d'aide en ligne
- [ ] Mode multijoueur local
- [ ] Sauvegarde de progression
- [ ] Tableaux de scores
- [ ] Support PWA (Progressive Web App)
- [ ] Mode sombre

Consultez les [issues ouvertes](https://github.com/brewalan/StariumJS/issues) pour la liste complète des fonctionnalités proposées et bugs connus.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Bonnes pratiques de développement

### Architecture du code

Le projet suit une architecture modulaire :

- **settings.js** : Centralise toutes les constantes et configurations
- **stariumObject.js** : Définit les classes (Vaisseau, Kipick, Base, etc.)
- **tableau.js** : Gère la carte spatiale et les secteurs
- **starium.js** : Contrôleur principal du jeu

### Conventions de code

- **Nommage** : Variables en camelCase, constantes en UPPER_SNAKE_CASE
- **Commentaires** : Français pour la documentation
- **Indentation** : 4 espaces
- **Pas de dépendances externes payantes** : Uniquement des ressources gratuites et open-source

### Développement

Pour contribuer au projet :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Testez votre code dans différents navigateurs
4. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
5. Push vers la branche (`git push origin feature/AmazingFeature`)
6. Ouvrez une Pull Request

### Tests

Le jeu peut être testé manuellement :
- Testez chaque commande (1-12)
- Vérifiez le responsive sur différentes tailles d'écran
- Validez les alertes et messages
- Testez les conditions de victoire/défaite

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Project Link: [https://github.com/brewalan/StariumJS](https://github.com/brewalan/StariumJS)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Remerciements

* [Bootstrap](https://getbootstrap.com) - Framework CSS responsive
* [Trek 73 / Star Trek](https://en.wikipedia.org/wiki/Star_Trek_(1971_video_game)) - Inspiration originale du jeu
* [Unicode Consortium](https://unicode.org) - Pour les emojis utilisés comme icônes
* [GitHub Pages](https://pages.github.com) - Hébergement du projet

## Changelog

### Version 1.1.0 (2025)
- ✨ Remplacement de FontAwesome par des icônes Unicode gratuites
- 📝 Documentation améliorée du README
- 🏗️ Structure de projet documentée

### Version 1.0.0 (2022)
- 🎮 Version initiale du jeu
- 🚀 Toutes les fonctionnalités de base implémentées

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

**Note importante** : Ce projet n'utilise plus FontAwesome. Les icônes sont maintenant gérées via le fichier `icons.css` qui utilise des caractères Unicode gratuits. Cette migration élimine toute dépendance payante et améliore les performances de chargement.
