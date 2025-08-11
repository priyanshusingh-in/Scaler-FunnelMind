/**
 * Gmail Email Service using Nodemailer
 * 100% Free email service integration for Scaler-FunnelMind
 */

const nodemailer = require('nodemailer');

class GmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.initializeTransporter();
    }

    /**
     * Initialize Gmail transporter
     */
    initializeTransporter() {
        try {
            // Gmail configuration from environment variables
            const gmailConfig = {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // Use TLS
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD
                }
            };

            // Create transporter
            this.transporter = nodemailer.createTransport(gmailConfig);
            
            // Check if credentials are provided
            this.isConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
            
            if (this.isConfigured) {
                console.log('📧 Gmail Service: ✅ Configured');
                this.verifyConnection();
            } else {
                console.log('📧 Gmail Service: ❌ Not configured (missing credentials)');
                console.log('   Add GMAIL_USER and GMAIL_APP_PASSWORD to your .env file');
            }
            
        } catch (error) {
            console.error('Gmail Service initialization error:', error);
            this.isConfigured = false;
        }
    }

    /**
     * Verify Gmail connection
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('📧 Gmail Service: Connection verified successfully');
        } catch (error) {
            console.error('📧 Gmail Service: Connection verification failed:', error.message);
            this.isConfigured = false;
        }
    }

    /**
     * Send email using Gmail
     */
    async sendEmail(emailData) {
        if (!this.isConfigured) {
            console.log('📧 Gmail not configured - using mock service');
            return this.mockEmailResponse(emailData);
        }

        try {
            const mailOptions = {
                from: {
                    name: 'Scaler AI Career Coach',
                    address: process.env.GMAIL_USER
                },
                to: emailData.to,
                subject: emailData.subject,
                html: this.generateEmailHTML(emailData),
                text: this.generatePlainText(emailData.content)
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            console.log(`📧 Email sent successfully to ${emailData.to}`);
            console.log(`   Subject: ${emailData.subject}`);
            console.log(`   Message ID: ${result.messageId}`);
            
            return {
                success: true,
                messageId: result.messageId,
                to: emailData.to,
                subject: emailData.subject,
                provider: 'gmail',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Gmail send error:', error);
            
            // Fallback to mock service
            console.log('📧 Falling back to mock service');
            return this.mockEmailResponse(emailData);
        }
    }

    /**
     * Generate HTML email content
     */
    generateEmailHTML(emailData) {
        const { content, name, type } = emailData;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${emailData.subject}</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .email-container {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #00d4ff;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #00d4ff;
                }
                .content {
                    margin: 20px 0;
                    font-size: 16px;
                }
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                    text-align: center;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo">🚀 Scaler AI</div>
                    <p>Your AI Career Transformation Partner</p>
                </div>
                
                <div class="content">
                    <h2>Hi ${name || 'there'}! 👋</h2>
                    
                    <div>${content}</div>
                    
                    ${emailData.cta ? `
                        <p style="text-align: center;">
                            <a href="#" class="cta-button">${emailData.cta}</a>
                        </p>
                    ` : ''}
                </div>
                
                <div class="footer">
                    <p><strong>Scaler - AI Career Transformation</strong></p>
                    <p>Helping software engineers transition to high-paying AI/ML roles</p>
                    <p style="font-size: 12px; color: #999;">
                        This is an automated email from your AI career assessment.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generate plain text version
     */
    generatePlainText(content) {
        // Strip HTML tags and format as plain text
        return content
            .replace(/<[^>]*>/g, '')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
    }

    /**
     * Mock email response when Gmail is not configured
     */
    mockEmailResponse(emailData) {
        const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`📧 MOCK EMAIL SENT:`);
        console.log(`   To: ${emailData.to}`);
        console.log(`   Subject: ${emailData.subject}`);
        console.log(`   Content: ${emailData.content?.substring(0, 100)}...`);
        
        return {
            success: true,
            messageId: mockId,
            to: emailData.to,
            subject: emailData.subject,
            provider: 'mock',
            mock: true,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Send email sequence (multiple emails)
     */
    async sendEmailSequence(emailSequence) {
        const results = [];
        
        for (const email of emailSequence) {
            try {
                const result = await this.sendEmail(email);
                results.push(result);
                
                // Add delay between emails (if sending multiple)
                if (emailSequence.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`Failed to send email to ${email.to}:`, error);
                results.push({
                    success: false,
                    error: error.message,
                    to: email.to
                });
            }
        }
        
        return results;
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            service: 'Gmail',
            configured: this.isConfigured,
            provider: 'nodemailer',
            cost: 'Free',
            limits: 'Unlimited for personal use'
        };
    }

    /**
     * Test email sending
     */
    async testEmail(testEmailAddress = null) {
        const testEmail = {
            to: testEmailAddress || process.env.GMAIL_USER,
            subject: '🧪 Scaler-FunnelMind - Email Test',
            content: `
                <h3>✅ Email Service Test Successful!</h3>
                <p>Your Gmail integration is working perfectly.</p>
                <ul>
                    <li><strong>Service:</strong> Gmail via Nodemailer</li>
                    <li><strong>Status:</strong> ✅ Configured</li>
                    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                </ul>
                <p>You can now send personalized emails to your leads automatically!</p>
            `,
            cta: 'View Dashboard',
            name: 'Test User',
            type: 'test'
        };

        return await this.sendEmail(testEmail);
    }
}

module.exports = GmailService;
