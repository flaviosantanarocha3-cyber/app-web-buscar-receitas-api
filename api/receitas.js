
// Dentro do seu api/receitas.js
export default async function handler(req, res) {
  const { q } = req.query;
  // Lê a chave configurada em Settings > Environment Variables na Vercel
  const chave = process.env.CHAVE_RECEITAS;

  const resposta = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?apiKey=${chave}&query=${encodeURIComponent(q || '')}&language=pt&number=12&addRecipeInformation=true`
  );
  const dados = await resposta.json();

  res.status(200).json(dados);
}