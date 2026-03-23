export function splitScenes(input) {
  const text = (input || '').replace(/\r\n/g, '\n').trim();

  if (!text) return [];

  const sceneRegex =
    /(Scene\s+\d+\s*\/\s*\d+(?:\s*[–—-]\s*[^\n]+)?[\s\S]*?)(?=(?:\n\s*Scene\s+\d+\s*\/\s*\d+)|$)/gi;

  const matches = text.match(sceneRegex);

  if (!matches || matches.length === 0) {
    return [
      {
        id: 'full-prompt',
        label: 'Full Prompt',
        text,
      },
    ];
  }

  return matches.map((sceneText, index) => {
    const cleaned = sceneText.trim();
    const firstLine = cleaned.split('\n')[0]?.trim() || `Scene ${index + 1}`;

    return {
      id: `scene-${index + 1}`,
      label: firstLine,
      text: cleaned,
    };
  });
}
