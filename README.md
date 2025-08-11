# 🧠 Scaler-FunnelMind

An intelligent AI-driven lead conversion system that transforms blog readers into consultation bookings for Scaler's edtech courses through smart personalization and behavioral analysis.

## 🎯 Overview

This project demonstrates an advanced lead conversion funnel with AI integration across multiple touchpoints:

- **Smart Landing Page** with personalized CTAs and dynamic content
- **AI Career Assessment Chatbot** for lead qualification and course recommendations
- **Intelligent Email Automation** with personalized 5-email sequence
- **Real-time Analytics Dashboard** for conversion tracking
- **MongoDB Integration** with fallback to in-memory storage
- **Gmail Email Service** with mock fallback for development

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- MongoDB (optional - system works with in-memory fallback)
- OpenAI API key (optional - has intelligent fallbacks)
- Gmail credentials (optional - uses mock service)

### Installation

1. **Clone and Setup**

   ```bash
   cd scaler-funnelmind
   npm install
   ```

2. **Configure Environment** (Optional)

   Create `.env` file in project root:

   ```bash
   # OpenAI API Configuration (Optional)
   OPENAI_API_KEY=your_openai_api_key_here

   # Gmail Service Configuration (Optional)
   GMAIL_USER=your_gmail_address@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password

   # MongoDB Configuration (Optional)
   MONGODB_URI=mongodb://localhost:27017/scaler-funnelmind

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

3. **Start the Server**

   ```bash
   npm start
   ```

4. **Visit the Application**
   - Main Funnel: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Health Check: http://localhost:3000/health

## 🏗️ Architecture

### Frontend Structure

- **Landing Page** (`index.html`)

  - Hero section with AI-generated CTAs
  - Dynamic course recommendations based on behavior
  - Smart popups with exit-intent detection
  - Success stories and social proof sections
  - Responsive design with modern animations

- **AI Engine** (`scripts/ai-engine.js`)

  - User behavior tracking and analysis
  - Personalized content generation via OpenAI API
  - Smart popup timing optimization
  - Lead scoring and qualification
  - Fallback responses when AI is unavailable

- **Core Application** (`scripts/script.js`)
  - Assessment flow management (5-step process)
  - Form handling and validation
  - Analytics event tracking
  - UI interactions and animations
  - Exit-intent detection and popup management

### Backend Services

- **Express Server** (`server.js`)

  - OpenAI API integration with intelligent fallbacks
  - Lead management and MongoDB storage
  - Email automation triggers (5-email sequence)
  - Real-time analytics data collection
  - Admin dashboard endpoints

- **Database Layer** (`config/database.js`, `models/`)

  - MongoDB integration with connection management
  - Lead and Analytics models with proper indexing
  - Fallback to in-memory storage when MongoDB unavailable
  - Real-time connection status monitoring

- **Email Service** (`services/gmail-service.js`)
  - Gmail SMTP integration using Nodemailer
  - HTML email templates with personalization
  - Mock email service for development
  - Email sequence management

### Data Configuration

- **Email Templates** (`data/email-templates.json`)

  - 5-email sequence templates with personalization
  - Welcome, assessment results, success stories, course deep-dive, social proof, and final CTA
  - Template variables for dynamic content

- **Analytics Configuration** (`data/analytics-config.json`)
  - Event tracking definitions
  - Conversion funnel stages
  - User segmentation rules
  - Performance metrics

## 🎯 Key Features

### 🤖 AI-Powered Personalization

1. **Dynamic Content Generation**

   - Personalized CTAs based on user behavior analysis
   - Course recommendations using AI assessment
   - Customized email content for each lead profile

2. **Smart User Behavior Analysis**

   - Scroll depth and time-on-page tracking
   - Engagement level classification
   - Exit-intent detection with optimal timing
   - Return visitor recognition

3. **Intelligent Assessment Flow**
   - 5-question career assessment with AI analysis
   - Real-time course recommendations
   - Lead qualification scoring
   - Personalized learning roadmaps

### 📧 Email Automation Sequence

Automated 5-email sequence triggered by assessment completion:

1. **Welcome + Assessment Results** (Immediate)

   - Personalized course recommendations
   - 12-month learning roadmap
   - Success story from peer group

2. **Success Stories** (24 hours)

   - Real transformation stories
   - Salary increase examples
   - Social proof and motivation

3. **Course Deep-dive** (3 days)

   - Detailed project breakdowns
   - What students actually build
   - Portfolio development insights

4. **Social Proof + Urgency** (5 days)

   - Limited seat availability
   - Recent success stories
   - Special pricing offers

5. **Final Call-to-Action** (7 days)
   - Cost of waiting analysis
   - Special action-taker bonuses
   - Final consultation booking CTA

### 📊 Analytics Dashboard

Real-time metrics tracking:

- Page views and engagement metrics
- Assessment funnel performance
- Lead capture and conversion rates
- AI usage and performance statistics
- Email automation effectiveness

## 🛠️ Technical Implementation

### Dependencies

```json
{
  "axios": "^1.11.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.1",
  "express": "^5.1.0",
  "mongoose": "^8.17.1",
  "nodemailer": "^7.0.5",
  "resend": "^6.0.1"
}
```

### API Endpoints

| Endpoint               | Method | Description              |
| ---------------------- | ------ | ------------------------ |
| `/api/ai`              | POST   | AI content generation    |
| `/api/leads`           | POST   | Lead capture and storage |
| `/api/email/trigger`   | POST   | Email automation trigger |
| `/api/analytics`       | GET    | Analytics dashboard data |
| `/api/analytics/track` | POST   | Event tracking           |
| `/admin`               | GET    | Admin dashboard          |
| `/health`              | GET    | System health check      |

### Database Models

**Lead Model** (`models/Lead.js`):

- Lead ID, name, email, phone
- Assessment answers and status
- Source tracking and timestamps
- Indexed for performance

**Analytics Model** (`models/Analytics.js`):

- Global analytics singleton
- Page views, assessment metrics
- Conversion rate calculations
- Real-time updates

## 📈 Performance Features

### Smart Fallbacks

- **AI Fallbacks**: Intelligent responses when OpenAI is unavailable
- **Database Fallbacks**: In-memory storage when MongoDB is disconnected
- **Email Fallbacks**: Mock service for development and testing
- **Graceful Degradation**: System continues functioning without external dependencies

### Real-time Features

- **Live Analytics**: Real-time conversion tracking
- **Dynamic Content**: AI-powered personalization
- **Smart Popups**: Behavior-based timing optimization
- **Email Automation**: Immediate and scheduled sequences

## 🎬 Demo Scenarios

### Scenario A: New Blog Reader Journey

1. Lands on page from blog article
2. AI analyzes behavior (time, scroll depth, interactions)
3. Personalized content appears based on engagement level
4. Smart popup triggers at optimal timing
5. Completes 5-question assessment
6. Receives AI-generated course recommendations
7. Enters automated email sequence for nurturing

### Scenario B: Returning Visitor Experience

1. AI recognizes return visit and adjusts content
2. Shows different recommendations based on previous behavior
3. Accelerated assessment flow for engaged users
4. Immediate consultation booking for high-intent visitors

### Scenario C: High-Engagement User Flow

1. Deep page engagement triggers immediate assessment CTA
2. Fast-tracked through qualification process
3. Real-time course recommendations
4. Immediate welcome email with personalized roadmap

## 🔧 Development

### Project Structure

```
scaler-funnelmind/
├── index.html              # Main landing page
├── server.js               # Express backend server
├── package.json            # Dependencies and scripts
├── config/
│   └── database.js         # MongoDB connection management
├── models/
│   ├── Lead.js            # Lead data model
│   └── Analytics.js       # Analytics data model
├── services/
│   └── gmail-service.js   # Email service integration
├── scripts/
│   ├── ai-engine.js       # AI integration logic
│   └── script.js          # Core application logic
├── styles/
│   └── style.css          # Main stylesheet
├── data/
│   ├── email-templates.json    # Email sequence templates
│   └── analytics-config.json   # Analytics configuration
└── temp/                  # Documentation and guides
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

### Environment Variables

```bash
# Required for full functionality
OPENAI_API_KEY=your_openai_key
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
MONGODB_URI=your_mongodb_connection_string

# Optional
PORT=3000
NODE_ENV=development
```

## 🚀 Deployment

### Quick Deploy to Vercel

**Option 1: Using Deployment Script (Recommended)**

```bash
# Windows
deploy.bat

# Mac/Linux
./deploy.sh
```

**Option 2: Manual Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel
```

### Environment Variables Setup

Configure these in Vercel dashboard:

```bash
# OpenAI API (Optional but recommended)
OPENAI_API_KEY=your_openai_api_key_here

# Gmail Service (Optional)
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# MongoDB (Optional - will use in-memory fallback)
MONGODB_URI=your_mongodb_atlas_connection_string

# Server Configuration
NODE_ENV=production
PORT=3000
```

### Other Deployment Options

- **Heroku**: `git push heroku main`
- **AWS/GCP**: Use provided Docker configuration
- **Railway**: Connect GitHub repository

### Database Setup

- MongoDB Atlas for cloud deployment
- Proper indexing for performance
- Backup and recovery configuration

### Scaling Considerations

- **Database**: MongoDB Atlas for cloud scaling
- **Caching**: Redis for AI response caching
- **Load Balancing**: Multiple server instances
- **CDN**: Static asset delivery optimization
- **Monitoring**: Comprehensive error tracking

## 🔒 Security Features

- API rate limiting implemented
- Input validation on all endpoints
- Environment variable protection
- CORS configuration for production
- Data encryption for sensitive information
- Secure email authentication

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
- Refer to documentation in `/temp` directory

---

**Built with ❤️ for Scaler's AI APM Internship Program**

_Powered by FunnelMind: Where AI meets intelligent conversion optimization._
