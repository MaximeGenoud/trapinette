(() => {
"use strict";
/* =========================================================
   LE MONDE DE TABLEQUEST
   ========================================================= */
const COMPAGNIE = ["Pok","Elliott","Lirith","Jarek","Perceval","Brik"];
const JAREK = {
  debut:["Pose tes piécettes sur la table. Jarek Flintlock ne perd jamais deux fois de suite… sauf les soirs de pleine lune.","Encore toi ? Sers-moi une chope et lance, qu'on en finisse.","Ma balafre me dit que la chance est de mon côté ce soir.","Un dé, deux joueurs, le plus haut rafle tout. Même un gobelin comprend."],
  gagneManche:["Hé hé. Le dé connaît son maître.","Tu entends ça ? C'est ta bourse qui s'allège.","Je lance comme je tire : droit au but.","Patron ! Une tournée pour fêter ça. Sur son compte."],
  perdManche:["Chance du débutant. Ça ne durera pas.","Le dé a glissé sur la bière, ça compte pas… Bon, si, ça compte.","Profite. Mon pistolet et moi, on a de la patience.","Qui a mis de l'eau dans mon verre ?"],
  egalite:["Égalité ! Les dieux hésitent. On relance.","Même score ? Tu copies sur moi, maintenant ?","Pareil ! Allez, on remet ça."],
  gagneMatch:["Victoire ! Range ton or, il est à moi. Reviens quand tu auras grandi.","Et c'est Jarek qui l'emporte. Comme d'habitude à Eauprofonde.","Bien essayé. Tu paies la prochaine tournée, c'est la tradition."],
  perdMatch:["…Bon. Tu as gagné. Ne va pas le crier dans tout le Manoir.","Je te laissais gagner, évidemment. Pour t'encourager.","Faut que je parle à ce dé en privé. Une revanche ?"],
  six:["Six ! Tu vois ? C'est ça, le talent.","Et BAM. Comme une balle entre les deux yeux."],
  un:["Un… Ce dé est maudit, je te dis.","Bon. Faisons comme si tu n'avais rien vu."],
};
const MJ = {
  accueil:"Bienvenue au Manoir du Crâne-de-Troll, la taverne la plus courue d'Eauprofonde. Le feu crépite dans l'âtre, les chopes s'entrechoquent, et au centre de la salle trône la table de Trapinette. Ici, on règle ses dettes et ses querelles d'honneur d'un seul jet de dé.",
  jarek:"À la table du fond, Jarek Flintlock fait rouler un dé rouge entre ses doigts balafrés. Il pose son pistolet à côté de sa bouteille et te fait signe de t'asseoir. Faites un jet de Trapinette.",
  compagnon:"La salle est pleine ce soir. Deux chopes claquent sur le bois, un dé passe de main en main… Il faut bien décider qui paiera la tournée. Faites un jet de Trapinette.",
  ligue:"Le tavernier décroche le registre de la Ligue internationale et trempe sa plume dans l'encre. Tous les regards se tournent vers la table centrale. Faites un jet de Trapinette.",
  six:["Réussite critique ! Le dé tournoie, hésite… et s'arrête sur le six.","Réussite critique ! Un murmure admiratif parcourt la salle."],
  un:["Échec critique… Le dé roule mollement et s'échoue sur le un.","Échec critique. Quelque part, un barde prend des notes."],
};
const SALLE = {
  six:["{p} frappe la table du plat de la main : « Un six ! »","{p} lève sa chope bien haut.","{p} siffle entre ses dents.","{p} manque de renverser sa bière d'enthousiasme."],
  un:["{p} s'étrangle dans sa bière.","{p} secoue la tête, navré·e.","{p} glisse une piécette au tavernier : il avait parié là-dessus.","{p} éclate de rire."],
  egalite:["{p} : « Relance ! Relance ! »","{p} se penche au-dessus de la table, fasciné·e.","{p} : « Même les dés ne veulent pas choisir. »"],
  victoire:["Toute la salle trinque. {p} entonne une chanson à boire.","{p} applaudit à tout rompre.","{p} réclame déjà la revanche."],
};
const TITRES = [[1700,"Légende d'Eauprofonde"],[1350,"Maître du gobelet"],[1150,"Fine gâchette"],[1050,"Habitué du Manoir"],[950,"Joueur de comptoir"],[0,"Bleu de la taverne"]];
const titrePour = c => TITRES.find(([s]) => c >= s)[1];

/* =========================================================
   UTILITAIRES
   ========================================================= */
const $ = s => document.querySelector(s);
const app = $("#app");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const hasard = a => a[Math.floor(Math.random()*a.length)];
const d6 = () => { try { const b=new Uint32Array(1); let v; do { crypto.getRandomValues(b); v=b[0]; } while (v >= 4294967292); return (v%6)+1; } catch { return 1+Math.floor(Math.random()*6); } };
const store = { get(k,d){ try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch { return d; } }, set(k,v){ try { localStorage.setItem(k,JSON.stringify(v)); return true; } catch { return false; } } };
const cle = n => String(n).trim().toLocaleLowerCase("fr");
const hash = s => { let h=2166136261; for (const c of s) { h^=c.codePointAt(0); h=Math.imul(h,16777619); } return h>>>0; };
const slug = n => { const s = cle(n).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9_~@+-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60); return (s||"j")+"-"+(hash(cle(n))%46656).toString(36); };
const propre = s => String(s).replace(/\s+/g," ").trim().slice(0,24);
const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>t.hidden=true,3400); }
const dateCourte = iso => { try { const d=new Date(iso); return d.toLocaleDateString("fr-CH",{day:"numeric",month:"short"})+" · "+d.toLocaleTimeString("fr-CH",{hour:"2-digit",minute:"2-digit"}); } catch { return ""; } };
const nomActuel = () => store.get("trapinette-nom","Voyageur") || "Voyageur";
const rnd = (a,b) => a + Math.random()*(b-a);

/* =========================================================
   AMBIANCE SONORE (tout est synthétisé)
   ========================================================= */
const Son = {
  VOLUME:.4, ctx:null, maitre:null, sfx:null, fond:null, reverb:null, actif:false, timers:[], cordes:{},
  init(){
    if (this.ctx) return true;
    try { this.ctx = new (window.AudioContext||window.webkitAudioContext)(); } catch { return false; }
    const c=this.ctx;
    this.maitre=c.createGain(); this.maitre.gain.value=0;
    // un compresseur évite les pics (acclamations, pièces) qui saturaient
    const comp=c.createDynamicsCompressor(); comp.threshold.value=-20; comp.ratio.value=4; comp.attack.value=.005; comp.release.value=.25;
    this.maitre.connect(comp).connect(c.destination);
    this.sfx=c.createGain(); this.sfx.gain.value=1; this.sfx.connect(this.maitre);
    this.fond=c.createGain(); this.fond.gain.value=0; this.fond.connect(this.maitre);
    // réverbération de salle en bois
    const len=c.sampleRate*2.2, ir=c.createBuffer(2,len,c.sampleRate);
    for (let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for (let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2); }
    this.reverb=c.createConvolver(); this.reverb.buffer=ir; const rv=c.createGain(); rv.gain.value=.35; this.reverb.connect(rv).connect(this.maitre);
    return true;
  },
  bruit(sec, brun){
    const c=this.ctx, b=c.createBuffer(1,Math.floor(c.sampleRate*sec),c.sampleRate), d=b.getChannelData(0); let last=0;
    for (let i=0;i<d.length;i++){ const w=Math.random()*2-1; if (brun){ last=(last+.02*w)/1.02; d[i]=last*3.5; } else d[i]=w; }
    return b;
  },
  demarrer(){
    if (!this.init()) return false;
    const c=this.ctx; if (c.state==="suspended") c.resume();
    this.actif=true; clearTimeout(this.pause);
    const g=this.maitre.gain; g.cancelScheduledValues(c.currentTime); g.setValueAtTime(g.value,c.currentTime); g.setTargetAtTime(this.VOLUME,c.currentTime,.25);
    this.fond.gain.cancelScheduledValues(c.currentTime); this.fond.gain.setTargetAtTime(.6,c.currentTime,.8);
    if (!this.lance){ this.lance=true; this.feu(); this.foule(); this.musique(); }
    return true;
  },
  // Couper : tout le son passe par « maitre » (fond, effets ET réverbération) ; on le ramène à zéro
  // puis on met le moteur audio en pause, pour qu'il ne reste vraiment plus rien en arrière-plan.
  couper(){ this.actif=false; if (!this.ctx) return; const c=this.ctx, g=this.maitre.gain;
    g.cancelScheduledValues(c.currentTime); g.setValueAtTime(g.value,c.currentTime); g.setTargetAtTime(0,c.currentTime,.08);
    clearTimeout(this.pause); this.pause=setTimeout(()=>{ if (!this.actif) c.suspend(); },500); },
  feu(){
    const c=this.ctx;
    const src=c.createBufferSource(); src.buffer=this.bruit(4,true); src.loop=true;
    const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=420;
    const g=c.createGain(); g.gain.value=.22; src.connect(lp).connect(g).connect(this.fond); src.start();
    const craque = () => {
      if (this.actif){
        const t=c.currentTime, s=c.createBufferSource(); s.buffer=this.bruit(.03,false);
        const hp=c.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=1500+Math.random()*3000;
        const gg=c.createGain(); gg.gain.setValueAtTime(.05+Math.random()*.12,t); gg.gain.exponentialRampToValueAtTime(.0001,t+.03);
        s.connect(hp).connect(gg).connect(this.fond); s.start(t);
      }
      setTimeout(craque, 40+Math.random()*(Math.random()<.2?600:180));
    };
    craque();
  },
  foule(){
    const c=this.ctx;
    for (let k=0;k<5;k++){
      const src=c.createBufferSource(); src.buffer=this.bruit(3,false); src.loop=true;
      const bp=c.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=280+k*140; bp.Q.value=4;
      const g=c.createGain(); g.gain.value=.0;
      src.connect(bp).connect(g).connect(this.fond); src.start(c.currentTime+Math.random());
      const mod = () => { const t=c.currentTime; g.gain.setTargetAtTime(.012+Math.random()*.03,t,.15+Math.random()*.3); setTimeout(mod,150+Math.random()*500); };
      mod();
    }
    // éclats de rire lointains
    const rire = () => {
      if (this.actif){ const t=c.currentTime, n=4+Math.floor(Math.random()*4);
        for (let i=0;i<n;i++){ const o=c.createOscillator(), g=c.createGain(), f=c.createBiquadFilter(); f.type="bandpass"; f.frequency.value=900; f.Q.value=2;
          o.type="sawtooth"; o.frequency.setValueAtTime(260+Math.random()*80,t+i*.13); o.frequency.exponentialRampToValueAtTime(200,t+i*.13+.1);
          g.gain.setValueAtTime(.0001,t+i*.13); g.gain.exponentialRampToValueAtTime(.012,t+i*.13+.02); g.gain.exponentialRampToValueAtTime(.0001,t+i*.13+.11);
          o.connect(f).connect(g).connect(this.fond); g.connect(this.reverb); o.start(t+i*.13); o.stop(t+i*.13+.13); } }
      setTimeout(rire, 7000+Math.random()*14000);
    };
    setTimeout(rire, 4000);
  },
  corde(freq){
    const k=Math.round(freq*10); if (this.cordes[k]) return this.cordes[k];
    const c=this.ctx, sr=c.sampleRate, N=Math.round(sr/freq), len=Math.floor(sr*2.4), b=c.createBuffer(1,len,sr), d=b.getChannelData(0);
    const buf=new Float32Array(N); for (let i=0;i<N;i++) buf[i]=Math.random()*2-1;
    let p=0; for (let i=0;i<len;i++){ const n=(p+1)%N; const v=(buf[p]+buf[n])*.5*.996; d[i]=buf[p]; buf[p]=v; p=n; }
    return this.cordes[k]=b;
  },
  pincer(freq,t,vol){
    const c=this.ctx, s=c.createBufferSource(); s.buffer=this.corde(freq);
    const g=c.createGain(); g.gain.value=vol; const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=2600;
    s.connect(lp).connect(g); g.connect(this.fond); g.connect(this.reverb); s.start(t); s.stop(t+2.4);
  },
  musique(){
    // Air de taverne en ré dorien, 6/8
    const c=this.ctx, n = m => 293.66*Math.pow(2,m/12);
    const air = [
      [0,2],[2,1],[3,2],[5,1],[7,2],[5,1],[3,2],[2,1],[0,3],[-2,3],
      [0,2],[2,1],[3,2],[5,1],[7,2],[9,1],[10,2],[9,1],[7,6],
      [7,2],[9,1],[10,2],[9,1],[7,2],[5,1],[3,2],[5,1],[7,3],[3,3],
      [2,2],[3,1],[5,2],[3,1],[2,2],[0,1],[-2,2],[0,1],[0,6],
    ];
    const basses=[-12,-12,-14,-12,-12,-12,-7,-12,-5,-5,-9,-7,-12,-14,-12,-12];
    // Cave clandestine : air de contrebandiers en mi mineur harmonique, tambour sur cadre et basse pincée
    const racines=[0,0,1,0,0,0,-2,-1];
    const melodie=[[[0,7],[3,8],[6,7]],[[0,5],[2,4],[4,1],[6,0]],[[0,1],[4,4]],[[0,0]],[[0,12],[3,11],[6,8]],[[0,7],[3,8],[5,7],[6,5]],[[0,4],[4,5]],[[0,0]]];
    let noire=.21;
    let t=c.currentTime+.3, i=0, mesure=0, iCave=0, themeJoue=this.themeCourant;
    const planifier = () => {
      if (this.actif&&this.themeCourant==="cave"){
        if (themeJoue!=="cave"){ themeJoue="cave"; t=Math.max(t,c.currentTime+.2); iCave=0; }
        const E3=164.81, f=m=>E3*Math.pow(2,m/12), croche=.32;
        while (t < c.currentTime+1.2){
          const pos=iCave%8, mes=Math.floor(iCave/8), r=racines[mes%8], cycle=Math.floor(mes/8);
          if (pos===0||pos===3) this.pincer(f(r-12),t,.11);
          if (pos===6) this.pincer(f(r-5),t,.07);
          if (pos===0) this.tambour(t,.9); else if (pos===3) this.tambour(t,.5);
          if (pos===2||pos===6) this.tak(t,.6); else if (pos===7&&Math.random()<.4) this.tak(t,.3);
          if (cycle%2===0) for (const [p,m] of melodie[mes%8]) if (p===pos) this.pincer(f(m+12),t,.085);
          t += croche*(1+(Math.random()-.5)*.03); iCave++;
        }
        setTimeout(planifier, 300); return;
      }
      if (themeJoue==="cave"){ themeJoue="taverne"; t=Math.max(t,c.currentTime+.2); }
      if (!this.actif){ t=Math.max(t,c.currentTime+.3); setTimeout(planifier,300); return; }
      while (t < c.currentTime+1.2){
        const [m,d]=air[i%air.length];
        if (m!==null) this.pincer(n(m), t, .16);
        if (i%air.length===0 || (i%air.length)%5===0){ this.pincer(n(basses[mesure%basses.length]), t, .12); this.pincer(n(basses[mesure%basses.length]+7), t+.02, .07); mesure++; }
        t += d*noire*(1+(Math.random()-.5)*.04); i++;
        if (i%air.length===0) t += noire*3;
      }
      setTimeout(planifier, 300);
    };
    planifier();
  },
  theme(nom){ this.themeCourant=nom; },
  tak(t,vol){ const c=this.ctx, src=c.createBufferSource(); src.buffer=this.bruit(.08,false); const hp=c.createBiquadFilter(); hp.type="bandpass"; hp.frequency.value=2200; hp.Q.value=1.2;
    const g=c.createGain(); g.gain.setValueAtTime(.09*vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+.07); src.connect(hp).connect(g).connect(this.fond); src.start(t); },
  tambour(t,vol){ const c=this.ctx, o=c.createOscillator(), g=c.createGain(); o.type="sine"; o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(42,t+.18);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.22*vol,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+.4); o.connect(g).connect(this.fond); o.start(t); o.stop(t+.42); },
  boum(){
    if (!this.actif) return; const c=this.ctx, t=c.currentTime;
    const s=c.createBufferSource(); s.buffer=this.bruit(1.8,false);
    const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.setValueAtTime(4000,t); lp.frequency.exponentialRampToValueAtTime(120,t+1.6);
    const g=c.createGain(); g.gain.setValueAtTime(.9,t); g.gain.exponentialRampToValueAtTime(.0001,t+1.7);
    s.connect(lp).connect(g).connect(this.sfx); g.connect(this.reverb); s.start(t);
    const o=c.createOscillator(), go=c.createGain(); o.frequency.setValueAtTime(95,t); o.frequency.exponentialRampToValueAtTime(28,t+.9);
    go.gain.setValueAtTime(.9,t); go.gain.exponentialRampToValueAtTime(.0001,t+1); o.connect(go).connect(this.sfx); o.start(t); o.stop(t+1.05);
    setTimeout(()=>this.acclamation(.8),500);
  },
  cri(){
    if (!this.actif) return; const c=this.ctx, t=c.currentTime;
    for (let k=0;k<5;k++){ const o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain();
      o.type="sawtooth"; o.frequency.setValueAtTime(170+k*22+Math.random()*20,t); o.frequency.linearRampToValueAtTime(230+k*20,t+.12); o.frequency.linearRampToValueAtTime(150+k*15,t+.55);
      f.type="bandpass"; f.frequency.value=750+k*120; f.Q.value=3;
      g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.05,t+.04); g.gain.exponentialRampToValueAtTime(.0001,t+.6);
      o.connect(f).connect(g).connect(this.sfx); g.connect(this.reverb); o.start(t); o.stop(t+.62); }
  },
  cor(){
    if (!this.actif) return; const c=this.ctx, t=c.currentTime;
    for (const [fr,v] of [[98,.12],[147,.08],[196,.05]]){ const o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain();
      o.type="sawtooth"; o.frequency.value=fr; f.type="lowpass"; f.frequency.setValueAtTime(300,t); f.frequency.linearRampToValueAtTime(1200,t+.4); f.frequency.linearRampToValueAtTime(400,t+1.3);
      g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.12); g.gain.exponentialRampToValueAtTime(.0001,t+1.4);
      o.connect(f).connect(g).connect(this.sfx); g.connect(this.reverb); o.start(t); o.stop(t+1.45); }
  },
  clac(vol=1){
    if (!this.actif) return; const c=this.ctx, t=c.currentTime;
    const s=c.createBufferSource(); s.buffer=this.bruit(.06,false);
    const f=c.createBiquadFilter(); f.type="bandpass"; f.frequency.value=1200+Math.random()*1500; f.Q.value=3;
    const g=c.createGain(); g.gain.setValueAtTime(.7*vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+.06);
    const o=c.createOscillator(); o.frequency.value=180+Math.random()*60; const go=c.createGain(); go.gain.setValueAtTime(.35*vol,t); go.gain.exponentialRampToValueAtTime(.0001,t+.07);
    s.connect(f).connect(g).connect(this.sfx); g.connect(this.reverb); o.connect(go).connect(this.sfx); s.start(t); o.start(t); o.stop(t+.08);
  },
  pieces(){
    if (!this.actif) return; const c=this.ctx;
    for (let i=0;i<22;i++){ const t=c.currentTime+.05+i*.045+Math.random()*.03, o=c.createOscillator(), g=c.createGain();
      o.type="sine"; o.frequency.value=2600+Math.random()*2600; g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.0001,t+.25);
      o.connect(g).connect(this.sfx); g.connect(this.reverb); o.start(t); o.stop(t+.26); }
  },
  acclamation(fort=1){
    if (!this.actif) return; const c=this.ctx, t=c.currentTime;
    const s=c.createBufferSource(); s.buffer=this.bruit(2.6,false);
    const bp=c.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=1100; bp.Q.value=.8;
    const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.18*fort,t+.25); g.gain.exponentialRampToValueAtTime(.0001,t+2.5);
    s.connect(bp).connect(g).connect(this.sfx); g.connect(this.reverb); s.start(t);
    for (let i=0;i<5;i++) this.pincer(293.66*Math.pow(2,[0,4,7,12,16][i]/12), t+.1+i*.09, .14);
  },
  oh(){
    if (!this.actif) return; const c=this.ctx, t=c.currentTime;
    for (let k=0;k<6;k++){ const o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain();
      o.type="sawtooth"; o.frequency.setValueAtTime(150+Math.random()*90,t); o.frequency.linearRampToValueAtTime(120+Math.random()*60,t+.9);
      f.type="bandpass"; f.frequency.value=600; f.Q.value=5;
      g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.02,t+.15); g.gain.exponentialRampToValueAtTime(.0001,t+1);
      o.connect(f).connect(g).connect(this.sfx); g.connect(this.reverb); o.start(t); o.stop(t+1.05); }
  },
  porte(){
    if (!this.ctx||!this.actif) return; const c=this.ctx, t=c.currentTime;
    const o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain();
    o.type="sawtooth"; o.frequency.setValueAtTime(70,t); o.frequency.linearRampToValueAtTime(115,t+.8); o.frequency.linearRampToValueAtTime(80,t+1.3);
    f.type="bandpass"; f.frequency.value=900; f.Q.value=8;
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.25,t+.1); g.gain.exponentialRampToValueAtTime(.0001,t+1.4);
    o.connect(f).connect(g).connect(this.sfx); g.connect(this.reverb); o.start(t); o.stop(t+1.5);
  },
};
function majBoutonSon(){ $("#son span").textContent = Son.actif ? "Ambiance active" : "Ambiance coupée"; $("#son").setAttribute("aria-pressed",String(Son.actif)); }
$("#son").addEventListener("click", () => { if (Son.actif) Son.couper(); else Son.demarrer(); majBoutonSon(); });
// Volume en 5 crans (mémorisé sur cet appareil)
{ const VOL=[0,.1,.22,.38,.56,.78], el=$("#volume");
  let n=store.get("trapinette-volume-niveau",3); if (!(n>=0&&n<=5)) n=3;
  const appliquer=()=>{ Son.VOLUME=VOL[n]; el.setAttribute("aria-valuenow",n); el.setAttribute("aria-valuetext",n?`${n} sur 5`:"muet"); el.title=n?`Volume : ${n}/5`:"Volume : muet";
    el.querySelectorAll("span").forEach(s=>s.classList.toggle("on",+s.dataset.n<=n));
    if (Son.actif&&Son.ctx){ const g=Son.maitre.gain; g.cancelScheduledValues(Son.ctx.currentTime); g.setTargetAtTime(Son.VOLUME,Son.ctx.currentTime,.05); } };
  const regler=k=>{ n=Math.max(0,Math.min(5,k)); store.set("trapinette-volume-niveau",n); appliquer(); if (n&&!Son.actif){ Son.demarrer(); majBoutonSon(); } };
  el.addEventListener("click",e=>{ const s=e.target.closest("span"); if (!s) return; const k=+s.dataset.n; regler(k===n&&k===1?0:k); });
  el.addEventListener("keydown",e=>{ if (["ArrowRight","ArrowUp"].includes(e.key)){ e.preventDefault(); regler(n+1); } if (["ArrowLeft","ArrowDown"].includes(e.key)){ e.preventDefault(); regler(n-1); } });
  appliquer(); }

/* =========================================================
   TEXTURES PROCÉDURALES
   ========================================================= */
function toile(w,h){ const c=document.createElement("canvas"); c.width=w; c.height=h; return [c,c.getContext("2d")]; }
function texBois({w=512,h=512,base=[92,58,32],planches=6,sombre=.35,noeuds=true}={}){
  const [c,x]=toile(w,h), ph=h/planches;
  for (let p=0;p<planches;p++){
    const j=rnd(-14,14), [r,g,b]=base.map(v=>Math.max(0,v+j));
    x.fillStyle=`rgb(${r},${g},${b})`; x.fillRect(0,p*ph,w,ph);
    for (let k=0;k<70;k++){
      const y0=p*ph+Math.random()*ph, a=rnd(.03,.16), amp=rnd(1,5), fr=rnd(.004,.02), ph0=Math.random()*6;
      x.strokeStyle=Math.random()<.75?`rgba(20,10,4,${a})`:`rgba(255,220,170,${a*.5})`; x.lineWidth=rnd(.5,2);
      x.beginPath(); for (let X=0;X<=w;X+=8){ const Y=y0+Math.sin(X*fr+ph0)*amp; X?x.lineTo(X,Y):x.moveTo(X,Y); } x.stroke();
    }
    if (noeuds && Math.random()<.6){ const kx=Math.random()*w, ky=p*ph+ph*rnd(.3,.7);
      for (let rr=3;rr<18;rr+=3){ x.strokeStyle=`rgba(30,14,5,${.35-rr*.015})`; x.lineWidth=1.5; x.beginPath(); x.ellipse(kx,ky,rr*2.2,rr*.8,0,0,7); x.stroke(); } }
    x.fillStyle=`rgba(0,0,0,${sombre})`; x.fillRect(0,p*ph,w,2.5);
    x.fillStyle="rgba(255,230,190,.06)"; x.fillRect(0,p*ph+2.5,w,1.5);
  }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.encoding=THREE.sRGBEncoding; t.anisotropy=8; return t;
}
function texPierre({w=512,h=512}={}){
  const [c,x]=toile(w,h); x.fillStyle="#3e352e"; x.fillRect(0,0,w,h);
  let y=0; while (y<h){ const rh=rnd(40,64); let X=-rnd(0,50);
    while (X<w){ const rw=rnd(60,120), g=rnd(88,138)|0, tint=rnd(-8,8)|0;
      const gr=x.createLinearGradient(0,y,0,y+rh); gr.addColorStop(0,`rgb(${g+18+tint},${g+12},${g+2-tint})`); gr.addColorStop(1,`rgb(${g-22+tint},${g-26},${g-30-tint})`);
      x.fillStyle=gr; x.beginPath(); const r=10, a=X+3, b=y+3, W=rw-6, H=rh-6;
      x.moveTo(a+r,b); x.arcTo(a+W,b,a+W,b+H,r); x.arcTo(a+W,b+H,a,b+H,r); x.arcTo(a,b+H,a,b,r); x.arcTo(a,b,a+W,b,r); x.fill();
      for (let k=0;k<50;k++){ x.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:240},${Math.random()<.5?0:220},${rnd(.02,.08)})`; x.fillRect(a+Math.random()*W,b+Math.random()*H,rnd(1,4),rnd(1,4)); }
      X+=rw; }
    y+=rh; }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.encoding=THREE.sRGBEncoding; t.anisotropy=8; return t;
}
function texFeutre(){
  const [c,x]=toile(256,256); x.fillStyle="#4a0f0d"; x.fillRect(0,0,256,256);
  for (let i=0;i<9000;i++){ x.fillStyle=`rgba(${Math.random()<.5?0:255},0,0,${rnd(.02,.08)})`; x.fillRect(Math.random()*256,Math.random()*256,1,1); }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,4); t.encoding=THREE.sRGBEncoding; return t;
}
function texEnseigne(){
  const [c,x]=toile(1024,256);
  const g=x.createLinearGradient(0,0,0,256); g.addColorStop(0,"#4a2c16"); g.addColorStop(1,"#26140a"); x.fillStyle=g; x.fillRect(0,0,1024,256);
  for (let k=0;k<120;k++){ x.strokeStyle=`rgba(0,0,0,${rnd(.05,.2)})`; x.beginPath(); const y=Math.random()*256; x.moveTo(0,y); x.bezierCurveTo(300,y+rnd(-6,6),700,y+rnd(-6,6),1024,y); x.stroke(); }
  x.strokeStyle="#c8953c"; x.lineWidth=6; x.strokeRect(14,14,996,228);
  x.textAlign="center"; x.fillStyle="#f1c46a"; x.shadowColor="rgba(0,0,0,.8)"; x.shadowBlur=6; x.shadowOffsetY=3;
  x.font="92px 'Pirata One', Georgia, serif"; x.fillText("Manoir du Crâne-de-Troll",512,142);
  x.font="36px 'Alegreya SC', Georgia, serif"; x.fillStyle="#d8b27a"; x.fillText("— Eauprofonde · Bières, lits & Trapinette —",512,206);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8; return t;
}
function texAffiche(titre,ligne){
  const [c,x]=toile(256,340); x.fillStyle="#e7d6ae"; x.fillRect(0,0,256,340);
  for (let i=0;i<3000;i++){ x.fillStyle=`rgba(120,70,20,${rnd(0,.08)})`; x.fillRect(Math.random()*256,Math.random()*340,2,2); }
  x.fillStyle="#5a1e19"; x.textAlign="center"; x.font="44px 'Pirata One', Georgia, serif"; x.fillText(titre,128,70);
  x.fillStyle="#3a2412"; x.font="22px Alegreya, Georgia, serif"; ligne.split("|").forEach((l,i)=>x.fillText(l,128,130+i*30));
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; return t;
}
function texLueur(){ const [c,x]=toile(128,128); const g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(.25,"rgba(255,220,150,.8)"); g.addColorStop(.6,"rgba(255,140,40,.25)"); g.addColorStop(1,"rgba(255,100,0,0)"); x.fillStyle=g; x.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); }
function texFlamme(){ const [c,x]=toile(64,128); const g=x.createRadialGradient(32,90,2,32,80,44); g.addColorStop(0,"rgba(255,255,230,1)"); g.addColorStop(.3,"rgba(255,200,90,.9)"); g.addColorStop(.7,"rgba(255,90,20,.35)"); g.addColorStop(1,"rgba(255,50,0,0)"); x.fillStyle=g; x.beginPath(); x.ellipse(32,78,26,50,0,0,7); x.fill(); return new THREE.CanvasTexture(c); }

/* =========================================================
   DÉS
   ========================================================= */
const FACES=[2,5,1,6,3,4];
const NORMALES={1:[0,1,0],6:[0,-1,0],2:[1,0,0],5:[-1,0,0],3:[0,0,1],4:[0,0,-1]};
const PIPS={1:[[.5,.5]],2:[[.27,.27],[.73,.73]],3:[[.27,.27],[.5,.5],[.73,.73]],4:[[.27,.27],[.73,.27],[.27,.73],[.73,.73]],5:[[.27,.27],[.73,.27],[.5,.5],[.27,.73],[.73,.73]],6:[[.27,.24],[.73,.24],[.27,.5],[.73,.5],[.27,.76],[.73,.76]]};
const STYLES={ ivoire:{fond:["#fffaf0","#f0e2c2","#d7c399"],pip:"#24160c",un:"#9b2f2a"}, rouge:{fond:["#e65a4f","#a8322c","#651814"],pip:"#fbe9c4",un:"#fbe9c4"} };
const matCache={};
function faceCanvas(v,st,bump){
  const S=256,[c,x]=toile(S,S);
  if (bump){ x.fillStyle="#fff"; x.fillRect(0,0,S,S); } else { const g=x.createRadialGradient(S*.3,S*.25,S*.05,S*.5,S*.5,S*.75); g.addColorStop(0,st.fond[0]); g.addColorStop(.6,st.fond[1]); g.addColorStop(1,st.fond[2]); x.fillStyle=g; x.fillRect(0,0,S,S); }
  const r=v===1?S*.12:S*.085;
  for (const [px,py] of PIPS[v]){ const cx=px*S, cy=py*S;
    if (bump){ const g=x.createRadialGradient(cx,cy,0,cx,cy,r*1.15); g.addColorStop(0,"#000"); g.addColorStop(.8,"#222"); g.addColorStop(1,"#fff"); x.fillStyle=g; x.beginPath(); x.arc(cx,cy,r*1.15,0,7); x.fill(); continue; }
    x.fillStyle="rgba(255,255,255,.35)"; x.beginPath(); x.arc(cx+1.5,cy+2,r+1.5,0,7); x.fill();
    const col=v===1?st.un:st.pip, g=x.createRadialGradient(cx-r*.3,cy-r*.35,r*.1,cx,cy,r); g.addColorStop(0,col); g.addColorStop(.75,col); g.addColorStop(1,"rgba(0,0,0,.55)");
    x.fillStyle=g; x.beginPath(); x.arc(cx,cy,r,0,7); x.fill(); }
  return c;
}
function materiauxDe(style){
  if (matCache[style]) return matCache[style];
  const st=STYLES[style];
  return matCache[style]=FACES.map(v=>{ const map=new THREE.CanvasTexture(faceCanvas(v,st,false)); map.encoding=THREE.sRGBEncoding; map.anisotropy=8;
    return new THREE.MeshPhysicalMaterial({map,bumpMap:new THREE.CanvasTexture(faceCanvas(v,st,true)),bumpScale:.03,roughness:style==="rouge"?.26:.34,clearcoat:.9,clearcoatRoughness:.18,envMapIntensity:.6}); });
}
function geometrieDe(){
  const s=1,r=.16,seg=20,g=new THREE.BoxGeometry(s,s,s,seg,seg,seg),p=g.attributes.position,n=g.attributes.normal,inner=s/2-r,v=new THREE.Vector3(),c=new THREE.Vector3(),d=new THREE.Vector3();
  for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); c.set(Math.max(-inner,Math.min(inner,v.x)),Math.max(-inner,Math.min(inner,v.y)),Math.max(-inner,Math.min(inner,v.z)));
    d.subVectors(v,c); const L=d.length(); if (L>1e-6){ d.multiplyScalar(1/L); v.copy(c).addScaledVector(d,r); p.setXYZ(i,v.x,v.y,v.z); n.setXYZ(i,d.x,d.y,d.z); } }
  p.needsUpdate=n.needsUpdate=true; return g;
}
function quatPour(v,yaw){ const [x,y,z]=NORMALES[v], up=new THREE.Vector3(0,1,0); const qa=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(x,y,z),up); return new THREE.Quaternion().setFromAxisAngle(up,yaw).multiply(qa); }
const easeOut=t=>1-Math.pow(1-t,3), easeOutQ=t=>1-Math.pow(1-t,4), easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

/* =========================================================
   LA TAVERNE EN 3D
   ========================================================= */
const TABLE_Y=.78, ECHELLE_DE=.15, ECART=1.45;
const Monde = {
  ok:false, des:[], flammes:[], lumieres:[], vue:"intro", cam:null, cible:null, t0:performance.now(), ancre:{x:0,y:0},
  init(){
    try {
      if (!window.THREE) throw 0;
      const canvas=$("#monde");
      const R=this.R=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
      R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
      R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFSoftShadowMap;
      R.outputEncoding=THREE.sRGBEncoding; R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=.95;
      R.physicallyCorrectLights=false;
      const S=this.S=new THREE.Scene();
      S.background=new THREE.Color(0x120904); S.fog=new THREE.FogExp2(0x1a0d06,.06);
      this.cam=new THREE.PerspectiveCamera(42,1,.05,60);
      this.camPos=new THREE.Vector3(0,1.7,11); this.camCible=new THREE.Vector3(0,1.2,0);
      this.cam.position.copy(this.camPos); this.cam.lookAt(this.camCible);
      this.construire();
      this.taille(); addEventListener("resize",()=>this.taille());
      this.ok=true;
      const boucle=now=>{ this.frame(now); requestAnimationFrame(boucle); };
      requestAnimationFrame(boucle);
    } catch(e){ this.ok=false; }
  },
  taille(){ const w=innerWidth,h=innerHeight; this.R.setSize(w,h,false); this.cam.aspect=w/h; this.cam.updateProjectionMatrix(); },
  construire(){
    const S=this.S;
    const bois=texBois({base:[120,78,44]}), boisSombre=texBois({base:[76,48,28],planches:4}), parquet=texBois({base:[104,68,38],planches:8,sombre:.55}), pierre=texPierre();
    const mBois=new THREE.MeshStandardMaterial({map:bois,roughness:.72});
    const mSombre=new THREE.MeshStandardMaterial({map:boisSombre,roughness:.8});
    const mFer=new THREE.MeshStandardMaterial({color:0x2a2622,roughness:.5,metalness:.7});
    const mLaiton=new THREE.MeshStandardMaterial({color:0xc8923a,roughness:.35,metalness:.5});
    const mCireA=new THREE.MeshStandardMaterial({color:0xefe2c4,roughness:.6,emissive:0x3a1a00,emissiveIntensity:.25});

    // Lumières
    S.add(new THREE.HemisphereLight(0xffcf96,0x2a140a,.42));
    const lanterne=this.lanterne=new THREE.SpotLight(0xffc27a,2.3,9,.8,.6,1.2);
    lanterne.position.set(0,2.35,0); lanterne.target.position.set(0,TABLE_Y,0); lanterne.castShadow=true;
    lanterne.shadow.mapSize.set(2048,2048); lanterne.shadow.camera.near=.3; lanterne.shadow.camera.far=4; lanterne.shadow.bias=-.00025; lanterne.shadow.radius=3;
    S.add(lanterne,lanterne.target);
    this.feuLum=new THREE.PointLight(0xff7a2a,3.2,14,1.4); this.feuLum.position.set(-2.9,.75,-4.1); S.add(this.feuLum);
    this.bougieLum=new THREE.PointLight(0xffa04a,.9,4,1.8); this.bougieLum.position.set(-.55,TABLE_Y+.35,-.62); S.add(this.bougieLum);
    

    // Sol
    parquet.repeat.set(4,4);
    const sol=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshStandardMaterial({map:parquet,roughness:.85}));
    sol.rotation.x=-Math.PI/2; sol.receiveShadow=true; S.add(sol);
    // Murs
    const mur=(w,h,rx,pos,ry)=>{ const t=pierre.clone(); t.needsUpdate=true; t.repeat.set(w/2.2,h/2.2); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,bumpMap:t,bumpScale:.02,roughness:.95})); m.position.copy(pos); m.rotation.y=ry; S.add(m); return m; };
    mur(14,4.4,0,new THREE.Vector3(0,2.2,-5),0);
    mur(12,4.4,0,new THREE.Vector3(-6.5,2.2,1),Math.PI/2);
    mur(12,4.4,0,new THREE.Vector3(6.5,2.2,1),-Math.PI/2);
    // Lambris bas
    const lambris=(w,pos,ry)=>{ const t=bois.clone(); t.needsUpdate=true; t.repeat.set(w/1.5,1); const m=new THREE.Mesh(new THREE.BoxGeometry(w,1.05,.06),new THREE.MeshStandardMaterial({map:t,roughness:.75})); m.position.copy(pos); m.rotation.y=ry; S.add(m); };
    lambris(14,new THREE.Vector3(0,.525,-4.96),0); lambris(12,new THREE.Vector3(-6.46,.525,1),Math.PI/2); lambris(12,new THREE.Vector3(6.46,.525,1),-Math.PI/2);
    // Plafond et poutres
    const plafond=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshStandardMaterial({color:0x1a0e07,roughness:1})); plafond.rotation.x=Math.PI/2; plafond.position.y=4.4; S.add(plafond);
    for (let x=-6;x<=6;x+=2.4){ const p=new THREE.Mesh(new THREE.BoxGeometry(.28,.34,14),mSombre); p.position.set(x,4.23,0); S.add(p); }
    const traverse=new THREE.Mesh(new THREE.BoxGeometry(13,.3,.3),mSombre); traverse.position.set(0,3.9,-4.8); S.add(traverse);
    for (const x of [-6.3,-1.2,4.4]){ const po=new THREE.Mesh(new THREE.BoxGeometry(.32,4.4,.32),mSombre); po.position.set(x,2.2,-4.82); S.add(po); }
    for (const z of [-3,1.5]){ for (const x of [-6.32,6.32]){ const po=new THREE.Mesh(new THREE.BoxGeometry(.32,4.4,.32),mSombre); po.position.set(x,2.2,z); S.add(po); } }

    // Cheminée
    const mPierre=new THREE.MeshStandardMaterial({map:pierre,roughness:.95});
    const chem=new THREE.Group(); chem.position.set(-2.9,0,-4.7); S.add(chem);
    const blocG=new THREE.Mesh(new THREE.BoxGeometry(.5,1.5,.9),mPierre); blocG.position.set(-1.05,.75,.3); chem.add(blocG);
    const blocD=blocG.clone(); blocD.position.x=1.05; chem.add(blocD);
    const linteau=new THREE.Mesh(new THREE.BoxGeometry(2.6,.5,.95),mPierre); linteau.position.set(0,1.75,.32); chem.add(linteau);
    const hotte=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.4,.7),mPierre); hotte.position.set(0,3.2,.2); chem.add(hotte);
    const manteau=new THREE.Mesh(new THREE.BoxGeometry(2.9,.14,1.05),mSombre); manteau.position.set(0,2.03,.36); chem.add(manteau);
    const foyer=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.5,.2),new THREE.MeshBasicMaterial({color:0x080302})); foyer.position.set(0,.75,-.05); chem.add(foyer);
    const atre=new THREE.Mesh(new THREE.BoxGeometry(2.8,.1,1.3),mPierre); atre.position.set(0,.05,.55); chem.add(atre);
    const mBuche=new THREE.MeshStandardMaterial({color:0x2a160a,roughness:.9,emissive:0x3a0c00,emissiveIntensity:.8});
    for (let i=0;i<4;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,.95,10),mBuche); b.rotation.z=Math.PI/2; b.rotation.y=rnd(-.5,.5); b.position.set(rnd(-.15,.15),.18+(i>1?.12:0),.35+rnd(-.12,.12)); chem.add(b); }
    // Flammes
    const tf=texFlamme(), tl=texLueur();
    for (let i=0;i<22;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tf,color:0xffffff,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false}));
      sp.position.set(-2.9+rnd(-.45,.45),.25,-4.3+rnd(-.1,.1)); sp.userData={x:sp.position.x,vie:Math.random(),v:rnd(.5,.9),taille:rnd(.25,.5)}; S.add(sp); this.flammes.push(sp); }
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:tl,color:0xff8a3a,blending:THREE.AdditiveBlending,transparent:true,opacity:.55,depthWrite:false,fog:false})); halo.scale.set(3,2.2,1); halo.position.set(-2.9,.6,-4.1); S.add(halo); this.haloFeu=halo;
    // Enseigne au-dessus du manteau
    const ens=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshStandardMaterial({map:texEnseigne(),roughness:.6})); ens.position.set(-2.9,2.5,-4.24); S.add(ens);
    this.enseigne3d=ens;
    // Crâne de troll stylisé au-dessus de l'enseigne
    const mOs=new THREE.MeshStandardMaterial({color:0xcfc3a3,roughness:.7});
    const crane=new THREE.Group(); crane.position.set(-2.9,3.25,-4.25); S.add(crane);
    const tete=new THREE.Mesh(new THREE.SphereGeometry(.36,24,18),mOs); tete.scale.set(1.15,.9,.8); crane.add(tete);
    const machoire=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.35),mOs); machoire.position.set(0,-.3,.08); crane.add(machoire);
    const mNoir=new THREE.MeshBasicMaterial({color:0x0a0503});
    for (const s of [-1,1]){ const o=new THREE.Mesh(new THREE.SphereGeometry(.09,12,10),mNoir); o.position.set(s*.15,.02,.26); crane.add(o);
      const cr=new THREE.Mesh(new THREE.ConeGeometry(.06,.28,10),mOs); cr.position.set(s*.2,-.36,.22); cr.rotation.x=Math.PI; cr.rotation.z=s*-.2; crane.add(cr);
      const corne=new THREE.Mesh(new THREE.ConeGeometry(.07,.42,10),mOs); corne.position.set(s*.42,.2,0); corne.rotation.z=s*-1.1; crane.add(corne); }

    // Étagères et bouteilles
    const couleursVerre=[0x2f5a36,0x5a2a14,0x243c5a,0x6a5a1a,0x3a1a2a];
    const profilBouteille=[[0,0],[.07,0],[.075,.02],[.075,.2],[.06,.25],[.025,.3],[.022,.38],[.026,.4],[0,.4]].map(([a,b])=>new THREE.Vector2(a,b));
    const gBouteille=new THREE.LatheGeometry(profilBouteille,16);
    for (let e=0;e<3;e++){ const et=new THREE.Mesh(new THREE.BoxGeometry(2.6,.06,.34),mSombre); et.position.set(2.6,1.25+e*.62,-4.78); S.add(et);
      for (let b=0;b<9;b++){ if (Math.random()<.2) continue; const m=new THREE.Mesh(gBouteille,new THREE.MeshStandardMaterial({color:hasard(couleursVerre),roughness:.12,metalness:.1,transparent:true,opacity:.88,envMapIntensity:1.4}));
        const sc=rnd(.8,1.25); m.scale.set(sc,sc,sc); m.position.set(1.45+b*.28+rnd(-.04,.04),1.28+e*.62,-4.75); S.add(m); } }
    // Tonneaux
    const profilTonneau=[]; for (let i=0;i<=12;i++){ const y=i/12; profilTonneau.push(new THREE.Vector2(.36+Math.sin(y*Math.PI)*.07,y*.95)); }
    const gTonneau=new THREE.LatheGeometry(profilTonneau,24);
    const tTonneau=texBois({base:[150,100,58],planches:10}); tTonneau.repeat.set(1,1);
    const mTonneau=new THREE.MeshStandardMaterial({map:tTonneau,roughness:.8});
    const tonneau=(x,z,couche)=>{ const g=new THREE.Group(); const t=new THREE.Mesh(gTonneau,mTonneau); t.castShadow=true; g.add(t);
      for (const y of [.12,.83]){ const cer=new THREE.Mesh(new THREE.TorusGeometry(.4,.018,6,28),mFer); cer.rotation.x=Math.PI/2; cer.position.y=y; g.add(cer); }
      const cou=new THREE.Mesh(new THREE.CircleGeometry(.36,24),mSombre); cou.rotation.x=-Math.PI/2; cou.position.y=.951; g.add(cou);
      if (couche){ g.rotation.z=Math.PI/2; g.position.set(x,.43,z); } else g.position.set(x,0,z); S.add(g); return g; };
    tonneau(-5.6,-4.2); tonneau(-5.5,-3.3); tonneau(-5.65,-3.75).position.y=.95; tonneau(5.6,-4.1); tonneau(5.6,-0.8,true);
    tonneau(-5.6,2.6);
    // Affiches sur le mur
    const aff=(t,l,x,y,rz)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,.66),new THREE.MeshStandardMaterial({map:texAffiche(t,l),roughness:.9})); m.position.set(x,y,-4.93); m.rotation.z=rz; S.add(m); };
    aff("Ligue","Internationale|de Trapinette|—|Inscriptions|au comptoir",.2,2.1,.05);
    aff("Avis","Le tavernier|n'accepte plus|les dés|pipés",.85,1.75,-.08);

    // Table principale
    const tTable=texBois({base:[128,82,46],planches:7}); tTable.repeat.set(1.2,1.2);
    const mTable=new THREE.MeshStandardMaterial({map:tTable,roughness:.55});
    const plateau=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,.09,64),mTable); plateau.position.y=TABLE_Y-.045; plateau.receiveShadow=true; plateau.castShadow=true; S.add(plateau);
    const bord=new THREE.Mesh(new THREE.TorusGeometry(1.3,.035,10,80),mSombre); bord.rotation.x=Math.PI/2; bord.position.y=TABLE_Y-.045; S.add(bord);
    const pied=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,TABLE_Y-.09,16),mSombre); pied.position.y=(TABLE_Y-.09)/2; pied.castShadow=true; S.add(pied);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.55,.62,.08,24),mSombre); base.position.y=.04; S.add(base);
    // Piste de feutre
    const feutre=new THREE.Mesh(new THREE.CircleGeometry(.66,64),new THREE.MeshStandardMaterial({map:texFeutre(),roughness:1})); feutre.rotation.x=-Math.PI/2; feutre.position.y=TABLE_Y+.002; feutre.receiveShadow=true; S.add(feutre);
    const cadre=new THREE.Mesh(new THREE.TorusGeometry(.68,.035,12,80),mSombre); cadre.rotation.x=Math.PI/2; cadre.position.y=TABLE_Y+.02; cadre.castShadow=true; cadre.receiveShadow=true; S.add(cadre);
    const filet=new THREE.Mesh(new THREE.TorusGeometry(.63,.006,6,90),mLaiton); filet.rotation.x=Math.PI/2; filet.position.y=TABLE_Y+.004; S.add(filet);
    // Tabourets
    for (let i=0;i<4;i++){ const a=Math.PI/4+i*Math.PI/2+.15, g=new THREE.Group();
      const siege=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.06,20),mBois); siege.position.y=.5; siege.castShadow=true; g.add(siege);
      for (let k=0;k<3;k++){ const p=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.5,8),mSombre); const b=k*Math.PI*2/3; p.position.set(Math.cos(b)*.15,.25,Math.sin(b)*.15); p.rotation.set(Math.sin(b)*.12,0,-Math.cos(b)*.12); g.add(p); }
      g.position.set(Math.cos(a)*1.75,0,Math.sin(a)*1.75); S.add(g); }
    // Chopes
    const profilChope=[[0,0],[.075,0],[.08,.01],[.08,.16],[.074,.17],[0,.17]].map(([a,b])=>new THREE.Vector2(a,b));
    const gChope=new THREE.LatheGeometry(profilChope,20);
    const chope=(x,z,ry)=>{ const g=new THREE.Group(); const c=new THREE.Mesh(gChope,mBois); c.castShadow=true; g.add(c);
      for (const y of [.03,.14]){ const cer=new THREE.Mesh(new THREE.TorusGeometry(.081,.006,6,24),mLaiton); cer.rotation.x=Math.PI/2; cer.position.y=y; g.add(cer); }
      const anse=new THREE.Mesh(new THREE.TorusGeometry(.045,.012,8,16,Math.PI),mBois); anse.position.set(.085,.085,0); anse.rotation.z=-Math.PI/2; g.add(anse);
      const mousse=new THREE.Mesh(new THREE.SphereGeometry(.078,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xf6ecd4,roughness:.9})); mousse.scale.y=.45; mousse.position.y=.165; g.add(mousse);
      g.position.set(x,TABLE_Y,z); g.rotation.y=ry; S.add(g); };
    chope(-.95,.35,.4); chope(.98,.28,2.6); chope(.3,-1.0,1.2);
    // Bouteille de Jarek
    const bJ=new THREE.Mesh(gBouteille,new THREE.MeshStandardMaterial({color:0x2c4a2e,roughness:.1,transparent:true,opacity:.9,envMapIntensity:1.5})); bJ.scale.setScalar(1.3); bJ.position.set(.82,TABLE_Y,-.62); bJ.castShadow=true; S.add(bJ);
    // Pistolet (silhouette simple)
    const pist=new THREE.Group(); const canon=new THREE.Mesh(new THREE.CylinderGeometry(.014,.016,.26,10),mFer); canon.rotation.z=Math.PI/2; canon.position.set(.08,0,0); pist.add(canon);
    const crosse=new THREE.Mesh(new THREE.BoxGeometry(.13,.035,.04),mSombre); crosse.position.set(-.1,-.02,0); crosse.rotation.z=-.5; pist.add(crosse);
    const garde=new THREE.Mesh(new THREE.TorusGeometry(.02,.004,6,12),mLaiton); garde.position.set(-.03,-.025,0); pist.add(garde);
    pist.position.set(1.02,TABLE_Y+.02,-.2); pist.rotation.set(-Math.PI/2,0,.7); pist.traverse(o=>o.castShadow=true); S.add(pist);
    // Pièces
    const gPiece=new THREE.CylinderGeometry(.028,.028,.006,20), mOr=new THREE.MeshStandardMaterial({color:0xe0b050,metalness:.55,roughness:.35,emissive:0x3a2200,emissiveIntensity:.4});
    for (const [x,z,n] of [[-.8,-.45,6],[.72,.6,4],[-.35,.95,3]]){ for (let i=0;i<n;i++){ const p=new THREE.Mesh(gPiece,mOr); p.position.set(x+rnd(-.006,.006),TABLE_Y+.003+i*.0062,z+rnd(-.006,.006)); p.castShadow=true; S.add(p); } }
    for (let i=0;i<5;i++){ const p=new THREE.Mesh(gPiece,mOr); p.position.set(rnd(-1,1),TABLE_Y+.003,rnd(.72,1.05)*(Math.random()<.5?-1:1)); p.rotation.z=rnd(-.05,.05); S.add(p); }
    // Bougies sur la table
    const mCire=new THREE.MeshStandardMaterial({color:0xefe2c4,roughness:.6,emissive:0x3a1a00,emissiveIntensity:.25});
    const bougie=(x,z,h)=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(.025,.028,h,14),mCire); c.position.set(x,TABLE_Y+h/2,z); c.castShadow=true; S.add(c);
      const f=new THREE.Sprite(new THREE.SpriteMaterial({map:tf,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false})); f.scale.set(.05,.1,1); f.position.set(x,TABLE_Y+h+.045,z); f.userData={bougie:true,base:f.position.y}; S.add(f); this.flammes.push(f);
      const l=new THREE.Sprite(new THREE.SpriteMaterial({map:tl,color:0xffa050,blending:THREE.AdditiveBlending,transparent:true,opacity:.5,depthWrite:false})); l.scale.set(.4,.4,1); l.position.copy(f.position); S.add(l); };
    const bougeoir=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.02,20),mLaiton); bougeoir.position.set(-.55,TABLE_Y+.01,-.62); S.add(bougeoir);
    bougie(-.58,-.64,.22); bougie(-.5,-.58,.16); bougie(-.6,-.54,.12);
    // Lanterne suspendue
    const lant=new THREE.Group(); lant.position.set(0,2.35,0); S.add(lant);
    const cadreL=new THREE.Mesh(new THREE.CylinderGeometry(.1,.13,.28,6,1,true),new THREE.MeshStandardMaterial({color:0x201a14,metalness:.8,roughness:.5,wireframe:true})); lant.add(cadreL);
    const verre=new THREE.Mesh(new THREE.CylinderGeometry(.095,.12,.26,6),new THREE.MeshStandardMaterial({color:0xffd08a,emissive:0xffa040,emissiveIntensity:1.8,transparent:true,opacity:.85})); lant.add(verre);
    const toit=new THREE.Mesh(new THREE.ConeGeometry(.15,.12,6),mFer); toit.position.y=.2; lant.add(toit);
    const chaine=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,1.9,6),mFer); chaine.position.y=1.2; lant.add(chaine);
    const hl=new THREE.Sprite(new THREE.SpriteMaterial({map:tl,color:0xffb060,blending:THREE.AdditiveBlending,transparent:true,opacity:.7,depthWrite:false})); hl.scale.set(1.1,1.1,1); lant.add(hl);
    this.lant=lant;
    // Tables du fond
    const tableFond=(x,z)=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(1.6,.08,.9),mTable); p.position.set(x,.74,z); p.castShadow=p.receiveShadow=true; S.add(p);
      for (const [dx,dz] of [[-.7,-.35],[.7,-.35],[-.7,.35],[.7,.35]]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.07,.72,.07),mSombre); l.position.set(x+dx,.36,z+dz); S.add(l); }
      const banc=new THREE.Mesh(new THREE.BoxGeometry(1.6,.06,.3),mBois); banc.position.set(x,.45,z+.75); S.add(banc);
      const banc2=banc.clone(); banc2.position.z=z-.75; S.add(banc2);
      const c=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.14,10),mCire); c.position.set(x,.85,z); S.add(c);
      const f=new THREE.Sprite(new THREE.SpriteMaterial({map:tf,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false})); f.scale.set(.06,.12,1); f.position.set(x,.96,z); f.userData={bougie:true,base:.96}; S.add(f); this.flammes.push(f);
      const l=new THREE.Sprite(new THREE.SpriteMaterial({map:tl,color:0xffa050,blending:THREE.AdditiveBlending,transparent:true,opacity:.5,depthWrite:false})); l.scale.set(.6,.6,1); l.position.set(x,.96,z); S.add(l);
      chope(x-.4,z+.1,rnd(0,6)); chope(x+.45,z-.15,rnd(0,6)); };
    const sauve=TABLE_Y; tableFond(3.7,-2); tableFond(-4,1.2);

    // Appliques murales
    this.appliques=[];
    for (const [x,z,ry] of [[1.9,-4.9,0],[6.4,-.2,-Math.PI/2],[-6.4,-1.2,Math.PI/2],[-6.4,3,Math.PI/2]]){
      const g=new THREE.Group(); g.position.set(x,2.2,z); g.rotation.y=ry; S.add(g);
      const sup=new THREE.Mesh(new THREE.BoxGeometry(.06,.3,.12),mFer); sup.position.z=.06; g.add(sup);
      const coupe=new THREE.Mesh(new THREE.CylinderGeometry(.07,.04,.08,10),mLaiton); coupe.position.set(0,.12,.16); g.add(coupe);
      const c=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.12,10),mCireA); c.position.set(0,.22,.16); g.add(c);
      const f=new THREE.Sprite(new THREE.SpriteMaterial({map:tf,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false})); f.scale.set(.06,.12,1); f.position.set(0,.33,.16); f.userData={bougie:true}; g.add(f); this.flammes.push(f);
      const h=new THREE.Sprite(new THREE.SpriteMaterial({map:tl,color:0xffa050,blending:THREE.AdditiveBlending,transparent:true,opacity:.55,depthWrite:false})); h.scale.set(.9,.9,1); h.position.copy(f.position); g.add(h);
      if (this.appliques.length<2){ const l=new THREE.PointLight(0xffa24a,1.6,9,1.4); l.position.set(0,.4,.5); g.add(l); this.appliques.push(l); }
    }
    // Poussière dans la lumière
    const N=260, pos=new Float32Array(N*3); for (let i=0;i<N;i++){ pos[i*3]=rnd(-1.6,1.6); pos[i*3+1]=rnd(.8,2.4); pos[i*3+2]=rnd(-1.6,1.6); }
    const gp=new THREE.BufferGeometry(); gp.setAttribute("position",new THREE.BufferAttribute(pos,3));
    this.poussiere=new THREE.Points(gp,new THREE.PointsMaterial({size:.012,map:tl,color:0xffd6a0,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));
    S.add(this.poussiere);
    // Braises de la cheminée
    const NB=40, bp=new Float32Array(NB*3); for (let i=0;i<NB;i++){ bp[i*3]=-2.9+rnd(-.5,.5); bp[i*3+1]=rnd(.2,2); bp[i*3+2]=-4.3; }
    const gb=new THREE.BufferGeometry(); gb.setAttribute("position",new THREE.BufferAttribute(bp,3));
    this.braises=new THREE.Points(gb,new THREE.PointsMaterial({size:.03,map:tl,color:0xff8a30,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
    S.add(this.braises);

    // Dés
    const groupe=this.groupeDes=new THREE.Group(); groupe.position.set(0,TABLE_Y,0); groupe.scale.setScalar(ECHELLE_DE); S.add(groupe);
    const gDe=geometrieDe();
    [0,1].forEach(i=>{ const m=new THREE.Mesh(gDe,materiauxDe(i===0?"ivoire":"rouge")); m.castShadow=true; m.receiveShadow=true;
      const side=i===0?-1:1; m.position.set(side*ECART,.5,0); m.quaternion.copy(quatPour(6,side*.35)); groupe.add(m);
      const anneau=new THREE.Mesh(new THREE.RingGeometry(.75,1.05,56),new THREE.MeshBasicMaterial({color:0xffc050,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
      anneau.rotation.x=-Math.PI/2; anneau.position.set(side*ECART,.03,0); groupe.add(anneau);
      this.des.push({m,anneau,side,anim:null,hop:null,gloire:0}); });

    // Carte d'environnement pour les reflets
  },
  styleDe(i,style){ if (this.ok) this.des[i].m.material=materiauxDe(style); },
  poser(i,v){ if (!this.ok) return; const d=this.des[i]; d.anim=null; d.m.position.set(d.side*ECART,.5,0); d.m.quaternion.copy(quatPour(v,d.side*.35)); },
  lancer(i,v){
    if (!this.ok) return repliLancer(i,v);
    const d=this.des[i];
    return new Promise(res=>{
      const fin=new THREE.Vector3(d.side*ECART+rnd(-.3,.3),.5,rnd(-.6,.6));
      const debut=new THREE.Vector3(d.side*(ECART+2.6),.5,rnd(.8,2.2));
      const axe=new THREE.Vector3(rnd(-.4,.4),0,d.side).normalize();
      const segs=calme?[{d:.25,h:0}]:[{d:.36,h:3.2,chute:true},{d:.3,h:1},{d:.2,h:.38},{d:.13,h:.1},{d:.24,h:0}];
      d.anim={t0:performance.now(),dur:segs.reduce((a,s)=>a+s.d,0),debut,fin,Qf:quatPour(v,rnd(-.45,.45)),axe,total:(calme?1:5.5+Math.random()*2.5)*Math.PI,
        axe2:new THREE.Vector3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize(),total2:rnd(1,3)*Math.PI,segs,impact:0,res};
    });
  },
  sauter(i){ if (this.ok && !this.des[i].anim) this.des[i].hop={t0:performance.now(),q:this.des[i].m.quaternion.clone(),y:this.des[i].m.position.y}; },
  gloire(i){ if (this.ok) this.des.forEach((d,k)=>d.gloire=(i===k)?1:0); },
  allerVers(v){ this.vue=v; },
  cadrage(now){
    const t=(now-this.t0)/1000, P=new THREE.Vector3(), C=new THREE.Vector3();
    const v=this.vue;
    if (v==="intro"){ P.set(0,1.6,10.5); C.set(0,1.3,0); }
    else if (v==="cave"){ const a=.5+Math.sin(t*.05)*.25; P.set(Math.sin(a)*3.2,2.3,Math.cos(a)*3.2); C.set(.6,1.15,-1.6); }
    else if (v==="accueil"){ const a=-.25+Math.sin(t*.045)*.42; P.set(Math.sin(a)*4.6,2.05+Math.sin(t*.07)*.12,Math.cos(a)*4.6); C.set(-.6,1.05,-1.2); }
    else if (v==="partie"){
      const el=document.getElementById("fenetre"), H=innerHeight, W=innerWidth;
      let fh=H*.5, fw=W*.5; if (el){ const r=el.getBoundingClientRect(); fh=Math.max(120,r.height); fw=Math.max(160,r.width); }
      const S=1.18, tan=Math.tan(THREE.MathUtils.degToRad(this.cam.fov/2));
      const d=Math.max(S*.78*H/fh, S*H/fw)/(2*tan);
      const elev=THREE.MathUtils.degToRad(56), sw=Math.sin(t*.25)*.02;
      C.set(0,TABLE_Y+.02,.04); P.set(sw*d, TABLE_Y+Math.sin(elev)*d, Math.cos(elev)*d);
    }
    else { const a=Math.sin(t*.06)*.12; P.set(-.9+a,2.05,1.5); C.set(-2.9,1.75,-4.7); }
    return [P,C];
  },
  frame(now){
    if (!this.ok) return;
    const dt=Math.min(.05,(now-(this.last||now))/1000); this.last=now; const t=now/1000;
    const [P,C]=this.cadrage(now), k=1-Math.exp(-dt*(this.vue==="intro"?.8:2.2));
    this.camPos.lerp(P,k); this.camCible.lerp(C,k);
    this.cam.position.copy(this.camPos); this.cam.lookAt(this.camCible);
    // décale le centre de la vue vers la fenêtre de jeu
    let ax=0, ay=0; const el=this.vue==="partie"?document.getElementById("fenetre"):null;
    if (el){ const r=el.getBoundingClientRect(); ax=innerWidth/2-(r.left+r.width/2); ay=innerHeight/2-(r.top+r.height/2); }
    this.ancre.x+=(ax-this.ancre.x)*Math.min(1,k*2); this.ancre.y+=(ay-this.ancre.y)*Math.min(1,k*2);
    if (Math.abs(this.ancre.x)>.5||Math.abs(this.ancre.y)>.5) this.cam.setViewOffset(innerWidth,innerHeight,this.ancre.x,this.ancre.y,innerWidth,innerHeight); else this.cam.clearViewOffset();
    // lumières vivantes
    const fl=Math.sin(t*9)*.18+Math.sin(t*23)*.12+Math.random()*.15;
    this.feuLum.intensity=3.1+fl; this.haloFeu.material.opacity=.45+fl*.3;
    this.bougieLum.intensity=.85+Math.sin(t*13)*.06+Math.random()*.06;
    this.appliques.forEach((l,i)=>l.intensity=1.55+Math.sin(t*10+i*2)*.07+Math.random()*.06);
    this.lant.rotation.z=Math.sin(t*.7)*.025; this.lant.rotation.x=Math.sin(t*.53)*.02;
    for (const f of this.flammes){
      if (f.userData.bougie){ f.scale.set(.05+Math.random()*.008,.1+Math.sin(t*14+f.position.x*9)*.012,1); continue; }
      const u=f.userData; u.vie+=dt*u.v; if (u.vie>1){ u.vie=0; u.x=-2.9+rnd(-.45,.45); }
      f.position.set(u.x+Math.sin(t*5+u.x*10)*.04, .18+u.vie*.75, f.position.z);
      const s=u.taille*(1-u.vie*.75); f.scale.set(s,s*1.5,1); f.material.opacity=Math.sin(u.vie*Math.PI)*.95;
      f.material.color.setRGB(1,.75-u.vie*.4,.45-u.vie*.4);
    }
    const pp=this.poussiere.geometry.attributes.position; for (let i=0;i<pp.count;i++){ let y=pp.getY(i)+dt*.02; if (y>2.4) y=.8; pp.setY(i,y); pp.setX(i,pp.getX(i)+Math.sin(t*.3+i)*dt*.01); } pp.needsUpdate=true;
    const bp=this.braises.geometry.attributes.position; for (let i=0;i<bp.count;i++){ let y=bp.getY(i)+dt*rnd(.3,.7); let x=bp.getX(i)+Math.sin(t*3+i)*dt*.1; if (y>2.2){ y=.25; x=-2.9+rnd(-.4,.4); } bp.setY(i,y); bp.setX(i,x); } bp.needsUpdate=true;
    // dés
    const q=new THREE.Quaternion(), q2=new THREE.Quaternion();
    for (const d of this.des){
      const a=d.anim;
      if (a){ const tt=(now-a.t0)/1000, T=Math.min(1,tt/a.dur), kk=easeOut(T);
        d.m.position.x=a.debut.x+(a.fin.x-a.debut.x)*kk; d.m.position.z=a.debut.z+(a.fin.z-a.debut.z)*kk;
        let acc=0,y=0,idx=0; for (;idx<a.segs.length;idx++){ const s=a.segs[idx]; if (tt<acc+s.d){ const u=(tt-acc)/s.d; y=s.chute?s.h*(1-u*u):4*s.h*u*(1-u); break; } acc+=s.d; }
        if (idx>a.impact){ for (let j=a.impact;j<Math.min(idx,a.segs.length);j++){ if (a.segs[j].h>0) Son.clac(Math.min(1,.25+a.segs[j].h*.3)); } a.impact=idx; }
        d.m.position.y=.5+Math.max(0,y);
        const r=1-easeOutQ(T); q.setFromAxisAngle(a.axe,a.total*r); q2.setFromAxisAngle(a.axe2,a.total2*r*r); d.m.quaternion.copy(q).multiply(q2).multiply(a.Qf);
        if (T>=1){ d.m.position.copy(a.fin); d.m.quaternion.copy(a.Qf); d.anim=null; setTimeout(a.res,60); }
      } else if (d.hop){ const u=(now-d.hop.t0)/420;
        if (u>=1){ d.m.position.y=.5; d.m.quaternion.copy(d.hop.q); d.hop=null; Son.clac(.4); }
        else { d.m.position.y=.5+Math.sin(u*Math.PI)*.6; q.setFromAxisAngle(new THREE.Vector3(0,0,1),Math.sin(u*Math.PI*2)*.25); d.m.quaternion.copy(q).multiply(d.hop.q); } }
      d.anneau.position.set(d.m.position.x,.03,d.m.position.z);
      const cible=d.m.visible?d.gloire*(.75+.2*Math.sin(now*.006)):0; d.anneau.material.opacity+=(cible-d.anneau.material.opacity)*.1;
    }
    if (this.frameX) this.frameX(now,dt);
    this.R.render(this.S,this.cam);
  },
};
function repliLancer(i,v){
  return new Promise(res=>{ const s=document.querySelector('[data-repli="'+i+'"]'); let k=0; const it=setInterval(()=>{ if (s) s.textContent=1+Math.floor(Math.random()*6); if (++k>9){ clearInterval(it); if (s) s.textContent=v; Son.clac(.8); res(); } },70); });
}

/* =========================================================
   TRAPINEX : DÉS POLYÉDRIQUES, EXPLOSION ET CAVE CLANDESTINE
   ========================================================= */
const DES_X={4:"Trapibaka",6:"Trapinex OG",8:"Traptdrtki",10:"Trapisse",12:"TrapiUwU",20:"Trapinat",100:"Trapigoulu"};
const LISTE_DES_X=[4,6,8,10,12,20,100];
const nomDeX=v=>DES_X[v]||("d"+v);
// Faces d'un polyèdre : on regroupe les triangles de la géométrie three.js par normale
function facesDepuis(geo){
  const g=geo.index?geo.toNonIndexed():geo, p=g.attributes.position, faces=[];
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3();
  for (let i=0;i<p.count;i+=3){
    a.fromBufferAttribute(p,i); b.fromBufferAttribute(p,i+1); c.fromBufferAttribute(p,i+2);
    n.subVectors(c,b).cross(new THREE.Vector3().subVectors(a,b)).normalize();
    let f=faces.find(f=>f.n.dot(n)>.999);
    if (!f){ f={n:n.clone(),pts:[]}; faces.push(f); }
    for (const v of [a,b,c]) if (!f.pts.some(q=>q.distanceTo(v)<1e-4)) f.pts.push(v.clone());
  }
  return faces;
}
function facesD10(){
  // trapézoèdre pentagonal : deux sommets et dix sommets en zigzag
  const h=1, z=h*(1-Math.cos(Math.PI/5))/(1+Math.cos(Math.PI/5)), R=1, T=new THREE.Vector3(0,h,0), B=new THREE.Vector3(0,-h,0);
  const haut=k=>new THREE.Vector3(R*Math.cos(k*2*Math.PI/5),z,R*Math.sin(k*2*Math.PI/5));
  const bas=k=>new THREE.Vector3(R*Math.cos(k*2*Math.PI/5+Math.PI/5),-z,R*Math.sin(k*2*Math.PI/5+Math.PI/5));
  const faces=[];
  for (let k=0;k<5;k++){ faces.push([T,haut(k+1),bas(k),haut(k)]); faces.push([B,bas(k),haut(k+1),bas(k+1)]); }
  return faces.map(pts=>{ const c=pts.reduce((s,v)=>s.add(v),new THREE.Vector3()).multiplyScalar(1/pts.length);
    let n=new THREE.Vector3().subVectors(pts[1],pts[0]).cross(new THREE.Vector3().subVectors(pts[2],pts[0])).normalize(); if (n.dot(c)<0) n.negate(); return {n,pts}; });
}
const STYLES_X={ poison:{fond:["#3a7a3a","#1d4a22","#0e2412"],bord:"#9cff7a",chiffre:"#e9ffd8",lueur:0x2a6a1a},
  sang:{fond:["#b8302a","#7a1712","#3c0806"],bord:"#ffb27a",chiffre:"#ffe9d0",lueur:0x5a0a04} };
const cacheDesX={};
function construireDeX(faces,cote,style,d4){
  const st=STYLES_X[style], N=faces.length, grille=Math.ceil(Math.sqrt(N)), CEL=192;
  const [cv,x]=toile(grille*CEL,grille*CEL);
  const pos=[],nor=[],uv=[], infos=[];
  faces.forEach((f,i)=>{
    const c=f.pts.reduce((s,v)=>s.add(v.clone()),new THREE.Vector3()).multiplyScalar(1/f.pts.length);
    const u=new THREE.Vector3().subVectors(f.pts[0],c).normalize(), w=new THREE.Vector3().crossVectors(f.n,u).normalize();
    const pts=f.pts.slice().sort((p,q)=>Math.atan2(new THREE.Vector3().subVectors(p,c).dot(w),new THREE.Vector3().subVectors(p,c).dot(u))-Math.atan2(new THREE.Vector3().subVectors(q,c).dot(w),new THREE.Vector3().subVectors(q,c).dot(u)));
    const d2=pts.map(p=>{ const d=new THREE.Vector3().subVectors(p,c); return [d.dot(u),d.dot(w)]; });
    const r=Math.max(...d2.map(([a,b])=>Math.hypot(a,b))), cx=(i%grille+.5)/grille, cy=(Math.floor(i/grille)+.5)/grille, s=.46/grille/r;
    const uvs=d2.map(([a,b])=>[cx+a*s,1-(cy)+b*s]);
    // dessin de la face
    const px=uvs.map(([U,V])=>[U*cv.width,(1-V)*cv.height]);
    const gr=x.createRadialGradient(cx*cv.width,cy*cv.height,4,cx*cv.width,cy*cv.height,CEL*.55);
    gr.addColorStop(0,st.fond[0]); gr.addColorStop(.6,st.fond[1]); gr.addColorStop(1,st.fond[2]);
    x.fillStyle=gr; x.beginPath(); px.forEach(([X,Y],k)=>k?x.lineTo(X,Y):x.moveTo(X,Y)); x.closePath(); x.fill();
    x.strokeStyle=st.bord; x.globalAlpha=.55; x.lineWidth=3; x.stroke(); x.globalAlpha=1;
    infos.push({c,pts,px,centre:[cx*cv.width,cy*cv.height],rayon:r*s*cv.width});
    for (let k=1;k<pts.length-1;k++) for (const j of [0,k,k+1]){ pos.push(pts[j].x,pts[j].y,pts[j].z); nor.push(f.n.x,f.n.y,f.n.z); uv.push(...uvs[j]); }
  });
  const chiffre=(t,X,Y,taille,ang)=>{ x.save(); x.translate(X,Y); x.rotate(ang||0); x.font=`700 ${taille}px Alegreya, Georgia, serif`; x.textAlign="center"; x.textBaseline="middle";
    x.lineWidth=taille*.12; x.strokeStyle="rgba(0,0,0,.6)"; x.strokeText(t,0,0); x.fillStyle=st.chiffre; x.fillText(t,0,0);
    if (t==="6"||t==="9"){ x.fillRect(-taille*.22,taille*.42,taille*.44,taille*.07); } x.restore(); };
  // valeurs : d4 = sommets ; autres = faces
  let sommets=null;
  if (d4){ sommets=[]; faces.forEach(f=>f.pts.forEach(p=>{ if (!sommets.some(q=>q.distanceTo(p)<1e-4)) sommets.push(p.clone()); }));
    infos.forEach(inf=>inf.pts.forEach((p,k)=>{ const v=sommets.findIndex(q=>q.distanceTo(p)<1e-4)+1; const [X,Y]=inf.px[k], [CX,CY]=inf.centre;
      const t=.55, PX=CX+(X-CX)*t, PY=CY+(Y-CY)*t; chiffre(String(v),PX,PY,CEL*.2,Math.atan2(Y-CY,X-CX)+Math.PI/2); })); }
  else infos.forEach((inf,i)=>chiffre(String(i+1),inf.centre[0],inf.centre[1],Math.min(CEL*.42,inf.rayon*.95)));
  const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute("normal",new THREE.Float32BufferAttribute(nor,3)); geo.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  geo.scale(cote,cote,cote);
  const tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=8;
  const mat=new THREE.MeshPhysicalMaterial({map:tex,roughness:.3,clearcoat:.8,clearcoatRoughness:.2,emissive:STYLES_X[style].lueur,emissiveIntensity:.35});
  // orientation de repos pour chaque valeur
  const haut=new THREE.Vector3(0,1,0);
  const dirs=d4?sommets.map(v=>v.clone().normalize()):faces.map(f=>f.n.clone());
  const assise=d4?faces[0].n.dot(faces[0].pts[0])*cote:faces[0].n.dot(faces[0].pts[0])*cote; // rayon inscrit
  return {geo,mat,quat:(v,yaw)=>{ const q=new THREE.Quaternion().setFromUnitVectors(dirs[(v-1)%dirs.length],haut); return new THREE.Quaternion().setFromAxisAngle(haut,yaw).multiply(q); },assise};
}
function deX(type,style){
  const k=type+style; if (cacheDesX[k]) return cacheDesX[k];
  if (type===6){ return cacheDesX[k]={geo:geometrieDe(),mat:materiauxDe(style==="poison"?"ivoire":"rouge"),quat:quatPour,assise:.5}; }
  if (type===100){ // boule de 100 faces : la valeur s'affiche au-dessus
    const geo=new THREE.IcosahedronGeometry(.62,2); const [cv,x]=toile(512,256); const gr=x.createLinearGradient(0,0,512,256); const st=STYLES_X[style];
    gr.addColorStop(0,st.fond[0]); gr.addColorStop(1,st.fond[2]); x.fillStyle=gr; x.fillRect(0,0,512,256);
    x.font="700 34px Alegreya, Georgia, serif"; x.fillStyle=st.chiffre; x.globalAlpha=.75; for (let i=0;i<40;i++) x.fillText(String(1+Math.floor(Math.random()*100)),(i%8)*64+8,Math.floor(i/8)*52+40);
    const tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding;
    return cacheDesX[k]={geo,mat:new THREE.MeshPhysicalMaterial({map:tex,roughness:.25,clearcoat:1,emissive:st.lueur,emissiveIntensity:.3}),quat:(v,yaw)=>new THREE.Quaternion().setFromEuler(new THREE.Euler(v*.7,yaw+v,v*.3)),assise:.6};
  }
  const faces=type===4?facesDepuis(new THREE.TetrahedronGeometry(1)):type===8?facesDepuis(new THREE.OctahedronGeometry(1)):type===12?facesDepuis(new THREE.DodecahedronGeometry(1)):type===20?facesDepuis(new THREE.IcosahedronGeometry(1)):facesD10();
  const cote={4:.95,8:.78,10:.7,12:.72,20:.74}[type];
  return cacheDesX[k]=construireDeX(faces,cote,style,type===4);
}
function texChiffre(t,couleur){ const [c,x]=toile(256,128); x.font="700 92px Pirata One, Alegreya, Georgia, serif"; x.textAlign="center"; x.textBaseline="middle";
  x.shadowColor=couleur; x.shadowBlur=24; x.lineWidth=10; x.strokeStyle="rgba(10,4,2,.9)"; x.strokeText(t,128,68); x.fillStyle="#ffe7a8"; x.fillText(t,128,68); const tx=new THREE.CanvasTexture(c); tx.encoding=THREE.sRGBEncoding; return tx; }
function texArene(){ const [c,x]=toile(1024,1024); const g=x.createRadialGradient(512,512,40,512,512,512); g.addColorStop(0,"#1c2a1a"); g.addColorStop(.7,"#0d150c"); g.addColorStop(1,"#050805"); x.fillStyle=g; x.fillRect(0,0,1024,1024);
  for (let i=0;i<9000;i++){ x.fillStyle=`rgba(${Math.random()<.5?"120,200,90":"0,0,0"},${Math.random()*.08})`; x.fillRect(Math.random()*1024,Math.random()*1024,2,2); }
  x.strokeStyle="rgba(200,40,30,.75)"; x.lineWidth=10; x.beginPath(); x.arc(512,512,440,0,7); x.stroke(); x.lineWidth=4; x.beginPath(); x.arc(512,512,400,0,7); x.stroke();
  x.beginPath(); for (let k=0;k<6;k++){ const a=-Math.PI/2+k*2*Math.PI*2/5; const X=512+Math.cos(a)*380, Y=512+Math.sin(a)*380; k?x.lineTo(X,Y):x.moveTo(X,Y); } x.globalAlpha=.25; x.stroke(); x.globalAlpha=1;
  x.font="700 64px Pirata One, Georgia, serif"; x.fillStyle="rgba(220,60,40,.5)"; x.textAlign="center"; x.fillText("TRAPINEX",512,140); x.save(); x.translate(512,884); x.rotate(Math.PI); x.fillText("INTERDIT",0,0); x.restore();
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; return t; }
function texNeon(){ const [c,x]=toile(1024,256); x.font="700 150px Pirata One, Georgia, serif"; x.textAlign="center"; x.textBaseline="middle";
  x.shadowColor="#ff2a1a"; x.shadowBlur=40; x.fillStyle="#ff6a4a"; x.fillText("TRAPINEX",512,128); x.shadowBlur=10; x.fillStyle="#ffd0c0"; x.fillText("TRAPINEX",512,128);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; return t; }
function texAvis(nom){ const [c,x]=toile(256,340); x.fillStyle="#d8c49a"; x.fillRect(0,0,256,340); x.fillStyle="rgba(80,50,20,.25)"; for (let i=0;i<300;i++) x.fillRect(Math.random()*256,Math.random()*340,3,3);
  x.fillStyle="#3a1a0a"; x.textAlign="center"; x.font="700 40px Pirata One, Georgia, serif"; x.fillText("RECHERCHÉ",128,52); x.fillStyle="#2a1a10"; x.fillRect(48,74,160,150);
  x.fillStyle="#d8c49a"; x.font="700 70px Pirata One, Georgia, serif"; x.fillText("?",128,175); x.fillStyle="#3a1a0a"; x.font="italic 22px Alegreya, Georgia, serif"; x.fillText(nom,128,258); x.font="18px Alegreya, Georgia, serif"; x.fillText("pour Trapinex illégale",128,290);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; return t; }

// Extensions du monde 3D
Object.assign(Monde,{
  desX:[], cave:null, clandestin:0, cibleClandestin:0, eclats:null, secousse:0, flash:0,
  construireCave(){
    const S=this.S, g=this.cave=new THREE.Group(); g.visible=false; S.add(g);
    const mFer=new THREE.MeshStandardMaterial({color:0x1a1816,roughness:.45,metalness:.85});
    // enseigne lumineuse
    const neon=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.65),new THREE.MeshBasicMaterial({map:texNeon(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    neon.position.set(.9,3.05,-4.9); g.add(neon); this.neon=neon;
    // avis de recherche
    [["Pok",-.3,1.9,.06],["Jarek",.45,1.55,-.1],["Brik",1.25,2.0,.04]].forEach(([n,X,Y,r])=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(.42,.56),new THREE.MeshStandardMaterial({map:texAvis(n),roughness:.95})); m.position.set(X,Y,-4.9); m.rotation.z=r; g.add(m); });
    // cage de la prison
    const cage=new THREE.Group(); cage.position.set(4.6,0,-2.6); g.add(cage);
    for (let k=0;k<14;k++){ const a=k/14*Math.PI*2, b=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,2.3,6),mFer); b.position.set(Math.cos(a)*.75,1.15,Math.sin(a)*.75); cage.add(b); }
    for (const y of [.05,1.2,2.3]){ const anneau=new THREE.Mesh(new THREE.TorusGeometry(.75,.03,6,40),mFer); anneau.rotation.x=Math.PI/2; anneau.position.y=y; cage.add(anneau); }
    // chaînes au plafond
    for (const [X,Z] of [[-1.6,-1.2],[1.7,-1.4],[-2.2,1.1]]){ const ch=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1.6,5),mFer); ch.position.set(X,3.6,Z); g.add(ch);
      const croc=new THREE.Mesh(new THREE.TorusGeometry(.06,.012,6,12,Math.PI*1.4),mFer); croc.position.set(X,2.78,Z); g.add(croc); }
    // tapis d'arène
    const arene=new THREE.Mesh(new THREE.CircleGeometry(.66,64),new THREE.MeshStandardMaterial({map:texArene(),roughness:1})); arene.rotation.x=-Math.PI/2; arene.position.y=TABLE_Y+.003; arene.receiveShadow=true; g.add(arene);
    // lumières de la cave
    this.lumCave=new THREE.PointLight(0x7aff4a,0,6,1.6); this.lumCave.position.set(0,TABLE_Y+.9,0); S.add(this.lumCave);
    this.lumNeon=new THREE.PointLight(0xff3a20,0,7,1.5); this.lumNeon.position.set(.9,2.8,-4.2); S.add(this.lumNeon);
    this.lumFlash=new THREE.PointLight(0xffe0a0,0,8,1.2); this.lumFlash.position.set(0,TABLE_Y+.5,0); S.add(this.lumFlash);
    // éclats de l'explosion
    const NE=180, pe=new Float32Array(NE*3), ge=new THREE.BufferGeometry(); ge.setAttribute("position",new THREE.BufferAttribute(pe,3));
    this.eclats=new THREE.Points(ge,new THREE.PointsMaterial({size:.05,map:texLueur(),color:0xffb040,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
    this.eclats.userData={v:Array.from({length:NE},()=>new THREE.Vector3()),t:9}; S.add(this.eclats);
    // couleurs d'origine pour le fondu
    this.base={hemi:this.S.children.find(o=>o.isHemisphereLight), lant:this.lanterne.color.clone(), lantI:this.lanterne.intensity, fog:this.S.fog.color.clone(), fond:this.S.background.clone()};
  },
  ambiance(on){ if (!this.ok) return; if (!this.cave) this.construireCave(); this.cibleClandestin=on?1:0; },
  // prépare les huit dés du combat (4 par joueur)
  preparerX(type){
    if (!this.ok) return; if (!this.cave) this.construireCave();
    this.viderX(); this.typeX=type;
    const places=[[-2.7,-1.25],[-1.2,-1.55],[-2.7,1.25],[-1.2,1.55]];
    for (let j=0;j<2;j++) for (let k=0;k<4;k++){ const D=deX(type,j===0?"poison":"sang"); const m=new THREE.Mesh(D.geo,D.mat); m.castShadow=true; m.visible=false;
      const side=j===0?-1:1, [px,pz]=places[k]; m.position.set(j===0?px:-px,D.assise,pz); this.groupeDes.add(m);
      const lab=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false,depthTest:false,opacity:0})); lab.scale.set(1.5,.75,1); lab.visible=false; this.groupeDes.add(lab);
      this.desX.push({m,D,side,joueur:j,k,anim:null,hop:null,gloire:0,base:D.assise,lab,labA:0,fin:new THREE.Vector3(m.position.x,D.assise,pz)}); }
  },
  viderX(){ for (const d of this.desX){ this.groupeDes.remove(d.m); this.groupeDes.remove(d.lab); if (d.lab.material.map) d.lab.material.map.dispose(); d.lab.material.dispose(); } this.desX=[]; this.des.forEach(d=>{ d.m.visible=true; d.m.scale.setScalar(1); }); },
  // pose un dé du combat déjà lancé (reprise ou tribune)
  poserX(j,k,v){ const d=this.desX[j*4+k]; if (!d) return; d.m.visible=true; d.m.position.copy(d.fin); d.m.quaternion.copy(d.D.quat(v,rnd(-.4,.4))); this.etiquette(d,v); },
  etiquette(d,v){ if (d.lab.material.map) d.lab.material.map.dispose(); d.lab.material.map=texChiffre(String(v),d.joueur===0?"#7aff4a":"#ff4a2a"); d.lab.material.needsUpdate=true; d.lab.visible=true; d.labA=0;
    d.lab.position.set(d.fin.x,d.base+1.5,d.fin.z); },
  cacherX(){ for (const d of this.desX){ d.m.visible=false; d.lab.visible=false; d.anim=null; } },
  lancerX(j,k,v){
    if (!this.ok) return Promise.resolve();
    const d=this.desX[j*4+k]; if (!d) return Promise.resolve();
    d.m.visible=true; d.lab.visible=false;
    return new Promise(res=>{
      const fin=d.fin.clone().add(new THREE.Vector3(rnd(-.2,.2),0,rnd(-.2,.2))); d.finReel=fin;
      const debut=new THREE.Vector3(j===0?-(ECART+3.6):(ECART+3.6),d.base,rnd(-.6,.6));
      const axe=new THREE.Vector3(rnd(-.4,.4),0,j===0?-1:1).normalize();
      const segs=calme?[{d:.25,h:0}]:[{d:.34,h:3,chute:true},{d:.28,h:.9},{d:.18,h:.32},{d:.12,h:.08},{d:.22,h:0}];
      d.anim={t0:performance.now(),dur:segs.reduce((a,s)=>a+s.d,0),debut,fin,Qf:d.D.quat(v,rnd(-.45,.45)),axe,total:(calme?1:5+Math.random()*2.5)*Math.PI,
        axe2:new THREE.Vector3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize(),total2:rnd(1,3)*Math.PI,segs,impact:0,res:()=>{ d.fin.copy(fin); this.etiquette(d,v); res(); }};
    });
  },
  exploser(){
    if (!this.ok) return;
    const e=this.eclats, p=e.geometry.attributes.position;
    for (let i=0;i<p.count;i++){ const src=this.des[i%2].m.position; p.setXYZ(i,src.x*ECHELLE_DE,TABLE_Y+.08,src.z*ECHELLE_DE); e.userData.v[i].set(rnd(-1,1),rnd(.4,1.6),rnd(-1,1)).normalize().multiplyScalar(rnd(.6,2.4)); }
    p.needsUpdate=true; e.userData.t=0; e.material.opacity=1;
    this.flash=1; this.secousse=1;
    this.des.forEach(d=>{ d.explose=performance.now(); });
  },
  gloireX(j){ for (const d of this.desX) d.gloire=j===null?0:(d.joueur===j?1:0); },
});
// boucle d'animation additionnelle (appelée par Monde.frame)
Monde.frameX=function(now,dt){
  const t=now/1000;
  // fondu entre la taverne et la cave clandestine
  this.clandestin+=(this.cibleClandestin-this.clandestin)*Math.min(1,dt*2.5);
  const c=this.clandestin;
  if (this.cave){
    this.cave.visible=c>.02;
    this.cave.children.forEach(o=>{ if (o.material&&o.material.opacity!==undefined&&o!==this.neon){ o.material.transparent=true; o.material.opacity=c; } });
    this.neon.material.opacity=c*(.85+Math.sin(t*23)*.05+(Math.random()<.02?-.5:0));
    this.lumCave.intensity=c*(1.3+Math.sin(t*3)*.15); this.lumNeon.intensity=c*1.6;
    const B=this.base; if (B.hemi) B.hemi.intensity=.42*(1-c*.7);
    this.appliques.forEach(l=>l.intensity*=1-c*.6); this.R.toneMappingExposure=.95*(1-c*.18);
    this.lanterne.color.copy(B.lant).lerp(new THREE.Color(0xc8ffb0),c); this.lanterne.intensity=B.lantI*(1-c*.45);
    this.S.fog.color.copy(B.fog).lerp(new THREE.Color(0x0c1408),c); this.S.background.copy(B.fond).lerp(new THREE.Color(0x060a05),c);
    this.feuLum.color.setRGB(1-c*.6,.48+c*.4,.16+c*.05);
    // flash et éclats de l'explosion
    this.flash*=Math.exp(-dt*3.2); this.lumFlash.intensity=this.flash*9;
    const e=this.eclats, u=e.userData; if (u.t<3){ u.t+=dt; const p=e.geometry.attributes.position;
      for (let i=0;i<p.count;i++){ const v=u.v[i]; v.y-=dt*3.2; p.setXYZ(i,p.getX(i)+v.x*dt,Math.max(TABLE_Y,p.getY(i)+v.y*dt),p.getZ(i)+v.z*dt); }
      p.needsUpdate=true; e.material.opacity=Math.max(0,1-u.t/2.2); }
  }
  // les deux d6 de l'approche se dilatent puis disparaissent
  for (const d of this.des){ if (!d.explose) continue; const u=(now-d.explose)/350; if (u>=1){ d.m.visible=false; d.explose=0; d.m.scale.setScalar(1); } else d.m.scale.setScalar(1+u*.9); }
  // dés du combat
  const q=new THREE.Quaternion(), q2=new THREE.Quaternion();
  for (const d of this.desX){
    const a=d.anim;
    if (a){ const tt=(now-a.t0)/1000, T=Math.min(1,tt/a.dur), kk=easeOut(T);
      d.m.position.x=a.debut.x+(a.fin.x-a.debut.x)*kk; d.m.position.z=a.debut.z+(a.fin.z-a.debut.z)*kk;
      let acc=0,y=0,idx=0; for (;idx<a.segs.length;idx++){ const s=a.segs[idx]; if (tt<acc+s.d){ const w=(tt-acc)/s.d; y=s.chute?s.h*(1-w*w):4*s.h*w*(1-w); break; } acc+=s.d; }
      if (idx>a.impact){ for (let j=a.impact;j<Math.min(idx,a.segs.length);j++){ if (a.segs[j].h>0) Son.clac(Math.min(1,.25+a.segs[j].h*.3)); } a.impact=idx; }
      d.m.position.y=d.base+Math.max(0,y);
      const r=1-easeOutQ(T); q.setFromAxisAngle(a.axe,a.total*r); q2.setFromAxisAngle(a.axe2,a.total2*r*r); d.m.quaternion.copy(q).multiply(q2).multiply(a.Qf);
      if (T>=1){ d.m.position.copy(a.fin); d.m.quaternion.copy(a.Qf); d.anim=null; setTimeout(a.res,40); }
    }
    if (d.lab.visible){ d.labA=Math.min(1,d.labA+dt*3); d.lab.material.opacity=d.labA; d.lab.position.y=d.base+1.25+d.labA*.35+Math.sin(t*2+d.k)*.04;
      const s=(1.3+d.gloire*.35)*(.6+.4*d.labA); d.lab.scale.set(s,s/2,1); }
  }
  // secousse de la caméra
  if (this.secousse>.01){ this.secousse*=Math.exp(-dt*4); const s=this.secousse*.06; this.cam.position.add(new THREE.Vector3(rnd(-s,s),rnd(-s,s),rnd(-s,s))); }
};

/* =========================================================
   PLUIE D'OR
   ========================================================= */
const fx=$("#fx"), fcx=fx.getContext("2d"); let FW=0,FH=0,DPR=1; const pieces=[]; let fxActif=false;
function tailleFx(){ DPR=Math.min(devicePixelRatio||1,2); FW=fx.width=innerWidth*DPR; FH=fx.height=innerHeight*DPR; fx.style.width=innerWidth+"px"; fx.style.height=innerHeight+"px"; }
tailleFx(); addEventListener("resize",tailleFx);
function pluieOr(){ if (calme) return; for (let i=0;i<110;i++) pieces.push({x:Math.random()*FW,y:-Math.random()*FH*.7-20,vx:rnd(-1,1)*DPR,vy:rnd(2,5)*DPR,r:rnd(7,13)*DPR,f:Math.random()*6.28,vf:rnd(.08,.23)}); if (!fxActif){ fxActif=true; requestAnimationFrame(animFx); } }
function animFx(){
  fcx.clearRect(0,0,FW,FH);
  for (let i=pieces.length-1;i>=0;i--){ const p=pieces[i]; p.vy+=.13*DPR; p.x+=p.vx; p.y+=p.vy; p.f+=p.vf; if (p.y>FH+30){ pieces.splice(i,1); continue; }
    const sx=Math.abs(Math.cos(p.f)); fcx.save(); fcx.translate(p.x,p.y); fcx.scale(Math.max(.08,sx),1);
    const g=fcx.createRadialGradient(-p.r*.3,-p.r*.3,p.r*.1,0,0,p.r); g.addColorStop(0,"#fff4c2"); g.addColorStop(.5,"#e8b04a"); g.addColorStop(1,"#7a5018");
    fcx.fillStyle=g; fcx.beginPath(); fcx.arc(0,0,p.r,0,6.283); fcx.fill(); fcx.strokeStyle="rgba(90,55,10,.7)"; fcx.lineWidth=DPR; fcx.beginPath(); fcx.arc(0,0,p.r*.68,0,6.283); fcx.stroke(); fcx.restore(); }
  if (pieces.length) requestAnimationFrame(animFx); else { fxActif=false; fcx.clearRect(0,0,FW,FH); }
}

/* =========================================================
   PORTRAITS : galerie de la taverne, blasons, images
   ========================================================= */
const { GALERIE, svgPortrait } = window.TrapinettePortraits;
const galerieCache = {};
function portraitGalerie(id){
  if (galerieCache[id]) return galerieCache[id];
  const s=svgPortrait(id); if (!s) return null;
  return galerieCache[id]="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s);
}
const TEINTES=[[155,47,42],[42,92,74],[48,70,120],[110,62,120],[140,90,30],[70,90,40],[120,50,70],[40,100,110]];
function blason(nom){
  const k=cle(nom), id="g"+hash(k), jarek=k==="jarek", mj=k==="maître du jeu";
  const [r,g,b]=mj?[60,30,70]:jarek?[110,24,20]:TEINTES[hash(k)%TEINTES.length];
  const ini=mj?"✦":esc((String(nom).trim()[0]||"?").toUpperCase());
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="rgb(${r+60},${g+50},${b+40})"/><stop offset=".6" stop-color="rgb(${r},${g},${b})"/><stop offset="1" stop-color="rgb(${r*.4|0},${g*.4|0},${b*.4|0})"/></radialGradient></defs>
    <rect width="100" height="100" fill="url(#${id})"/><path d="M50 16 L76 26 V50 C76 66 64 78 50 85 C36 78 24 66 24 50 V26 Z" fill="rgba(0,0,0,.28)" stroke="rgba(247,212,136,.75)" stroke-width="2.5"/>
    <text x="50" y="64" text-anchor="middle" font-family="Pirata One, Georgia, serif" font-size="40" fill="#f7e2b0">${ini}</text>
    ${jarek?'<path d="M34 34 L66 66" stroke="#f7d488" stroke-width="3" stroke-linecap="round" opacity=".85"/><path d="M38 34 l2 3 M44 40 l2 3 M50 46 l2 3 M56 52 l2 3 M62 58 l2 3" stroke="#f7d488" stroke-width="2" opacity=".7"/>':""}</svg>`;
}
function imagePortrait(p){ if (!p) return null; if (p.startsWith("galerie:")) return portraitGalerie(p.slice(8)); return p; }
// p : un nom (texte) ou un joueur { nom, portrait }
function avatar(p,t="m"){
  const nom=typeof p==="string"?p:(p&&p.nom)||"?", src=typeof p==="string"?null:imagePortrait(p&&p.portrait);
  return `<span class="ava ${t}"><span class="in">${src?`<img alt="" src="${esc(src)}" referrerpolicy="no-referrer" data-nom="${esc(nom)}">`:blason(nom)}</span></span>`;
}


// Une image d'avatar introuvable (compte supprimé, lien expiré) est remplacée par le blason du joueur
document.addEventListener("error",e=>{ const img=e.target; if (!(img instanceof HTMLImageElement)) return;
  const nom=img.dataset.nom||((img.closest(".choix-p")&&moi&&(moi.nom||moi.pseudoDiscord))||"?");
  if (img.closest(".ava .in")) img.closest(".in").innerHTML=blason(nom);
  else if (img.closest(".choix-p")){ const sp=document.createElement("span"); sp.className="svg"; sp.innerHTML=blason(nom); img.replaceWith(sp); } },true);
/* =========================================================
   COMPTE, API ET TEMPS RÉEL
   ========================================================= */
let moi=null, config={discord:false,dev:false,hautsFaits:{},saison:null};
let salle={joueurs:[],enFile:{},duels:[]}, maFile=null, defiEnvoye=null, classementCache=null, monLien=null;
async function api(chemin,opts={}){
  const r=await fetch(chemin,{credentials:"same-origin",headers:{"Content-Type":"application/json"},...opts,body:opts.body?JSON.stringify(opts.body):undefined});
  let j={}; try { j=await r.json(); } catch {}
  if (!r.ok) throw Object.assign(new Error(j.erreur||"Le Manoir ne répond pas. Réessaie dans un instant."),{status:r.status});
  return j;
}
async function chargerMoi(){
  try { const m=await api("/api/moi"); moi=m.connecte?m:null; } catch { moi=null; }
  monLien=moi&&moi.invitation?{...moi.invitation,url:location.origin+"/d/"+moi.invitation.code}:null;
  majCompte();
  connecterWS(true);
}
const ICONES={
  discord:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 5.3A18 18 0 0 0 15.6 4l-.6 1.1a16 16 0 0 0-6 0L8.4 4A18 18 0 0 0 4 5.3C1.3 9.4.5 13.3.9 17.2a18 18 0 0 0 5.4 2.7l1.2-1.8-1.9-.9.5-.4a12.7 12.7 0 0 0 11.8 0l.5.4-1.9.9 1.2 1.8a18 18 0 0 0 5.4-2.7c.5-4.5-.8-8.4-3.1-11.9ZM8.5 14.8c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2Zm7 0c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2Z"/></svg>`,
  google:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2.1-2 3.2-4.9 3.2-8.2Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7H2a11 11 0 0 0 0 9.9L5.7 14Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2A11 11 0 0 0 2 7l3.7 2.9C6.6 7.3 9.1 5.4 12 5.4Z"/></svg>`,
  twitch:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.3 2 3 5.4v13.8h4.7V22h2.6l2.7-2.8h3.8L22 14V2H4.3Zm15.9 11.2-2.9 2.9h-4.8l-2.6 2.6v-2.6H6V3.8h14.2v9.4Zm-3-6v5h-1.8v-5h1.8Zm-4.8 0v5h-1.8v-5h1.8Z"/></svg>`,
  dev:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 6l-2 12"/></svg>`,
  cle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/></svg>`,
};
const NOMS_FOURN={discord:"Discord",google:"Google",twitch:"Twitch",dev:"Compte de test"};
const NOMS_ROLES={moderateur:"Modérateur",admin:"Administrateur",proprietaire:"Propriétaire"};
const niveau=()=>(moi&&moi.niveau)||0;
// Petit badge à côté d'un nom : pseudo vérifié par Discord ou Twitch
function badge(j){ if (!j||typeof j!=="object") return "";
  const v=j.verifie?`<span class="verifie v-${j.verifie}" title="Pseudo vérifié par ${NOMS_FOURN[j.verifie]}" aria-label="vérifié par ${NOMS_FOURN[j.verifie]}">${ICONES[j.verifie]}</span>`:"";
  const r=j.role?`<span class="role r-${j.role}" title="${NOMS_ROLES[j.role]} du Manoir">${j.role==="moderateur"?"Modo":j.role==="admin"?"Admin":"Patron"}</span>`
    :("role" in j)?`<span class="role r-joueur" title="Joueur : ne fait pas partie de l'équipe du Manoir">Joueur</span>`:"";
  const t=j.titreSpecial?`<span class="titre-or" title="Titre décerné par le Manoir">${COURONNE}${esc(j.titreSpecial)}</span>`:"";
  const p=enPrisonX(j)?`<span class="role r-prison" title="En prison (Trapinex) jusqu'à ${heureCourte(j.prison)}">Prison</span>`:"";
  return v+t+r+p; }
const COURONNE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18 2 7l5.5 4L12 4l4.5 7L22 7l-1 11Z" fill="currentColor"/><rect x="3" y="19" width="18" height="2.5" rx="1" fill="currentColor"/></svg>';
function majCompte(){
  const b=$("#compte");
  if (!moi){ b.innerHTML=`${ICONES.cle}<span>Se connecter</span>`; b.dataset.action="connexion"; }
  else { b.innerHTML=`${avatar(moi.profilCree?moi:moi.pseudoDiscord,"s")}<span>${esc(moi.nom||moi.pseudoDiscord)}${moi.profilCree?` · ${moi.cote}`:""}</span>`; b.dataset.action="profil"; }
}
function seConnecter(retour){
  const r=typeof retour==="string"?retour:null;
  const F=config.fournisseurs||{};
  const liste=Object.keys(F);
  if (!liste.length&&!config.dev){ toast("Aucune connexion n'est encore configurée sur ce serveur."); return; }
  $("#modal").innerHTML=`<div class="voile" id="voile"><div class="registre fiche connexion" role="dialog" aria-modal="true" aria-label="Se connecter">
    <button class="fermer" id="fermer" aria-label="Fermer">×</button>
    <h3>Entrer dans la Ligue</h3>
    <p>Choisis le compte avec lequel tu veux jouer. Le Manoir ne reçoit que ton pseudo et ton avatar : il ne lit ni tes messages, ni tes e-mails, ni tes amis.</p>
    <div class="fournisseurs">${liste.map(f=>`<a class="btn-fourn f-${f}" href="/auth/${f}${r?"?retour="+encodeURIComponent(r):""}">${ICONES[f]}<span>Continuer avec ${esc(F[f])}</span></a>`).join("")}</div>
    ${config.dev?`<form id="f-dev" class="champ dev-login"><label for="dev-nom">Mode test : compte de test sans connexion</label><div class="ligne-form"><input id="dev-nom" maxlength="20" value="Testeur"><button class="btn plein petit" type="submit">Entrer</button></div></form>`:""}
    <p class="note-connexion"><b>Discord ou Twitch :</b> ton pseudo devient ton nom de taverne, avec le badge vérifié, et tu entres directement au classement. <b>Google :</b> tu choisis ton nom, et tes ${config.essaiDuels||5} premiers duels forment une période d'essai qui ne compte pas encore pour la cote.</p>
  </div></div>`;
  $("#fermer").onclick=fermerFiche; $("#voile").onclick=e=>{ if (e.target.id==="voile") fermerFiche(); };
  const fd=$("#f-dev"); if (fd) fd.onsubmit=e=>{ e.preventDefault(); location.href="/auth/dev?nom="+encodeURIComponent($("#dev-nom").value||"Testeur")+(r?"&retour="+encodeURIComponent(r):""); };
}
$("#compte").addEventListener("click",()=>{ if ($("#compte").dataset.action==="connexion") seConnecter(); else allerA("profil"); });

let ws=null, wsEssais=0, wsVoulu=false, fileMessages=[];
function connecterWS(relancer){
  wsVoulu=true;
  if (relancer&&ws){ const ancien=ws; ws=null; ancien.onclose=null; ancien.close(); }
  if (ws&&ws.readyState<=1) return;
  ws=new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host+"/ws");
  ws.onopen=()=>{ wsEssais=0;
    // Reconnexion pendant un duel : si le serveur ne le reprend pas (redémarrage), on le déclare interrompu
    const P=partie; if (P&&P.enLigne&&!P.fini) setTimeout(()=>{ if (partie===P&&!P.fini){ P.fini=true; P.interrompu=true; P.annonce="Duel interrompu"; clearInterval(chronoTour);
      dire(P,"Maître du Jeu",P.spectateur?"Le Manoir a redémarré : ce duel s'est arrêté là.":"Le Manoir a redémarré pendant le duel. Il ne compte pas : aucun point, aucune prison.",true); if (vue==="partie") majPartie(); } },4000);
    if (redemarrage){ redemarrage=false; salle.maintenance=false; majBandeau(); api("/api/config").then(c=>{ config=c; }).catch(()=>{}); toast("Le Manoir est de retour !"); } majSalle(); fileMessages.splice(0).forEach(m=>ws.send(JSON.stringify(m))); };
  ws.onmessage=e=>{ let m; try { m=JSON.parse(e.data); } catch { return; } recevoir(m); };
  ws.onclose=e=>{ ws=null; majSalle(); if (e.code===4003){ toast("Ton compte a été exclu de la Ligue par la modération."); wsVoulu=false; return; } if (wsVoulu){ const d=Math.min(15000,800*Math.pow(2,wsEssais++)); setTimeout(()=>wsVoulu&&connecterWS(),d); } };
}
function envoyer(m){ if (ws&&ws.readyState===1){ ws.send(JSON.stringify(m)); return true; } if (ws&&ws.readyState===0){ fileMessages.push(m); return true; } toast("Connexion à la taverne perdue. Reconnexion…"); connecterWS(); return false; }
const wsOk=()=>ws&&ws.readyState===1;

function recevoir(m){
  switch(m.t){
    case "presence": salle=m; majSalle(); majCave(); majBandeau(); majMaintenance(); break;
    case "maintenance": salle.maintenance=m.actif; majBandeau(); majMaintenance(); if (m.actif) toast("Mise à jour imminente : plus de nouveaux duels pour quelques minutes."); break;
    case "redemarrage": redemarrage=true; majBandeau(); break;
    case "x_cri": surXCri(m); break;
    case "x_crie": surXCrie(m); break;
    case "x_explosion": surXExplosion(m); break;
    case "x_tour": surXTour(m); break;
    case "x_de": surXDe(m); break;
    case "x_egalite": surXEgalite(m); break;
    case "defi": afficherDefi(m); break;
    case "defi_envoye": defiEnvoye=m; majSalle(); majCave(); toast(m.dx?`Provocation envoyée à ${m.a.nom}. Il a 30 secondes pour descendre.`:`Défi envoyé à ${m.a.nom}. Il a 30 secondes pour répondre.`); break;
    case "defi_annule": if (defiEnvoye&&defiEnvoye.id===m.id){ defiEnvoye=null; majSalle(); majCave(); } fermerDefi(m.id); if (m.texte) toast(m.texte); break;
    case "file": maFile=m.format; maFileX=m.de||null; majSalle(); majCave(); break;
    case "duel": defiEnvoye=null; maFile=null; maFileX=null; if (!m.spectateur&&monLien) monLien=null; fermerDefi(); demarrerEnLigne(m); break;
    case "tour": surTour(m); break;
    case "de": surDe(m); break;
    case "manche": surManche(m); break;
    case "fin": surFin(m); break;
    case "emote": if (partie&&partie.enLigne){ dire(partie,m.de+(m.spectateur?" (tribune)":""),m.texte); majPartie(); } break;
    case "info": if (partie&&partie.enLigne){ dire(partie,"Maître du Jeu",m.texte,true); majPartie(); } else toast(m.texte); break;
    case "annonce": toast(m.texte); break;
    case "haut_fait": afficherHautFait(m); if (moi){ moi.hautsFaits=[...(moi.hautsFaits||[]),m.code]; } break;
    case "tournoi_maj": if (vue==="tournoi"&&tournoiOuvert===m.id) chargerTournoi(m.id); else if (vue==="ligue"&&ongletLigue==="tournois") rendreLigue(); break;
    case "saison": toast(`Une nouvelle saison commence : ${m.nom} !`); api("/api/config").then(c=>{config=c;}).catch(()=>{}); classementCache=null; chargerMoi(); break;
    case "signalement": if (vue==="ligue"&&ongletLigue==="moderation") rendreLigue(); break;
    case "role": chargerMoi().then(()=>{ if (vue==="ligue") rendreLigue(); if (vue==="cave") rendreCave(); }); break;
    case "erreur": toast(m.texte); if (vue==="invitation") rendreInvitation(); break;
  }
}
let defiRecu=null, defiMinuteur=null, redemarrage=false;
function majBandeau(){ const b=$("#bandeau"); const on=redemarrage||!!salle.maintenance;
  b.hidden=!on; if (!on) return;
  b.innerHTML=redemarrage?`<b>Le Manoir redémarre</b> pour une mise à jour. Reconnexion automatique dans un instant…`
    :`<b>Mise à jour imminente</b> · pas de nouveaux duels pour quelques minutes. Les duels en cours se terminent normalement.`; }
function afficherDefi(m){
  defiRecu=m; Son.clac(.6);
  const el=$("#defi"); el.hidden=false;
  el.classList.toggle("defi-x",!!m.dx);
  el.innerHTML=`<div class="defi-carte panneau" role="alertdialog" aria-label="Défi reçu">${avatar(m.de,"l")}<div><div class="k">Défi reçu</div><div class="t">${esc(m.de.nom)} ${m.dx?"te provoque":"te défie"}</div>
    <div class="s">${m.dx?`<b class="x">Trapinex · ${esc(m.nomDe)} (d${m.dx})</b> · le perdant finit 24 h en prison`:`${esc(m.de.titre)} · cote ${m.de.cote} · ${m.format>1?`au meilleur des ${m.format}`:"un lancer décisif"}`}</div><div class="chrono" id="chrono-defi">30 s</div></div>
    <div class="boutons"><button class="btn plein" id="accepter">Relever le défi</button><button class="btn" id="refuser">Décliner</button></div></div>`;
  const fin=Date.now()+30000; clearInterval(defiMinuteur);
  defiMinuteur=setInterval(()=>{ const s=Math.max(0,Math.ceil((fin-Date.now())/1000)); const c=$("#chrono-defi"); if (c) c.textContent=s+" s"; if (!s) fermerDefi(); },500);
  $("#accepter").onclick=()=>{ envoyer({t:"repondre",id:m.id,accepte:true}); fermerDefi(); };
  $("#refuser").onclick=()=>{ envoyer({t:"repondre",id:m.id,accepte:false}); fermerDefi(); };
}
function fermerDefi(id){ if (id&&defiRecu&&defiRecu.id!==id) return; defiRecu=null; clearInterval(defiMinuteur); const el=$("#defi"); el.hidden=true; el.innerHTML=""; }

/* ---------- Hauts faits ---------- */
const MEDAILLE=`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 2h8l2 10-6 4zM34 2h-8l-2 10 6 4z" fill="#9b2f2a"/><circle cx="24" cy="30" r="15" fill="#e0a846" stroke="#8a5d1c" stroke-width="2.5"/><circle cx="24" cy="30" r="10" fill="none" stroke="#fff0b8" stroke-width="1.5" opacity=".7"/><path d="M24 23l2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5-3.7-3.4 5-.6z" fill="#fff0b8"/></svg>`;
let fileHautsFaits=[], hfAffiche=false;
function afficherHautFait(h){ fileHautsFaits.push(h); if (!hfAffiche) suivantHautFait(); }
function suivantHautFait(){
  const h=fileHautsFaits.shift(); const el=$("#haut-fait");
  if (!h){ hfAffiche=false; el.hidden=true; return; }
  hfAffiche=true; el.hidden=false;
  el.innerHTML=`<div class="hf-carte">${MEDAILLE}<div><div class="k">Haut fait débloqué</div><div class="t">${esc(h.nom)}</div><div class="s">${esc(h.desc)}</div></div></div>`;
  Son.pieces();
  setTimeout(suivantHautFait,4200);
}
function grilleHautsFaits(obtenus){
  const o=new Map((obtenus||[]).map(h=>typeof h==="string"?[h,null]:[h.code,h.date]));
  return `<div class="hauts-faits">${Object.entries(config.hautsFaits||{}).map(([code,h])=>`<div class="hf ${o.has(code)?"on":""}" title="${esc(h.desc)}">${MEDAILLE}<div><b>${esc(h.nom)}</b><span>${esc(h.desc)}</span></div></div>`).join("")}</div>`;
}

/* =========================================================
   NARRATION ET TUTORIEL
   ========================================================= */
const PLUME='<svg viewBox="0 0 24 24" fill="none" stroke="#7a2a20" stroke-width="2" aria-hidden="true"><path d="M20 4c-6 0-12 5-13 13l-3 3"/><path d="M7 17c4 0 9-3 11-8"/></svg>';
let narrationId=0;
function narrer(el,texte,fini){
  if (!el) return; const id=el._narration=++narrationId;
  if (calme){ el.textContent=texte; if (fini) fini(); return; }
  el.innerHTML='<span></span><i class="curseur"></i>'; const s=el.firstChild; let i=0;
  const pas=()=>{ if (id!==el._narration||!el.isConnected) return; i+=2; s.textContent=texte.slice(0,i); if (i<texte.length) setTimeout(pas,20); else { const c=el.querySelector(".curseur"); if (c) setTimeout(()=>c.remove(),1500); if (fini) fini(); } };
  pas();
}
const TUTO=[
  {t:"Bienvenue au Manoir",x:"Je suis le Maître du Jeu. Ici, au Manoir du Crâne-de-Troll, on règle tout d'un seul jet de dé : la Trapinette.",de:[6,6]},
  {t:"La règle",x:"Chacun lance un dé à six faces. Le plus haut gagne la manche. En cas d'égalité, on relance. Un 6 est une réussite critique, un 1 un échec critique… pour l'honneur.",de:[5,2]},
  {t:"Trois tables",x:"Entraîne-toi contre Jarek à la table du fond, affronte un ami sur le même écran au comptoir, ou entre dans la Ligue internationale.",de:[3,4]},
  {t:"La Ligue",x:"Connecte-toi avec Discord, Google ou Twitch, choisis ton portrait, puis défie des joueurs du monde entier ou partage un lien de défi sur ton serveur. Les dés sont tirés par le Manoir : personne ne peut tricher.",de:[6,1]},
  {t:"À toi de jouer",x:"Gagne des duels pour grimper au classement de la saison, débloque des hauts faits et inscris-toi aux tournois. Que les dés te soient favorables !",de:[6,5]},
];
const TUTO_X=[
  {t:"Bienvenue dans la Cave",x:"Psst… Tu as trouvé la trappe. Ici, on joue à la Trapinex, la règle illégale de la Trapinette. Le tavernier ne doit rien savoir."},
  {t:"1. L'approche",x:"Chaque joueur lance un d6, encore et encore, jusqu'à ce que les deux dés tombent sur le même chiffre. Tant qu'il n'y a pas d'égalité, on relance."},
  {t:"2. Criez « DUEL » !",x:"Dès que l'égalité tombe, un gros bouton DUEL apparaît. Appuie le plus vite possible (ou touche A, Espace, ou L pour le second joueur) : le premier qui crie lancera en premier."},
  {t:"3. L'explosion et le combat",x:"Les dés explosent ! Chacun son tour, chaque joueur lance quatre dés du type choisi : d4 Trapibaka, d6 Trapinex OG, d8 Traptdrtki, d10 Trapisse, d12 TrapiUwU, d20 Trapinat ou d100 Trapigoulu. Le plus gros total gagne."},
  {t:"4. La prison",x:"En ligne, le perdant part en prison pendant 24 heures : plus de Trapinex pour lui, mais il peut toujours jouer à la Trapinette normale. Attention : s'enfuir en plein duel mène aussi au cachot."},
  {t:"5. À toi de jouer",x:"Choisis ton dé, puis entraîne-toi contre Jarek, affronte un ami sur le même écran, ou provoque des joueurs en ligne. Les victoires comptent pour le registre clandestin, séparé de la Ligue."},
];
function ouvrirTuto(liste=TUTO,cleTuto="trapinette-tuto"){
  const TUTO=liste;
  let i=0;
  const el=$("#tuto"); el.hidden=false;
  const etape=()=>{
    const e=TUTO[i];
    el.innerHTML=`<div class="tuto-carte mj" role="dialog" aria-modal="true" aria-label="Comment jouer">
      <div class="qui">${PLUME}Le Maître du Jeu · ${i+1}/${TUTO.length}</div>
      <h3>${esc(e.t)}</h3><p id="tuto-texte"></p>
      <div class="tuto-bas"><div class="points">${TUTO.map((_,k)=>`<span class="${k===i?"on":""}"></span>`).join("")}</div>
        <button class="btn petit" id="tuto-passer">Passer</button><button class="btn plein" id="tuto-suite">${i<TUTO.length-1?"Suite":liste===TUTO_X?"Descendre dans l'arène":"Entrer dans la taverne"}</button></div></div>`;
    narrer($("#tuto-texte"),e.x);
    if (Monde.ok&&vue==="accueil"&&e.de){ Monde.lancer(0,e.de[0]); setTimeout(()=>Monde.lancer(1,e.de[1]),150); }
    $("#tuto-passer").onclick=fin; $("#tuto-suite").onclick=()=>{ if (i<TUTO.length-1){ i++; etape(); } else fin(); };
    $("#tuto-suite").focus();
  };
  const fin=()=>{ store.set(cleTuto,1); el.hidden=true; el.innerHTML=""; };
  etape();
}

/* =========================================================
   NAVIGATION
   ========================================================= */
let vue="accueil", partie=null, format=store.get("trapinette-format",1), prep={a:"",b:""};
let ongletLigue="classement", tournoiOuvert=null, invitationCode=null;
const bilanJarek=()=>store.get("trapinette-jarek",{toi:0,jarek:0});
const monNom=()=>(moi&&moi.nom)||nomActuel();
function allerA(v,opts={}){
  if (vue==="partie"&&v!=="partie"&&partie&&partie.enLigne&&!partie.fini&&!partie.spectateur){ toast("Tu es en plein duel : termine-le ou abandonne-le d'abord."); return; }
  if (vue==="partie"&&v!=="partie"&&partie&&partie.spectateur){ envoyer({t:"quitter_tribune"}); partie=null; }
  vue=v;
  const sec=v==="cave"||(v==="prep"&&prep.x)||(v==="partie"&&partie&&partie.trapinex)?"cave":["ligue","profil","tournoi","invitation"].includes(v)||(v==="partie"&&partie&&partie.enLigne)?"ligue":"accueil";
  document.querySelectorAll(".nav [data-section]").forEach(b=>b.setAttribute("aria-current",String(b.dataset.section===sec)));
  if (Monde.vue!=="intro") Monde.allerVers(v==="partie"?"partie":v==="accueil"?"accueil":v==="cave"?"cave":"mur");
  const url=v==="cave"?"/#cave":v==="ligue"?"/#"+(ongletLigue==="classement"?"ligue":ongletLigue):v==="profil"?"/#profil":v==="tournoi"?"/#tournoi-"+tournoiOuvert:v==="invitation"?"/d/"+invitationCode:"/";
  if (location.pathname+location.hash!==url) history.replaceState(null,"",url);
  rendre(); if (!opts.garderScroll) window.scrollTo({top:0});
}
document.addEventListener("click",e=>{ const a=e.target.closest("[data-aller]"); if (a) allerA(a.dataset.aller); });
function rendre(){ ({accueil:rendreAccueil,prep:rendrePrep,partie:rendrePartie,ligue:rendreLigue,profil:rendreProfil,tournoi:rendreTournoi,invitation:rendreInvitation,cave:rendreCave})[vue](); majAmbiance(); }
// La cave clandestine a sa propre ambiance (lumières, musique, couleurs)
function majAmbiance(){ const on=vue==="cave"||(vue==="prep"&&!!prep.x)||(vue==="partie"&&!!(partie&&partie.trapinex)); document.body.classList.toggle("clandestin",on); Monde.ambiance(on); Son.theme(on?"cave":"taverne");
  if (!(vue==="partie"&&partie&&partie.trapinex)&&Monde.desX&&Monde.desX.length) Monde.viderX(); }

/* =========================================================
   ACCUEIL
   ========================================================= */
const EMBLEMES={
  jarek:`<svg class="embleme" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#2a0f0c" stroke="#e0a846" stroke-width="2"/><path d="M14 38 L40 24 L46 26 L44 30 L26 40 L24 48 L18 48 Z" fill="#c9a36a" stroke="#1a0f08" stroke-width="1.5"/><circle cx="41" cy="27" r="1.6" fill="#1a0f08"/><path d="M44 14 h6 v6 l3 5 v22 a3 3 0 0 1-3 3 h-6 a3 3 0 0 1-3-3 V25 l3-5z" fill="#3f6b4a" stroke="#1a0f08" stroke-width="1.5" opacity=".9"/><rect x="43" y="32" width="10" height="8" fill="#ecdcb8" opacity=".85"/></svg>`,
  comp:`<svg class="embleme" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#2a1a0c" stroke="#e0a846" stroke-width="2"/><g transform="rotate(-12 22 36)"><rect x="12" y="24" width="18" height="24" rx="3" fill="#c9923a" stroke="#1a0f08" stroke-width="1.5"/><path d="M30 29 h4 a4 4 0 0 1 4 4 v6 a4 4 0 0 1-4 4 h-4" fill="none" stroke="#1a0f08" stroke-width="2"/><ellipse cx="21" cy="23" rx="10" ry="4" fill="#fff4dc"/></g><g transform="rotate(12 42 36)"><rect x="34" y="24" width="18" height="24" rx="3" fill="#c9923a" stroke="#1a0f08" stroke-width="1.5"/><path d="M34 29 h-4 a4 4 0 0 0-4 4 v6 a4 4 0 0 0 4 4 h4" fill="none" stroke="#1a0f08" stroke-width="2"/><ellipse cx="43" cy="23" rx="10" ry="4" fill="#fff4dc"/></g></svg>`,
  ligue:`<svg class="embleme" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#2a1a0c" stroke="#e0a846" stroke-width="2"/><circle cx="32" cy="32" r="16" fill="none" stroke="#e0a846" stroke-width="2"/><path d="M16 32 h32 M32 16 c-8 8 -8 24 0 32 M32 16 c8 8 8 24 0 32" fill="none" stroke="#e0a846" stroke-width="1.8"/><path d="M42 44 l8 8" stroke="#c83a2a" stroke-width="4" stroke-linecap="round"/><path d="M22 44 l-8 8" stroke="#c83a2a" stroke-width="4" stroke-linecap="round"/></svg>`,
};
async function chargerClassement(){ try { classementCache=await api("/api/classement?n=100"); } catch { classementCache=classementCache||{joueurs:[],recents:[],total:0,duels:0,horsLigne:true}; } return classementCache; }
function rendreAccueil(){
  const b=bilanJarek(), cl=(classementCache&&classementCache.joueurs||[]).slice(0,4);
  const enCours=(salle.duels||[]).slice(0,3);
  app.innerHTML=`
  <section class="vue">
    <div class="accueil">
      <div class="titre">
        <div class="sur">Le jeu de dés du Manoir</div>
        <h1>La Trapinette</h1>
        <div class="regle"><span>Un d6 chacun</span><span>Le plus haut gagne</span><span>Égalité : on relance</span><button class="lien-tuto" id="voir-tuto">Comment jouer ?</button></div>
        <div class="mj"><div class="qui">${PLUME}Le Maître du Jeu</div><p id="narration"></p></div>
      </div>
      <div class="cote-droit">
        <div class="panneau encart"><h3>Tête de la Ligue${config.saison?` · ${esc(config.saison.nom)}`:""}</h3>
          ${cl.length?`<div class="podium">${cl.map((j,i)=>`<button class="ligne" data-fiche="${esc(j.id)}"><span class="rang">${i+1}</span>${avatar(j,"m")}<span><span class="nomp">${esc(j.nom)}</span><span class="detail">${esc(j.titre)} · ${j.v} V – ${j.d} D</span></span><span class="cote">${j.cote}</span></button>`).join("")}</div>`
            :`<p class="vide">Le registre de la saison attend ses premiers duellistes. Connecte-toi et défie quelqu'un.</p>`}
        </div>
        ${enCours.length?`<div class="panneau encart"><h3>En ce moment au Manoir</h3>${enCours.map(d=>duelEnCoursHTML(d)).join("")}</div>`:""}
        <div class="panneau encart"><h3>Ton ardoise avec Jarek</h3>
          <div style="display:flex;gap:12px;align-items:center">${avatar(moi&&moi.profilCree?moi:monNom(),"m")}<b style="font-family:var(--display);font-size:30px;font-weight:400">${b.toi} – ${b.jarek}</b>${avatar("Jarek","m")}</div>
          <p class="vide" style="margin-top:6px">${b.toi+b.jarek===0?"Jarek t'attend à la table du fond.":b.toi>b.jarek?"Jarek commence à te regarder de travers.":b.toi<b.jarek?"Jarek boit à ta santé. Et avec ton or.":"Parfaite égalité. Jarek n'aime pas ça."}</p>
        </div>
      </div>
    </div>
    <div class="enseignes">
      <button class="pancarte" id="m-jarek"><span class="bois">${EMBLEMES.jarek}<span class="num">Table du fond · hors ligue</span><h2>S'entraîner contre Jarek</h2>
        <p>La balafre, le pistolet et la bouteille. Jarek lance, te nargue, et triche peut-être.</p><span class="go">S'asseoir face à lui →</span></span></button>
      <button class="pancarte" id="m-comp"><span class="bois">${EMBLEMES.comp}<span class="num">Comptoir · hors ligue</span><h2>Jouer contre un compagnon</h2>
        <p>Deux joueurs, un seul écran, chacun son dé. Le perdant paie la tournée.</p><span class="go">Prendre deux chopes →</span></span></button>
      <button class="pancarte" id="m-ligue"><span class="bois">${EMBLEMES.ligue}<span class="num">Salle d'honneur · en ligne</span><h2>Ligue internationale</h2>
        <p>Connecte-toi avec Discord, Google ou Twitch et défie des joueurs du monde entier. Les dés sont tirés par le Manoir : impossible de tricher.</p><span class="go">Entrer dans la Ligue →</span></span></button>
    </div>
    <button class="trappe" id="m-cave"><span class="planches">${iconeDe(20)}<span class="txt"><span class="num">Sous le comptoir · règle illégale</span><b>La Cave clandestine</b><span class="d">Trapinex : lancez jusqu'à l'égalité, criez « DUEL », et les dés explosent. Le perdant dort en prison.</span></span><span class="go">Soulever la trappe →</span></span></button>
  </section>`;
  narrer($("#narration"),MJ.accueil);
  $("#m-cave").onclick=()=>allerA("cave");
  $("#m-jarek").onclick=()=>{ nouvellePartie("jarek",[monNom(),"Jarek"]); allerA("partie"); };
  $("#m-comp").onclick=()=>{ prep.x=null; allerA("prep"); };
  $("#m-ligue").onclick=()=>{ ongletLigue="classement"; allerA("ligue"); };
  $("#voir-tuto").onclick=()=>ouvrirTuto();
  app.querySelectorAll("[data-regarder]").forEach(b=>b.onclick=()=>regarder(b.dataset.regarder));
  if (!classementCache) chargerClassement().then(()=>{ if (vue==="accueil") rendreAccueil(); });
}
function duelEnCoursHTML(d){
  const [a,b]=d.joueurs;
  return `<div class="en-cours">${avatar(a,"s")}<span class="n">${esc(a.nom)} <em>${d.scores[0]} – ${d.scores[1]}</em> ${esc(b.nom)}</span>${avatar(b,"s")}
    <span class="s">${d.mode==="trapinex"?`<b class="x">Trapinex · ${esc(d.nomDe)}</b>`:`${d.tournoi?esc(d.tournoi)+" · ":""}${d.format>1?"meilleur des "+d.format:"1 lancer"}`}${d.spectateurs?` · ${d.spectateurs} en tribune`:""}</span>
    <button class="btn petit" data-regarder="${esc(d.id)}">Regarder</button></div>`;
}
function regarder(id){ if (partie&&partie.enLigne&&!partie.fini&&!partie.spectateur){ toast("Tu es déjà en duel."); return; } envoyer({t:"regarder",duel:id}); }

/* =========================================================
   PRÉPARATION (compagnon, hors ligue)
   ========================================================= */
function formatHTML(verrou){ return `<div class="format" role="group" aria-label="Format du duel"><span>Format</span>${[[1,"Un lancer"],[3,"Au meilleur des 3"],[5,"Au meilleur des 5"]].map(([n,l])=>`<button type="button" data-format="${n}" aria-pressed="${format===n}" ${verrou?"disabled":""}>${l}</button>`).join("")}</div>`; }
function lierFormat(apres){ app.querySelectorAll("[data-format]").forEach(b=>b.onclick=()=>{ format=+b.dataset.format; store.set("trapinette-format",format); app.querySelectorAll("[data-format]").forEach(x=>x.setAttribute("aria-pressed",String(+x.dataset.format===format))); if (apres) apres(); }); }
function rendrePrep(){
  const noms=COMPAGNIE.slice();
  const bloc=c=>`<div class="champ"><div class="tete">${avatar(prep[c]||"?","l")}<div style="flex:1;display:flex;flex-direction:column;gap:6px"><label for="nom-${c}">${c==="a"?"Premier joueur":"Second joueur"}</label><input id="nom-${c}" maxlength="24" autocomplete="off" placeholder="${c==="a"?"Ton nom de taverne":"Son nom de taverne"}" value="${esc(prep[c])}"></div></div>
    <div class="puces">${noms.map(n=>`<button class="puce" type="button" data-cote="${c}" data-nom="${esc(n)}">${avatar(n,"s")}${esc(n)}</button>`).join("")}</div></div>`;
  if (!prep.a) prep.a=monNom();
  app.innerHTML=`<section class="vue">
    <div class="barre"><div><h2>${prep.x?"Trapinex entre compagnons":"Face à un compagnon"}</h2><div class="sous">${prep.x?"Sur le même écran : le premier joueur joue avec la touche A, le second avec la touche L (ou en touchant sa moitié du tapis)":"Partie amicale sur le même écran : rien n'est inscrit au registre"}</div></div>${prep.x?`<div class="format format-x">${iconeDe(prep.x)}<span>${libelleDe(prep.x)}</span></div>`:formatHTML(false)}</div>
    <form class="panneau prep" id="f-prep" novalidate>
      <div class="prep-grille">${bloc("a")}<div class="contre">contre</div>${bloc("b")}</div>
      <div class="erreur" id="err" role="alert"></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px"><button class="btn" type="button" data-aller="${prep.x?"cave":"accueil"}">Retour</button><button class="btn plein" type="submit">${prep.x?"Descendre dans l'arène":"S'asseoir à la table"}</button></div>
    </form></section>`;
  lierFormat();
  const majTete=c=>{ const n=propre($("#nom-"+c).value)||"?"; $("#nom-"+c).closest(".champ").querySelector(".tete .ava .in").innerHTML=blason(n); };
  ["a","b"].forEach(c=>{ $("#nom-"+c).oninput=e=>{ prep[c]=e.target.value; majTete(c); }; majTete(c); });
  app.querySelectorAll(".puce").forEach(p=>p.onclick=()=>{ $("#nom-"+p.dataset.cote).value=p.dataset.nom; prep[p.dataset.cote]=p.dataset.nom; majTete(p.dataset.cote); });
  $("#f-prep").onsubmit=e=>{ e.preventDefault(); const a=propre($("#nom-a").value), b=propre($("#nom-b").value);
    if (!a||!b){ $("#err").textContent="Il faut deux noms pour s'asseoir à la table."; return; }
    if (cle(a)===cle(b)){ $("#err").textContent="On ne joue pas contre soi-même, même après trois chopes. Choisis deux noms différents."; return; }
    if (prep.x) nouvellePartieX("compagnon",[a,b],prep.x); else nouvellePartie("compagnon",[a,b]); allerA("partie"); };
}

/* =========================================================
   PARTIE (locale, en ligne, tribune)
   ========================================================= */
function nouvellePartie(mode,noms){
  partie={mode,enLigne:false,format,but:Math.ceil(format/2),j:noms.map(n=>({nom:n,joueur:null,score:0,de:null,derniere:null,six:0})),
    manche:1,relances:0,fini:false,gagnant:null,anims:[null,null],journal:[],chronique:[],annonce:"Faites un jet de Trapinette",annonceEg:false,narre:false};
  if (mode==="jarek"&&moi&&moi.profilCree) partie.j[0].joueur=moi;
  partie.chronique.push({qui:"Maître du Jeu",texte:MJ[mode],mj:true});
  if (mode==="jarek") partie.chronique.push({qui:"Jarek",texte:hasard(JAREK.debut)});
}
const spectateur=P=>{ const libres=COMPAGNIE.filter(n=>!P.j.some(j=>cle(j.nom)===cle(n))); return hasard(libres.length?libres:COMPAGNIE); };
function dire(P,qui,texte,mj){ P.chronique.push({qui,texte,mj:!!mj}); if (P.chronique.length>60) P.chronique.splice(1,1); }
function reaction(P,type){ const p=spectateur(P); dire(P,p,hasard(SALLE[type]).replace("{p}",p)); }
function qualiteDe(i){ const P=partie,p=P.j[i];
  if (P.mode==="jarek"&&i===1) return "Balafré · Pistolero";
  if (p.joueur&&p.joueur.titre) return p.joueur.titre+" · "+p.joueur.cote;
  return COMPAGNIE.map(cle).includes(cle(p.nom))?"De la Compagnie":"Client du Manoir"; }
function siegeHTML(i){
  if (partie.trapinex) return siegeHTMLX(i);
  const P=partie,p=P.j[i],bot=P.mode==="jarek"&&i===1,adv=P.enLigne&&(i===1||P.spectateur);
  const peut=!P.fini&&p.de===null&&!bot&&!adv&&!p.attente;
  const traits=Array.from({length:P.but},(_,k)=>`<span class="trait${k<p.score?" plein":""}"></span>`).join("");
  let label="Lancer le dé";
  if (bot) label=P.fini?"Jarek range son dé":(P.anims[1]?"Jarek lance…":"Jarek attend");
  else if (adv) label=P.fini?"Duel terminé":(p.de!==null?"A lancé":"À son tour…");
  else if (P.fini) label="Duel terminé";
  else if (p.attente||p.de!==null) label="Le dé roule…";
  const touche=P.spectateur?"":P.enLigne?(i===0?"Espace ou A":""):P.mode==="jarek"?(i===0?"Espace ou A":""):(i===0?"Touche A":"Touche L");
  return `${avatar(p.joueur||p.nom,"l")}<div class="nom">${p.joueur&&p.joueur.id?`<button class="lien" data-fiche="${esc(p.joueur.id)}">${esc(p.nom)}</button>${badge(p.joueur)}`:esc(p.nom)}</div><div class="qualite">${esc(qualiteDe(i))}</div>
    <div class="traits" aria-label="${p.score} manche(s) gagnée(s) sur ${P.but}">${traits}</div>
    <div class="dernier">${p.derniere??""}<small>${p.derniere?"dernier lancer":"&nbsp;"}</small></div>
    <button class="lancer" ${bot||adv?"":`id="lancer-${i}"`} ${peut?"":"disabled"}>${label}</button>
    <div class="touche">${touche}</div>`;
}
function rendrePartie(){
  const P=partie;
  if (!P){ allerA("ligue"); return; }
  const X=P.trapinex;
  const titre=X?`Trapinex · ${nomDeX(X.dx)}`:P.spectateur?"Depuis la tribune":P.enLigne?(P.tournoi?"Match de tournoi":"Duel de la Ligue"):P.mode==="jarek"?"Contre Jarek":"Entre compagnons";
  const sous=X?(P.spectateur?`Tu regardes ${P.j[0].nom} contre ${P.j[1].nom} depuis l'ombre`:P.enLigne?"Cave clandestine · dés tirés par le Manoir · le perdant finit 24 h en prison":P.mode==="jarek"?"Cave clandestine · contre Jarek (le cachot est pour de faux)":"Cave clandestine · entre compagnons"):P.spectateur?`Tu regardes ${P.j[0].nom} contre ${P.j[1].nom}${P.tournoi?" · "+P.tournoi:""}`:P.enLigne?(P.tournoi?`${P.tournoi} · dés tirés par le Manoir`:"En ligne · dés tirés par le Manoir · inscrit au registre mondial"):P.mode==="jarek"?"Table du fond · entraînement hors ligue":"Partie amicale au comptoir";
  app.innerHTML=`<section class="vue">
    <div class="barre"><div><h2>${titre}</h2><div class="sous">${esc(sous)}</div></div><div id="zone-format"></div></div>
    <div class="jeu">
      <div class="panneau siege" id="siege-0"></div>
      <div class="fenetre" id="fenetre">${Monde.ok?"":`<div class="repli"><span data-repli="0">${P.j[0].derniere||"?"}</span><span data-repli="1" class="${P.mode==="jarek"||P.enLigne?"rouge":""}">${P.j[1].derniere||"?"}</span></div>`}
        <span class="manche" id="manche"></span><span class="crit g" id="crit-0"></span><span class="crit d" id="crit-1"></span><span class="annonce" id="annonce" aria-live="polite"></span>
        <span class="aide" id="aide">${P.spectateur?"":P.enLigne||P.mode==="jarek"?"Touche le tapis pour jouer":"Touche ta moitié du tapis pour jouer"}</span></div>
      <div class="panneau siege" id="siege-1"></div>
    </div>
    <div class="dessous"><div class="panneau chronique" id="chronique"></div><div class="panneau actions" id="actions"></div></div>
  </section>`;
  $("#fenetre").onclick=e=>{ if (partie!==P||P.spectateur) return; if (P.enLigne||P.mode==="jarek") return actionSiege(0); const r=e.currentTarget.getBoundingClientRect(); actionSiege(e.clientX<r.left+r.width/2?0:1); };
  Monde.styleDe(1,P.mode==="jarek"||P.enLigne||X?"rouge":"ivoire"); Monde.poser(0,P.j[0].derniere||6); Monde.poser(1,P.j[1].derniere||6); Monde.gloire(P.fini&&!X?P.gagnant:null);
  if (X){ Monde.preparerX(X.dx); const combat=X.phase==="combat"||X.phase==="fin";
    Monde.des.forEach(d=>d.m.visible=!combat); if (X.combat) X.combat.tirs.forEach((t,j)=>t.forEach((v,k)=>Monde.poserX(j,k,v))); if (P.fini) Monde.gloireX(P.gagnant); }
  else if (Monde.desX&&Monde.desX.length) Monde.viderX();
  majPartie();
}
let chronoTour=null;
function texteManche(P){
  if (P.fini) return "Duel terminé";
  let t=(P.but>1?`Manche ${P.manche} · premier à ${P.but}`:"Lancer décisif")+(P.relances?` · relance n°${P.relances}`:"");
  if (P.enLigne&&P.limite){ const s=Math.max(0,Math.ceil((P.limite-Date.now())/1000)); if (s<=30) t+=` · ${s} s`; }
  return t;
}
const EMOTES_J=[["sante","Santé !"],["bravo","Bien joué"],["chance","Quelle chance…"],["tremble","Tu trembles ?"],["jarek","Jarek ferait mieux"]];
const REACTIONS_T=[["bravo","Bravo !"],["oh","Ooooh !"],["allez","Allez !"],["suspense","Quel suspense…"],["chope","Tournée générale !"]];
function majPartie(){
  const P=partie; if (vue!=="partie"||!P) return;
  $("#zone-format").innerHTML=P.trapinex?`<div class="format format-x">${iconeDe(P.trapinex.dx)}<span>${libelleDe(P.trapinex.dx)}${P.spectateurs?` · ${P.spectateurs} dans l'ombre`:""}</span></div>`:P.enLigne?`<div class="format"><span>${P.format>1?"Au meilleur des "+P.format:"Un lancer décisif"}${P.spectateurs?` · ${P.spectateurs} en tribune`:""}</span></div>`:formatHTML(P.journal.length>0||P.anims.some(Boolean));
  if (!P.enLigne&&!P.trapinex) lierFormat(()=>{ if (!P.journal.length){ P.format=format; P.but=Math.ceil(format/2); majPartie(); } });
  [0,1].forEach(i=>{ const s=$("#siege-"+i); s.innerHTML=siegeHTML(i); s.classList.toggle("gagne",P.fini&&P.gagnant===i); const b=$("#lancer-"+i); if (b) b.onclick=e=>{ e.stopPropagation(); actionSiege(i); }; });
  $("#manche").textContent=P.trapinex?texteMancheX(P):texteManche(P); $("#aide").hidden=P.fini||P.spectateur;
  const an=$("#annonce"); an.textContent=String(P.annonce).replace(/ ([!?:;»])/g,"\u00a0$1"); an.classList.toggle("egalite",P.annonceEg); an.classList.toggle("cri",!!(P.trapinex&&P.trapinex.phase==="cri"));
  const items=P.chronique.slice().reverse().map(c=>c.de?`<li class="lancer-l"><span class="de">${c.de}</span><span>${esc(c.texte)}</span></li>`
    :`<li class="${c.mj?"mjl":""}">${avatar(c.joueur||c.qui,"s")}<span><b>${esc(c.qui)}</b>${c.mj&&c===P.chronique[0]&&!P.narre?`<span id="narr-partie"></span>`:esc(c.texte)}</span></li>`).join("");
  $("#chronique").innerHTML=`<h3>Chronique de la table</h3><ol>${items}</ol>`;
  if (!P.narre){ P.narre=true; narrer($("#narr-partie"),P.chronique[0].texte); }
  let act="<h3>"+(P.spectateur?"Dans la tribune":"À la table")+"</h3>";
  if (P.spectateur){
    if (P.fini&&P.trapinex) act+=`<button class="btn" data-aller="cave">Descendre à la cave</button>`;
    if (!P.fini&&moi&&moi.profilCree) act+=`<div class="emotes">${REACTIONS_T.map(([k,l])=>`<button class="btn petit" data-reaction="${k}">${l}</button>`).join("")}</div>`;
    else if (!P.fini) act+=`<p class="note" style="margin:0">Connecte-toi pour encourager les joueurs.</p>`;
    if (P.fini&&P.tournoiId) act+=`<button class="btn plein" id="voir-tableau">Voir le tableau du tournoi</button>`;
    act+=`<button class="btn" data-aller="ligue">${P.fini?"Retour à la salle":"Quitter la tribune"}</button>`;
  } else if (P.enLigne){
    if (!P.fini){ act+=`<div class="emotes">${EMOTES_J.map(([k,l])=>`<button class="btn petit" data-emote="${k}">${l}</button>`).join("")}</div>
      <button class="btn" id="abandon">${P.confirmeAbandon?"Confirmer l'abandon (défaite)":"Abandonner le duel"}</button>`; }
    else { if (P.resultat) act+=`<div class="bilan"><div class="k">${P.resultat.trapinex?"Registre clandestin":P.resultat.classe?"Cote de la Ligue":P.tournoi?"Tournoi":"Duel amical"}</div><div class="v">${P.resultat.texte}</div>${P.resultat.raison?`<p class="note" style="margin:4px 0 0">${esc(P.resultat.raison)}</p>`:""}</div>`;
      if (P.resultat&&P.resultat.prison) act+=`<div class="prison-x">${PRISON}<div><div class="k">En prison · sortie dans ${rebours(P.resultat.prison)}</div><p>Privé de Trapinex jusqu'à <b>${heureCourte(P.resultat.prison)}</b>.</p></div></div>`;
      if (P.tournoiId) act+=`<button class="btn plein" id="voir-tableau">Voir le tableau du tournoi</button>`;
      else act+=`<button class="btn plein" id="revanche">Proposer une revanche</button>`;
      act+=P.trapinex?`<button class="btn" data-aller="cave">Retour à la cave</button>`:`<button class="btn" data-aller="ligue">Retour à la salle</button>`; }
  } else {
    if (P.mode==="jarek"){ const b=P.trapinex?store.get("trapinette-jarek-x",{toi:0,jarek:0}):bilanJarek(); act+=`<div class="bilan"><div class="k">${P.trapinex?"Trapinex contre Jarek":"Bilan contre Jarek"}</div><div class="v">${esc(P.j[0].nom)} ${b.toi} – ${b.jarek} Jarek</div></div>`; }
    if (P.fini) act+=`<button class="btn plein" id="revanche">Revanche</button>`;
    act+=`<button class="btn" data-aller="${P.trapinex?"cave":"accueil"}">Quitter la table</button>`;
  }
  $("#actions").innerHTML=act;
  app.querySelectorAll("[data-emote]").forEach(b=>b.onclick=()=>envoyer({t:"emote",k:b.dataset.emote}));
  app.querySelectorAll("[data-reaction]").forEach(b=>b.onclick=()=>envoyer({t:"reaction",k:b.dataset.reaction}));
  const vt=$("#voir-tableau"); if (vt) vt.onclick=()=>ouvrirTournoi(P.tournoiId);
  const ab=$("#abandon"); if (ab) ab.onclick=()=>{ if (!P.confirmeAbandon){ P.confirmeAbandon=true; majPartie(); setTimeout(()=>{ P.confirmeAbandon=false; if (partie===P) majPartie(); },4000); } else envoyer({t:"abandon"}); };
  const rv=$("#revanche"); if (rv) rv.onclick=()=>{
    if (P.enLigne){ const adv=P.j[1].joueur; if (envoyer(P.trapinex?{t:"defier",cible:adv.id,de:P.trapinex.dx}:{t:"defier",cible:adv.id,format:P.format})) rv.disabled=true; return; }
    if (P.trapinex){ nouvellePartieX(P.mode,P.j.map(j=>j.nom),P.trapinex.dx); partie.narre=true; partie.chronique=[{qui:"Maître du Jeu",texte:"On balaie les éclats, on rallume les lanternes. Revanche !",mj:true}]; Monde.gloire(null); rendrePartie(); return; }
    const noms=P.j.map(j=>j.nom), last=P.j.map(j=>j.derniere); nouvellePartie(P.mode,noms); partie.narre=true; partie.j[0].derniere=last[0]; partie.j[1].derniere=last[1];
    partie.chronique=[{qui:"Maître du Jeu",texte:"Les dés sont ramassés, les chopes remplies. Revanche !",mj:true}]; if (P.mode==="jarek") dire(partie,"Jarek",hasard(JAREK.debut)); Monde.gloire(null); rendrePartie(); };
}
function critique(i,v){ const el=$("#crit-"+i); if (!el||(v!==6&&v!==1)) return; el.textContent=v===6?"Critique !":"Échec critique"; el.classList.toggle("rate",v===1); el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
function animerDe(P,i,v){
  if (!P.anims[0]&&!P.anims[1]) Monde.gloire(null);
  P.j[i].de=v; if (v===6) P.j[i].six++;
  P.anims[i]=Monde.lancer(i,v).then(()=>{ if (partie!==P) return; P.j[i].derniere=v; P.j[i].attente=false; critique(i,v);
    dire(P,"",`${P.j[i].nom} fait ${v}`); P.chronique[P.chronique.length-1].de=v;
    if (v===6){ if (P.mode==="jarek"&&i===1) dire(P,"Jarek",hasard(JAREK.six)); else if (Math.random()<.6) reaction(P,"six"); }
    if (v===1){ if (P.mode==="jarek"&&i===1) dire(P,"Jarek",hasard(JAREK.un)); else if (Math.random()<.6) reaction(P,"un"); }
    majPartie(); });
  majPartie();
}
function lancer(i){
  const P=partie; if (!P||P.fini||P.spectateur||P.j[i].de!==null) return;
  if (P.enLigne){ if (i!==0||P.j[0].attente) return; if (envoyer({t:"lancer"})){ P.j[0].attente=true; majPartie(); } return; }
  animerDe(P,i,d6());
  if (P.mode==="jarek"&&i===0) setTimeout(()=>{ if (partie===P&&vue==="partie") lancer(1); },420);
  if (P.j[0].de!==null&&P.j[1].de!==null) Promise.all(P.anims).then(()=>setTimeout(()=>(P.trapinex?resoudreApproche:resoudre)(P),300));
}
function resoudre(P){
  if (partie!==P||vue!=="partie") return;
  const [a,b]=P.j, jarek=P.mode==="jarek";
  if (a.de===b.de){
    P.relances++; P.annonce=`Égalité à ${a.de} ! On relance.`; P.annonceEg=true; Son.oh();
    if (jarek) dire(P,"Jarek",hasard(JAREK.egalite)); else reaction(P,"egalite");
    Monde.sauter(0); setTimeout(()=>Monde.sauter(1),90);
  } else {
    const g=a.de>b.de?0:1, gg=P.j[g]; gg.score++; P.journal.push(1);
    P.annonceEg=false; P.relances=0; Monde.gloire(g);
    if (gg.score>=P.but){
      P.fini=true; P.gagnant=g; P.annonce=`${gg.nom} remporte le duel !`;
      Son.acclamation(1); Son.pieces(); pluieOr();
      dire(P,"Maître du Jeu",`${gg.nom} rafle la mise. Les pièces tintent sur la table du Manoir.`,true);
      if (jarek){ const bj=bilanJarek(); if (g===0) bj.toi++; else bj.jarek++; store.set("trapinette-jarek",bj); dire(P,"Jarek",hasard(g===1?JAREK.gagneMatch:JAREK.perdMatch)); }
      else reaction(P,"victoire");
    } else {
      P.annonce=`${gg.nom} prend la manche · ${a.score} – ${b.score}`; P.manche++; Son.acclamation(.45);
      if (jarek) dire(P,"Jarek",hasard(g===1?JAREK.gagneManche:JAREK.perdManche));
      else if (Math.random()<.5) dire(P,spectateur(P),hasard([`« Bien joué, ${gg.nom} ! »`,`« ${gg.nom} a la main chaude ce soir. »`,`« Allez, ${P.j[1-g].nom}, reprends-toi ! »`]));
    }
  }
  a.de=null; b.de=null; P.anims=[null,null]; majPartie();
}

/* ---------- Duel en ligne : le serveur décide, le client raconte ---------- */
const siegeDe=(P,idx)=>idx===P.monIdx?0:1;
function demarrerEnLigne(m){
  const spect=!!m.spectateur, moiIdx=spect?0:m.moi, j=[m.joueurs[moiIdx],m.joueurs[1-moiIdx]];
  if (partie&&partie.spectateur&&!spect) envoyer({t:"quitter_tribune"});
  partie={mode:"ligue",enLigne:true,spectateur:spect,duelId:m.id,monIdx:moiIdx,format:m.format,but:m.but,tournoi:m.tournoi||null,tournoiId:m.tournoiId||null,spectateurs:m.spectateurs||0,
    j:j.map((x,k)=>({nom:x.nom,joueur:x,score:m.scores[k===0?moiIdx:1-moiIdx],de:null,derniere:null,six:0})),
    manche:m.manche,relances:0,fini:false,gagnant:null,anims:[null,null],journal:[],chronique:[],annonce:"Faites un jet de Trapinette",annonceEg:false,narre:false,chaine:Promise.resolve(),limite:m.limite};
  const intro=spect?`Tu prends place dans la tribune. ${j[0].nom} affronte ${j[1].nom}${m.tournoi?` pour le tournoi « ${m.tournoi} »`:""}. Le silence se fait dans la salle.`
    :m.reprise?"Tu reprends ta place à la table. Le duel continue."
    :m.tournoi?`Match du tournoi « ${m.tournoi} ». ${j[0].nom} affronte ${j[1].nom}. Les dés sont tirés par le Manoir lui-même. Faites un jet de Trapinette.`
    :`Le tavernier décroche le registre de la Ligue. ${j[0].nom} affronte ${j[1].nom}, venu d'un autre coin du monde. Les dés sont tirés par le Manoir lui-même. Faites un jet de Trapinette.`;
  if (m.mode==="trapinex"){ partie.trapinex=trapinexDepuis(partie,m); partie.annonce=m.phase==="cri"?"Criez « DUEL » !":"Lancez jusqu'à l'égalité !";
    partie.chronique.push({qui:"Maître du Jeu",texte:spect?`Tu te glisses dans l'ombre de la cave. ${j[0].nom} affronte ${j[1].nom} en ${nomDeX(m.dx)}. Le perdant finira en prison.`:m.reprise?"Tu redescends dans l'arène. La Trapinex continue.":`${MJ_X.intro} Ce soir : ${nomDeX(m.dx)}, au d${m.dx}. ${j[0].nom} contre ${j[1].nom}.`,mj:true}); }
  else partie.chronique.push({qui:"Maître du Jeu",texte:intro,mj:true});
  if (m.des) m.des.forEach((v,idx)=>{ if (v!==null){ const s=siegeDe(partie,idx); partie.j[s].de=v; partie.j[s].derniere=v; } });
  Son.porte();
  vue="partie"; allerA("partie");
  clearInterval(chronoTour); chronoTour=setInterval(()=>{ if (partie&&partie.enLigne&&!partie.fini&&vue==="partie"){ const el=$("#manche"); if (el) el.textContent=partie.trapinex?texteMancheX(partie):texteManche(partie); } },1000);
}
const pourCeDuel=m=>partie&&partie.enLigne&&partie.duelId===m.duel;
function surTour(m){ if (!pourCeDuel(m)) return; const P=partie; P.chaine=P.chaine.then(()=>{ P.limite=m.limite; P.manche=m.manche; P.relances=m.relances; P.j.forEach(x=>{x.de=null;x.attente=false;}); majPartie(); }); }
function surDe(m){ if (!pourCeDuel(m)) return; const P=partie; P.chaine=P.chaine.then(()=>{ const s=siegeDe(P,m.joueur); if (m.auto) dire(P,"Maître du Jeu",`Le temps presse : le Manoir lance pour ${P.j[s].nom}.`,true); animerDe(P,s,m.valeur); }); }
function surManche(m){
  if (!pourCeDuel(m)) return; const P=partie;
  P.chaine=P.chaine.then(()=>Promise.all(P.anims)).then(()=>new Promise(r=>setTimeout(r,250))).then(()=>{
    const v=[m.valeurs[P.monIdx],m.valeurs[1-P.monIdx]];
    P.j[0].score=m.scores[P.monIdx]; P.j[1].score=m.scores[1-P.monIdx];
    if (m.approche){ P.relances++; P.annonce=`${v[0]} contre ${v[1]} · pas d'égalité, on relance !`; P.annonceEg=false; }
    else if (m.egalite){ P.annonce=`Égalité à ${v[0]} ! On relance.`; P.annonceEg=true; Son.oh(); reaction(P,"egalite"); Monde.sauter(0); setTimeout(()=>Monde.sauter(1),90); }
    else { const g=siegeDe(P,m.gagnant); P.annonceEg=false; Monde.gloire(g); Son.acclamation(.45); P.annonce=`${P.j[g].nom} prend la manche · ${P.j[0].score} – ${P.j[1].score}`; }
    P.j.forEach(x=>x.de=null); P.anims=[null,null]; majPartie();
  });
}
function surFin(m){
  if (!pourCeDuel(m)) return; const P=partie;
  P.chaine=P.chaine.then(()=>Promise.all(P.anims)).then(()=>{
    clearInterval(chronoTour);
    const g=siegeDe(P,m.gagnant), gg=P.j[g];
    P.fini=true; P.gagnant=g; P.j[0].score=m.scores[P.monIdx]; P.j[1].score=m.scores[1-P.monIdx];
    P.j[0].joueur=m.joueurs[P.monIdx]; P.j[1].joueur=m.joueurs[1-P.monIdx];
    if (m.tournoi){ P.tournoi=m.tournoi; P.tournoiId=m.tournoiId; }
    const perdant=P.j[1-g].nom;
    const raisonFin=m.fin==="abandon"?`${perdant} abandonne.`:m.fin==="forfait"?`${perdant} a quitté la table : victoire par forfait.`:"";
    P.annonce=`${gg.nom} remporte le duel !`;
    if (!P.trapinex) Monde.gloire(g);
    if (P.spectateur||g===0){ Son.acclamation(1); Son.pieces(); pluieOr(); } else Son.oh();
    if (P.trapinex){ finEnLigneX(P,m,g); P.j[0].joueur=m.joueurs[P.monIdx]; P.j[1].joueur=m.joueurs[1-P.monIdx]; registreX=null; chargerMoi(); majPartie(); return; }
    dire(P,"Maître du Jeu",(raisonFin?raisonFin+" ":"")+`${gg.nom} rafle la mise.`+(m.classe?` Le tavernier inscrit ${m.delta} points au registre.`:""),true);
    reaction(P,"victoire");
    if (!P.spectateur){
      P.resultat={classe:m.classe,raison:m.raison,texte:m.classe?`${g===0?"+":"−"}${m.delta} · ${P.j[0].joueur.cote}`:(P.tournoi?(g===0?"Tu passes au tour suivant":"Éliminé"):"Pas de changement")};
      if (moi) Object.assign(moi,{cote:P.j[0].joueur.cote,v:P.j[0].joueur.v,d:P.j[0].joueur.d,titre:P.j[0].joueur.titre});
      majCompte(); chargerMoi();
    }
    classementCache=null; majPartie();
  });
}
document.addEventListener("keydown",e=>{
  if (e.key==="Escape"){ fermerFiche(); return; }
  if (vue!=="partie"||!partie||partie.spectateur||(e.target.closest&&e.target.closest("input,textarea,select"))||e.repeat) return;
  const k=e.key.toLowerCase();
  if (k==="a"||((partie.mode==="jarek"||partie.enLigne)&&k===" ")){ e.preventDefault(); actionSiege(0); }
  if (k==="l"&&partie.mode==="compagnon"){ e.preventDefault(); actionSiege(1); }
});

/* =========================================================
   TRAPINEX : LA RÈGLE ILLÉGALE DE LA TRAPINETTE
   ========================================================= */
let deXChoisi=store.get("trapinette-dex",6), maFileX=null, registreX=null, prepX={b:""};
if (!DES_X[deXChoisi]) deXChoisi=6;
const tirerX=n=>{ try { const b=new Uint32Array(1), lim=Math.floor(4294967296/n)*n; let v; do { crypto.getRandomValues(b); v=b[0]; } while (v>=lim); return (v%n)+1; } catch { return 1+Math.floor(Math.random()*n); } };
const heureCourte=iso=>{ try { const d=new Date(iso), h=d.toLocaleTimeString("fr-CH",{hour:"2-digit",minute:"2-digit"}); return d.toDateString()===new Date().toDateString()?h:d.toLocaleDateString("fr-CH",{weekday:"long"})+", "+h; } catch { return ""; } };
const enPrisonX=j=>j&&j.prison&&Date.parse(j.prison)>Date.now();
// Temps restant avant la sortie de prison, mis à jour toutes les 20 secondes
function restePrison(iso){ const ms=Date.parse(iso)-Date.now(); if (!(ms>0)) return "libre !"; const m=Math.ceil(ms/60000), h=Math.floor(m/60);
  return h?`${h} h ${String(m%60).padStart(2,"0")}`:m>1?`${m} min`:"moins d'une minute"; }
const rebours=iso=>`<span class="rebours" data-rebours="${esc(iso)}">${restePrison(iso)}</span>`;
setInterval(()=>{ let libere=false;
  document.querySelectorAll("[data-rebours]").forEach(el=>{ el.textContent=restePrison(el.dataset.rebours); if (Date.parse(el.dataset.rebours)<=Date.now()) libere=true; });
  if (libere&&moi&&moi.prison&&!enPrisonX(moi)){ moi.prison=null; toast("Tu es sorti de prison ! La Trapinex t'attend."); if (vue==="cave") rendreCave(); }
  else if (libere&&vue==="cave") chargerRegistreX(); },20000);
const JAREK_X={
  debut:["Tu veux jouer à ÇA ? Ici, en bas ? D'accord. Mais si tu perds, c'est le cachot.","La Trapinex… Le tavernier ne doit pas savoir. Assieds-toi.","J'ai déjà fait sauter trois tables avec cette règle. Une de plus ou de moins…"],
  cri:["DUEL !","DUUUEL !!","DUEL, par toutes les barbes d'Eauprofonde !"],
  gagne:["Au trou ! Et pense à moi pendant vingt-quatre heures.","Les gardes ! On a un client pour la cellule du fond.","Explosif. Comme ma réputation."],
  perd:["…Bon. Je vais en prison. Mais je m'évaderai avant le dîner.","Tu m'envoies au cachot ? Personne n'envoie Jarek au cachot. Sauf toi, visiblement.","Garde la clé de ma cellule au chaud. J'en ai pour une journée."],
};
const MJ_X={
  intro:"Une trappe grince sous le comptoir. En bas, des lanternes vertes, une arène gravée dans la table, et une odeur de poudre. Ici, on joue à la Trapinex : lancez chacun un dé jusqu'à l'égalité. Quand elle tombe, criez « DUEL » et les dés exploseront.",
  jarek:"Jarek descend l'escalier de la cave en sifflotant, une poignée de dés étranges dans la main. « La Trapinex, gamin. Le perdant dort en prison. »",
  explosion:"BOUM ! Les dés éclatent en mille morceaux. Le vrai combat commence : chacun son tour, quatre dés chacun. Le plus gros total gagne. L'autre file en prison.",
};
// Icônes des dés
const ICONE_DE={4:'<path d="M12 3 22 20H2Z"/>',6:'<rect x="4" y="4" width="16" height="16" rx="3"/>',8:'<path d="M12 2 21 12 12 22 3 12Z"/><path d="M3 12h18"/>',10:'<path d="M12 2 21 10 12 22 3 10Z"/><path d="M3 10l9 4 9-4"/>',
  12:'<path d="M12 2 21.5 9 18 21H6L2.5 9Z"/>',20:'<path d="M12 2 21 7v10l-9 5-9-5V7Z"/><path d="M12 8 7 16h10Z"/>',100:'<circle cx="12" cy="12" r="9.5"/><path d="M5 9h14M5 15h14"/>'};
const iconeDe=v=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${ICONE_DE[v]}</svg>`;
const libelleDe=v=>`${esc(nomDeX(v))} <small>d${v}</small>`;

/* ---------- La Cave (salle Trapinex) ---------- */
function rendreCave(){
  app.innerHTML=`<section class="vue cave">
    <div class="barre"><div><h2>La Cave clandestine</h2><div class="sous">Sous le plancher du Manoir · règle illégale de la Trapinette</div></div><button class="lien-tuto" id="x-tuto">Comment jouer à la Trapinex ?</button></div>
    <div class="cave-grille">
      <div class="cave-gauche">
        <div class="panneau regle-x"><div class="tampon">Interdit</div><h3>La Trapinex <span>(explosive)</span></h3>
          <p>Deux joueurs s'affrontent en lançant chacun un dé jusqu'à obtenir une <b>égalité</b>. Dès que l'égalité survient, les participants doivent crier <b>« DUEL »</b> dans l'arène : c'est là que les dés explosent et que le vrai combat commence !</p>
          <p>Pour le duel, chaque joueur s'alterne pour lancer <b>quatre dés</b>. Celui qui a le plus gros score final gagne. L'autre subit les conséquences et finit <b>en prison</b>, privé de Trapinex pendant <b>24 heures</b>.</p>
          <p class="note-x">Le premier qui crie « DUEL » lance en premier. En cas d'égalité parfaite des totaux, on recharge et le combat recommence.</p></div>
        <div class="panneau choix-de"><h3>Type de duel</h3><div class="des-x" role="radiogroup" aria-label="Type de dé">${LISTE_DES_X.map(v=>`<button type="button" role="radio" data-dex="${v}" aria-checked="${v===deXChoisi}">${iconeDe(v)}<span>${libelleDe(v)}</span></button>`).join("")}</div></div>
        <div class="panneau jouer-x"><h3>Descendre dans l'arène · ${libelleDe(deXChoisi)}</h3>
          <div class="local-x">
            <button class="btn plein" id="x-jarek">${avatar("Jarek","s")}Contre Jarek</button>
            <button class="btn" id="x-comp">${avatar("Pok","s")}Contre un compagnon <small>(même écran)</small></button>
          </div>
          <div id="cave-en-ligne"></div>
        </div>
      </div>
      <div class="cave-droite" id="registre-x"><div class="registre"><h3>Registre clandestin</h3><p class="vide" style="color:#6b5236">Le tavernier ne doit pas voir ce carnet…</p></div></div>
    </div></section>`;
  app.querySelectorAll("[data-dex]").forEach(b=>b.onclick=()=>{ deXChoisi=+b.dataset.dex; store.set("trapinette-dex",deXChoisi); if (maFileX&&maFileX!==deXChoisi) envoyer({t:"quitter_file"}); rendreCave(); });
  $("#x-jarek").onclick=()=>{ nouvellePartieX("jarek",[monNom(),"Jarek"],deXChoisi); allerA("partie"); };
  $("#x-comp").onclick=()=>{ prep.x=deXChoisi; allerA("prep"); };
  $("#x-tuto").onclick=()=>ouvrirTuto(TUTO_X,"trapinette-tuto-x");
  const tutoCave=()=>{ if (store.get("trapinette-tuto-x",0)||vue!=="cave") return; if (document.getElementById("porte")||$("#modal").innerHTML||!$("#tuto").hidden) return setTimeout(tutoCave,1000); ouvrirTuto(TUTO_X,"trapinette-tuto-x"); };
  setTimeout(tutoCave,700);
  majCave(); chargerRegistreX();
}
function majCave(){
  const el=document.getElementById("cave-en-ligne"); if (!el||vue!=="cave") return;
  if (document.activeElement&&el.contains(document.activeElement)&&document.activeElement.tagName==="INPUT") return;
  if (!moi){ el.innerHTML=`<div class="k">En ligne</div><p class="s">Connecte-toi pour provoquer des joueurs du monde entier. Les dés sont tirés par le Manoir : impossible de tricher.</p><button class="btn plein" id="x-connexion">Se connecter</button>`; $("#x-connexion").onclick=()=>seConnecter(); return; }
  if (!moi.profilCree){ el.innerHTML=`<div class="k">En ligne</div><p class="s">Crée d'abord ton profil de taverne.</p><button class="btn plein" data-aller="profil">Créer mon profil</button>`; return; }
  if (enPrisonX(moi)){ el.innerHTML=`<div class="prison-x">${PRISON}<div><div class="k">Tu es en prison · sortie dans ${rebours(moi.prison)}</div><p>Privé de Trapinex jusqu'à <b>${heureCourte(moi.prison)}</b>. Tu peux toujours jouer à la Trapinette normale ou t'entraîner ici contre Jarek et tes compagnons.</p></div></div>`; return; }
  const autres=(salle.joueurs||[]).filter(j=>j.id!==moi.id&&(j.statut==="libre"||j.statut==="cherche un duel")&&!enPrisonX(j));
  const enFile=(salle.enFile||{})["x"+deXChoisi]||0, jeCherche=maFileX===deXChoisi;
  const lien=monLien&&monLien.de?monLien:null;
  el.innerHTML=`<div class="k">En ligne · dés tirés par le Manoir</div>
    <div class="boutons-x"><button class="btn ${jeCherche?"":"plein"}" id="x-file">${jeCherche?"Annuler la recherche":"Chercher un adversaire"}${enFile&&!jeCherche?` · ${enFile} en attente`:""}</button>
      ${lien?"":`<button class="btn" id="x-lien">Créer un lien de provocation</button>`}</div>
    ${jeCherche?`<p class="attente"><span class="point"></span>Tu attends un adversaire en ${esc(nomDeX(deXChoisi))}…</p>`:""}
    ${lien?`<p class="s">Partage ce lien : le premier qui clique descend t'affronter en ${esc(nomDeX(lien.de))}.</p><div class="copie"><input id="mon-lien-x" readonly value="${esc(lien.url)}" aria-label="Ton lien de provocation"><button class="btn plein petit" id="x-copier">Copier</button><button class="btn petit" id="x-annuler-lien">Annuler</button></div>`:""}
    ${defiEnvoye?`<p class="attente"><span class="point"></span>Provocation envoyée à ${esc(defiEnvoye.a.nom)}…</p>`:""}
    <div class="k" style="margin-top:12px">Dans la taverne (${autres.length})</div>
    <ul class="presents">${autres.length?autres.slice(0,30).map(j=>`<li>${avatar(j,"s")}<button class="lien" data-fiche="${esc(j.id)}">${esc(j.nom)}</button>${badge(j)}<span class="defier"><button class="btn petit plein" data-provoquer="${esc(j.id)}">Provoquer</button></span></li>`).join("")
      :`<li class="vide">Personne de libre pour l'instant. Crée un lien et partage-le sur Discord !</li>`}</ul>`;
  $("#x-file").onclick=()=>{ if (jeCherche) envoyer({t:"quitter_file"}); else envoyer({t:"file",de:deXChoisi}); };
  const xl=$("#x-lien"); if (xl) xl.onclick=async()=>{ try { const r=await api("/api/invitation",{method:"POST",body:{de:deXChoisi}}); monLien={code:r.code,format:1,de:r.de,url:location.origin+"/d/"+r.code,expire:r.expire}; majCave(); copier(monLien.url); } catch(e){ toast(e.message); } };
  const xc=$("#x-copier"); if (xc) xc.onclick=()=>copier(lien.url);
  const xa=$("#x-annuler-lien"); if (xa) xa.onclick=async()=>{ try { await api("/api/invitation",{method:"DELETE"}); monLien=null; majCave(); } catch(e){ toast(e.message); } };
  el.querySelectorAll("[data-provoquer]").forEach(b=>b.onclick=()=>envoyer({t:"defier",cible:b.dataset.provoquer,de:deXChoisi}));
}
const PRISON=`<svg class="barreaux" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="5" width="38" height="38" rx="4" fill="#1a1412" stroke="#7a6a5a" stroke-width="2"/><path d="M13 5v38M21 5v38M29 5v38M37 5v38" stroke="#a89a8a" stroke-width="3"/><path d="M5 18h38" stroke="#7a6a5a" stroke-width="2.5"/></svg>`;
async function chargerRegistreX(){
  try { registreX=await api("/api/trapinex"); } catch { registreX=registreX||{joueurs:[],recents:[],prisonniers:[]}; }
  const el=document.getElementById("registre-x"); if (!el||vue!=="cave") return;
  const R=registreX;
  el.innerHTML=`<div class="registre"><h3>Registre clandestin</h3><p class="titre-j" style="margin:0 0 10px;font-size:13px">Cote secrète de la Trapinex · séparée de la Ligue</p>
    ${R.joueurs.length?`<table class="classement"><thead><tr><th>#</th><th>Joueur</th><th>V – D</th><th title="Séjours en prison">Prison</th><th>Cote</th></tr></thead><tbody>${R.joueurs.slice(0,15).map((j,i)=>`<tr data-fiche="${esc(j.id)}" tabindex="0"><td class="rang">${i+1}</td><td><span class="qui">${avatar(j,"s")}<span><b>${esc(j.nom)}</b>${badge(j)}</span></span></td><td>${j.xv} – ${j.xd}</td><td>${j.prisons}</td><td class="cote">${j.xcote}</td></tr>`).join("")}</tbody></table>`
      :`<p class="vide" style="color:#6b5236">Personne n'a encore osé. Le premier nom inscrit ici sera légendaire… ou en prison.</p>`}</div>
    <div class="panneau salle"><h3>${PRISON}La prison (${R.prisonniers.length})</h3>
      ${R.prisonniers.length?`<ul class="presents">${R.prisonniers.map(p=>`<li>${avatar(p,"s")}<button class="lien" data-fiche="${esc(p.id)}">${esc(p.nom)}</button><span class="s">sort dans ${rebours(p.prison)}</span>${niveau()>=2?`<span class="defier"><button class="btn petit" data-liberer="${esc(p.id)}">Libérer</button></span>`:""}</li>`).join("")}</ul>`:`<p class="vide">Les cellules sont vides. Pour l'instant.</p>`}</div>
    <div class="panneau salle"><h3>Dernières explosions</h3>
      ${R.recents.length?R.recents.map(d=>`<div class="affiche affiche-x">${avatar(d.gagnant,"s")}<div><div class="qui"><em>${esc(d.gagnant.nom)}</em> envoie ${esc(d.perdant.nom)} en prison</div><div class="meta">${esc(d.nomDe||"")} · d${d.de}${d.classe?` · ±${d.delta}`:""}${d.fin!=="normal"?" · "+(d.fin==="abandon"?"fuite":"forfait"):""} · ${dateCourte(d.date)}</div></div></div>`).join(""):`<p class="vide">Aucune explosion récente.</p>`}</div>`;
  el.querySelectorAll("[data-liberer]").forEach(b=>b.onclick=async()=>{ try { await api("/api/admin/liberer/"+encodeURIComponent(b.dataset.liberer),{method:"POST"}); toast("Prisonnier libéré."); chargerRegistreX(); } catch(e){ toast(e.message); } });
}

/* ---------- Partie de Trapinex (locale) ---------- */
function nouvellePartieX(mode,noms,dx){
  nouvellePartie(mode,noms);
  Object.assign(partie,{format:1,but:1,annonce:"Lancez jusqu'à l'égalité !",trapinex:{dx,phase:"approche",cris:[null,null],combat:null,combats:0}});
  partie.chronique=[{qui:"Maître du Jeu",texte:mode==="jarek"?MJ_X.jarek:MJ_X.intro,mj:true}];
  if (mode==="jarek") partie.chronique.push({qui:"Jarek",texte:hasard(JAREK_X.debut)});
}
function actionSiege(i){ const P=partie; if (!P) return; if (!P.trapinex) return lancer(i); actionX(i); }
function actionX(i){
  const P=partie, X=P.trapinex; if (P.fini||P.spectateur) return;
  if (X.phase==="approche") return lancer(i);
  if (X.phase==="cri"){ if (P.enLigne){ if (i===0&&!X.cris[0]){ X.cris[0]=true; envoyer({t:"cri"}); majPartie(); } return; } return crierLocal(i); }
  if (X.phase==="combat"){ const c=X.combat; if (!c||c.tour!==i||c.tirs[i].length>=4||X.anim||X.attente) return;
    if (P.enLigne){ if (i!==0) return; if (envoyer({t:"lancer"})){ X.attente=true; majPartie(); } return; }
    if (P.mode==="jarek"&&i===1) return; lancerCombatLocal(i); }
}
function resoudreApproche(P){
  if (partie!==P||vue!=="partie") return;
  const [a,b]=P.j;
  if (a.de!==b.de){ P.relances++; P.annonce=`${a.de} contre ${b.de} · pas d'égalité, on relance !`; P.annonceEg=false; a.de=null; b.de=null; P.anims=[null,null]; majPartie(); return; }
  const v=a.de; a.de=null; b.de=null; P.anims=[null,null];
  debutCri(P,v);
  if (P.mode==="jarek") setTimeout(()=>{ if (partie===P) crierLocal(1); },rnd(900,2600));
}
function debutCri(P,v){
  const X=P.trapinex; X.phase="cri"; X.cris=[null,null]; X.criDebut=Date.now();
  P.annonce=`Égalité à ${v} ! Criez « DUEL » !`; P.annonceEg=true; Son.cor(); Monde.sauter(0); setTimeout(()=>Monde.sauter(1),90);
  dire(P,"Maître du Jeu",`Égalité à ${v}. Le silence tombe sur l'arène… Qui criera « DUEL » le premier ?`,true);
  majPartie();
}
function crierLocal(i){
  const P=partie, X=P.trapinex; if (X.phase!=="cri"||X.cris[i]) return;
  X.cris[i]=Date.now(); Son.cri();
  dire(P,P.j[i].nom,P.mode==="jarek"&&i===1?hasard(JAREK_X.cri):"« DUEL ! »");
  majPartie();
  if (X.cris[0]&&X.cris[1]) explosionX(P,X.cris[0]<=X.cris[1]?0:1);
}
function explosionX(P,premier){
  const X=P.trapinex; X.phase="explosion"; P.annonce="BOUM !"; P.annonceEg=true;
  Monde.exploser(); Son.boum(); dire(P,"Maître du Jeu",MJ_X.explosion,true);
  dire(P,"Maître du Jeu",`${P.j[premier].nom} a crié le premier : à lui l'honneur du premier dé.`,true);
  majPartie();
  setTimeout(()=>{ if (partie!==P) return; if (P.enLigne) return; X.phase="combat"; X.combats=1; X.combat={tirs:[[],[]],tour:premier,premier};
    P.annonce=`Combat au ${nomDeX(X.dx)} · à ${P.j[premier].nom} !`; P.annonceEg=false; majPartie(); suiteJarek(P); },2600);
}
function suiteJarek(P){ const X=P.trapinex; if (P.mode==="jarek"&&X.phase==="combat"&&X.combat.tour===1&&!P.fini) setTimeout(()=>{ if (partie===P&&!X.anim) lancerCombatLocal(1); },750); }
const totaux=c=>c.tirs.map(t=>t.reduce((a,b)=>a+b,0));
function lancerCombatLocal(i){
  const P=partie, X=P.trapinex, c=X.combat; if (!c||c.tour!==i||c.tirs[i].length>=4||X.anim||P.fini) return;
  const v=tirerX(X.dx), k=c.tirs[i].length; X.anim=true; majPartie();
  Monde.lancerX(i,k,v).then(()=>{ if (partie!==P) return;
    c.tirs[i].push(v); X.anim=false;
    dire(P,"",`${P.j[i].nom} fait ${v} au d${X.dx}`); P.chronique[P.chronique.length-1].de=v;
    if (v===X.dx) critiqueX(i,"Maximum !"); else if (v===1) critiqueX(i,"Aïe !",true);
    const fini=c.tirs[0].length>=4&&c.tirs[1].length>=4;
    if (!fini){ const o=1-i; c.tour=c.tirs[o].length<4?o:i; const t=totaux(c); P.annonce=`${t[0]} – ${t[1]} · à ${P.j[c.tour].nom}`; majPartie(); suiteJarek(P); return; }
    finCombatLocal(P);
  });
}
function critiqueX(i,texte,rate){ const el=$("#crit-"+i); if (!el) return; el.textContent=texte; el.classList.toggle("rate",!!rate); el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
function finCombatLocal(P){
  const X=P.trapinex, c=X.combat, [t0,t1]=totaux(c);
  if (t0===t1){ P.annonce=`Égalité parfaite, ${t0} partout ! On recharge…`; P.annonceEg=true; Son.oh(); dire(P,"Maître du Jeu","Égalité parfaite des totaux. Les dés se reforment dans un nuage de fumée : le combat recommence.",true); majPartie();
    setTimeout(()=>{ if (partie!==P) return; Monde.cacherX(); X.combats++; X.combat={tirs:[[],[]],tour:c.premier,premier:c.premier}; P.annonce=`Nouveau combat · à ${P.j[c.premier].nom} !`; P.annonceEg=false; majPartie(); suiteJarek(P); },2200); return; }
  const g=t0>t1?0:1, gg=P.j[g], pp=P.j[1-g];
  P.fini=true; P.gagnant=g; X.phase="fin"; Monde.gloireX(g);
  P.annonce=`${gg.nom} gagne ${Math.max(t0,t1)} à ${Math.min(t0,t1)} ! ${pp.nom} file en prison.`;
  Son.acclamation(1); Son.pieces(); pluieOr();
  dire(P,"Maître du Jeu",`${gg.nom} l'emporte. Deux gardes descendent l'escalier et emmènent ${pp.nom} au cachot pour vingt-quatre heures.`,true);
  if (P.mode==="jarek"){ const bj=store.get("trapinette-jarek-x",{toi:0,jarek:0}); if (g===0) bj.toi++; else bj.jarek++; store.set("trapinette-jarek-x",bj); dire(P,"Jarek",hasard(g===1?JAREK_X.gagne:JAREK_X.perd)); }
  else reaction(P,"victoire");
  majPartie();
}

/* ---------- Affichage d'une partie de Trapinex ---------- */
function siegeHTMLX(i){
  const P=partie, X=P.trapinex, p=P.j[i], bot=P.mode==="jarek"&&i===1, adv=P.enLigne&&(i===1||P.spectateur), controle=!bot&&!adv&&!P.fini;
  const touche=P.spectateur?"":P.enLigne||P.mode==="jarek"?(i===0?"Espace ou A":""):(i===0?"Touche A":"Touche L");
  let corps="", bouton="";
  if (X.phase==="approche"){
    const peut=controle&&p.de===null&&!p.attente;
    corps=`<div class="dernier">${p.derniere??""}<small>${p.derniere?"dernier d6":"&nbsp;"}</small></div>`;
    bouton=`<button class="lancer" ${controle?`id="lancer-${i}"`:""} ${peut?"":"disabled"}>${bot?(P.anims[1]?"Jarek lance…":"Jarek attend"):adv?(p.de!==null?"A lancé":"À son tour…"):p.de!==null||p.attente?"Le dé roule…":"Lancer le d6"}</button>`;
  } else if (X.phase==="cri"){
    corps=`<div class="cri-etat ${X.cris[i]?"crie":""}">${X.cris[i]?"« DUEL ! »":"…"}</div>`;
    bouton=X.cris[i]?`<button class="lancer cri-btn" disabled>A crié !</button>`:controle?`<button class="lancer cri-btn" id="lancer-${i}">DUEL !</button>`:`<button class="lancer cri-btn" disabled>${bot?"Jarek inspire…":"Il hésite…"}</button>`;
  } else {
    const c=X.combat||{tirs:[[],[]],tour:-1}, t=c.tirs[i]||[], tot=t.reduce((a,b)=>a+b,0), monTour=X.phase==="combat"&&c.tour===i&&t.length<4;
    corps=`<div class="tirs-x">${[0,1,2,3].map(k=>`<span class="${t[k]!==undefined?"plein":""}${t[k]===X.dx?" max":""}">${t[k]??""}</span>`).join("")}</div><div class="dernier total-x">${tot}<small>total sur ${t.length}/4</small></div>`;
    const peut=controle&&monTour&&!X.anim&&!X.attente;
    bouton=`<button class="lancer" ${controle?`id="lancer-${i}"`:""} ${peut?"":"disabled"}>${X.phase!=="combat"?(P.fini?(P.gagnant===i?"Vainqueur":"En prison"):"Boum…"):monTour?(bot?"Jarek lance…":adv?"Il lance…":X.anim||X.attente?"Le dé roule…":`Lancer un d${X.dx} (${t.length+1}/4)`):t.length>=4?"Quatre dés lancés":"Attend son tour"}</button>`;
  }
  return `${avatar(p.joueur||p.nom,"l")}<div class="nom">${p.joueur&&p.joueur.id?`<button class="lien" data-fiche="${esc(p.joueur.id)}">${esc(p.nom)}</button>${badge(p.joueur)}`:esc(p.nom)}</div><div class="qualite">${esc(qualiteDe(i))}</div>${corps}${bouton}<div class="touche">${touche}</div>`;
}
function texteMancheX(P){
  const X=P.trapinex; if (P.fini) return "Duel terminé";
  const s=P.enLigne&&P.limite?Math.max(0,Math.ceil((P.limite-Date.now())/1000)):null, sec=s!==null&&s<=30?` · ${s} s`:"";
  if (X.phase==="approche") return `${nomDeX(X.dx)} · approche${P.relances?` · lancer n°${P.relances+1}`:""}${sec}`;
  if (X.phase==="cri") return `Criez « DUEL » !${sec}`;
  if (X.phase==="explosion") return "Explosion !";
  return `Combat au d${X.dx}${X.combats>1?` · reprise n°${X.combats-1}`:""}${sec}`;
}

/* ---------- Trapinex en ligne : le serveur décide, le client raconte ---------- */
const combatSiege=(P,c)=>c?{tirs:[c.tirs[P.monIdx],c.tirs[1-P.monIdx]],tour:siegeDe(P,c.tour),premier:siegeDe(P,c.premier)}:null;
function trapinexDepuis(P,m){ return {dx:m.dx,phase:m.phase,cris:[m.cris[P.monIdx],m.cris[1-P.monIdx]],combat:combatSiege(P,m.combat),combats:m.combat?m.combat.manche:0}; }
function surXCri(m){ if (!pourCeDuel(m)) return; const P=partie;
  P.chaine=P.chaine.then(()=>Promise.all(P.anims)).then(()=>{ P.j.forEach(x=>{x.de=null;x.attente=false;}); P.anims=[null,null]; P.limite=m.limite; debutCri(P,m.valeurs[0]); }); }
function surXCrie(m){ if (!pourCeDuel(m)) return; const P=partie;
  P.chaine=P.chaine.then(()=>{ const s=siegeDe(P,m.joueur); P.trapinex.cris[s]=true; if (!m.auto) Son.cri(); dire(P,P.j[s].nom,m.auto?"(reste muet… le Manoir crie à sa place)":`« DUEL ! »${m.ms<1500?" (en "+(m.ms/1000).toFixed(1).replace(".",",")+" s)":""}`); majPartie(); }); }
function surXExplosion(m){ if (!pourCeDuel(m)) return; const P=partie; P.chaine=P.chaine.then(()=>explosionX(P,siegeDe(P,m.premier))); }
function surXTour(m){ if (!pourCeDuel(m)) return; const P=partie;
  P.chaine=P.chaine.then(()=>{ const X=P.trapinex; if (X.phase!=="combat"){ X.phase="combat"; } if (m.manche!==X.combats){ if (X.combats) Monde.cacherX(); X.combats=m.manche; }
    X.combat=combatSiege(P,m); X.attente=false; P.limite=m.limite; const t=totaux(X.combat);
    P.annonce=X.combat.tirs[0].length+X.combat.tirs[1].length===0?`Combat au ${nomDeX(X.dx)} · à ${P.j[X.combat.tour].nom} !`:`${t[0]} – ${t[1]} · à ${P.j[X.combat.tour].nom}`; P.annonceEg=false; majPartie(); }); }
function surXDe(m){ if (!pourCeDuel(m)) return; const P=partie;
  P.chaine=P.chaine.then(()=>{ const X=P.trapinex, s=siegeDe(P,m.joueur), k=m.tirs[m.joueur].length-1; X.anim=true; majPartie();
    if (m.auto) dire(P,"Maître du Jeu",`Le temps presse : le Manoir lance pour ${P.j[s].nom}.`,true);
    return Monde.lancerX(s,k,m.valeur).then(()=>{ X.anim=false; X.attente=false; X.combat=combatSiege(P,m); dire(P,"",`${P.j[s].nom} fait ${m.valeur} au d${X.dx}`); P.chronique[P.chronique.length-1].de=m.valeur;
      if (m.valeur===X.dx) critiqueX(s,"Maximum !"); else if (m.valeur===1) critiqueX(s,"Aïe !",true); majPartie(); }); }); }
function surXEgalite(m){ if (!pourCeDuel(m)) return; const P=partie;
  P.chaine=P.chaine.then(()=>{ P.annonce=`Égalité parfaite, ${m.totaux[0]} partout ! On recharge…`; P.annonceEg=true; Son.oh(); dire(P,"Maître du Jeu","Égalité parfaite des totaux. Les dés se reforment : le combat recommence.",true); majPartie(); }); }
function finEnLigneX(P,m,g){
  const X=P.trapinex, gg=P.j[g], pp=P.j[1-g]; X.phase="fin"; Monde.gloireX(g);
  const t=m.totaux?[m.totaux[P.monIdx],m.totaux[1-P.monIdx]]:null;
  const raisonFin=m.fin==="abandon"?`${pp.nom} s'enfuit de l'arène.`:m.fin==="forfait"?`${pp.nom} a quitté la cave : victoire par forfait.`:"";
  P.annonce=t&&m.fin==="normal"?`${gg.nom} gagne ${t[g]} à ${t[1-g]} !`:`${gg.nom} remporte la Trapinex !`;
  dire(P,"Maître du Jeu",(raisonFin?raisonFin+" ":"")+(m.prison?`Les gardes emmènent ${pp.nom} au cachot jusqu'à ${heureCourte(m.prison)}.`:`${gg.nom} l'emporte.`)+(m.classe?` Le registre clandestin inscrit ${m.delta} points.`:""),true);
  if (!P.spectateur){
    P.resultat={classe:m.classe,raison:m.raison,trapinex:true,prison:g!==0?m.prison:null,
      texte:m.classe?`${g===0?"+":"−"}${m.delta} · cote clandestine`:"Cote clandestine inchangée"};
    if (moi&&g!==0&&m.prison) moi.prison=m.prison;
  }
}

/* =========================================================
   LIGUE MONDIALE : onglets
   ========================================================= */
const SCEAU=`<svg class="sceau" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="cire" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#d9544a"/><stop offset=".6" stop-color="#9b2f2a"/><stop offset="1" stop-color="#5a1511"/></radialGradient></defs><path d="M50 6 C62 8 70 4 78 14 C90 20 94 32 92 46 C98 58 92 70 84 78 C78 92 64 94 52 94 C40 98 28 92 20 84 C8 78 6 64 8 52 C2 40 8 26 18 20 C26 8 38 4 50 6Z" fill="url(#cire)"/><circle cx="50" cy="50" r="30" fill="none" stroke="#5a1511" stroke-width="3"/><text x="50" y="62" text-anchor="middle" font-family="Pirata One, Georgia, serif" font-size="34" fill="#f5c3a8" opacity=".85">T</text></svg>`;
const joursRestants=iso=>iso?Math.max(0,Math.ceil((Date.parse(iso)-Date.now())/86400000)):null;
function rendreLigue(){
  const onglets=[["classement","Classement"],["saisons","Saisons"],["tournois","Tournois"]];
  if (niveau()>=1) onglets.push(["moderation","Modération"],["equipe","Équipe"]);
  const S=config.saison, jr=S&&joursRestants(S.finPrevue);
  app.innerHTML=`<section class="vue">
    <div class="barre"><div><h2>Ligue internationale de Trapinette</h2><div class="sous">${S?esc(S.nom)+(jr!==null?` · fin dans ${jr} jour${jr>1?"s":""}`:"")+" · ":""}comptes vérifiés · dés tirés par le Manoir</div></div></div>
    <div class="onglets" role="tablist">${onglets.map(([k,l])=>`<button role="tab" aria-selected="${ongletLigue===k}" data-onglet="${k}">${l}</button>`).join("")}</div>
    <div class="tableau"><div class="ligue-grille"><div id="colonne-principale"></div><div class="affiches"><div class="panneau salle" id="salle"></div><div id="colonne-droite"></div></div></div></div>
  </section>`;
  app.querySelectorAll("[data-onglet]").forEach(b=>b.onclick=()=>{ ongletLigue=b.dataset.onglet; allerA("ligue",{garderScroll:true}); });
  majSalle();
  if (ongletLigue==="equipe"&&niveau()<1) ongletLigue="classement";
  ({classement:ongletClassement,saisons:ongletSaisons,tournois:ongletTournois,moderation:ongletModeration,equipe:ongletEquipe})[ongletLigue]();
}
function ongletClassement(){
  const C=classementCache||{joueurs:[],recents:[],total:0,duels:0}, cl=C.joueurs;
  $("#colonne-principale").innerHTML=`
    <div class="chiffres">
      <div class="chiffre"><div class="k">Duels cette saison</div><div class="v">${C.duels}</div></div>
      <div class="chiffre"><div class="k">Joueurs classés</div><div class="v">${C.total}</div></div>
      <div class="chiffre"><div class="k">Ton rang</div><div class="v">${moi&&moi.rang?"#"+moi.rang:"—"}</div></div>
    </div>
    <div class="registre"><span class="clou" style="top:8px;left:8px"></span><span class="clou" style="top:8px;right:90px"></span>${SCEAU}
      <h3>Registre de la Ligue</h3><p class="titre-j" style="margin:0 0 12px;font-size:13px">${esc(config.saison?config.saison.nom:"")} · tenu à la plume par le tavernier</p>
      ${cl.length?`<div class="rouleau"><table class="classement"><thead><tr><th>Rang</th><th>Joueur</th><th>V</th><th>D</th><th>% vic.</th><th>Série</th><th>Six</th><th>Cote</th></tr></thead><tbody>
        ${cl.map((j,i)=>`<tr data-fiche="${esc(j.id)}" tabindex="0" class="${moi&&moi.id===j.id?"moi":""}"><td class="rang">${i<3?`<span class="medaille m${i+1}">${i+1}</span>`:`<span class="rang-n">${i+1}</span>`}</td>
        <td><span class="qui-cell">${avatar(j,"m")}<span><span class="joueur-nom">${esc(j.nom)}${badge(j)}</span><span class="titre-j">${esc(j.titre)}</span></span></span></td>
        <td>${j.v}</td><td>${j.d}</td><td>${Math.round(100*j.v/Math.max(1,j.v+j.d))}</td><td class="serie${j.serie>=3?" chaud":""}">${j.serie>0?j.serie+" V":j.serie<0?(-j.serie)+" D":"—"}</td><td>${j.six}</td><td class="cote-f">${j.cote}</td></tr>`).join("")}</tbody></table></div>`
      :`<p class="vide" style="color:#6b5236">${C.horsLigne?"Le registre mondial est injoignable pour l'instant.":"Aucun duel classé cette saison. Sois le premier à entrer dans l'histoire du Manoir."}</p>`}
      <p style="font-size:14px;color:#6b5236;margin:12px 0 0">La cote suit le principe Elo : battre un joueur mieux classé rapporte plus. Pour éviter les arrangements entre amis, seuls ${config.duelsClassesParJour||3} duels par jour contre le même adversaire comptent pour la cote.</p>
    </div>`;
  $("#colonne-droite").innerHTML=`<h3>Derniers duels</h3>`+(C.recents.length?C.recents.map(d=>`<div class="affiche"><span class="clou"></span>${avatar(d.gagnant,"s")}<div><div class="qui"><em>${esc(d.gagnant.nom)}</em> bat ${esc(d.perdant.nom)}</div><div class="meta">${d.format>1?`${d.scoreG} – ${d.scoreP} · meilleur des ${d.format}`:"Lancer décisif"}${d.tournoi?` · ${esc(d.tournoi)}`:d.classe?` · ±${d.delta}`:" · amical"}${d.fin!=="normal"?" · "+(d.fin==="abandon"?"abandon":"forfait"):""} · ${dateCourte(d.date)}</div></div></div>`).join("")
    :`<div class="affiche"><span class="clou"></span><div class="meta">Les avis de duels seront cloués ici.</div></div>`);
  chargerClassement().then(c=>{ if (vue==="ligue"&&ongletLigue==="classement"&&JSON.stringify(c)!==JSON.stringify(C)) ongletClassement(); });
}
async function ongletSaisons(){
  $("#colonne-principale").innerHTML=`<div class="registre"><h3>Tableau d'honneur</h3><p class="vide" style="color:#6b5236">Chargement…</p></div>`;
  $("#colonne-droite").innerHTML="";
  let S; try { S=await api("/api/saisons"); } catch(e){ toast(e.message); return; }
  if (vue!=="ligue"||ongletLigue!=="saisons") return;
  const jr=joursRestants(S.courante.finPrevue);
  $("#colonne-principale").innerHTML=`<div class="registre">${SCEAU}<h3>Tableau d'honneur</h3>
    <p class="titre-j" style="margin:0 0 14px;font-size:13px">Les champions de chaque saison restent gravés ici pour toujours.</p>
    <div class="saison-courante"><b>${esc(S.courante.nom)}</b> · commencée le ${new Date(S.courante.debut).toLocaleDateString("fr-CH",{day:"numeric",month:"long",year:"numeric"})}${jr!==null?` · se termine dans ${jr} jour${jr>1?"s":""}`:""}
      <p>À la fin de chaque saison, les cotes repartent à 1000. Le champion reçoit le haut fait « Champion de saison » et son nom entre au tableau d'honneur.</p></div>
    ${S.passees.length?S.passees.map(s=>`<div class="saison"><h4>${esc(s.nom)} <span>${new Date(s.debut).toLocaleDateString("fr-CH",{month:"short",year:"numeric"})} – ${new Date(s.fin).toLocaleDateString("fr-CH",{month:"short",year:"numeric"})}</span></h4>
      ${s.podium.length?`<ol class="podium-saison">${s.podium.map(p=>`<li data-fiche="${esc(p.joueur?p.joueur.id:"")}"><span class="medaille m${p.rang}">${p.rang}</span>${avatar(p.joueur||"?","m")}<span><b>${esc(p.joueur?p.joueur.nom:"?")}</b><span class="titre-j">cote finale ${p.cote} · ${p.v} V – ${p.d} D</span></span></li>`).join("")}</ol>`:`<p class="vide" style="color:#6b5236">Aucun duel classé cette saison-là.</p>`}</div>`).join("")
      :`<p class="vide" style="color:#6b5236">Aucune saison terminée pour l'instant. Le premier champion sera couronné à la fin de ${esc(S.courante.nom)}.</p>`}
    ${niveau()>=2?`<form class="admin-form" id="f-saison"><h4>Administration</h4><label for="nom-saison">Terminer la saison maintenant et ouvrir la suivante</label><div class="ligne-form"><input id="nom-saison" placeholder="Nom de la nouvelle saison (facultatif)" maxlength="40"><button class="btn plein petit" type="submit">${saisonConfirme?"Confirmer : clôturer la saison":"Clôturer la saison"}</button></div></form>`:""}
  </div>`;
  const fs=$("#f-saison"); if (fs) fs.onsubmit=async e=>{ e.preventDefault(); if (!saisonConfirme){ saisonConfirme=true; ongletSaisons(); setTimeout(()=>{ saisonConfirme=false; },5000); return; }
    saisonConfirme=false; try { await api("/api/admin/saison",{method:"POST",body:{nom:$("#nom-saison").value}}); config=await api("/api/config"); toast("Nouvelle saison ouverte."); rendreLigue(); } catch(err){ toast(err.message); } };
}
let saisonConfirme=false;

/* ---------- Salle en direct (colonne de droite) ---------- */
function majSalle(){
  const el=document.getElementById("salle"); if (!el) return;
  const actif=document.activeElement;
  if (actif&&el.contains(actif)&&(actif.tagName==="SELECT"||actif.id==="mon-lien")){ if (!actif.dataset.attente){ actif.dataset.attente=1; actif.addEventListener("blur",()=>setTimeout(majSalle,0),{once:true}); } return; }
  const enCours=(salle.duels||[]);
  const nbDuels=salle.nbDuels||enCours.length, plusDuels=nbDuels-enCours.length;
  const tribune=enCours.length?`<div class="k">Duels en cours (${nbDuels})</div>${enCours.map(duelEnCoursHTML).join("")}${plusDuels>0?`<p class="note">… et ${plusDuels} autre${plusDuels>1?"s":""} duel${plusDuels>1?"s":""} en ce moment.</p>`:""}`:"";
  if (!moi){
    el.innerHTML=`<h3>La salle en direct</h3><p>Pour défier des joueurs du monde entier, entre avec ton compte Discord, Google ou Twitch. Il sert seulement à vérifier que chaque joueur est unique.</p>
      <button class="btn plein" id="btn-connexion">Se connecter</button>${tribune}`;
    $("#btn-connexion").onclick=()=>seConnecter(); lierTribune(el); return;
  }
  if (!moi.profilCree){ el.innerHTML=`<h3>Presque prêt</h3><p>Bienvenue, ${esc(moi.pseudoDiscord)}. Choisis ton nom de taverne et ton portrait pour entrer dans la Ligue.</p><button class="btn plein" data-aller="profil">Créer mon profil</button>${tribune}`; lierTribune(el); return; }
  const autres=(salle.joueurs||[]).filter(j=>j.id!==moi.id);
  const f=salle.enFile||{};
  el.innerHTML=`<h3>La salle en direct</h3>
    <div class="moi-carte">${avatar(moi,"m")}<div><div class="n">${esc(moi.nom)}${badge(moi)}</div><div class="s">${esc(moi.titre)} · cote ${moi.cote}${moi.rang?` · #${moi.rang}`:""}</div>${moi.essai?`<div class="essai">Période d'essai : encore ${moi.essai} duel${moi.essai>1?"s":""} avant le classement</div>`:""}</div><button class="btn petit" data-aller="profil">Profil</button></div>
    ${wsOk()?"":`<p class="note">Connexion à la salle en cours…</p>`}
    <div class="lien-defi"><div class="k">Défier par un lien</div>
      ${monLien?`<p class="s">${monLien.de?`<b class="x">Provocation Trapinex · ${esc(nomDeX(monLien.de))}</b>. `:""}Partage ce lien sur ton serveur Discord : le premier qui clique relève le défi (${monLien.format>1?"meilleur des "+monLien.format:"un lancer"}). Reste dans la taverne pour jouer.</p>
        <div class="copie"><input id="mon-lien" readonly value="${esc(monLien.url)}" aria-label="Ton lien de défi"><button class="btn plein petit" id="copier-lien">Copier</button><button class="btn petit" id="annuler-lien">Annuler</button></div>`
      :`<div class="copie"><select id="fmt-lien" aria-label="Format du défi">${optionsFormat(formatLien)}</select><button class="btn plein petit" id="creer-lien">Créer un lien de défi</button></div>`}
    </div>
    <div class="chercher"><div class="k">Chercher un adversaire au hasard</div>
      <div class="format">${[[1,"Un lancer"],[3,"Meilleur des 3"],[5,"Meilleur des 5"]].map(([n,l])=>`<button type="button" data-file="${n}" aria-pressed="${maFile===n}">${l}${f[n]&&maFile!==n?` · ${f[n]} en attente`:""}</button>`).join("")}</div>
      ${maFile?`<p class="attente"><span class="point"></span>Tu attends un adversaire (${maFile>1?"meilleur des "+maFile:"un lancer"})… <button class="btn petit" id="quitter-file">Annuler</button></p>`:""}
    </div>
    ${defiEnvoye?`<p class="attente"><span class="point"></span>Défi envoyé à ${esc(defiEnvoye.a.nom)}… <button class="btn petit" id="annuler-defi">Annuler</button></p>`:""}
    ${tribune}
    <div class="k">Dans la taverne (${Math.max(autres.length,(salle.nbJoueurs||0)-1)})</div>
    <ul class="presents">${autres.length?autres.map(j=>`<li>${avatar(j,"s")}<button class="lien" data-fiche="${esc(j.id)}">${esc(j.nom)}</button>${badge(j)}<span class="s">${j.cote} · ${esc(j.statut)}</span>
      ${j.statut==="libre"||j.statut==="cherche un duel"?`<span class="defier"><select aria-label="Format du défi" data-fmt="${esc(j.id)}">${optionsFormat(formatsDefi[j.id]||1)}</select><button class="btn petit plein" data-defier="${esc(j.id)}">Défier</button></span>`:""}</li>`).join("")
      :`<li class="vide">Personne d'autre pour l'instant. Crée un lien de défi et partage-le sur ton serveur Discord !</li>`}</ul>
    ${(salle.nbJoueurs||0)-1>autres.length?`<p class="note">La salle est bondée : seuls ${autres.length} joueurs sont affichés (les disponibles d’abord, puis les mieux cotés). Pour affronter quelqu'un en particulier, envoie-lui un lien de défi.</p>`:""}`;
  el.querySelectorAll("[data-file]").forEach(b=>b.onclick=()=>{ const n=+b.dataset.file; if (maFile===n) envoyer({t:"quitter_file"}); else envoyer({t:"file",format:n}); });
  const qf=$("#quitter-file"); if (qf) qf.onclick=()=>envoyer({t:"quitter_file"});
  const ad=$("#annuler-defi"); if (ad) ad.onclick=()=>{ envoyer({t:"annuler_defi",id:defiEnvoye.id}); defiEnvoye=null; majSalle(); };
  el.querySelectorAll("[data-defier]").forEach(b=>b.onclick=()=>{ const id=b.dataset.defier; const sel=el.querySelector(`[data-fmt="${CSS.escape(id)}"]`); envoyer({t:"defier",cible:id,format:+(sel?sel.value:1)}); });
  const fl=$("#fmt-lien"); if (fl) fl.onchange=()=>{ formatLien=+fl.value; };
  el.querySelectorAll("[data-fmt]").forEach(x=>x.onchange=()=>{ formatsDefi[x.dataset.fmt]=+x.value; });
  const cl=$("#creer-lien"); if (cl) cl.onclick=async()=>{ try { const r=await api("/api/invitation",{method:"POST",body:{format:+$("#fmt-lien").value}}); monLien={...r,url:location.origin+"/d/"+r.code}; majSalle(); copier(monLien.url); } catch(e){ toast(e.message); } };
  const cp=$("#copier-lien"); if (cp) cp.onclick=()=>copier(monLien.url);
  const an=$("#annuler-lien"); if (an) an.onclick=async()=>{ try { await api("/api/invitation",{method:"DELETE"}); } catch {} monLien=null; majSalle(); };
  lierTribune(el);
}
let formatLien=1; const formatsDefi={};
const optionsFormat=v=>[[1,"Un lancer"],[3,"Meilleur des 3"],[5,"Meilleur des 5"]].map(([n,l])=>`<option value="${n}" ${n===v?"selected":""}>${l}</option>`).join("");
function lierTribune(el){ el.querySelectorAll("[data-regarder]").forEach(b=>b.onclick=()=>regarder(b.dataset.regarder)); }
async function copier(texte){
  try { await navigator.clipboard.writeText(texte); toast("Lien copié. Colle-le dans ton salon Discord !"); }
  catch { const i=$("#mon-lien"); if (i){ i.focus(); i.select(); } toast("Sélectionne le lien et copie-le (Ctrl + C)."); }
}

/* ---------- Page d'invitation /d/CODE ---------- */
let invitationData=null;
async function rendreInvitation(){
  const code=invitationCode;
  app.innerHTML=`<section class="vue"><div class="invitation panneau"><p class="vide">Le tavernier cherche ce défi dans son registre…</p></div></section>`;
  try { invitationData=await api("/api/invitation/"+encodeURIComponent(code)); } catch(e){ invitationData=null; }
  if (vue!=="invitation"||invitationCode!==code) return;
  const I=invitationData, box=app.querySelector(".invitation");
  if (!I){ box.innerHTML=`<h2>Défi introuvable</h2><p>Ce lien de défi n'existe pas. Il a peut-être été mal copié.</p><button class="btn plein" data-aller="ligue">Entrer dans la Ligue</button>`; return; }
  const c=I.createur, soi=moi&&moi.id===c.id;
  let actions="";
  if (!I.valide) actions=`<p class="etat">${I.utilise?"Ce défi a déjà été relevé.":"Ce défi a expiré."}</p><button class="btn plein" data-aller="ligue">Défier quelqu'un d'autre</button>`;
  else if (soi) actions=`<p class="etat">C'est ton lien de défi. Partage-le sur Discord et reste dans la taverne : le premier qui clique joue contre toi.</p><div class="copie"><input id="mon-lien" readonly value="${esc(location.origin+"/d/"+I.code)}"><button class="btn plein petit" id="copier-inv">Copier</button></div><button class="btn" data-aller="ligue">Aller dans la salle</button>`;
  else if (!moi) actions=`<p class="etat">Connecte-toi pour relever ce défi (Discord, Google ou Twitch). Ça prend dix secondes.</p><button class="btn plein" id="connexion-inv">Se connecter</button>`;
  else if (!moi.profilCree) actions=`<p class="etat">Crée d'abord ton profil de taverne, puis reviens relever le défi.</p><button class="btn plein" id="profil-inv">Créer mon profil</button>`;
  else if (!I.presente) actions=`<p class="etat">${esc(c.nom)} n'est pas à la table en ce moment. Le lien reste valable : réessaie un peu plus tard.</p><button class="btn" id="reessayer">Réessayer</button><button class="btn" data-aller="ligue">Aller dans la salle</button>`;
  else if (I.statut==="en duel") actions=`<p class="etat">${esc(c.nom)} est déjà en plein duel. Réessaie dans un instant.</p><button class="btn" id="reessayer">Réessayer</button>`;
  else actions=`<button class="btn plein grand" id="relever">Relever le défi</button><button class="btn" data-aller="ligue">Non merci</button>`;
  box.classList.toggle("invitation-x",!!I.de);
  box.innerHTML=`<div class="k">${I.de?"Provocation à la Trapinex":"Défi à la Trapinette"}</div>${avatar(c,"xl")}<h2>${esc(c.nom)} ${I.de?"te provoque !":"te défie !"}</h2>
    <p class="s">${esc(c.titre)} · cote ${c.cote} · ${c.v} V – ${c.d} D</p>
    <p class="format-inv">${I.de?`Trapinex · ${esc(I.nomDe)} (d${I.de}) · le perdant finit 24 h en prison`:I.format>1?`Au meilleur des ${I.format}`:"Un lancer décisif"} · dés tirés par le Manoir</p>
    <div class="actions-inv">${actions}</div>`;
  const b=$("#relever"); if (b) b.onclick=()=>{ b.disabled=true; b.textContent="Le tavernier prépare la table…"; envoyer({t:"accepter_invitation",code:I.code}); };
  const r=$("#reessayer"); if (r) r.onclick=rendreInvitation;
  const cx=$("#connexion-inv"); if (cx) cx.onclick=()=>seConnecter("/d/"+I.code);
  const pr=$("#profil-inv"); if (pr) pr.onclick=()=>{ try { sessionStorage.setItem("trapinette-retour","/d/"+I.code); } catch {} allerA("profil"); };
  const ci=$("#copier-inv"); if (ci) ci.onclick=()=>copier(location.origin+"/d/"+I.code);
}

/* ---------- Tournois ---------- */
async function ongletTournois(){
  $("#colonne-principale").innerHTML=`<div class="registre"><h3>Tournois du Manoir</h3><p class="vide" style="color:#6b5236">Chargement…</p></div>`;
  $("#colonne-droite").innerHTML="";
  let L; try { L=await api("/api/tournois"); } catch(e){ toast(e.message); return; }
  if (vue!=="ligue"||ongletLigue!=="tournois") return;
  const etiquette={inscriptions:"Inscriptions ouvertes",en_cours:"En cours",termine:"Terminé"};
  $("#colonne-principale").innerHTML=`<div class="registre">${SCEAU}<h3>Tournois du Manoir</h3>
    <p class="titre-j" style="margin:0 0 14px;font-size:13px">Tableau à élimination directe. Les matchs de tournoi ne changent pas la cote de la saison.</p>
    ${L.tournois.length?`<div class="liste-tournois">${L.tournois.map(t=>`<button class="tournoi-ligne" data-tournoi="${esc(t.id)}"><span><b>${esc(t.nom)}</b><span class="titre-j">${t.inscrits}/${t.taille} joueurs · ${t.format>1?"meilleur des "+t.format:"un lancer"}${t.vainqueur?` · vainqueur : ${esc(t.vainqueur.nom)}`:""}</span></span><span class="statut s-${t.statut}">${etiquette[t.statut]||t.statut}</span></button>`).join("")}</div>`
      :`<p class="vide" style="color:#6b5236">Aucun tournoi pour l'instant. Les modérateurs du serveur en annonceront bientôt.</p>`}
    ${moi&&moi.admin?`<form class="admin-form" id="f-tournoi"><h4>Organiser un tournoi</h4>
      <label for="t-nom">Nom</label><input id="t-nom" maxlength="60" placeholder="Ex. : Coupe du Crâne-de-Troll">
      <div class="ligne-form"><label>Joueurs <select id="t-taille"><option value="4">4</option><option value="8" selected>8</option><option value="16">16</option><option value="32">32</option></select></label>
      <label>Format <select id="t-format"><option value="1">Un lancer</option><option value="3" selected>Meilleur des 3</option><option value="5">Meilleur des 5</option></select></label>
      <button class="btn plein petit" type="submit">Ouvrir les inscriptions</button></div></form>`:""}
  </div>`;
  app.querySelectorAll("[data-tournoi]").forEach(b=>b.onclick=()=>ouvrirTournoi(b.dataset.tournoi));
  const ft=$("#f-tournoi"); if (ft) ft.onsubmit=async e=>{ e.preventDefault();
    try { const r=await api("/api/admin/tournois",{method:"POST",body:{nom:$("#t-nom").value,taille:+$("#t-taille").value,format:+$("#t-format").value}}); ouvrirTournoi(r.id); } catch(err){ toast(err.message); } };
}
let tournoiData=null;
function ouvrirTournoi(id){ tournoiOuvert=id; tournoiData=null; allerA("tournoi"); }
async function chargerTournoi(id){ try { tournoiData=await api("/api/tournois/"+encodeURIComponent(id)); } catch(e){ toast(e.message); tournoiData=null; } if (vue==="tournoi"&&tournoiOuvert===id) dessinerTournoi(); }
function rendreTournoi(){
  app.innerHTML=`<section class="vue"><div class="barre"><div><h2 id="t-titre">Tournoi</h2><div class="sous" id="t-sous"></div></div><button class="btn" id="retour-tournois">Tous les tournois</button></div><div class="tableau" id="t-corps"><p class="vide">Chargement…</p></div></section>`;
  $("#retour-tournois").onclick=()=>{ ongletLigue="tournois"; allerA("ligue"); };
  chargerTournoi(tournoiOuvert);
}
const NOMS_TOURS=(n,t)=>{ const reste=n-t; return reste===0?"Finale":reste===1?"Demi-finales":reste===2?"Quarts de finale":reste===3?"Huitièmes":`Tour ${t}`; };
function dessinerTournoi(){
  const T=tournoiData; if (!T) return;
  $("#t-titre").textContent=T.nom;
  $("#t-sous").textContent=`${T.format>1?"Au meilleur des "+T.format:"Un lancer décisif"} · ${T.statut==="inscriptions"?`inscriptions ouvertes (${T.inscrits.length}/${T.taille})`:T.statut==="en_cours"?"en cours":"terminé"}`;
  const inscrit=moi&&T.inscrits.some(j=>j.id===moi.id);
  let corps="";
  if (T.statut==="inscriptions"){
    corps+=`<div class="registre"><h3>Inscrits (${T.inscrits.length}/${T.taille})</h3>
      ${T.inscrits.length?`<ul class="inscrits">${T.inscrits.map(j=>`<li data-fiche="${esc(j.id)}">${avatar(j,"s")}<b>${esc(j.nom)}</b><span class="titre-j">${j.cote}</span></li>`).join("")}</ul>`:`<p class="vide" style="color:#6b5236">Personne n'est encore inscrit.</p>`}
      <div class="ligne-form">${!moi?`<button class="btn plein" id="t-connexion">Se connecter pour s'inscrire</button>`:!moi.profilCree?`<button class="btn plein" data-aller="profil">Créer mon profil</button>`:inscrit?`<button class="btn" id="t-desinscrire">Me désinscrire</button>`:T.inscrits.length<T.taille?`<button class="btn plein" id="t-inscrire">M'inscrire</button>`:`<span class="vide">Tournoi complet.</span>`}
      ${moi&&moi.admin?`<button class="btn plein" id="t-demarrer">Lancer le tournoi</button><button class="btn" id="t-annuler">Annuler le tournoi</button>`:""}</div>
      <p style="font-size:14px;color:#6b5236">Les têtes de série sont placées selon la cote de la saison. S'il manque des joueurs, les mieux classés passent directement au tour suivant.</p></div>`;
  } else {
    if (T.vainqueur) corps+=`<div class="champion">${avatar(T.vainqueur,"l")}<div><div class="k">Vainqueur du tournoi</div><div class="t">${esc(T.vainqueur.nom)}</div></div></div>`;
    const tours=[...new Set(T.matchs.map(m=>m.tour))].sort((a,b)=>a-b), n=tours.length;
    corps+=`<div class="bracket-rouleau"><div class="bracket">${tours.map(t=>`<div class="tour"><h4>${NOMS_TOURS(n,t)}</h4>${T.matchs.filter(m=>m.tour===t).map(m=>matchHTML(T,m)).join("")}</div>`).join("")}</div></div>`;
    if (moi&&moi.admin&&T.statut==="en_cours") corps+=`<p class="note">Administration : en cas d'absence, désigne le vainqueur d'un match avec les boutons « Qualifier ».</p><button class="btn" id="t-annuler">Annuler le tournoi</button>`;
  }
  $("#t-corps").innerHTML=corps;
  const on=(id,fn)=>{ const b=$("#"+id); if (b) b.onclick=fn; };
  on("t-connexion",()=>seConnecter("/t/"+T.id));
  on("t-inscrire",async()=>{ try { await api(`/api/tournois/${T.id}/inscription`,{method:"POST"}); toast("Tu es inscrit !"); chargerTournoi(T.id); } catch(e){ toast(e.message); } });
  on("t-desinscrire",async()=>{ try { await api(`/api/tournois/${T.id}/inscription`,{method:"DELETE"}); chargerTournoi(T.id); } catch(e){ toast(e.message); } });
  on("t-demarrer",async()=>{ try { await api(`/api/admin/tournois/${T.id}/demarrer`,{method:"POST"}); chargerTournoi(T.id); } catch(e){ toast(e.message); } });
  on("t-annuler",async()=>{ const b=$("#t-annuler"); if (!b.dataset.ok){ b.dataset.ok=1; b.textContent="Confirmer l'annulation"; return; } try { await api(`/api/admin/tournois/${T.id}/annuler`,{method:"POST"}); ongletLigue="tournois"; allerA("ligue"); } catch(e){ toast(e.message); } });
  app.querySelectorAll("[data-pret]").forEach(b=>b.onclick=()=>{ const [tour,pos]=b.dataset.pret.split(":").map(Number); envoyer({t:"pret_tournoi",tournoi:T.id,tour,pos,pret:b.dataset.etat!=="1"}); });
  app.querySelectorAll("[data-qualifier]").forEach(b=>b.onclick=async()=>{ const [tour,pos,j]=b.dataset.qualifier.split(":"); try { await api(`/api/admin/tournois/${T.id}/matchs/${tour}/${pos}`,{method:"POST",body:{gagnant:j}}); chargerTournoi(T.id); } catch(e){ toast(e.message); } });
  app.querySelectorAll("[data-regarder]").forEach(b=>b.onclick=()=>regarder(b.dataset.regarder));
}
function matchHTML(T,m){
  const ligne=(j,autre)=>{ if (!j) return `<div class="mj-l vide">${m.tour===1?"Exempt":"À déterminer"}</div>`;
    const g=m.gagnant===j.id, p=m.gagnant&&!g;
    return `<div class="mj-l ${g?"g":""} ${p?"p":""}">${avatar(j,"s")}<button class="lien" data-fiche="${esc(j.id)}">${esc(j.nom)}</button>${m.prets.includes(j.id)&&!m.gagnant?`<span class="pret">prêt</span>`:""}
      ${moi&&moi.admin&&T.statut==="en_cours"&&!m.gagnant&&m.a&&m.b?`<button class="btn petit" data-qualifier="${m.tour}:${m.pos}:${esc(j.id)}">Qualifier</button>`:""}</div>`; };
  let bas="";
  const moiDedans=moi&&(m.a&&m.a.id===moi.id||m.b&&m.b.id===moi.id);
  if (m.enCours&&!moiDedans) bas=`<span class="titre-j">Match en cours</span><button class="btn petit" data-regarder="${esc(m.enCours)}">Regarder</button>`;
  else if (m.enCours) bas=`<span class="titre-j">Match en cours</span>`;
  else if (moiDedans&&!m.gagnant&&m.a&&m.b&&T.statut==="en_cours"){ const pret=m.prets.includes(moi.id); bas=`<button class="btn ${pret?"":"plein"} petit" data-pret="${m.tour}:${m.pos}" data-etat="${pret?1:0}">${pret?"Je ne suis plus prêt":"Je suis prêt"}</button>${pret?`<span class="titre-j">En attente de ton adversaire…</span>`:""}`; }
  return `<div class="match ${moiDedans&&!m.gagnant?"a-moi":""}">${ligne(m.a)}${ligne(m.b)}${bas?`<div class="bas">${bas}</div>`:""}</div>`;
}

/* ---------- Modération ---------- */
async function ongletModeration(){
  $("#colonne-principale").innerHTML=`<div class="registre"><h3>Signalements</h3><p class="vide" style="color:#6b5236">Chargement…</p></div>`; $("#colonne-droite").innerHTML="";
  let R; try { R=await api("/api/admin/signalements"); } catch(e){ toast(e.message); return; }
  if (vue!=="ligue"||ongletLigue!=="moderation") return;
  $("#colonne-principale").innerHTML=`<div class="registre"><h3>Signalements ouverts</h3>
    ${R.cibles.length?R.cibles.map(c=>`<div class="signalement"><div class="qui-cell">${avatar(c.cible,"m")}<span><span class="joueur-nom">${esc(c.cible.nom)}</span><span class="titre-j">Compte : ${esc(c.cible.pseudoDiscord)} · ${c.signalements.length} signalement${c.signalements.length>1?"s":""}${c.cible.banni?" · exclu":""}</span></span></div>
      <ul>${c.signalements.map(s=>`<li><b>${esc(s.motif)}</b> par ${esc(s.auteur||"?")} · ${dateCourte(s.date)}${s.texte?`<br><i>« ${esc(s.texte)} »</i>`:""}</li>`).join("")}</ul>
      <div class="ligne-form">${[["retirer-portrait","Retirer le portrait"],["renommer","Forcer un nouveau nom"],["bannir","Exclure de la Ligue"],["classer","Classer sans suite"]].map(([a,l])=>`<button class="btn petit ${a==="bannir"?"danger":""}" data-moderer="${a}:${esc(c.cible.id)}">${l}</button>`).join("")}</div></div>`).join("")
      :`<p class="vide" style="color:#6b5236">Aucun signalement en attente. La taverne est calme.</p>`}</div>`;
  app.querySelectorAll("[data-moderer]").forEach(b=>b.onclick=async()=>{ const [a,id]=b.dataset.moderer.split(":");
    if (a==="bannir"&&!b.dataset.ok){ b.dataset.ok=1; b.textContent="Confirmer l'exclusion"; return; }
    try { await api(`/api/admin/${a}/${encodeURIComponent(id)}`,{method:"POST"}); toast("Décision enregistrée."); ongletModeration(); } catch(e){ toast(e.message); } });
}

/* ---------- Équipe de modération ---------- */
const NOMS_ACTIONS={"maintenance-on":"a activé le mode maintenance","maintenance-off":"a rouvert le Manoir",sauvegarde:"a téléchargé une sauvegarde",titre:"a décerné un titre à","titre-retire":"a retiré le titre de",liberer:"a fait sortir de prison",bannir:"a exclu",retablir:"a rétabli","retirer-portrait":"a retiré le portrait de",renommer:"a demandé un nouveau nom à",classer:"a classé sans suite le signalement de",
  "role-admin":"a nommé administrateur","role-moderateur":"a nommé modérateur","role-retire":"a retiré de l'équipe","tournoi-cree":"a créé le tournoi","tournoi-annule":"a annulé le tournoi",
  "tournoi-qualifie":"a qualifié","saison":"a ouvert la saison","nom-verifie":"a reçu son pseudo vérifié :","nom-libere":"a dû changer de nom (pseudo vérifié d'un autre joueur) :"};
async function ongletEquipe(){
  $("#colonne-principale").innerHTML=`<div class="registre"><h3>L'équipe du Manoir</h3><p class="vide" style="color:#6b5236">Chargement…</p></div>`; $("#colonne-droite").innerHTML="";
  let E; try { E=await api("/api/admin/equipe"); } catch(e){ toast(e.message); return; }
  if (vue!=="ligue"||ongletLigue!=="equipe") return;
  const n=E.monNiveau;
  const ligne=(m,peutRetirer)=>`<li>${avatar(m.joueur,"s")}<button class="lien" data-fiche="${esc(m.joueur.id)}">${esc(m.joueur.nom)}</button>${badge({verifie:m.joueur.verifie})}
    <span class="titre-j">${m.ajoutePar?`nommé par ${esc(m.ajoutePar)} · `:""}${m.date?new Date(m.date).toLocaleDateString("fr-CH"):""}</span>${peutRetirer?`<button class="btn petit" data-retirer="${esc(m.joueur.id)}">Retirer</button>`:""}</li>`;
  const bloc=(titre,desc,liste,peut)=>`<div class="equipe-bloc"><h4>${titre} <span>(${liste.length})</span></h4><p class="desc">${desc}</p>${liste.length?`<ul class="equipe">${liste.map(m=>ligne(m,peut)).join("")}</ul>`:`<p class="vide" style="color:#6b5236">Personne pour l'instant.</p>`}</div>`;
  $("#colonne-principale").innerHTML=`${n>=2?`<div class="outils-admin"><div class="panneau salle" id="bloc-maintenance"></div>${n>=3?`<div class="panneau salle" id="bloc-sauvegardes"><h3>Sauvegardes</h3><p class="vide">Chargement…</p></div>`:""}</div>`:""}<div class="registre"><h3>L'équipe du Manoir</h3>
    <p class="titre-j" style="margin:0 0 14px;font-size:13px">Ton rôle : ${NOMS_ROLES[{1:"moderateur",2:"admin",3:"proprietaire"}[n]]}</p>
    ${bloc("Propriétaire","Le compte principal du Manoir (réglé dans ADMIN_IDS). Il nomme et retire les administrateurs.",E.proprietaires.map(j=>({joueur:j})),false)}
    ${bloc("Administrateurs","Ils nomment les modérateurs, ouvrent les saisons et ont tous les outils de modération.",E.admins,n>=3)}
    ${bloc("Modérateurs","Ils traitent les signalements (portraits, noms, exclusions) et organisent les tournois.",E.moderateurs,n>=2)}
    ${n>=2?`<form class="admin-form" id="f-equipe"><h4>Ajouter un membre</h4>
      <label for="eq-nom">Nom de taverne du joueur</label>
      <div class="ligne-form"><input id="eq-nom" list="eq-suggestions" autocomplete="off" placeholder="Commence à taper un nom…"><datalist id="eq-suggestions"></datalist>
      <select id="eq-role" aria-label="Rôle"><option value="moderateur">Modérateur</option>${n>=3?`<option value="admin">Administrateur</option>`:""}</select>
      <button class="btn plein petit" type="submit">Nommer</button></div>
      <div class="erreur" id="eq-err" role="alert"></div></form>`:`<p class="note" style="color:#6b5236">Seuls les administrateurs peuvent ajouter des modérateurs.</p>`}
    <div class="equipe-bloc"><h4>Titres honorifiques <span>(${E.titres.length})</span></h4><p class="desc">Un titre en or à côté du nom : pour l'équipe TableQuest, les invités, les légendes… ${n>=2?"Tu peux en donner et en retirer.":"Seuls les administrateurs peuvent en donner."}</p>
      ${E.titres.length?`<ul class="equipe">${E.titres.map(t=>`<li>${avatar(t.joueur,"s")}<button class="lien" data-fiche="${esc(t.joueur.id)}">${esc(t.joueur.nom)}</button><span class="titre-or">${COURONNE}${esc(t.titre)}</span>${n>=2?`<button class="btn petit" data-retirer-titre="${esc(t.joueur.id)}">Retirer</button>`:""}</li>`).join("")}</ul>`:`<p class="vide" style="color:#6b5236">Aucun titre décerné.</p>`}
      ${n>=2?`<form class="admin-form" id="f-titre"><label for="ti-nom">Décerner un titre</label>
        <div class="ligne-form"><input id="ti-nom" list="ti-suggestions" autocomplete="off" placeholder="Nom de taverne"><datalist id="ti-suggestions"></datalist>
        <input id="ti-titre" list="ti-modeles" maxlength="31" placeholder="Titre (ex. Dieu)"><datalist id="ti-modeles"><option value="Chouchou·te du public"><option value="Dieu"><option value="Équipe TableQuest"><option value="Légende du Manoir"></datalist>
        <button class="btn plein petit" type="submit">Décerner</button></div><div class="erreur" id="ti-err" role="alert"></div></form>`:""}</div>
  </div>`;
  $("#colonne-droite").innerHTML=`<div class="panneau salle"><h3>Joueurs exclus (${E.bannis.length})</h3>
      ${E.bannis.length?`<ul class="presents">${E.bannis.map(b=>`<li><span class="lien">${esc(b.nom||"?")}</span><span class="s">${esc(b.compte||"")}</span><span class="defier"><button class="btn petit" data-retablir="${esc(b.id)}">Rétablir</button></span></li>`).join("")}</ul>`:`<p class="vide">Personne n'est exclu.</p>`}</div>
    <div class="panneau salle"><h3>Journal de modération</h3>
      ${E.journal.length?`<ol class="journal">${E.journal.map(l=>`<li><span class="d">${dateCourte(l.date)}</span><span><b>${esc(l.acteur)}</b> ${esc(NOMS_ACTIONS[l.action]||l.action)} ${l.cible?`<b>${esc(l.cible)}</b>`:""}${l.details&&!["role-admin","role-moderateur","role-retire"].includes(l.action)?` ${esc(l.details)}`:""}</span></li>`).join("")}</ol>`:`<p class="vide">Aucune action pour l'instant.</p>`}</div>`;
  app.querySelectorAll("[data-retirer]").forEach(b=>b.onclick=async()=>{ if (!b.dataset.ok){ b.dataset.ok=1; b.textContent="Confirmer"; return; }
    try { await api("/api/admin/equipe/"+encodeURIComponent(b.dataset.retirer),{method:"DELETE"}); toast("Retiré de l'équipe."); ongletEquipe(); } catch(e){ toast(e.message); } });
  app.querySelectorAll("[data-retablir]").forEach(b=>b.onclick=async()=>{ try { await api(`/api/admin/retablir/${encodeURIComponent(b.dataset.retablir)}`,{method:"POST"}); toast("Joueur rétabli."); ongletEquipe(); } catch(e){ toast(e.message); } });
  majMaintenance(); if (n>=3) chargerSauvegardes();
  app.querySelectorAll("[data-retirer-titre]").forEach(b=>b.onclick=async()=>{ try { await api("/api/admin/titre/"+encodeURIComponent(b.dataset.retirerTitre),{method:"DELETE"}); toast("Titre retiré."); ongletEquipe(); } catch(e){ toast(e.message); } });
  const ft=$("#f-titre");
  if (ft){ let sug=[], mt=null;
    $("#ti-nom").oninput=()=>{ clearTimeout(mt); mt=setTimeout(async()=>{ const c=$("#ti-nom"); const q=c?c.value.trim():""; if (!q) return;
      try { sug=(await api("/api/admin/recherche?q="+encodeURIComponent(q))).joueurs; if ($("#ti-suggestions")) $("#ti-suggestions").innerHTML=sug.map(j=>`<option value="${esc(j.nom)}"></option>`).join(""); } catch {} },200); };
    ft.onsubmit=async e=>{ e.preventDefault(); $("#ti-err").textContent="";
      const nom=$("#ti-nom").value.trim(), j=sug.find(x=>x.nom.toLowerCase()===nom.toLowerCase());
      try { await api("/api/admin/titre",{method:"POST",body:{joueur:j?j.id:nom,titre:$("#ti-titre").value}}); toast(`Titre décerné à ${nom}.`); ongletEquipe(); } catch(err){ $("#ti-err").textContent=err.message; } }; }
  const f=$("#f-equipe");
  if (f){ let suggestions=[], minuterie=null;
    $("#eq-nom").oninput=()=>{ clearTimeout(minuterie); minuterie=setTimeout(async()=>{ const champ=$("#eq-nom"); const q=champ?champ.value.trim():""; if (!q) return;
      try { suggestions=(await api("/api/admin/recherche?q="+encodeURIComponent(q))).joueurs; if ($("#eq-suggestions")) $("#eq-suggestions").innerHTML=suggestions.map(j=>`<option value="${esc(j.nom)}">${j.role?NOMS_ROLES[j.role]:""}</option>`).join(""); } catch {} },200); };
    f.onsubmit=async e=>{ e.preventDefault(); $("#eq-err").textContent="";
      const nom=$("#eq-nom").value.trim(), j=suggestions.find(x=>x.nom.toLowerCase()===nom.toLowerCase());
      try { await api("/api/admin/equipe",{method:"POST",body:{joueur:j?j.id:nom,role:$("#eq-role").value}}); toast(`${nom} rejoint l'équipe.`); ongletEquipe(); } catch(err){ $("#eq-err").textContent=err.message; } }; }
}

function majMaintenance(){
  const el=document.getElementById("bloc-maintenance"); if (!el) return;
  const on=!!salle.maintenance, n=salle.nbDuels||0;
  el.innerHTML=`<h3>Mise à jour du site</h3>
    <p class="maint ${on?"on":""}">${on?`<b>Mode maintenance actif.</b> Duels en cours : <b>${n}</b>${n?" · attends qu'ils se terminent…":" · <b>tu peux lancer la mise à jour.</b>"}`:"Le Manoir est ouvert normalement."}</p>
    <p class="note">Avant une mise à jour : active le mode, attends que le compteur arrive à 0, puis relance le site sur le VPS. Le mode se désactive tout seul au redémarrage.</p>
    <button class="btn ${on?"":"plein"}" id="btn-maintenance">${on?"Rouvrir sans mettre à jour":"Activer le mode maintenance"}</button>`;
  $("#btn-maintenance").onclick=async()=>{ try { await api("/api/admin/maintenance",{method:"POST",body:{actif:!on}}); salle.maintenance=!on; majMaintenance(); majBandeau(); } catch(e){ toast(e.message); } };
}
async function chargerSauvegardes(){
  const el=document.getElementById("bloc-sauvegardes"); if (!el) return;
  let S; try { S=await api("/api/admin/sauvegardes"); } catch(e){ el.innerHTML=`<h3>Sauvegardes</h3><p class="vide">${esc(e.message)}</p>`; return; }
  const ko=n=>n>1048576?(n/1048576).toFixed(1)+" Mo":Math.ceil(n/1024)+" Ko";
  el.innerHTML=`<h3>Sauvegardes</h3>
    <p class="note">Le serveur copie la base chaque jour et garde les ${S.garder} dernières copies. Pour te protéger d'une panne du VPS, télécharge aussi une copie sur ton ordinateur de temps en temps.</p>
    <a class="btn plein" href="/api/admin/sauvegarde" download>Télécharger une sauvegarde maintenant</a>
    ${S.fichiers.length?`<ul class="presents sauvegardes">${S.fichiers.slice(0,7).map(f=>`<li><span class="lien">${esc(f.nom.replace(/^trapinette-|\.db$/g,""))}</span><span class="s">${ko(f.taille)}</span></li>`).join("")}</ul>${S.fichiers.length>7?`<p class="note">… et ${S.fichiers.length-7} plus anciennes.</p>`:""}`:`<p class="vide">Première copie automatique dans quelques secondes après le démarrage.</p>`}`;
}

/* ---------- Fiche joueur et signalement ---------- */
document.addEventListener("click",e=>{ const f=e.target.closest("[data-fiche]"); if (f&&f.dataset.fiche) ouvrirFiche(f.dataset.fiche); });
document.addEventListener("keydown",e=>{ if (e.key==="Enter"){ const f=e.target.closest&&e.target.closest("tr[data-fiche]"); if (f) ouvrirFiche(f.dataset.fiche); } });
async function ouvrirFiche(id){
  let F; try { F=await api("/api/joueur/"+encodeURIComponent(id)); } catch(e){ toast(e.message); return; }
  const j=F.joueur, enLigne=(salle.joueurs||[]).find(x=>x.id===j.id), soi=moi&&moi.id===j.id;
  const peutDefier=moi&&moi.profilCree&&!soi&&enLigne&&enLigne.statut!=="en duel";
  $("#modal").innerHTML=`<div class="voile" id="voile"><div class="registre fiche" role="dialog" aria-modal="true" aria-label="Fiche de ${esc(j.nom)}">
    <button class="fermer" id="fermer" aria-label="Fermer">×</button>
    <div class="haut">${avatar(j,"xl")}<div><h3>${esc(j.nom)}${badge(j)}</h3>${j.verifie?`<div class="titre-j">Pseudo vérifié par ${NOMS_FOURN[j.verifie]}</div>`:""}${j.role?`<div class="titre-j">${NOMS_ROLES[j.role]} du Manoir</div>`:""}<div class="titre-j" style="font-size:14px">${esc(j.titre)}${F.rang?` · rang #${F.rang}`:""}${enLigne?" · dans la taverne":""}</div>${j.essai?`<div class="essai essai-fiche">Nouveau joueur · période d'essai (${j.essai} duel${j.essai>1?"s":""} restant${j.essai>1?"s":""})</div>`:""}
      ${F.palmares.length?`<div class="trophees">${F.palmares.map(p=>`<span class="trophee m${p.rang}">${p.rang===1?"Champion":p.rang===2?"2e":"3e"} · ${esc(p.saison)}</span>`).join("")}</div>`:""}</div></div>
    <div class="stats"><div class="stat"><b>${j.cote}</b><span>Cote</span></div><div class="stat"><b>${j.v}</b><span>Victoires</span></div><div class="stat"><b>${j.d}</b><span>Défaites</span></div><div class="stat"><b>${j.meilleureSerie}</b><span>Meilleure série</span></div></div>
    ${F.trapinex||enPrisonX(j)?`<div class="fiche-x">${PRISON}<div><b>Trapinex</b> · ${F.trapinex?`cote clandestine ${F.trapinex.cote} · ${F.trapinex.v} V – ${F.trapinex.d} D · ${F.trapinex.prisons} séjour${F.trapinex.prisons>1?"s":""} en prison`:"aucun duel classé"}${enPrisonX(j)?` · <b class="x">en prison, sortie dans ${rebours(j.prison)}</b>`:""}</div></div>`:""}
    <h4>Hauts faits (${F.hautsFaits.length}/${Object.keys(config.hautsFaits||{}).length})</h4>${grilleHautsFaits(F.hautsFaits)}
    <h4>Face à face</h4>${F.faces.length?`<ul>${F.faces.map(f=>`<li><span>contre ${esc(f.adversaire?f.adversaire.nom:"?")}</span><span>${f.v} V – ${f.d} D</span></li>`).join("")}</ul>`:`<p class="vide" style="color:#6b5236">Aucun adversaire encore.</p>`}
    <h4>Derniers duels</h4>${F.duels.length?`<ul>${F.duels.map(d=>{ const g=d.gagnant&&d.gagnant.id===j.id; return `<li><span>${g?"Victoire contre "+esc(d.perdant.nom):"Défaite contre "+esc(d.gagnant.nom)}${d.fin!=="normal"?" ("+d.fin+")":""}${d.tournoi?" · "+esc(d.tournoi):""}${d.mode==="trapinex"?` · <b class="x">Trapinex ${esc(d.nomDe||"")}</b>`:""}</span><span>${d.classe?(g?"+":"−")+d.delta:d.tournoi?"tournoi":"amical"}</span></li>`; }).join("")}</ul>`:`<p class="vide" style="color:#6b5236">Pas encore de duel.</p>`}
    <div class="outils">${moi&&moi.profilCree&&!soi?`<button class="btn petit" id="signaler">Signaler</button>`:""}${peutDefier&&!enPrisonX(j)&&!enPrisonX(moi)?`<button class="btn petit" id="provoquer-fiche">Provoquer en Trapinex</button>`:""}${peutDefier?`<button class="btn plein" id="defier-fiche">Défier ${esc(j.nom)}</button>`:""}</div>
  </div></div>`;
  $("#fermer").onclick=fermerFiche; $("#voile").onclick=e=>{ if (e.target.id==="voile") fermerFiche(); };
  const df=$("#defier-fiche"); if (df) df.onclick=()=>{ envoyer({t:"defier",cible:j.id,format}); fermerFiche(); };
  const px=$("#provoquer-fiche"); if (px) px.onclick=()=>{ envoyer({t:"defier",cible:j.id,de:deXChoisi}); fermerFiche(); toast(`Provocation en ${nomDeX(deXChoisi)} (d${deXChoisi}). Change de dé dans la Cave.`); };
  const sg=$("#signaler"); if (sg) sg.onclick=()=>ouvrirSignalement(j);
  $("#fermer").focus();
}
function ouvrirSignalement(j){
  $("#modal").innerHTML=`<div class="voile" id="voile"><form class="registre fiche" id="f-signal" role="dialog" aria-modal="true" aria-label="Signaler ${esc(j.nom)}">
    <button class="fermer" type="button" id="fermer" aria-label="Fermer">×</button>
    <div class="haut">${avatar(j,"l")}<div><h3>Signaler ${esc(j.nom)}</h3><div class="titre-j" style="font-size:14px">Les modérateurs du serveur examineront ton signalement.</div></div></div>
    <fieldset class="motifs"><legend>Motif</legend>
      ${[["nom","Nom inapproprié"],["portrait","Portrait inapproprié"],["comportement","Comportement (insultes, harcèlement…)"],["triche","Soupçon de triche ou de faux comptes"],["autre","Autre"]].map(([k,l],i)=>`<label><input type="radio" name="motif" value="${k}" ${i===0?"checked":""}> ${l}</label>`).join("")}
    </fieldset>
    <label for="s-texte" style="font-family:var(--sc);font-size:13px;letter-spacing:.06em;color:#6b4a2a">Précisions (facultatif)</label>
    <textarea id="s-texte" maxlength="300" rows="3" placeholder="Ce qui s'est passé, en quelques mots"></textarea>
    <div class="erreur" id="s-err" role="alert"></div>
    <div class="outils"><button class="btn petit" type="button" id="s-annuler">Annuler</button><button class="btn plein" type="submit">Envoyer le signalement</button></div>
  </form></div>`;
  $("#fermer").onclick=fermerFiche; $("#s-annuler").onclick=()=>ouvrirFiche(j.id); $("#voile").onclick=e=>{ if (e.target.id==="voile") fermerFiche(); };
  $("#f-signal").onsubmit=async e=>{ e.preventDefault();
    try { await api("/api/signaler",{method:"POST",body:{cible:j.id,motif:(new FormData(e.target)).get("motif"),texte:$("#s-texte").value}}); fermerFiche(); toast("Merci. Ton signalement a été transmis aux modérateurs."); }
    catch(err){ $("#s-err").textContent=err.message; } };
}
function fermerFiche(){ $("#modal").innerHTML=""; }

/* =========================================================
   PROFIL : nom de taverne, portrait, hauts faits
   ========================================================= */
let choixPortrait=null;
function rendreProfil(){
  if (!moi){ app.innerHTML=`<section class="vue"><div class="panneau prep" style="max-width:560px;margin:30px auto"><h2 style="font-family:var(--display);font-weight:400;font-size:36px;margin:0 0 8px;color:var(--laiton-clair)">Entrer dans la Ligue</h2>
    <p>Connecte-toi avec Discord, Google ou Twitch. Chaque compte ne peut avoir qu'un seul profil : c'est ce qui rend le classement mondial fiable.</p><button class="btn plein" id="btn-connexion">Se connecter</button></div></section>`; $("#btn-connexion").onclick=()=>seConnecter("/#profil"); return; }
  const comptes=moi.comptes||[], avatars=comptes.filter(c=>c.avatar), verifs=moi.nomsVerifies||[];
  const nomChoisi=()=>{ if (verifs.length){ const r=app.querySelector('input[name="nom-verifie"]:checked'); return r?r.value:verifs[0].nom; } return ($("#p-nom")||{}).value||""; };
  if (!choixPortrait) choixPortrait=moi.portraitType&&moi.portraitType!=="blason"||moi.profilCree?{type:moi.portraitType||"galerie",val:moi.portraitVal||"taverniere"}:avatars.length?{type:"compte",val:avatars[0].fournisseur}:{type:"galerie",val:"taverniere"};
  if (choixPortrait.type==="blason"&&!moi.profilCree) choixPortrait={type:"galerie",val:"taverniere"};
  const apercu=()=>{ const n=propre(nomChoisi()||moi.nom||moi.pseudoDiscord); const c=choixPortrait;
    const src=c.type==="galerie"?"galerie:"+c.val:c.type==="compte"?((avatars.find(a=>a.fournisseur===c.val)||{}).avatar||null):c.type==="image"?(moi.portraitType==="image"&&moi.portrait)||null:null; return {nom:n,portrait:src}; };
  const sel=(t,v)=>choixPortrait.type===t&&(v===undefined||choixPortrait.val===v)?"aria-pressed=\"true\"":"aria-pressed=\"false\"";
  app.innerHTML=`<section class="vue">
    <div class="barre"><div><h2>${moi.profilCree?"Mon profil":"Créer mon profil"}</h2><div class="sous">Connecté : ${comptes.filter(c=>c.fournisseur!=="dev").map(c=>esc(NOMS_FOURN[c.fournisseur]||c.fournisseur)+" ("+esc(c.pseudo||"")+")").join(" · ")||esc(moi.pseudoDiscord)}</div></div>
      <button class="btn" id="deconnexion">Se déconnecter</button></div>
    ${enPrisonX(moi)?`<div class="prison-x prison-profil">${PRISON}<div><div class="k">En prison · sortie dans ${rebours(moi.prison)}</div><p>Privé de Trapinex jusqu'à <b>${heureCourte(moi.prison)}</b>. La Ligue et la Trapinette normale restent ouvertes.</p></div></div>`:""}
    <form class="panneau profil" id="f-profil" novalidate>
      <div class="profil-haut"><div id="apercu">${avatar(apercu(),"xl")}</div>
        ${verifs.length?`<fieldset class="champ noms-verifies" style="flex:1"><legend>Nom de taverne</legend>
          ${verifs.map((v,i)=>`<label class="nom-v f-${v.fournisseur}"><input type="radio" name="nom-verifie" value="${esc(v.nom)}" ${(moi.nom?moi.nom.toLowerCase()===v.nom.toLowerCase():i===0)?"checked":""}>${ICONES[v.fournisseur]}<b>${esc(v.nom)}</b><span>pseudo ${NOMS_FOURN[v.fournisseur]} vérifié</span></label>`).join("")}
          <p class="note" style="margin:0">Ton nom de taverne est ton pseudo ${verifs.map(v=>NOMS_FOURN[v.fournisseur]).join(" ou ")} : personne ne peut se faire passer pour toi.${verifs.length>1?" Choisis celui que tu préfères afficher.":""} Pour le changer, change ton pseudo sur ${verifs.map(v=>NOMS_FOURN[v.fournisseur]).join(" ou ")}, puis reconnecte-toi.</p></fieldset>`
        :`<div class="champ" style="flex:1"><label for="p-nom">Nom de taverne</label><input id="p-nom" maxlength="24" autocomplete="off" value="${esc(moi.nom||"")}" placeholder="Ex. : Grimbold le Chanceux">
          <p class="note" style="margin:0">C'est le nom que verront tes adversaires et le classement mondial. 3 à 24 caractères.${(config.fournisseurs||{}).discord||(config.fournisseurs||{}).twitch?" Relie Discord ou Twitch pour obtenir le badge vérifié et passer la période d'essai.":""}</p></div>`}</div>
      ${moi.renomme?`<p class="avertissement">${esc(moi.renomme)}</p>`:""}
      <h3>Choisis ton portrait</h3>
      <div class="k">Portraits de la taverne</div>
      <div class="galerie">${GALERIE.map(g=>`<button type="button" class="choix-p" data-type="galerie" data-val="${g.id}" ${sel("galerie",g.id)}><img alt="" src="${portraitGalerie(g.id)}"><span>${esc(g.nom)}</span></button>`).join("")}</div>
      <div class="k">Ou bien</div>
      <div class="galerie autres">
        ${avatars.map(c=>`<button type="button" class="choix-p" data-type="compte" data-val="${esc(c.fournisseur)}" ${sel("compte",c.fournisseur)}><img alt="" src="${esc(c.avatar)}" referrerpolicy="no-referrer"><span>Mon avatar ${esc(NOMS_FOURN[c.fournisseur]||c.fournisseur)}</span></button>`).join("")}
        <button type="button" class="choix-p" data-type="blason" ${sel("blason")}><span class="svg">${blason(propre(moi.nom||moi.pseudoDiscord))}</span><span>Mon blason</span></button>
        <button type="button" class="choix-p" data-type="image" ${sel("image")} id="choix-image">${moi.portraitType==="image"&&moi.portrait?`<img alt="" src="${esc(moi.portrait)}">`:`<span class="plus">+</span>`}<span>Mon image</span></button>
      </div>
      <p class="note">Une image envoyée est recadrée en carré et visible par tous les joueurs de la Ligue. N'envoie que des images que tu as le droit d'utiliser.</p>
      ${!moi.profilCree&&config.turnstile&&!verifs.length?`<div class="anti-robot"><div class="k">Vérification anti-robot</div><div id="zone-turnstile"></div></div>`:""}
      <div class="erreur" id="err" role="alert"></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end"><button class="btn" type="button" data-aller="ligue">Retour</button><button class="btn plein" type="submit">${moi.profilCree?"Enregistrer":"Entrer dans la Ligue"}</button></div>
    </form>
    <div class="panneau profil" style="margin-top:18px"><h3>Mes comptes reliés</h3>
      <p class="note" style="margin:0">Relie plusieurs comptes pour te connecter avec l'un ou l'autre : ils mènent tous au même profil, avec le même classement.</p>
      <ul class="comptes">${["discord","google","twitch"].filter(f=>(config.fournisseurs||{})[f]||comptes.some(c=>c.fournisseur===f)).map(f=>{ const c=comptes.find(x=>x.fournisseur===f);
        return `<li class="f-${f}">${ICONES[f]}<span class="n">${NOMS_FOURN[f]}</span>${c?`<span class="p">${esc(c.pseudo||"")}</span>${comptes.filter(x=>x.fournisseur!=="dev").length>1?`<button class="btn petit" data-delier="${f}">Délier</button>`:`<span class="titre-j">compte principal</span>`}`
          :`<span class="p vide">non relié</span><a class="btn petit plein" href="/auth/${f}?lier=1">Relier</a>`}</li>`; }).join("")}</ul>
    </div>
    ${moi.profilCree?`<div class="panneau profil" style="margin-top:18px"><h3>Mes hauts faits (${(moi.hautsFaits||[]).length}/${Object.keys(config.hautsFaits||{}).length})</h3>${grilleHautsFaits(moi.hautsFaits)}
      <div style="display:flex;justify-content:flex-end"><button class="btn petit" id="revoir-tuto">Revoir le tutoriel</button></div></div>`:""}
  </section>`;
  const maj=()=>{ $("#apercu").innerHTML=avatar(apercu(),"xl"); app.querySelectorAll(".choix-p").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.type===choixPortrait.type&&(b.dataset.type!=="galerie"||b.dataset.val===choixPortrait.val)))); };
  if ($("#p-nom")) $("#p-nom").oninput=maj;
  app.querySelectorAll('input[name="nom-verifie"]').forEach(r=>r.onchange=maj);
  app.querySelectorAll(".choix-p").forEach(b=>b.onclick=()=>{ if (b.dataset.type==="image") return envoyerImage(); choixPortrait={type:b.dataset.type,val:b.dataset.val||null}; maj(); });
  const rt=$("#revoir-tuto"); if (rt) rt.onclick=()=>ouvrirTuto();
  app.querySelectorAll("[data-delier]").forEach(b=>b.onclick=async()=>{ if (!b.dataset.ok){ b.dataset.ok=1; b.textContent="Confirmer"; return; }
    try { await api("/api/comptes/delier",{method:"POST",body:{fournisseur:b.dataset.delier}}); await chargerMoi(); choixPortrait=null; rendreProfil(); toast("Compte délié."); } catch(e){ toast(e.message); } });
  if (!moi.profilCree&&config.turnstile&&!verifs.length) try { chargerTurnstile(); } catch(e){ console.error(e); }
  $("#deconnexion").onclick=async()=>{ await api("/auth/deconnexion",{method:"POST"}).catch(()=>{}); moi=null; choixPortrait=null; monLien=null; await chargerMoi(); allerA("accueil"); toast("À la prochaine, voyageur."); };
  $("#f-profil").onsubmit=async e=>{ e.preventDefault(); $("#err").textContent="";
    if (!moi.profilCree&&config.turnstile&&!verifs.length&&!jetonTurnstile){ $("#err").textContent="Coche d'abord la case de vérification anti-robot."; return; }
    try { await api("/api/profil",{method:"POST",body:{nom:nomChoisi(),portraitType:choixPortrait.type,portraitVal:choixPortrait.val,turnstile:jetonTurnstile}});
      const premier=!moi.profilCree; await chargerMoi(); classementCache=null; toast(premier?"Bienvenue dans la Ligue internationale !":"Profil enregistré.");
      let retour=null; try { retour=sessionStorage.getItem("trapinette-retour"); sessionStorage.removeItem("trapinette-retour"); } catch {}
      const m=retour&&/^\/d\/([A-Z0-9]+)$/i.exec(retour);
      if (m){ invitationCode=m[1].toUpperCase(); allerA("invitation"); } else allerA("ligue"); }
    catch(err){ $("#err").textContent=err.message; if (window.turnstile&&typeof window.turnstile.reset==="function"&&idTurnstile!==null){ jetonTurnstile=null; try { window.turnstile.reset(idTurnstile); } catch {} } } };
}
let jetonTurnstile=null, idTurnstile=null;
function chargerTurnstile(){
  const pret=()=>window.turnstile&&typeof window.turnstile.render==="function";
  const rendu=()=>{ const el=$("#zone-turnstile"); if (!el||!pret()) return; jetonTurnstile=null;
    try { idTurnstile=window.turnstile.render(el,{sitekey:config.turnstile,theme:"dark",language:"fr",callback:t=>{ jetonTurnstile=t; },"expired-callback":()=>{ jetonTurnstile=null; }}); } catch(e){ console.error(e); } };
  if (pret()) return rendu();
  if (!document.getElementById("script-turnstile")){ const sc=document.createElement("script"); sc.id="script-turnstile"; sc.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.async=true; sc.onload=rendu; document.head.appendChild(sc); }
}
function envoyerImage(){
  const inp=document.createElement("input"); inp.type="file"; inp.accept="image/png,image/jpeg,image/webp,image/gif";
  inp.onchange=async()=>{ const f=inp.files&&inp.files[0]; if (!f) return;
    if (f.size>15*1024*1024){ toast("Image trop lourde (15 Mo maximum)."); return; }
    try { const url=await reduire(f); const r=await api("/api/portrait",{method:"POST",body:{image:url}});
      moi.portraitType="image"; moi.portrait=r.portrait; choixPortrait={type:"image",val:null}; toast("Image reçue. N'oublie pas d'enregistrer."); rendreProfil(); }
    catch(e){ toast(e.message||"Cette image n'a pas pu être envoyée."); } };
  inp.click();
}
function reduire(file){ return new Promise((res,rej)=>{ const url=URL.createObjectURL(file), img=new Image();
  img.onload=()=>{ const S=320,[c,x]=toile(S,S), m=Math.min(img.width,img.height); x.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,S,S); URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg",.88)); };
  img.onerror=()=>{ URL.revokeObjectURL(url); rej(new Error("Cette image n'a pas pu être lue.")); }; img.src=url; }); }

/* =========================================================
   ENTRÉE DANS LA TAVERNE
   ========================================================= */
Monde.init();
function tutoSiPremiereFois(){ if (!store.get("trapinette-tuto",0)) setTimeout(()=>{ if (!$("#modal").innerHTML&&vue==="accueil") ouvrirTuto(); },900); }
function entrer(avecSon){
  if (avecSon){ Son.demarrer(); Son.porte(); majBoutonSon(); }
  $("#porte").classList.add("ouverte");
  setTimeout(()=>Monde.allerVers(vue==="partie"?"partie":vue==="accueil"?"accueil":vue==="cave"?"cave":"mur"),250);
  setTimeout(()=>{ const p=$("#porte"); if (p) p.remove(); },1600);
  if (vue==="accueil") tutoSiPremiereFois();
}
$("#entrer-son").onclick=()=>entrer(true);
$("#entrer").onclick=()=>entrer(false);
(async()=>{
  try { config=await api("/api/config"); salle.maintenance=!!config.maintenance; majBandeau(); } catch {}
  const q=new URLSearchParams(location.search), err=q.get("erreur");
  if (err) { toast({compte_recent:"Ce compte est trop récent pour la Ligue. Reviens dans quelques jours, ou connecte-toi avec un autre compte.",deja_lie:"Ce compte est déjà relié à un autre profil de la Ligue.",non_configure:"Cette connexion n'est pas encore configurée sur ce serveur."}[err]||"La connexion a échoué. Réessaie."); history.replaceState(null,"",location.pathname+location.hash); }
  await chargerMoi();
  const direct=()=>{ const p=$("#porte"); if (p) p.remove(); Monde.allerVers(vue==="partie"?"partie":vue==="accueil"?"accueil":vue==="cave"?"cave":"mur"); };
  const mInv=/^\/d\/([A-Z0-9]{4,10})\/?$/i.exec(location.pathname), mTour=/^\/t\/([a-f0-9]{8,32})\/?$/i.exec(location.pathname), h=location.hash.slice(1);
  if (mInv){ invitationCode=mInv[1].toUpperCase(); allerA("invitation"); direct(); return; }
  if (mTour){ tournoiOuvert=mTour[1]; allerA("tournoi"); direct(); return; }
  if (moi&&!moi.profilCree){ allerA("profil"); direct(); return; }
  if (suivreAncre()) direct(); else allerA("accueil");
})();
addEventListener("hashchange",()=>{ if (!(partie&&partie.enLigne&&!partie.fini&&!partie.spectateur)) suivreAncre(); });
function suivreAncre(){
  const h=location.hash.slice(1);
  if (h.startsWith("tournoi-")){ if (vue==="tournoi"&&tournoiOuvert===h.slice(8)) return true; tournoiOuvert=h.slice(8); allerA("tournoi"); return true; }
  if (["ligue","saisons","tournois","moderation","equipe"].includes(h)){ const o=h==="ligue"?"classement":h; if (vue==="ligue"&&ongletLigue===o) return true; ongletLigue=o; allerA("ligue"); return true; }
  if (h==="profil"){ if (vue!=="profil") allerA("profil"); return true; }
  if (h==="cave"){ if (vue!=="cave") allerA("cave"); return true; }
  return false;
}
})();
