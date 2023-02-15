declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}

interface Window {
  __comlibs_edit_: any;
}