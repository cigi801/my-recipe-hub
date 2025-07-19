import { loadFromStorage, saveToStorage } from "./storage.mjs";

export function initMyRecipes() {
    renderMyRecipes();

}

function renderMyRecipes() {
    const container = document.getElementById("myRecipeList");
    
    // Remove existing event listeners by cloning the container
    const newContainer = container.cloneNode(false);
    container.parentNode.replaceChild(newContainer, container);
    
    // Clear content
    newContainer.innerHTML = "";

    const recipes = loadFromStorage("myRecipes") || [];
    // Debug
    console.log('All recipes from storage:', recipes);
    recipes.forEach((recipe, index) => {
        console.log(`Recipe ${index}:`, recipe);
        console.log(`Recipe ${index} ID:`, recipe.id);
    });
    
    if (recipes.length === 0) {
    newContainer.innerHTML = `
        <div class="empty-state">
            <h3>So empty... No saved recipes yet</h3>
            <p>Start building your recipe collection by adding some recipes!</p>
            <div class="empty-actions">
                <a href="/new-recipes" class="btn-primary">
                    <span class="add">+ </span>
                    Add and Browse Recipes
                </a>
            </div>
        </div>
    `;
    return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card condensed";
        card.dataset.id = recipe.id;
        
        const prepTime = recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : 'Time not available';
        
        // Make sure recipe.id exists before using it
        const recipeId = recipe.id || recipe.ID || Date.now(); // Fallback if needed
        console.log('Using recipe ID:', recipeId); // Debug

        card.innerHTML = 
        `<div class="recipe-summary">
            ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-thumbnail" />` : '<div class="recipe-placeholder">No Image</div>'}
            <div class="recipe-info">
                <h3><a href="/recipe-detail?id=${recipe.id}" class="recipe-link">${recipe.name}</a></h3>
                <p class="prep-time">⏱️ ${prepTime}</p>
            </div>
            <button class="view-details-btn" data-id="${recipe.id}" aria-label="View full recipe details">View</button>
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
        else if (e.target.classList.contains("view-details-btn")) {
        // Navigate to recipe detail page
        const recipeId = e.target.dataset.id;
        console.log('Button clicked, recipe ID:', recipeId); // Debug
        console.log('Button element:', e.target); // Debug
        console.log('Button data attributes:', e.target.dataset); // Debug
        window.location.href = `/recipe-detail?id=${recipeId}`;
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


