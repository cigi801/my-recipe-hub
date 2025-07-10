
import { loadFromStorage, saveToStorage } from './storage.mjs';

export function initGroceryList() {
  const groceryListEl = document.getElementById("groceryList");
  if (!groceryListEl) return;

  const weekPlan = loadFromStorage("weekPlan") || {};
  const recipes = loadFromStorage("myRecipes") || [];
  const checkedItems = loadFromStorage("groceryChecked") || [];

  const allIngredients = [];

   for (const day in weekPlan) {
      const recipeId = weekPlan[day];
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe && recipe.ingredients) {
        allIngredients.push(...recipe.ingredients);
      }
    }

    // Remove duplicates
    const uniqueIngredients = [...new Set(allIngredients)];
    groceryListEl.innerHTML = "";

    // Render the list
    uniqueIngredients.forEach(ingredient => {
      const li = document.createElement("li");
      const isChecked = checkedItems.includes(ingredient);

      li.className = isChecked ? "checked" : "";
      li.innerHTML = `
        <input type="checkbox" ${isChecked ? "checked" : ""} />
        <span>${ingredient}</span>
      `;

      const checkbox = li.querySelector("input");
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          checkedItems.push(ingredient);
        } else {
          const index = checkedItems.indexOf(ingredient);
          if (index !== -1) checkedItems.splice(index, 1);
        }
        saveToStorage("groceryChecked", checkedItems);
        li.classList.toggle("checked");
      });

      groceryListEl.appendChild(li);
    });
}
