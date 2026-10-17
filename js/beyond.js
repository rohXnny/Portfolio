/* ---------- about: scroll story ---------- */
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const carScene=document.getElementById("car-scene"),carsScene=document.getElementById("cars-scene"),fuelScene=document.getElementById("fuel-scene");
const topcar=document.getElementById("topcar"),roadEl=document.getElementById("road"),cap=document.getElementById("car-cap"),sayL=document.getElementById("say-l"),sayR=document.getElementById("say-r");
const tiles=[...document.querySelectorAll("#tiles .tile")],tilesBox=document.getElementById("tiles");
const words=[...document.querySelectorAll("#say [data-i]")];
const track=document.getElementById("track"),cup=document.getElementById("cup"),chips=[...document.querySelectorAll(".chip")];
const leg1=document.getElementById("leg1"),leg2=document.getElementById("leg2"),arm1=document.getElementById("arm1");
function prog(el){const r=el.getBoundingClientRect();return clamp(-r.top/(r.height-innerHeight))}
function about(){
  if(current!=="beyond")return;
  /* car drives up, the road pulls the page along */
  const a=prog(carScene),m=clamp((a-.1)/.9),e=m*m*m;
  const H=innerHeight;
  topcar.style.transform=`translateY(${H*.12-e*H*1.25}px)`;
  roadEl.style.backgroundPosition=`0 0, center ${(a*4200)%140}px, 0 0`;
  cap.style.opacity=a<.12?1:0;
  const mid=clamp((a-.15)/.2)*(1-clamp((a-.7)/.15));
  sayL.style.opacity=mid;sayR.style.opacity=mid;
  /* car tiles */
  const b=prog(carsScene);
  tiles.forEach((t,i)=>{const s=clamp((b-i*.07)/.25);const fromY=(i%2?1:-1)*70;t.style.opacity=s;t.style.transform=`translateY(${(1-s)*fromY}vh) scale(${.85+s*.15})`});
  tilesBox.style.transform='none';
  const bl=document.querySelector('#cars-scene .big-line');const fo=clamp((b-.45)/.2);bl.style.opacity=1-fo;bl.style.transform=`translateY(${-fo*40}px) scale(${1-fo*.06})`;tiles.forEach(t=>t.style.filter=`brightness(${.65+fo*.35})`);
  /* caffeine chases new skills */
  const c=prog(fuelScene),W=track.clientWidth,cupW=cup.clientWidth,cupH=cup.clientHeight;
  const cx=c*(W-cupW*.6);
  const sw=Math.sin(c*60);
  cup.style.transform=`translate(${cx}px,${-Math.abs(sw)*8}px) rotate(${c>0&&c<1?6:0}deg)`;
  leg1.setAttribute("transform",`rotate(${sw*32} 66 162)`);leg2.setAttribute("transform",`rotate(${-sw*32} 102 162)`);arm1.setAttribute("transform",`rotate(${-sw*26} 36 110)`);
  let caughtN=0;
  chips.forEach((ch,i)=>{
    const base=[.32,.55,.78][i]*W+c*W*.08,cw=ch.offsetWidth;
    const caught=cx+cupW*.75>=base;
    ch.classList.toggle("caught",caught);
    if(caught){ch.style.transform=`translate(${cx+cupW*.5-cw/2}px,${-(cupH*1.05+caughtN*46)+track.clientHeight*.4}px)`;caughtN++}
    else ch.style.transform=`translate(${base}px,0)`;
  });
  words[0].className=c<.04?"w0":c<.1?"w1":"w2";
  words[1].className=chips[0].classList.contains("caught")?"w2":c>.15?"w1":"w0";
  words[2].className=chips[1].classList.contains("caught")?"w2":c>.4?"w1":"w0";
}
addEventListener("scroll",about,{passive:true});addEventListener("resize",about);
