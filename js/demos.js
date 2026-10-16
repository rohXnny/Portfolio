/* ---------- demos: what I build ---------- */
(function(){
  if(!document.getElementById("build"))return;
  const sleep=ms=>new Promise(r=>setTimeout(r,reduce?Math.min(ms,60):ms));
  const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");

  /* ===== Ask me like an API ===== */
  const EP={
    me:["GET","/rohit","200 OK",{name:"Rohit Annavarapu",role:"Full Stack Software Engineer",based_in:"Overland Park, Kansas",education:"M.S. Computer Science, University of Kansas",industries:["healthcare","banking","higher education","energy"],open_to:"Software engineering roles"}],
    strengths:["GET","/rohit/strengths","200 OK",{strengths:["Breaking tricky problems into simple, testable steps","System design that grows only when it has to","Distributed systems: consensus, events, retries","APIs and data models that are hard to misuse","AI agents and LLM apps with real guardrails","Owning it in production, end to end"]}],
    ai:["GET","/rohit/ai","200 OK",{builds:["agents that plan and call tools","RAG over trusted documents","embeddings and vector search","MCP servers that connect models to real systems"],ships_with:["Claude Code","Cursor","GitHub Copilot"],keeps_it_safe:["evals before release","guardrails on actions","cited answers","human approval for risky steps"]}],
    stack:["GET","/rohit/stack","200 OK",{languages:["Java","Python","TypeScript","SQL"],backend:["Spring Boot","FastAPI","Django","REST","gRPC"],frontend:["React","Angular","Vue"],data:["PostgreSQL","Redis","Kafka","RabbitMQ"],cloud:["AWS","GCP","Azure","Kubernetes","Docker"]}],
    practice:["GET","/rohit/in-practice","200 OK",{question:"How do I solve problems in practice?",answer:"Give me a system and try to break it.",includes:["system design","distributed systems","scalability","an AI agent on call"],try_it:"Break my system ↓"},true],
    hire:["POST","/rohit/hire","201 Created",{status:"Great choice.",next_step:"Opening Contact…"}]
  };
  function color(o,ind=""){
    if(Array.isArray(o))return "[\n"+o.map(v=>ind+"  "+color(v,ind+"  ")).join('<span class="p">,</span>\n')+"\n"+ind+"]";
    if(o&&typeof o==="object")return "{\n"+Object.entries(o).map(([k,v])=>ind+'  <span class="k">"'+esc(k)+'"</span><span class="p">:</span> '+color(v,ind+"  ")).join('<span class="p">,</span>\n')+"\n"+ind+"}";
    return '<span class="s">"'+esc(o)+'"</span>';
  }
  const abody=document.getElementById("apix-body"),areq=document.getElementById("apix-req"),ast=document.getElementById("apix-status"),acta=document.getElementById("apix-cta"),eps=[...document.querySelectorAll(".ep")];let etok=0;
  async function call(id,anim=true){
    const my=++etok,[m,path,st,data,cta]=EP[id];eps.forEach(b=>b.classList.toggle("on",b.dataset.ep===id));
    areq.textContent=m+" "+path;acta.hidden=true;
    if(anim){ast.textContent="…";ast.className="";abody.innerHTML='<span class="p">sending request…</span>';await sleep(280);if(my!==etok)return}
    ast.textContent=st;ast.className=st.startsWith("201")?"acc":"ok";abody.innerHTML=color(data);acta.hidden=!cta;
    if(id==="hire"){await sleep(1300);if(my===etok){const a=document.querySelector('#pill a[href="#contact"]');if(a)a.click()}}
  }
  eps.forEach(b=>b.addEventListener("click",()=>call(b.dataset.ep)));
  document.getElementById("go-sys").addEventListener("click",()=>document.getElementById("sys").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"}));
  call("me",false);

  /* ===== Break my system ===== */
  const svg=document.getElementById("sx-svg");if(!svg)return;
  const trace=document.getElementById("sx-trace"),statusEl=document.getElementById("sx-status"),btns=[...document.querySelectorAll(".sxb")],skills=[...document.querySelectorAll("#sx-skills span")];
  const DB=[[640,112],[706,206],[640,300]],LB=[178,206],CACHE=[486,110],QUEUE=[486,300],USERS=[[60,130],[60,206],[60,282]];
  const S={apps:2,canary:-1,leader:0,up:[1,1,1],iso:-1,term:1,q:0,mode:"normal",cand:-1,busy:false};
  const T={rps:1200,p95:120,err:0},M={rps:1200,p95:120,err:0};
  let tok=0;
  const appPos=i=>{const gap=Math.min(56,280/Math.max(1,S.apps-1));return[330,206+(i-(S.apps-1)/2)*gap]};
  let pk,qfill;
  function draw(){
    let s='<defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" fill="rgba(255,255,255,.25)"/></marker></defs>';
    const ln=(a,b,st='rgba(255,255,255,.14)',dash="")=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${st}" stroke-width="1.5" ${dash?`stroke-dasharray="${dash}"`:""}/>`;
    USERS.forEach(u=>s+=ln(u,LB));
    for(let i=0;i<S.apps;i++){const a=appPos(i);s+=ln(LB,a);s+=ln(a,CACHE);s+=ln(a,QUEUE)}
    if(S.leader>=0){s+=ln(QUEUE,DB[S.leader],"rgba(241,192,113,.35)");DB.forEach((d,i)=>{if(i!==S.leader&&S.up[i]&&S.iso!==i)s+=ln(DB[S.leader],d,"rgba(111,211,190,.45)","4 5")})}
    if(S.iso>=0){const[x,y]=DB[S.iso];s+=`<circle cx="${x}" cy="${y}" r="44" fill="none" stroke="#ff7b72" stroke-width="2" stroke-dasharray="6 6"/><text x="${x}" y="${y-50}" style="font-size:10.5px;fill:#ff8a82">cut off</text>`}
    USERS.forEach((u,i)=>s+=`<circle cx="${u[0]}" cy="${u[1]}" r="15" fill="#1b1d24" stroke="rgba(157,177,255,.6)" stroke-width="1.5"/><path d="M${u[0]-6} ${u[1]+7}c0-5 3-7 6-7s6 2 6 7M${u[0]} ${u[1]-1}a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7" fill="none" stroke="#9DB1FF" stroke-width="1.4"/>`);
    s+=`<text x="60" y="326" style="font-size:11px;fill:#8d8d8d">Users</text>`;
    const box=(c,w,h,label,st,fill,sub)=>`<rect x="${c[0]-w/2}" y="${c[1]-h/2}" width="${w}" height="${h}" rx="9" fill="${fill||"#1a1b20"}" stroke="${st}" stroke-width="1.5"/><text x="${c[0]}" y="${c[1]+(sub?-1:4)}" style="font-size:11.5px;fill:#eee">${label}</text>${sub?`<text x="${c[0]}" y="${c[1]+12}" style="font-size:9.5px;fill:${st}">${sub}</text>`:""}`;
    s+=box(LB,92,40,"Load balancer","rgba(255,255,255,.35)");
    for(let i=0;i<S.apps;i++){const c=i===S.canary;s+=box(appPos(i),78,32,"app-"+(i+1),c?"#F1C071":"rgba(157,177,255,.55)",c?"rgba(241,192,113,.12)":"",c?"v2.4 canary":"")}
    s+=box(CACHE,86,40,"Cache",S.mode==="spike"?"#6fe3a5":"rgba(111,227,165,.5)",S.mode==="spike"?"rgba(111,227,165,.12)":"",S.mode==="spike"?"94% hits":"");
    s+=`<rect x="${QUEUE[0]-46}" y="${QUEUE[1]-20}" width="92" height="40" rx="9" fill="#1a1b20" stroke="rgba(241,192,113,.55)" stroke-width="1.5"/><rect id="qfill" x="${QUEUE[0]-44}" y="${QUEUE[1]+12}" width="0" height="6" rx="3" fill="#F1C071"/><text x="${QUEUE[0]}" y="${QUEUE[1]+3}" style="font-size:11.5px;fill:#eee">Queue</text>`;
    DB.forEach((d,i)=>{const up=S.up[i],L=i===S.leader,C=i===S.cand;const st=!up?"#ff7b72":L?"#6FD3BE":C?"#F1C071":"rgba(255,255,255,.4)";
      s+=`<circle cx="${d[0]}" cy="${d[1]}" r="27" fill="${!up?"#2a1514":L?"rgba(111,211,190,.15)":C?"rgba(241,192,113,.12)":"#1a1b20"}" stroke="${st}" stroke-width="2" ${!up?'stroke-dasharray="4 4"':""}/>`+
      `<text x="${d[0]}" y="${d[1]+1}" style="font-size:12px;fill:#fff;font-weight:600">db-${i+1}</text><text x="${d[0]}" y="${d[1]+14}" style="font-size:9.5px;fill:${st}">${!up?"down":L?"leader":C?"candidate":S.iso===i?"read-only":"follower"}</text>`});
    s+=`<text x="672" y="372" style="font-size:11px;fill:#8d8d8d">Database · term ${S.term}</text>`;
    s+='<g id="pk"></g>';svg.innerHTML=s;pk=svg.querySelector("#pk");qfill=svg.querySelector("#qfill");
  }
  /* packets */
  const P=[];
  function spawn(kind,pts){if(P.length>90||!pk)return;const el=document.createElementNS("http://www.w3.org/2000/svg","circle");el.setAttribute("r",kind==="rep"?3:3.6);
    el.setAttribute("fill",kind==="read"?"#9DB1FF":kind==="write"?"#F1C071":kind==="rep"?"#6FD3BE":"#ff7b72");pk.appendChild(el);P.push({pts,seg:0,t:0,el,kind})}
  let acc=0,repT=0,lastF=performance.now();
  function frame(now){
    const dt=Math.min(.05,(now-lastF)/1000);lastF=now;
    if(!document.hidden&&current==="home"&&pk){
      acc+=dt*(3+M.rps/12000*15);
      while(acc>=1){acc--;const u=USERS[Math.floor(Math.random()*3)],i=Math.floor(Math.random()*S.apps),a=appPos(i);
        if(S.mode==="overload"&&Math.random()<.3){spawn("err",[u,LB])}
        else if(i===S.canary&&Math.random()<.45){spawn("err",[u,LB,a])}
        else if(Math.random()<.68){spawn("read",[u,LB,a,CACHE])}
        else{spawn("write",S.leader>=0?[u,LB,a,QUEUE,DB[S.leader]]:[u,LB,a,QUEUE])}}
      repT+=dt;if(repT>.9&&S.leader>=0){repT=0;DB.forEach((d,j)=>{if(j!==S.leader&&S.up[j]&&S.iso!==j)spawn("rep",[DB[S.leader],d])})}
      for(let k=P.length-1;k>=0;k--){const p=P[k],A=p.pts[p.seg],B=p.pts[p.seg+1];const len=Math.hypot(B[0]-A[0],B[1]-A[1])||1;p.t+=dt*(reduce?900:260)/len;
        if(p.t>=1){p.seg++;p.t=0;if(p.seg>=p.pts.length-1){if(p.kind==="write"&&S.leader<0)S.q=Math.min(1,S.q+.06);p.el.remove();P.splice(k,1);continue}}
        const a2=p.pts[p.seg],b2=p.pts[p.seg+1];p.el.setAttribute("cx",a2[0]+(b2[0]-a2[0])*p.t);p.el.setAttribute("cy",a2[1]+(b2[1]-a2[1])*p.t);
        if(p.kind==="err"&&p.seg===p.pts.length-2&&p.t>.8)p.el.setAttribute("opacity",String(Math.max(0,(1-p.t)*5)))}
      if(S.leader>=0)S.q=Math.max(0,S.q-dt*.35);
      if(qfill)qfill.setAttribute("width",String(S.q*88));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  /* metrics */
  const mr=document.getElementById("m-rps"),mp=document.getElementById("m-p95"),me=document.getElementById("m-err"),line=document.getElementById("m-line"),hist=[];
  setInterval(()=>{for(const k of ["rps","p95","err"])M[k]+=(T[k]-M[k])*.3;
    const j=1+(Math.random()-.5)*.04;mr.textContent=M.rps>=1000?(M.rps*j/1000).toFixed(1)+"k":Math.round(M.rps*j);mp.textContent=Math.round(M.p95*j);me.textContent=Math.max(0,M.err).toFixed(2);
    hist.push(M.p95);if(hist.length>40)hist.shift();line.setAttribute("points",hist.map((v,i)=>`${i*3},${28-Math.min(26,v/1000*26)}`).join(" "));
    line.setAttribute("stroke",M.err>1?"#ff7b72":M.p95>300?"#F1C071":"#6FD3BE")},220);
  /* agent log */
  const LABEL={plan:"PLAN",tool:"TOOL",obs:"RESULT",think:"THINK",guard:"GUARD",done:"DONE"};
  function log(ty,txt){const idle=trace.querySelector(".idle");if(idle)idle.remove();const li=document.createElement("li");
    if(ty==="sep"){li.className="sep";li.textContent=txt}else li.innerHTML=`<span class="ty ${ty}">${LABEL[ty]}</span><span>${ty==="tool"?"<code>"+esc(txt)+"</code>":esc(txt)}</span>`;
    trace.appendChild(li);trace.scrollTop=trace.scrollHeight}
  function status(t,c){statusEl.textContent=t;statusEl.className="sx-status "+c}
  function lightSkills(keys){skills.forEach(s=>s.classList.toggle("on",keys.includes(s.dataset.k)))}
  const alive=()=>[0,1,2].filter(i=>S.up[i]&&S.iso!==i);
  async function step(ms,my){await sleep(ms);if(my!==tok)throw 0}
  const RUN={
    async spike(my){lightSkills(["scale","design","ai"]);log("sep","Incident · traffic is 10× normal");
      S.mode="overload";Object.assign(T,{rps:12000,p95:950,err:2.4});status("Overloaded","bad");await step(900,my);
      log("plan","Traffic jumped 10×. Add capacity, take reads off the database, and protect writes.");await step(800,my);
      log("tool",'autoscaler.scale({ service: "api", from: 2, to: 6 })');
      for(let n=3;n<=6;n++){S.apps=n;draw();await step(320,my)}
      S.mode="spike";draw();Object.assign(T,{p95:420,err:.4});log("obs","6 app servers healthy behind the load balancer.");status("Recovering","warn");await step(900,my);
      log("tool",'cache.warm({ keys: "top-1000" })');await step(600,my);log("obs","Cache hit rate is 94%. Database reads dropped by 80%.");Object.assign(T,{p95:260,err:.1});await step(900,my);
      log("think","Writes are arriving in bursts. The queue absorbs them so the database never spikes.");S.q=.7;await step(1600,my);
      Object.assign(T,{p95:180,err:0});status("Healthy · scaled","ok");log("done","Holding steady at 12k req/s. p95 back to 180 ms, zero errors, zero writes lost.")},
    async kill(my){lightSkills(["dist","design","ai"]);
      if(S.leader<0){log("obs","There's no leader right now. Reset to bring the cluster back.");return}
      const old=S.leader;log("sep",`Incident · db-${old+1} (leader) is down`);S.up[old]=0;S.leader=-1;draw();Object.assign(T,{p95:M.p95+180,err:.2});status("Failing over","warn");await step(800,my);
      log("obs",`db-${old+1} stopped responding. Writes can't be confirmed.`);await step(700,my);
      log("think","Don't fail the writes. Hold them in the queue while the remaining servers elect a new leader.");await step(900,my);
      const live=alive();
      if(live.length<2){log("guard","Only one database left, so there's no majority. Writes stay paused instead of risking two sources of truth.");status("Read-only","bad");Object.assign(T,{err:.8});return}
      S.cand=live[0];draw();log("tool","cluster.elect()");await step(1000,my);
      S.term++;S.leader=S.cand;S.cand=-1;draw();log("obs",`db-${S.leader+1} won ${live.length} of 3 votes and leads term ${S.term}.`);
      Object.assign(T,{p95:S.mode==="spike"?180:120,err:0});await step(900,my);status("Healthy","ok");
      log("done","Failover took 1.3 s. Queued writes were replayed to the new leader. 0 writes lost.");await step(500,my);
      log("guard",`db-${old+1} stays down until a person checks why it failed.`)},
    async split(my){lightSkills(["dist","ai","design"]);
      const v=S.leader>=0?S.leader:alive()[0];if(v===undefined){log("obs","Not enough servers. Reset first.");return}
      log("sep",`Incident · network split isolates db-${v+1}`);S.iso=v;draw();status("Partitioned","warn");Object.assign(T,{p95:M.p95+120,err:.1});await step(900,my);
      log("obs",`db-${v+1} can't reach the other two databases.`);await step(700,my);
      log("think","It's alone, so it's in the minority. It must stop taking writes, or we'd end up with two versions of the truth.");await step(900,my);
      log("tool",`cluster.quorum({ node: "db-${v+1}" })`);await step(600,my);
      if(S.leader===v){S.leader=-1;draw()}log("obs",`1 of 3 reachable. No quorum, so db-${v+1} turns read-only.`);await step(900,my);
      const live=alive();if(live.length<2){log("guard","The other side has no majority either. Everyone waits; no split brain.");status("Read-only","bad");return}
      if(S.leader<0){S.cand=live[0];draw();await step(800,my);S.term++;S.leader=S.cand;S.cand=-1;draw();log("obs",`Majority side elected db-${S.leader+1} for term ${S.term}. Writes continue.`)}
      Object.assign(T,{p95:S.mode==="spike"?180:120,err:0});status("Healthy · degraded","ok");await step(1600,my);
      S.iso=-1;draw();log("done",`Network healed. db-${v+1} rejoined as a follower and caught up. Nothing was written on both sides.`)},
    async deploy(my){lightSkills(["ai","design"]);log("sep","Change · deploying v2.4");
      log("tool",'deploy.canary({ version: "v2.4", traffic: "10%" })');S.canary=0;draw();Object.assign(T,{err:3.1,p95:M.p95+60});status("Canary failing","warn");await step(1500,my);
      log("obs","Canary error rate is 31%. Stable servers are at 0%.");await step(700,my);
      log("think","The new release is broken. Roll back now, before it reaches everyone.");await step(800,my);
      log("guard","Rollback is pre-approved by policy, so I can act alone. A full deploy would still need a human.");await step(800,my);
      log("tool",'deploy.rollback({ to: "v2.3" })');await step(700,my);S.canary=-1;draw();Object.assign(T,{err:0,p95:S.mode==="spike"?180:120});status("Healthy","ok");
      log("done","Rolled back in 40 s. 90% of users never saw the bug. Opened a ticket with the failing logs.")},
    async reset(){Object.assign(S,{apps:2,canary:-1,leader:0,up:[1,1,1],iso:-1,term:1,q:0,mode:"normal",cand:-1});Object.assign(T,{rps:1200,p95:120,err:0});
      draw();status("Healthy","ok");lightSkills([]);trace.innerHTML='<li class="idle">All quiet. Pick a failure below and I\'ll handle it.</li>'}
  };
  btns.forEach(b=>b.addEventListener("click",async()=>{
    const x=b.dataset.x;
    if(x!=="reset"&&S.busy)return;
    const my=++tok;
    if(x==="reset"){S.busy=false;btns.forEach(z=>{z.removeAttribute("aria-disabled");z.classList.remove("run")});await RUN.reset();return}
    S.busy=true;btns.forEach(z=>{if(z!==b&&z.dataset.x!=="reset")z.setAttribute("aria-disabled","true")});b.classList.add("run");
    if(x!=="spike"&&(S.up.some(u=>!u)||S.iso>=0||S.leader<0||S.canary>=0)){Object.assign(S,{up:[1,1,1],iso:-1,canary:-1,cand:-1});if(S.leader<0)S.leader=0;Object.assign(T,{err:0,p95:S.mode==="spike"?180:120});draw();status("Healthy","ok");log("obs","Starting from a healthy cluster.")}
    try{await RUN[x](my)}catch(e){}
    if(my===tok){S.busy=false;btns.forEach(z=>{z.removeAttribute("aria-disabled");z.classList.remove("run")})}
  }));
  draw();
})();
