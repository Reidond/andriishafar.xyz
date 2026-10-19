import type { APIRoute, GetStaticPaths } from "astro";
import { patterns } from "../../features/dither/patterns";

type Pattern = keyof typeof patterns;

export const getStaticPaths = (() => Object.keys(patterns).map((pattern) => ({ params: { pattern } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(patterns[params.pattern as Pattern], { headers: { "Content-Type": "image/svg+xml" } });
