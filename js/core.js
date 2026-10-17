/* When hosted on your own domain, set this to a form endpoint (e.g. Formspree) so details reach your inbox automatically. */
const FORM_ENDPOINT = "";
const MY_EMAIL = "rohitannavarapu.2001@gmail.com";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
let current="home";

/* ---------- custom cursor ---------- */
const cur=document.getElementById("cur");
if(fine){
  let x=-100,y=-100,px=x,py=y;
  addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;x=e.clientX;y=e.clientY;document.body.classList.add("cursor-on")},{passive:true});
  document.addEventListener("mouseleave",()=>document.body.classList.remove("cursor-on"));
  document.addEventListener("pointerover",e=>{const r=!!e.target.closest(".xs li");cur.classList.toggle("dark",!!e.target.closest(".xt.light,.edu-card.light,.sn-m.me,.toast"));cur.classList.toggle("ring",r);cur.classList.toggle("big",!r&&!!e.target.closest("a,button,.sc,.ic"))});
  (function f(){px+=(x-px)*(reduce?1:.25);py+=(y-py)*(reduce?1:.25);cur.style.transform=`translate(${px}px,${py}px)`;requestAnimationFrame(f)})();
}

/* ---------- nav blur and scroll indicator ---------- */
const navEl=document.getElementById("nav");function navBlur(){navEl.classList.toggle("scrolled",scrollY>8)}addEventListener("scroll",navBlur,{passive:true});navBlur();
const hintEl=document.getElementById("scroll-hint");window.hintState=hintState;function hintState(){const more=document.documentElement.scrollHeight-innerHeight-scrollY>80;const max=document.documentElement.scrollHeight-innerHeight;const has=max>80;hintEl.classList.toggle("show",has);hintEl.classList.toggle("end",!more);document.getElementById("scroll-fill").style.transform=`scaleY(${has?Math.min(1,scrollY/max):0})`}addEventListener("scroll",hintState,{passive:true});addEventListener("resize",hintState);setTimeout(hintState,300);
