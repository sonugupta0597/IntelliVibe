const nodemailer = require('nodemailer');
const Application = require('../models/Application');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Email templates
const emailTemplates = {
    quiz_invitation: (data) => ({
        subject: `Skills Assessment Invitation - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Congratulations! You've Advanced to the Next Stage</h2>
                
                <p>Dear ${data.candidate.firstName},</p>
                
                <p>Great news! Your application for <strong>${data.job.title}</strong> at 
                <strong>${data.job.companyName}</strong> has been reviewed, and you've been 
                selected to proceed to the skills assessment stage.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Resume Score: ${data.aiMatchScore}%</h3>
                    <p style="margin-bottom: 0;">${data.aiJustification}</p>
                </div>
                
                <h3>Next Step: Technical Skills Assessment</h3>
                <ul>
                    <li><strong>Number of Questions:</strong> ${data.numberOfQuestions || 10}</li>
                    <li><strong>Time Limit:</strong> ${data.timeLimit || 30} minutes</li>
                    <li><strong>Passing Score:</strong> 70%</li>
                    <li><strong>Format:</strong> Multiple choice technical questions</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.quizUrl}" style="background-color: #2563eb; color: white; 
                       padding: 12px 30px; text-decoration: none; border-radius: 6px; 
                       display: inline-block; font-weight: bold;">
                        Start Skills Assessment
                    </a>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                    <li>You have 7 days to complete the assessment</li>
                    <li>Once started, you must complete it in one session</li>
                    <li>Make sure you have a stable internet connection</li>
                    <li>The quiz will test your technical knowledge of the required skills</li>
                </ul>
                
                <p>Best of luck!</p>
                <p>The IntelliVibe Team</p>
            </div>
        `
    }),

    resume_rejected: (data) => ({
        subject: `Application Update - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Application Status Update</h2>
                
                <p>Dear ${data.candidate.firstName},</p>
                
                <p>Thank you for your interest in the <strong>${data.job.title}</strong> position 
                at <strong>${data.job.companyName}</strong>.</p>
                
                <p>After careful review of your application, we regret to inform you that we will not 
                be moving forward with your candidacy at this time.</p>
                
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #dc2626;">AI Analysis Results</h3>
                    <p><strong>Match Score:</strong> ${data.score}% (Minimum required: ${data.threshold}%)</p>
                    <p><strong>Feedback:</strong> ${data.feedback}</p>
                </div>
                
                <h3>How to Improve Your Chances:</h3>
                <ul>
                    <li>Focus on developing the required technical skills</li>
                    <li>Gain more hands-on experience with the technologies mentioned</li>
                    <li>Work on projects that demonstrate these skills</li>
                    <li>Consider certifications in the key technologies</li>
                </ul>
                
                <p>We encourage you to apply for future positions that better match your current 
                skill set and experience level.</p>
                
                <p>Thank you for considering us as a potential employer.</p>
                
                <p>Best regards,<br>The IntelliVibe Team</p>
            </div>
        `
    }),

    quiz_failed: (data) => ({
        subject: `Skills Assessment Results - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Skills Assessment Results</h2>
                
                <p>Dear ${data.candidate.firstName},</p>
                
                <p>Thank you for completing the skills assessment for the <strong>${data.job.title}</strong> 
                position at <strong>${data.job.companyName}</strong>.</p>
                
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Assessment Results</h3>
                    <p><strong>Your Score:</strong> ${data.score}%</p>
                    <p><strong>Passing Score:</strong> ${data.passingScore}%</p>
                </div>
                
                <p>Unfortunately, your score did not meet the minimum requirement for this position. 
                While this specific opportunity will not be moving forward, we were impressed by your 
                interest and effort.</p>
                
                <h3>Areas for Improvement:</h3>
                <p>Based on the assessment, we recommend strengthening your knowledge in the technical 
                areas covered by the quiz. Consider:</p>
                <ul>
                    <li>Online courses and tutorials</li>
                    <li>Hands-on practice with real projects</li>
                    <li>Contributing to open-source projects</li>
                    <li>Building a portfolio that demonstrates these skills</li>
                </ul>
                
                <p>We encourage you to continue developing your skills and apply for future opportunities 
                with us.</p>
                
                <p>Best regards,<br>The IntelliVibe Team</p>
            </div>
        `
    }),

    video_invitation: (data) => ({
        subject: `Video Interview Invitation - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Congratulations on Passing the Skills Assessment!</h2>
                
                <p>Dear ${data.candidate.firstName},</p>
                
                <p>Excellent work! You've successfully passed the technical assessment for the 
                <strong>${data.job.title}</strong> position at <strong>${data.job.companyName}</strong>.</p>
                
                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Progress So Far</h3>
                    <p>✅ Resume Review: ${data.aiMatchScore}%</p>
                    <p>✅ Skills Assessment: ${data.quizScore}%</p>
                    <p>📹 Next: Video Interview</p>
                </div>
                
                <h3>Final Stage: AI-Powered Video Interview</h3>
                <p>You're now invited to complete a video interview where you'll answer technical 
                and behavioral questions related to the position.</p>
                
                <ul>
                    <li><strong>Format:</strong> 5 technical questions</li>
                    <li><strong>Time per question:</strong> 2-3 minutes</li>
                    <li><strong>Total duration:</strong> Approximately 15-20 minutes</li>
                    <li><strong>Deadline:</strong> Please complete within 5 days</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/candidate/video-interview/${data._id}" 
                       style="background-color: #2563eb; color: white; padding: 12px 30px; 
                       text-decoration: none; border-radius: 6px; display: inline-block; 
                       font-weight: bold;">
                        Start Video Interview
                    </a>
                </div>
                
                <p><strong>Tips for Success:</strong></p>
                <ul>
                    <li>Find a quiet, well-lit space</li>
                    <li>Test your camera and microphone beforehand</li>
                    <li>Dress professionally</li>
                    <li>Have a stable internet connection</li>
                    <li>Be concise but thorough in your responses</li>
                </ul>
                
                <p>This is the final stage of our screening process. Give it your best!</p>
                
                <p>Best of luck,<br>The IntelliVibe Team</p>
            </div>
        `
    }),

    application_received: (data) => ({
        subject: `Application Received - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Thank You for Applying!</h2>
                <p>Dear ${data.candidate.firstName},</p>
                <p>We have received your application for the <strong>${data.job.title}</strong> position at <strong>${data.job.companyName}</strong>.</p>
                <p>Our team will review your application and get back to you soon. You can track your application status in your candidate dashboard.</p>
                <p>Best regards,<br>The IntelliVibe Team</p>
            </div>
        `
    }),

    status_updated: (data) => ({
        subject: `Application Status Updated - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Application Status Update</h2>
                <p>Dear ${data.candidate.firstName},</p>
                <p>Your application for the <strong>${data.job.title}</strong> position at <strong>${data.job.companyName}</strong> has been updated to: <strong>${data.status}</strong>.</p>
                <p>You can view more details in your candidate dashboard.</p>
                <p>Best regards,<br>The IntelliVibe Team</p>
            </div>
        `
    })
};

/**
 * Send email notification to candidate
 */
exports.sendApplicationEmail = async (application, template, additionalData = {}) => {
    try {
        // Populate necessary fields
        const populatedApp = await Application.findById(application._id)
            .populate('candidate', 'firstName lastName email')
            .populate('job', 'title companyName');

        if (!populatedApp) {
            console.error('Application not found for email sending:', application._id);
            return;
        }

        const templateFunction = emailTemplates[template];
        if (!templateFunction) {
            console.error(`Email template '${template}' not found`);
            return;
        }

        const emailData = {
            ...populatedApp.toObject(),
            ...additionalData
        };

        const emailContent = templateFunction(emailData);

        await transporter.sendMail({
            from: `"IntelliVibe" <${process.env.EMAIL_USER}>`,
            to: populatedApp.candidate.email,
            subject: emailContent.subject,
            html: emailContent.html,
        });

        console.log(`Email sent to ${populatedApp.candidate.email} for application ${application._id}`);
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Log specific authentication errors
        if (error.code === 'EAUTH') {
            console.error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS environment variables.');
            console.error('For Gmail, you may need to use an App Password instead of your regular password.');
        }
        
        // Don't throw - email failure shouldn't break the application process
        // But log it for debugging
        console.log(`Email sending failed for application ${application._id}, but application process continues.`);
    }
};