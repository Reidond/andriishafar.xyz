/// <reference types="astro/client" />

declare module "*.module.css?inline" {
  const stylesheet: string;
  export default stylesheet;
}
