# andriishafar.xyz

Professional resume and portfolio for Andrii Shafar.

The website and downloadable PDF use the same structured content in `src/data/resume.json`. The PDF is rendered with [takumi-pdf](https://takumi.kane.tw/docs/pdf) and published as a static site asset.

## Development

```sh
pnpm install
pnpm dev
```

Regenerate the PDF on its own:

```sh
pnpm resume:pdf
```

## Production

```sh
pnpm build
pnpm deploy
```

The production site is deployed to Cloudflare Workers with static assets and is available at [andriishafar.xyz](https://andriishafar.xyz).
