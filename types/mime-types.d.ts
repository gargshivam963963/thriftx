declare module "mime-types" {
  const mime: {
    lookup: (pathOrExt: string) => string | false;
    extension: (type: string) => string | false;
    contentType: (type: string) => string | false;
    types: Record<string, string>;
    extensions: Record<string, string[]>;
  };
  export default mime;
}
