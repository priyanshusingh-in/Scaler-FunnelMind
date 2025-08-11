/**
 * Main Application Script
 * Handles UI interactions, assessment flow, and user engagement
 */

// Global variables
let currentAssessmentStep = 1;
let assessmentAnswers = {};
let totalAssessmentSteps = 5;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    trackPageView();
});

function initializeApp() {
    console.log('🧠 Scaler-FunnelMind initializing...');
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Initialize assessment progress
    updateAssessmentProgress();
    
    // Setup form handlers
    setupFormHandlers();
    
    // Track user engagement
    startEngagementTracking();
    
    console.log('✅ Application ready');
}

function setupEventListeners() {
    // Navigation smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Course card interactions
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('mouseenter', handleCourseHover);
    });

    // Close modal handlers
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyPress);

    // Scroll-based animations
    window.addEventListener('scroll', handleScroll);

    // Exit intent detection
    document.addEventListener('mouseleave', handleExitIntent);
}

// Assessment Flow Functions
function openAssessment(context = 'general') {
    const modal = document.getElementById('assessment-modal');
    modal.style.display = 'block';
    
    // Reset assessment
    currentAssessmentStep = 1;
    assessmentAnswers = { context };
    
    // Show first step
    showAssessmentStep(1);
    updateAssessmentProgress();
    
    // Track event
    trackEvent('assessment_started', { context });
    
    // Add body class to prevent scrolling
    document.body.style.overflow = 'hidden';
}

function closeAssessment() {
    const modal = document.getElementById('assessment-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Track event if assessment was incomplete
    if (currentAssessmentStep < totalAssessmentSteps) {
        trackEvent('assessment_abandoned', { 
            step: currentAssessmentStep,
            answers: assessmentAnswers 
        });
    }
}

function selectOption(questionKey, value) {
    // Save answer
    assessmentAnswers[questionKey] = value;
    
    // Visual feedback
    const currentStep = document.querySelector('.assessment-step.active');
    const buttons = currentStep.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    
    // Track selection
    trackEvent('assessment_answer', { question: questionKey, answer: value });
    
    // Auto-advance after short delay
    setTimeout(() => {
        nextAssessmentStep();
    }, 800);
}

function nextAssessmentStep() {
    if (currentAssessmentStep < totalAssessmentSteps) {
        currentAssessmentStep++;
        showAssessmentStep(currentAssessmentStep);
        updateAssessmentProgress();
    } else {
        showAssessmentResults();
    }
}

function showAssessmentStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.assessment-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStep = document.getElementById(`assessment-step-${stepNumber}`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
    
    // Update step indicator
    document.getElementById('current-step').textContent = stepNumber;
}

async function showAssessmentResults() {
    // Hide all steps
    document.querySelectorAll('.assessment-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show results step
    const resultsStep = document.getElementById('assessment-results');
    resultsStep.classList.add('active');
    
    // Update progress to 100%
    document.getElementById('assessment-progress').style.width = '100%';
    document.getElementById('current-step').textContent = 'Results';
    document.getElementById('total-steps').textContent = 'Complete';
    
    // Generate AI recommendation
    const resultContainer = document.getElementById('recommendation-result');
    resultContainer.innerHTML = '<div class="loading">Generating your personalized recommendation...</div>';
    
    try {
        if (window.aiEngine && window.aiEngine.isInitialized) {
            const recommendation = await window.aiEngine.generateCourseRecommendations(assessmentAnswers);
            displayRecommendation(recommendation);
        } else {
            // Fallback if AI engine isn't ready
            setTimeout(async () => {
                const recommendation = await generateFallbackRecommendation();
                displayRecommendation(recommendation);
            }, 1500);
        }
    } catch (error) {
        console.error('Failed to generate recommendation:', error);
        const fallbackRecommendation = await generateFallbackRecommendation();
        displayRecommendation(fallbackRecommendation);
    }
    
    // Track completion
    trackEvent('assessment_completed', { answers: assessmentAnswers });
}

function displayRecommendation(recommendation) {
    const resultContainer = document.getElementById('recommendation-result');
    
    const html = `
        <div class="recommendation-header">
            <div class="recommendation-icon">
                <i class="fas fa-star"></i>
            </div>
            <h4>${recommendation.recommendedCourse}</h4>
        </div>
        
        <div class="recommendation-body">
            <p class="recommendation-reasoning">${recommendation.reasoning}</p>
            
            <div class="expected-outcome">
                <h6>Expected Outcome:</h6>
                <p>${recommendation.expectedOutcome}</p>
            </div>
            
            <div class="learning-highlights">
                <h6>Your Learning Path:</h6>
                <ul>
                    ${recommendation.learningPath.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            
            <div class="success-metric">
                <span class="metric-label">Success Probability:</span>
                <span class="metric-value">${recommendation.successProbability}</span>
            </div>
            
            <div class="personalized-message">
                <p><em>${recommendation.personalizedMessage}</em></p>
            </div>
        </div>
    `;
    
    resultContainer.innerHTML = html;
}

async function generateFallbackRecommendation() {
    // Simple logic-based recommendation
    const { career_goal, experience, interest } = assessmentAnswers;
    
    let course = 'AI & Machine Learning Program';
    let reasoning = 'Based on your responses, this comprehensive program offers the best career advancement opportunities.';
    
    if (interest === 'data_science') {
        course = 'Data Science & Analytics Program';
        reasoning = 'Your interest in data science makes this program perfect for developing analytical and statistical skills.';
    } else if (interest === 'mlops') {
        course = 'MLOps & Deployment Program';
        reasoning = 'Your technical background makes you ideal for this specialized program focusing on production ML systems.';
    }
    
    return {
        recommendedCourse: course,
        reasoning: reasoning,
        expectedOutcome: 'Achieve a 2-3x salary increase and land roles at top tech companies within 12 months',
        learningPath: ['Foundation Building', 'Hands-on Projects', 'Industry Mentorship', 'Job Placement Support'],
        successProbability: '92%',
        personalizedMessage: 'This program is specifically designed for professionals with your background and goals.'
    };
}

function updateAssessmentProgress() {
    const progress = (currentAssessmentStep / totalAssessmentSteps) * 100;
    document.getElementById('assessment-progress').style.width = `${progress}%`;
}

// Form Handlers
function setupFormHandlers() {
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', handleLeadFormSubmit);
    }
}

async function handleLeadFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        phone: document.getElementById('user-phone').value,
        assessmentAnswers: assessmentAnswers,
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.innerHTML = '<span class="loading"></span> Processing...';
    submitButton.disabled = true;
    
    try {
        // Save lead data
        await saveLeadData(formData);
        
        // Track conversion
        trackEvent('lead_captured', formData);
        
        // Show success and redirect
        showSuccessMessage();
        
        // Email automation is handled by the backend when lead is created
        // No need to trigger it separately from frontend
        
    } catch (error) {
        console.error('Lead submission failed:', error);
        showErrorMessage('Something went wrong. Please try again.');
    } finally {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

async function saveLeadData(leadData) {
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save lead data');
        }
        
        return await response.json();
    } catch (error) {
        // Fallback: save to localStorage
        const leads = JSON.parse(localStorage.getItem('scaler_leads') || '[]');
        leads.push(leadData);
        localStorage.setItem('scaler_leads', JSON.stringify(leads));
        
        console.warn('Lead saved locally due to API failure:', error);
    }
}

function showSuccessMessage() {
    const modal = document.getElementById('assessment-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="success-message">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>🎉 Success!</h3>
            <p>Your personalized career roadmap is on its way!</p>
            <div class="next-steps">
                <h4>What happens next:</h4>
                <ul>
                    <li>✅ You'll receive a detailed career roadmap via email</li>
                    <li>📞 Our career advisor will contact you within 24 hours</li>
                    <li>🎯 We'll schedule your free consultation call</li>
                </ul>
            </div>
            <button class="cta-button primary-cta" onclick="closeAssessment()">
                Perfect! Let's Begin
            </button>
        </div>
    `;
    
    // Auto-close after delay
    setTimeout(() => {
        closeAssessment();
    }, 5000);
}

function showErrorMessage(message) {
    // Simple error display - could be enhanced with toast notifications
    alert(message);
}

// Popup Functions
function openAssessmentFromPopup() {
    closePopup();
    openAssessment('popup');
}

function closePopup() {
    const popup = document.getElementById('smart-popup');
    popup.style.display = 'none';
    
    // Track popup close
    trackEvent('popup_closed');
}

// Smart Popup Trigger
async function handleExitIntent(event) {
    // Only trigger on actual exit (mouse leaving viewport)
    if (event.clientY <= 0) {
        const hasSeenPopup = localStorage.getItem('scaler_popup_shown');
        const popupElement = document.getElementById('smart-popup');
        
        if (!hasSeenPopup && popupElement.style.display !== 'block') {
            // Use AI engine if available
            if (window.aiEngine) {
                const timing = await window.aiEngine.determinePopupTiming();
                if (timing.shouldShow) {
                    showExitIntentPopup();
                }
            } else {
                showExitIntentPopup();
            }
        }
    }
}

function showExitIntentPopup() {
    const popup = document.getElementById('smart-popup');
    popup.style.display = 'block';
    
    // Mark as shown
    localStorage.setItem('scaler_popup_shown', 'true');
    
    // Track event
    trackEvent('exit_intent_popup_shown');
}

// Navigation and Interaction Handlers
function handleNavClick(event) {
    event.preventDefault();
    const targetId = event.target.getAttribute('href').substring(1);
    scrollToSection(targetId);
    
    // Track navigation
    trackEvent('navigation_click', { target: targetId });
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 80; // Account for fixed nav
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function handleCourseHover(event) {
    // Add interaction tracking
    trackEvent('course_hover', { 
        course: event.target.querySelector('h3')?.textContent 
    });
}

function handleOutsideClick(event) {
    // Close modal if clicking outside
    const modal = document.getElementById('assessment-modal');
    if (event.target === modal) {
        closeAssessment();
    }
    
    // Close popup if clicking outside
    const popup = document.getElementById('smart-popup');
    if (event.target === popup) {
        closePopup();
    }
}

function handleKeyPress(event) {
    // Close modals with Escape key
    if (event.key === 'Escape') {
        closeAssessment();
        closePopup();
    }
}

function handleScroll() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 15, 28, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 15, 28, 0.95)';
    }
    
    // Trigger animations for elements coming into view
    animateOnScroll();
}

function animateOnScroll() {
    const elements = document.querySelectorAll('.course-card, .story-card, .recommendation-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-in');
        }
    });
}

function setupSmoothScrolling() {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Analytics and Tracking
function trackPageView() {
    trackEvent('page_view', {
        page: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
    });
}

function trackEvent(eventName, data = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            custom_parameter: JSON.stringify(data),
            page_title: document.title,
            page_location: window.location.href
        });
    }
    
    // Custom analytics (could integrate with other services)
    console.log(`📊 Event: ${eventName}`, data);
    
    // Store events locally for AI analysis
    const events = JSON.parse(localStorage.getItem('scaler_events') || '[]');
    events.push({
        event: eventName,
        data,
        timestamp: Date.now(),
        url: window.location.href
    });
    
    // Keep only last 100 events
    if (events.length > 100) {
        events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('scaler_events', JSON.stringify(events));
}

function startEngagementTracking() {
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track milestone scrolls
            if (maxScroll >= 25 && maxScroll < 30) {
                trackEvent('scroll_depth_25');
            } else if (maxScroll >= 50 && maxScroll < 55) {
                trackEvent('scroll_depth_50');
            } else if (maxScroll >= 75 && maxScroll < 80) {
                trackEvent('scroll_depth_75');
            } else if (maxScroll >= 90) {
                trackEvent('scroll_depth_90');
            }
        }
    });
    
    // Track time on page
    let timeOnPage = 0;
    setInterval(() => {
        timeOnPage += 10;
        
        // Track time milestones
        if (timeOnPage === 30) trackEvent('time_on_page_30s');
        if (timeOnPage === 60) trackEvent('time_on_page_60s');
        if (timeOnPage === 120) trackEvent('time_on_page_2m');
        if (timeOnPage === 300) trackEvent('time_on_page_5m');
    }, 10000);
}

// Email Automation Trigger - REMOVED
// Email automation is now handled entirely by the backend when leads are created
// This prevents duplicate emails from being sent

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS animation classes dynamically
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .loading-recommendations {
            text-align: center;
            padding: 2rem;
            color: #b8c5d1;
            font-style: italic;
        }
        
        .success-message {
            text-align: center;
            padding: 2rem;
        }
        
        .success-icon {
            font-size: 4rem;
            color: #00d4ff;
            margin-bottom: 1rem;
        }
        
        .next-steps {
            text-align: left;
            margin: 2rem 0;
            padding: 1.5rem;
            background: rgba(0, 212, 255, 0.1);
            border-radius: 10px;
        }
        
        .next-steps ul {
            list-style: none;
            padding: 0;
        }
        
        .next-steps li {
            margin: 0.5rem 0;
            color: #b8c5d1;
        }
    `;
    document.head.appendChild(style);
}

// Initialize animations
document.addEventListener('DOMContentLoaded', addAnimationStyles);

// Export functions for global access
window.openAssessment = openAssessment;
window.closeAssessment = closeAssessment;
window.selectOption = selectOption;
window.closePopup = closePopup;
window.openAssessmentFromPopup = openAssessmentFromPopup;
window.scrollToSection = scrollToSection;
window.trackEvent = trackEvent;
