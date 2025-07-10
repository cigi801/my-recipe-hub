import { addRecipeForm } from './form-handler.mjs';
import { initMyRecipes } from './my-recipes.js';
import { initPlannerPage } from './planner.js';
import { initGroceryList } from './grocery.js';


const path = window.location.pathname.toLowerCase();

if (path.includes('grocery') || path.endsWith('/grocery')) {
    initGroceryList();
    console.log("Rendering grocery list with: ");
}

if (path.includes('add-recipe') || path.endsWith('/add-recipe')) {
    const form = document.getElementById("addRecipeForm");
    if (form) addRecipeForm(form);
}

if (path.includes('my-recipes') || path.endsWith('/my-recipes')) {
    initMyRecipes();
}

if (path.includes('planner') || path.endsWith('/planner')) {
    initPlannerPage();
}