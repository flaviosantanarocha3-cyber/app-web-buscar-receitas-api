

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
    "manga": "mango", // Evita traduzir errado para "sleeve" (manga de roupa)
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
    "cravo": "clove", // Evita traduzir errado para "nail" (prego/cravo)
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
    "castanha": "cashew",
    "nozes": "walnuts"
};

function limparPalavra(texto) {
    return texto
        .toLowerCase()                      // "FRANGO" -> "frango"
        .trim()                             // " frango " -> "frango"
        .normalize("NFD")                   // Separa o acento da letra ("ã" -> "a" + "~")
        .replace(/[\u0300-\u036f]/g, "");   // Apaga o acento ("limão" -> "limao")
}



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
function limparPalavra(texto) {
    return texto
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

async function procurarReceitas(ingrediente) {
    try {
        // 1. Limpa o que o usuário digitou 
        const palavraLimpa = limparPalavra(ingrediente);

        // 2. Consulta a variável dicionarioIngredientes; se não achar, usa a tradução PT -> EN
        const termoBusca = dicionarioIngredientes[palavraLimpa]
            ? dicionarioIngredientes[palavraLimpa]
            : await traduzir(palavraLimpa, 'pt', 'en');

        // 3. Envia o termo já convertido/traduzido para a rota da Vercel
        const resposta = await fetch(`/api/receitas?q=${encodeURIComponent(termoBusca)}`);
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