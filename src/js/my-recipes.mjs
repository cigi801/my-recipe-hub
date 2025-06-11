import { loadFromStorage, saveToStorage } from "./storage.mjs";
import { searchRecipes, getRecipeDetails } from "./api.mjs";

export function initMyRecipes() {
    renderMyRecipes();
    assignRecipeToDay();
    setupTabSwitching();
}


function renderMyRecipes() {
    const container = document.getElementById("myRecipeList");
    container.innerHTML = "";

    const recipes = loadFromStorage("myRecipes") || [];
    if (recipes.length === 0) {
        container.innerHTML = "<p>No saved recipes yet</p>";
        return;
    }

  function assignRecipeToDay(id, day) {
  const weekPlan = loadFromStorage("weekPlan") || {};
  weekPlan[day] = Number(id);
  saveToStorage("weekPlan", weekPlan);
  alert(`Recipe assigned to ${day}!`);
  }

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = 
    `<h3>${recipe.name}</h3>
    <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
        <label for="day-${recipe.id}">Assign to day:</label>
        <select id="day-${recipe.id}">
            <option value="">-- Select --</option>
            ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => `<option value="${day}">${day}</option>`).join("")}
        </select>
        <button data-id="${recipe.id}" class="assign-btn">Assign</button>
        <button data-id="${recipe.id}" class="delete-btn">Delete</button>
        `;
        container.appendChild(card);
    });

    container.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains("delete-btn")) {
            deleteRecipe(id);
        }
        if (e.target.classList.contains("assign-btn")) {
            const day = document.getElementById(`day-${id}`).value;
            if (day) assignRecipeToDay(id, day);
        }
    });
}


function deleteRecipe(id) {
    let recipes = loadFromStorage("myRecipes") || [];
    recipes = recipes.filter(r=> r.id != id);
    saveToStorage("myRecipes", recipes);
    renderMyRecipes();
}

document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

async function renderBrowseRecipes(cuisine = "", diet = "") {
  const container = document.getElementById("browseRecipeList");
  container.innerHTML = "Loading...";

  const recipes = await searchRecipes(cuisine, diet);

  if (!recipes.length) {
    container.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  container.innerHTML = "";
  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <h3>${recipe.title}</h3>
      ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" class="small-img" />` : ""}
      <button>Add to My Recipes</button>
    `;

card.querySelector("button").addEventListener("click", async () => {
  const fullDetails = await getRecipeDetails(recipe.id);

  if (!fullDetails) {
    alert("Error loading recipe details.");
    return;
  }
  const ingredients = fullDetails.extendedIngredients?.map(i => i.original) || ["No ingredients listed"];

  const saved = loadFromStorage("myRecipes") || [];
  saved.push({
    id: recipe.id,
    name: fullDetails.title,
    ingredients: ingredients
  });

  saveToStorage("myRecipes", saved);


  alert("Recipe saved to My Recipes!");
});

    container.appendChild(card);
  });
}




document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

document.getElementById("searchCuisineBtn")?.addEventListener("click", () => {
  const cuisine = document.getElementById("cuisineSelect").value;
  const diet = document.getElementById("dietSelect").value;
  renderBrowseRecipes(cuisine, diet);
});

// Attach Home Button Event
const homeButton = document.getElementById("homeButton");
if (homeButton) {
  homeButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

// Attach Back Button Event
const backButton = document.getElementById("backButton");
if (backButton) {
  backButton.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "index.html"; // Fallback
    }
  });
}
