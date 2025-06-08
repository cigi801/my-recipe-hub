import '../css/style.css';
import { addRecipeForm } from './form-handler.mjs';
import { initMyRecipes } from './my-recipes.mjs';
import { initPlannerPage } from './planner.mjs';
import { initGroceryList } from './grocery.mjs';


const path = window.location.pathname;

if (path.includes('grocery.html')) {
    initGroceryList();
    console.log("Rendering grocery list with: ");
}

if (path.includes('add-recipe.html')) {
    const form = document.getElementById("addRecipeForm");
    if (form) addRecipeForm(form);
}

if (path.includes('my-recipes.html')) {
    initMyRecipes();
}

if (path.includes('planner.html')) {
        initPlannerPage();
}


