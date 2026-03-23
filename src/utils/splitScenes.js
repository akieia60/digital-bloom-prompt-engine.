/**
 * splitScenes.js
 * Parses multi-scene Grok Imagine output into individual scene strings.
 *
 * Handles all the formats Grok uses:
 *   Scene 1/7: ...
 *   Scene 1 of 7: ...
 *   **Scene 1:** ...
 *   Scene 1 - ...
 *   Scene 1. ...
 *   [Scene 1] ...
 */

// Matches the start of a scene header in any of Grok's formats
const SCENE_HEADER_RE = /(?:\*{1,2})?\[?Scene\s+(\d+)(?:\s*(?:\/|of)\s*\d+)?\]?\s*[-:./]?\s*(?:\*{1,2})?/gi;

/**
 * splitScenes(text)
 * Returns an array of objects: [{ number: 1, label: 'Scene 1/7', text: '...' }, ...]
 * Returns [] if no scenes are detected.
 */
export function splitScenes(text) {
  if (!text || !text.trim()) return [];

  // Find all scene header positions
  const matches = [];
  let match;
  const re = new RegExp(SCENE_HEADER_RE.source, 'gi');
  while ((match = re.exec(text)) !== null) {
    matches.push({
      index: match.index,
      fullMatch: match[0],
      number: parseInt(match[1], 10),
    });
  }

  if (matches.length === 0) return [];

  // Slice the text between headers to get each scene's content
  const scenes = matches.map((m, i) => {
    const contentStart = m.index + m.fullMatch.length;
    const contentEnd = matches[i + 1] ? matches[i + 1].index : text.length;
    const content = text.slice(contentStart, contentEnd).trim();
    return {
      number: m.number,
      label: `Scene ${m.number}`,
      text: content,
    };
  });

  return scenes;
}

/**
 * hasMultipleScenes(text)
 * Quick check — returns true if the text looks like a multi-scene block.
 */
export function hasMultipleScenes(text) {
  if (!text) return false;
  const re = new RegExp(SCENE_HEADER_RE.source, 'gi');
  const found = text.match(re);
  return found && found.length >= 2;
}
