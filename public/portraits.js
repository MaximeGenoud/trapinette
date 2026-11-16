/* Portraits de la galerie du Manoir — partagés entre le navigateur et le serveur (images d'aperçu) */
(function (racine) {
"use strict";
const GALERIE = [
  { id:"taverniere", nom:"La tavernière" }, { id:"barde", nom:"Le barde" }, { id:"nain", nom:"Le nain" }, { id:"elfe", nom:"L'elfe" },
  { id:"mage", nom:"Le mage" }, { id:"voleuse", nom:"La voleuse" }, { id:"paladin", nom:"Le paladin" }, { id:"orque", nom:"L'orque" },
  { id:"pirate", nom:"Le corsaire" }, { id:"druidesse", nom:"La druidesse" },
];
function svgPortrait(id){
  const P = {
    taverniere:{fond:["#b8732e","#4a2410"],peau:"#eab896",cheveux:"#8a3a1c",habit:"#6b2d2a",col:"#f1e2c2",coiffure:"chignon",bouche:"sourire"},
    barde:{fond:["#3f7a4a","#16301b"],peau:"#dca27c",cheveux:"#5a3418",habit:"#2f5a8a",col:"#e8d6a8",coiffure:"court",chapeau:"barde",moustache:"#5a3418",bouche:"sourire"},
    nain:{fond:["#8a5a2a","#2e1a0a"],peau:"#e0a47e",cheveux:"#c2561c",habit:"#5a4a3a",col:"#8a8f96",coiffure:"chauve",barbe:"nain",casque:"nain",bouche:"neutre"},
    elfe:{fond:["#4f7a8a","#15262e"],peau:"#f2d3b4",cheveux:"#f0d890",habit:"#3c6a4a",col:"#d8c080",coiffure:"long",oreilles:"pointues",diademe:true,bouche:"neutre"},
    mage:{fond:["#3a3a8a","#12122e"],peau:"#e6bf9c",cheveux:"#e8e8ee",habit:"#2a2a6a",col:"#c8a040",coiffure:"chauve",chapeau:"mage",barbe:"mage",bouche:"neutre"},
    voleuse:{fond:["#5a4a6a","#181020"],peau:"#c98c68",cheveux:"#1c1410",habit:"#262028",col:"#3a3040",coiffure:"court",capuche:"#2e2632",bouche:"malice"},
    paladin:{fond:["#8a7a4a","#2a2210"],peau:"#e8b894",cheveux:"#6a4a2a",habit:"#c8ccd4",col:"#d8b050",coiffure:"court",casque:"paladin",bouche:"neutre"},
    orque:{fond:["#5a6a2a","#1a200a"],peau:"#7a9a4a",cheveux:"#1a1a14",habit:"#5a3a24",col:"#8a6a3a",coiffure:"toupet",defenses:true,bouche:"grogne",oreilles:"pointues"},
    pirate:{fond:["#2a5a7a","#0a1a26"],peau:"#d49a72",cheveux:"#1a1410",habit:"#7a1e1e",col:"#e8d6a8",coiffure:"long",chapeau:"tricorne",barbe:"courte",bandeau:true,bouche:"malice"},
    druidesse:{fond:["#4a7a3a","#132410"],peau:"#8d5a3b",cheveux:"#2a1a10",habit:"#5a6a2a",col:"#b89a5a",coiffure:"tresses",couronne:true,bouche:"sourire"},
  }[id];
  if (!P) return null;
  const k="p"+id, peauOmbre="rgba(80,30,10,.22)";
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="${k}f" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${P.fond[0]}"/><stop offset="1" stop-color="${P.fond[1]}"/></radialGradient>
    <linearGradient id="${k}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.habit}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#${k}f)"/>
    <circle cx="50" cy="40" r="34" fill="#fff" opacity=".06"/>`;
  if (P.capuche) s+=`<path d="M18 100 C16 60 26 16 50 14 C74 16 84 60 82 100Z" fill="${P.capuche}"/>`;
  if (P.coiffure==="long") s+=`<path d="M30 40 C28 22 72 22 70 40 L74 82 C66 78 62 72 61 66 L39 66 C38 72 34 78 26 82Z" fill="${P.cheveux}"/>`;
  if (P.coiffure==="tresses") s+=`<path d="M31 42 C30 24 70 24 69 42 L70 70 L63 72 L62 60 L38 60 L37 72 L30 70Z" fill="${P.cheveux}"/><circle cx="33" cy="76" r="3.5" fill="${P.cheveux}"/><circle cx="67" cy="76" r="3.5" fill="${P.cheveux}"/>`;
  s+=`<path d="M12 100 C14 80 30 70 50 70 C70 70 86 80 88 100Z" fill="url(#${k}h)"/>`;
  s+=`<path d="M38 72 L50 84 L62 72" fill="none" stroke="${P.col}" stroke-width="4"/>`;
  if (P.casque==="paladin") s+=`<path d="M22 100 C22 84 30 74 36 72 L64 72 C70 74 78 84 78 100Z" fill="#b8bcc4" opacity=".9"/><path d="M30 86 h40" stroke="#8a8e96" stroke-width="2"/>`;
  s+=`<rect x="43" y="58" width="14" height="14" rx="4" fill="${P.peau}"/><rect x="43" y="58" width="14" height="6" fill="${peauOmbre}"/>`;
  if (P.oreilles==="pointues") s+=`<path d="M33 44 L22 34 L32 52Z" fill="${P.peau}"/><path d="M67 44 L78 34 L68 52Z" fill="${P.peau}"/>`;
  else s+=`<ellipse cx="32.5" cy="47" rx="3.2" ry="5" fill="${P.peau}"/><ellipse cx="67.5" cy="47" rx="3.2" ry="5" fill="${P.peau}"/>`;
  s+=`<ellipse cx="50" cy="45" rx="17" ry="20" fill="${P.peau}"/><ellipse cx="50" cy="58" rx="13" ry="7" fill="${peauOmbre}" opacity=".5"/>`;
  s+=`<ellipse cx="41" cy="52" rx="4" ry="2.5" fill="#e0605a" opacity=".22"/><ellipse cx="59" cy="52" rx="4" ry="2.5" fill="#e0605a" opacity=".22"/>`;
  if (P.coiffure==="chignon") s+=`<circle cx="50" cy="22" r="8" fill="${P.cheveux}"/><path d="M33 44 C31 26 42 24 50 24 C58 24 69 26 67 44 C64 34 58 31 50 31 C42 31 36 34 33 44Z" fill="${P.cheveux}"/>`;
  if (P.coiffure==="court") s+=`<path d="M33 42 C31 26 42 24 50 24 C60 24 70 28 67 42 C63 33 56 30 50 32 C44 30 37 33 33 42Z" fill="${P.cheveux}"/>`;
  if (P.coiffure==="long"||P.coiffure==="tresses") s+=`<path d="M33 44 C32 26 44 24 50 24 C58 24 69 27 67 44 C62 34 56 30 48 33 C42 32 36 36 33 44Z" fill="${P.cheveux}"/>`;
  if (P.coiffure==="toupet") s+=`<path d="M44 26 C44 16 56 16 56 26Z" fill="${P.cheveux}"/><path d="M48 18 C46 10 54 8 52 16" fill="none" stroke="${P.cheveux}" stroke-width="3"/>`;
  // yeux
  const oeil=(x)=>`<ellipse cx="${x}" cy="45" rx="2.6" ry="2.2" fill="#fff"/><circle cx="${x}" cy="45.3" r="1.6" fill="#2a1a10"/><circle cx="${x+.6}" cy="44.6" r=".5" fill="#fff"/>`;
  s+=oeil(43)+(P.bandeau?"":oeil(57));
  const sourcil=P.bouche==="grogne"?`<path d="M38 39 L47 42 M62 39 L53 42" stroke="#1a100a" stroke-width="2.2" stroke-linecap="round"/>`:`<path d="M39 40 Q43 38 47 40 M53 40 Q57 38 61 40" stroke="${P.cheveux==="#e8e8ee"?"#cfcfd8":"#3a2414"}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  s+=sourcil;
  if (P.bandeau) s+=`<path d="M30 36 L70 50" stroke="#111" stroke-width="1.6"/><ellipse cx="57" cy="45.5" rx="4.2" ry="3.6" fill="#111"/>`;
  s+=`<path d="M50 46 Q48 52 50 53 Q52 53.5 53 52" fill="none" stroke="${peauOmbre}" stroke-width="1.6" stroke-linecap="round"/>`;
  const bouches={sourire:`<path d="M44 57 Q50 62 56 57" fill="none" stroke="#7a2a20" stroke-width="1.8" stroke-linecap="round"/>`,neutre:`<path d="M45 58 Q50 59.5 55 58" fill="none" stroke="#7a2a20" stroke-width="1.6" stroke-linecap="round"/>`,
    malice:`<path d="M44 58 Q50 60 56 56" fill="none" stroke="#7a2a20" stroke-width="1.8" stroke-linecap="round"/>`,grogne:`<path d="M43 59 Q50 55 57 59" fill="none" stroke="#2a1a10" stroke-width="2" stroke-linecap="round"/>`};
  if (P.barbe==="nain") s+=`<path d="M33 48 C34 62 40 66 50 66 C60 66 66 62 67 48 C70 64 70 84 50 92 C30 84 30 64 33 48Z" fill="${P.cheveux}"/><path d="M44 72 v14 M56 72 v14" stroke="#8a3a10" stroke-width="2.5"/><circle cx="44" cy="87" r="2" fill="#d8b050"/><circle cx="56" cy="87" r="2" fill="#d8b050"/><path d="M42 57 Q50 54 58 57 Q50 60 42 57Z" fill="${P.cheveux}"/>`;
  else if (P.barbe==="mage") s+=`<path d="M34 50 C36 62 42 64 50 64 C58 64 64 62 66 50 C68 70 62 94 50 98 C38 94 32 70 34 50Z" fill="${P.cheveux}"/><path d="M42 57 Q50 53 58 57 Q50 60 42 57Z" fill="${P.cheveux}"/>`;
  else if (P.barbe==="courte") s+=`<path d="M34 50 C36 62 42 66 50 66 C58 66 64 62 66 50 C66 64 60 70 50 70 C40 70 34 64 34 50Z" fill="${P.cheveux}"/>`+bouches[P.bouche];
  else s+=bouches[P.bouche];
  if (P.moustache) s+=`<path d="M42 55 Q46 52 50 55 Q54 52 58 55 Q56 58 50 56 Q44 58 42 55Z" fill="${P.moustache}"/>`;
  if (P.defenses) s+=`<path d="M44 59 L45 53 L47 59Z M53 59 L55 53 L56 59Z" fill="#f4ecd6"/>`;
  if (P.chapeau==="barde") s+=`<ellipse cx="50" cy="31" rx="26" ry="6" fill="#2f6a3a"/><path d="M34 31 C34 18 44 14 52 14 C62 14 66 22 66 31Z" fill="#3c7a48"/><path d="M36 28 h28" stroke="#d8b050" stroke-width="2.5"/><path d="M62 24 C74 12 84 10 88 6 C84 16 76 22 64 27Z" fill="#c83a2a"/>`;
  if (P.chapeau==="mage") s+=`<ellipse cx="50" cy="30" rx="28" ry="6" fill="#23235a"/><path d="M30 30 L54 -4 L70 30Z" fill="#2e2e7a"/><path d="M30 30 L54 -4 L70 30" fill="none" stroke="#c8a040" stroke-width="1"/><circle cx="50" cy="16" r="1.8" fill="#f0d070"/><circle cx="58" cy="22" r="1.3" fill="#f0d070"/><circle cx="45" cy="25" r="1.2" fill="#f0d070"/>`;
  if (P.chapeau==="tricorne") s+=`<path d="M22 32 C30 24 40 30 50 20 C60 30 70 24 78 32 C70 34 60 30 50 34 C40 30 30 34 22 32Z" fill="#1a1410"/><path d="M36 30 C38 20 62 20 64 30Z" fill="#241c16"/><path d="M28 31 C40 29 60 29 72 31" stroke="#d8b050" stroke-width="1.5" fill="none"/><circle cx="50" cy="25" r="2.4" fill="#f4ecd6"/>`;
  if (P.casque==="nain") s+=`<path d="M32 38 C32 20 68 20 68 38Z" fill="#8a8f96"/><path d="M31 38 h38" stroke="#6a6e76" stroke-width="3"/><path d="M50 22 v16" stroke="#b8bcc4" stroke-width="3"/><path d="M32 30 L20 20 L30 34Z M68 30 L80 20 L70 34Z" fill="#e8dcc0"/>`;
  if (P.casque==="paladin") s+=`<path d="M31 42 C30 20 70 20 69 42 L69 50 L64 50 L64 40 C60 34 40 34 36 40 L36 50 L31 50Z" fill="#c8ccd4"/><path d="M50 22 v18" stroke="#8a8e96" stroke-width="2"/><path d="M50 22 C44 10 58 4 62 8 C56 10 54 14 52 22Z" fill="#b8302a"/>`;
  if (P.diademe) s+=`<path d="M34 36 Q50 30 66 36" stroke="#e8c860" stroke-width="2" fill="none"/><circle cx="50" cy="32.5" r="2.4" fill="#6ac0e0" stroke="#e8c860"/>`;
  if (P.couronne) s+=`<path d="M34 34 C30 22 26 18 24 14 M34 34 C32 26 36 20 34 16 M66 34 C70 22 74 18 76 14 M66 34 C68 26 64 20 66 16" stroke="#8a6a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/><g fill="#6aa04a"><ellipse cx="38" cy="31" rx="4" ry="2.2" transform="rotate(-20 38 31)"/><ellipse cx="46" cy="28.5" rx="4" ry="2.2"/><ellipse cx="54" cy="28.5" rx="4" ry="2.2"/><ellipse cx="62" cy="31" rx="4" ry="2.2" transform="rotate(20 62 31)"/></g><circle cx="50" cy="29" r="1.8" fill="#e05a4a"/>`;
  if (P.capuche) s+=`<path d="M26 64 C26 34 36 22 50 22 C64 22 74 34 74 64 C70 44 62 32 50 32 C38 32 30 44 26 64Z" fill="${P.capuche}"/><path d="M38 60 Q50 70 62 60 L62 66 Q50 74 38 66Z" fill="#1a141e"/>`;
  s+=`</svg>`;
  return s;
}
const api = { GALERIE, svgPortrait };
if (typeof module === "object" && module.exports) module.exports = api; else racine.TrapinettePortraits = api;
})(typeof self !== "undefined" ? self : this);
