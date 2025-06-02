import '../css/style.css';
import { addRecipeForm } from './form-handler.mjs';
import { initMyRecipes } from './my-recipes.mjs';
import { initPlannerPage } from './planner.mjs';


initMyRecipes();




    const path = window.location.pathname;

    if (path.includes('planner.html')) {
        initPlannerPage();
    }
