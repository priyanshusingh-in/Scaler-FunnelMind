/**
 * AI Engine - Handles all AI-powered features
 * Integrates with OpenAI API for personalized content generation
 */

class AIEngine {
    constructor() {
        this.apiEndpoint = '/api/ai'; // Backend endpoint
        this.userProfile = this.loadUserProfile();
        this.sessionData = {
            pageViews: 0,
            timeSpent: 0,
            scrollDepth: 0,
            interactions: [],
            startTime: Date.now()
        };
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('🤖 AI Engine initializing...');
        this.trackUserBehavior();
        this.startBehaviorAnalysis();
        this.loadPersonalizedContent();
        this.isInitialized = true;
        console.log('✅ AI Engine ready');
    }

    // User Behavior Tracking
    trackUserBehavior() {
        // Track page interactions
        document.addEventListener('click', (e) => {
            this.sessionData.interactions.push({
                type: 'click',
                element: e.target.tagName,
                className: e.target.className,
                timestamp: Date.now()
            });
        });

        // Track scroll depth
        window.addEventListener('scroll', this.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            this.sessionData.scrollDepth = Math.max(this.sessionData.scrollDepth, scrollPercent);
        }, 1000));

        // Track time spent
        setInterval(() => {
            this.sessionData.timeSpent = Date.now() - this.sessionData.startTime;
        }, 1000);

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveSessionData();
            }
        });
    }

    // Generate personalized CTA based on user profile
    async generatePersonalizedCTA(context = 'general') {
        const userBehavior = this.analyzeUserBehavior();
        const prompt = this.buildCTAPrompt(userBehavior, context);

        try {
            const response = await this.callAI(prompt, 'cta-generation');
            return this.parseCTAResponse(response);
        } catch (error) {
            console.error('CTA generation failed:', error);
            return this.getFallbackCTA(context);
        }
    }

    buildCTAPrompt(userBehavior, context) {
        return `Generate a personalized call-to-action for a user with the following profile:
        
        Behavior Analysis:
        - Time spent on page: ${Math.round(userBehavior.timeSpent / 1000)} seconds
        - Scroll depth: ${userBehavior.scrollDepth}%
        - Engagement level: ${userBehavior.engagementLevel}
        - Interaction count: ${userBehavior.interactionCount}
        
        Context: ${context}
        Target: Software engineers looking to upskill in AI/Data Science
        
        Generate a compelling, action-oriented CTA button text (max 4 words) and supporting message (max 15 words).
        
        Return in JSON format:
        {
            "buttonText": "...",
            "supportMessage": "..."
        }`;
    }

    // Generate personalized course recommendations
    async generateCourseRecommendations(assessmentAnswers = null) {
        const userProfile = assessmentAnswers || this.userProfile;
        const prompt = `Based on the following user profile, recommend the most suitable Scaler AI/Data Science course:
        
        User Profile:
        ${JSON.stringify(userProfile, null, 2)}
        
        Available Courses:
        1. AI & Machine Learning (12 months, comprehensive, job guarantee)
        2. Data Science & Analytics (10 months, project-focused, industry certified)
        3. MLOps & Deployment (6 months, specialized, cloud platforms)
        
        Provide a detailed recommendation with reasoning. Include:
        - Primary course recommendation
        - Why it's perfect for them
        - Expected outcome
        - Learning path highlights
        - Success probability
        
        Return in JSON format:
        {
            "recommendedCourse": "...",
            "reasoning": "...",
            "expectedOutcome": "...",
            "learningPath": ["...", "...", "..."],
            "successProbability": "...",
            "personalizedMessage": "..."
        }`;

        try {
            const response = await this.callAI(prompt, 'course-recommendation');
            return JSON.parse(response);
        } catch (error) {
            console.error('Course recommendation failed:', error);
            return this.getFallbackRecommendation(userProfile);
        }
    }

    // Generate personalized email content
    async generateEmailContent(emailType, userProfile) {
        const prompt = `Create a personalized ${emailType} email for a user interested in Scaler's AI/Data Science courses.
        
        User Profile:
        ${JSON.stringify(userProfile, null, 2)}
        
        Email Type: ${emailType}
        
        Requirements:
        - Professional but engaging tone
        - Personalized to user's background
        - Include relevant success stories
        - Clear call-to-action
        - Mobile-friendly format
        
        Return in JSON format:
        {
            "subject": "...",
            "content": "...",
            "cta": "..."
        }`;

        try {
            const response = await this.callAI(prompt, 'email-generation');
            return JSON.parse(response);
        } catch (error) {
            console.error('Email generation failed:', error);
            return this.getFallbackEmail(emailType);
        }
    }

    // Analyze user behavior and determine engagement level
    analyzeUserBehavior() {
        const timeSpent = this.sessionData.timeSpent;
        const scrollDepth = this.sessionData.scrollDepth;
        const interactionCount = this.sessionData.interactions.length;

        let engagementLevel = 'low';
        if (timeSpent > 60000 && scrollDepth > 50) engagementLevel = 'medium';
        if (timeSpent > 120000 && scrollDepth > 75 && interactionCount > 5) engagementLevel = 'high';

        return {
            timeSpent,
            scrollDepth,
            interactionCount,
            engagementLevel,
            isReturnVisitor: this.isReturnVisitor(),
            deviceType: this.getDeviceType(),
            trafficSource: this.getTrafficSource()
        };
    }

    // Determine optimal popup timing based on AI analysis
    async determinePopupTiming() {
        const behavior = this.analyzeUserBehavior();
        
        // AI-driven timing logic
        if (behavior.engagementLevel === 'high') {
            return { shouldShow: true, delay: 0 }; // Show immediately for highly engaged users
        } else if (behavior.engagementLevel === 'medium') {
            return { shouldShow: true, delay: 30000 }; // Show after 30 seconds
        } else if (behavior.scrollDepth > 60) {
            return { shouldShow: true, delay: 45000 }; // Show after 45 seconds if scrolling
        }
        
        return { shouldShow: false, delay: 0 };
    }

    // Generate personalized popup content
    async generatePopupContent() {
        const behavior = this.analyzeUserBehavior();
        const prompt = `Create a personalized exit-intent popup for a user with the following behavior:
        
        ${JSON.stringify(behavior, null, 2)}
        
        The popup should:
        - Address their specific interests
        - Create urgency without being pushy  
        - Offer clear value
        - Include social proof
        
        Return in JSON format:
        {
            "title": "...",
            "message": "...",
            "offer": "...",
            "buttonText": "..."
        }`;

        try {
            const response = await this.callAI(prompt, 'popup-generation');
            return JSON.parse(response);
        } catch (error) {
            console.error('Popup generation failed:', error);
            return this.getFallbackPopup();
        }
    }

    // Core AI API call function
    async callAI(prompt, type = 'general') {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    type,
                    userContext: {
                        profile: this.userProfile,
                        behavior: this.sessionData
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('AI API call failed:', error);
            throw error;
        }
    }

    // Load personalized content on page load
    async loadPersonalizedContent() {
        try {
            // Generate dynamic hero description
            const personalizedCTA = await this.generatePersonalizedCTA('hero');
            this.updateHeroCTA(personalizedCTA);

            // Load course recommendations
            this.loadRecommendations();

            // Setup smart popup timing
            this.setupSmartPopup();

        } catch (error) {
            console.error('Failed to load personalized content:', error);
        }
    }

    updateHeroCTA(ctaData) {
        const heroDescription = document.getElementById('dynamic-description');
        const mainCTA = document.getElementById('main-cta');
        
        if (ctaData && ctaData.supportMessage) {
            heroDescription.textContent = ctaData.supportMessage;
        }
        
        if (ctaData && ctaData.buttonText) {
            mainCTA.textContent = ctaData.buttonText;
        }
    }

    async loadRecommendations() {
        const recommendationsContainer = document.getElementById('recommendation-cards');
        if (!recommendationsContainer) return;

        // Show loading state
        recommendationsContainer.innerHTML = '<div class="loading-recommendations">Analyzing your interests...</div>';

        try {
            const recommendations = await this.generateCourseRecommendations();
            this.renderRecommendations(recommendations, recommendationsContainer);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
            recommendationsContainer.innerHTML = this.getFallbackRecommendationsHTML();
        }
    }

    renderRecommendations(recommendations, container) {
        const html = `
            <div class="recommendation-card ai-generated">
                <div class="recommendation-badge">
                    <i class="fas fa-robot"></i> AI Recommended
                </div>
                <h3>${recommendations.recommendedCourse}</h3>
                <p>${recommendations.reasoning}</p>
                <div class="recommendation-highlights">
                    ${recommendations.learningPath.map(item => `<span class="highlight">${item}</span>`).join('')}
                </div>
                <div class="success-probability">
                    <span class="probability-label">Success Probability:</span>
                    <span class="probability-value">${recommendations.successProbability}</span>
                </div>
                <button class="recommendation-cta" onclick="openAssessment('recommended')">
                    Get Started
                </button>
            </div>
        `;
        container.innerHTML = html;
    }

    async setupSmartPopup() {
        const timing = await this.determinePopupTiming();
        
        if (timing.shouldShow) {
            setTimeout(async () => {
                const popupContent = await this.generatePopupContent();
                this.showSmartPopup(popupContent);
            }, timing.delay);
        }
    }

    showSmartPopup(content) {
        const popup = document.getElementById('smart-popup');
        if (!popup || popup.style.display === 'block') return;

        // Update popup content
        document.getElementById('popup-title').textContent = content.title;
        document.getElementById('popup-message').textContent = content.message;
        
        // Show popup
        popup.style.display = 'block';
        
        // Track popup show event
        this.trackEvent('popup_shown', { content: content.title });
    }

    // Utility functions
    loadUserProfile() {
        const saved = localStorage.getItem('scaler_user_profile');
        return saved ? JSON.parse(saved) : {
            careerGoal: null,
            experience: null,
            interests: [],
            learningStyle: null,
            timeline: null,
            visitCount: this.getVisitCount()
        };
    }

    saveUserProfile(profile) {
        this.userProfile = { ...this.userProfile, ...profile };
        localStorage.setItem('scaler_user_profile', JSON.stringify(this.userProfile));
    }

    saveSessionData() {
        localStorage.setItem('scaler_session_data', JSON.stringify(this.sessionData));
    }

    isReturnVisitor() {
        return this.userProfile.visitCount > 1;
    }

    getVisitCount() {
        const count = localStorage.getItem('scaler_visit_count') || 0;
        const newCount = parseInt(count) + 1;
        localStorage.setItem('scaler_visit_count', newCount);
        return newCount;
    }

    getDeviceType() {
        return window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    }

    getTrafficSource() {
        return document.referrer || 'direct';
    }

    trackEvent(eventName, data = {}) {
        // Track custom events for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                custom_parameter: JSON.stringify(data),
                user_profile: JSON.stringify(this.userProfile)
            });
        }
        
        // Also store locally for AI analysis
        this.sessionData.interactions.push({
            type: 'event',
            name: eventName,
            data,
            timestamp: Date.now()
        });
    }

    // Fallback functions for when AI fails
    getFallbackCTA(context) {
        const fallbacks = {
            general: { buttonText: 'Start Learning', supportMessage: 'Transform your career with AI expertise' },
            hero: { buttonText: 'Begin Journey', supportMessage: 'Join thousands who\'ve advanced their careers' },
            popup: { buttonText: 'Get Started', supportMessage: 'Don\'t miss this opportunity' }
        };
        return fallbacks[context] || fallbacks.general;
    }

    getFallbackRecommendation(profile) {
        return {
            recommendedCourse: 'AI & Machine Learning Program',
            reasoning: 'Based on industry demand and career growth potential',
            expectedOutcome: 'Land a high-paying AI/ML role within 12 months',
            learningPath: ['Python Programming', 'Machine Learning', 'Deep Learning', 'Projects'],
            successProbability: '90%+',
            personalizedMessage: 'This program is designed for ambitious professionals like you'
        };
    }

    getFallbackPopup() {
        return {
            title: 'Don\'t miss your AI career opportunity!',
            message: 'Join thousands who have transformed their careers with our AI programs.',
            offer: 'Free Career Assessment + Personalized Roadmap',
            buttonText: 'Get My Assessment'
        };
    }

    getFallbackEmail(type) {
        return {
            subject: 'Your AI Career Journey Starts Here',
            content: 'Thank you for your interest in advancing your career with AI and Data Science.',
            cta: 'Book Your Consultation'
        };
    }

    getFallbackRecommendationsHTML() {
        return `
            <div class="recommendation-card">
                <h3>AI & Machine Learning Program</h3>
                <p>Perfect for software engineers looking to transition into AI/ML roles with comprehensive training and job placement support.</p>
                <button class="recommendation-cta" onclick="openAssessment('fallback')">Learn More</button>
            </div>
        `;
    }

    // Utility function for throttling
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Parse CTA response from AI
    parseCTAResponse(response) {
        try {
            return JSON.parse(response);
        } catch (error) {
            // Handle non-JSON responses
            return {
                buttonText: response.split('\n')[0] || 'Get Started',
                supportMessage: response.split('\n')[1] || 'Transform your career today'
            };
        }
    }
}

// Initialize AI Engine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiEngine = new AIEngine();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEngine;
}
