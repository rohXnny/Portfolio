/* ---------- screen code ---------- */
(function(){
  const lines=[
    ["@PostMapping(\"/v1/orders/allocate\")","#c9a2ff"],["public AllocationResult allocate(","#8fa6ff"],["    @Valid @RequestBody AllocationRequest req) {","#b9c3d9"],
    ["  return idempotency.run(req.key(), () ->","#b9c3d9"],["    allocator.reserve(req.items()));","#b9c3d9"],["}","#b9c3d9"],["",""],
    ["@router.get(\"/v1/payments/{id}/status\")","#c9a2ff"],["async def payment_status(id: UUID):","#5cc8b4"],["    return await ledger.status(id)","#b9c3d9"],["",""],
    ["@KafkaListener(topics = \"fulfillment.events\")","#c9a2ff"],["void on(FulfillmentEvent e) {","#8fa6ff"],["  if (seen.add(e.id())) apply(e);","#b9c3d9"],["}","#b9c3d9"],["",""],
    ["// retry with backoff, then dead-letter","#6d7fa3"],["@GetMapping(\"/v1/courses/search\")","#c9a2ff"],["Page<Course> search(CourseQuery q) {","#8fa6ff"],["  return courses.find(q);","#b9c3d9"],["}","#b9c3d9"],["",""],
    ["POST /v1/pricing/fuel  200 OK","#edb45a"],["GET  /v1/shipments/42  200 OK","#edb45a"],["",""]
  ];
  const g=document.getElementById("code");let out="";
  for(let rep=0;rep<2;rep++)lines.forEach((l,i)=>{const y=284+(rep*lines.length+i)*16;out+=`<text x="672" y="${y}" fill="${l[1]||"#000"}">${l[0].replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text>`});
  g.innerHTML=out;
})();

/* ---------- light follows cursor, he turns to say hi ---------- */
const svg=document.getElementById("room"),holeC=document.getElementById("holeC"),warmC=document.getElementById("warmC"),head=document.getElementById("head");
const face=document.getElementById("face"),waveSide=document.getElementById("waveSide"),wave=document.getElementById("wave"),bubble=document.getElementById("bubble");
let lx=1150,ly=460,tx=lx,ty=ly,last=0,greeting=false;
function toSvg(cx,cy){const p=svg.createSVGPoint();p.x=cx;p.y=cy;const m=svg.getScreenCTM();return m?p.matrixTransform(m.inverse()):{x:lx,y:ly}}
function toScreen(x,y){const p=svg.createSVGPoint();p.x=x;p.y=y;const m=svg.getScreenCTM();return m?p.matrixTransform(m):{x:0,y:0}}
function aim(cx,cy){const q=toSvg(cx,cy);tx=q.x;ty=q.y;last=performance.now()}
addEventListener("pointermove",e=>aim(e.clientX,e.clientY),{passive:true});
addEventListener("pointerdown",e=>aim(e.clientX,e.clientY),{passive:true});
addEventListener("touchmove",e=>{const t=e.touches[0];if(t)aim(t.clientX,t.clientY)},{passive:true});
function setGreet(on,left){
  greeting=on;
  face.style.opacity=on?1:0;wave.style.opacity=on?1:0;wave.classList.toggle("on",on&&!reduce);
  const mir=left?"translate(1860 0) scale(-1 1)":"";
  face.setAttribute("transform",mir);waveSide.setAttribute("transform",mir);
  bubble.classList.toggle("on",on&&current==="home");
}
function lightLoop(t){
  const active=performance.now()-last<3000;
  if(!reduce&&!active){const s=t/1000;tx=860+520*Math.sin(s*.35);ty=470+170*Math.sin(s*.6)}
  lx+=(tx-lx)*(reduce?1:.12);ly+=(ty-ly)*(reduce?1:.12);
  holeC.setAttribute("cx",lx);holeC.setAttribute("cy",ly);warmC.setAttribute("cx",lx);warmC.setAttribute("cy",ly);
  const d=Math.hypot(tx-930,ty-470),left=tx<930;
  if(current==="home"&&active&&(greeting?d<280:d<190)){if(!greeting||face.dataset.l!==String(left)){face.dataset.l=left;setGreet(true,left)}}
  else if(greeting)setGreet(false,left);
  const dx=Math.max(-1,Math.min(1,(lx-930)/600));
  head.setAttribute("transform",greeting?`rotate(${left?-10:10} 930 540)`:`translate(${dx*7} ${Math.abs(dx)*2}) rotate(${dx*5} 930 540)`);
  if(greeting){const p=toScreen(left?860:1000,400);const bw=bubble.offsetWidth,bh=bubble.offsetHeight;
    const bx=left?Math.max(8,p.x-bw-10):Math.min(innerWidth-bw-8,p.x+10);bubble.style.left=bx+"px";bubble.style.top=Math.max(80,p.y-bh)+"px";
    bubble.style.borderRadius=left?"16px 16px 4px 16px":"16px 16px 16px 4px"}
  requestAnimationFrame(lightLoop);
}
requestAnimationFrame(lightLoop);


/* ---------- role title: roles roll down, ending on full stack ---------- */
(function(){
  const roll=document.getElementById("roll");if(!roll)return;
  const words=["Backend","Frontend","API","Database","Cloud","DevOps","AI","Full Stack"];
  const measure=t=>{const m=document.createElement("span");m.className="rw";m.style.visibility="hidden";m.textContent=t;roll.appendChild(m);const w=m.offsetWidth;m.remove();return w+2};
  let cur=roll.querySelector(".rw");
  const fit=t=>{roll.style.width=measure(t)+"px"};
  if(reduce){cur.textContent="Full Stack";cur.classList.add("final");fit("Full Stack");return}
  cur.textContent=words[0];fit(words[0]);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const swap=async t=>{
    const nx=document.createElement("span");nx.className="rw enter";nx.textContent=t;roll.appendChild(nx);
    fit(t);void nx.offsetWidth;
    const old=cur;old.classList.add("leave");nx.classList.remove("enter");cur=nx;
    setTimeout(()=>old.remove(),600);
  };
  (async()=>{
    await wait(900);
    for(;;){
      for(let i=1;i<words.length;i++){
        cur.classList.add("strike");await wait(450);
        await swap(words[i]);
        await wait(i===words.length-1?600:850);
      }
      cur.classList.add("final");
      await wait(7000);
      cur.classList.remove("final");
      await swap(words[0]);
      await wait(850);
    }
  })();
})();

/* ---------- home: sunlight on scroll ---------- */
const dayG=document.getElementById("day"),beam=document.getElementById("beam"),darkR=document.getElementById("darkR"),amb=document.getElementById("ambient"),homeCopy=document.getElementById("home-copy"),hint=document.getElementById("scroll-hint");
function home(){
  if(current!=="home")return;
  const p=Math.max(0,Math.min(1,scrollY/(innerHeight*1.1)));
  dayG.setAttribute("opacity",p);beam.setAttribute("opacity",p*.95);amb.setAttribute("opacity",p*.07);
  darkR.setAttribute("opacity",.9*(1-.72*p));
  const q=Math.max(0,Math.min(1,(p-.4)/.35));
  homeCopy.style.opacity=q;homeCopy.style.transform=`translateY(${(1-q)*40}px)`;
  
  const hn=document.getElementById("home-name");const f=Math.max(0,Math.min(1,p/.35));hn.style.opacity=1-f;hn.style.visibility=f>=1?"hidden":"visible";hn.style.transform=`translateY(${-f*40}px)`;
}
addEventListener("scroll",home,{passive:true});

addEventListener("resize",home);
