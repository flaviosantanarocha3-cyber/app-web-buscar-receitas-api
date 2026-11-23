
const input = document.querySelector('.procurar-input');
const form = document.querySelector('.procurar-form');
const receitaLista = document.querySelector('.receita-lista');
const receitaDetalhes = document.querySelector('.receita-detalhes');

const dicionarioIngredientes = {
    // --- Proteínas e Carnes ---
    "frango": "chicken",
    "peito de frango": "chicken breast",
    "carne": "beef",
    "carne moida": "ground beef",
    "bife": "steak",
    "porco": "pork",
    "bacon": "bacon",
    "linguica": "sausage",
    "salsicha": "sausage",
    "presunto": "ham",
    "peixe": "fish",
    "atum": "tuna",
    "salmao": "salmon",
    "bacalhau": "cod",
    "camarao": "shrimp",
    "ovo": "egg",
    "ovos": "eggs",

    // --- Laticínios ---
    "leite": "milk",
    "leite condensado": "condensed milk",
    "creme de leite": "heavy cream",
    "queijo": "cheese",
    "mussarela": "mozzarella",
    "parmesao": "parmesan",
    "requeijao": "cream cheese",
    "manteiga": "butter",
    "margarina": "margarine",
    "iogurte": "yogurt",

    // --- Grãos, Massas e Farinhas ---
    "arroz": "rice",
    "feijao": "beans",
    "feijao preto": "black beans",
    "lentilha": "lentils",
    "grao de bico": "chickpeas",
    "milho": "corn",
    "ervilha": "peas",
    "macarrao": "pasta",
    "espaguete": "spaghetti",
    "pao": "bread",
    "farinha": "flour",
    "farinha de trigo": "flour",
    "farinha de mandioca": "cassava flour",
    "polvilho": "tapioca starch",
    "aveia": "oats",
    "amido de milho": "cornstarch",
    "maizena": "cornstarch",

    // --- Legumes, Verduras e Tubérculos ---
    "batata": "potato",
    "batatas": "potatoes",
    "batata doce": "sweet potato",
    "mandioca": "cassava",
    "aipim": "cassava",
    "macaxeira": "cassava",
    "cenoura": "carrot",
    "tomate": "tomato",
    "cebola": "onion",
    "alho": "garlic",
    "alho poro": "leek",
    "pimentao": "bell pepper",
    "abobrinha": "zucchini",
    "abobora": "pumpkin",
    "berinjela": "eggplant",
    "brocolis": "broccoli",
    "couve": "kale",
    "couve flor": "cauliflower",
    "repolho": "cabbage",
    "alface": "lettuce",
    "espinafre": "spinach",
    "pepino": "cucumber",
    "beterraba": "beet",
    "cogumelo": "mushroom",
    "champignon": "mushroom",

    // --- Frutas ---
    "banana": "banana",
    "maca": "apple",
    "laranja": "orange",
    "limao": "lemon",
    "morango": "strawberry",
    "abacaxi": "pineapple",
    "manga": "mango",
    "abacate": "avocado",
    "maracuja": "passion fruit",
    "coco": "coconut",
    "leite de coco": "coconut milk",
    "uva": "grape",
    "melancia": "watermelon",
    "mamao": "papaya",
    "goiaba": "guava",
    "pessego": "peach",

    // --- Despensa, Doces e Temperos ---
    "acucar": "sugar",
    "sal": "salt",
    "oleo": "oil",
    "azeite": "olive oil",
    "vinagre": "vinegar",
    "fermento": "baking powder",
    "chocolate": "chocolate",
    "cacau": "cocoa",
    "mel": "honey",
    "cafe": "coffee",
    "canela": "cinnamon",
    "cravo": "clove",
    "oregano": "oregano",
    "manjericao": "basil",
    "salsinha": "parsley",
    "coentro": "cilantro",
    "cebolinha": "chives",
    "louro": "bay leaf",
    "pimenta": "pepper",
    "gengibre": "ginger",
    "noz moscada": "nutmeg",
    "amendoim": "peanut",
    "castanha": "nuts",
    "nozes": "walnuts"
};

function limparPalavra(texto = '') {
    return texto
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/\p{M}/gu, "");
}

function removerTagsHTML(html = '') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const valorDigitado = input ? input.value : evento.target[0]?.value;

    if (!valorDigitado || !valorDigitado.trim()) {
        receitaLista.innerHTML = `<p>Digite um ingrediente para buscar.</p>`;
        return;
    }

    procurarReceitas(valorDigitado);
});

async function traduzir(texto, idiomaOrigem = 'en', idiomaDestino = 'pt') {
    if (!texto) return '';
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${idiomaOrigem}&tl=${idiomaDestino}&dt=t&q=${encodeURIComponent(texto)}`;
        const res = await fetch(url);
        if (!res.ok) return texto;

        const dados = await res.json();
        if (!Array.isArray(dados) || !Array.isArray(dados[0])) return texto;

        return dados[0]
            .map(item => (Array.isArray(item) ? item[0] : ''))
            .join('');
    } catch (erro) {
        return texto;
    }
}

async function procurarReceitas(ingrediente) {
    receitaLista.innerHTML = `<p>Buscando receitas...</p>`;
    try {
        const palavraLimpa = limparPalavra(ingrediente);

        const termoBusca = dicionarioIngredientes[palavraLimpa]
            ? dicionarioIngredientes[palavraLimpa]
            : await traduzir(palavraLimpa, 'pt', 'en');

        const resposta = await fetch(`/api/receitas?q=${encodeURIComponent(termoBusca)}`);
        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (dados.results && dados.results.length > 0) {
            mostrarReceitas(dados.results);
        } else {
            receitaLista.innerHTML = `<p>Nenhuma receita encontrada</p>`;
        }
    } catch (err) {
        console.error('Erro em procurarReceitas:', err);
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
    try {
        const resposta = await fetch(`/api/detalhes?id=${encodeURIComponent(id)}`);
        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const detalheReceita = await resposta.json();

        const instrucoesLimpa = removerTagsHTML(detalheReceita.instructions || 'No instructions available.');
        const instrucoesPT = await traduzir(instrucoesLimpa, 'en', 'pt');

        let ingredientesHTML = '';
        if (Array.isArray(detalheReceita.extendedIngredients)) {
            const traduzidos = await Promise.all(
                detalheReceita.extendedIngredients.map(item => traduzir(item.original, 'en', 'pt'))
            );
            ingredientesHTML = traduzidos
                .map(ing => `<li>${ing}</li>`)
                .join('');
        }

        receitaDetalhes.innerHTML = `
            <button class="fechar-detalhes" onclick="fecharDetalhes()">✕ Fechar</button>
            <h2>${detalheReceita.title || 'Receita'}</h2>
            ${detalheReceita.image ? `<img src="${detalheReceita.image}" alt="${detalheReceita.title}" class="receita-img">` : ''}
            <h3>Tempo de Preparo: ${detalheReceita.readyInMinutes ?? '-'} minutos</h3>
            <h3>Rendimento: ${detalheReceita.servings ?? '-'} porções</h3>
            <h3>Ingredientes:</h3>
            <ul>${ingredientesHTML}</ul>
            <h3>Modo de Preparo:</h3>
            <p>${instrucoesPT}</p>
        `;

        receitaDetalhes.classList.add('active');
    } catch (err) {
        console.error('Erro em pegarDetalhesReceita:', err);
        receitaDetalhes.innerHTML = `
            <button class="fechar-detalhes" onclick="fecharDetalhes()">✕ Fechar</button>
            <p>Não foi possível carregar os detalhes da receita agora.</p>
        `;
        receitaDetalhes.classList.add('active');
    }
}

function fecharDetalhes() {
    receitaDetalhes.classList.remove('active');
}