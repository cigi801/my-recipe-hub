import { loadFromStorage, saveToStorage } from "./storage.mjs";
import { searchRecipes, getRecipeDetails } from "./api.mjs";

export function initMyRecipes() {
    renderMyRecipes();
    setupTabSwitching();
    setupSearchButton();
}

function renderMyRecipes() {
    const container = document.getElementById("myRecipeList");
    
    // Remove existing event listeners by cloning the container
    const newContainer = container.cloneNode(false);
    container.parentNode.replaceChild(newContainer, container);
    
    // Clear content
    newContainer.innerHTML = "";

    const recipes = loadFromStorage("myRecipes") || [];
    if (recipes.length === 0) {
        newContainer.innerHTML = "<p>No saved recipes yet</p>";
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card condensed";
        card.dataset.id = recipe.id;
        
        const prepTime = recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : 'Time not available';
        
        card.innerHTML = 
        `<div class="recipe-summary">
            ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-thumbnail" />` : '<div class="recipe-placeholder">No Image</div>'}
            <div class="recipe-info">
                <h3><a href="/recipe-detail?id=${recipe.id}" class="recipe-link">${recipe.name}</a></h3>
                <p class="prep-time">⏱️ ${prepTime}</p>
            </div>
            <button class="expand-btn" aria-label="View recipe details">▼</button>
        </div>
        <div class="recipe-details" style="display: none;">
            <div class="ingredients-section">
                <h4>Ingredients:</h4>
                <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
            </div>
            ${recipe.instructions ? `
            <div class="instructions-section">
                <h4>Instructions:</h4>
                <div class="instructions-content">${formatInstructions(recipe.instructions)}</div>
            </div>
            ` : ''}
            <div class="actions-section">
                <label for="day-${recipe.id}">Assign to day:</label>
                <select id="day-${recipe.id}">
                    <option value="">-- Select --</option>
                    ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => `<option value="${day}">${day}</option>`).join("")}
                </select>
                <button data-id="${recipe.id}" class="assign-btn">Assign</button>
                <button data-id="${recipe.id}" class="delete-btn">Delete</button>
            </div>
        </div>`;
        
        newContainer.appendChild(card);
    });

    // Add event listeners for assign, delete, and expand buttons to the new container
    newContainer.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        
        if (e.target.classList.contains("delete-btn")) {
            deleteRecipe(id);
        }
        else if (e.target.classList.contains("assign-btn")) {
            const day = document.getElementById(`day-${id}`).value;
            if (day) assignRecipeToDay(id, day);
        }
        else if (e.target.classList.contains("expand-btn")) {
            toggleRecipeDetails(e.target);
        }
        // Also allow clicking anywhere on the summary to expand
        else if (e.target.closest('.recipe-summary') && !e.target.closest('.expand-btn')) {
            const expandBtn = e.target.closest('.recipe-card').querySelector('.expand-btn');
            toggleRecipeDetails(expandBtn);
        }
    });
}

function formatInstructions(instructions) {
    // Handle different instruction formats from Spoonacular
    if (typeof instructions === 'string') {
        return `<p>${instructions}</p>`;
    } else if (Array.isArray(instructions) && instructions.length > 0) {
        // Handle analyzedInstructions format
        let formattedInstructions = '';
        instructions.forEach(instructionGroup => {
            if (instructionGroup.steps && Array.isArray(instructionGroup.steps)) {
                formattedInstructions += '<ol>';
                instructionGroup.steps.forEach(step => {
                    formattedInstructions += `<li>${step.step}</li>`;
                });
                formattedInstructions += '</ol>';
            }
        });
        return formattedInstructions;
    }
    return '<p>No instructions available</p>';
}

function toggleRecipeDetails(expandBtn) {
    const card = expandBtn.closest('.recipe-card');
    const details = card.querySelector('.recipe-details');
    const isExpanded = details.style.display !== 'none';
    
    if (isExpanded) {
        details.style.display = 'none';
        expandBtn.textContent = '▼';
        expandBtn.setAttribute('aria-label', 'View recipe details');
        card.classList.remove('expanded');
    } else {
        details.style.display = 'block';
        expandBtn.textContent = '▲';
        expandBtn.setAttribute('aria-label', 'Hide recipe details');
        card.classList.add('expanded');
    }
}

function assignRecipeToDay(id, day) {
    const weekPlan = loadFromStorage("weekPlan") || {};
    weekPlan[day] = Number(id);
    saveToStorage("weekPlan", weekPlan);
    alert(`Recipe assigned to ${day}!`);
}

function deleteRecipe(id) {
    let recipes = loadFromStorage("myRecipes") || [];
    recipes = recipes.filter(r => r.id != id);
    saveToStorage("myRecipes", recipes);
    renderMyRecipes();
}

function setupTabSwitching() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
            
            // Refresh content when switching tabs
            if (btn.dataset.tab === 'browse-recipes') {
                renderBrowseRecipes();
            } else if (btn.dataset.tab === 'my-recipes') {
                renderMyRecipes();
            }
        });
    });
}

async function renderBrowseRecipes(cuisine = "", diet = "", maxReadyTime = "") {
    const container = document.getElementById("browseRecipeList");
    container.innerHTML = "Loading...";

    try {
        const recipes = await searchRecipes(cuisine, diet, maxReadyTime);

        if (!recipes.length) {
            container.innerHTML = "<p>No recipes found. Try different search criteria.</p>";
            return;
        }

        container.innerHTML = "";
        
        // Get basic details for each recipe first to show prep time
        const recipePromises = recipes.map(async (recipe) => {
            const details = await getRecipeDetails(recipe.id);
            return { ...recipe, details };
        });
        
        const recipesWithDetails = await Promise.all(recipePromises);
        
        recipesWithDetails.forEach(recipe => {
            const card = document.createElement("div");
            card.className = "recipe-card browse";
            
            const prepTime = recipe.details?.readyInMinutes ? `${recipe.details.readyInMinutes} mins` : 'Time not available';
            const servings = recipe.details?.servings ? `${recipe.details.servings} servings` : '';
            
            card.innerHTML = `
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" />` : ""}
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>⏱️ ${prepTime}</span>
                        ${servings ? `<span>👥 ${servings}</span>` : ''}
                    </div>
                    <button class="ingredients-toggle" data-id="${recipe.id}">View Ingredients ▼</button>
                    <div class="recipe-ingredients" id="ingredients-${recipe.id}">
                        <h4>Ingredients:</h4>
                        <ul>
                            ${recipe.details?.extendedIngredients?.map(ingredient => `<li>${ingredient.original}</li>`).join('') || '<li>Ingredients not available</li>'}
                        </ul>
                    </div>
                    <button class="add-recipe-btn" data-id="${recipe.id}">Add to My Recipes</button>
                </div>
            `;

            // Add ingredient toggle functionality
            const toggleBtn = card.querySelector('.ingredients-toggle');
            const ingredientsDiv = card.querySelector('.recipe-ingredients');
            
            toggleBtn.addEventListener('click', () => {
                const isShowing = ingredientsDiv.classList.contains('show');
                
                if (isShowing) {
                    ingredientsDiv.classList.remove('show');
                    toggleBtn.textContent = 'View Ingredients ▼';
                } else {
                    ingredientsDiv.classList.add('show');
                    toggleBtn.textContent = 'Hide Ingredients ▲';
                }
            });

            // Add recipe functionality
            const addButton = card.querySelector(".add-recipe-btn");
            addButton.addEventListener("click", async () => {
                addButton.textContent = "Adding...";
                addButton.disabled = true;
                
                try {
                    const fullDetails = recipe.details; // We already have the details

                    if (!fullDetails) {
                        alert("Error loading recipe details.");
                        return;
                    }

                    const ingredients = fullDetails.extendedIngredients?.map(i => i.original) || ["No ingredients listed"];
                    const instructions = fullDetails.instructions || fullDetails.analyzedInstructions || "No instructions available";

                    const saved = loadFromStorage("myRecipes") || [];
                    
                    // Check if recipe already exists
                    const existingRecipe = saved.find(r => r.id === recipe.id);
                    if (existingRecipe) {
                        alert("Recipe already saved!");
                        addButton.textContent = "Already Added";
                        return;
                    }

                    saved.push({
                        id: recipe.id,
                        name: fullDetails.title,
                        ingredients: ingredients,
                        instructions: instructions,
                        image: fullDetails.image || recipe.image || null,
                        readyInMinutes: fullDetails.readyInMinutes || null,
                        servings: fullDetails.servings || null
                    });

                    saveToStorage("myRecipes", saved);
                    alert("Recipe saved to My Recipes!");
                    addButton.textContent = "Added!";
                    addButton.disabled = true;
                    
                    // Refresh the My Recipes tab if it's currently active
                    if (document.getElementById("my-recipes").classList.contains("active")) {
                        renderMyRecipes();
                    }
                } catch (error) {
                    console.error("Error saving recipe:", error);
                    alert("Error saving recipe. Please try again.");
                    addButton.textContent = "Add to My Recipes";
                    addButton.disabled = false;
                }
            });

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading recipes:", error);
        container.innerHTML = "<p>Error loading recipes. Please check your API key and try again.</p>";
    }
}

function setupSearchButton() {
    const searchBtn = document.getElementById("searchCuisineBtn");
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const cuisine = document.getElementById("cuisineSelect").value;
            const diet = document.getElementById("dietSelect").value;
            const maxTime = document.getElementById("maxTimeSelect").value;
            renderBrowseRecipes(cuisine, diet, maxTime);
        });
    }
}