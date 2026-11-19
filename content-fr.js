// French text for everything studio.js renders. Each entry mirrors the English data
// by position and carries text only: media, links and sizes stay in studio.js.
// Paper and competition titles stay in their original (English) form.
const N=' ';

export const projects=[
  {name:'Robot auto-équilibré',field:'Commande embarquée',text:'Pour mon projet de R&D de MSc à l’ESIGELEC, j’ai construit un robot à deux roues autour d’un Arduino Nano et d’un Raspberry Pi. Le Nano exécute la boucle d’équilibre, tandis que le Pi gère la perception et les commandes de haut niveau.',caption:'Robot auto-équilibré · images du prototype'},
  {name:'Drone médical',field:'Systèmes de vol',text:'J’ai intégré un contrôleur de vol Pixhawk et un ordinateur compagnon Raspberry Pi dans un quadricoptère de livraison médicale. Le projet réunissait navigation par points de passage, électronique embarquée et télémétrie.',caption:'Quadricoptère médical · images du projet'},
  {name:'VeggieBot · UR16e',field:'Apprentissage robotique',text:'Au CESI LINEACT avec IMT Atlantique, j’ai appris à un UR16e des tâches de manipulation en cuisine à partir de démonstrations humaines. Mon travail reliait la téléopération, l’enregistrement multicaméra, l’entraînement des politiques et les essais sur le robot réel.',caption:'Caméra frontale · démonstration VeggieBot enregistrée, octobre 2026'},
  {name:'Prothèse de bras bionique',field:'Robotique médicale',text:`J’ai conçu une prothèse de bras imprimée en 3D et actionnée par servomoteurs, avec un circuit de capteurs EMG sur mesure qui lit les signaux musculaires du membre résiduel pour commander la préhension. Les pièces coûtent moins de 50${N}€, la conception fait l’objet d’une demande de brevet indien et le travail a été publié dans AIP Conference Proceedings.`,caption:'Prothèse de bras bionique · images du prototype'}
];

export const skillGroups=[
  {area:'Apprentissage robotique et IA',skills:['Apprentissage robotique','Apprentissage par renforcement','Apprentissage par imitation','Modèles vision-langage-action (VLA)','Modèles du monde (world models)','Modèles de fondation pour la robotique','Transfert simulation-réel (sim-to-real)','Entraînement et évaluation de politiques','Fine-tuning de modèles (LoRA)','Apprentissage automatique','Apprentissage profond','Grands modèles de langage (LLM)','IA multimodale','IA embarquée et hors ligne','Collecte et curation de jeux de données']},
  {area:'Robotique et commande',skills:['Robotique','Manipulation robotique','Robots humanoïdes','Locomotion à pattes','Robots mobiles','Systèmes de commande','Contrôle de mouvement','Commande de moteurs','Cinématique et dynamique','Planification de trajectoire et de mouvement','Localisation et cartographie (SLAM)','Navigation','Téléopération','Simulation robotique','Mécatronique','Actionneurs et codeurs']},
  {area:'Systèmes embarqués',skills:['Logiciel embarqué','Développement de firmware','Microcontrôleurs','Systèmes d’exploitation temps réel','Linux embarqué et pilotes','Protocoles de communication','IoT et M2M','Programmation bas niveau','Conception FPGA et SoC','Traitement numérique du signal']},
  {area:'Électronique',skills:['Conception de circuits','Conception de PCB','Électronique analogique et numérique','Capteurs et instrumentation','Conditionnement de signal','Variateurs de moteurs','Compatibilité électromagnétique (CEM)','Débogage matériel','Soudure et prototypage']},
  {area:'Perception et vision',skills:['Vision par ordinateur','Traitement d’images','Détection d’objets','Calibration de caméras','Systèmes multicaméras','Fusion de capteurs','Reconnaissance vocale']},
  {area:'Conception mécanique et fabrication',skills:['Conception mécanique','Modélisation CAO','Conception de mécanismes et d’engrenages','Analyse des tolérances','Conception pour la fabrication (DFM)','Impression 3D','Prototypage rapide','Usinage CNC','Découpe laser','Simulation éléments finis et CFD','Aérodynamique','Conception de drones']},
  {area:'Tests, sûreté et automatisation',skills:['Tests et validation (V&V)','Tests hardware-in-the-loop (HIL)','Développement en cycle en V','Sécurité fonctionnelle','MISRA C','Automatisme industriel','Programmation d’automates (API)','Intégration système','Débogage et dépannage']},
  {area:'Logiciels et outils',skills:['Python','C','C++','C embarqué','Java','MATLAB / Simulink','LabVIEW','ROS 2','PyTorch','LeRobot','NVIDIA Isaac Sim','MuJoCo','OpenCV','Linux','Git','Docker','CI/CD','SolidWorks','ANSYS','KiCad','VHDL','Android','Web (HTML, CSS, JS)']},
  {area:'Leadership et langues',skills:['Direction d’équipe','Enseignement et mentorat en robotique','Gestion de projet','Recherche et publications','Présentations techniques','Anglais','Français (B1)','Hindi']}
];

export const research=[
  {type:'Article de conférence',role:'Premier auteur',text:`Le bras bionique imprimé en 3D, à préhension commandée par EMG, réalisé avec environ 50${N}€ de pièces.`},
  {type:'Article de revue',role:'Coauteur',text:'Recherche de B.Tech comparant des profils d’aile basse vitesse pour petits avions et drones.'},
  {type:'Demande de brevet',venue:`Demande de brevet indien n°${N}202311042415`,role:'Inventeur',text:'Conception d’une prothèse de bras personnalisable, déposée avec la Lovely Professional University.'}
];

export const awards=[
  {place:'1er prix',date:'Novembre 2019'},
  {place:'2e prix',date:'Novembre 2019'},
  {place:'1re place',date:'Janvier 2020'},
  {place:'1re place',date:'Janvier 2020'},
  {place:'3e place',date:'2021'},
  {place:'1re place',date:'2021'}
];

export const journey=[
  {years:'2018 – 2022',title:'B.Tech en génie mécanique',org:'Lovely Professional University, Inde',text:'Spécialisation en robotique et automatisation. J’y ai construit des drones, un bras à 5 degrés de liberté et une prothèse de bras bionique, et j’ai été responsable technique de la communauté robotique de l’université.'},
  {years:'Juil. 2022 – oct. 2023',title:'Formateur en robotique',org:'Witty International School, Inde',text:'Enseignement de l’électronique, de la CAO, de l’impression 3D, de la programmation et de la construction de robots, de drones et de mécanismes à plus de 900 élèves, et accompagnement de plus de dix projets d’élèves jusqu’à des prototypes fonctionnels.'},
  {years:'Oct. 2023 – oct. 2024',title:'Responsable technique adjoint',org:'Learning Links Foundation, Mumbai',text:'Développement de kits de robotique éducative, de la conception mécanique et de l’électronique jusqu’au firmware et à la fabrication, et direction d’une équipe de 12 ingénieurs réalisant des drones pilotés par gestes et des robots humanoïdes connectés (IoT).'},
  {years:'Sept. 2024 – déc. 2026',title:'MSc en systèmes électroniques embarqués',org:'ESIGELEC, Rouen, France',text:`C embarqué, systèmes d’exploitation temps réel, conception de SoC et Linux embarqué. Classé premier en programmation C, en systèmes temps réel et en projet de R&D${N}: mon robot auto-équilibré.`},
  {years:'2026 – aujourd’hui',title:'Stagiaire de recherche en robotique',org:'CESI LINEACT × IMT Atlantique, Rouen',text:`VeggieBot${N}: apprendre des tâches de cuisine à un UR16e à partir de démonstrations humaines, avec la téléopération par Quest, l’acquisition multicaméra sur un Jetson et des politiques VLA comme π0.5 et SmolVLA testées sur le robot réel.`}
];

// Project books, by project id. Spreads line up with the English ones by position.
export const books={
  balancer:{
    title:'Robot auto-équilibré',subtitle:'Projet de R&D de MSc · ESIGELEC · déc. 2025 – janv. 2026',
    coverAlt:'Le robot auto-équilibré sur un parquet, avec LiDAR, caméra et capteurs à ultrasons',
    spreads:[
      {caption:`Parler au robot. Une demande orale — «${N}Can you move forward for me?${N}» (peux-tu avancer${N}?) — est transformée par la couche d’IA en commande de déplacement, et le robot avance.`,
       kicker:'Le projet',title:'Un robot qui tient sur deux roues — et qui écoute',
       body:[`Un robot à deux roues est un pendule inversé${N}: il est toujours sur le point de tomber. Il ne reste debout qu’en ramenant ses roues sous son centre de gravité, encore et encore, à chaque fraction de seconde.`,
             `Je l’ai construit pour mon <b>projet de R&amp;D de dernière année de MSc à l’ESIGELEC</b>, avec un objectif au-delà de l’équilibre${N}: lui donner une <b>IA embarquée</b>, pour qu’il suffise de lui dire quoi faire.`,
             {specs:[['Équilibre et moteurs','Arduino Nano'],['Vision et IA','Raspberry Pi'],['Capteurs','IMU, caméra, LiDAR, ultrasons'],['Électronique','PCB sur mesure']]}]},
      {caption:`Tour du matériel${N}: le LiDAR au sommet, la caméra, deux capteurs à ultrasons, les roues et la motorisation, et l’empilement électronique — piloté depuis un ordinateur portable.`,
       kicker:'Fonctionnement',title:'Deux cerveaux, un seul corps',
       body:['Le travail est réparti entre deux calculateurs, chacun faisant ce qu’il sait faire de mieux.',
             {list:['<b>Arduino Nano — les réflexes.</b> Il lit l’IMU, estime l’inclinaison du robot et exécute la boucle d’équilibre par retour d’état (LQR) qui commande les moteurs pour rattraper la chute.',
                    '<b>Raspberry Pi — le cerveau.</b> Il gère la caméra, le LiDAR et l’IA, décide où aller et envoie des commandes simples au Nano par liaison série.',
                    `<b>PCB sur mesure.</b> Une seule carte relie l’IMU, les drivers moteurs, le Nano et le Pi${N}: le câblage reste court et le robot compact.`]},
             'Garder la boucle d’équilibre rapide sur son propre microcontrôleur garantit que rien de ce que fait le Pi — vision, cartographie ou IA — ne peut faire tomber le robot.']},
      {caption:'Voir les personnes. La caméra du Pi suit la posture d’une personne avec MediaPipe — l’entrée du mode suivi.',
       kicker:'Ce qu’il sait faire',title:'Quatre façons de le piloter',
       body:[{list:[`<b>Manuel.</b> Piloté depuis un ordinateur portable en Wi-Fi${N}; le Pi relaie chaque commande au Nano.`,
                    '<b>Suivi de personne.</b> MediaPipe suit une personne dans l’image, et le robot décide d’avancer, de reculer ou de tourner pour rester avec elle.',
                    '<b>Cartographie et navigation.</b> Le LiDAR balaie la pièce pour que le robot la cartographie et se rende seul d’un point A à un point B.',
                    `<b>Pilotage par IA.</b> Dites-lui ce que vous voulez en langage courant${N}: l’IA comprend la demande, appelle le robot via une API et le commande entièrement.`]},
             {chips:['Commande de pendule inversé','Réglage LQR et PID','Mesure inertielle (IMU)','Motorisation','PCB sur mesure','Arduino et C embarqué','Raspberry Pi et Python','Vision MediaPipe','SLAM LiDAR','Intégration de LLM']}]}
    ]
  },
  uav:{
    title:'Quadricoptère de livraison médicale',subtitle:'Drone autonome · 2021',
    coverAlt:'Le quadricoptère médical posé au sol',
    spreads:[
      {caption:'Vol de nuit et radiocommande utilisée pour le piloter.',
       kicker:'Le projet',title:'Un drone conçu pour transporter des médicaments',
       body:['Un quadricoptère autonome conçu pour acheminer du matériel médical là où les routes sont lentes ou coupées.',
             'J’ai intégré un contrôleur de vol <b>Pixhawk</b> et un ordinateur compagnon <b>Raspberry Pi 3</b>, afin que le drone suive seul un itinéraire planifié pendant que le Pi gérait la mission de haut niveau.',
             {specs:[['Contrôle de vol','Pixhawk'],['Ordinateur compagnon','Raspberry Pi 3 (SPI)'],['Navigation','Fusion GPS + IMU'],['Télémétrie','GSM'],['Station sol','Mission Planner']]}]},
      {caption:'La structure en CAO avant sa fabrication.',
       kicker:'Fonctionnement',title:'De la CAO aux points de passage',
       body:[{list:['<b>Conception.</b> La structure a d’abord été modélisée en CAO, puis fabriquée et câblée.',
                    '<b>Fusion.</b> Les données GPS et IMU sont fusionnées pour que le drone connaisse sa position et son orientation.',
                    '<b>Missions.</b> Les itinéraires par points de passage sont planifiés dans Mission Planner et volés en autonomie.',
                    '<b>Liaison.</b> La télémétrie GSM maintient le contact au-delà de la portée radio.']},
             'C’est l’un des plus de six types de drones que j’ai construits.',
             {chips:['Conception de drones','Pixhawk / ArduPilot','Raspberry Pi','Fusion de capteurs','Navigation par points de passage','Télémétrie','Modélisation CAO']}]}
    ]
  },
  veggie:{
    title:'VeggieBot',subtitle:'Apprentissage robotique · CESI LINEACT × IMT Atlantique · 2026',
    coverAlt:'L’UR16e avec une pince Robotiq au-dessus de la table de travail',
    spreads:[
      {caption:`La cellule${N}: la pince et sa caméra de poignet, la bouteille, le bol et les caméras. Activez le son pour mes explications (en anglais).`,
       kicker:'Le projet',title:'Apprendre à cuisiner à un bras industriel',
       body:[`Mon stage au <b>CESI LINEACT avec IMT Atlantique</b> (mai – novembre 2026)${N}: faire apprendre un bras industriel <b>UR16e</b> à partir de démonstrations humaines grâce à des modèles vision-langage-action (VLA), puis l’utiliser pour une tâche de cuisine.`,
             `Seul le robot était fourni. J’ai construit tout le reste autour de lui${N}: caméras, téléopération en réalité virtuelle, enregistreur de données, jeux de données, entraînement des modèles et une passerelle qui exécute le modèle sur le vrai bras.`,
             `Trois caméras observent la table${N}: une <b>caméra de poignet</b> voit les doigts s’ouvrir et se fermer, une <b>caméra du dessus</b> donne au modèle une vue d’ensemble, et une <b>caméra isométrique</b> montre tout le robot. Si une vue est masquée, les deux autres prennent le relais.`,
             {specs:[['Robot','UR16e + Robotiq 2F-85'],['Caméras','2 × RealSense D435i + poignet'],['Encadrants','Fabrice Duval (CESI) · Youssef Mourchid (IMT Atlantique)'],['Résultat','16 séquences complètes sur 18']]}]},
      {caption:'Le contrôleur du robot, le Jetson, le commutateur réseau, les ordinateurs portables et le casque Quest 3S, tous sur un même réseau.',
       kicker:'L’installation',title:'Câbler la cellule',
       body:[`Un VLA voit les images des caméras, lit l’état articulaire du robot et une instruction comme <i>«${N}Prends la bouteille${N}»</i>, puis prédit les prochaines consignes articulaires et la commande de la pince. Mais avant tout, chaque appareil doit pouvoir communiquer avec les autres.`,
             {list:[`<b>Jetson Orin Nano${N}: l’ordinateur local.</b> Les trois caméras y sont branchées, et il pilote l’UR16e en Ethernet via RTDE.`,
                    `<b>RODeep${N}: la station GPU du laboratoire.</b> Elle entraîne les modèles et les sert pendant les essais${N}; le Jetson y accède en SSH.`,
                    '<b>Le Quest 3S et les ordinateurs portables</b> rejoignent le même réseau, si bien que les passerelles s’ouvrent depuis n’importe quel appareil.']},
             'Garder la commande du robot en local et le calcul lourd à distance garantit que l’acquisition des caméras et les commandes moteurs n’attendent jamais le modèle, ni mon ordinateur.']},
      {caption:`Vu à travers le Quest 3S en mode passthrough${N}: maintenir le bouton d’activation, puis déplacer le bras à gauche, à droite, en avant, en arrière, vers le haut et vers le bas.`,
       kicker:'Étape 1 · Téléopération',title:'Montrer au robot comment faire',
       body:[`Pour apprendre, un modèle a besoin d’exemples. J’ai développé une passerelle de téléopération pour piloter l’UR16e avec les manettes du <b>Quest 3S</b>${N}: on ouvre le lien de la passerelle dans le navigateur du casque, on entre en WebXR, et le mouvement de la manette devient celui du robot.`,
             {list:['<b>Bouton d’activation.</b> Le bras ne bouge que tant qu’il est maintenu. Relâché, il s’arrête.',
                    '<b>Deux modes.</b> Déplacer la pince dans l’espace, ou maintenir un bouton pour piloter une articulation à la fois.',
                    `<b>Pince et position d’origine.</b> Un bouton ferme les doigts${N}; le bouton central ramène le bras à une position d’origine fixe.`,
                    '<b>Adaptée à la tâche.</b> Vitesse et sens réglables, raccourcis d’enregistrement, et boutons libres associés à des mouvements propres à la tâche.']},
             'Des voyants d’état pour la connexion du navigateur, le suivi du casque, les manettes et le retour du robot montrent d’un coup d’œil où se situe un problème.']},
      {caption:`La passerelle d’enregistrement${N}: les 13 contrôles préalables sont au vert, l’enregistrement peut commencer.`,
       kicker:'Étape 2 · Enregistreur brut',title:'Enregistrer chaque démonstration',
       body:[`Une démonstration, c’est plus qu’une vidéo. Ma <b>passerelle d’enregistrement brut</b> tourne sur le Jetson et gère la collecte depuis une seule page${N}: vues caméra en direct, informations sur la tâche, démarrage et arrêt.`,
             `Avant d’enregistrer, <b>13 contrôles préalables</b> vérifient la pile ROS${N}2, les trois caméras, RTDE sans interruption, le socket, la pince et le Quest.`,
             {list:[`<b>Enregistré${N}:</b> images des trois caméras, mesures articulaires et de l’outil, commande et retour de la pince, horodatages et métadonnées.`,
                    `<b>Vérifié${N}:</b> contrôles de validité, courbes articulaires, les trois vidéos et un rejeu 3D, avant qu’un épisode n’entre dans un jeu de données.`,
                    `<b>Stocké en sécurité${N}:</b> tampon sur le Jetson, puis copie vers l’archive vérifiée par sommes de contrôle${N}; l’enregistrement n’attend jamais un disque lent.`]},
             {stats:[[`≈${N}400`,'démonstrations avec la bouteille'],[`116${N}769`,'images dans le jeu de préhension de 383 épisodes']]}]},
      {caption:`Pi0.5 pilote le bras lors d’un essai de préhension de bloc, le 2 octobre 2026${N}: approche, saisie et levée.`,
       kicker:'Étape 3 · Entraînement',title:'Choisir le modèle',
       body:[`J’ai d’abord validé toute la chaîne sur une tâche simple de saisie de blocs, puis comparé trois modèles sur neuf essais physiques chacun${N}:`,
             {stats:[['3 / 9','ACT'],['≈ 8 / 9','SmolVLA'],['9 / 9','Pi0.5']]},
             `Pi0.5 est devenu le modèle principal. Pour la tâche de la bouteille, je l’ai affiné avec <b>OpenPI et LoRA</b> sur deux GPU${N}:`,
             {list:[`<b>Entrées${N}:</b> trois vues caméra en 224 × 224, six angles articulaires et la valeur de la pince.`,
                    `<b>Sorties${N}:</b> dix consignes futures, de 0,3 à 1,2${N}s à l’avance.`,
                    `<b>Sélection${N}:</b> l’entraînement a duré cinq époques (291${N}923 mises à jour)${N}; des contrôles hors ligne sur un épisode mis de côté ont comparé les points de sauvegarde avant tout essai physique.`]},
             'J’ai aussi exploré OpenVLA et NVIDIA GR00T en chemin.']},
      {caption:`La passerelle d’inférence${N}: choix du point de sauvegarde, ici Pi0.5 entraîné sur environ 400 démonstrations avec la bouteille.`,
       kicker:'Étape 4 · Inférence',title:'La passerelle d’inférence',
       body:['Une fois le modèle entraîné, la passerelle d’inférence l’exécute sur le vrai bras, sans ouvrir de terminal. Elle affiche les caméras en direct, l’état du robot et de la pince, le modèle choisi et les réglages de mouvement.',
             {list:[`<b>La boucle.</b> Le Jetson envoie les images et l’état du robot au modèle sur RODeep, reçoit un bloc d’actions futures, vérifie leur fraîcheur et les exécute localement à 50${N}Hz.`,
                    `<b>Filtre de jerk.</b> Les prédictions brutes donnaient des mouvements saccadés${N}; j’ai donc ajouté une couche de trajectoire Ruckig qui limite vitesse, accélération et jerk. Je l’utilise généralement à 0,15.`,
                    '<b>Essais sûrs.</b> Un mode de répétition sans mouvement, des contrôles automatiques avant chaque essai, un bouton d’arrêt et l’enregistrement de chaque essai.',
                    `<b>Humain dans la boucle.</b> La téléopération fonctionne en parallèle${N}: l’opérateur peut mettre le modèle en pause et reprendre la main.`]},
             `J’ai aussi intégré le real-time chunking (RTC) à titre expérimental${N}; Pi0.5 seul avec le filtre de jerk se comportait mieux sur le robot.`]},
      {caption:`Personne ne pilote le bras${N}: Pi0.5 va chercher la bouteille et la saisit à partir des seules images des caméras en direct.`,
       kicker:'Étape 5 · Autonomie',title:'Le robot seul aux commandes',
       body:[`Après <b>Start test</b>, seul le modèle pilote le bras${N}: des images fraîches en entrée, des consignes articulaires en sortie. Il s’approche de la bouteille, ferme la pince et la soulève.`,
             `Le modèle n’a pas de signal «${N}terminé${N}»${N}; j’ai donc ajouté une règle de fin fondée sur le retour de la pince. Dès que les doigts restent stables dans la plage de préhension pendant dix secondes, la saisie s’arrête, le bras marque une pause, et l’étape suivante commence.`,
             `J’ai découpé la tâche en étapes au lieu d’entraîner un seul long épisode${N}: la partie la plus difficile, trouver et saisir la bouteille, est celle qui est apprise.`]},
      {caption:'Après la saisie apprise, le bras porte la bouteille jusqu’au bol, l’incline pour verser et la ramène.',
       kicker:'Étape 6 · Le geste culinaire',title:'Saisir, verser, reposer',
       body:[`La tâche complète${N}: saisir la bouteille, la porter jusqu’au bol, verser, puis la reposer. La saisie apprise passe le relais à une démonstration enregistrée qui porte, verse et ramène la bouteille à son rythme d’origine, puis ouvre la pince pour la relâcher.`,
             {stats:[['16 / 18','séquences complètes'],[`88,9${N}%`,'taux de réussite']]},
             `C’est un système hybride${N}: la saisie est apprise, le versement est enregistré. Ce système complet a réussi 16 tentatives sur 18, selon le décompte confirmé par l’opérateur.`,
             `La plateforme est prête pour la suite${N}: des scènes plus variées, une meilleure détection du soulèvement, des démonstrations de rattrapage, et de nouveaux ustensiles et gestes culinaires.`]},
      {caption:'Rapport final de stage (PDF, 48 pages, en anglais).',
       kicker:'Pour aller plus loin',title:'Le rapport complet',
       body:[`<i>Development of a Hardware and Software Platform for Vision-Language-Action Learning on a UR16e</i>${N}: mon rapport final de stage pour le CESI et IMT Atlantique (en anglais).`,
             {list:['La construction de la cellule robotique','La collecte et la préparation des démonstrations','L’entraînement et le choix du modèle','L’exécution du modèle sur le robot','De la saisie de la bouteille au geste culinaire','Les résultats et la suite du projet']},
             {links:[{label:'Lire le rapport'},{label:'Télécharger le PDF'}]},
             {chips:['Apprentissage robotique','Modèles VLA','Pi0.5 · SmolVLA · ACT','Fine-tuning LoRA','Téléopération VR (WebXR)','ROS 2','RTDE','Acquisition multicaméra','NVIDIA Jetson','Lissage de trajectoire','Python']}]}
    ]
  },
  arm:{
    title:'Prothèse de bras bionique',subtitle:'Prothèse imprimée en 3D à bas coût · 2022–2023',
    coverAlt:'La main bionique saisissant une bouteille',
    spreads:[
      {caption:'La main se referme autour d’une bouteille et la tient.',
       kicker:'Le projet',title:'Une main qui coûte moins cher qu’un téléphone',
       body:['Une prothèse de bras personnalisable, imprimée en 3D, avec des doigts et un pouce articulés, conçue pour que celles et ceux qui en ont besoin puissent réellement se l’offrir.',
             'Des servomoteurs tirent des câbles qui jouent le rôle de tendons pour fermer les doigts, et un <b>circuit de capteurs EMG</b> sur mesure lit les signaux musculaires du membre résiduel pour commander la préhension.',
             {specs:[['Fabrication','Imprimée en 3D, doigts et pouce articulés'],['Actionnement','Servomoteurs avec transmission par tendons'],['Commande','Mesure musculaire EMG'],['Coût des pièces',`Moins de 50${N}€`]]}]},
      {caption:'Dessin technique de la main et de l’avant-bras.',
       kicker:'Résultat',title:'Publiée et déposée',
       body:['La conception a été publiée dans un article en premier auteur, <i>Design and fabrication of low-cost prosthetic arm</i>, dans AIP Conference Proceedings (2024), et déposée sous la <b>demande de brevet indien 202311042415</b>.',
             {list:['<b>Conception mécanique</b> des doigts, du pouce et de l’avant-bras en CAO.',`<b>Électronique</b>${N}: conditionnement du signal EMG et commande des servomoteurs.`,'<b>Firmware</b> qui transforme l’activité musculaire en préhension.']},
             {chips:['Robotique médicale','Modélisation CAO','Impression 3D','Mesure EMG','Conditionnement de signal','Commande de servomoteurs']}]}
    ]
  }
};
