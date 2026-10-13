/* ---------- pages ---------- */
const pills=[...document.querySelectorAll("#pill a")],pages=[...document.querySelectorAll(".page")];
function showPage(id,push){
  if(!pages.some(p=>p.id===id))id="home";
  current=id;
  pages.forEach(p=>{const on=p.id===id;p.hidden=!on;if(on){p.classList.remove("enter");void p.offsetWidth;p.classList.add("enter")}});
  pills.forEach(a=>a.classList.toggle("on",a.getAttribute("href")==="#"+id));
  document.body.dataset.page=id;
  document.querySelector(".scene").style.visibility=id==="home"?"visible":"hidden";
  scrollTo(0,0);if(typeof about==="function")about();if(typeof home==="function")home();if(window.hintState)hintState();if(id!=="home"&&typeof setGreet==="function")setGreet(false,false);
  if(push&&location.hash!=="#"+id){try{history.pushState(null,"","#"+id)}catch(e){}}
}
document.addEventListener("click",e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute("href").slice(1);if(pages.some(p=>p.id===id)){e.preventDefault();showPage(id,true)}});
addEventListener("popstate",()=>showPage(location.hash.slice(1)||"home",false));
addEventListener("hashchange",()=>showPage(location.hash.slice(1)||"home",false));
showPage(location.hash.slice(1)||"home",false);
