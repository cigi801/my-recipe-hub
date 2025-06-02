import { saveToStorage, loadFromStorage } from './storage.mjs';


export function addRecipeForm (formElement) {
    formElement.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = formElement.querySelector("#recipeName").value;
        const ingredients = [...document.querySelectorAll("#ingredientList li")].map(li => li.textContent);
        const day = formElement.querySelector("#assignDay").value;

        const newRecipe = {
            id: Date.now(),
            name,
            ingredients
        };

        const recipes = loadFromStorage("myRecipes") || [];
        recipes.push(newRecipe);
        saveToStorage("myRecipes", recipes);

        if (day) {
            const plan = loadFromStorage("weekPlan") || {};
            plan[day] = newRecipe.id;
            saveToStorage("weekPlan", plan);
        }

        alert("Recipe Saved!");
        window.location.href = "index.html";
    });
}
    

   


