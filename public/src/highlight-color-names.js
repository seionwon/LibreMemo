export const HIGHLIGHT_NAME_LENGTH = 32;

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// Keep names with the preset. An annotation's existing hex colour is its lookup key.
export function normalizeHighlightColorNames(value, palettes) {
  if (value === undefined) return {};
  if (!isRecord(value)) throw new Error('형광펜 색 이름 설정이 올바르지 않습니다.');

  const presets = [];
  for (const palette of palettes) {
    if (!Object.hasOwn(value, palette.id)) continue;
    const raw = value[palette.id];
    if (!isRecord(raw) || Object.keys(raw).length > 32) throw new Error('팔레트의 형광펜 색 이름 목록이 올바르지 않습니다.');

    const names = new Map();
    for (const [color, name] of Object.entries(raw)) {
      if (!/^#[\da-f]{6}$/i.test(color) || typeof name !== 'string' || name.length > HIGHLIGHT_NAME_LENGTH || /[\u0000-\u001f\u007f]/.test(name)) {
        throw new Error('형광펜 색 이름은 줄바꿈 없이 ' + HIGHLIGHT_NAME_LENGTH + '자 이내로 입력해주세요.');
      }
      if (name.trim()) names.set(color.toLowerCase(), name.trim());
    }
    // Following palette order makes equivalent backups compare equally during sync.
    const colors = palette.colors.filter(color => names.has(color));
    if (colors.length) presets.push([palette.id, Object.fromEntries(colors.map(color => [color, names.get(color)]))]);
  }
  return Object.fromEntries(presets);
}

export function namedHighlightColors(annotationPreferences) {
  const names = annotationPreferences?.highlightColorNames;
  const presetId = annotationPreferences?.paletteId;
  if (!names || !Object.hasOwn(names, presetId)) return [];
  return Object.entries(names[presetId]).map(([color, name]) => ({color, name}));
}
