const urlRegex =
  /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/g;

/**
 * Replace each URL found in a string by a HTML anchor
 */
export function replaceUrlToHtmlAnchor(str: string) {
  return str.replaceAll(urlRegex, (match) => {
    return `<a href="${match}" target="_blank">${match}</a>`;
  });
}

type ListPart = {
  type: "element" | "literal";
  value: string;
};

/**
 * Format an array of string into a readable list or an array of ListPart
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat
 *
 * @example formatList(['Mary', 'Tom', 'Jack']) returns "Mary, Tom and Jack"
 * @example formatList(['Mary', 'Tom', 'Jack'], true) returns [{ type: "element", value: "Mary" }, { type: "literal", value: ", " }...]
 */
export function formatList(items: string[], formatToParts: true): ListPart[];
export function formatList(items: string[], formatToParts?: false): string;
export function formatList(
  items: string[],
  formatToParts = false,
): string | ListPart[] {
  const { locale } = useI18n();
  const formatter = new Intl.ListFormat(locale.value, {
    type: "conjunction",
  });

  return formatToParts
    ? formatter.formatToParts(items)
    : formatter.format(items);
}
