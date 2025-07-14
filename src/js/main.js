import { addRecipeForm } from './form-handler.mjs';
import { initMyRecipes } from './my-recipes.js';
import { initPlannerPage } from './planner.js';
import { initGroceryList } from './grocery.js';


const path = window.location.pathname.toLowerCase();

if (path.includes('grocery') || path.endsWith('/grocery')) {
    initGroceryList();
    console.log("Rendering grocery list with: ");
}

if (path.includes('my-recipes') || path.endsWith('/my-recipes')) {
    initMyRecipes();
}

if (path.includes('planner') || path.endsWith('/planner')) {
    initPlannerPage();
}

// Navigation 
function initNavigation() {
    
    const mobileNavBtn = document.getElementById('mobile-nav-btn'); 
    const navLinks = document.getElementById('navLinks');
    
    
    if (!mobileNavBtn || !navLinks) {
        console.log('Elements not found - exiting');
        return;
    }
    
    
    // Toggle mobile menu
    mobileNavBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isActive = mobileNavBtn.classList.contains('active');
        
        if (isActive) {
            console.log('Closing menu');
            closeMobileMenu();
        } else {
            console.log('Opening menu');
            openMobileMenu();
        }
    });
    
    // Close menu when clicking on nav links
    navLinks.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileNavBtn.contains(e.target) && !navLinks.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu on window resize if it gets larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    function openMobileMenu() {
        console.log('openMobileMenu called');
        mobileNavBtn.classList.add('active');
        navLinks.classList.add('active');
        document.body.classList.add('menu-open'); // Use document.body directly
        mobileNavBtn.setAttribute('aria-expanded', 'true');
        console.log('Classes added - button classes:', mobileNavBtn.classList.toString());
        console.log('Nav classes:', navLinks.classList.toString());
    }
    
    function closeMobileMenu() {
        console.log('closeMobileMenu called');
        mobileNavBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open'); // Use document.body directly
        mobileNavBtn.setAttribute('aria-expanded', 'false');
    }
}

// Make sure DOM is ready before initializing navigation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}