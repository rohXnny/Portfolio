/* ---------- skills ---------- */
const TECH=[
 ["Java","Java","sq","Java has been my longest relationship. We've made it through many versions, countless annotations and one very long stack trace."],
 ["Python","Py","hex","Python is where an idea turns into working code before my coffee gets cold."],
 ["Spring Boot","Spring","circle","Spring Boot lets me stand up a production-ready service faster than I can name it."],
 ["FastAPI","Fast\nAPI","shield","Typed, async and quick. FastAPI is what I reach for when an API needs to be clean and fast."],
 ["Django","Django","sq","Django comes with batteries included. I mostly bring the business rules."],
 ["React","React","circle","React turns messy operations workflows into screens people actually enjoy using."],
 ["Angular","NG","shield","Angular keeps big banking front ends structured, typed and predictable."],
 ["TypeScript","TS","sq","TypeScript catches my mistakes before users do, which I appreciate more than I admit."],
 ["SQL","SQL","hex","I read query plans for fun. An index in the right place is my favourite kind of magic."],
 ["Kafka","Kafka","circle","Events in order, delivered once. Kafka is how my services talk without shouting."],
 ["Redis","Redis","hex","When milliseconds matter, Redis is the shortcut, and sometimes the lock on the door."],
 ["Docker","Docker","sq","If it runs in my container, it runs in yours. That's the deal."],
 ["Kubernetes","K8s","hex","Kubernetes keeps things running at 3 a.m. so I don't have to."],
 ["AWS & GCP","Cloud","circle","From clusters to serverless functions, I ship to whichever cloud the team calls home."],
 ["Git","Git","shield","Every commit tells a story. I try to keep mine short and readable."],
 ["Security","Auth","shield","Sign-in, tokens, roles and audit trails. Security is part of the design, never an afterthought."],
 ["AI & RAG","RAG","hex","I build AI assistants that cite their sources and know when to hand over to a human."],
 ["AI coding tools","AI","circle","Claude Code, Copilot and Cursor are my pair programmers. Tests and reviewers still get the final say."]
];
const SHAPES={
  sq:'<rect class="sh" x="8" y="8" width="96" height="96" rx="6"/><rect class="sh2" x="15" y="15" width="82" height="82" rx="3"/>',
  hex:'<path class="sh" d="M56 4 L101 30 L101 82 L56 108 L11 82 L11 30 Z"/><path class="sh2" d="M56 13 L93 35 L93 77 L56 99 L19 77 L19 35 Z"/>',
  circle:'<circle class="sh" cx="56" cy="56" r="50"/><circle class="sh2" cx="56" cy="56" r="42"/>',
  shield:'<path class="sh" d="M16 16 L96 16 L90 86 L56 104 L22 86 Z"/><path class="sh2" d="M24 23 L88 23 L83 81 L56 96 L29 81 Z"/>'
};
const icons=document.getElementById("icons"),tName=document.getElementById("t-name"),tText=document.getElementById("t-text");
icons.innerHTML=TECH.map((t,i)=>{
  const lines=t[1].split("\n"),fs=lines.length>1?20:(t[1].length>4?(t[1].length>5?18:22):30);
  const txt=lines.map((l,k)=>`<text x="56" y="${56+(k-(lines.length-1)/2)*22}" text-anchor="middle" dominant-baseline="central" font-size="${fs}">${l}</text>`).join("");
  return `<button class="ic" type="button" data-i="${i}" aria-label="${t[0]}"><svg viewBox="0 0 112 112">${SHAPES[t[2]]}${txt}</svg></button>`}).join("");
function pick(i){const t=TECH[i];tName.textContent=t[0];tText.textContent=t[3];icons.querySelectorAll(".ic").forEach(b=>b.classList.toggle("sel",+b.dataset.i===i))}
icons.addEventListener("pointerover",e=>{const b=e.target.closest(".ic");if(b)pick(+b.dataset.i)});
icons.addEventListener("click",e=>{const b=e.target.closest(".ic");if(b)pick(+b.dataset.i)});
icons.addEventListener("focusin",e=>{const b=e.target.closest(".ic");if(b)pick(+b.dataset.i)});
pick(0);

const SOFT=[
 ["Stakeholder Partnership","I work directly with operations, risk, product and business leaders to turn their problems into clear, scoped technical plans.",'<circle cx="8" cy="9" r="3.5"/><circle cx="16" cy="9" r="3.5"/><path d="M2 21c0-3.5 2.7-6 6-6s6 2.5 6 6M10 21c0-3.5 2.7-6 6-6s6 2.5 6 6"/>'],
 ["Cross-functional Collaboration","From QA to support to architecture, I bring the right people into the room early so launches have no surprises.",'<path d="M4 5h11a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3v-3H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"/><circle cx="6.5" cy="10.5" r=".6"/><circle cx="9.5" cy="10.5" r=".6"/><circle cx="12.5" cy="10.5" r=".6"/>'],
 ["Technical Leadership","I lead design reviews, weigh trade-offs out loud and document decisions so the whole team can move with confidence.",'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'],
 ["Mentoring & Code Review","I pair with newer engineers on legacy code and give reviews that teach, not just block.",'<path d="M3 6l9-3 9 3-9 3z"/><path d="M7 8v5c3 2 7 2 10 0V8"/><path d="M21 6v6"/>'],
 ["Ownership in Production","When something breaks I stay with it: find the root cause, fix it and write the runbook so it doesn't happen again.",'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'],
 ["Agile Delivery","I break big goals into small, shippable steps and keep work moving through planning, standups and retros.",'<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4h-4"/>'],
 ["Clear Communication","I explain technical risk in plain language to non-technical partners, and write docs people actually read.",'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'],
 ["Product Thinking","I ask who uses a feature and why, so every API and screen serves a real business outcome.",'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'],
 ["Responsible AI Adoption","I help teams bring in AI tools with guardrails: approved data, human review and clear rules on what ships.",'<path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>']
];
const soft=document.getElementById("soft");
soft.innerHTML=SOFT.map(s=>`<div class="sc"><svg viewBox="0 0 24 24" aria-hidden="true">${s[2]}</svg><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join("");
soft.querySelectorAll(".sc").forEach(el=>{
  el.addEventListener("pointermove",e=>{const b=el.getBoundingClientRect();el.style.setProperty("--mx",(e.clientX-b.left)+"px");el.style.setProperty("--my",(e.clientY-b.top)+"px")});
  el.addEventListener("pointerleave",()=>{el.style.setProperty("--mx","-400px");el.style.setProperty("--my","-400px")});
});
const sw=document.getElementById("sw"),tech=document.getElementById("tech");
function setSoft(on){sw.setAttribute("aria-checked",on);tech.hidden=on;soft.hidden=!on}
sw.addEventListener("click",()=>setSoft(sw.getAttribute("aria-checked")!=="true"));
document.getElementById("lbl-tech").addEventListener("click",e=>{e.preventDefault();setSoft(false)});
document.getElementById("lbl-soft").addEventListener("click",e=>{e.preventDefault();setSoft(true)});
