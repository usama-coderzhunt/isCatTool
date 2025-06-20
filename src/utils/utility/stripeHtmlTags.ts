export const stripHtmlTags = (html: string) => html?.replace(/<[^>]*>/g, '')
