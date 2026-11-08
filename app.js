const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const modal = $("#experimentModal");
const modalBody = $("#modalBody");
const F = 96485.33212;
const M_ZN = 65.38;

const experiments = {
  ph: {
    title:"Indicadores de pH", kicker:"ÁCIDOS E BASES • SIMULAÇÃO",
    html: () => `
      <div class="sim-layout">
        <div class="sim-panel">
          <div class="panel-label">BANCADA • INDICADOR DE REPOLHO ROXO</div>
          <div class="sim-visual"><div class="sample-liquid" id="phLiquid"></div><div class="visual-caption" id="phSampleName">Água — amostra selecionada</div></div>
          <div class="control-row"><label for="phSample">Selecione a amostra</label><select id="phSample"><option value="2">Suco de limão (modelo)</option><option value="3">Vinagre (modelo)</option><option value="5">Café (modelo)</option><option value="7" selected>Água aproximadamente neutra</option><option value="8">Solução de bicarbonato (modelo)</option><option value="10">Sabão diluído (modelo)</option><option value="12">Solução básica (modelo)</option></select></div>
          <div class="readout"><small>pH ATRIBUÍDO À AMOSTRA</small><strong id="phValue">7,0</strong><p id="phClass">Próximo da neutralidade, a 25 °C.</p></div>
          <div class="scale-bar"></div><div class="scale-labels"><span>Ácido</span><span>Neutro</span><span>Básico</span></div>
        </div>
        <aside class="theory-panel"><h3>O que observar?</h3><p>O extrato de repolho roxo contém antocianinas, pigmentos cuja estrutura e cor variam conforme o pH do meio. A cor é uma indicação qualitativa, não uma medição instrumental precisa.</p><div class="equation">pH = −log₁₀ [H⁺]</div><ul><li>Meios ácidos tendem a tons avermelhados.</li><li>Próximo da neutralidade, aparecem tons violetas.</li><li>Meios básicos podem apresentar tons azulados ou esverdeados.</li></ul><div class="question-box"><label for="phQuestion">Questão investigativa: qual amostra é mais básica?</label><select id="phQuestion"><option value="">Selecione uma resposta</option><option value="lim">Suco de limão</option><option value="agua">Água</option><option value="sabao">Sabão diluído</option></select><button class="sim-button" id="phCheck" style="margin-top:9px">Conferir resposta</button><div class="feedback" id="phFeedback" aria-live="polite"></div></div><p class="result-note">Nota: os valores são referências didáticas aproximadas. A composição real de cada produto pode alterar o pH.</p></aside>
      </div>`,
    init: () => {
      const select=$("#phSample"), liquid=$("#phLiquid");
      const names={"2":"Suco de limão","3":"Vinagre","5":"Café","7":"Água","8":"Bicarbonato","10":"Sabão diluído","12":"Solução básica"};
      const colors={"2":"#d95767","3":"#d97876","5":"#bd8c9a","7":"#8b78a8","8":"#637fc0","10":"#56a5a1","12":"#80b66c"};
      const update=()=>{const v=select.value;$("#phValue").textContent=Number(v).toFixed(1).replace(".",",");$("#phSampleName").textContent=names[v]+" — amostra selecionada";liquid.style.background=colors[v];$("#phClass").textContent=v<7?"Meio ácido no modelo.":v>7?"Meio básico no modelo.":"Próximo da neutralidade, a 25 °C.";};
      select.addEventListener("change",update);update();
      $("#phCheck").addEventListener("click",()=>{$("#phFeedback").textContent=$("#phQuestion").value==="sabao"?"Correto. No conjunto apresentado, o sabão diluído tem o maior pH.":"Revise a escala: quanto maior o pH, mais básica é a solução.";});
    }
  },
  dilution: {
    title:"Diluição de soluções", kicker:"QUÍMICA ANALÍTICA • SIMULAÇÃO",
    html: () => `
      <div class="sim-layout">
        <div class="sim-panel"><div class="panel-label">BANCADA • PREPARO DE SOLUÇÃO</div>
          <div class="sim-visual"><div style="text-align:center;color:#278e9a"><div style="font-size:67px">♧</div><div style="font:10px 'DM Mono'">BALÃO VOLUMÉTRICO</div></div><div class="visual-caption">Ajuste a concentração e o volume final</div></div>
          <div class="control-row"><label for="c1">Concentração inicial (mol/L) <b id="c1Out">1,00</b></label><input id="c1" type="range" min=".1" max="2" step=".05" value="1"></div>
          <div class="control-row"><label for="v1">Volume retirado (mL) <b id="v1Out">25</b></label><input id="v1" type="range" min="5" max="50" step="1" value="25"></div>
          <div class="control-row"><label for="v2">Volume final (mL) <b id="v2Out">100</b></label><input id="v2" type="range" min="50" max="250" step="5" value="100"></div>
          <div class="readout"><small>CONCENTRAÇÃO FINAL (C₂)</small><strong id="c2Out">0,250 mol/L</strong><p id="dilutionStatus">A solução final está mais diluída que a solução estoque.</p></div>
        </div>
        <aside class="theory-panel"><h3>Princípio da diluição</h3><p>Na diluição, adiciona-se solvente sem alterar a quantidade de soluto transferida. Sob essa condição, a quantidade de matéria do soluto permanece constante.</p><div class="equation">C₁ × V₁ = C₂ × V₂</div><p><b>Exemplo:</b> retirar 25 mL de uma solução 1,00 mol/L e completar o volume para 100 mL produz uma solução 0,250 mol/L.</p><ul><li>Use unidades de volume iguais nos dois termos.</li><li>O volume final é o volume total após completar o balão.</li><li>O modelo considera volumes aditivos e solução homogênea.</li></ul><div class="question-box"><label for="dilutionQuestion">Se o volume final dobrar, mantendo C₁ e V₁, o que acontece com C₂?</label><select id="dilutionQuestion"><option value="">Selecione</option><option value="dobra">Dobra</option><option value="metade">Cai pela metade</option><option value="igual">Permanece igual</option></select><button class="sim-button" id="dilutionCheck" style="margin-top:9px">Conferir resposta</button><div class="feedback" id="dilutionFeedback" aria-live="polite"></div></div></aside>
      </div>`,
    init: () => {
      const c1=$("#c1"),v1=$("#v1"),v2=$("#v2");
      const update=()=>{const C=+c1.value,V1=+v1.value,V2=+v2.value,C2=C*V1/V2;$("#c1Out").textContent=C.toFixed(2).replace(".",",");$("#v1Out").textContent=V1;$("#v2Out").textContent=V2;$("#c2Out").textContent=C2.toFixed(3).replace(".",",")+" mol/L";$("#dilutionStatus").textContent=V2>V1?"A solução final está mais diluída que a solução estoque.":"Atenção: confira os volumes; o volume final deve ser pelo menos igual ao volume retirado.";};
      [c1,v1,v2].forEach(x=>x.addEventListener("input",update));update();
      $("#dilutionCheck").addEventListener("click",()=>{$("#dilutionFeedback").textContent=$("#dilutionQuestion").value==="metade"?"Correto. Mantendo o soluto constante, dobrar o volume reduz a concentração à metade.":"Pense na conservação da quantidade de soluto: C₂ é inversamente proporcional a V₂.";});
    }
  },
  electro: {
    title:"Eletrodeposição de zinco", kicker:"ELETROQUÍMICA • LEI DE FARADAY",
    html: () => `
      <div class="sim-layout">
        <div class="sim-panel"><div class="panel-label">BANCADA • CÉLULA ELETROLÍTICA</div>
          <div class="sim-visual"><div style="display:flex;align-items:center;gap:25px;color:#527a8b"><div style="text-align:center"><div style="font-size:39px">▥</div><small>Ânodo</small></div><div style="width:85px;height:90px;border:3px solid #fff;border-radius:5px 5px 18px 18px;background:linear-gradient(to top,#8fc9ce 60%,transparent 60%);display:grid;place-items:center;font:10px 'DM Mono';color:#356b79">Zn²⁺</div><div style="text-align:center"><div style="font-size:39px;color:#bd9b63">▥</div><small>Cátodo</small></div></div><div class="visual-caption">Representação esquemática de uma célula eletrolítica</div></div>
          <div class="control-row"><label for="current">Corrente elétrica (A) <b id="currentOut">0,50</b></label><input id="current" type="range" min=".1" max="2" step=".1" value=".5"></div>
          <div class="control-row"><label for="time">Tempo (min) <b id="timeOut">30</b></label><input id="time" type="range" min="1" max="120" step="1" value="30"></div>
          <div class="readout"><small>MASSA TEÓRICA DE ZINCO</small><strong id="massOut">0,304 g</strong><p id="chargeOut">Carga transferida: 900 C.</p></div>
        </div>
        <aside class="theory-panel"><h3>Lei de Faraday</h3><p>Na eletrólise, a quantidade de substância formada no eletrodo depende da carga elétrica que atravessa o sistema, considerando a eficiência da corrente.</p><div class="equation">m = (M × I × t) / (n × F)</div><ul><li>M(Zn) = 65,38 g/mol</li><li>n = 2 elétrons por Zn²⁺ reduzido</li><li>F = 96.485 C/mol</li><li>t deve estar em segundos.</li></ul><p class="result-note">O cálculo considera eficiência de corrente de 100%. Em um experimento real, reações paralelas, transporte de massa e condições da superfície podem reduzir o rendimento.</p><div class="question-box"><label for="electroQuestion">Se o tempo dobrar e a corrente permanecer constante, a massa teórica:</label><select id="electroQuestion"><option value="">Selecione</option><option value="dobra">Dobra</option><option value="metade">Cai pela metade</option><option value="igual">Não muda</option></select><button class="sim-button" id="electroCheck" style="margin-top:9px">Conferir resposta</button><div class="feedback" id="electroFeedback" aria-live="polite"></div></div></aside>
      </div>`,
    init: () => {
      const I=$("#current"),t=$("#time");
      const update=()=>{const amps=+I.value,seconds=+t.value*60,Q=amps*seconds,m=M_ZN*Q/(2*F);$("#currentOut").textContent=amps.toFixed(1).replace(".",",");$("#timeOut").textContent=t.value;$("#massOut").textContent=m.toFixed(3).replace(".",",")+" g";$("#chargeOut").textContent="Carga transferida: "+Q.toFixed(0)+" C.";};
      [I,t].forEach(x=>x.addEventListener("input",update));update();
      $("#electroCheck").addEventListener("click",()=>{$("#electroFeedback").textContent=$("#electroQuestion").value==="dobra"?"Correto. Pela lei de Faraday, a massa é diretamente proporcional ao tempo, se a corrente for constante.":"Observe a proporcionalidade entre massa depositada, corrente e tempo.";});
    }
  },
  calor: {
    title:"Calorimetria", kicker:"FÍSICO-QUÍMICA • ENERGIA",
    html: () => `
      <div class="sim-layout">
        <div class="sim-panel"><div class="panel-label">BANCADA • TROCA DE ENERGIA TÉRMICA</div>
          <div class="sim-visual"><div style="text-align:center"><div style="font-size:64px">🌡️</div><div style="font:10px 'DM Mono';color:#6c8792">CALORÍMETRO IDEAL</div></div><div class="visual-caption">Modelo simplificado: água como substância de referência</div></div>
          <div class="control-row"><label for="massWater">Massa de água (g) <b id="massWaterOut">100</b></label><input id="massWater" type="range" min="25" max="500" step="25" value="100"></div>
          <div class="control-row"><label for="initialTemp">Temperatura inicial (°C) <b id="initialTempOut">20</b></label><input id="initialTemp" type="range" min="0" max="80" step="1" value="20"></div>
          <div class="control-row"><label for="finalTemp">Temperatura final (°C) <b id="finalTempOut">32</b></label><input id="finalTemp" type="range" min="0" max="100" step="1" value="32"></div>
          <div class="readout"><small>CALOR ABSORVIDO PELA ÁGUA</small><strong id="heatOut">+5.016 J</strong><p id="deltaOut">Variação de temperatura: +12 °C.</p></div>
        </div>
        <aside class="theory-panel"><h3>Quantidade de calor</h3><p>O calor sensível transferido pode ser estimado pela relação entre massa, calor específico e variação de temperatura.</p><div class="equation">Q = m × c × ΔT</div><ul><li>m = massa (g)</li><li>c = 4,18 J/(g·°C), para água líquida em aproximação escolar</li><li>ΔT = Tfinal − Tinicial</li></ul><p>Q positivo indica que a água absorveu energia; Q negativo indica que ela cedeu energia.</p><div class="question-box"><label for="heatQuestion">Se a massa de água dobrar e ΔT for igual, o calor calculado:</label><select id="heatQuestion"><option value="">Selecione</option><option value="dobra">Dobra</option><option value="metade">Cai pela metade</option><option value="igual">Permanece igual</option></select><button class="sim-button" id="heatCheck" style="margin-top:9px">Conferir resposta</button><div class="feedback" id="heatFeedback" aria-live="polite"></div></div><p class="result-note">O modelo desconsidera a capacidade térmica do calorímetro e perdas de calor para o ambiente.</p></aside>
      </div>`,
    init: () => {
      const m=$("#massWater"),ti=$("#initialTemp"),tf=$("#finalTemp");
      const update=()=>{const mass=+m.value,delta=+tf.value-(+ti.value),q=mass*4.18*delta;$("#massWaterOut").textContent=mass;$("#initialTempOut").textContent=ti.value;$("#finalTempOut").textContent=tf.value;$("#heatOut").textContent=(q>=0?"+":"")+q.toLocaleString("pt-BR",{maximumFractionDigits:0})+" J";$("#deltaOut").textContent="Variação de temperatura: "+(delta>=0?"+":"")+delta+" °C.";};
      [m,ti,tf].forEach(x=>x.addEventListener("input",update));update();
      $("#heatCheck").addEventListener("click",()=>{$("#heatFeedback").textContent=$("#heatQuestion").value==="dobra"?"Correto. Q é diretamente proporcional à massa, mantendo o calor específico e ΔT constantes.":"Pela equação Q = m·c·ΔT, analise a proporcionalidade entre as grandezas.";});
    }
  }
};

function openExperiment(id){
  const exp=experiments[id]; if(!exp)return;
  $("#modalTitle").textContent=exp.title;$("#modalKicker").textContent=exp.kicker;
  modalBody.innerHTML=exp.html();modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  exp.init();$("#closeModal").focus();
}
function closeExperiment(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow="";}
$$(".open-exp").forEach(btn=>btn.addEventListener("click",()=>openExperiment(btn.dataset.exp)));
$("#closeModal").addEventListener("click",closeExperiment);
modal.addEventListener("click",e=>{if(e.target===modal)closeExperiment();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("open"))closeExperiment();});

let activeFilter="todos";
function filterExperiments(){
  const term=$("#searchInput").value.trim().toLocaleLowerCase("pt-BR");let visible=0;
  $$(".experiment-card").forEach(card=>{
    const matchesFilter=activeFilter==="todos"||card.dataset.category===activeFilter;
    const matchesText=card.innerText.toLocaleLowerCase("pt-BR").includes(term);
    card.hidden=!(matchesFilter&&matchesText);if(!card.hidden)visible++;
  });
  $("#emptyState").hidden=visible!==0;
}
$("#searchInput").addEventListener("input",filterExperiments);
$$(".filter-pill").forEach(btn=>btn.addEventListener("click",()=>{activeFilter=btn.dataset.filter;$$(".filter-pill").forEach(b=>b.classList.toggle("active",b===btn));filterExperiments();}));
$$("[data-filter]").filter(el=>el.tagName==="A").forEach(link=>link.addEventListener("click",()=>{activeFilter=link.dataset.filter;$$(".filter-pill").forEach(b=>b.classList.toggle("active",b.dataset.filter===activeFilter));filterExperiments();}));
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mainNav"),open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
$$(".main-nav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));
$("#year").textContent=new Date().getFullYear();
