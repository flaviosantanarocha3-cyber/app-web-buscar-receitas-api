

const input = document.querySelector('.procurar-input');
const form = document.querySelector('.procurar-form');
const receitaLista = document.querySelector('.receita-lista');
const receitaDetalhes = document.querySelector('.receita-detalhes');
// Chave removida daqui: ela agora fica escondida nas variáveis de ambiente da Vercel

form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const inputValue = evento.target[0].value;

    // Chama a função passando o valor digitado
    procurarReceitas(inputValue);
})

// 2. Função Auxiliar de Tradução (fica no topo para poder ser usada por qualquer outra função)
async function traduzir(texto) {
    if (!texto) return '';
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(texto)}`;
        const res = await fetch(url);
        const dados = await res.json();
        return dados[0].map(item => item[0]).join('');
    } catch (erro) {
        return texto; // Se falhar a conexão, devolve o texto original sem quebrar o site
    }
}

// 2. Função procurar receitas no servidor
async function procurarReceitas(ingrediente) {
    try {
        // Chama a rota da Vercel em vez da Spoonacular direto (a chave vai lá no servidor)
        const resposta = await fetch(`/api/receitas?q=${encodeURIComponent(ingrediente)}`);
        const dados = await resposta.json();

        // Spoonacular retorna o array em 'results'
        if (dados.results && dados.results.length > 0) {
            mostrarReceitas(dados.results);
        } else {
            receitaLista.innerHTML = `<p>Nenhuma receita encontrada</p>`;
        }
    } catch (err) {
        receitaLista.innerHTML = `<p>Erro ao buscar receitas. Tente novamente.</p>`;
    }
}

function mostrarReceitas(receitas) {
    receitaLista.innerHTML = receitas.map(item => `
        <div class="receita-card" onclick="pegarDetalhesReceita('${item.id}')">
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
        </div>
    `).join('');
}

async function pegarDetalhesReceita(id) {
    // Chama a rota de detalhes na Vercel passando o id da receita
    const resposta = await fetch(`/api/detalhes?id=${encodeURIComponent(id)}`);
    const detalheReceita = await resposta.json();

    // 1. Traduz as Instruções
    const textoIngles = detalheReceita.instructions || 'No instructions available.';
    const instrucoesPT = await traduzir(textoIngles);

    // 2. Traduz os Ingredientes (trocado .forEach por for...of)
    let ingredientes = '';

    if (detalheReceita.extendedIngredients) {
        for (const item of detalheReceita.extendedIngredients) {
            const ingredienteTraduzido = await traduzir(item.original);
            ingredientes += `<li>${ingredienteTraduzido}</li>`;
        }
    }

    // 3. Atualiza o HTML com as variáveis traduzidas (instrucoesPT)
    receitaDetalhes.innerHTML = `
        <button class="fechar-detalhes" onclick="fecharDetalhes()">✕ Fechar</button>
        <h2>${detalheReceita.title}</h2>
        <img src="${detalheReceita.image}" alt="${detalheReceita.title}" class="receita-img">
        <h3>Tempo de Preparo: ${detalheReceita.readyInMinutes} minutos</h3>
        <h3>Rendimento: ${detalheReceita.servings} porções</h3>
        <h3>Ingredientes:</h3>
        <ul>${ingredientes}</ul>
        <h3>Modo de Preparo:</h3>
        <p>${instrucoesPT}</p>
    `;

    // Torna o elemento visível adicionando a classe active
    receitaDetalhes.classList.add('active');
}

function fecharDetalhes() {
    receitaDetalhes.classList.remove('active');
}