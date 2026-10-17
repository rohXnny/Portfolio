// Ported from the original single-file build; DOM-heavy, so typed loosely.
// @ts-nocheck
import { FORM_ENDPOINT, MY_EMAIL, fine } from "./shared";

/* ---------- copy ---------- */
const toast=document.getElementById("toast");let tt;
function show(m){toast.textContent=m;toast.hidden=false;clearTimeout(tt);tt=setTimeout(()=>toast.hidden=true,2000)}
function copyText(v,label,el){
  const sel=()=>{if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);show("Selected. Press Ctrl/⌘+C to copy")};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(()=>show(label+" copied"),sel);else sel();
}
document.querySelectorAll(".copy").forEach(b=>b.addEventListener("click",()=>copyText(b.dataset.v,b.dataset.l,b)));

/* ---------- leave your details ---------- */
const lead=document.getElementById("lead"),lerr=document.getElementById("l-err"),leave=document.getElementById("leave");
lead.addEventListener("submit",async e=>{
  e.preventDefault();
  const n=document.getElementById("l-name"),m=document.getElementById("l-email");
  const okN=n.value.trim().length>1,okM=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.value.trim());
  n.setAttribute("aria-invalid",!okN);m.setAttribute("aria-invalid",!okM);
  if(!okN||!okM){lerr.textContent=!okN?"Add your name so I know who to reach.":"Enter a valid email, like name@company.com.";lerr.hidden=false;(okN?m:n).focus();return}
  lerr.hidden=true;
  const v={name:n.value.trim(),email:m.value.trim(),company:document.getElementById("l-company").value.trim(),role:document.getElementById("l-role").value,message:document.getElementById("l-msg").value.trim()};
  const text=`Name: ${v.name}\nEmail: ${v.email}\nCompany: ${v.company||"-"}\nRole: ${v.role}\n\n${v.message}`;
  const sent=await sendForm("lead",{...v,visit:visitText()});
  const first=v.name.split(" ")[0].replace(/[<>&]/g,"");
  if(sent){leave.innerHTML=`<div class="done"><h4>Thanks, ${first}.</h4><p>Your details are with me. I'll reach out at the email you gave.</p></div>`;return}
  const href=`mailto:${MY_EMAIL}?subject=${encodeURIComponent("Portfolio: "+v.name+(v.company?" ("+v.company+")":""))}&body=${encodeURIComponent(text)}`;
  leave.innerHTML=`<div class="done"><h4>Almost there, ${first}.</h4><p>Send these details to ${MY_EMAIL} and I'll reach out to you.</p><div class="row"><a class="pillbtn primary" href="${href}">Open in my email app</a><button class="pillbtn" type="button" id="cp-details">Copy details</button></div></div>`;
  document.getElementById("cp-details").addEventListener("click",()=>copyText(text,"Details",null));
});

/* ---------- form delivery + visit context ---------- */
const CAN_POST=/^https?:$/.test(location.protocol)&&!/(^|\.)claude\.(ai|site)$|claudeusercontent\.com$|^localhost$|^127\./.test(location.hostname);
const enc=o=>Object.keys(o).map(k=>encodeURIComponent(k)+"="+encodeURIComponent(o[k]==null?"":o[k])).join("&");
async function sendForm(name,data){
  if(FORM_ENDPOINT){try{const r=await fetch(FORM_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({form:name,...data})});return r.ok}catch(e){return false}}
  if(!CAN_POST)return false;
  try{const r=await fetch("/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:enc({"form-name":name,...data})});return r.ok}catch(e){return false}
}
function beaconForm(name,data){
  if(!CAN_POST||FORM_ENDPOINT||!navigator.sendBeacon)return false;
  try{return navigator.sendBeacon("/",new Blob([enc({"form-name":name,...data})],{type:"application/x-www-form-urlencoded"}))}catch(e){return false}
}
const VISIT={start:Date.now(),landing:location.hash||"#home",ref:document.referrer||"direct",pages:[]};
const notePage=()=>{const h=(location.hash||"#home").split("?")[0];if(VISIT.pages.at(-1)!==h)VISIT.pages.push(h)};
notePage();addEventListener("hashchange",notePage);
function visitText(){
  const secs=Math.round((Date.now()-VISIT.start)/1000),tz=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){return "unknown"}})();
  const mobile=matchMedia("(pointer:coarse)").matches;
  return [`Submitted: ${new Date().toString()}`,`Time on site: ${Math.floor(secs/60)}m ${secs%60}s`,`Came from: ${VISIT.ref}`,`Landed on: ${VISIT.landing}`,`Pages viewed: ${VISIT.pages.join(" → ")}`,`Time zone: ${tz}`,`Language: ${navigator.language||"unknown"}`,`Device: ${mobile?"phone or tablet":"desktop"}, screen ${screen.width}×${screen.height}`,`Browser: ${navigator.userAgent}`].join("\n");
}

/* ---------- Sunny: chat assistant ---------- */
(()=>{
  const log=document.getElementById("sn-log"),form=document.getElementById("sn-form"),inp=document.getElementById("sn-in"),send=document.getElementById("sn-send");
  if(!log)return;
  const S={intent:"",details:"",fit:"",name:"",email:"",company:"",transcript:[],step:"start",done:false,partialSent:false};
  const esc=t=>t.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const scroll=()=>{log.scrollTop=log.scrollHeight};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function add(who,text){const d=document.createElement("div");d.className="sn-m "+who;d.innerHTML=esc(text);log.appendChild(d);S.transcript.push((who==="bot"?"Sunny: ":"Visitor: ")+text);scroll()}
  async function say(...lines){for(const l of lines){const t=document.createElement("div");t.className="sn-typing";t.innerHTML="<span></span><span></span><span></span>";log.appendChild(t);scroll();await wait(Math.min(1100,450+l.length*9));t.remove();add("bot",l)}}
  function quick(opts){const q=document.createElement("div");q.className="sn-quick";opts.forEach(([label,fn])=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.addEventListener("click",()=>{q.remove();add("me",label);fn()});q.appendChild(b)});log.appendChild(q);scroll()}
  function ask(step,ph){S.step=step;inp.disabled=false;send.disabled=false;inp.placeholder=ph;inp.value="";if(matchMedia("(pointer:fine)").matches)inp.focus({preventScroll:true})}
  function lock(ph){inp.disabled=true;send.disabled=true;inp.placeholder=ph||"Pick an option above"}
  const SDE=/\b(sde|software|engineer|engineering|developer|dev|full[\s-]?stack|back[\s-]?end|front[\s-]?end|web|java|python|javascript|typescript|react|angular|node|spring|cloud|aws|azure|gcp|devops|sre|platform|api|microservices?|data|ml|ai|llm|agent|mobile|programmer|coder|architect|tech(nical)? lead|backend|frontend)\b/i;
  const intents={
    hire:{label:"I'm hiring for a position",ask:["Great! What's the position?","Share the job title or paste the job description."],ph:"Job title or description"},
    project:{label:"I have a project",ask:["Nice! Tell me about the project.","What are you building, and where could Rohit help?"],ph:"Describe the project"},
    other:{label:"Another opportunity",ask:["Sounds interesting! What's the opportunity?"],ph:"Tell me a bit about it"}
  };
  function fitLine(text){
    const m=text.match(SDE);
    if(S.intent==="hire"){if(m){S.fit="SDE match";return ["That sounds like a great fit for Rohit!","He has built full stack software across healthcare, banking, higher education and energy, and he'd love to hear more."]}S.fit="other role";return ["Thanks for sharing! Rohit will take a look and see where he can help."]}
    if(S.intent==="project"){S.fit=m?"tech project":"project";return ["That sounds like something Rohit would enjoy building."]}
    S.fit="opportunity";return ["Thanks, that's helpful context."];
  }
  async function start(){
    await say("Hi, I'm Sunny, Rohit's assistant. 👋","What brings you here today?");
    quick([...Object.entries(intents).map(([k,v])=>[v.label,()=>pick(k)]),["Just looking around",browsing]]);
  }
  async function pick(k){S.intent=k;await say(...intents[k].ask);ask("details",intents[k].ph)}
  async function browsing(){S.intent="browsing";await say("Enjoy the tour! Try breaking the system on Home, it's fun.","If something comes up, I'm right here.");quick([["Actually, I have something",async()=>{await say("Sure! What is it about?");quick(Object.entries(intents).map(([k,v])=>[v.label,()=>pick(k)]))}]])}
  async function onText(t){
    lock("…");
    if(S.step==="details"){S.details=t;await say(...fitLine(t),"Who should Rohit reach out to? What's your name?");return ask("name","Your name")}
    if(S.step==="name"){if(t.length<2){await say("Could you share your full name?");return ask("name","Your name")}S.name=t;await say(`Thanks, ${t.split(" ")[0]}! What's the best email to reach you?`);return ask("email","you@company.com")}
    if(S.step==="email"){if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)){await say("That email doesn't look quite right. Could you check it?");return ask("email","you@company.com")}S.email=t;await say("And which company are you with?");quick([["Skip",()=>finish()]]);return ask("company","Company name")}
    if(S.step==="company"){log.querySelector(".sn-quick")?.remove();S.company=t;return finish()}
  }
  function payload(status){return {status,intent:S.intent,details:S.details,fit:S.fit,name:S.name,email:S.email,company:S.company,transcript:S.transcript.join("\n"),visit:visitText()}}
  async function finish(){
    lock("Sending…");S.done=true;
    const ok=await sendForm("sunny",payload("complete"));
    const first=S.name.split(" ")[0];
    if(ok){await say(`All set, ${first}! Rohit will get your message and reach out to you at ${S.email} soon.`,"Thanks for stopping by. ☀️");lock("Message sent");return}
    await say(`Thanks, ${first}! I couldn't send this automatically from here, so tap below to email it to Rohit.`);
    const text=`From: ${S.name}${S.company?" ("+S.company+")":""}\nEmail: ${S.email}\nAbout: ${S.intent}\n\n${S.details}`;
    const href=`mailto:${MY_EMAIL}?subject=${encodeURIComponent("Portfolio (Sunny): "+S.name)}&body=${encodeURIComponent(text)}`;
    const q=document.createElement("div");q.className="sn-quick";q.innerHTML=`<a class="pillbtn primary" href="${href}">Email Rohit</a>`;log.appendChild(q);scroll();lock("Done");
  }
  form.addEventListener("submit",e=>{e.preventDefault();const t=inp.value.trim();if(!t||inp.disabled)return;add("me",t);inp.value="";inp.style.height="46px";onText(t)});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
  inp.addEventListener("input",()=>{inp.style.height="46px";inp.style.height=Math.min(140,inp.scrollHeight)+"px"});
  const partial=()=>{if(S.done||S.partialSent||!S.details)return;S.partialSent=beaconForm("sunny",payload("left before finishing"))};
  addEventListener("pagehide",partial);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")partial()});
  let begun=false;const io=new IntersectionObserver(es=>{if(!begun&&es.some(x=>x.isIntersecting)){begun=true;io.disconnect();start()}},{threshold:.3});io.observe(document.getElementById("sunny"));
})();
