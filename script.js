/* ========================================
   SCRIPT CIPA CHEVROLET - ELEIÇÃO
   ======================================== */

/* ===== DADOS DA APLICAÇÃO =====
   
   Explicação:
   - Estas variáveis armazenam os dados da aplicação
   - Elas funcionam como um "banco de dados" temporário
   - Os dados desaparecem quando você fecha a página
*/

// Array de candidatos (começa com alguns exemplos)
let candidates = [
    {
        id: 1,
        name: 'João Silva',
        role: 'Operário - Setor A',
        image: null
    },
    {
        id: 2,
        name: 'Maria Santos',
        role: 'Supervisora - Setor B',
        image: null
    },
    {
        id: 3,
        name: 'Carlos Oliveira',
        role: 'Técnico - Manutenção',
        image: null
    }
];

// Objeto para armazenar votos (chave = ID do candidato, valor = número de votos)
// Exemplo: votes[1] = 5 significa que o candidato 1 recebeu 5 votos
let votes = {};

// Set para armazenar CPFs que já votaram
// Set é um tipo especial que só permite valores únicos
// Exemplo: votedCPFs.has('12345678900') verifica se este CPF já votou
let votedCPFs = new Set();

// Array para armazenar o registro de votos (CPF + candidato)
// Apenas o admin pode ver isso
let voteRecords = [];

// Contador de votos nulos
let nullVotes = 0;

// Variáveis de controle
let electionOpen = false;  // A votação está aberta?
let adminAuthenticated = false;  // O admin fez login?
let selectedCandidate = null;  // Qual candidato foi selecionado para votação?

// Senha do admin (em produção, isso seria armazenado de forma segura no servidor)
const ADMIN_PASSWORD = 'admin123';

/* ========================================
   FUNÇÕES UTILITÁRIAS
   ======================================== */

/* ===== FUNÇÃO: Validar CPF =====
   
   Explicação:
   - Esta função verifica se um CPF é válido
   - Usa o algoritmo oficial de validação de CPF brasileiro
   - Retorna true se válido, false se inválido
   
   Parâmetro:
   - cpf: string com o CPF a validar
   
   Retorno:
   - true ou false
*/

function validateCPF(cpf) {
    // Remove todos os caracteres que não são números
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem exatamente 11 dígitos
    if (cpf.length !== 11) {
        return false;
    }
    
    // Verifica se todos os dígitos são iguais (ex: 11111111111)
    // Isso é considerado um CPF inválido
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    // Calcula o primeiro dígito verificador
    let sum = 0;
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) {
        return false;
    }
    
    // Calcula o segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) {
        return false;
    }
    
    // Se passou em todos os testes, o CPF é válido
    return true;
}

/* ===== FUNÇÃO: Navegar entre páginas =====
   
   Explicação:
   - Esta função mostra uma página e esconde as outras
   - É chamada quando o usuário clica em um link do menu
   
   Parâmetro:
   - pageId: o ID da página a mostrar (ex: 'home', 'vote', 'results')
*/

function goToPage(pageId) {
    // Seleciona todas as páginas
    const pages = document.querySelectorAll('.page');
    
    // Remove a classe 'active' de todas as páginas (as esconde)
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Encontra a página com o ID solicitado
    const targetPage = document.getElementById(pageId);
    
    // Adiciona a classe 'active' à página (a mostra)
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Executa funções específicas quando certa página é aberta
    if (pageId === 'candidates') {
        renderCandidates();  // Mostra os candidatos
    } else if (pageId === 'vote') {
        renderVoteForm();  // Mostra o formulário de votação
    } else if (pageId === 'results') {
        renderResults();  // Mostra os resultados
    } else if (pageId === 'admin') {
        renderAdminPanel();  // Mostra o painel admin
    }
    
    // Faz scroll para o topo da página
    window.scrollTo(0, 0);
}

/* ========================================
   RENDERIZAÇÃO DE CANDIDATOS
   ======================================== */

/* ===== FUNÇÃO: Renderizar candidatos =====
   
   Explicação:
   - Esta função cria e exibe os cards dos candidatos
   - Percorre o array 'candidates' e cria um card para cada um
   - Cada card mostra nome e cargo do candidato
*/

function renderCandidates() {
    // Encontra o container onde os candidatos serão exibidos
    const container = document.getElementById('candidatesContainer');
    
    // Limpa o container (remove conteúdo anterior)
    container.innerHTML = '';
    
    // Se não houver candidatos, mostra uma mensagem
    if (candidates.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum candidato registado.</p>';
        return;
    }
    
    // Percorre cada candidato
    candidates.forEach(candidate => {
        // Cria um elemento div para o card
        const card = document.createElement('div');
        card.className = 'candidate-card';
        
        // Define o HTML dentro do card
        let cardHTML = '';
        
        // Se houver imagem, exibe
        if (candidate.image) {
            cardHTML += `<img src="${candidate.image}" class="candidate-image" alt="${candidate.name}">`;
        } else {
            cardHTML += `<div class="candidate-image-placeholder">Sem foto</div>`;
        }
        
        cardHTML += `
            <div class="candidate-header">
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-role">${candidate.role}</div>
            </div>
            <div class="candidate-body">
                <p class="candidate-description">Candidato à CIPA</p>
            </div>
        `;
        
        card.innerHTML = cardHTML;
        
        // Adiciona o card ao container
        container.appendChild(card);
    });
}

/* ========================================
   VOTAÇÃO
   ======================================== */

/* ===== FUNÇÃO: Renderizar formulário de votação =====
   
   Explicação:
   - Esta função cria os botões para selecionar candidatos
   - Mostra uma mensagem se a votação não está aberta
*/

function renderVoteForm() {
    // Encontra o container dos candidatos para votação
    const container = document.getElementById('candidatesVote');
    
    // Limpa o container
    container.innerHTML = '';
    
    // Verifica se a votação está aberta
    if (!electionOpen) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #DC3545;">A votação não está aberta no momento.</p>';
        return;
    }
    
    // Se não houver candidatos, mostra uma mensagem
    if (candidates.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum candidato disponível.</p>';
        return;
    }
    
    // Percorre cada candidato e cria um botão para votação
    candidates.forEach(candidate => {
        // Cria um elemento div para a opção de votação
        const option = document.createElement('div');
        option.className = 'vote-option';
        
        // Se este candidato foi selecionado, adiciona a classe 'selected'
        if (selectedCandidate === candidate.id) {
            option.classList.add('selected');
        }
        
        // Define o conteúdo
        option.innerHTML = `
            <div class="candidate-vote-name">${candidate.name}</div>
            <div style="font-size: 0.85rem; opacity: 0.8;">${candidate.role}</div>
        `;
        
        // Quando clica na opção, seleciona o candidato
        option.onclick = () => selectCandidateForVote(candidate.id);
        
        // Adiciona a opção ao container
        container.appendChild(option);
    });
}

/* ===== FUNÇÃO: Selecionar candidato para votação =====
   
   Explicação:
   - Esta função é chamada quando o usuário clica em um candidato
   - Armazena o ID do candidato selecionado
   - Re-renderiza o formulário para mostrar a seleção
*/

function selectCandidateForVote(candidateId) {
    selectedCandidate = candidateId;
    renderVoteForm();  // Atualiza a exibição
}

/* ===== FUNÇÃO: Submeter voto =====
   
   Explicação:
   - Esta função é chamada quando o usuário clica em "Confirmar Voto"
   - Valida o CPF
   - Verifica se o CPF já votou
   - Registra o voto de forma anónima
   - Mostra uma mensagem de sucesso ou erro
*/

function submitVote() {
    // Obtém o CPF
    const cpfInput = document.getElementById('cpf').value.trim();
    
    // Encontra o elemento de mensagem
    const messageDiv = document.getElementById('voteMessage');
    
    // Limpa a mensagem anterior
    messageDiv.innerHTML = '';
    messageDiv.className = 'message';
    
    // ===== VALIDAÇÕES =====
    
    // Verifica se o CPF foi preenchido
    if (!cpfInput) {
        messageDiv.innerHTML = 'Por favor, insira seu CPF.';
        messageDiv.className = 'message error';
        return;
    }
    
    // Verifica se o CPF é válido
    if (!validateCPF(cpfInput)) {
        messageDiv.innerHTML = 'CPF inválido. Por favor, verifique e tente novamente.';
        messageDiv.className = 'message error';
        return;
    }
    
    // Verifica se este CPF já votou
    if (votedCPFs.has(cpfInput)) {
        messageDiv.innerHTML = 'Este CPF já votou. Cada eleitor pode votar apenas uma vez.';
        messageDiv.className = 'message error';
        return;
    }
    
    // Verifica se um candidato foi selecionado
    if (selectedCandidate === null) {
        messageDiv.innerHTML = 'Por favor, selecione um candidato.';
        messageDiv.className = 'message error';
        return;
    }
    
    // ===== REGISTRAR VOTO =====
    
    // Adiciona o CPF ao Set de CPFs que votaram
    votedCPFs.add(cpfInput);
    
    // Incrementa o contador de votos do candidato
    if (!votes[selectedCandidate]) {
        votes[selectedCandidate] = 0;
    }
    votes[selectedCandidate]++;
    
    // Registra o voto com CPF e candidato (apenas admin pode ver)
    voteRecords.push({
        cpf: cpfInput,
        candidateId: selectedCandidate,
        timestamp: new Date().toLocaleString('pt-BR')
    });
    
    // ===== FEEDBACK AO USUARIO =====
    
    // Mostra mensagem de sucesso
    messageDiv.innerHTML = '✓ Seu voto foi registado com sucesso! Obrigado por participar.';
    messageDiv.className = 'message success';
    
    // Limpa os campos
    document.getElementById('cpf').value = '';
    
    // Reseta a seleção de candidato
    selectedCandidate = null;
    
    // Atualiza a exibição do formulário
    renderVoteForm();
    
    // Atualiza as estatísticas do admin
    updateStats();
    
    // Salva os dados no localStorage
    saveData();
}

/* ========================================
   RESULTADOS
   ======================================== */

/* ===== FUNÇÃO: Renderizar resultados =====
   
   Explicação:
   - Esta função exibe os resultados da votação
   - Mostra um gráfico de barras com o percentual de votos
   - Ordena os candidatos por número de votos (maior para menor)
*/

function renderResults() {
    // Encontra o container dos resultados
    const container = document.getElementById('resultsContainer');
    
    // Limpa o container
    container.innerHTML = '';
    
    // Se não houver candidatos, mostra uma mensagem
    if (candidates.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Nenhum candidato registado.</p>';
        return;
    }
    
    // Calcula o total de votos (candidatos + nulos)
    const candidateVotesTotal = Object.values(votes).reduce((sum, count) => sum + count, 0);
    const totalVotes = candidateVotesTotal + nullVotes;
    
    // Se não houver votos, mostra mensagem
    if (totalVotes === 0) {
        container.innerHTML = '<p style="text-align: center;">Nenhum voto registado ainda.</p>';
        return;
    }
    
    // Cria um array com os candidatos e seus votos, ordena por votos
    const sortedCandidates = candidates.map(candidate => ({
        ...candidate,
        voteCount: votes[candidate.id] || 0
    })).sort((a, b) => b.voteCount - a.voteCount);
    
    // Percorre cada candidato e cria um item de resultado
    sortedCandidates.forEach(candidate => {
        const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes * 100).toFixed(1) : 0;
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-name">${candidate.name}</span>
                <span class="result-votes">${candidate.voteCount} voto${candidate.voteCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="result-bar">
                <div class="result-fill" style="width: ${percentage}%">
                    ${percentage > 5 ? percentage + '%' : ''}
                </div>
            </div>
            <div style="font-size: 0.8rem; color: #666; margin-top: 5px; text-align: right;">
                ${percentage}% dos votos
            </div>
        `;
        
        container.appendChild(resultItem);
    });

    // Votos nulos — exibidos separadamente, após todos os candidatos
    if (nullVotes > 0) {
        const percentage = (nullVotes / totalVotes * 100).toFixed(1);
        
        const nullItem = document.createElement('div');
        nullItem.className = 'result-item';
        nullItem.style.backgroundColor = '#FFF3E0';
        nullItem.style.borderLeft = '4px solid #FF6F00';
        
        nullItem.innerHTML = `
            <div class="result-header">
                <span class="result-name" style="color: #FF6F00;">Votos Nulos</span>
                <span class="result-votes">${nullVotes} voto${nullVotes !== 1 ? 's' : ''}</span>
            </div>
            <div class="result-bar">
                <div class="result-fill" style="width: ${percentage}%; background-color: #FF6F00;">
                    ${percentage > 5 ? percentage + '%' : ''}
                </div>
            </div>
            <div style="font-size: 0.8rem; color: #666; margin-top: 5px; text-align: right;">
                ${percentage}% dos votos
            </div>
        `;
        
        container.appendChild(nullItem);
    }
}

/* ========================================
   PAINEL ADMINISTRATIVO
   ======================================== */

/* ===== FUNÇÃO: Login do admin =====
   
   Explicação:
   - Esta função verifica a senha do admin
   - Se correta, mostra o painel administrativo
   - Se incorreta, mostra um erro
*/

function adminLogin() {
    // Obtém a senha digitada
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput.value;
    
    // Verifica se a senha está correta
    if (password === ADMIN_PASSWORD) {
        // Marca como autenticado
        adminAuthenticated = true;
        
        // Esconde a tela de login
        document.getElementById('adminLogin').style.display = 'none';
        
        // Mostra o painel do admin
        document.getElementById('adminPanel').style.display = 'block';
        
        // Renderiza o painel
        renderAdminPanel();
    } else {
        // Mostra um erro
        alert('Senha incorreta!');
        passwordInput.value = '';
    }
}

/* ===== FUNÇÃO: Logout do admin =====
   
   Explicação:
   - Esta função desconecta o admin
   - Esconde o painel e mostra a tela de login novamente
*/

function adminLogout() {
    // Marca como não autenticado
    adminAuthenticated = false;
    
    // Esconde o painel do admin
    document.getElementById('adminPanel').style.display = 'none';
    
    // Mostra a tela de login
    document.getElementById('adminLogin').style.display = 'flex';
    
    // Limpa o campo de senha
    document.getElementById('adminPassword').value = '';
}

/* ===== FUNÇÃO: Renderizar painel admin =====
   
   Explicação:
   - Esta função atualiza a exibição do painel administrativo
   - Mostra o status da votação
   - Mostra a lista de candidatos
   - Mostra as estatísticas
*/

function renderAdminPanel() {
    // Se não está autenticado, não faz nada
    if (!adminAuthenticated) {
        return;
    }
    
    // Atualiza o status da votação
    const statusBadge = document.getElementById('electionStatus');
    statusBadge.textContent = electionOpen ? 'Aberta' : 'Fechada';
    statusBadge.className = electionOpen ? 'status-badge open' : 'status-badge closed';
    
    // Renderiza a lista de candidatos
    renderAdminCandidatesList();
    
    // Renderiza a edição de votos
    renderEditVotes();
    
    // Renderiza o registro de votos
    renderVoteRecords();
    
    // Atualiza as estatísticas
    updateStats();
}

/* ===== FUNÇÃO: Renderizar lista de candidatos no admin =====
   
   Explicação:
   - Esta função mostra a lista de candidatos para o admin
   - Cada candidato tem botões para editar, remover e fazer upload de foto
*/

function renderAdminCandidatesList() {
    // Encontra o container
    const container = document.getElementById('adminCandidatesList');
    
    // Limpa o container
    container.innerHTML = '';
    
    // Se não houver candidatos, mostra mensagem
    if (candidates.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Nenhum candidato registado.</p>';
        return;
    }
    
    // Percorre cada candidato
    candidates.forEach((candidate, index) => {
        // Cria um elemento para o candidato
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.padding = '15px';
        item.style.borderBottom = '1px solid #ddd';
        
        // Cria o HTML
        item.innerHTML = `
            <div>
                <strong>${candidate.name}</strong>
                <div style="font-size: 0.9rem; color: #666;">${candidate.role}</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <input type="file" id="imageInput${candidate.id}" style="display: none;" accept="image/*" onchange="uploadCandidateImage(${candidate.id})">
                <button class="btn btn-secondary btn-small" onclick="document.getElementById('imageInput${candidate.id}').click()">Foto</button>
                <button class="btn btn-danger btn-small" onclick="deleteCandidate(${index})">Remover</button>
            </div>
        `;
        
        // Adiciona ao container
        container.appendChild(item);
    });
}

/* ===== FUNÇÃO: Adicionar candidato =====
   
   Explicação:
   - Esta função adiciona um novo candidato à lista
   - Obtém os dados dos campos de entrada
   - Cria um novo objeto candidato
   - Adiciona ao array de candidatos
   - Atualiza a exibição
*/

function addCandidate() {
    // Obtém os valores dos campos
    const nameInput = document.getElementById('candidateName');
    const roleInput = document.getElementById('candidateRole');
    
    const name = nameInput.value.trim();
    const role = roleInput.value.trim();
    
    // Valida se o nome foi preenchido
    if (!name) {
        alert('Por favor, insira o nome do candidato.');
        return;
    }
    
    // Cria um novo objeto candidato
    const newCandidate = {
        id: Math.max(...candidates.map(c => c.id), 0) + 1,  // ID único
        name: name,
        role: role || 'Sem cargo especificado',
        image: null  // Imagem será adicionada depois
    };
    
    // Adiciona o novo candidato ao array
    candidates.push(newCandidate);
    
    // Inicializa o contador de votos para este candidato
    votes[newCandidate.id] = 0;
    
    // Limpa os campos
    nameInput.value = '';
    roleInput.value = '';
    
    // Atualiza a exibição
    renderAdminCandidatesList();
    renderCandidates();
    renderVoteForm();
    renderEditVotes();  // Atualiza a seção de edição de votos
    
    // Salva os dados
    saveData();
    
    // Mostra um alerta de sucesso
    alert('Candidato adicionado com sucesso!');
}

/* ===== FUNÇÃO: Remover candidato =====
   
   Explicação:
   - Esta função remove um candidato da lista
   - Também remove seus votos
   - Atualiza a exibição
*/

function deleteCandidate(index) {
    // Pede confirmação
    if (!confirm('Tem certeza que deseja remover este candidato?')) {
        return;
    }
    
    // Obtém o candidato a ser removido
    const candidateToDelete = candidates[index];
    
    // Remove o candidato do array
    candidates.splice(index, 1);
    
    // Remove os votos deste candidato
    delete votes[candidateToDelete.id];
    
    // Remove os registros de voto deste candidato
    voteRecords = voteRecords.filter(record => record.candidateId !== candidateToDelete.id);
    
    // Atualiza a exibição
    renderAdminCandidatesList();
    renderCandidates();
    renderVoteForm();
    renderEditVotes();  // Atualiza a seção de edição de votos
    renderVoteRecords();
    updateStats();
    renderResults();
    
    // Salva os dados
    saveData();
}

/* ===== FUNÇÃO: Upload de foto do candidato =====
   
   Explicação:
   - Esta função permite fazer upload de uma foto para o candidato
   - Converte a imagem para base64 para armazenar no localStorage
   - Atualiza a exibição
*/

function uploadCandidateImage(candidateId) {
    // Encontra o input de arquivo
    const fileInput = document.getElementById(`imageInput${candidateId}`);
    const file = fileInput.files[0];
    
    // Se não houver arquivo, retorna
    if (!file) {
        return;
    }
    
    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida.');
        return;
    }
    
    // Verifica o tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem não pode ser maior que 5MB.');
        return;
    }
    
    // Cria um leitor de arquivo
    const reader = new FileReader();
    
    // Quando o arquivo for lido
    reader.onload = (event) => {
        // Encontra o candidato
        const candidate = candidates.find(c => c.id === candidateId);
        
        // Salva a imagem em base64
        candidate.image = event.target.result;
        
        // Atualiza a exibição
        renderAdminCandidatesList();
        renderCandidates();
        renderEditVotes();
        
        // Salva os dados
        saveData();
        
        // Mostra um alerta de sucesso
        alert('Foto adicionada com sucesso!');
    };
    
    // Lê o arquivo como data URL
    reader.readAsDataURL(file);
}

/* ===== FUNÇÃO: Renderizar registro de votos =====
   
   Explicação:
   - Esta função mostra o registro de votos (apenas admin)
   - Mostra CPF, candidato e opção de remover
*/

function renderVoteRecords() {
    // Encontra o container
    const container = document.getElementById('voteRecordList');
    
    // Limpa o container
    container.innerHTML = '';
    
    // Se não houver votos, mostra mensagem
    if (voteRecords.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">Nenhum voto registado ainda.</p>';
        return;
    }
    
    // Percorre cada voto (em ordem reversa para mostrar os mais recentes primeiro)
    [...voteRecords].reverse().forEach((record, index) => {
        // Encontra o candidato
        const candidate = candidates.find(c => c.id === record.candidateId);
        const candidateName = candidate ? candidate.name : 'Candidato desconhecido';
        
        // Encontra o índice original do voto (porque está invertido)
        const originalIndex = voteRecords.length - 1 - index;
        
        // Cria um elemento div para o registro
        const item = document.createElement('div');
        item.className = 'vote-record-item';
        
        // Define o HTML com botão de remover
        item.innerHTML = `
            <div style="flex: 1;">
                <div style="font-size: 0.85rem; color: #888;">
                    <span style="font-family: monospace; font-weight: 600;">${record.cpf}</span> → 
                    <span style="color: var(--color-cipa-green); font-weight: 500;">${candidateName}</span>
                </div>
            </div>
            <button class="btn btn-danger btn-small" onclick="deleteVoteRecord(${originalIndex})" style="white-space: nowrap; margin-left: 10px;">Remover</button>
        `;
        
        // Adiciona o item ao container
        container.appendChild(item);
    });
}

/* ===== FUNÇÃO: Alternar status da votação =====
   
   Explicação:
   - Esta função abre ou fecha a votação
   - Atualiza a variável electionOpen
   - Atualiza a exibição
*/

function toggleElection() {
    // Inverte o status
    electionOpen = !electionOpen;
    
    // Atualiza a exibição
    renderAdminPanel();
    renderVoteForm();
    
    // Salva os dados
    saveData();
    
    // Mostra um alerta
    alert(electionOpen ? 'Votação aberta!' : 'Votação fechada!');
}

/* ===== FUNÇÃO: Limpar CPFs votados =====
   
   Explicação:
   - Esta função limpa a lista de CPFs que votaram
   - Permite que os mesmos CPFs votem novamente
*/

function clearVotedCPFs() {
    // Pede confirmação (dupla confirmação para segurança)
    if (!confirm('Tem certeza que deseja limpar os CPFs votados? Isto permitirá que votem novamente.')) {
        return;
    }
    
    if (!confirm('Esta é a última confirmação. Deseja realmente limpar os CPFs votados?')) {
        return;
    }
    
    // Limpa a lista de CPFs votados
    votedCPFs.clear();
    
    // Salva os dados
    saveData();
    
    // Mostra um alerta de sucesso
    alert('CPFs votados foram limpos com sucesso!');
}

/* ===== FUNÇÃO: Atualizar estatísticas =====
   
   Explicação:
   - Esta função atualiza as estatísticas exibidas no painel admin
   - Mostra total de votos, candidatos, etc
*/

function updateStats() {
    // Calcula os totais
    const candidateVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    const totalVotes = candidateVotes + nullVotes;
    const totalCandidates = candidates.length;
    const totalVoters = votedCPFs.size;
    
    // Atualiza os elementos individuais (IDs do HTML)
    const elTotal = document.getElementById('totalVotes');
    const elCandidates = document.getElementById('totalCandidates');
    const elUnique = document.getElementById('uniqueVoters');
    const elNull = document.getElementById('nullVotesStat');

    if (elTotal) elTotal.textContent = totalVotes;
    if (elCandidates) elCandidates.textContent = totalCandidates;
    if (elUnique) elUnique.textContent = totalVoters;
    if (elNull) elNull.textContent = nullVotes;
}

/* ========================================
   INICIALIZAÇÃO
   ======================================== */

/* ===== FUNÇÃO: Inicializar aplicação =====
   
   Explicação:
   - Esta função é chamada quando a página carrega
   - Inicializa os dados padrão
   - Mostra a página inicial
*/

function initializeApp() {
    // Inicializa o objeto de votos para cada candidato
    candidates.forEach(candidate => {
        if (!votes[candidate.id]) {
            votes[candidate.id] = 0;
        }
    });
    
    // Mostra a página inicial
    goToPage('home');
    
    // Atualiza as estatísticas
    updateStats();
    
    // Mostra uma mensagem no console (para debug)
    console.log('Aplicação CIPA Chevrolet inicializada com sucesso!');
}

/* ========================================
   ARMAZENAMENTO DE DADOS (LocalStorage)
   ======================================== */

/* ===== FUNÇÃO: Salvar dados no localStorage =====
   
   Explicação:
   - localStorage permite armazenar dados no navegador
   - Os dados persistem mesmo após fechar o navegador
   - JSON.stringify converte objetos em texto para salvar
   - Salvamos: candidatos, votos e CPFs que votaram
*/

function saveData() {
    try {
        // Salva o array de candidatos
        localStorage.setItem('candidates', JSON.stringify(candidates));
        
        // Salva o objeto de votos
        localStorage.setItem('votes', JSON.stringify(votes));
        
        // Salva o Set de CPFs votados (converte para array primeiro)
        localStorage.setItem('votedCPFs', JSON.stringify(Array.from(votedCPFs)));
        
        // Salva o status da eleição
        localStorage.setItem('electionOpen', JSON.stringify(electionOpen));
        
        // Salva o registro de votos
        localStorage.setItem('voteRecords', JSON.stringify(voteRecords));
        // Salva o contador de votos nulos
        localStorage.setItem('nullVotes', JSON.stringify(nullVotes));
        
        console.log('✓ Dados salvos com sucesso no localStorage');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

/* ===== FUNÇÃO: Carregar dados do localStorage =====
   
   Explicação:
   - Esta função é chamada quando a página carrega
   - Verifica se há dados salvos no localStorage
   - Se houver, carrega os dados
   - Se não houver, usa os dados padrão
   - JSON.parse converte texto de volta para objetos
*/

function loadData() {
    try {
        // Tenta carregar os candidatos
        const savedCandidates = localStorage.getItem('candidates');
        if (savedCandidates) {
            candidates = JSON.parse(savedCandidates);
        }
        
        // Tenta carregar os votos
        const savedVotes = localStorage.getItem('votes');
        if (savedVotes) {
            votes = JSON.parse(savedVotes);
        }
        
        // Tenta carregar os CPFs votados
        const savedVotedCPFs = localStorage.getItem('votedCPFs');
        if (savedVotedCPFs) {
            votedCPFs = new Set(JSON.parse(savedVotedCPFs));
        }
        
        // Tenta carregar o status da eleição
        const savedElectionOpen = localStorage.getItem('electionOpen');
        if (savedElectionOpen !== null) {
            electionOpen = JSON.parse(savedElectionOpen);
        }
        
        // Tenta carregar o registro de votos
        const savedVoteRecords = localStorage.getItem('voteRecords');
        if (savedVoteRecords) {
            voteRecords = JSON.parse(savedVoteRecords);
        }
        // Tenta carregar o contador de votos nulos
        const savedNullVotes = localStorage.getItem('nullVotes');
        if (savedNullVotes !== null) {
            nullVotes = JSON.parse(savedNullVotes);
        }
        
        console.log('✓ Dados carregados com sucesso do localStorage');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

/* ===== FUNÇÃO: Remover um voto individual =====
   
   Explicação:
   - Esta função remove um voto específico do registro
   - Também remove o CPF da lista de votados
   - Diminui o contador de votos do candidato
   - Atualiza a exibição
*/

function deleteVoteRecord(index) {
    // Pede confirmação
    if (!confirm('Tem certeza que deseja remover este voto?')) {
        return;
    }
    
    // Obtém o voto a ser removido
    const voteToDelete = voteRecords[index];
    
    // Remove o CPF da lista de votados
    votedCPFs.delete(voteToDelete.cpf);
    
    // Diminui o contador de votos do candidato
    if (votes[voteToDelete.candidateId]) {
        votes[voteToDelete.candidateId]--;
        
        // Se o candidato não tiver mais votos, remove a entrada
        if (votes[voteToDelete.candidateId] <= 0) {
            delete votes[voteToDelete.candidateId];
        }
    }
    
    // Remove o voto do array
    voteRecords.splice(index, 1);
    
    // Atualiza a exibição
    renderVoteRecords();
    updateStats();
    renderResults();
    
    // Salva os dados
    saveData();
}

/* ===== FUNÇÃO: Limpar todos os votos =====
   
   Explicação:
   - Esta função remove TODOS os votos de uma vez
   - Limpa o registro de votos
   - Reseta os contadores
   - Limpa a lista de CPFs votados
*/

function clearAllVotes() {
    // Pede confirmação (dupla confirmação para segurança)
    if (!confirm('Tem certeza que deseja REMOVER TODOS OS VOTOS? Esta ação não pode ser desfeita!')) {
        return;
    }
    
    if (!confirm('Esta é a última confirmação. Deseja realmente remover todos os votos?')) {
        return;
    }
    
    // Limpa todos os votos
    voteRecords = [];
    
    // Reseta os contadores de votos
    votes = {};
    
    // Limpa a lista de CPFs votados
    votedCPFs.clear();
    
    // Reinicializa os contadores para cada candidato
    candidates.forEach(candidate => {
        votes[candidate.id] = 0;
    });
    
    // Atualiza a exibição
    renderVoteRecords();
    updateStats();
    renderResults();
    
    // Salva os dados
    saveData();
    
    // Mostra um alerta de sucesso
    alert('Todos os votos foram removidos com sucesso!');
}

/* ===== FUNÇÃO: Limpar todos os dados =====
   
   Explicação:
   - Esta função remove todos os dados salvos
   - Útil para resetar a eleição
   - Você pode chamar no console: clearAllData()
*/

function clearAllData() {
    if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!')) {
        localStorage.clear();
        location.reload();  // Recarrega a página
    }
}

/* ===== EVENT LISTENER: Quando a página carrega =====
   
   Explicação:
   - Este evento é disparado quando o HTML termina de carregar
   - Primeiro carrega os dados salvos
   - Depois inicializa a aplicação
*/

document.addEventListener('DOMContentLoaded', () => {
    loadData();  // Carrega os dados salvos
    initializeApp();  // Inicializa a aplicação
});

/* ===== EVENT LISTENER: Quando o usuário sai da página =====
   
   Explicação:
   - Este evento é disparado quando o usuário:
     * Fecha a aba
     * Atualiza a página (F5)
     * Navega para outra página
   - Salva os dados antes de sair
*/

window.addEventListener('beforeunload', () => {
    saveData();  // Salva os dados antes de sair
});

/* ===== FUNÇÃO: Renderizar edição de votos =====
   
   Explicação:
   - Esta função cria campos de entrada para editar votos
   - Cada candidato tem um campo de número para alterar votos
   - Atualiza os resultados em tempo real
*/

function renderEditVotes() {
    // Encontra o container
    const container = document.getElementById('editVotesContainer');
    
    // Limpa o container
    container.innerHTML = '';
    
    // Se não houver candidatos, mostra mensagem
    if (candidates.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">Nenhum candidato registado.</p>';
        return;
    }
    
    // Percorre cada candidato
    candidates.forEach(candidate => {
        // Obtém o número atual de votos
        const currentVotes = votes[candidate.id] || 0;
        
        // Cria um elemento para editar votos
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '15px';
        item.style.padding = '12px';
        item.style.borderBottom = '1px solid #ddd';
        item.style.backgroundColor = '#fafafa';
        
        // Cria o HTML
        item.innerHTML = `
            <div style="flex: 1;">
                <strong>${candidate.name}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <label style="margin: 0; font-weight: 600; color: #666;">Votos:</label>
                <input 
                    type="number" 
                    value="${currentVotes}" 
                    min="0"
                    id="voteInput${candidate.id}"
                    style="width: 80px; padding: 8px; border: 2px solid var(--color-cipa-green); border-radius: 5px; font-size: 1rem; font-weight: 600;"
                    onchange="updateCandidateVotes(${candidate.id})"
                    onkeyup="updateCandidateVotes(${candidate.id})"
                >
            </div>
        `;
        
        // Adiciona ao container
        container.appendChild(item);
    });

    // Campo para editar votos nulos
    const nullItem = document.createElement('div');
    nullItem.style.display = 'flex';
    nullItem.style.alignItems = 'center';
    nullItem.style.gap = '15px';
    nullItem.style.padding = '12px';
    nullItem.style.borderBottom = '1px solid #ddd';
    nullItem.style.backgroundColor = '#FFF3E0';
    nullItem.innerHTML = `
        <div style="flex: 1;">
            <strong style="color: #FF6F00;">Votos Nulos</strong>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <label style="margin: 0; font-weight: 600; color: #666;">Votos:</label>
            <input 
                type="number" 
                value="${nullVotes}" 
                min="0"
                id="nullVoteInput"
                style="width: 80px; padding: 8px; border: 2px solid #FF6F00; border-radius: 5px; font-size: 1rem; font-weight: 600;"
                onchange="updateNullVotes()"
                onkeyup="updateNullVotes()"
            >
        </div>
    `;
    container.appendChild(nullItem);
}

/* ===== FUNÇÃO: Atualizar votos nulos manualmente =====
   
   Explicação:
   - Permite ao admin editar o número de votos nulos diretamente
   - Atualiza resultados e estatísticas em tempo real
*/

function updateNullVotes() {
    const input = document.getElementById('nullVoteInput');
    const newVal = parseInt(input.value) || 0;
    nullVotes = newVal < 0 ? 0 : newVal;
    if (newVal < 0) input.value = 0;
    renderResults();
    updateStats();
    saveData();
}

/* ===== FUNÇÃO: Atualizar votos do candidato =====
   
   Explicação:
   - Esta função atualiza o número de votos de um candidato
   - Atualiza os resultados em tempo real
   - Salva os dados
*/

function updateCandidateVotes(candidateId) {
    // Obtém o valor do input
    const input = document.getElementById(`voteInput${candidateId}`);
    const newVotes = parseInt(input.value) || 0;
    
    // Valida se é um número válido
    if (newVotes < 0) {
        input.value = 0;
        votes[candidateId] = 0;
    } else {
        // Atualiza o número de votos
        votes[candidateId] = newVotes;
    }
    
    // Atualiza a exibição dos resultados
    renderResults();
    
    // Atualiza as estatísticas
    updateStats();
    
    // Salva os dados
    saveData();
}

/* ===== FUNÇÃO: Submeter voto nulo =====
   
   Explicação:
   - Esta função registra um voto nulo
   - Valida o CPF
   - Verifica se o CPF já votou
   - Incrementa o contador de votos nulos
*/

function submitNullVote() {
    // Obtém o CPF
    const cpfInput = document.getElementById('cpf').value.trim();
    
    // Encontra o elemento de mensagem
    const messageDiv = document.getElementById('voteMessage');
    
    // Limpa a mensagem anterior
    messageDiv.innerHTML = '';
    messageDiv.className = 'message';
    
    // ===== VALIDAÇÕES =====
    
    // Verifica se o CPF foi preenchido
    if (!cpfInput) {
        messageDiv.innerHTML = 'Por favor, insira seu CPF.';
        messageDiv.className = 'message error';
        return;
    }
    
    // Verifica se o CPF é válido
    if (!validateCPF(cpfInput)) {
        messageDiv.innerHTML = 'CPF inválido. Por favor, verifique e tente novamente.';
        messageDiv.className = 'message error';
        return;
    }
    
    // Verifica se este CPF já votou
    if (votedCPFs.has(cpfInput)) {
        messageDiv.innerHTML = 'Este CPF já votou. Cada eleitor pode votar apenas uma vez.';
        messageDiv.className = 'message error';
        return;
    }
    
    // ===== REGISTRAR VOTO NULO =====
    
    // Adiciona o CPF ao Set de CPFs que votaram
    votedCPFs.add(cpfInput);
    
    // Incrementa o contador de votos nulos
    nullVotes++;
    
    // Registra o voto nulo com CPF (apenas admin pode ver)
    voteRecords.push({
        cpf: cpfInput,
        candidateId: null,  // null indica voto nulo
        timestamp: new Date().toLocaleString('pt-BR')
    });
    
    // ===== FEEDBACK AO USUARIO =====
    
    // Mostra mensagem de sucesso
    messageDiv.innerHTML = '✓ Seu voto nulo foi registado com sucesso! Obrigado por participar.';
    messageDiv.className = 'message success';
    
    // Limpa os campos
    document.getElementById('cpf').value = '';
    
    // Reseta a seleção de candidato
    selectedCandidate = null;
    
    // Atualiza a exibição do formulário
    renderVoteForm();
    
    // Atualiza as estatísticas do admin
    updateStats();
    
    // Salva os dados no localStorage
    saveData();
}
