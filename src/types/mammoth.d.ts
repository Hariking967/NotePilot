declare module "mammoth" {
  interface ConvertResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  export function convertToHtml(options: {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }): Promise<ConvertResult>;

  const _default: {
    convertToHtml: typeof convertToHtml;
  };

  export default _default;
}
