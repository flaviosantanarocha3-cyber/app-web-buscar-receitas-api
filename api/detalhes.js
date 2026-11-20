
export default async function handler(req, res) {
  const { id } = req.query;
  // Usa a mesma chave secreta da Vercel
  const chave = process.env.CHAVE_RECEITAS;

  const resposta = await fetch(
    `https://api.spoonacular.com/recipes/${encodeURIComponent(id)}/information?apiKey=${chave}`
  );
  const dados = await resposta.json();

  res.status(200).json(dados);
}