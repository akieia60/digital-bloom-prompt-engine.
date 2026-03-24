export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    ok: true,
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.MONIQUE_CHAT_MODEL || 'gpt-4o-mini',
  });
}
