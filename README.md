# 🧠 Scaler-FunnelMind

An intelligent AI-driven lead conversion system that transforms blog readers into consultation bookings for Scaler's edtech courses through smart personalization and behavioral analysis.

## 🎯 Overview

This project demonstrates an advanced lead conversion funnel with AI integration across multiple touchpoints:

- **Smart Landing Page** with personalized CTAs
- **AI Career Assessment Chatbot** for lead qualification
- **Intelligent Email Automation** with personalized content
- **Analytics Dashboard** for conversion tracking
- **Real-time AI Recommendations** based on user behavior

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- MongoDB (local installation or MongoDB Atlas account)
- OpenAI API key (optional - has fallbacks)
- Email service API key (optional - uses mock service)

### Installation

1. **Clone and Setup**

   ```bash
   cd scaler-funnelmind
   npm install
   ```

2. **Configure Environment** (Optional)

   - Copy `.env.example` to `.env`
   - Add your OpenAI API key for AI features
   - Add email service credentials for automation

3. **Start the Server**

   ```bash
   npm start
   ```

4. **Visit the Application**
   - Main Funnel: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Health Check: http://localhost:3000/health

## 🏗️ Architecture

### Frontend Components

- **Landing Page** (`index.html`)

  - Hero section with AI-generated CTAs
  - Course recommendations based on behavior
  - Smart popups with exit-intent detection
  - Success stories and social proof

- **AI Engine** (`scripts/ai-engine.js`)

  - User behavior tracking and analysis
  - Personalized content generation
  - Smart popup timing optimization
  - Lead scoring and qualification

- **Core Application** (`scripts/script.js`)
  - Assessment flow management
  - Form handling and validation
  - Analytics event tracking
  - UI interactions and animations

### Backend Services

- **Express Server** (`server.js`)
  - AI API integration (OpenAI/Claude)
  - Lead management and storage
  - Email automation triggers
  - Analytics data collection

### Key Features

#### 🎯 AI-Powered Personalization

1. **Dynamic Content Generation**

   - Personalized CTAs based on user behavior
   - Course recommendations using AI analysis
   - Customized email content for each lead

2. **Smart User Behavior Analysis**

   - Scroll depth and time-on-page tracking
   - Engagement level classification
   - Exit-intent detection with timing optimization

3. **Intelligent Assessment Flow**
   - 5-question career assessment
   - AI-generated course recommendations
   - Lead qualification scoring

#### 📧 Email Automation Sequence

Automated 5-email sequence triggered by assessment completion:

1. **Welcome + Assessment Results** (Immediate)
2. **Success Stories** (24 hours)
3. **Course Deep-dive** (3 days)
4. **Social Proof + Urgency** (5 days)
5. **Final Call-to-Action** (7 days)

#### 📊 Analytics Dashboard

Real-time metrics tracking:

- Page views and engagement
- Assessment funnel performance
- Lead capture and conversion rates
- Source attribution and behavior analysis

## 🛠️ Configuration

### AI Integration

The system supports multiple AI providers:

```javascript
// OpenAI Configuration (Primary)
OPENAI_API_KEY = your_openai_key;

// Alternative Options
ANTHROPIC_API_KEY = your_claude_key;
GOOGLE_AI_API_KEY = your_gemini_key;
```

### Email Automation

Supports various email services:

```javascript
// Email Service Options
EMAIL_SERVICE = sendgrid | mailchimp | convertkit;
EMAIL_API_KEY = your_email_api_key;
```

### Analytics

Integrates with popular analytics platforms:

```javascript
// Analytics Configuration
GOOGLE_ANALYTICS_ID = your_ga4_id;
HOTJAR_ID = your_hotjar_id;
```

## 📈 Performance Metrics

### Expected Improvements

Based on industry benchmarks and AI optimization:

| Metric                  | Baseline | AI-Enhanced | Improvement |
| ----------------------- | -------- | ----------- | ----------- |
| Blog-to-Lead Conversion | 2-3%     | 8-12%       | 300%+       |
| Assessment Completion   | 40%      | 65%+        | 60%+        |
| Assessment-to-Booking   | 15%      | 25%+        | 65%+        |
| Email Open Rates        | 22%      | 35%+        | 60%+        |

### Real-time Analytics

Access the admin dashboard at `/admin` to view:

- Live conversion funnel metrics
- Lead capture and qualification data
- AI performance and usage statistics
- Email automation effectiveness

## 🎬 Demo Scenarios

### Scenario A: New Blog Reader

1. Lands on page from blog article
2. AI analyzes behavior (time, scroll depth)
3. Personalized content appears based on engagement
4. Smart popup triggers at optimal timing
5. Completes assessment and receives recommendations
6. Enters email sequence for nurturing

### Scenario B: Returning Visitor

1. AI recognizes return visit and adjusts content
2. Shows different recommendations based on previous behavior
3. Accelerated assessment flow for engaged users
4. Immediate consultation booking for high-intent visitors

### Scenario C: High-Engagement User

1. Deep page engagement triggers immediate assessment CTA
2. Fast-tracked through qualification process
3. Real-time calendar integration for booking
4. Immediate welcome email with next steps

## 🔧 Development

### Project Structure

```
scaler-funnelmind/
├── index.html              # Main landing page
├── server.js               # Express backend server
├── package.json            # Dependencies and scripts
├── components/             # React components (future)
├── styles/
│   └── style.css          # Main stylesheet
├── scripts/
│   ├── ai-engine.js       # AI integration logic
│   └── script.js          # Core application logic
└── data/                  # Mock data and configs
```

### Running in Development

```bash
# Install dependencies
npm install

# Start with auto-reload
npm run dev

# Run production build
npm start
```

### API Endpoints

| Endpoint               | Method | Description              |
| ---------------------- | ------ | ------------------------ |
| `/api/ai`              | POST   | AI content generation    |
| `/api/leads`           | POST   | Lead capture and storage |
| `/api/email/trigger`   | POST   | Email automation trigger |
| `/api/analytics`       | GET    | Analytics dashboard data |
| `/api/analytics/track` | POST   | Event tracking           |

## 🚀 Deployment

### Production Setup

1. **Environment Variables**

   ```bash
   NODE_ENV=production
   OPENAI_API_KEY=your_production_key
   DATABASE_URL=your_database_connection
   ```

2. **Platform Deployment**

   - Vercel: `vercel deploy`
   - Heroku: `git push heroku main`
   - AWS/GCP: Use provided Docker configuration

3. **Database Integration**
   - Replace in-memory storage with PostgreSQL/MongoDB
   - Set up proper data persistence
   - Configure backup and recovery

### Scaling Considerations

- **Database**: Move from in-memory to persistent storage
- **Caching**: Implement Redis for AI response caching
- **Load Balancing**: Use multiple server instances
- **CDN**: Serve static assets via CDN
- **Monitoring**: Add comprehensive error tracking

## 🔒 Security

- API rate limiting implemented
- Input validation on all endpoints
- Environment variable protection
- CORS configuration for production
- Data encryption for sensitive information

## 📚 Future Enhancements

### Phase 2 Features (2-week roadmap)

1. **Advanced AI Features**

   - Voice-based assessment using speech recognition
   - Image-based career path visualization
   - Predictive analytics for lead scoring

2. **Integration Expansions**

   - CRM integration (Salesforce, HubSpot)
   - Advanced email platforms (Klaviyo, Segment)
   - Video conferencing API (Zoom, Calendly)

3. **User Experience**

   - Progressive Web App (PWA) capabilities
   - Mobile app development
   - Multi-language support

4. **Analytics & Optimization**
   - A/B testing framework
   - Heat mapping and user session recordings
   - Advanced cohort analysis

## 🤝 Contributing

This project demonstrates advanced AI integration in lead conversion funnels. The codebase is designed for educational purposes and production scaling.

## 📞 Support

For questions about implementation or scaling this solution:

- Review the `/admin` dashboard for insights
- Check `/health` endpoint for system status
- Examine console logs for AI processing details

---

**Built with ❤️ for Scaler's AI APM Internship Program**

_Powered by FunnelMind: Where AI meets intelligent conversion optimization._
