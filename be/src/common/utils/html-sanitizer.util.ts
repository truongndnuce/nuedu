import sanitizeHtml = require('sanitize-html');

export function sanitizePostContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'strong', 'em', 'u', 'a', 'img', 'br', 'hr'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
    },
    disallowedTagsMode: 'discard',
    allowedSchemes: ['http', 'https'],
  });
}
