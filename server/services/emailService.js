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

/**
 * Send application-related emails
 */
exports.sendApplicationEmail = async (application, template, additionalData = {}) => {
    try {
        // Populate necessary fields
        const populatedApp = await Application.findById(application._id)
            .populate('candidate', 'firstName lastName email')
            .populate('job', 'title companyName');

        const emailTemplates = {
            quiz_invitation: {
                subject: `Skills Assessment Invitation - ${populatedApp.job.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Congratulations ${populatedApp.candidate.firstName}!</h2>
                        
                        <p>Great news! Your application for <strong>${populatedApp.job.title}</strong> at 
                        <strong>${populatedApp.job.companyName}</strong> has passed the initial screening.</p>
                        
                        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Your Resume Match Score: ${application.aiMatchScore}%</h3>
                            <p style="margin-bottom: 0;">${application.aiJustification}</p>
                        </div>
                        
                        <h3>Next Step: Skills Assessment Quiz</h3>
                        <p>You're invited to complete a technical skills assessment. Here are the details:</p>
                        
                        <ul style="line-height: 1.8;">
                            <li><strong>Number of Questions:</strong> ${additionalData.numberOfQuestions || 10}</li>
                            <li><strong>Time Limit:</strong> ${additionalData.timeLimit || 30} minutes</li>
                            <li><strong>Passing Score:</strong> 70%</li>
                            <li><strong>Question Type:</strong> Multiple choice technical questions</li>
                        </ul>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Important:</strong> Once you start the quiz, you must complete it in one session. Make sure you have a stable internet connection and enough time.</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${additionalData.quizUrl || process.env.FRONTEND_URL + '/candidate/dashboard'}" 
                               style="background-color: #2196F3; color: white; padding: 14px 28px; 
                                      text-decoration: none; border-radius: 6px; display: inline-block;
                                      font-weight: bold;">
                                Take the Quiz
                            </a>
                        </div>
                        
                        <p><strong>Deadline:</strong> Please complete the quiz within 7 days.</p>
                        
                        <p>Best of luck!</p>
                        <p>The IntelliVibe Team</p>
                    </div>
                `,
            },
            
            resume_rejected: {
                subject: `Application Update - ${populatedApp.job.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Hello ${populatedApp.candidate.firstName},</h2>
                        
                        <p>Thank you for your interest in the <strong>${populatedApp.job.title}</strong> position at 
                        <strong>${populatedApp.job.companyName}</strong>.</p>
                        
                        <p>After careful review of your application, we've determined that your profile doesn't fully match 
                        our current requirements for this position.</p>
                        
                        <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Your Match Score: ${additionalData.score}%</h3>
                            <p>Required Score: ${additionalData.threshold}%</p>
                            <p style="margin-bottom: 0;"><strong>Feedback:</strong> ${additionalData.feedback}</p>
                        </div>
                        
                        <h3>How to Improve Your Chances:</h3>
                        <ul style="line-height: 1.8;">
                            <li>Review the job requirements and identify skill gaps</li>
                            <li>Gain hands-on experience with the required technologies</li>
                            <li>Update your resume to better highlight relevant experience</li>
                            <li>Consider taking online courses or certifications</li>
                        </ul>
                        
                        <p>We encourage you to apply for other positions that better match your current skill set and 
                        experience. Your profile will remain in our database for future opportunities.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/jobs" 
                               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                                      text-decoration: none; border-radius: 6px; display: inline-block;">
                                Browse Other Jobs
                            </a>
                        </div>
                        
                        <p>Thank you for considering us for your career journey.</p>
                        <p>Best regards,<br>The IntelliVibe Team</p>
                    </div>
                `,
            },
            
            quiz_failed: {
                subject: `Quiz Results - ${populatedApp.job.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Hello ${populatedApp.candidate.firstName},</h2>
                        
                        <p>Thank you for completing the skills assessment for the <strong>${populatedApp.job.title}</strong> 
                        position at <strong>${populatedApp.job.companyName}</strong>.</p>
                        
                        <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Quiz Results</h3>
                            <p>Your Score: <strong>${additionalData.score}%</strong></p>
                            <p>Passing Score: <strong>${additionalData.passingScore}%</strong></p>
                            <p style="margin-bottom: 0;">Unfortunately, you didn't meet the minimum score required to proceed to the next stage.</p>
                        </div>
                        
                        <h3>What This Means:</h3>
                        <p>While you showed promise in your resume, the technical assessment indicates that you may need 
                        to strengthen certain skills for this particular role.</p>
                        
                        <h3>Recommendations:</h3>
                        <ul style="line-height: 1.8;">
                            <li>Review the core technologies mentioned in the job description</li>
                            <li>Practice with online coding challenges and technical assessments</li>
                            <li>Build projects that demonstrate proficiency in the required skills</li>
                            <li>Consider applying for positions that better match your current skill level</li>
                        </ul>
                        
                        <p>Don't be discouraged! Many successful developers have faced similar challenges. Use this as a 
                        learning opportunity to identify areas for improvement.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/jobs" 
                               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                                      text-decoration: none; border-radius: 6px; display: inline-block;">
                                Explore Other Opportunities
                            </a>
                        </div>
                        
                        <p>We appreciate your interest and wish you the best in your job search.</p>
                        <p>Best regards,<br>The IntelliVibe Team</p>
                    </div>
                `,
            },
            
            video_invitation: {
                subject: `Video Interview Invitation - ${populatedApp.job.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Excellent Work, ${populatedApp.candidate.firstName}!</h2>
                        
                        <p>Congratulations on passing the skills assessment for the <strong>${populatedApp.job.title}</strong> 
                        position at <strong>${populatedApp.job.companyName}</strong>!</p>
                        
                        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Your Progress So Far:</h3>
                            <p>✅ Resume Score: ${application.aiMatchScore}%</p>
                            <p>✅ Quiz Score: ${application.quizScore}%</p>
                            <p style="margin-bottom: 0;">You're now in the top candidates for this position!</p>
                        </div>
                        
                        <h3>Final Step: Video Interview</h3>
                        <p>We'd like to get to know you better through a brief video interview. This will be an 
                        AI-powered interview where you'll answer questions about your experience and approach to work.</p>
                        
                        <ul style="line-height: 1.8;">
                            <li><strong>Format:</strong> Pre-recorded video responses</li>
                            <li><strong>Duration:</strong> Approximately 15-20 minutes</li>
                            <li><strong>Questions:</strong> 5-7 behavioral and technical questions</li>
                            <li><strong>Preparation:</strong> Have a quiet space and stable internet</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/candidate/video-interview/${application._id}" 
                               style="background-color: #4CAF50; color: white; padding: 14px 28px; 
                                      text-decoration: none; border-radius: 6px; display: inline-block;
                                      font-weight: bold;">
                                Start Video Interview
                            </a>
                        </div>
                        
                        <p><strong>Deadline:</strong> Please complete the video interview within 5 days.</p>
                        
                        <p>You're almost there! Best of luck with the final step.</p>
                        <p>The IntelliVibe Team</p>
                    </div>
                `,
            }
        };

        const emailTemplate = emailTemplates[template];
        if (!emailTemplate) {
            throw new Error(`Email template '${template}' not found`);
        }

        await transporter.sendMail({
            from: `"IntelliVibe" <${process.env.EMAIL_USER}>`,
            to: populatedApp.candidate.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        });

        console.log(`Email sent successfully: ${template} to ${populatedApp.candidate.email}`);
        
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw - email failure shouldn't break the application flow
    }
};