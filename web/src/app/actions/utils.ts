// Shared utilities

export const generateSlug = () => Math.random().toString(36).substring(2, 10);

export const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};
