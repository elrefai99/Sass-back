const HTML_ESCAPE_MAP: Record<string, string> = {
     '&': '&amp;',
     '<': '&lt;',
     '>': '&gt;',
     '"': '&quot;',
     "'": '&#39;',
}

export const escapeHtml = (input: unknown): string => {
     if (input === null || input === undefined) return ''
     return String(input).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char])
}
