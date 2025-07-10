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
      // Show confirmation dialog 
      showSuccessModal(name);
    }, 600); // Match animation duration
  });
}

// Function to show success modal with options
function showSuccessModal(recipeName) {
  // Create modal HTML
  const modalHTML = `
    <div class="modal-overlay" id="successModal">
      <div class="modal-content success-modal">
        <div class="modal-header">
          <h3>✅ Recipe Saved!</h3>
        </div>
        <div class="modal-body">
          <p><strong>"${recipeName}"</strong> has been added to your recipes.</p>
          <p>Would you like to add another recipe?</p>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" id="goToRecipes">View My Recipes</button>
          <button class="btn-primary" id="addAnother">Add Another Recipe</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add event listeners
  document.getElementById('addAnother').addEventListener('click', () => {
    closeSuccessModal();
    clearAddRecipeForm();
  });
  
  document.getElementById('goToRecipes').addEventListener('click', () => {
    window.location.href = "my-recipes.html";
  });
  
  // Close on outside click - go to recipes
  document.getElementById('successModal').addEventListener('click', (e) => {
    if (e.target.id === 'successModal') {
      window.location.href = "my-recipes.html";
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', handleEscapeKey);
}

// Function to handle Escape key
function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    window.location.href = "my-recipes.html";
  }
}

// Function to close the modal
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.remove();
  }
  document.removeEventListener('keydown', handleEscapeKey);
}

// Function to clear the form for adding another recipe
function clearAddRecipeForm() {
  // Clear recipe name
  const nameInput = document.querySelector('#recipeName');
  if (nameInput) nameInput.value = '';
  
  // Clear ingredients list
  const ingredientsList = document.getElementById('ingredientList');
  if (ingredientsList) ingredientsList.innerHTML = '';
  
  // Clear ingredient input
  const ingredientInput = document.getElementById('ingredientInput');
  if (ingredientInput) ingredientInput.value = '';
  
  // Reset day selection
  const daySelect = document.querySelector('#assignDay');
  if (daySelect) daySelect.selectedIndex = 0;
  
  // Focus back on recipe name for better UX
  if (nameInput) nameInput.focus();
}

