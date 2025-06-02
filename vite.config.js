import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

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
      }
    }
  }
});