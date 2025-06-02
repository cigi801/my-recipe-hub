import "../style.css";
import { addRecipeForm } from './form-handler.mjs';
import { initMyRecipes } from './my-recipes.mjs';
import { initPlannerPage } from './planner.mjs';


initMyRecipes();


document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });

    const path = window.location.pathname;

    if (path.includes('planner.html')) {
        initPlannerPage();
    }
