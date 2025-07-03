const Application = require('../models/Application');
const nodemailer = require('nodemailer');

// Configure email transporter (you'll need to set up your email service)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use SendGrid, AWS SES, etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Auto-qualification rules based on AI match score
 */
const QUALIFICATION_THRESHOLDS = {
    AUTO_SHORTLIST: 75,      // Automatically shortlist
    MANUAL_REVIEW: 50,       // Requires manual review
    AUTO_REJECT: 30,         // Below this, auto-reject
};

/**
 * Process application based on AI score
 */
exports.processApplicationScore = async (application) => {
    try {
        const score = application.aiMatchScore;
        
        if (score === null || score === undefined) {
            return { action: 'pending', reason: 'AI analysis pending' };
        }

        let action, newStatus, emailTemplate;

        if (score >= QUALIFICATION_THRESHOLDS.AUTO_SHORTLIST) {
            action = 'auto-shortlisted';
            newStatus = 'shortlisted';
            emailTemplate = 'shortlisted';
        } else if (score >= QUALIFICATION_THRESHOLDS.MANUAL_REVIEW) {
            action = 'manual-review';
            newStatus = 'reviewed';
            emailTemplate = null; // No automatic email for manual review
        } else if (score < QUALIFICATION_THRESHOLDS.AUTO_REJECT) {
            action = 'auto-rejected';
            newStatus = 'rejected';
            emailTemplate = 'rejected';
        } else {
            action = 'pending-review';
            newStatus = 'pending';
            emailTemplate = null;
        }

        // Update application status if it changed
        if (newStatus !== application.status) {
            application.status = newStatus;
            application.autoProcessed = true;
            application.autoProcessedAt = new Date();
            await application.save();
        }

        // Send email notification if applicable
        if (emailTemplate) {
            await this.sendApplicationEmail(application, emailTemplate);
        }

        return {
            action,
            newStatus,
            score,
            emailSent: !!emailTemplate,
        };
    } catch (error) {
        console.error('Error in auto-qualification:', error);
        throw error;
    }
};

/**
 * Send email notification to candidate
 */
exports.sendApplicationEmail = async (application, template) => {
    try {
        // Populate the necessary fields
        const populatedApp = await Application.findById(application._id)
            .populate('candidate', 'firstName lastName email')
            .populate('job', 'title companyName');

        const emailTemplates = {
            shortlisted: {
                subject: `Great news! You've been shortlisted for ${populatedApp.job.title}`,
                html: `
                    <h2>Congratulations ${populatedApp.candidate.firstName}!</h2>
                    <p>We're excited to inform you that your application for <strong>${populatedApp.job.title}</strong> 
                    at <strong>${populatedApp.job.companyName}</strong> has been shortlisted.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Your AI Match Score: ${application.aiMatchScore}%</h3>
                        <p><strong>What this means:</strong> ${application.aiJustification}</p>
                    </div>
                    
                    <h3>Next Steps:</h3>
                    <ul>
                        <li>You'll receive an invitation for a skills assessment quiz within 24-48 hours</li>
                        <li>Prepare by reviewing the job requirements</li>
                        <li>Check your candidate dashboard for updates</li>
                    </ul>
                    
                    <p>Best regards,<br>The IntelliVibe Team</p>
                `,
            },
            rejected: {
                subject: `Application Update: ${populatedApp.job.title}`,
                html: `
                    <h2>Hello ${populatedApp.candidate.firstName},</h2>
                    <p>Thank you for your interest in the <strong>${populatedApp.job.title}</strong> position 
                    at <strong>${populatedApp.job.companyName}</strong>.</p>
                    
                    <p>After careful review, we've decided to move forward with other candidates whose experience 
                    more closely matches our current needs.</p>
                    
                    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>AI Analysis Feedback:</h3>
                        <p>${application.aiJustification}</p>
                        <p><strong>Match Score:</strong> ${application.aiMatchScore}%</p>
                    </div>
                    
                    <h3>How to Improve Your Chances:</h3>
                    <ul>
                        <li>Review the job requirements and identify skill gaps</li>
                        <li>Update your resume with relevant keywords and experiences</li>
                        <li>Consider gaining experience in the required technologies</li>
                    </ul>
                    
                    <p>We encourage you to apply for future positions that match your skills and experience.</p>
                    
                    <p>Best regards,<br>The IntelliVibe Team</p>
                `,
            },
            quiz_invite: {
                subject: `Skills Assessment Invitation: ${populatedApp.job.title}`,
                html: `
                    <h2>Hello ${populatedApp.candidate.firstName},</h2>
                    <p>Congratulations on passing the initial screening for <strong>${populatedApp.job.title}</strong>!</p>
                    
                    <p>We'd like to invite you to complete a skills assessment quiz to better understand your technical abilities.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Quiz Details:</h3>
                        <ul>
                            <li><strong>Duration:</strong> 30 minutes</li>
                            <li><strong>Questions:</strong> 10 multiple-choice questions</li>
                            <li><strong>Topics:</strong> Based on the job requirements</li>
                            <li><strong>Deadline:</strong> 7 days from now</li>
                        </ul>
                    </div>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/candidate/quiz/${populatedApp._id}" 
                           style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px;">
                            Start Quiz
                        </a>
                    </p>
                    
                    <p>Best of luck!<br>The IntelliVibe Team</p>
                `,
            },
        };

        const template = emailTemplates[template];
        if (!template) {
            throw new Error(`Email template '${template}' not found`);
        }

        await transporter.sendMail({
            from: `"IntelliVibe" <${process.env.EMAIL_USER}>`,
            to: populatedApp.candidate.email,
            subject: template.subject,
            html: template.html,
        });

        console.log(`Email sent to ${populatedApp.candidate.email} for application ${application._id}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw - email failure shouldn't break the application process
    }
};

/**
 * Analyze skills gap between resume and job requirements
 */
exports.analyzeSkillsGap = (resumeSkills, jobSkills) => {
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase().trim());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase().trim());
    
    return {
        matched: jobSkillsLower.filter(skill => 
            resumeSkillsLower.some(rSkill => 
                rSkill.includes(skill) || skill.includes(rSkill)
            )
        ),
        missing: jobSkillsLower.filter(skill => 
            !resumeSkillsLower.some(rSkill => 
                rSkill.includes(skill) || skill.includes(rSkill)
            )
        ),
        additional: resumeSkillsLower.filter(skill => 
            !jobSkillsLower.some(jSkill => 
                skill.includes(jSkill) || jSkill.includes(skill)
            )
        ),
        matchPercentage: Math.round(
            (jobSkillsLower.filter(skill => 
                resumeSkillsLower.some(rSkill => 
                    rSkill.includes(skill) || skill.includes(rSkill)
                )
            ).length / jobSkillsLower.length) * 100
        ),
    };
};