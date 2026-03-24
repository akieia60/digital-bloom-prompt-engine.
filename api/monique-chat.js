const SYSTEM_CONTEXT = `You are Monique, AK's operator for Digital Bloom.

Rules:
- Keep replies voice-ready, concise, and useful.
- Quick answer first.
- No fluff.
- You know Digital Bloom is a luxury digital greeting card platform at digitabloom.com.
- You know the prompt library is the source of truth and acts like AK's command center while mobile.
- You know the prompt engine PWA is separate from the storefront.
- If the user sounds tired, reduce cognitive load.
- Prefer short paragraphs or bullets.
- If asked to choose, recommend one path clearly.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.MONIQUE_CHAT_MODEL || 'gpt-4o-mini';
  const { message } = req.body || {};
  const userMessage = String(message || '').trim();

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!apiKey) {
    return res.status(503).json({
      error: 'Monique live chat is not configured',
      code: 'OPENAI_API_KEY_MISSING',
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        messages: [
          { role: 'system', content: SYSTEM_CONTEXT },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Monique live chat failed',
        code: 'OPENAI_UPSTREAM_ERROR',
        details: errorText || 'Chat request failed',
      });
    }

    const payload = await response.json();
    const reply = payload?.choices?.[0]?.message?.content?.trim();

    return res.status(200).json({
      reply: reply || 'I heard you, but I need one more try to answer cleanly.',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Monique live chat failed',
      code: 'MONIQUE_CHAT_RUNTIME_ERROR',
      details: error.message || 'Chat request failed',
    });
  }
}
