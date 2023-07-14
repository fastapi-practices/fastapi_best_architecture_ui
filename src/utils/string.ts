// 转换为小字母开头的驼峰命名
export default function convertToCamelCase(input: string): string {
  let camelCase = input.replace(/^[_-]+/, '');
  camelCase = camelCase.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
  camelCase = camelCase.charAt(0).toLowerCase() + camelCase.slice(1);
  return camelCase;
}

// 转换为小字母加中划线命名
export function convertToKebabCase(input: string): string {
  let snakeCase = input.replace(/^[_-]+/, '');
  snakeCase = snakeCase.replace(/([A-Z])/g, '-$1').toLowerCase();
  return snakeCase;
}
