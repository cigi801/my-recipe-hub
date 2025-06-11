import { saveToStorage, loadFromStorage } from './storage.mjs';


export function addRecipeForm(formElement) {
  const addBtn = document.getElementById("addIngredientBtn");
  const ingredientInput = document.getElementById("ingredientInput");
  const ingredientList = document.getElementById("ingredientList");


   addBtn.addEventListener("click", () => {
    const value = ingredientInput.value.trim();
    if (value) {
      const li = document.createElement("li");
      li.textContent = value;
      ingredientList.appendChild(li);
      ingredientInput.value = "";
    }
  });

  //Form submit logic
  formElement.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = formElement.querySelector("#recipeName").value;
    const ingredients = [...document.querySelectorAll("#ingredientList li")].map(li => li.textContent);
    console.log("Ingredients:", ingredients);
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

const formContainer = document.querySelector(".form-container");

formContainer.classList.add("recipe-added");

setTimeout(() => {
  formContainer.classList.remove("recipe-added");
  alert("Recipe Saved!");
  window.location.href = "index.html";
}, 600); // Match animation duration
  });
}

   


