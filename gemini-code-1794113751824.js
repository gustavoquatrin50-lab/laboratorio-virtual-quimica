// --- ESTADO GLOBAL DA APLICAÇÃO ---
const appState = {
    bancada: {
        volumeTotal: 0,
        ph: 7,
        indicador: null,
        capacidadeMax: 100 // em ml
    }
};

// --- BASE DE DADOS DE REAGENTES ---
const reagentesDB = {
    'agua': { nome: 'Água Destilada', ph: 7 },
    'hcl': { nome: 'Ácido Clorídrico (HCl 0.1M)', ph: 1 },
    'naoh': { nome: 'Hidróxido de Sódio (NaOH 0.1M)', ph: 13 },
    'repolho': { nome: 'Extrato de Repolho Roxo', tipo: 'indicador' },
    'fenol': { nome: 'Fenolftaleína', tipo: 'indicador' }
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    configurarNavegacao();
    carregarAmbiente('intro'); // Carrega a tela inicial por padrão
});

// --- ROTEAMENTO E INTERFACE ---
function configurarNavegacao() {
    const links = document.querySelectorAll('.sidebar li');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.target.dataset.lab === 'em-breve') return;
            
            links.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            carregarAmbiente(e.target.dataset.lab);
        });
    });
}

function carregarAmbiente(labId) {
    const content = document.getElementById('main-content');
    
    if (labId === 'intro') {
        content.innerHTML = `
            <div class="card">
                <h2>BEM-VINDO AO LABORATÓRIO VIRTUAL</h2>
                <p>Nesta plataforma você poderá simular experimentos reais de Química de forma segura e interativa. Ideal para turmas do Ensino Médio e EJA.</p>
                <br>
                <h3>📌 Instruções Iniciais:</h3>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem; color: #555; line-height: 1.6;">
                    <li>Selecione um laboratório no menu lateral.</li>
                    <li>Leia a fundamentação teórica antes de iniciar.</li>
                    <li>Manipule as vidrarias e reagentes na bancada virtual.</li>
                    <li>Acompanhe os resultados no Diário de Observações.</li>
                </ul>
            </div>
        `;
    } else if (labId === 'acidos-bases') {
        content.innerHTML = renderizarBancadaAcidosBases();
        reiniciarBancada(); // Garante que a bancada inicie limpa
    }
}

// --- RENDERIZAÇÃO DA BANCADA ---
function renderizarBancadaAcidosBases() {
    return `
        <div class="card">
            <h2>Laboratório de Ácidos e Bases</h2>
            <p><strong>Objetivo:</strong> Identificar o caráter ácido, básico ou neutro das substâncias, observando a mudança de coloração através de indicadores de pH.</p>
        </div>
        
        <div class="bancada-container">
            <!-- Área da Vidraria Interativa -->
            <div class="card area-vidraria">
                <svg class="beaker-svg" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                    <!-- Líquido animado -->
                    <rect id="beaker-liquid" x="15" y="105" width="70" height="0" fill="rgba(173, 216, 230, 0)" class="beaker-liquid" rx="2" ry="2"/>
                    <!-- Vidro do Béquer -->
                    <path d="M 10 10 L 10 105 C 10 115 15 115 20 115 L 80 115 C 85 115 90 115 90 105 L 90 10 L 95 10 L 95 5 L 5 5 L 5 10 Z" class="beaker-glass"/>
                    <!-- Marcações de Volume -->
                    <line x1="10" y1="25" x2="25" y2="25" class="beaker-marks" />
                    <text x="30" y="29" font-size="6" fill="#7F8C8D">80ml</text>
                    <line x1="10" y1="45" x2="20" y2="45" class="beaker-marks" />
                    <text x="25" y="49" font-size="6" fill="#7F8C8D">60ml</text>
                    <line x1="10" y1="65" x2="25" y2="65" class="beaker-marks" />
                    <text x="30" y="69" font-size="6" fill="#7F8C8D">40ml</text>
                    <line x1="10" y1="85" x2="20" y2="85" class="beaker-marks" />
                    <text x="25" y="89" font-size="6" fill="#7F8C8D">20ml</text>
                </svg>
            </div>

            <!-- Controles do Experimento -->
            <div class="card painel-controles">
                <h3 style="color: var(--primary-blue); border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Painel de Ações</h3>
                
                <div class="control-group">
                    <label for="reagente-select">1. Adicionar Substância (20ml):</label>
                    <select id="reagente-select">
                        <option value="agua">Água Destilada</option>
                        <option value="hcl">Ácido Clorídrico (HCl)</option>
                        <option value="naoh">Hidróxido de Sódio (NaOH)</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label for="indicador-select">2. Gotejar Indicador de pH:</label>
                    <select id="indicador-select">
                        <option value="">Sem Indicador</option>
                        <option value="repolho">Extrato de Repolho Roxo</option>
                        <option value="fenol">Fenolftaleína</option>
                    </select>
                </div>

                <button class="btn btn-primary" onclick="adicionarReagente()">Adicionar ao Béquer</button>
                <button class="btn btn-danger" onclick="reiniciarBancada()">Lavar Vidraria (Resetar)</button>
            </div>
        </div>

        <!-- Diário de Observações -->
        <div class="card">
            <h3 style="margin-bottom: 1rem; color: #34495E;">📋 Diário de Observações</h3>
            <div class="log-area" id="log-area"></div>
        </div>
    `;
}

// --- LÓGICA DE SIMULAÇÃO QUÍMICA ---
window.adicionarReagente = function() {
    const st = appState.bancada;
    const idReagente = document.getElementById('reagente-select').value;
    const idIndicador = document.getElementById('indicador-select').value;
    const reagente = reagentesDB[idReagente];
    
    // Trava de segurança para não transbordar o béquer
    if (st.volumeTotal >= st.capacidadeMax) {
        adicionarLog("⚠️ ALERTA: Capacidade máxima do béquer atingida (100ml)!");
        return;
    }

    // Registra mudança de indicador
    if (idIndicador !== "" && st.indicador !== idIndicador) {
        st.indicador = idIndicador;
        adicionarLog(`💧 Foram gotejadas gotas de ${reagentesDB[idIndicador].nome}.`);
    }

    // Cálculo didático de pH (Simplificado para o Ensino Médio)
    if (st.volumeTotal === 0) {
        st.ph = reagente.ph;
    } else {
        // Simulação básica de neutralização de ácido forte e base forte
        if ((st.ph <= 3 && reagente.ph >= 11) || (st.ph >= 11 && reagente.ph <= 3)) {
            st.ph = 7; 
            adicionarLog("⚡ Reação de neutralização observada!");
        } else {
            // Mistura dilutiva didática
            st.ph = (st.ph + reagente.ph) / 2;
        }
    }

    // Atualiza o volume
    st.volumeTotal += 20;
    adicionarLog(`🧪 Adicionado 20ml de ${reagente.nome}. Volume Total: ${st.volumeTotal}ml.`);
    
    atualizarVisualVidraria();
};

window.reiniciarBancada = function() {
    appState.bancada.volumeTotal = 0;
    appState.bancada.ph = 7;
    appState.bancada.indicador = null;
    
    const selectInd = document.getElementById('indicador-select');
    if (selectInd) selectInd.value = "";
    
    document.getElementById('log-area').innerHTML = ''; // Limpa logs
    adicionarLog("Bancada inicializada. Vidraria limpa e pronta para uso.");
    atualizarVisualVidraria();
};

// --- MOTOR VISUAL (SVG) ---
function atualizarVisualVidraria() {
    const liquid = document.getElementById('beaker-liquid');
    if (!liquid) return;

    const st = appState.bancada;
    
    // Mapeamento: 0ml a 100ml -> Altura SVG de 0 a 90px (Base Y = 105)
    const alturaSVG = (st.volumeTotal / st.capacidadeMax) * 90;
    const novoY = 105 - alturaSVG;

    liquid.setAttribute('height', alturaSVG);
    liquid.setAttribute('y', novoY);
    
    // Cor condicional baseada no indicador e pH
    const cor = calcularCor(st.ph, st.indicador);
    liquid.setAttribute('fill', st.volumeTotal === 0 ? 'rgba(0,0,0,0)' : cor);
}

function calcularCor(ph, indicador) {
    if (!indicador) return 'rgba(173, 216, 230, 0.4)'; // Cor natural da água

    if (indicador === 'repolho') {
        if (ph < 3) return '#E53935'; // Ácido forte: Vermelho
        if (ph < 6) return '#AB47BC'; // Ácido fraco: Roxo claro
        if (ph < 8) return '#5E35B1'; // Neutro: Roxo escuro
        if (ph < 10) return '#1E88E5'; // Base fraca: Azul
        if (ph < 12) return '#43A047'; // Base média: Verde
        return '#FDD835'; // Base forte: Amarelo
    }
    
    if (indicador === 'fenol') {
        if (ph < 8.2) return 'rgba(255, 255, 255, 0.5)'; // Incolor
        return '#D81B60'; // Rosa carmim em meio básico
    }
}

// --- UTILITÁRIOS ---
function adicionarLog(mensagem) {
    const logArea = document.getElementById('log-area');
    if (!logArea) return;
    
    const time = new Date().toLocaleTimeString('pt-BR');
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span class="log-time">[${time}]</span> ${mensagem}`;
    
    logArea.appendChild(div);
    // Rolagem automática para o último registro
    logArea.scrollTop = logArea.scrollHeight;
}