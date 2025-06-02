import { loadFromStorage, saveToStorage } from "./storage.mjs";
import { fetchAPIRecipes } from "./api.mjs";

export function initMyRecipes() {
    renderMyRecipes();
    renderBrowseRecipes();
}

function renderMyRecipes() {
    const container = document.getElementById("myRecipesList");
    container.innerHTML = "";

    const recipes = loadFromStorage("myRecipes") || [];
    if (recipes.length === 0) {
        container.HTML = "<p>No saved recipes yet.</p>";
        return;
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
            ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => `<option value="${day}">${day}<option>`).join("")}
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
            const day = document.getElementById(`day=${id}`).value;
            if (day) assignRecipeToDay(id, day);
        }
    });
}


function deleteRecipe(id) {
    let recipes = loadFromStorage("myRecipes") || [];
    recipes = recipes.fliter(r=> r.id != id);
    saveToStorage("myRecipes", recipes);
    renderMyRecipes();
}

async function renderBrowseRecipes() {
    const container = document.getElementById("browseRecipeList");
    container.innerHTML = "";

    try {
        const recipes = await fetchAPIRecipes();
        recipes.slice(0, 5).forEach(recipe => {
            const card = document.createElement("div");
            card.className = "recipe-card";
            card.innerHTML = `
            <h3>${recipe.name}</h3>
            <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
            <button>Add to My Recipes</button>
            `;
            card.querySelector("button").addEventListener("click", () => {
                const myRecipes = loadFromStorage("myRecipes") || [];
                myRecipes.push({
                    id: Date.now(),
                    name: recipe.name,
                    ingredients: recipe.ingredients
                });
                saveToStorage("myRecipes", myRecipes);
                renderMyRecipes();
                alert("Recipe Saved!");
            });
            container.appendChild(card);
        });

    } catch (err) {
        container.innerHTML = `<p>Error Loading Recipes: ${err.message}</p>`;
    }
}