(()=>{
'use strict';
const $=id=>document.getElementById(id);
const canvas=$('gameCanvas'),ctx=canvas.getContext('2d',{alpha:false});
const spriteAssets={cat:new Image(),dog:new Image(),anas:new Image()};
const backgroundAssets={forest:new Image(),city:new Image()};
spriteAssets.cat.src='assets/cat-hero.svg';spriteAssets.dog.src='assets/puppy-run.svg';spriteAssets.anas.src='assets/anas-hero-v3.svg';
backgroundAssets.forest.src='assets/forest-premium.svg';backgroundAssets.city.src='assets/city-premium.svg';
const uiIds=['menu','letter','settings','credits','pauseScreen','chapterCard','intermission','letterReveal','ending'];
let W=innerWidth,H=innerHeight,DPR=1,mode='menu',currentLevel=0,paused=false,lastTime=0,cameraX=0;
let worldWidth=4100,platforms=[],stars=[],memories=[],particles=[],ambient=[],toastTimer=0,chapterToastTimer=0;
let totalStars=0,totalMemories=0,levelStars=0,levelMemories=0,soundOn=true,language='it',audioContext=null,masterGain=null,musicTimer=null,musicStep=0,lastFootstep=0,goalPulse=0;
const TOTAL_STARS=10, TOTAL_MEMORIES=2;
const keys={left:false,right:false,jump:false};
const player={x:70,y:0,w:46,h:54,vx:0,vy:0,onGround:false,face:1,landSquash:0,blink:0,invuln:0,checkpointX:70};
const dog={x:35,y:0,tail:0,face:1,speed:2.9};
let dogCaught=false;
const copy={
 it:{tagline:'Una piccola avventura, per una persona speciale.',play:'✦ Inizia l’avventura',settings:'Impostazioni',credits:'Il mondo illustrato',loading:'Il mondo si sta illuminando…',littleNote:'UNA PICCOLA NOTA',forCarlotta:'Per Carlotta',letterCopy:'Ho creato questa piccola avventura pensando a te. Spero che ti regali un sorriso e renda speciale anche solo un piccolo momento della tua giornata.',signature:'Con affetto, Anas',startJourney:'Cominciamo il viaggio ✦',back:'Indietro',makeItYours:'Rendila tua',language:'Lingua',languageDesc:'Testi e messaggi della storia',sound:'Musica e suoni',soundDesc:'Piccole melodie create per il viaggio',on:'Attivi',off:'Disattivi',difficulty:'Esperienza',difficultyDesc:'Puoi saltare e riprovare senza fretta',relaxed:'Senza fretta ✦',done:'Fatto',madeWithCare:'Fatto con cura ♥',creditsCopy:'Un piccolo mondo disegnato con cura: un gatto coraggioso, una città piena di stelle e un giardino incantato.',memoryCaption:'Tre illustrazioni originali: il gatto, la città e il giardino magico.',playNow:'Gioca adesso ✦',pause:'PAUSA',takeYourTime:'Prenditi il tuo tempo',pauseCopy:'Le stelle saranno qui quando tornerai.',continue:'Continua ✦',mainMenu:'Menu principale',chapterComplete:'CAPITOLO COMPLETATO',starsFound:'Stelle trovate',nextChapter:'Prossimo capitolo →',journeyEnd:'LA FINE DI QUESTA AVVENTURA, NON DELLA MAGIA',endingCopy:'A volte le cose più belle sono piccole: un pensiero gentile, una risata, o qualcuno che rende una giornata un po’ più luminosa.',stars:'stelle',memories:'ricordi',playAgain:'Rivivi il viaggio',hint:'← → Muovi · Spazio / ↑ Salta · Raccogli le stelle ✦',hintChase:'← → Corri · Raggiungi la cagnolina nera 🐾',hintChaseMobile:'Usa i pulsanti ← → per raggiungere la cagnolina 🐾',hintMobile:'Usa ← → per muoverti · premi ↑ per saltare ✦',hintGarden:'Una busta ti aspetta… premi per aprire la lettera ✧',gardenSoloLabel:'Una lettera per Carlotta',littleLight:'Una piccola luce!',memoryFound:'Un ricordo prezioso ♥',checkpoint:'Un piccolo posto sicuro ✦',tryAgain:'Nessun problema — ogni avventura merita un altro tentativo.',level0:'Il gatto bianco e la cagnolina nera',level1:'La città delle stelle',level2:'Anas cerca Carlotta',subtitle0:'Un sentiero nel bosco, senza ostacoli. Corri e raggiungi la cagnolina nera.',subtitle1:'La tua nuova amica ti accompagna nella città notturna. Salta tra i tetti e raccogli le stelle.',subtitle2:'Anas corre tra le lanterne e le rose per trovare Carlotta. La porta luminosa del giardino è la meta.',inter0:'L’hai raggiunta! La cagnolina si fida di te. Da ora correrà al tuo fianco nella città delle stelle.',inter1:'La città si fa silenziosa. Una piccola busta illuminata ti aspetta…',inter2:'',chaseToast:'La cagnolina corre via! Raggiungila!',caughtDog:'L’hai raggiunta! La cagnolina si fida di te ♥',dogRunning:'In fuga…',dogCaughtLabel:'Amica trovata!',chaseBlocked:'La cagnolina ti aspetta più avanti!',chapterToast1:'Una stella per te ✦',chapterToast2:'La porta di Carlotta è vicina ♥',reunionCaption:'E alla fine, nel giardino segreto, c’era Emy. ♥',confessionEyebrow:'DOPO AVER APERTO LA PORTA…',confessionTitle:'Per te, Carlotta ♥',confessionLead:'Anas apre la porta del giardino e finalmente trova Carlotta. Le porge un mazzo di rose e una lettera scritta con il cuore.',loveLetterTitle:'Una lettera per te',responseEyebrow:'ORA TOCCA A TE',responseTitle:'Carlotta, cosa senti?',responseIntro:'Qualunque sia la tua risposta, sarà rispettata. Scegli con il cuore, senza pressione.',responseYes:'Anch’io ti amo',responseFriends:'Restiamo migliori amici',shareResponse:'Invia la risposta ad Anas',shareExplain:'Si aprirà il menu di condivisione del tuo telefono: scegli WhatsApp o un’altra app per mandargli la risposta.',yesTitle:'Mi hai reso felicissimo ♥',yesText:'Anch’io ti amo, Carlotta. Grazie per avermi detto ciò che senti. Voglio costruire qualcosa di bello con te, un passo alla volta.',friendsTitle:'La nostra amicizia resta preziosa 💛',friendsText:'Grazie per essere sincera, Carlotta. Ti voglio bene e rispetto quello che senti. Resteremo migliori amici per sempre… e adesso ci vuole un gelato per festeggiare la nostra amicizia! 🍦',shareYes:'Carlotta ha risposto SÌ 💗 ad Anas nella sua avventura. La sua risposta: “Anch’io ti amo”.',shareFriends:'Carlotta ha scelto l’amicizia 💛 nella sua avventura con Anas. La sua risposta: “Restiamo migliori amici”.',loveConfession:'Carlotta, c’è una cosa che tengo nel cuore da un po’. Sei diventata una persona davvero speciale per me e voglio essere sincero: sono innamorato di te. Ti regalo questi fiori come piccolo segno di ciò che provo. Non voglio metterti fretta né aspettarmi una risposta particolare: qualunque cosa tu senta, la rispetterò. — Anas ♥',levelLabel0:'CAPITOLO I',levelLabel1:'CAPITOLO II',levelLabel2:'CAPITOLO III',letterRevealEyebrow:'CAPITOLO III · UNA PICCOLA LETTERA',letterRevealTitle:'C’è una lettera per te, Carlotta',letterRevealCopy:'La città si è fatta silenziosa. Una piccola busta ti aspetta nella luce delle stelle.',openEnvelope:'Apri la lettera'},
 en:{tagline:'A little adventure, for someone special.',play:'✦ Begin the adventure',settings:'Settings',credits:'Illustrated world',loading:'The world is lighting up…',littleNote:'A LITTLE NOTE',forCarlotta:'For Carlotta',letterCopy:'I made this little adventure thinking of you. I hope it brings you a smile and makes even a small moment of your day feel special.',signature:'With affection, Anas',startJourney:'Let’s begin the journey ✦',back:'Back',makeItYours:'Make it yours',language:'Language',languageDesc:'Story text and messages',sound:'Music & sounds',soundDesc:'Little melodies made for the journey',on:'On',off:'Off',difficulty:'Experience',difficultyDesc:'You can jump and try again at your own pace',relaxed:'Take your time ✦',done:'Done',madeWithCare:'Made with care ♥',creditsCopy:'A little world drawn with care: a brave cat, a city full of stars, and an enchanted garden.',memoryCaption:'Three original illustrations: the cat, the city, and the garden of roses.',playNow:'Play now ✦',pause:'PAUSED',takeYourTime:'Take your time',pauseCopy:'The stars will be here when you return.',continue:'Continue ✦',mainMenu:'Main menu',chapterComplete:'CHAPTER COMPLETE',starsFound:'Stars found',nextChapter:'Next chapter →',journeyEnd:'THE END OF THIS ADVENTURE, NOT THE MAGIC',endingCopy:'Sometimes the loveliest things are small: a kind thought, a laugh, or someone who makes a day a little brighter.',stars:'stars',memories:'memories',playAgain:'Relive the journey',hint:'← → Move · Space / ↑ Jump · Collect the stars ✦',hintChase:'← → Run · Catch the little black puppy 🐾',hintChaseMobile:'Use the ← → buttons to catch the little black pup 🐾',hintMobile:'Use ← → to move · tap ↑ to jump ✦',hintGarden:'A little envelope is waiting… press it to open the letter ✧',gardenSoloLabel:'A letter for Carlotta',littleLight:'A little light!',memoryFound:'A precious memory ♥',checkpoint:'A little safe place ✦',tryAgain:'No worries — every adventure deserves another try.',level0:'The White Cat and the Little Black Puppy',level1:'The City of Stars',level2:'Anas Searches for Carlotta',subtitle0:'A peaceful woodland path with no obstacles. Run and catch the little black puppy.',subtitle1:'Your new friend joins you in the night city. Jump across the rooftops and collect stars.',subtitle2:'Anas runs through lanterns and roses, searching for Carlotta. The glowing garden door is his goal.',inter0:'You caught up! She trusts you. From now on, she will run beside you through the City of Stars.',inter1:'The city grows quiet. A little envelope glows softly in the starlight…',inter2:'',chaseToast:'The little puppy is running away! Catch her!',caughtDog:'You caught up! She trusts you ♥',dogRunning:'Running away…',dogCaughtLabel:'Friend found!',chaseBlocked:'The little puppy is waiting just ahead!',chapterToast1:'A star for you ✦',chapterToast2:'Carlotta’s door is near ♥',reunionCaption:'At the very end, in the secret garden, Emy was waiting. ♥',confessionEyebrow:'AFTER THE GARDEN DOOR OPENS…',confessionTitle:'For you, Carlotta ♥',confessionLead:'Anas opens the garden door and finally finds Carlotta. He offers her a bouquet of roses and a letter written from the heart.',loveLetterTitle:'A letter for you',responseEyebrow:'NOW IT’S YOUR TURN',responseTitle:'Carlotta, how do you feel?',responseIntro:'Whatever your answer is, it will be respected. Choose with your heart, with no pressure.',responseYes:'I love you too',responseFriends:'Let’s stay best friends',shareResponse:'Send your answer to Anas',shareExplain:'Your phone’s share menu will open. Choose WhatsApp or another app to send him your answer.',yesTitle:'You made me so happy ♥',yesText:'I love you too, Carlotta. Thank you for sharing how you feel. I would love to build something beautiful with you, one step at a time.',friendsTitle:'Our friendship is precious 💛',friendsText:'Thank you for being honest, Carlotta. I care about you and respect how you feel. We’ll stay best friends forever… and now we need ice cream to celebrate our friendship! 🍦',shareYes:'Carlotta answered YES 💗 to Anas in his adventure. Her answer: “I love you too”.',shareFriends:'Carlotta chose friendship 💛 in her adventure with Anas. Her answer: “Let’s stay best friends”.',loveConfession:'Carlotta, there is something I have carried in my heart for a while. You have become truly special to me, and I want to be honest: I am in love with you. I offer these flowers as a small sign of what I feel. I do not want to rush you or expect any particular answer; whatever you feel, I will respect it. — Anas ♥',levelLabel0:'CHAPTER I',levelLabel1:'CHAPTER II',levelLabel2:'CHAPTER III',letterRevealEyebrow:'CHAPTER III · A LITTLE LETTER',letterRevealTitle:'There is a letter for you, Carlotta',letterRevealCopy:'The city has grown quiet. A little envelope is waiting in the starlight.',openEnvelope:'Open the letter'}
};
const levelData=[
 {name:'The White Cat and the Little Black Dog',subtitle:'A peaceful woodland chase on a continuous path.',palette:{top:'#a5e3f3',mid:'#82d5ed',bottom:'#b4e7a0',far:'#70bd8c',midHill:'#3e986b',near:'#276348',ground:'#4b613e',grass:'#9fd870',glow:'#fff4d0',moon:'#fff0cd',water:'#4caa85'},width:3200,layout:[[0,3200,0]],stars:[],memory:null,checkpoints:[420,780,1140,1500,1860,2220,2580,2860],goal:3090},
 {name:'The City of Stars',subtitle:'Collect stars across the rooftops with your new friend.',palette:{top:'#111d32',mid:'#385b73',bottom:'#c991ba',far:'#3b5b6d',midHill:'#274a5c',near:'#1d3c4a',ground:'#254d4d',grass:'#b8d79c',glow:'#c8ffe4',moon:'#ffeabf',water:'#274d63'},width:4300,layout:[[0,460,0],[520,180,72],[770,170,128],[1005,190,70],[1252,200,160],[1515,170,92],[1747,202,190],[2006,183,118],[2245,190,65],[2490,205,148],[2753,175,205],[2992,197,100],[3244,190,160],[3496,183,72],[3740,560,0]],stars:[570,815,1050,1310,1560,1810,2060,2300,2560,3300],memory:{x:2500,off:185,text:'I desideri più belli crescono piano, come i fiori dopo la pioggia.'},checkpoints:[610,850,1100,1350,1600,1845,2100,2330,2590,2820,3080,3340,3590,3910],goal:4200},
 {name:'Anas Searches for Carlotta',subtitle:'Run through the rose garden and find Carlotta at the door.',palette:{top:'#17223f',mid:'#6b5a83',bottom:'#edb6c6',far:'#68708a',midHill:'#46556c',near:'#314556',ground:'#2f4c4d',grass:'#c4d6a9',glow:'#ffddb0',moon:'#fff0d0',water:'#43587a'},width:4460,layout:[[0,4460,0]],stars:[],memory:{x:3060,off:60,text:'Le piccole luci ti portano sempre verso chi conta davvero.'},checkpoints:[350,690,1080,1510,1975,2440,2900,3340,3790,4100],goal:4325}
];
const tr=key=>{const c=copy[language]||copy.it;return c[key]??copy.it[key]??key};
function applyLanguage(){document.documentElement.lang=language;document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(copy[language][k]!==undefined)el.innerHTML=copy[language][k]});$('gameHint').textContent=tr('hint');$('italianBtn').classList.toggle('selected',language==='it');$('englishBtn').classList.toggle('selected',language==='en');$('soundToggle').querySelector('b').textContent=soundOn?tr('on'):tr('off');updateHud();}
function showScreen(id){uiIds.forEach(k=>$(k).classList.toggle('hidden',k!==id));$('hud').classList.add('hidden');mode=id;/* Freeze and hide the last gameplay frame on cinematic story screens so rooftops never ghost through the romance scene. */canvas.style.visibility='visible';canvas.style.display=(id==='letterReveal'||id==='ending')?'none':'block';if(id!=='game'){const toast=$('toast'),chapterToast=$('chapterToast');if(toast)toast.classList.remove('show');if(chapterToast)chapterToast.classList.remove('visible');clearTimeout(toastTimer);clearTimeout(chapterToastTimer);}}
function hideScreens(){uiIds.forEach(k=>$(k).classList.add('hidden'));canvas.style.visibility='visible';canvas.style.display='block';}
function toggleScreen(back='menu'){showScreen(back)}
function resize(){const bounds=$('app').getBoundingClientRect();W=Math.max(1,Math.round(bounds.width||window.innerWidth));H=Math.max(1,Math.round(bounds.height||window.innerHeight));DPR=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(W*DPR));canvas.height=Math.max(1,Math.floor(H*DPR));canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);seedAmbient();if(currentLevel>=0&&['game','pauseScreen','chapterCard','intermission'].includes(mode)){const oldX=player.x;buildLevel(currentLevel,true,oldX);}}
function seedAmbient(){ambient=[];for(let i=0;i<100;i++)ambient.push({x:Math.random()*Math.max(W,1),y:Math.random()*Math.max(H*.6,1),size:Math.random()*1.7+.35,phase:Math.random()*6.28,speed:Math.random()*.7+.15});}
function getPalette(){const uiScene=['menu','settings','credits','letter'].includes(mode)?0:currentLevel;return levelData[Math.max(0,Math.min(levelData.length-1,uiScene))]?.palette||levelData[0].palette;}
function floorForX(worldX,fallback=H*.77){if(!platforms.length)return fallback;let best=platforms[0],bestDist=Infinity;for(const q of platforms){if(worldX>=q.x&&worldX<=q.x+q.w)return q.y;const dist=worldX<q.x?q.x-worldX:worldX-(q.x+q.w);if(dist<bestDist){bestDist=dist;best=q;}}return best?best.y:fallback;}
function platformAtX(worldX,inset=7){return platforms.find(q=>worldX>=q.x+inset&&worldX<=q.x+q.w-inset)||null;}
function nearestPlatformAtX(worldX){let best=platforms[0],dist=Infinity;for(const q of platforms){if(worldX>=q.x&&worldX<=q.x+q.w)return q;const d=Math.min(Math.abs(worldX-q.x),Math.abs(worldX-(q.x+q.w)));if(d<dist){dist=d;best=q;}}return best;}
function prepareDogJump(direction,step){if(!dog.onGround||!direction||!platforms.length)return;const under=platformAtX(dog.x,7);if(!under){dog.onGround=false;return;}dog.y=under.y+6;const edge=direction>0?under.x+under.w:under.x;const aboutToLeave=direction>0?dog.x+step>=edge-17:dog.x-step<=edge+17;if(!aboutToLeave)return;const next=direction>0?platforms.filter(q=>q.x>=under.x+under.w-1).sort((a,b)=>a.x-b.x)[0]:platforms.filter(q=>q.x+q.w<=under.x+1).sort((a,b)=>b.x-a.x)[0];if(!next)return;const gap=direction>0?next.x-edge:edge-(next.x+next.w);const rise=under.y-next.y;const canReach=gap<=108&&rise<=108&&rise>=-145;if(canReach){dog.vy=-10.35;dog.onGround=false;dog.lastJumpX=dog.x;}}
function advanceDogPhysics(dt){if(dog.onGround){const under=platformAtX(dog.x,7);if(under){dog.y=under.y+6;dog.vy=0;}else{dog.onGround=false;dog.vy=Math.max(0,dog.vy||0);}}if(!dog.onGround){const oldY=dog.y,oldVy=dog.vy||0;dog.y+=oldVy*dt;dog.vy=Math.min(13,oldVy+.49*dt);let landing=null;for(const q of platforms){if(dog.x>=q.x+4&&dog.x<=q.x+q.w-4&&oldVy>=0&&oldY<=q.y+6&&dog.y>=q.y+6){if(!landing||q.y<landing.y)landing=q;}}if(landing){dog.y=landing.y+6;dog.vy=0;dog.onGround=true;dog.lastSafeX=dog.x;dog.lastSafeY=dog.y;}}if(dog.onGround){dog.lastSafeX=dog.x;dog.lastSafeY=dog.y;}if(dog.y>H+95){recoverDogFromPit();}}
function recoverDogFromPit(){let p,spawnX;if(currentLevel===1){p=platformAtX(player.x+player.w*.5,2)||nearestPlatformAtX(player.x+player.w*.5);spawnX=Math.max(p.x+24,Math.min(p.x+p.w-24,player.x-84));}else{p=platforms.filter(q=>q.x>dog.x+6&&q.x<dog.x+650&&q.w>75).sort((a,b)=>a.x-b.x)[0]||nearestPlatformAtX(player.x+player.w*.5);spawnX=Math.max(p.x+22,Math.min(p.x+p.w-22,p.x+30));}dog.x=spawnX;const support=platformAtX(dog.x,1)||p;dog.y=support.y+6;dog.vy=0;dog.onGround=true;dog.dodgeTimer=0;dog.dodgeSide=0;dog.lastSafeX=dog.x;dog.lastSafeY=dog.y;spawnParticles(dog.x,dog.y-10,'#ffe2b3',8);}
function buildLevel(index,preserve=false,oldX=70){const d=levelData[index];if(!d)return;const oldDogX=dog.x;worldWidth=d.width;const base=H*.77;const oldStarIds=new Set(stars.filter(s=>s.taken).map(s=>s.id));const oldMemory=memories[0]?.taken||false;
 platforms=d.layout.map(([x,w,off],i)=>({x,w,off,y:base-off,h:off===0?H-base+160:26,id:i,ground:off===0}));
 stars=d.stars.map((x,i)=>{const pl=platforms.reduce((best,q)=>Math.abs((q.x+q.w*.5)-x)<Math.abs((best.x+best.w*.5)-x)?q:best,platforms[0]);return{id:`${index}-${i}`,x,y:pl.y-40,taken:oldStarIds.has(`${index}-${i}`),phase:i*.91}});
 memories=d.memory?[{id:`memory-${index}`,x:d.memory.x,y:(platforms.reduce((best,q)=>Math.abs((q.x+q.w*.5)-d.memory.x)<Math.abs((best.x+best.w*.5)-d.memory.x)?q:best,platforms[0])).y-d.memory.off*0.16-52,taken:preserve&&oldMemory,text:d.memory.text}]:[];
 player.x=preserve?Math.max(40,Math.min(worldWidth-80,oldX)):(index===1?165:70);player.vx=0;player.vy=0;player.onGround=false;player.invuln=0;cameraX=Math.max(0,player.x-W*.33);
 let support=platforms.find(q=>player.x+player.w>q.x&&player.x<q.x+q.w&&q.y>=H*.12);if(!support)support=platforms[0];player.y=support.y-player.h;player.checkpointX=platforms[0].x+Math.min(platforms[0].w-player.w-10,Math.max(25,player.x));
 if(!preserve){levelStars=0;levelMemories=0;dogCaught=index>0;}
 if(preserve){dog.x=Math.max(20,Math.min(worldWidth-40,oldDogX));}else if(index===0){const candidate=Math.min(worldWidth-180,player.x+Math.max(230,Math.min(300,W*.25)));const support=platforms.find(q=>candidate>=q.x+20&&candidate<=q.x+q.w-20);if(support)dog.x=candidate;else{const next=platforms.find(q=>q.x>candidate);dog.x=next?Math.min(next.x+24,next.x+next.w-20):candidate;}}else if(index===1){dog.x=Math.max(96,player.x-94);}else{dog.x=player.x-56;}
 dog.y=floorForX(dog.x,player.y+player.h)+6;dog.vy=0;dog.onGround=true;dog.lastSafeX=dog.x;dog.lastSafeY=dog.y;dog.face=1;dog.tail=0;dog.speed=3.15;dog.dodgeTimer=0;dog.dodgeCooldown=42;dog.dodgeSide=0;dog.dodgeDir=1;goalPulse=0;
 updateHud();}
function campaignStart(){chosenResponse=null;const rb=$('responseButtons'),rr=$('responseResult');if(rb)rb.hidden=false;if(rr)rr.hidden=true;totalStars=0;totalMemories=0;currentLevel=0;dogCaught=false;showChapter(0,false);playSound('menu');}
function showChapter(index,fromNext){currentLevel=index;buildLevel(index,false);$('chapterNumber').textContent=copy[language][`levelLabel${index}`];$('chapterTitle').textContent=tr(`level${index}`);$('chapterSubtitle').textContent=tr(`subtitle${index}`);showScreen('chapterCard');$('chapterGo').focus({preventScroll:true});}
function beginChapter(){hideScreens();mode='game';paused=false;$('hud').classList.remove('hidden');$('pauseBtn').textContent='Ⅱ';lastTime=performance.now();showChapterToast();updateHud();playSound('start');}
function nextChapter(){currentLevel++;if(currentLevel>=levelData.length){showEnding();return;}showChapter(currentLevel,true);}
function completeChapter(){if(currentLevel===1){currentLevel=2;showLetterReveal();return;}$('levelResult').textContent=currentLevel===0?'1 / 1':`${levelStars} / ${stars.length}`;$('chapterMedal').textContent=(currentLevel===0||levelStars===stars.length)?'✦':'✧';if(currentLevel<2){const titles=language==='it'?['La cagnolina si fida di te ♥','La città brilla di stelle','']:['Your little puppy friend trusts you ♥','The city shines with stars',''];$('intermissionTitle').textContent=titles[currentLevel]||'Il viaggio continua';$('intermissionText').textContent=tr(`inter${currentLevel}`)||'Il viaggio continua.';showScreen('intermission');}else showEnding();}
function showLetterReveal(){keys.left=keys.right=keys.jump=false;paused=false;showScreen('letterReveal');playSound('memory');const b=$('openLetterBtn');if(b)b.classList.remove('opening');}
 function showEnding(){ $('finalStars').textContent=totalStars; $('finalMemories').textContent=totalMemories;const ending=$('ending');ending.classList.remove('ending-open');showScreen('ending');requestAnimationFrame(()=>ending.classList.add('ending-open'));playSound('finish');try{const best=Number(localStorage.getItem('carlotta-best-stars')||0);if(totalStars>best)localStorage.setItem('carlotta-best-stars',String(totalStars));}catch(_){} }
function goMenu(){paused=false;keys.left=keys.right=keys.jump=false;cameraX=0;showScreen('menu');playSound('menu');}
function pauseGame(){if(mode!=='game')return;paused=true;showScreen('pauseScreen');playSound('pause');}
function resumeGame(){hideScreens();mode='game';paused=false;$('hud').classList.remove('hidden');lastTime=performance.now();}
function showToast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1800);}
function showChapterToast(){const el=$('chapterToast');const key=currentLevel===0?'chaseToast':currentLevel===1?'chapterToast1':'chapterToast2';el.querySelector('b').textContent=tr(key);el.classList.add('visible');clearTimeout(chapterToastTimer);chapterToastTimer=setTimeout(()=>el.classList.remove('visible'),2100);}
function updateHud(){if(!$('hudChapter'))return;$('app').classList.toggle('chase-level',currentLevel===0);$('hudChapter').textContent=tr(`level${Math.max(0,currentLevel)}`);const icon=$('hudObjectiveIcon');if(icon)icon.textContent=currentLevel===0?'🐾':currentLevel===1?'✦':'✧';$('hudStars').textContent=currentLevel===0?(dogCaught?tr('dogCaughtLabel'):tr('dogRunning')):currentLevel===1?`${totalStars} / ${TOTAL_STARS}`:tr('gardenSoloLabel');$('hudMemories').textContent=`${totalMemories} / ${TOTAL_MEMORIES}`;$('progressBar').style.width=`${Math.min(100,Math.max(0,(player.x/Math.max(1,worldWidth-110))*100))}%`;const hint=$('gameHint');if(hint){const mobile=window.matchMedia('(pointer:coarse)').matches||W<=750;hint.textContent=currentLevel===0?(mobile?tr('hintChaseMobile'):tr('hintChase')):currentLevel===1?(mobile?tr('hintMobile'):tr('hint')):tr('hintGarden');}}
function ensureAudio(){if(!soundOn)return;try{if(!audioContext){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audioContext=new AC();masterGain=audioContext.createGain();masterGain.gain.value=.46;masterGain.connect(audioContext.destination);}if(audioContext.state==='suspended')audioContext.resume();if(!musicTimer)startMusicLoop();}catch(_){} }
function startMusicLoop(){const notes=[392,523.25,659.25,783.99,659.25,523.25,440,587.33,523.25,659.25,880,783.99,659.25,587.33,440,523.25];const tick=()=>{musicTimer=null;if(soundOn&&audioContext&&masterGain&&audioContext.state==='running'){const now=audioContext.currentTime,freq=notes[musicStep%notes.length];musicStep++;for(const [f,gainAmount] of [[freq,.034],[freq/2,.012]]){const osc=audioContext.createOscillator(),gain=audioContext.createGain(),filter=audioContext.createBiquadFilter();osc.type='sine';osc.frequency.setValueAtTime(f,now);filter.type='lowpass';filter.frequency.value=1400;gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(gainAmount,now+.08);gain.gain.setTargetAtTime(.0001,now+.28,.09);osc.connect(filter);filter.connect(gain);gain.connect(masterGain);osc.start(now);osc.stop(now+.72);}}musicTimer=setTimeout(tick,440);};if(!musicTimer)musicTimer=setTimeout(tick,240);}
function tinyHaptic(duration=12){try{if(navigator.vibrate&&(window.matchMedia('(pointer:coarse)').matches||W<=750))navigator.vibrate(duration);}catch(_){}}
function playSound(kind){if(!soundOn)return;ensureAudio();if(!audioContext||!masterGain)return;const sets={star:[[660,.07],[880,.08],[1100,.13]],jump:[[350,.05],[510,.08]],memory:[[523,.08],[659,.09],[784,.1],[1047,.18]],start:[[392,.08],[523,.1],[659,.14]],menu:[[440,.05],[554,.09]],pause:[[500,.07]],finish:[[523,.12],[659,.12],[784,.12],[1047,.24]]};let t=audioContext.currentTime;for(let i=0;i<(sets[kind]||[]).length;i++){const [freq,dur]=sets[kind][i];const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=kind==='star'?'sine':'triangle';osc.frequency.setValueAtTime(freq,t+i*.075);gain.gain.setValueAtTime(.0001,t+i*.075);gain.gain.exponentialRampToValueAtTime(kind==='finish'?.12:.07,t+i*.075+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+i*.075+dur);osc.connect(gain);gain.connect(masterGain);osc.start(t+i*.075);osc.stop(t+i*.075+dur+.025);}}
function setSound(value){soundOn=value;$('soundToggle').classList.toggle('on',soundOn);$('soundToggle').setAttribute('aria-pressed',String(soundOn));$('soundToggle').querySelector('b').textContent=soundOn?tr('on'):tr('off');$('muteBtn').textContent=soundOn?'♫':'♪';if(masterGain)masterGain.gain.setTargetAtTime(soundOn?.46:0,audioContext.currentTime,.035);if(soundOn)playSound('menu');}
function setLanguage(lang){language=lang;applyLanguage();$('langQuick').textContent=lang==='it'?'IT / EN':'EN / IT';}
function circle(x,y,r,fill,glow=0){ctx.save();if(glow){ctx.shadowBlur=glow;ctx.shadowColor=fill;}ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();}
function starPath(cx,cy,outer,inner,points=5,rot=-Math.PI/2){ctx.beginPath();for(let i=0;i<points*2;i++){const a=rot+i*Math.PI/points,r=i%2?inner:outer;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();}
function drawReferenceBackground(img,t,kind){
 if(!img||!img.complete||!img.naturalWidth)return false;
 const city=kind==='city';
 const bgH=city?H*1.1:H;
 const y=city?-H*.095:0;
 const tileW=bgH*(img.naturalWidth/img.naturalHeight);
 const parallax=cameraX*(city?.22:.15);
 let off=-(parallax%tileW);
 if(off>0)off-=tileW;
 let tileIndex=Math.floor(parallax/tileW);
 for(let x=off-tileW;x<W+tileW*1.5;x+=tileW){
   const idx=tileIndex+Math.round((x-off)/tileW);
   ctx.save();
   // Mirrored repeats reduce visible seams without stretching the supplied reference art.
   if(Math.abs(idx)%2===1){ctx.translate(x+tileW,0);ctx.scale(-1,1);ctx.drawImage(img,0,y,tileW,bgH);}
   else ctx.drawImage(img,x,y,tileW,bgH);
   ctx.restore();
 }
 // Gentle atmospheric tint keeps the platform art integrated with the picture.
 ctx.fillStyle=city?'rgba(10,16,49,.10)':'rgba(16,71,46,.025)';ctx.fillRect(0,0,W,H);
 // Sparse fireflies above the scenery; no animated building windows.
 for(let i=0;i<26;i++){
   const sx=((i*139+W*.06-cameraX*(city?.12:.07))%W+W)%W;
   const sy=H*(.08+(i*37%48)/100);
   const pulse=.45+.45*(.5+.5*Math.sin(t*.0018+i*2.1));
   ctx.globalAlpha=pulse;circle(sx,sy+Math.sin(t*.001+i)*3,i%5===0?1.7:1,city?'#fff0c7':'#fff8dc',i%5===0?8:3);
 }
 ctx.globalAlpha=1;
 const vg=ctx.createRadialGradient(W*.5,H*.46,Math.min(W,H)*.2,W*.5,H*.48,Math.max(W,H)*.8);vg.addColorStop(0,'#03031500');vg.addColorStop(1,city?'#05041c40':'#17332122');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
 return true;
}
function drawBackground(t){
 const pal=getPalette();
 const sceneLevel=['menu','settings','credits','letter'].includes(mode)?-1:currentLevel;
 if(sceneLevel===0&&drawReferenceBackground(backgroundAssets.forest,t,'forest'))return;
 if(sceneLevel===1&&drawReferenceBackground(backgroundAssets.city,t,'city'))return;
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,pal.top);g.addColorStop(.5,pal.mid);g.addColorStop(1,pal.bottom);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const neb=ctx.createRadialGradient(W*.73,H*.19,2,W*.73,H*.19,Math.max(W,H)*.43);neb.addColorStop(0,pal.glow+'40');neb.addColorStop(1,'#00000000');ctx.fillStyle=neb;ctx.fillRect(0,0,W,H);
 const mx=W*.8,my=H*.17,mr=Math.min(W,H)*.053;ctx.save();ctx.shadowBlur=45;ctx.shadowColor=pal.moon;ctx.fillStyle=pal.moon;ctx.beginPath();ctx.arc(mx,my,mr,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle=pal.mid;ctx.beginPath();ctx.arc(mx+mr*.34,my-mr*.23,mr*.91,0,Math.PI*2);ctx.fill();ctx.restore();
 for(let i=0;i<ambient.length;i++){const a=ambient[i],sx=(a.x+Math.sin(t*.0002+a.phase)*15+W-(cameraX*(.025+(i%4)*.015)%W))%W,sy=a.y+Math.sin(t*.001*a.speed+a.phase)*5;ctx.globalAlpha=.25+.55*(.5+.5*Math.sin(t*.0014+a.phase));circle(sx,sy,a.size,'#fff4ed');}ctx.globalAlpha=1;
 for(let layer=0;layer<3;layer++){const base=H*(.53+layer*.09),amp=H*(.035+layer*.015),shift=cameraX*(.05+layer*.075);ctx.beginPath();ctx.moveTo(0,H);for(let sx=-20;sx<=W+25;sx+=12){const xx=sx+shift;const y=base+Math.sin(xx*.004+layer*1.7)*amp+Math.sin(xx*.009+2+layer)*amp*.53+Math.sin(xx*.016+layer*2)*amp*.2;ctx.lineTo(sx,y);}ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=[pal.far,pal.midHill,pal.near][layer];ctx.fill();}
 if(sceneLevel===1)drawStarCity(t);else if(sceneLevel===2)drawSecretGarden(t);else drawDistantVillage(t,false);
 const vg=ctx.createRadialGradient(W*.5,H*.43,Math.min(W,H)*.18,W*.5,H*.47,Math.max(W,H)*.8);vg.addColorStop(0,'#03031500');vg.addColorStop(1,'#05041c40');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}
function drawDistantVillage(t,starry=false){const base=H*.68;const shift=cameraX*.16;const count=Math.ceil((W+300)/148)+4;for(let n=0;n<count;n++){const i=Math.floor(shift/148)-1+n;const wx=i*148+38;const sx=wx-shift;const bw=70+(Math.abs(i*29)%37);const hh=47+(Math.abs(i*47)%77);if(sx+bw<-30||sx>W+30)continue;const wall=ctx.createLinearGradient(sx,base-hh,sx+bw,base);wall.addColorStop(0,starry?'#32315f':'#303255');wall.addColorStop(.55,starry?'#24284e':'#272a4d');wall.addColorStop(1,'#191e3e');ctx.fillStyle=wall;ctx.fillRect(sx,base-hh,bw,hh);ctx.fillStyle=starry?'#454270':'#3c3b68';ctx.beginPath();ctx.moveTo(sx-5,base-hh);ctx.lineTo(sx+bw*.5,base-hh-16-(Math.abs(i)%3)*9);ctx.lineTo(sx+bw+5,base-hh);ctx.closePath();ctx.fill();ctx.fillStyle='#171a38';ctx.fillRect(sx+7,base-hh+8,bw-14,4);for(let row=0;row<Math.floor((hh-14)/18);row++){for(let col=0;col<Math.floor((bw-18)/16);col++){const lit=(i*7+row*3+col*5)%5!==0;ctx.fillStyle=lit?(starry?'#ffe2a0':'#f4bb9e'):'#171b3b';ctx.globalAlpha=lit?.88:.48;ctx.fillRect(sx+9+col*16,base-hh+17+row*18,5,8);}}ctx.globalAlpha=1;if(i%3===0){ctx.fillStyle='#56517b';ctx.fillRect(sx+bw*.48,base-hh-31,6,31);ctx.beginPath();ctx.moveTo(sx+bw*.36,base-hh-30);ctx.lineTo(sx+bw*.51,base-hh-46);ctx.lineTo(sx+bw*.66,base-hh-30);ctx.closePath();ctx.fill();ctx.fillStyle=starry?'#ffda98':'#f4b5cb';circle(sx+bw*.51,base-hh-38,2.3,ctx.fillStyle,5);}}
 // Every building shares one street baseline, keeping the town visually grounded.
 const street=ctx.createLinearGradient(0,base,0,H);street.addColorStop(0,'#242848');street.addColorStop(1,'#12172f');ctx.fillStyle=street;ctx.fillRect(0,base,W,H-base);ctx.fillStyle='#6d6489';ctx.fillRect(0,base,W,2);for(let i=0;i<Math.ceil(W/70)+1;i++){const x=i*70-(cameraX*.22%70);ctx.globalAlpha=.18;ctx.strokeStyle='#a9a0c6';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,base+13);ctx.lineTo(x-13,Math.min(H,base+47));ctx.stroke();}ctx.globalAlpha=1;
 // A far-off castle rests on the same continuous ridge, rather than floating above the town.
 const cx=W*.79-cameraX*.08;ctx.fillStyle=starry?'#25284f':'#292a50';ctx.beginPath();ctx.moveTo(cx-112,base);ctx.lineTo(cx-112,base-65);ctx.lineTo(cx-88,base-65);ctx.lineTo(cx-88,base-95);ctx.lineTo(cx-64,base-95);ctx.lineTo(cx-64,base-124);ctx.lineTo(cx-42,base-124);ctx.lineTo(cx-42,base-85);ctx.lineTo(cx-18,base-85);ctx.lineTo(cx-18,base-111);ctx.lineTo(cx+8,base-111);ctx.lineTo(cx+8,base-72);ctx.lineTo(cx+35,base-72);ctx.lineTo(cx+35,base-103);ctx.lineTo(cx+57,base-103);ctx.lineTo(cx+57,base-56);ctx.lineTo(cx+91,base-56);ctx.lineTo(cx+91,base);ctx.closePath();ctx.fill();for(let i=0;i<9;i++){const wx=cx-94+i*22,wy=base-18-(i%3)*19;ctx.fillStyle=starry?'#ffe8a7':'#f4b9d0';ctx.globalAlpha=.84;ctx.fillRect(wx,wy,4,7);}ctx.globalAlpha=1;
 // small warm bridge lamps form a connected road through the town
 ctx.strokeStyle='#695d81';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,base-2);ctx.quadraticCurveTo(W*.48,base-33,W,base-2);ctx.stroke();for(let i=1;i<8;i++){const x=i*W/8,y=base-2-Math.sin(i/8*Math.PI)*31;circle(x,y,2.4,starry?'#ffe5a1':'#ffc7dc',10);}}
function drawStarCity(t){drawDistantVillage(t,true);const y=H*.47;ctx.save();ctx.globalAlpha=.3;ctx.strokeStyle='#ffdba6';ctx.lineWidth=1.2;for(let i=0;i<7;i++){const x=(i*137+W*.08-cameraX*.07)%W;ctx.beginPath();ctx.moveTo(x,y+(i%3)*28);ctx.quadraticCurveTo(x+40,y-23,x+80,y+(i%3)*28);ctx.stroke();}ctx.restore();for(let i=0;i<14;i++){const x=(i*89+cameraX*.09)%W,y2=H*.32+(i*37%(Math.max(50,H*.25)));ctx.save();ctx.translate(x,y2+Math.sin(t*.0015+i)*5);ctx.shadowBlur=12;ctx.shadowColor='#ffe4a2';ctx.fillStyle='#ffe6ab';starPath(0,0,4.4,1.8,5);ctx.fill();ctx.restore();}}
function drawSecretGarden(t){
 const base=H*.77,shift=cameraX*.14;
 // Evening sky glow sits behind a low garden wall, all anchored to one horizon.
 const glow=ctx.createRadialGradient(W*.68,H*.36,4,W*.68,H*.36,Math.max(W,H)*.62);glow.addColorStop(0,'#f2aeca66');glow.addColorStop(1,'#edb5d000');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 // distant hills and a low, continuous garden wall
 for(let layer=0;layer<2;layer++){ctx.beginPath();ctx.moveTo(0,base);for(let x=0;x<=W+12;x+=12){const xx=x+shift*(.35+layer*.24);const yy=base-100-layer*32+Math.sin(xx*.004+layer)*18+Math.sin(xx*.009+1.4)*9;ctx.lineTo(x,yy);}ctx.lineTo(W,base);ctx.closePath();ctx.fillStyle=layer?'#46556a':'#627087';ctx.fill();}
 const wallY=base-82;const wall=ctx.createLinearGradient(0,wallY,0,base);wall.addColorStop(0,'#667080');wall.addColorStop(1,'#38485a');ctx.fillStyle=wall;ctx.fillRect(0,wallY,W,base-wallY);
 ctx.fillStyle='#a5a5ad';ctx.fillRect(0,wallY,W,4);ctx.fillStyle='#2d394c';ctx.fillRect(0,wallY+5,W,5);
 for(let x=-30-(shift%72);x<W+80;x+=72){ctx.strokeStyle='#aab3ba55';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x,wallY+10);ctx.lineTo(x+8,base-3);ctx.stroke();}
 // Manor houses sit on the same wall line: roofs, façades and illuminated windows.
 for(let i=0;i<5;i++){const bx=i*245+55-shift*.72,bw=128+(i%2)*22,bh=95+(i%3)*18,by=wallY-bh;if(bx+bw<-50||bx>W+50)continue;
   const facade=ctx.createLinearGradient(bx,by,bx+bw,wallY);facade.addColorStop(0,'#58506e');facade.addColorStop(1,'#342e50');ctx.fillStyle=facade;ctx.fillRect(bx,by,bw,wallY-by);
   ctx.fillStyle='#3a2f50';ctx.beginPath();ctx.moveTo(bx-10,by+4);ctx.lineTo(bx+bw*.5,by-31-(i%2)*10);ctx.lineTo(bx+bw+10,by+4);ctx.closePath();ctx.fill();
   ctx.fillStyle='#26243f';ctx.fillRect(bx+bw*.4,wallY-40,22,40);
   for(let r=0;r<2;r++)for(let c=0;c<3;c++){const wx=bx+15+c*34,wy=by+18+r*29;ctx.fillStyle=(i+c+r)%4?'#ffdb9d':'#242540';ctx.globalAlpha=((i+c+r)%4)? .90 : .48;ctx.fillRect(wx,wy,10,15);ctx.fillStyle='#4a3d5a';ctx.fillRect(wx+4,wy,2,15);ctx.fillRect(wx,wy+6,10,2);}
 }
 ctx.globalAlpha=1;
 // Foreground rose hedges and small lamps follow the garden path.
 const hedgeBase=base+16;for(let i=0;i<Math.ceil(W/68)+2;i++){const hx=i*68-(cameraX*.32%68);ctx.fillStyle=i%2?'#294c4a':'#31594f';ctx.beginPath();ctx.ellipse(hx,hedgeBase-5,39,20+(i%3)*2,0,Math.PI,Math.PI*2);ctx.fill();for(let j=0;j<3;j++){const fx=hx-18+j*17,fy=hedgeBase-17-(j%2)*7;circle(fx,fy,3.3,'#f4a5c7',7);circle(fx+1,fy-1,1.2,'#ffe2b4');}}
 for(let i=1;i<Math.ceil(W/230)+2;i++){const lx=i*230-(cameraX*.24%230);ctx.strokeStyle='#342a46';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(lx,base-1);ctx.lineTo(lx,base-49);ctx.stroke();ctx.fillStyle='#f7c887';ctx.shadowBlur=16;ctx.shadowColor='#ffd59a';ctx.beginPath();ctx.roundRect(lx-7,base-57,14,17,4);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#ebd1a4';ctx.lineWidth=1.5;ctx.strokeRect(lx-7,base-57,14,17);}
 // A clear stone walkway runs along the same ground plane; no detached buildings below it.
 const path=ctx.createLinearGradient(0,base-2,0,H);path.addColorStop(0,'#7b7488');path.addColorStop(.18,'#51465f');path.addColorStop(1,'#26273e');ctx.fillStyle=path;ctx.fillRect(0,base-4,W,H-base+4);ctx.fillStyle='#c9adb8';ctx.fillRect(0,base-5,W,3);
 for(let x=-(cameraX*.48%92);x<W+92;x+=92){ctx.strokeStyle='#c8b5c555';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,base+2);ctx.lineTo(x+28,Math.min(H,base+45));ctx.stroke();}
 // Floating fireflies, kept above the path rather than pretending to be architecture.
 for(let i=0;i<22;i++){const fx=(i*87+cameraX*.045)%W,fy=H*.35+(i*43%Math.max(55,H*.3));circle(fx+Math.sin(t*.0018+i)*6,fy+Math.cos(t*.0015+i)*5,1.7,'#ffe5b5',9);}
}
function drawPlatform(q,t){
 const sx=q.x-cameraX;if(sx+q.w<-30||sx>W+30)return;
 const top=q.y,cityStyle=currentLevel===1;
 const bottom=cityStyle?H+14:Math.min(H+12,Math.max(top+58,H*.9));
 // City rooftops are the roofs of buildings whose facades continue down to the street.
 if(!q.ground&&q.w>70&&cityStyle){
   const left=sx+5,width=q.w-10;
   const facade=ctx.createLinearGradient(left,top,left+width,bottom);
   facade.addColorStop(0,'#39385f');facade.addColorStop(.42,'#282c4e');facade.addColorStop(1,'#171d38');
   ctx.fillStyle=facade;ctx.fillRect(left,top+6,width,Math.max(0,bottom-top-6));
   for(let yy=top+22;yy<bottom-10;yy+=34){
     for(let xx=left+12;xx<left+width-9;xx+=37){
       const worldWindowX=xx+cameraX;const lit=((Math.floor(worldWindowX/7)+Math.floor(yy/5)+q.id)%5)!==0;
       ctx.fillStyle=lit?(currentLevel===1?'#ffe0a5':'#f3c4a4'):'#141a34';
       ctx.globalAlpha=lit?.90:.48;
       ctx.fillRect(xx,yy,6,10);ctx.fillStyle='#141a34';ctx.fillRect(xx-2,yy+9,10,2);
     }
   }
   ctx.globalAlpha=1;
   // Stone ledges and narrow vertical masonry lines help the building read as one structure.
   ctx.fillStyle='#151a35';ctx.fillRect(left,bottom-8,width,8);
   ctx.strokeStyle='#a7a1c055';ctx.lineWidth=1;
   for(let xx=left+22;xx<left+width;xx+=52){ctx.beginPath();ctx.moveTo(xx,top+10);ctx.lineTo(xx,bottom-10);ctx.stroke();}
 }else if(!q.ground&&q.w>70){
   // The garden platforms are broad, tapered rock islands rather than disconnected buildings.
   const rock=ctx.createLinearGradient(sx,top,sx+q.w,bottom);rock.addColorStop(0,'#4e6b70');rock.addColorStop(.45,'#344d5a');rock.addColorStop(1,'#1d3347');
   ctx.fillStyle=rock;ctx.beginPath();ctx.moveTo(sx+7,top+5);ctx.lineTo(sx+q.w-7,top+5);ctx.lineTo(sx+q.w*.86,bottom);ctx.lineTo(sx+q.w*.18,bottom);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#a2c3ab55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx+q.w*.25,top+16);ctx.lineTo(sx+q.w*.28,top+Math.min(74,bottom-top-10));ctx.moveTo(sx+q.w*.75,top+12);ctx.lineTo(sx+q.w*.7,top+Math.min(56,bottom-top-10));ctx.stroke();
   for(let i=0;i<Math.ceil(q.w/80);i++){const vineX=sx+25+i*80;ctx.strokeStyle='#7dab8d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(vineX,top+5);ctx.quadraticCurveTo(vineX-8,top+24,vineX+3,top+42);ctx.stroke();}
 }else if(!q.ground){
   const col=ctx.createLinearGradient(sx,top,sx,bottom);col.addColorStop(0,'#748e86');col.addColorStop(1,'#243d48');ctx.fillStyle=col;ctx.fillRect(sx+18,top+7,12,Math.max(0,bottom-top-7));ctx.fillRect(sx+q.w-30,top+7,12,Math.max(0,bottom-top-7));
 }
 // The walkable top has rounded edges, soft depth and a continuous highlight.
 ctx.save();ctx.shadowBlur=17;ctx.shadowColor='#08071d77';ctx.shadowOffsetY=8;
 let grad;
 if(cityStyle&&q.ground){
   grad=ctx.createLinearGradient(sx,top,sx,H+80);grad.addColorStop(0,'#454866');grad.addColorStop(.12,'#303653');grad.addColorStop(.5,'#202b47');grad.addColorStop(1,'#121c33');
 }else if(!cityStyle&&q.ground){
   grad=ctx.createLinearGradient(0,top,0,H+90);grad.addColorStop(0,'#648c58');grad.addColorStop(.045,'#426b49');grad.addColorStop(.15,'#315540');grad.addColorStop(.38,'#244639');grad.addColorStop(.72,'#1b3530');grad.addColorStop(1,'#13282a');
 }else{
   grad=ctx.createLinearGradient(sx,top,sx,top+40);grad.addColorStop(0,cityStyle?'#aaa0b8':'#7da091');grad.addColorStop(.14,cityStyle?'#625e82':getPalette().ground);grad.addColorStop(1,cityStyle?'#1b253f':'#1b332e');
 }
 ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(sx,top,q.w,q.ground?H-top+160:34,q.ground?[12,12,0,0]:[7,7,4,4]);ctx.fill();ctx.restore();
 const topGrad=ctx.createLinearGradient(sx,top-2,sx,top+10);topGrad.addColorStop(0,cityStyle?'#ead4c9':'#d0e4b4');topGrad.addColorStop(1,cityStyle?'#958aa7':getPalette().grass);
 ctx.fillStyle=topGrad;ctx.beginPath();ctx.roundRect(sx,top,q.w,8,4);ctx.fill();ctx.fillStyle='#ffffff22';ctx.fillRect(sx+10,top+3,Math.max(0,q.w-20),1.3);
 if(cityStyle){
   ctx.strokeStyle='#c8bacf44';ctx.lineWidth=1;for(let xx=sx+25;xx<sx+q.w-8;xx+=34){ctx.beginPath();ctx.moveTo(xx,top+14);ctx.lineTo(xx-5,top+28);ctx.stroke();}
   if(q.id%3===0&&q.w>130){const lx=sx+q.w*.72;ctx.strokeStyle='#39304e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(lx,top);ctx.lineTo(lx,top-23);ctx.stroke();circle(lx,top-27,4,'#ffd5a1',12);circle(lx,top-27,1.5,'#fff4cd',5);}
 }else{for(let i=0;i<Math.ceil(q.w/58);i++){drawGrassTuft(sx+17+i*58,top,t,i);if(i%2===0)drawFlower(sx+36+i*58,top+1,.65,t);}}
 if(q.ground){
   if(cityStyle){
     // The starting rooftop has a full façade down to the screen edge, with several floors of windows.
     ctx.fillStyle='#171f37';ctx.fillRect(sx,top+13,q.w,H-top+140);
     ctx.strokeStyle='#8f93b35a';ctx.lineWidth=1.2;
     for(let yy=top+20;yy<H+100;yy+=49){ctx.beginPath();ctx.moveTo(sx+4,yy);ctx.lineTo(sx+q.w-4,yy);ctx.stroke();}
     for(let xx=sx+18;xx<sx+q.w-8;xx+=48){ctx.strokeStyle='#9b9ab04a';ctx.beginPath();ctx.moveTo(xx,top+14);ctx.lineTo(xx,H+100);ctx.stroke();}
     for(let row=0,yy=top+27;yy<H+70;row++,yy+=45){
       for(let col=0,xx=sx+24;xx<sx+q.w-12;col++,xx+=46){
         const lit=((Math.floor((xx+cameraX)/46)+row*3+q.id)%5)!==0;
         if(lit){ctx.save();ctx.shadowBlur=8;ctx.shadowColor='#ffcf91';ctx.fillStyle='#ffd9a0';ctx.globalAlpha=.66;ctx.fillRect(xx,yy,7,12);ctx.restore();}
         else{ctx.fillStyle='#111a30';ctx.fillRect(xx,yy,7,12);}
       }
     }
     // A few stone ledges and drainpipes ground the wall visually.
     for(let xx=sx+12;xx<sx+q.w;xx+=94){ctx.fillStyle='#6d708c';ctx.globalAlpha=.34;ctx.fillRect(xx,top+17,2,H-top+80);ctx.globalAlpha=1;}
   }else{
     for(let i=0;i<Math.ceil(q.w/58);i++){drawGrassTuft(sx+17+i*58,top,t,i);if(i%2===0)drawFlower(sx+36+i*58,top+1,.75,t);}
     // Subtle layered earth, tiny stones and roots under the continuous forest path.
     ctx.save();ctx.beginPath();ctx.rect(sx,top+12,q.w,Math.max(0,H-top-12));ctx.clip();
     const visibleH=Math.max(1,H-top-20);
     for(let i=0;i<Math.ceil(q.w/64);i++){
       const xx=sx+i*64+((i*17)%21),yy=top+23+((i*37)%visibleH);
       ctx.strokeStyle=i%3===0?'#9bc17b35':'#081f2638';ctx.lineWidth=i%4===0?2:1.2;ctx.beginPath();ctx.moveTo(xx,yy);ctx.quadraticCurveTo(xx+10,yy+3,xx+18,yy+((i%2)?9:-7));ctx.stroke();
       if(i%3===0){ctx.fillStyle='#b0c58a42';ctx.beginPath();ctx.ellipse(xx+27,yy+14,3.5,1.8,.18,0,Math.PI*2);ctx.fill();}
     }
     // Fine horizontal soil layers provide texture instead of a flat navy void.
     for(let row=0;row<4;row++){const yy=top+37+row*37;ctx.strokeStyle=['#94b27a18','#0c25251f','#a0b98216','#0d24241c'][row];ctx.lineWidth=row===0?2:1;ctx.beginPath();ctx.moveTo(sx,yy);ctx.bezierCurveTo(sx+q.w*.24,yy-7,sx+q.w*.46,yy+6,sx+q.w*.68,yy);ctx.quadraticCurveTo(sx+q.w*.88,yy-4,sx+q.w,yy+2);ctx.stroke();}
     ctx.restore();
   }
 }
}
function drawGrassTuft(x,y,t,seed=0){ctx.save();ctx.strokeStyle=seed%2?'#d0e5b0':'#8fc3a1';ctx.lineCap='round';ctx.lineWidth=1.8;for(let i=0;i<3;i++){const sway=Math.sin(t*.002+seed+i)*2.4;ctx.beginPath();ctx.moveTo(x,y+4);ctx.quadraticCurveTo(x-4+sway,y-4,x-5-i*2+sway,y-10-i%2*3);ctx.stroke();}ctx.restore();}
function drawFlower(x,y,s,t){ctx.save();ctx.translate(x,y+Math.sin(t*.002+x)*.8);for(let i=0;i<5;i++){ctx.rotate(Math.PI*2/5);ctx.beginPath();ctx.ellipse(0,-5*s,2.8*s,5*s,0,0,Math.PI*2);ctx.fillStyle=i%2?'#ffd6e8':'#ffafd4';ctx.fill();}circle(0,0,2.4*s,'#ffe9ad');ctx.restore();}
function drawCollectible(s,t){const x=s.x-cameraX,y=s.y+Math.sin(t*.003+s.phase)*5;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.001+s.phase)*.12);ctx.shadowBlur=24;ctx.shadowColor='#ffdf95';const grad=ctx.createRadialGradient(-3,-5,1,0,0,17);grad.addColorStop(0,'#fff8ce');grad.addColorStop(.5,'#ffd785');grad.addColorStop(1,'#ff8dc8');ctx.fillStyle=grad;starPath(0,0,12.7,6,5,-Math.PI/2);ctx.fill();ctx.shadowBlur=0;circle(0,0,2,'#fffdf0');ctx.restore();}
function drawMemory(m,t){if(m.taken)return;const x=m.x-cameraX,y=m.y+Math.sin(t*.002+m.x)*5;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.001)*.08);ctx.shadowBlur=22;ctx.shadowColor='#ff9ecb';ctx.fillStyle='#f5b4d7';ctx.beginPath();ctx.moveTo(0,9);ctx.bezierCurveTo(-21,-4,-10,-17,0,-7);ctx.bezierCurveTo(10,-17,21,-4,0,9);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff2f9';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(0,7);ctx.stroke();ctx.restore();}
function drawGate(t){
 const d=levelData[currentLevel],x=d.goal-cameraX;if(x<-140||x>W+150)return;
 const base=platforms[platforms.length-1].y;
 if(currentLevel===2){
   const top=base-154;
   // Stone jambs and rounded arch are rooted in the final garden path.
   ctx.save();ctx.shadowBlur=26;ctx.shadowColor='#ffc4d9';ctx.fillStyle='#6d647b';ctx.beginPath();ctx.moveTo(x-57,base);ctx.lineTo(x-57,top+40);ctx.quadraticCurveTo(x-57,top-5,x,top-5);ctx.quadraticCurveTo(x+57,top-5,x+57,top+40);ctx.lineTo(x+57,base);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
   ctx.strokeStyle='#d5bdc6';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-47,base);ctx.lineTo(x-47,top+41);ctx.quadraticCurveTo(x-47,top+7,x,top+7);ctx.quadraticCurveTo(x+47,top+7,x+47,top+41);ctx.lineTo(x+47,base);ctx.stroke();
   // Warm wood door, visible panels and brass handle.
   const door=ctx.createLinearGradient(x-37,0,x+37,0);door.addColorStop(0,'#3a2a40');door.addColorStop(.45,'#76516d');door.addColorStop(1,'#3d2d42');ctx.fillStyle=door;ctx.beginPath();ctx.moveTo(x-37,base);ctx.lineTo(x-37,top+43);ctx.quadraticCurveTo(x-37,top+20,x,top+20);ctx.quadraticCurveTo(x+37,top+20,x+37,top+43);ctx.lineTo(x+37,base);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#d8a8bc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,top+27);ctx.lineTo(x,base-8);ctx.stroke();ctx.strokeStyle='#b990a8';ctx.lineWidth=1.6;ctx.strokeRect(x-28,top+50,19,40);ctx.strokeRect(x+9,top+50,19,40);ctx.strokeRect(x-28,top+99,19,base-top-108);ctx.strokeRect(x+9,top+99,19,base-top-108);
   circle(x+24,base-66,3.5,'#ffdf9e',10);circle(x+24,base-66,1.3,'#fff7d0');
   // Lanterns and rose vines decorate the door frame.
   for(const side of [-1,1]){const vx=x+side*59;ctx.strokeStyle='#496b58';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(vx,base);ctx.bezierCurveTo(vx-side*10,base-40,vx+side*7,top+70,vx,top+31);ctx.stroke();for(let k=0;k<4;k++){const ry=base-24-k*30;circle(vx+side*(k%2?8:-7),ry,5,k%2?'#f6a1c8':'#df6f9f',5);circle(vx+side*(k%2?8:-7),ry,1.5,'#ffe0b4');}ctx.strokeStyle='#3a2d44';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(vx-side*10,top+18);ctx.lineTo(vx-side*10,top+44);ctx.stroke();ctx.fillStyle='#ffd79a';ctx.shadowBlur=15;ctx.shadowColor='#ffd79a';ctx.beginPath();ctx.roundRect(vx-side*17,top+39,14,16,4);ctx.fill();ctx.shadowBlur=0;}
   // Soft light leaking through the closed door foreshadows the confession scene.
   ctx.globalAlpha=.22+.12*Math.sin(t*.003);ctx.fillStyle='#ffe0bc';ctx.beginPath();ctx.ellipse(x,base-72,25,72,0,0,Math.PI*2);ctx.fill();ctx.restore();
   return;
 }
 const top=base-104+Math.sin(t*.002)*3;ctx.save();ctx.shadowBlur=34;ctx.shadowColor=getPalette().glow;ctx.strokeStyle=getPalette().glow;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-35,base);ctx.lineTo(x-35,top+28);ctx.quadraticCurveTo(x-35,top-15,x,top-15);ctx.quadraticCurveTo(x+35,top-15,x+35,top+28);ctx.lineTo(x+35,base);ctx.stroke();ctx.lineWidth=1.5;ctx.strokeStyle='#fff5e8';ctx.beginPath();ctx.moveTo(x-25,base);ctx.lineTo(x-25,top+29);ctx.quadraticCurveTo(x-25,top-5,x,top-5);ctx.quadraticCurveTo(x+25,top-5,x+25,top+29);ctx.lineTo(x+25,base);ctx.stroke();ctx.restore();for(let i=0;i<4;i++){circle(x+Math.sin(t*.001+i)*49,top+Math.cos(t*.0016+i)*29,2.5,'#ffefbc',12);}
}
function drawHero(t){
 if(currentLevel===2){drawAnas(t);return;}
 const im=spriteAssets.cat;
 if(!im.complete||!im.naturalWidth){drawHeroFallback(t);return;}
 const x=player.x-cameraX,y=player.y;
 const run=player.onGround&&Math.abs(player.vx)>.45?Math.sin(t*.024)*1.9:0;
 const bob=player.onGround?Math.abs(Math.sin(t*.024))*1.15:Math.max(-3,Math.min(3,-player.vy*.16));
 ctx.save();ctx.translate(x+player.w/2,y+player.h/2+bob);ctx.scale(player.face,1);
 if(player.invuln>0&&Math.floor(t/75)%2===0)ctx.globalAlpha=.55;
 ctx.save();ctx.globalAlpha*=.22;ctx.fillStyle='#080a1b';ctx.beginPath();ctx.ellipse(0,28,24,5.2,0,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.rotate(player.onGround?Math.sin(t*.024)*.012:Math.sign(player.vx||1)*-.018);
 ctx.drawImage(im,-57,-55+run*.16,114,82);
 ctx.restore();
}
function drawHeroFallback(t){if(currentLevel===2){drawAnas(t);return;}const x=player.x-cameraX,y=player.y;const run=player.onGround&&Math.abs(player.vx)>.45?Math.sin(t*.024)*4.4:0;const bob=player.onGround?Math.abs(Math.sin(t*.024))*1.1:0;ctx.save();ctx.translate(x+player.w/2,y+player.h/2+bob);ctx.scale(player.face,1);if(player.invuln>0&&Math.floor(t/75)%2===0)ctx.globalAlpha=.55;
 // Side-view, warm espresso kitten with a natural silhouette and a little scarf.
 ctx.save();ctx.globalAlpha*=.23;ctx.fillStyle='#090b1b';ctx.beginPath();ctx.ellipse(0,player.h/2+3,23,5.5,0,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.strokeStyle='#38252c';ctx.lineCap='round';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-13,0);ctx.bezierCurveTo(-27,1,-34,-7+Math.sin(t*.007)*3,-39,-17+Math.sin(t*.008)*4);ctx.bezierCurveTo(-43,-24,-34,-30+Math.sin(t*.008)*4,-28,-26);ctx.stroke();ctx.strokeStyle='#8a5946';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-13,0);ctx.bezierCurveTo(-27,1,-34,-7+Math.sin(t*.007)*3,-39,-17+Math.sin(t*.008)*4);ctx.stroke();
 const fur=ctx.createLinearGradient(-20,-24,22,19);fur.addColorStop(0,'#88563f');fur.addColorStop(.27,'#684332');fur.addColorStop(.66,'#442c2e');fur.addColorStop(1,'#2b2029');
 // body is horizontal, like a real platform-game runner rather than a front-facing doll
 ctx.fillStyle=fur;ctx.beginPath();ctx.ellipse(-1,2,20,14,-.07,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9a6949';ctx.globalAlpha=.48;ctx.beginPath();ctx.ellipse(3,4,10,7,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=player.invuln>0&&Math.floor(t/75)%2===0?.55:1;
 // Four compact legs, alternating during the run cycle.
 ctx.lineCap='round';ctx.lineWidth=6.3;ctx.strokeStyle='#38252c';ctx.beginPath();ctx.moveTo(-11,8);ctx.lineTo(-14+run,21);ctx.moveTo(-2,9);ctx.lineTo(-1-run,21);ctx.moveTo(9,8);ctx.lineTo(11-run,21);ctx.moveTo(14,5);ctx.lineTo(17+run,19);ctx.stroke();ctx.fillStyle='#9b7356';ctx.beginPath();ctx.ellipse(-15+run,22,5.4,2.8,0,0,Math.PI*2);ctx.ellipse(-1-run,22,5.4,2.8,0,0,Math.PI*2);ctx.ellipse(11-run,22,5.4,2.8,0,0,Math.PI*2);ctx.ellipse(18+run,20,5.3,2.8,0,0,Math.PI*2);ctx.fill();
 // Compact head and small, slightly rounded ears.
 ctx.fillStyle=fur;ctx.beginPath();ctx.ellipse(13,-17,15.5,14.5,.08,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(1,-26);ctx.quadraticCurveTo(-2,-39,5,-39);ctx.quadraticCurveTo(12,-36,12,-27);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(16,-28);ctx.quadraticCurveTo(23,-39,29,-33);ctx.lineTo(27,-22);ctx.closePath();ctx.fill();
 ctx.fillStyle='#ba827d';ctx.beginPath();ctx.moveTo(4,-34);ctx.lineTo(7,-29);ctx.lineTo(9,-30);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(21,-31);ctx.lineTo(26,-35);ctx.lineTo(25,-28);ctx.closePath();ctx.fill();
 // Side-facing amber eye, tiny muzzle and whiskers.
 ctx.fillStyle='#efbb67';ctx.beginPath();ctx.ellipse(18,-19,3.4,4.1,-.1,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2b2026';ctx.beginPath();ctx.ellipse(19,-19,1.15,3.2,0,0,Math.PI*2);ctx.fill();circle(18,-20.3,.85,'#fff4d9');
 ctx.fillStyle='#b87b65';ctx.beginPath();ctx.ellipse(25,-12.5,7,4.8,-.08,0,Math.PI*2);ctx.fill();ctx.fillStyle='#34212a';ctx.beginPath();ctx.ellipse(31,-13.5,1.7,1.4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d4b6aa';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(25,-12);ctx.quadraticCurveTo(20,-7,16,-10);ctx.moveTo(26,-12);ctx.quadraticCurveTo(24,-7,22,-8);ctx.moveTo(26,-13);ctx.lineTo(36,-16);ctx.moveTo(25,-11);ctx.lineTo(36,-10);ctx.stroke();
 // Berry scarf with a small golden charm.
 ctx.fillStyle='#c76d9b';ctx.beginPath();ctx.moveTo(-2,-5);ctx.quadraticCurveTo(11,3,25,-5);ctx.lineTo(22,2);ctx.quadraticCurveTo(10,8,-1,1);ctx.closePath();ctx.fill();ctx.fillStyle='#944b79';ctx.beginPath();ctx.moveTo(3,3);ctx.lineTo(11,5+Math.sin(t*.009)*1.2);ctx.lineTo(9,15+Math.sin(t*.009)*1.6);ctx.lineTo(2,8);ctx.closePath();ctx.fill();starPath(4,-3,2.2,1,4,Math.PI/4);ctx.fillStyle='#ffe4ab';ctx.fill();ctx.restore();}
function drawAnas(t){
 const im=spriteAssets.anas;
 if(!im.complete||!im.naturalWidth){drawAnasFallback(t);return;}
 const x=player.x-cameraX,y=player.y;
 const moving=player.onGround&&Math.abs(player.vx)>.45;
 const runPhase=Math.sin(t*.028);
 const bob=player.onGround?Math.abs(runPhase)*(moving?1.7:.6):Math.max(-2.5,Math.min(2.5,-player.vy*.12));
 ctx.save();ctx.translate(x+player.w/2,y+player.h/2+bob);ctx.scale(player.face,1);
 if(player.invuln>0&&Math.floor(t/75)%2===0)ctx.globalAlpha=.55;
 // A soft, grounded shadow keeps his feet visually attached to the walkway.
 ctx.save();ctx.globalAlpha*=.22;ctx.fillStyle='#080a1b';ctx.beginPath();ctx.ellipse(0,25,22,4.4,0,0,Math.PI*2);ctx.fill();ctx.restore();
 // Keep the 2:3 portrait ratio: the previous wider stretch made his legs look splayed.
 ctx.rotate(player.onGround?(moving?runPhase*.014:Math.sin(t*.012)*.003):Math.sign(player.vx||1)*-.008);
 ctx.drawImage(im,-55,-134,110,165);
 ctx.restore();
}
function drawAnasFallback(t){const x=player.x-cameraX,y=player.y;const running=player.onGround&&Math.abs(player.vx)>.45?Math.sin(t*.025)*5:0;const bob=player.onGround?Math.abs(Math.sin(t*.025))*1.2:0;ctx.save();ctx.translate(x+player.w/2,y+player.h/2+bob);ctx.scale(player.face,1);if(player.invuln>0&&Math.floor(t/75)%2===0)ctx.globalAlpha=.55;
 ctx.save();ctx.globalAlpha=.25;ctx.fillStyle='#070b20';ctx.beginPath();ctx.ellipse(0,player.h/2+3,22,5.5,0,0,Math.PI*2);ctx.fill();ctx.restore();
 // Shoes and moving legs.
 ctx.strokeStyle='#263149';ctx.lineCap='round';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-7,12);ctx.lineTo(-10+running,23);ctx.moveTo(7,12);ctx.lineTo(10-running,23);ctx.stroke();ctx.fillStyle='#d4c2ce';ctx.beginPath();ctx.ellipse(-12+running,24,7,3.3,0,0,Math.PI*2);ctx.ellipse(11-running,24,7,3.3,0,0,Math.PI*2);ctx.fill();
 // Natural proportions: jacket, trousers, arms and a messenger-bag strap.
 const jacket=ctx.createLinearGradient(-15,-24,14,20);jacket.addColorStop(0,'#6488a8');jacket.addColorStop(.55,'#405c7d');jacket.addColorStop(1,'#26374f');ctx.fillStyle=jacket;ctx.beginPath();ctx.moveTo(-13,-20);ctx.quadraticCurveTo(-16,-24,-9,-26);ctx.lineTo(8,-26);ctx.quadraticCurveTo(15,-22,14,-14);ctx.lineTo(12,13);ctx.lineTo(-12,13);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#b0b9ce';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(1,-23);ctx.lineTo(1,11);ctx.stroke();ctx.fillStyle='#ecb7cf';ctx.beginPath();ctx.moveTo(-4,-7);ctx.lineTo(1,-2);ctx.lineTo(6,-7);ctx.lineTo(3,0);ctx.lineTo(-1,0);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#31435f';ctx.lineCap='round';ctx.lineWidth=6.5;ctx.beginPath();ctx.moveTo(-11,-17);ctx.lineTo(-17,-3+running*.35);ctx.moveTo(11,-17);ctx.lineTo(17,-4-running*.35);ctx.stroke();ctx.strokeStyle='#d6a186';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-17,-3+running*.35);ctx.lineTo(-15,2+running*.35);ctx.moveTo(17,-4-running*.35);ctx.lineTo(19,1-running*.35);ctx.stroke();
 // Satchel and strap.
 ctx.strokeStyle='#a87863';ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(-9,-24);ctx.lineTo(11,4);ctx.stroke();ctx.fillStyle='#8b665c';ctx.beginPath();ctx.roundRect(-16,1,10,11,3);ctx.fill();ctx.strokeStyle='#e0bba1';ctx.lineWidth=1;ctx.strokeRect(-14,3,6,5);
 // Warm face, side-swept dark hair, expressive eyes.
 ctx.fillStyle='#d9a487';ctx.beginPath();ctx.roundRect(-6,-35,12,12,4);ctx.fill();ctx.fillStyle='#e6b395';ctx.beginPath();ctx.ellipse(1,-40,12.4,15,0,0,Math.PI*2);ctx.fill();
 const hair=ctx.createLinearGradient(-11,-56,12,-31);hair.addColorStop(0,'#4d3540');hair.addColorStop(.65,'#2b2434');hair.addColorStop(1,'#191d2b');ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-12,-42);ctx.quadraticCurveTo(-17,-57,-4,-59);ctx.quadraticCurveTo(11,-64,15,-49);ctx.lineTo(14,-41);ctx.lineTo(6,-48);ctx.lineTo(-2,-46);ctx.lineTo(-9,-39);ctx.closePath();ctx.fill();
 ctx.fillStyle='#3b2832';ctx.beginPath();ctx.ellipse(6,-40,1.6,2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0d8';ctx.beginPath();ctx.arc(5.5,-40.7,.55,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#9f626e';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(7,-33);ctx.quadraticCurveTo(10,-31,12,-33);ctx.stroke();ctx.restore();}
function drawDog(t){
 const im=spriteAssets.dog;
 if(!im.complete||!im.naturalWidth){drawDogFallback(t);return;}
 const x=dog.x-cameraX,y=dog.y,dodge=dog.dodgeTimer>0;
 ctx.save();ctx.translate(x+(dog.dodgeSide||0),y);ctx.rotate(dodge?Math.sin(t*.04)*.045:Math.sin(t*.009)*.008);ctx.scale(dog.face||1,1);
 const bounce=Math.abs(Math.sin(t*(dodge?.04:.022)))*(dodge?2.4:1.5);
 if(dodge)ctx.translate(0,-bounce);
 ctx.globalAlpha=.23;ctx.fillStyle='#080a1b';ctx.beginPath();ctx.ellipse(0,1,24,4.5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 ctx.drawImage(im,-58,-91+(dodge?3:0),116,86);
 ctx.restore();
}
function drawDogFallback(t){const x=dog.x-cameraX,y=dog.y;const dodge=dog.dodgeTimer>0;ctx.save();ctx.translate(x+(dog.dodgeSide||0),y);ctx.rotate(dodge?Math.sin(t*.04)*.055:Math.sin(t*.009)*.012);ctx.scale(dog.face||1,1);const run= Math.sin(t*(dodge?.04:.022))* (dodge?5.2:3.3);
 // A warm caramel storybook dog; this is not Emy.
 ctx.strokeStyle='#a95f47';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-14,-23);ctx.bezierCurveTo(-27,-30+Math.sin(t*.015)*5,-31,-18+Math.sin(t*.015)*6,-24,-15+Math.sin(t*.015)*5);ctx.stroke();ctx.strokeStyle='#e8a878';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-15,-23);ctx.quadraticCurveTo(-24,-26+Math.sin(t*.015)*5,-23,-16+Math.sin(t*.015)*5);ctx.stroke();
 const coat=ctx.createLinearGradient(-20,-35,20,-4);coat.addColorStop(0,'#ffdcaa');coat.addColorStop(.52,'#e9a66f');coat.addColorStop(1,'#bc704e');ctx.fillStyle=coat;ctx.beginPath();ctx.ellipse(-1,-18,20,13,-.06,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0d4';ctx.beginPath();ctx.ellipse(6,-15,10,10,-.12,0,Math.PI*2);ctx.fill();
 // legs have a small run cycle and rounded paws
 ctx.strokeStyle='#b56d4e';ctx.lineCap='round';ctx.lineWidth=6.5;ctx.beginPath();ctx.moveTo(-10,-12);ctx.lineTo(-12+run,-2);ctx.moveTo(0,-10);ctx.lineTo(2-run,-2);ctx.moveTo(13,-12);ctx.lineTo(14+run,-2);ctx.stroke();ctx.fillStyle='#f4c797';ctx.beginPath();ctx.ellipse(-12+run,-2,6,3,0,0,Math.PI*2);ctx.ellipse(2-run,-2,6,3,0,0,Math.PI*2);ctx.ellipse(14+run,-2,6,3,0,0,Math.PI*2);ctx.fill();
 // round head and one perked ear, one floppier ear
 ctx.fillStyle=coat;ctx.beginPath();ctx.ellipse(14,-34,15,14,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(2,-42);ctx.quadraticCurveTo(-8,-60,4,-56);ctx.quadraticCurveTo(14,-52,13,-42);ctx.fill();ctx.fillStyle='#bf7356';ctx.beginPath();ctx.moveTo(4,-52);ctx.quadraticCurveTo(0,-55,5,-44);ctx.closePath();ctx.fill();ctx.fillStyle='#c27c59';ctx.beginPath();ctx.moveTo(22,-43);ctx.quadraticCurveTo(39,-52,38,-37);ctx.quadraticCurveTo(35,-27,24,-31);ctx.closePath();ctx.fill();
 // cream muzzle, big warm eye and tiny nose
 ctx.fillStyle='#fff0d4';ctx.beginPath();ctx.ellipse(22,-30,10,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4c2c2e';ctx.beginPath();ctx.arc(17,-37,2.1,0,Math.PI*2);ctx.fill();circle(17.2,-37.8,.7,'#fff9df');ctx.beginPath();ctx.ellipse(29,-30,2.6,2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8d4f48';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(26,-27);ctx.quadraticCurveTo(21,-23,17,-27);ctx.stroke();
 // teal collar distinguishes this dog from the black dog, Emy
 ctx.strokeStyle='#8be5d9';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(5,-22);ctx.quadraticCurveTo(13,-17,21,-23);ctx.stroke();ctx.fillStyle='#fff0c0';starPath(14,-18,3.2,1.5,4,Math.PI/4);ctx.fill();ctx.restore();}
function drawAtmosphericDetails(t){
 // Small, deterministic details make both chapters feel alive without cluttering the path.
 const forest=currentLevel===0;
 const count=forest?15:19;
 for(let i=0;i<count;i++){
   const x=((i*117 + t*(forest?.009:.014))%(W+36))-18;
   const y=H*(forest?.22:.16)+((i*47)%(Math.max(70,H*.48)))+Math.sin(t*.0015+i*1.7)*6;
   const pulse=.45+.45*(.5+.5*Math.sin(t*.002+i*2.2));
   ctx.save();ctx.globalAlpha=pulse;
   if(forest && i%4===0){
     // tiny glowing moths with two translucent wings
     ctx.translate(x,y);ctx.rotate(Math.sin(t*.001+i)*.18);ctx.fillStyle='#f8f1ff';ctx.shadowBlur=9;ctx.shadowColor='#d8f8ff';
     ctx.beginPath();ctx.ellipse(-3,-1,3.1,2.1,-.4,0,Math.PI*2);ctx.ellipse(3,-1,3.1,2.1,.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe1a6';ctx.fillRect(-.7,-2,1.4,5);
   }else if(!forest && i%5===0){
     ctx.translate(x,y);ctx.rotate(t*.0007+i);ctx.fillStyle='#ffb9dd';ctx.shadowBlur=7;ctx.shadowColor='#ffacd7';
     ctx.beginPath();ctx.ellipse(0,0,2.3,5.2,.55,0,Math.PI*2);ctx.fill();
   }else{
     ctx.shadowBlur=10;ctx.shadowColor=forest?'#d6ffcf':'#ffe7b4';ctx.fillStyle=forest?'#e6ffd0':'#fff0bd';ctx.beginPath();ctx.arc(x,y,i%4===0?1.8:1.15,0,Math.PI*2);ctx.fill();
     if(i%6===0){ctx.strokeStyle='#fff7df';ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}
   }
   ctx.restore();
 }
 // a few petals drift through the city, while the black puppy's bow adds a pink accent below
 if(!forest){for(let i=0;i<4;i++){const x=(i*161-t*.018+W+20)%(W+20)-10,y=H*.27+i*H*.105+Math.sin(t*.001+i)*10;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.001+i)*.65);ctx.globalAlpha=.42;ctx.fillStyle='#ffb6d8';ctx.beginPath();ctx.ellipse(0,0,2.2,5.1,.25,0,Math.PI*2);ctx.fill();ctx.restore();}}
}
function drawScene(t){drawBackground(t);drawAtmosphericDetails(t);platforms.forEach(q=>drawPlatform(q,t));stars.forEach(s=>{if(!s.taken)drawCollectible(s,t)});memories.forEach(m=>drawMemory(m,t));drawGate(t);if(currentLevel===0||currentLevel===1)drawDog(t);drawHero(t);drawParticles(t);}
function spawnParticles(x,y,color,n=12){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*4.4,vy:(Math.random()-.8)*4,life:35+Math.random()*20,max:55,size:1.5+Math.random()*3,color});}
function drawParticles(t){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.025;p.life--;ctx.globalAlpha=Math.max(0,p.life/p.max);circle(p.x-cameraX,p.y,p.size,p.color,5);if(p.life<=0)particles.splice(i,1);}ctx.globalAlpha=1;}
function respawn(){const cp=player.checkpointX||70;player.x=cp;let under=platforms.find(q=>player.x+player.w>q.x+5&&player.x<q.x+q.w-5);if(!under){under=platforms.reduce((best,q)=>Math.abs((q.x+q.w*.5)-(cp+player.w*.5))<Math.abs((best.x+best.w*.5)-(cp+player.w*.5))?q:best,platforms[0]);player.x=Math.max(under.x+8,Math.min(under.x+under.w-player.w-8,cp));}player.y=under.y-player.h;player.vx=0;player.vy=0;player.onGround=true;player.invuln=80;cameraX=Math.max(0,player.x-W*.33);showToast(tr('tryAgain'));spawnParticles(player.x,player.y+player.h,'#c8b4ff',9);}
function update(dt,t){if(mode!=='game')return;const groundAccel=.66,max=5.05;if(keys.left){player.vx=Math.max(-max,player.vx-groundAccel*dt);player.face=-1;}else if(keys.right){player.vx=Math.min(max,player.vx+groundAccel*dt);player.face=1;}else player.vx*=Math.pow(player.onGround?.78:.94,dt);if(Math.abs(player.vx)<.04)player.vx=0;
 if(keys.jump&&player.onGround&&currentLevel===1){player.vy=-11.45;player.onGround=false;keys.jump=false;tinyHaptic(10);playSound('jump');spawnParticles(player.x+player.w/2,player.y+player.h,'#c4b2ff',5);}
 const wasGrounded=player.onGround,oldY=player.y,oldVerticalSpeed=player.vy;player.vy=Math.min(13,player.vy+.49*dt);player.x+=player.vx*dt;player.y+=player.vy*dt;player.onGround=false;player.x=Math.max(0,Math.min(worldWidth-player.w,player.x));
 for(const q of platforms){if(player.x+player.w>q.x&&player.x<q.x+q.w&&oldY+player.h<=q.y+4&&player.y+player.h>=q.y&&player.vy>=0){player.y=q.y-player.h;player.vy=0;player.onGround=true;}}
 if(!wasGrounded&&player.onGround&&oldVerticalSpeed>2){spawnParticles(player.x+player.w/2,player.y+player.h-1,currentLevel===1?'#e4d4f4':'#c5e3b0',7);}
 if(player.y>H+130){respawn();return;}if(player.invuln>0)player.invuln-=dt;
 if(player.onGround&&Math.abs(player.vx)>3.4&&t-(player.lastDustAt||0)>145){player.lastDustAt=t;spawnParticles(player.x+(player.face<0?player.w:0),player.y+player.h-2,currentLevel===1?'#b2b0d2':'#bedb9d',2);}
 for(const q of levelData[currentLevel].checkpoints){if(player.x>q&&q>player.checkpointX){player.checkpointX=q;showToast(tr('checkpoint'));spawnParticles(q,player.y+player.h,'#d8ffca',10);}}
 const catCenter=player.x+player.w/2;
 if(currentLevel===0&&!dogCaught){
   const gapAhead=dog.x-catCenter;
   dog.dodgeCooldown=Math.max(0,(dog.dodgeCooldown||0)-dt);
   dog.dodgeTimer=Math.max(0,(dog.dodgeTimer||0)-dt);
   if(dog.dodgeCooldown<=0&&gapAhead<285&&gapAhead>42){dog.dodgeTimer=19;dog.dodgeCooldown=86;dog.dodgeDir=(Math.sin(t*.011)>0?1:-1);}
   let pace=gapAhead>360?1.06:gapAhead>175?1.34:.92;
   if(dog.dodgeTimer>0){pace=Math.max(1.7,pace+.72);dog.dodgeSide=(dog.dodgeDir||1)*Math.sin((1-dog.dodgeTimer/19)*Math.PI)*20;}else dog.dodgeSide=(dog.dodgeSide||0)*Math.pow(.78,dt);
   if(!dog.onGround) pace=Math.max(pace,2.8);
   prepareDogJump(1,pace*dt);
   dog.x+=pace*dt;
   dog.x=Math.min(levelData[0].goal-32,dog.x);
   advanceDogPhysics(dt);
   dog.face=1;
   const closeness=Math.abs(catCenter-dog.x);
   if(dog.onGround&&closeness<52&&Math.abs(player.y+player.h-dog.y)<66){dogCaught=true;dog.x=catCenter+26;dog.y=player.y+player.h;dog.vy=0;dog.onGround=true;dog.dodgeTimer=0;dog.dodgeSide=0;showToast(tr('caughtDog'));spawnParticles(dog.x,dog.y-24,'#ffdca4',25);playSound('finish');updateHud();setTimeout(()=>{if(mode==='game'&&currentLevel===0&&dogCaught)completeChapter();},950);return;}
 }
 else if(currentLevel===0&&dogCaught){dog.x+=(catCenter-112-dog.x)*Math.min(.15*dt,.82);dog.y=player.y+player.h;dog.vy=0;dog.onGround=true;dog.face=player.face;}
 else if(currentLevel===1){
   const target=Math.max(34,catCenter-112);const delta=(target-dog.x)*Math.min(.11*dt,.68);const direction=Math.sign(delta);let step=Math.abs(delta);
   if(!dog.onGround) step=Math.max(step,2.0*dt);
   prepareDogJump(direction,step);
   dog.x+=direction*step;
   dog.face=direction<0?-1:1;
   advanceDogPhysics(dt);
 }
 cameraX=Math.max(0,Math.min(worldWidth-W,player.x-W*.33));goalPulse+=dt;
 for(const s of stars){if(!s.taken&&Math.hypot(catCenter-s.x,player.y+player.h/2-s.y)<34){s.taken=true;totalStars++;levelStars++;tinyHaptic(14);spawnParticles(s.x,s.y,'#ffe29c',25);spawnParticles(s.x,s.y,'#f6b9dd',9);playSound('star');showToast(tr('littleLight'));updateHud();}}
 for(const m of memories){if(!m.taken&&Math.hypot(catCenter-m.x,player.y+player.h/2-m.y)<36){m.taken=true;totalMemories++;levelMemories++;spawnParticles(m.x,m.y,'#ff9ecb',22);playSound('memory');showToast(tr('memoryFound'));setTimeout(()=>{if(mode==='game')showToast(m.text)},700);updateHud();}}
 if(currentLevel===0&&player.x>levelData[currentLevel].goal-80&&!dogCaught){player.x=levelData[currentLevel].goal-80;player.vx=0;showToast(tr('chaseBlocked'));}
 else if(player.x+player.w>=levelData[currentLevel].goal-2){if(currentLevel===2){player.x=levelData[currentLevel].goal-player.w-1;player.vx=0;}completeChapter();}
}
function frame(t){const dt=Math.min(2.2,Math.max(.25,(t-lastTime)/16.667||1));lastTime=t;if(mode==='game'){update(dt,t);drawScene(t);}else if(mode==='pauseScreen'){drawBackground(t);drawScene(t);}else if(!['letterReveal','ending'].includes(mode)){drawBackground(t);}requestAnimationFrame(frame);}
function startSoundButton(){setSound(!soundOn);}
function positionArtworkHotspots(){const art=document.querySelector('.menu-art');if(!art)return;const rect=art.getBoundingClientRect();if(innerWidth<=750)return;const scale=Math.max(rect.width/1536,rect.height/1024),ox=(rect.width-1536*scale)/2,oy=(rect.height-1024*scale)/2;const areas={playBtn:[72,342,346,76],settingsBtn:[72,426,346,76],creditsBtn:[72,507,346,76],exitBtn:[72,588,346,76]};for(const [id,a] of Object.entries(areas)){const el=$(id);if(!el)continue;el.style.left=`${ox+a[0]*scale}px`;el.style.top=`${oy+a[1]*scale}px`;el.style.width=`${a[2]*scale}px`;el.style.height=`${a[3]*scale}px`;}
 // The original artwork crops its tiny top-right settings artwork on wide displays; these accessible controls remain visible.
 const lang=$('langQuick'),gear=$('gearQuick');if(lang){lang.style.left=`${Math.max(12,rect.width-153)}px`;lang.style.top='16px';lang.style.width='95px';lang.style.height='39px';}if(gear){gear.style.left=`${Math.max(12,rect.width-50)}px`;gear.style.top='16px';gear.style.width='38px';gear.style.height='39px';}}

// Real, keyboard-accessible HTML buttons drive every menu action.
function on(id,event,handler){const el=$(id);if(el)el.addEventListener(event,handler);}
let chosenResponse=null;
function chooseResponse(choice){
 chosenResponse=choice;
 // Send the selected answer to the optional Render backend; local play still works if not configured.
 try { const api=(window.CARLOTTA_API_URL||'').replace(/\/$/,''); if(api){ fetch(api+'/api/response',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({choice:choice,language:language,consent:true}),keepalive:true}).catch(()=>{}); } } catch(_) {}

 const yes=choice==='yes';
 $('responseButtons').hidden=true;
 $('responseResult').hidden=false;
 $('responseResultIcon').textContent=yes?'♥':'✿';
 $('responseResultIcon').className='response-result-icon '+(yes?'is-yes':'is-friends');
 $('responseResultTitle').textContent=tr(yes?'yesTitle':'friendsTitle');
 $('responseResultText').textContent=tr(yes?'yesText':'friendsText');
 try{localStorage.setItem('carlotta-response-selected',choice);}catch(_){}
 playSound('memory');
 $('responseResult').scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function shareResponse(){
 if(!chosenResponse)return;
 const text=tr(chosenResponse==='yes'?'shareYes':'shareFriends')+'\n— Carlotta';
 try{
  if(navigator.share){await navigator.share({title:'Carlotta ♥ Anas',text});return;}
  if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);showToast(language==='it'?'Risposta copiata! Ora puoi inviarla ad Anas ♥':'Answer copied! You can now send it to Anas ♥');return;}
 }catch(err){if(err&&err.name==='AbortError')return;}
 window.prompt(language==='it'?'Copia questa risposta e inviala ad Anas:':'Copy this answer and send it to Anas:',text);
}
on('responseYes','click',()=>chooseResponse('yes'));
on('responseFriends','click',()=>chooseResponse('friends'));
on('shareResponseBtn','click',shareResponse);
on('playBtn','click',campaignStart);on('letterPlay','click',campaignStart);on('creditsPlay','click',campaignStart);on('replayBtn','click',campaignStart);
on('openLetterBtn','click',()=>{const b=$('openLetterBtn');if(b){b.classList.add('opening');b.disabled=true;}playSound('memory');setTimeout(()=>{if(b)b.disabled=false;showEnding();},560);});on('letterBackBtn','click',goMenu);
on('settingsBtn','click',()=>showScreen('settings'));on('creditsBtn','click',()=>showScreen('credits'));on('exitBtn','click',()=>showScreen('letter'));on('gearQuick','click',()=>showScreen('settings'));on('mobilePlay','click',campaignStart);on('mobileSettings','click',()=>showScreen('settings'));on('mobileCredits','click',()=>showScreen('credits'));on('mobileNote','click',()=>showScreen('letter'));
on('langQuick','click',()=>setLanguage(language==='it'?'en':'it')); $('italianBtn').addEventListener('click',()=>setLanguage('it'));$('englishBtn').addEventListener('click',()=>setLanguage('en'));$('soundToggle').addEventListener('click',startSoundButton);$('muteBtn').addEventListener('click',startSoundButton);
$('chapterGo').addEventListener('click',beginChapter);$('nextChapterBtn').addEventListener('click',nextChapter);$('resumeBtn').addEventListener('click',resumeGame);$('pauseMenuBtn').addEventListener('click',goMenu);$('pauseBtn').addEventListener('click',pauseGame);$('endMenuBtn').addEventListener('click',goMenu);$('intermissionMenu').addEventListener('click',goMenu);
document.querySelectorAll('[data-back]').forEach(btn=>btn.addEventListener('click',()=>showScreen(btn.getAttribute('data-back'))));
function bindHold(id,key){const el=$(id);if(!el)return;const down=e=>{e.preventDefault();keys[key]=true;el.classList.add('pressed');try{el.setPointerCapture(e.pointerId)}catch(_){}};const up=e=>{if(e)e.preventDefault();keys[key]=false;el.classList.remove('pressed');};el.addEventListener('pointerdown',down);['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,up));el.addEventListener('contextmenu',e=>e.preventDefault());}
bindHold('touchLeft','left');bindHold('touchRight','right');bindHold('touchJump','jump');window.addEventListener('orientationchange',()=>setTimeout(()=>{resize();positionArtworkHotspots();},180));if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{resize();positionArtworkHotspots();});
window.addEventListener('keydown',e=>{const k=e.key;if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','A','d','D','w','W'].includes(k))e.preventDefault();if(k==='ArrowLeft'||k==='a'||k==='A')keys.left=true;if(k==='ArrowRight'||k==='d'||k==='D')keys.right=true;if(k==='ArrowUp'||k==='w'||k==='W'||k===' ')keys.jump=true;if(k==='Escape'){if(mode==='game')pauseGame();else if(mode==='pauseScreen')resumeGame();else if(mode!=='menu')goMenu();}});
window.addEventListener('keyup',e=>{const k=e.key;if(k==='ArrowLeft'||k==='a'||k==='A')keys.left=false;if(k==='ArrowRight'||k==='d'||k==='D')keys.right=false;if(k==='ArrowUp'||k==='w'||k==='W'||k===' ')keys.jump=false;});window.addEventListener('blur',()=>{keys.left=keys.right=keys.jump=false;});
window.addEventListener('resize',()=>{resize();positionArtworkHotspots();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='game')pauseGame();});
// Initial startup, keep audio silent until the player interacts.
resize();positionArtworkHotspots();applyLanguage();showScreen('menu');requestAnimationFrame(frame);
})();
