// ----- Datos base (de tu texto) -----
const dataSets = {
  promedios_2010_2015: {
    title: "Violencia sexual (2010–2015)",
    lead: "En Colombia se reportaron <strong>875.437</strong> víctimas directas (2010–2015).",
    hora: 16,
    dia: 400,
    mes: 12158,
    slides: [
      "Promedio anual: <strong>145.906</strong> mujeres víctimas directas.",
      "Equivale a <strong>12.158</strong> cada mes.",
      "Alrededor de <strong>400</strong> por día.",
      "En promedio <strong>16</strong> por hora."
    ]
  },
  cifras_2020: {
    title: "Violencia sexual (año 2020)",
    lead: "Del total de <strong>4.481.788</strong> mujeres víctimas del conflicto armado, <strong>28.377</strong> fueron víctimas de violencia sexual en 2020.",
    hora: Math.round(28377 / 365 / 24), // ≈3
    dia: Math.round(28377 / 365),       // ≈78
    mes: Math.round(28377 / 12),        // ≈2365
    slides: [
      "Víctimas de violencia sexual en 2020: <strong>28.377</strong>.",
      "Estimación mensual ~ <strong>2.365</strong>.",
      "Estimación diaria ~ <strong>78</strong>.",
      "Reparación: <strong>solo 1/4</strong> aprox."
    ]
  }
};

// ----- Elementos del DOM -----
const $title = document.getElementById("infoTitle");
const $text = document.getElementById("infoText");
const $h = document.getElementById("countHora");
const $d = document.getElementById("countDia");
const $m = document.getElementById("countMes");

const $modeProm = document.getElementById("modePromedios");
const $mode2020 = document.getElementById("mode2020");

const $pulse = document.getElementById("pulseButton");
const $btnDetalle = document.getElementById("btnDetalle");
const $btnFlash = document.getElementById("btnFlash");
const $modal = document.getElementById("modalDetalle");
const $modalClose = document.getElementById("modalClose");
const $modalOk = document.getElementById("modalOk");

// Panel expandible
const infoCard = document.getElementById("infoCard");
const btnExpand = document.getElementById("btnExpand");

// ----- Estado -----
let activeKey = "promedios_2010_2015";
let slideIndex = 0;

// ----- Utilidades -----
function setActive(key){
  activeKey = key;
  const ds = dataSets[key];
  $title.textContent = ds.title;
  $text.innerHTML = ds.lead;
  animateNumber($h, ds.hora);
  animateNumber($d, ds.dia);
  animateNumber($m, ds.mes);
  slideIndex = 0;

  if(key === "promedios_2010_2015"){
    $modeProm.classList.add("active"); $modeProm.setAttribute("aria-pressed", "true");
    $mode2020.classList.remove("active"); $mode2020.setAttribute("aria-pressed", "false");
  }else{
    $mode2020.classList.add("active"); $mode2020.setAttribute("aria-pressed", "true");
    $modeProm.classList.remove("active"); $modeProm.setAttribute("aria-pressed", "false");
  }
}

function animateNumber(el, target){
  const start = parseInt(el.textContent.replace(/\D/g,'')) || 0;
  const end = target;
  const dur = 600; // ms
  const t0 = performance.now();
  function tick(t){
    const k = Math.min(1, (t - t0)/dur);
    const val = Math.round(start + (end - start) * easeOutCubic(k));
    el.textContent = val.toLocaleString("es-ES");
    if(k < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }

// Acción informativa: destello de stats y aro exterior
function flashAction(){
  document.querySelectorAll(".stat").forEach(card=>{
    card.classList.add("flash");
    setTimeout(()=>card.classList.remove("flash"), 600);
  });
  $pulse.style.boxShadow = "0 0 0 4px rgba(55,214,157,.25), 0 0 32px rgba(55,214,157,.6)";
  setTimeout(()=>{ $pulse.style.boxShadow = ""; }, 600);
}

// Rotación de cápsulas por latido (cambia el texto principal)
function bindHeartbeatSlides(){
  const img = $pulse.querySelector("img");
  img.addEventListener("animationiteration", ()=>{
    const ds = dataSets[activeKey];
    if(!ds.slides || ds.slides.length === 0) return;
    slideIndex = (slideIndex + 1) % ds.slides.length;
    $text.innerHTML = ds.slides[slideIndex];
  });
}

// Modal
function openModal(){ if(typeof $modal.showModal === "function") $modal.showModal(); }
function closeModal(){ if($modal.open) $modal.close(); }

// ----- Eventos -----
$modeProm.addEventListener("click", ()=> setActive("promedios_2010_2015"));
$mode2020.addEventListener("click", ()=> setActive("cifras_2020"));

$btnDetalle.addEventListener("click", openModal);
$modalClose.addEventListener("click", closeModal);
$modalOk.addEventListener("click", closeModal);

// El botón central también abre detalle
$pulse.addEventListener("click", openModal);

// Botón de acción informativa
$btnFlash.addEventListener("click", ()=>{
  const ds = dataSets[activeKey];
  animateNumber($h, ds.hora);
  animateNumber($d, ds.dia);
  animateNumber($m, ds.mes);
  flashAction();
});

// Botón de ampliar/reducir panel
btnExpand.addEventListener("click", () => {
  const expanded = infoCard.classList.toggle("expanded");
  if (expanded) {
    infoCard.classList.remove("compact");
    btnExpand.setAttribute("aria-expanded", "true");
    btnExpand.title = "Reducir";
    btnExpand.textContent = "⤡";
  } else {
    infoCard.classList.add("compact");
    btnExpand.setAttribute("aria-expanded", "false");
    btnExpand.title = "Ampliar";
    btnExpand.textContent = "⤢";
  }
});

// ----- Inicio -----
setActive(activeKey);
bindHeartbeatSlides();
