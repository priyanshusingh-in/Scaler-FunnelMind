/**
 * Scaler-FunnelMind Backend Server
 * Handles AI API calls, lead management, and email automation
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// MongoDB imports
const database = require('./config/database');
const Lead = require('./models/Lead');
const Analytics = require('./models/Analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (CSS, JS, images)
app.use(express.static('.'));

// Test endpoint for Vercel
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Scaler-FunnelMind is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// MongoDB will handle data persistence when available
// Fallback to in-memory storage when MongoDB is not connected
let fallbackLeads = [];
let fallbackAnalytics = {
    pageViews: 0,
    assessmentStarts: 0,
    assessmentCompletions: 0,
    leadCaptures: 0,
    conversionRate: 0
};

// AI Integration - OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Gmail Email service configuration
const GmailService = require('./services/gmail-service');
const emailService = new GmailService();

/**
 * AI API Endpoint
 * Handles all AI-powered content generation
 */
app.post('/api/ai', async (req, res) => {
    try {
        const { prompt, type, userContext } = req.body;
        
        console.log(`🤖 AI Request - Type: ${type}`);
        
        // Validate request
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        // Call OpenAI API
        const aiResponse = await callOpenAI(prompt, type);
        
        // Log analytics
        logAIUsage(type, userContext);
        
        res.json({ 
            response: aiResponse,
            type: type,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('AI API Error:', error);
        
        // Return fallback response
        const fallbackResponse = getFallbackAIResponse(req.body.type);
        res.json({ 
            response: fallbackResponse,
            type: req.body.type,
            fallback: true,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt, type) {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }
    
    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: getSystemPrompt(type)
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Get system prompts for different AI tasks
 */
function getSystemPrompt(type) {
    const prompts = {
        'cta-generation': `You are an expert conversion copywriter for Scaler, an edtech company specializing in AI and Data Science courses. Generate compelling, personalized call-to-action content that converts software engineers into leads. Focus on career transformation, salary increases, and practical skills. Always return valid JSON.`,
        
        'course-recommendation': `You are a career advisor for Scaler's AI and Data Science programs. Analyze user profiles and recommend the most suitable course with detailed reasoning. Consider career goals, experience level, and learning preferences. Provide specific, actionable insights. Always return valid JSON.`,
        
        'email-generation': `You are an email marketing specialist for Scaler. Create personalized, engaging email content for software engineers interested in AI/Data Science career transitions. Use a professional but encouraging tone. Include social proof and clear value propositions. Always return valid JSON.`,
        
        'popup-generation': `You are a conversion optimization expert. Create compelling exit-intent popup content that addresses user hesitations and provides clear value. Focus on urgency without being pushy. Include social proof and strong offers. Always return valid JSON.`,
        
        'general': `You are an AI assistant for Scaler, helping potential students understand our AI and Data Science programs. Provide helpful, accurate information about career transitions in tech. Be encouraging and focus on transformation opportunities.`
    };
    
    return prompts[type] || prompts['general'];
}

/**
 * Fallback AI responses when API fails
 */
function getFallbackAIResponse(type) {
    const fallbacks = {
        'cta-generation': JSON.stringify({
            buttonText: 'Start Your Journey',
            supportMessage: 'Transform your career with AI expertise from industry leaders'
        }),
        
        'course-recommendation': JSON.stringify({
            recommendedCourse: 'AI & Machine Learning Program',
            reasoning: 'This comprehensive program is designed for software engineers looking to transition into high-growth AI roles.',
            expectedOutcome: 'Land a high-paying AI/ML position within 12 months',
            learningPath: ['Python & Math Foundations', 'Machine Learning Core', 'Deep Learning', 'Real-world Projects', 'Job Placement'],
            successProbability: '90%+',
            personalizedMessage: 'Based on the growing demand for AI professionals, this program offers the best career advancement opportunity.'
        }),
        
        'email-generation': JSON.stringify({
            subject: 'Your AI Career Transformation Starts Here',
            content: 'Thank you for your interest in advancing your career with AI and Data Science. Our programs have helped thousands of engineers like you achieve significant career growth.',
            cta: 'Schedule Your Free Consultation'
        }),
        
        'popup-generation': JSON.stringify({
            title: 'Don\'t miss your AI career opportunity!',
            message: 'Join thousands of engineers who have transformed their careers with our proven AI programs.',
            offer: 'Free Career Assessment + Personalized Roadmap',
            buttonText: 'Get My Free Assessment'
        })
    };
    
    return fallbacks[type] || 'Thank you for your interest in Scaler\'s AI programs!';
}

/**
 * Lead Management Endpoint
 */
app.post('/api/leads', async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['name', 'email'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ 
                    error: `${field} is required` 
                });
            }
        }
        
        const dbStatus = database.getConnectionStatus();
        let savedLead;
        
        if (dbStatus.connected) {
            // Use MongoDB
            const leadData = new Lead({
                leadId: generateLeadId(),
                ...req.body,
                status: 'new',
                source: 'funnelmind'
            });
            savedLead = await leadData.save();
        } else {
            // Use fallback in-memory storage
            savedLead = {
                leadId: generateLeadId(),
                ...req.body,
                createdAt: new Date().toISOString(),
                status: 'new',
                source: 'funnelmind'
            };
            fallbackLeads.push(savedLead);
        }
        
        // Update analytics
        await updateAnalytics('leadCaptures');
        
        console.log(`📋 New Lead: ${savedLead.name} (${savedLead.email})`);
        
        // Trigger welcome email
        await triggerWelcomeEmail(savedLead);
        
        // Schedule follow-up emails
        scheduleEmailSequence(savedLead);
        
        res.json({ 
            success: true, 
            leadId: savedLead.leadId,
            message: 'Lead captured successfully'
        });
        
    } catch (error) {
        console.error('Lead creation error:', error);
        
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        res.status(500).json({ error: 'Failed to process lead' });
    }
});

/**
 * Get Analytics Dashboard Data
 */
app.get('/api/analytics', async (req, res) => {
    try {
        const dbStatus = database.getConnectionStatus();
        let enhancedAnalytics;
        
        if (dbStatus.connected) {
            // Use MongoDB
            const analytics = await Analytics.getGlobalAnalytics();
            const totalLeads = await Lead.countDocuments();
            const recentLeads = await Lead.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email phone createdAt assessmentAnswers')
                .lean();
            
            const formattedRecentLeads = recentLeads.map(lead => ({
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                createdAt: lead.createdAt,
                source: lead.assessmentAnswers?.context || 'unknown'
            }));
            
            enhancedAnalytics = {
                pageViews: analytics.pageViews,
                assessmentStarts: analytics.assessmentStarts,
                assessmentCompletions: analytics.assessmentCompletions,
                leadCaptures: analytics.leadCaptures,
                conversionRate: analytics.conversionRate,
                totalLeads,
                recentLeads: formattedRecentLeads,
                leadsBySource: await getLeadsBySource(),
                assessmentFunnelData: await getAssessmentFunnelData()
            };
        } else {
            // Use fallback in-memory storage
            const formattedRecentLeads = fallbackLeads.slice(-5).reverse().map(lead => ({
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                createdAt: lead.createdAt,
                source: lead.assessmentAnswers?.context || 'unknown'
            }));
            
            enhancedAnalytics = {
                ...fallbackAnalytics,
                totalLeads: fallbackLeads.length,
                recentLeads: formattedRecentLeads,
                leadsBySource: await getLeadsBySource(),
                assessmentFunnelData: await getAssessmentFunnelData()
            };
        }
        
        res.json(enhancedAnalytics);
    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * Get Leads (simple API for admin dashboard)
 * Supports optional pagination and basic search
 */
app.get('/api/leads', async (req, res) => {
    try {
        const { page = 1, limit = 100, q } = req.query;
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);

        const dbStatus = database.getConnectionStatus();

        // Build optional search filter
        const searchFilter = q
            ? {
                  $or: [
                      { name: { $regex: q, $options: 'i' } },
                      { email: { $regex: q, $options: 'i' } },
                  ],
              }
            : {};

        if (dbStatus.connected) {
            const [leads, total] = await Promise.all([
                Lead.find(searchFilter)
                    .sort({ createdAt: -1 })
                    .skip((pageNumber - 1) * pageSize)
                    .limit(pageSize)
                    .lean(),
                Lead.countDocuments(searchFilter),
            ]);

            return res.json({
                total,
                page: pageNumber,
                limit: pageSize,
                leads,
                storage: 'mongodb',
            });
        } else {
            // Fallback to in-memory store
            let leads = [...fallbackLeads];

            if (q) {
                const query = q.toLowerCase();
                leads = leads.filter(
                    (l) =>
                        (l.name && l.name.toLowerCase().includes(query)) ||
                        (l.email && l.email.toLowerCase().includes(query))
                );
            }

            leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const total = leads.length;
            const start = (pageNumber - 1) * pageSize;
            const paginated = leads.slice(start, start + pageSize);

            return res.json({
                total,
                page: pageNumber,
                limit: pageSize,
                leads: paginated,
                storage: 'in-memory',
            });
        }
    } catch (error) {
        console.error('Leads fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

/**
 * Email Automation Trigger
 */
app.post('/api/email/trigger', async (req, res) => {
    try {
        const { email, name, assessmentData, sequenceType } = req.body;
        
        console.log(`📧 Triggering email sequence: ${sequenceType} for ${email}`);
        
        // Generate personalized email content
        const emailContent = await generatePersonalizedEmail(assessmentData, sequenceType);
        
        // Send email (mock implementation)
        const emailResult = await sendEmail({
            to: email,
            name: name,
            subject: emailContent.subject,
            content: emailContent.content,
            type: sequenceType
        });
        
        res.json({ 
            success: true, 
            emailId: emailResult.id,
            message: 'Email sequence triggered'
        });
        
    } catch (error) {
        console.error('Email trigger error:', error);
        res.status(500).json({ error: 'Failed to trigger email' });
    }
});

/**
 * Analytics Event Tracking
 */
app.post('/api/analytics/track', async (req, res) => {
    try {
        const { event, data } = req.body;
        
        // Update analytics based on event type
        let updateField;
        switch (event) {
            case 'page_view':
                updateField = 'pageViews';
                break;
            case 'assessment_started':
                updateField = 'assessmentStarts';
                break;
            case 'assessment_completed':
                updateField = 'assessmentCompletions';
                break;
        }
        
        if (updateField) {
            await updateAnalytics(updateField);
        }
        
        console.log(`📊 Analytics Event: ${event}`);
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
});

/**
 * Email Generation and Sending Functions
 */
async function generatePersonalizedEmail(assessmentData, sequenceType) {
    const prompt = `Create a personalized ${sequenceType} email for a user with assessment data: ${JSON.stringify(assessmentData)}. Make it engaging and action-oriented.`;
    
    try {
        if (OPENAI_API_KEY) {
            const response = await callOpenAI(prompt, 'email-generation');
            return JSON.parse(response);
        }
    } catch (error) {
        console.error('Email generation failed:', error);
    }
    
    // Enhanced fallback with actual personalization
    console.log('📧 Using fallback email generation with assessment data processing');
    return generateFallbackEmail(assessmentData, sequenceType);
}

/**
 * Generate fallback email with actual personalization based on assessment data
 */
function generateFallbackEmail(assessmentData, sequenceType) {
    console.log(`📧 Generating fallback email - Type: ${sequenceType}`, {
        hasAssessmentData: !!assessmentData,
        assessmentKeys: assessmentData ? Object.keys(assessmentData) : []
    });
    
    // Load email templates
    const fs = require('fs');
    const path = require('path');
    
    let templates = {};
    try {
        const templatesPath = path.join(__dirname, 'data', 'email-templates.json');
        templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
        console.log(`📧 Successfully loaded email templates. Available: ${Object.keys(templates).join(', ')}`);
    } catch (error) {
        console.error('❌ Failed to load email templates:', error);
    }
    
    // Generate course recommendation based on assessment data
    const recommendation = generateCourseRecommendation(assessmentData);
    console.log(`📧 Generated course recommendation: ${recommendation.recommendedCourse}`);
    
    // Get the appropriate template
    const templateKey = sequenceType === 'welcome' ? 'welcome' : 'assessment_results';
    const template = templates[templateKey];
    console.log(`📧 Using template: ${templateKey}, Found: ${!!template}`);
    
    if (template) {
        // Generate detailed roadmap
        const detailedRoadmap = generateDetailedRoadmap(assessmentData, recommendation);
        
        // Replace template placeholders with actual data
        let content = template.template
            .replace(/\{\{name\}\}/g, assessmentData?.name || 'there')
            .replace(/\{\{recommendedCourse\}\}/g, recommendation.recommendedCourse)
            .replace(/\{\{reasoning\}\}/g, recommendation.reasoning)
            .replace(/\{\{expectedOutcome\}\}/g, recommendation.expectedOutcome)
            .replace(/\{\{detailedRoadmap\}\}/g, detailedRoadmap)
            .replace(/\{\{successStory\}\}/g, recommendation.successStory || 'Join thousands of engineers who have successfully transitioned to AI roles with average salary increases of 80%.')
            .replace(/\{\{ctaLink\}\}/g, 'https://calendly.com/scaler-ai/consultation')
            .replace(/\{\{advisorName\}\}/g, 'Sarah Chen');
        
        // Convert markdown formatting to HTML
        content = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** to <strong>text</strong>
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // *text* to <em>text</em>
            .replace(/\n/g, '<br>'); // line breaks to <br>
        
        const emailResult = {
            subject: template.subject,
            content: content,
            cta: 'Book Your Free Consultation'
        };
        
        console.log(`✅ Successfully generated personalized email:`, {
            subject: emailResult.subject,
            contentLength: emailResult.content.length,
            hasRoadmap: content.includes('Timeline:'),
            hasRecommendation: content.includes(recommendation.recommendedCourse)
        });
        
        return emailResult;
    }
    
    // Ultimate fallback if templates are missing
    console.log('⚠️ Using ultimate fallback email template (templates not found)');
    const detailedRoadmap = generateDetailedRoadmap(assessmentData, recommendation);
    
    // Convert markdown formatting in the roadmap content
    const formattedRoadmap = detailedRoadmap
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** to <strong>text</strong>
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // *text* to <em>text</em>
        .replace(/\n/g, '<br>'); // line breaks to <br>
    
    const fallbackEmail = {
        subject: 'Your Personalized AI Career Roadmap',
        content: `Hi ${assessmentData?.name || 'there'}!<br><br>

Thank you for completing our career assessment. Based on your responses, we've created a personalized roadmap for your AI career transformation.<br><br>

<strong>Your Recommended Path:</strong> ${recommendation.recommendedCourse}<br><br>

<strong>Why this is perfect for you:</strong><br>
${recommendation.reasoning}<br><br>

<strong>Expected Outcome:</strong><br>
${recommendation.expectedOutcome}<br><br>

<strong>Your Personalized Learning Roadmap:</strong><br>
${formattedRoadmap}<br><br>

<strong>Success Story:</strong><br>
${recommendation.successStory}<br><br>

<strong>What's Next:</strong><br>
✅ Review your detailed career roadmap above<br>
📞 Book a free 1-on-1 consultation with our career advisor<br>
🎯 Get personalized guidance on your learning journey<br>
💼 Access exclusive job opportunities in our partner network<br><br>

Our team will contact you within 24 hours to discuss your next steps.<br><br>

Best regards,<br>
The Scaler Team<br><br>

P.S. Over 50,000 engineers have transformed their careers with us. You're next! 🚀`,
        cta: 'Schedule Your Consultation'
    };
    
    console.log(`✅ Generated ultimate fallback email with ${detailedRoadmap.length} character roadmap`);
    return fallbackEmail;
}

/**
 * Generate course recommendation based on assessment data
 */
function generateCourseRecommendation(assessmentData) {
    if (!assessmentData) {
        return {
            recommendedCourse: 'AI & Machine Learning Program',
            reasoning: 'Our comprehensive program offers the best career advancement opportunities in the rapidly growing AI field.',
            expectedOutcome: 'Achieve a 2-3x salary increase and land roles at top tech companies within 12 months.',
            successStory: 'Like Rahul, who went from a software developer to AI Engineer at Google with a 120% salary increase.'
        };
    }
    
    const { career_goal, experience, interest, background } = assessmentData;
    
    let course = 'AI & Machine Learning Program';
    let reasoning = 'Based on your responses, this comprehensive program offers the best career advancement opportunities.';
    let outcome = 'Achieve a 2-3x salary increase and land roles at top tech companies within 12 months';
    let story = 'Like thousands of engineers who have successfully transitioned to AI roles with us.';
    
    // Personalize based on interest
    if (interest === 'data_science') {
        course = 'Data Science & Analytics Program';
        reasoning = 'Your interest in data science makes this program perfect for developing analytical and statistical skills that are in high demand.';
        outcome = 'Become a data science expert with skills in Python, SQL, machine learning, and statistical analysis. Expected salary range: ₹15-25 LPA.';
        story = 'Like Priya, who transitioned from web development to Data Scientist at Microsoft with a 150% salary increase.';
    } else if (interest === 'mlops') {
        course = 'MLOps & Deployment Program';
        reasoning = 'Your technical background makes you ideal for this specialized program focusing on production ML systems and deployment pipelines.';
        outcome = 'Master MLOps tools and become an expert in deploying ML models at scale. Expected salary range: ₹18-30 LPA.';
        story = 'Like Arjun, who became an MLOps Engineer at Amazon and doubled his salary within 8 months.';
    } else if (interest === 'ai_research') {
        course = 'Advanced AI & Research Program';
        reasoning = 'Your interest in AI research aligns perfectly with our advanced program covering cutting-edge AI techniques and research methodologies.';
        outcome = 'Develop expertise in advanced AI research and land roles at top research labs or AI-first companies. Expected salary range: ₹20-35 LPA.';
        story = 'Like Dr. Karthik, who transitioned from software engineering to AI Research Scientist at OpenAI.';
    }
    
    // Adjust based on experience level
    if (experience === 'beginner') {
        reasoning += ' The program includes comprehensive foundation modules to ensure you build strong fundamentals before diving into advanced topics.';
    } else if (experience === 'expert') {
        reasoning += ' With your advanced background, you can skip foundational modules and focus on cutting-edge techniques and specializations.';
    }
    
    return {
        recommendedCourse: course,
        reasoning: reasoning,
        expectedOutcome: outcome,
        successStory: story
    };
}

/**
 * Generate detailed roadmap based on assessment data and course recommendation
 */
function generateDetailedRoadmap(assessmentData, recommendation) {
    const { interest, experience, background, career_goal } = assessmentData || {};
    
    // Base roadmap structure
    let roadmap = {
        foundation: [],
        core: [],
        specialization: [],
        career: []
    };
    
    // Customize based on interest
    if (interest === 'data_science') {
        roadmap = {
            foundation: [
                "Master Python and SQL fundamentals",
                "Statistics and probability theory",
                "Data visualization with Matplotlib and Seaborn",
                "Pandas and NumPy for data manipulation"
            ],
            core: [
                "Machine learning algorithms (supervised and unsupervised)",
                "Feature engineering and model selection",
                "Deep learning with TensorFlow/PyTorch",
                "Time series analysis and forecasting",
                "A/B testing and experimental design"
            ],
            specialization: [
                "Advanced analytics and business intelligence",
                "Big data technologies (Spark, Hadoop)",
                "MLOps and model deployment",
                "Domain-specific projects (finance, healthcare, e-commerce)"
            ],
            career: [
                "Build impressive portfolio with 5+ real-world projects",
                "Mock interviews with industry experts",
                "Resume optimization for data science roles",
                "Networking with Scaler alumni network",
                "Job placement assistance with partner companies"
            ]
        };
    } else if (interest === 'mlops') {
        roadmap = {
            foundation: [
                "DevOps fundamentals and containerization (Docker)",
                "Cloud platforms (AWS/GCP/Azure) basics",
                "Python programming and software engineering practices",
                "Version control with Git and MLflow"
            ],
            core: [
                "ML model lifecycle management",
                "CI/CD pipelines for ML projects",
                "Monitoring and logging for ML systems",
                "Kubernetes for ML deployment",
                "Infrastructure as Code (Terraform)"
            ],
            specialization: [
                "Advanced ML orchestration tools (Airflow, Kubeflow)",
                "Model serving and API development",
                "Edge deployment and optimization",
                "Security and compliance in ML systems"
            ],
            career: [
                "Build end-to-end MLOps pipeline projects",
                "Contribute to open-source ML tools",
                "Industry certifications (AWS ML, GCP ML)",
                "Technical interview preparation",
                "Job placement with top tech companies"
            ]
        };
    } else if (interest === 'ai_research') {
        roadmap = {
            foundation: [
                "Advanced mathematics (linear algebra, calculus)",
                "Research methodology and academic writing",
                "Python and deep learning frameworks",
                "Literature review and paper analysis"
            ],
            core: [
                "Advanced neural network architectures",
                "Natural language processing and computer vision",
                "Reinforcement learning and optimization",
                "Research project execution",
                "Conference paper writing and submission"
            ],
            specialization: [
                "Cutting-edge AI research areas (LLMs, multimodal AI)",
                "Research collaboration and mentorship",
                "Grant writing and funding acquisition",
                "Industry-academia partnerships"
            ],
            career: [
                "Publish papers in top-tier conferences",
                "Build research portfolio and online presence",
                "Network with research community",
                "Prepare for research scientist interviews",
                "Transition to research roles in industry or academia"
            ]
        };
    } else {
        // Default AI & Machine Learning roadmap
        roadmap = {
            foundation: [
                "Python programming mastery",
                "Mathematics for AI (statistics, linear algebra)",
                "Data structures and algorithms review",
                "Introduction to machine learning concepts"
            ],
            core: [
                "Supervised learning algorithms and implementation",
                "Unsupervised learning and clustering",
                "Deep learning and neural networks",
                "Computer vision and image processing",
                "Natural language processing basics"
            ],
            specialization: [
                "Advanced deep learning architectures",
                "MLOps and production deployment",
                "AI ethics and responsible AI development",
                "Industry-specific AI applications"
            ],
            career: [
                "Capstone project with real industry mentor",
                "Technical interview preparation",
                "Portfolio development and GitHub optimization",
                "Mock interviews and salary negotiation",
                "Job placement with 100+ partner companies"
            ]
        };
    }
    
    // Adjust timeline based on experience level
    let timeline = "12 months";
    if (experience === 'beginner') {
        timeline = "15 months (includes extended foundation period)";
    } else if (experience === 'expert') {
        timeline = "9 months (accelerated track available)";
    }
    
    // Format roadmap for email
    return `
**Timeline:** ${timeline}

**Phase 1: Foundation Building (Months 1-3)**
${roadmap.foundation.map(item => `• ${item}`).join('\n')}

**Phase 2: Core Skills Development (Months 4-8)**
${roadmap.core.map(item => `• ${item}`).join('\n')}

**Phase 3: Specialization & Advanced Topics (Months 9-11)**
${roadmap.specialization.map(item => `• ${item}`).join('\n')}

**Phase 4: Career Transition & Job Placement (Month 12+)**
${roadmap.career.map(item => `• ${item}`).join('\n')}

**Hands-on Projects Included:**
• Build 8-10 real-world projects for your portfolio
• Work on live industry problems with mentor guidance
• Collaborate with peers on team projects
• Present your work to industry experts

**Support Throughout Your Journey:**
• Weekly 1-on-1 mentorship sessions
• 24/7 doubt resolution support
• Peer learning groups and study circles
• Industry networking events and job fairs`;
}

async function sendEmail(emailData) {
    // Use Gmail service to send actual emails
    try {
        const result = await emailService.sendEmail(emailData);
        return {
            id: result.messageId || `email_${Date.now()}`,
            status: result.success ? 'sent' : 'failed',
            timestamp: result.timestamp,
            provider: result.provider || 'gmail'
        };
    } catch (error) {
        console.error('Failed to send email:', error);
        return {
            id: `email_${Date.now()}`,
            status: 'failed',
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
}

async function triggerWelcomeEmail(leadData) {
    const emailContent = await generatePersonalizedEmail(leadData.assessmentAnswers, 'welcome');
    
    return sendEmail({
        to: leadData.email,
        name: leadData.name,
        subject: emailContent.subject,
        content: emailContent.content,
        type: 'welcome'
    });
}

function scheduleEmailSequence(leadData) {
    // Schedule follow-up emails (simplified version)
    const emailSchedule = [
        { delay: 24 * 60 * 60 * 1000, type: 'assessment_results' }, // 24 hours
        { delay: 3 * 24 * 60 * 60 * 1000, type: 'success_stories' }, // 3 days
        { delay: 5 * 24 * 60 * 60 * 1000, type: 'course_deep_dive' }, // 5 days
        { delay: 7 * 24 * 60 * 60 * 1000, type: 'social_proof' }, // 7 days
        { delay: 10 * 24 * 60 * 60 * 1000, type: 'final_cta' } // 10 days
    ];
    
    emailSchedule.forEach(({ delay, type }) => {
        setTimeout(async () => {
            try {
                const emailContent = await generatePersonalizedEmail(leadData.assessmentAnswers, type);
                await sendEmail({
                    to: leadData.email,
                    name: leadData.name,
                    subject: emailContent.subject,
                    content: emailContent.content,
                    type: type
                });
                console.log(`📧 Scheduled email sent: ${type} to ${leadData.email}`);
            } catch (error) {
                console.error(`Failed to send scheduled email ${type}:`, error);
            }
        }, delay);
    });
    
    console.log(`⏰ Scheduled ${emailSchedule.length} follow-up emails for ${leadData.email}`);
}

/**
 * Utility Functions
 */
function generateLeadId() {
    return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function updateAnalytics(field) {
    try {
        const dbStatus = database.getConnectionStatus();
        
        if (dbStatus.connected) {
            // Use MongoDB
            const analytics = await Analytics.getGlobalAnalytics();
            analytics[field]++;
            
            if (field === 'leadCaptures' || field === 'assessmentCompletions') {
                analytics.updateConversionRate();
            }
            
            await analytics.save();
        } else {
            // Use fallback in-memory storage
            fallbackAnalytics[field]++;
            
            if (field === 'leadCaptures' || field === 'assessmentCompletions') {
                if (fallbackAnalytics.assessmentStarts > 0) {
                    fallbackAnalytics.conversionRate = ((fallbackAnalytics.leadCaptures / fallbackAnalytics.assessmentStarts) * 100);
                }
            }
        }
    } catch (error) {
        console.error('Failed to update analytics:', error);
        // Fallback to in-memory even on error
        fallbackAnalytics[field]++;
    }
}

async function getLeadsBySource() {
    try {
        const dbStatus = database.getConnectionStatus();
        
        if (dbStatus.connected) {
            // Use MongoDB aggregation
            const pipeline = [
                {
                    $group: {
                        _id: {
                            $ifNull: ['$assessmentAnswers.context', 'direct']
                        },
                        count: { $sum: 1 }
                    }
                }
            ];
            
            const results = await Lead.aggregate(pipeline);
            const sources = {};
            results.forEach(result => {
                sources[result._id] = result.count;
            });
            
            return sources;
        } else {
            // Use fallback in-memory data
            const sources = {};
            fallbackLeads.forEach(lead => {
                const source = lead.assessmentAnswers?.context || 'direct';
                sources[source] = (sources[source] || 0) + 1;
            });
            return sources;
        }
    } catch (error) {
        console.error('Failed to get leads by source:', error);
        return {};
    }
}

async function getAssessmentFunnelData() {
    try {
        const dbStatus = database.getConnectionStatus();
        let analytics;
        
        if (dbStatus.connected) {
            analytics = await Analytics.getGlobalAnalytics();
        } else {
            analytics = fallbackAnalytics;
        }
        
        return {
            started: analytics.assessmentStarts,
            completed: analytics.assessmentCompletions,
            converted: analytics.leadCaptures,
            completionRate: analytics.assessmentStarts > 0 ? 
                ((analytics.assessmentCompletions / analytics.assessmentStarts) * 100).toFixed(2) : 0,
            conversionRate: typeof analytics.conversionRate === 'number' ? 
                analytics.conversionRate.toFixed(2) : analytics.conversionRate
        };
    } catch (error) {
        console.error('Failed to get funnel data:', error);
        return {
            started: 0,
            completed: 0,
            converted: 0,
            completionRate: 0,
            conversionRate: 0
        };
    }
}

function logAIUsage(type, userContext) {
    console.log(`🤖 AI Usage - Type: ${type}, Context: ${JSON.stringify(userContext?.profile?.careerGoal || 'unknown')}`);
}

/**
 * Serve the main application
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
    try {
        const dbStatus = database.getConnectionStatus();
        let totalLeads, analytics;
        
        if (dbStatus.connected) {
            totalLeads = await Lead.countDocuments();
            analytics = await Analytics.getGlobalAnalytics();
        } else {
            totalLeads = fallbackLeads.length;
            analytics = fallbackAnalytics;
        }
        
        res.json({ 
            status: dbStatus.connected ? 'healthy' : 'healthy-fallback',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbStatus,
            storage: dbStatus.connected ? 'mongodb' : 'in-memory',
            totalLeads,
            analytics: {
                pageViews: analytics.pageViews,
                assessmentStarts: analytics.assessmentStarts,
                assessmentCompletions: analytics.assessmentCompletions,
                leadCaptures: analytics.leadCaptures,
                conversionRate: analytics.conversionRate
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

/**
 * Admin dashboard - serve using file system reading instead of sendFile
 */
app.get('/admin', async (req, res) => {
    try {
        const fs = require('fs');
        const adminPath = path.join(__dirname, 'admin-dashboard.html');
        
        // Check if file exists first
        if (fs.existsSync(adminPath)) {
            const adminContent = fs.readFileSync(adminPath, 'utf8');
            res.setHeader('Content-Type', 'text/html');
            res.send(adminContent);
        } else {
            // Fallback: serve a simple admin dashboard if file doesn't exist
            res.setHeader('Content-Type', 'text/html');
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Admin Dashboard</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; margin-bottom: 30px; }
                        .status { padding: 15px; border-radius: 5px; margin: 10px 0; }
                        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎯 Scaler FunnelMind Admin</h1>
                            <p>Administrative Dashboard</p>
                        </div>
                        <div class="status success">
                            ✅ Server is running successfully
                        </div>
                        <div class="status info">
                            📊 Analytics data is being collected
                        </div>
                        <div class="status info">
                            🔧 This is a simplified admin view. Full dashboard loading...
                        </div>
                        <p><strong>API Endpoints:</strong></p>
                        <ul>
                            <li><a href="/health">Health Check</a></li>
                            <li><a href="/test">Test Endpoint</a></li>
                            <li><a href="/api/analytics">Analytics Data</a></li>
                        </ul>
                        <p><em>Timestamp: ${new Date().toISOString()}</em></p>
                    </div>
                    <script>
                        // Try to load the full admin dashboard
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    </script>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ 
            error: 'Failed to load admin dashboard',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Admin dashboard API endpoints
 */
app.get('/admin/api/status', async (req, res) => {
    try {
        const dbStatus = database.getConnectionStatus();
        res.json({
            status: 'ok',
            database: dbStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Admin API error:', error);
        res.status(500).json({ error: 'Failed to get admin status' });
    }
});

/**
 * Initialize database connection for Vercel
 */
async function initializeDatabase() {
    try {
        await database.connect();
        console.log('📦 Database initialized for Vercel');
    } catch (error) {
        console.log('📦 Database initialization failed, using fallback storage');
    }
}

// Initialize database when the module loads (for Vercel)
initializeDatabase();

// For local development, start the server
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    async function startServer() {
        try {
            // Start the Express server
            app.listen(PORT, () => {
                console.log(`🧠 Scaler-FunnelMind Server running on http://localhost:${PORT}`);
                console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
                console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
                
                // Log configuration status
                console.log(`🤖 OpenAI API: ${OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured (using fallbacks)'}`);
                
                // Show Gmail service status
                const emailStatus = emailService.getStatus();
                console.log(`📧 Gmail Service: ${emailStatus.configured ? '✅ Configured' : '❌ Not configured (using mock service)'}`);
                if (!emailStatus.configured) {
                    console.log('   💡 Add GMAIL_USER and GMAIL_APP_PASSWORD to .env for real emails');
                }
                
                // Show MongoDB status
                const dbStatus = database.getConnectionStatus();
                console.log(`📦 MongoDB: ${dbStatus.connected ? '✅ Connected' : '❌ Not connected'}`);
                if (!dbStatus.connected) {
                    console.log('   💡 Add MONGODB_URI to .env for persistent data storage');
                }
            });
            
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('👋 Server shutting down gracefully...');
        await database.disconnect();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('👋 Server shutting down gracefully...');
        await database.disconnect();
        process.exit(0);
    });

    // Start the server for local development
    startServer();
}

module.exports = app;
