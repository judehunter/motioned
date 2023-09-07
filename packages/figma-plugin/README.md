## Quickstart

2. Run `pnpm install` in the repository's root directory.
3. Run `pnpm run dev` to start building.
4. Right Click in Figma -> "Plugins" -> "Development" -> "Import plugin from manifest..."
5. Click on "+" -> import plugin from manifest -> Select `./dist/manifest.json` file to import the plugin
6. Click on "Run" to start the Figma plugin in development mode.

⭐ To change the UI of your plugin (the react code), start editing [App.tsx](./src/app/App.tsx).  
⭐ To interact with the Figma API edit [code.ts](./src/code.ts).  
⭐ Read more on the [Figma API Overview](https://www.figma.com/plugin-docs/api/api-overview/).

## Toolings

This repo is using:

- React + Webpack + Tailwind
- TypeScript
