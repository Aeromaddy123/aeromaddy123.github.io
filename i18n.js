// Site language: English by default, French at the flick of the header switch.
// The choice is remembered for the visitor (and ?lang=fr / ?lang=en forces it).
// Page text in index.html carries data-i18n keys (data-i18n-attr="attr:key; …" for
// attributes) and is swapped in place; scripts call t() for short interface strings
// and listen for the "studio:lang" event to re-render their own content.
const KEY='kc-lang';
let lang=(()=>{
  try{
    const q=new URLSearchParams(location.search).get('lang');
    if(q==='fr'||q==='en')return q;
    const saved=localStorage.getItem(KEY);
    if(saved==='fr'||saved==='en')return saved;
  }catch{}
  return 'en';
})();
export const getLang=()=>lang;
export const isFr=()=>lang==='fr';

const NB=' ';
// Short interface strings used by the scripts, keyed by their English text.
const UI={
  '3D models':'modèles 3D','Ready!':'Prêt'+NB+'!','Tightening the bolts':'On serre les boulons','Charging the batteries':'On charge les batteries',
  'Calibrating the UR16e':'On calibre l’UR16e','Passing the red block':'On se passe le bloc rouge','Teaching the G1 to stand':'Le G1 apprend à tenir debout',
  'Mapping the forest':'On cartographie la forêt','Warming up the soldering iron':'Le fer à souder chauffe','Polishing the camera lenses':'On nettoie les objectifs',
  'Play':'Lecture','Pause':'Pause','Back 5 seconds':'Reculer de 5 secondes','Forward 5 seconds':'Avancer de 5 secondes',
  'Video timeline':'Barre de progression de la vidéo','Turn sound on':'Activer le son','Turn sound off':'Couper le son',
  'Project book':'Carnet de projet','project book':'carnet de projet','Close book':'Fermer le carnet','Close the book':'Fermer le carnet',
  '‹ Previous':'‹ Précédent','Next ›':'Suivant ›','Pages':'Pages','Cover':'Couverture','Contents':'Sommaire','The end':'Fin',
  'Built with':'Réalisé avec','Skills in this build':'Compétences mobilisées','Thanks for reading.':'Merci de votre lecture.',
  'Kishan Chhari · Robotics':'Kishan Chhari · Robotique','PDF · Open':'PDF · Ouvrir','Open':'Ouvrir',
  'Read the paper ↗':'Lire l’article ↗','view certificate':'voir le certificat','Certificate':'Certificat',
  'Scroll to the next page':'Aller à la page suivante','Open project':'Ouvrir le projet','Page scroll position':'Position dans la page',
  'Close':'Fermer'
};
export function t(s){return lang==='fr'&&UI[s]!=null?UI[s]:s;}
// "Label: value" with French spacing before the colon.
export const colon=()=>lang==='fr'?NB+':':':';

// Page text from index.html, keyed by data-i18n. English comes from the page itself.
const PAGE_FR={
  'doc.title':'Kishan Chhari — Studio de robotique',
  'skip':'Aller aux projets',
  'home.aria':'Accueil de Kishan Chhari',
  'nav.aria':'Navigation principale',
  'nav.bench':'Atelier','nav.skills':'Compétences','nav.journey':'Parcours','nav.contact':'Contact',
  'nav.resume':'CV <span aria-hidden="true">↓</span>',
  'lang.group':'Langue',
  'home.drawing':'Dessin technique du bras bionique',
  'home.arrow':'Descendre vers la scène de la vitre',
  'glass.aria':'Un robot écrit sur une vitre',
  'glass.accessible':`Un robot écrit «${NB}Je suis ingénieur en robotique.${NB}» sur la vitre.`,
  'glass.written':'Je suis ingénieur en robotique.',
  'about.kicker':'<i></i> À propos',
  'about.title':'Engrenages, circuits <span>et gradients</span>.',
  'about.lead1':`Je suis l’ingénieur qui maîtrise un robot de bout en bout. Formé au génie mécanique, je me suis plongé dans les systèmes embarqués, et je travaille aujourd’hui sur l’apprentissage robotique${NB}: je peux concevoir le réducteur, dessiner le circuit, écrire le firmware et entraîner la politique qui pilote le tout.`,
  'about.lead2':'En chemin, j’ai construit un bras bionique qui fait l’objet d’une demande de brevet, un drone de livraison médicale et un bras à cinq axes. J’ai publié des travaux de recherche en premier auteur, remporté six compétitions d’ingénierie et enseigné la robotique à la nouvelle génération de makers. Plus récemment, au CESI LINEACT avec IMT Atlantique, j’ai appris à un UR16e à s’occuper d’une cuisine à partir de démonstrations humaines.',
  'about.punch':'Confiez-moi un problème qui doit bouger, et je l’emmènerai du premier croquis jusqu’à un robot qui fonctionne.',
  'about.facts':'Points forts',
  'about.f1':'B.Tech génie mécanique · LPU','about.f2':'MSc systèmes embarqués · ESIGELEC','about.f3':'Publication en premier auteur',
  'about.f4':'Demande de brevet déposée','about.f5':'6 prix en compétition',
  'bench.kicker':'<i></i> Projets choisis',
  'bench.title':'L’atelier<span>.</span>',
  'bench.hint':'Cliquez sur un projet lumineux pour découvrir sa réalisation et ses vidéos.',
  'bench.stages':'Établis','bench.s1':'Robotique et électronique','bench.s2':'Projets et prototypes','bench.s3':'Cellule VeggieBot','bench.s4':'Apprentissage robotique',
  'bench.projects':'Projets',
  'skills.kicker':'<i></i> Compétences',
  'skills.title':'Du matériel <span>au logiciel</span>.',
  'research.kicker':'<i></i> Recherche et prix',
  'research.title':'Publié, déposé <span>et gagné</span>.',
  'research.sub':'Recherche','awards.sub':'Prix',
  'journey.kicker':'<i></i> Parcours',
  'journey.title':'Le parcours<span>.</span>',
  'journey.steps':'Chronologie du parcours',
  'contact.kicker':'<i></i> Contact',
  'contact.title':'Construisons <span>quelque chose</span>.',
  'contact.lead':'Je recherche des postes en robotique, en systèmes embarqués et en apprentissage robotique, ainsi que des thèses financées. Si vous travaillez sur des robots qui sortent du laboratoire, parlons-en.',
  'contact.email':'E-mail','contact.phone':'Téléphone',
  'contact.cv':'Télécharger le CV <span aria-hidden="true">↓</span>',
  'footer.touch':'Me contacter ↗',
  'footer.credits':'Crédits des modèles 3D ↗',
  'loader.aria':'Chargement de l’atelier 3D','loader.skip':'Entrer maintenant →',
  'dialog.close':'Fermer'
};
const original=new Map();
function remember(node,slot,value){
  let m=original.get(node);if(!m)original.set(node,m={});
  if(!(slot in m))m[slot]=value;
  return m[slot];
}
function applyPage(){
  const fr=lang==='fr';
  document.documentElement.lang=lang;
  const title=remember(document,'title',document.title);
  document.title=fr?PAGE_FR['doc.title']:title;
  for(const n of document.querySelectorAll('[data-i18n]')){
    const en=remember(n,'html',n.innerHTML),k=n.dataset.i18n;
    const next=fr&&PAGE_FR[k]!=null?PAGE_FR[k]:en;
    if(n.innerHTML!==next)n.innerHTML=next;
  }
  for(const n of document.querySelectorAll('[data-i18n-attr]')){
    for(const pair of n.dataset.i18nAttr.split(';')){
      const [attr,k]=pair.split(':').map(s=>s.trim());if(!attr||!k)continue;
      const en=remember(n,'@'+attr,n.getAttribute(attr));
      n.setAttribute(attr,fr&&PAGE_FR[k]!=null?PAGE_FR[k]:en);
    }
  }
  for(const s of document.querySelectorAll('.lang-switch')){
    s.querySelector('[role="switch"]')?.setAttribute('aria-checked',String(fr));
    s.classList.toggle('is-fr',fr);
  }
}
export function setLang(next){
  if(next!=='fr'&&next!=='en'||next===lang)return;
  lang=next;
  try{localStorage.setItem(KEY,lang);}catch{}
  applyPage();
  document.dispatchEvent(new CustomEvent('studio:lang',{detail:{lang}}));
}
export function onLang(fn){document.addEventListener('studio:lang',()=>fn(lang));}

// The header switch: EN on the left, FR on the right.
function mountSwitch(){
  const nav=document.querySelector('header nav');if(!nav||nav.querySelector('.lang-switch'))return;
  const box=document.createElement('div');
  box.className='lang-switch';box.setAttribute('role','group');
  box.dataset.i18nAttr='aria-label:lang.group';box.setAttribute('aria-label','Language');
  box.innerHTML=`<button type="button" class="lang-opt" data-lang="en" lang="en" tabindex="-1" aria-hidden="true">EN</button><button type="button" class="lang-toggle" role="switch" aria-checked="false" aria-label="Français (French)"><i></i></button><button type="button" class="lang-opt" data-lang="fr" lang="fr" tabindex="-1" aria-hidden="true">FR</button>`;
  box.addEventListener('click',e=>{
    const opt=e.target.closest('[data-lang]');
    if(opt)setLang(opt.dataset.lang);
    else if(e.target.closest('.lang-toggle'))setLang(lang==='fr'?'en':'fr');
  });
  nav.append(box);
}
mountSwitch();
applyPage();
