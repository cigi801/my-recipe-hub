import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        myRecipes: resolve(__dirname, "src/my-recipes.html"),
        addRecipe: resolve(__dirname, "src/add-recipe.html"),
        planner: resolve(__dirname, "src/planner.html"),
        grocery: resolve(__dirname, "src/grocery.html")
      },
    },
  },

   // ✅ Custom hook to copy _redirects after build
  buildEnd() {
    const from = resolve(__dirname, "_redirects");
    const to = resolve(__dirname, "dist/_redirects");

    if (fs.existsSync(from)) {
      fs.copyFileSync(from, to);
      console.log("✅ Copied _redirects to dist/");
    } else {
      console.warn("⚠️  _redirects file not found in project root");
    }
  },
});