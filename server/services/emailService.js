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

    selected_for_employer: (data) => ({
        subject: `🎉 Congratulations! You've Been Selected for Final Interview - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">🎉 Outstanding Achievement!</h2>
                
                <p>Dear ${data.candidate.firstName},</p>
                
                <p>Congratulations! You have successfully completed all automated screening stages and 
                have been <strong>selected for the final interview</strong> with the employer for the 
                <strong>${data.job.title}</strong> position at <strong>${data.job.companyName}</strong>.</p>
                
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                    <h3 style="margin-top: 0; color: #059669;">Your Complete Screening Results</h3>
                    <p>✅ <strong>Resume Analysis:</strong> ${data.aiMatchScore}%</p>
                    <p>✅ <strong>Skills Assessment:</strong> ${data.quizScore}%</p>
                    <p>✅ <strong>Video Interview:</strong> ${data.videoAnalysisReport?.overallScore || 'N/A'}%</p>
                    <p>🎯 <strong>Overall Score:</strong> ${data.overallScore}%</p>
                </div>
                
                <h3>What Happens Next?</h3>
                <p>The employer will be notified of your selection and will contact you shortly to 
                schedule the final interview. This interview will be conducted directly by the hiring team.</p>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0;">📧 You will receive an email from the employer within 2-3 business days</h4>
                    <p style="margin-bottom: 0;">They will provide you with:</p>
                    <ul style="margin: 10px 0 0 0;">
                        <li>Interview scheduling details</li>
                        <li>Contact information</li>
                        <li>Any specific preparation requirements</li>
                    </ul>
                </div>
                
                <p><strong>Important:</strong> Please check your email regularly and respond promptly 
                to the employer's scheduling request.</p>
                
                <p>This is a significant achievement - you've successfully navigated our comprehensive 
                screening process and demonstrated the skills and qualities the employer is looking for!</p>
                
                <p>Best of luck with your final interview!<br>The IntelliVibe Team</p>
            </div>
        `
    }),

    employer_interview_scheduled: (data) => ({
        subject: `📅 Employer Interview Scheduled - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Interview Scheduled Successfully!</h2>
                
                <p>Dear ${data.candidate.firstName},</p>
                
                <p>Great news! Your interview with <strong>${data.job.companyName}</strong> for the 
                <strong>${data.job.title}</strong> position has been scheduled.</p>
                
                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Interview Details</h3>
                    <p><strong>Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${data.scheduledTime}</p>
                    <p><strong>Type:</strong> ${data.interviewType}</p>
                    ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
                    ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
                    <p><strong>Contact Person:</strong> ${data.employerContact.name}</p>
                    <p><strong>Contact Email:</strong> ${data.employerContact.email}</p>
                    ${data.employerContact.phone ? `<p><strong>Contact Phone:</strong> ${data.employerContact.phone}</p>` : ''}
                </div>
                
                <h3>Preparation Tips</h3>
                <ul>
                    <li>Research the company thoroughly</li>
                    <li>Review the job description and your application</li>
                    <li>Prepare questions to ask the interviewer</li>
                    <li>Dress professionally</li>
                    <li>Test your technology if it's a video interview</li>
                    <li>Arrive early or join the meeting 5 minutes before</li>
                </ul>
                
                <p><strong>Good luck with your interview!</strong></p>
                
                <p>Best regards,<br>The IntelliVibe Team</p>
            </div>
        `
    }),

    hired: (data) => ({
        subject: `🎊 Congratulations! You've Been Hired - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">🎊 Welcome to the Team!</h2>
                
                <p>Dear ${data.candidate.firstName},</p>
                
                <p>Congratulations! We are thrilled to inform you that you have been <strong>successfully hired</strong> 
                for the <strong>${data.job.title}</strong> position at <strong>${data.job.companyName}</strong>!</p>
                
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                    <h3 style="margin-top: 0; color: #059669;">Your Journey with Us</h3>
                    <p>✅ Resume Screening</p>
                    <p>✅ Skills Assessment</p>
                    <p>✅ AI Video Interview</p>
                    <p>✅ Employer Interview</p>
                    <p>🎯 <strong>Final Result: HIRED!</strong></p>
                </div>
                
                <p>The employer will contact you shortly with:</p>
                <ul>
                    <li>Official offer letter</li>
                    <li>Onboarding details</li>
                    <li>Start date and schedule</li>
                    <li>Any additional paperwork required</li>
                </ul>
                
                <p>We're excited to have you join the team and look forward to seeing your contributions!</p>
                
                <p>Best regards,<br>The IntelliVibe Team</p>
            </div>
        `
    }),

    video_failed: (data) => ({
        subject: `Video Interview Results - ${data.job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Video Interview Results</h2>
                
                <p>Dear ${data.candidate.firstName},</p>
                
                <p>Thank you for completing the video interview for the <strong>${data.job.title}</strong> 
                position at <strong>${data.job.companyName}</strong>.</p>
                
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Interview Results</h3>
                    <p><strong>Your Score:</strong> ${data.score}%</p>
                    <p><strong>Feedback:</strong> ${data.feedback}</p>
                </div>
                
                <p>Unfortunately, your video interview score did not meet the requirements for this position. 
                We appreciate your interest and effort throughout the application process.</p>
                
                <p>We encourage you to continue developing your skills and apply for future opportunities.</p>
                
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
            console.error(`Email template '${template}' not found emailService.js`);
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

/**
 * Send email notification to employer
 */
exports.sendEmployerNotification = async (application, notificationType, additionalData = {}) => {
    try {
        // Populate necessary fields
        const populatedApp = await Application.findById(application._id)
            .populate('candidate', 'firstName lastName email')
            .populate('job', 'title companyName')
            .populate('job', 'postedBy', 'firstName lastName email');

        if (!populatedApp) {
            throw new Error('Application not found');
        }

        let subject, html;

        switch (notificationType) {
            case 'candidate_selected':
                subject = `🎯 Top Candidate Selected - ${populatedApp.job.title}`;
                html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #059669;">🎯 Excellent Candidate Selected!</h2>
                        
                        <p>Dear Hiring Manager,</p>
                        
                        <p>We're excited to inform you that we have identified a <strong>top candidate</strong> 
                        for the <strong>${populatedApp.job.title}</strong> position at <strong>${populatedApp.job.companyName}</strong>.</p>
                        
                        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Candidate Information</h3>
                            <p><strong>Name:</strong> ${populatedApp.candidate.firstName} ${populatedApp.candidate.lastName}</p>
                            <p><strong>Email:</strong> ${populatedApp.candidate.email}</p>
                            <p><strong>Application ID:</strong> ${populatedApp._id}</p>
                        </div>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Screening Results</h3>
                            <p>✅ <strong>Resume Analysis:</strong> ${populatedApp.aiMatchScore}%</p>
                            <p>✅ <strong>Skills Assessment:</strong> ${populatedApp.quizScore}%</p>
                            <p>✅ <strong>Video Interview:</strong> ${populatedApp.videoAnalysisReport?.overallScore || 'N/A'}%</p>
                            <p>🎯 <strong>Overall Score:</strong> ${populatedApp.overallScore}%</p>
                        </div>
                        
                        <h3>Next Steps</h3>
                        <p>This candidate has successfully completed all automated screening stages and 
                        is ready for your final interview. Please contact them within 2-3 business days 
                        to schedule the interview.</p>
                        
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0;">📧 Contact Information</h4>
                            <p><strong>Candidate Email:</strong> ${populatedApp.candidate.email}</p>
                            <p><strong>Application ID:</strong> ${populatedApp._id}</p>
                        </div>
                        
                        <p>You can view the complete application details in your employer dashboard.</p>
                        
                        <p>Best regards,<br>The IntelliVibe Team</p>
                    </div>
                `;
                break;

            case 'interview_scheduled':
                subject = `📅 Interview Scheduled - ${populatedApp.job.title}`;
                html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Interview Scheduled Successfully</h2>
                        
                        <p>Dear Hiring Manager,</p>
                        
                        <p>The interview with <strong>${populatedApp.candidate.firstName} ${populatedApp.candidate.lastName}</strong> 
                        for the <strong>${populatedApp.job.title}</strong> position has been scheduled.</p>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Interview Details</h3>
                            <p><strong>Date:</strong> ${new Date(additionalData.scheduledDate).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${additionalData.scheduledTime}</p>
                            <p><strong>Type:</strong> ${additionalData.interviewType}</p>
                            ${additionalData.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${additionalData.meetingLink}">${additionalData.meetingLink}</a></p>` : ''}
                            ${additionalData.location ? `<p><strong>Location:</strong> ${additionalData.location}</p>` : ''}
                        </div>
                        
                        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0;">Candidate Information</h4>
                            <p><strong>Name:</strong> ${populatedApp.candidate.firstName} ${populatedApp.candidate.lastName}</p>
                            <p><strong>Email:</strong> ${populatedApp.candidate.email}</p>
                            <p><strong>Application ID:</strong> ${populatedApp._id}</p>
                        </div>
                        
                        <p>Please ensure you have all necessary materials ready for the interview.</p>
                        
                        <p>Best regards,<br>The IntelliVibe Team</p>
                    </div>
                `;
                break;

            default:
                throw new Error(`Unknown notification type: ${notificationType}`);
        }

        // Send to employer (assuming the job poster is the employer)
        const employerEmail = populatedApp.job.postedBy?.email || process.env.ADMIN_EMAIL;
        
        await transporter.sendMail({
            from: `"IntelliVibe" <${process.env.EMAIL_USER}>`,
            to: employerEmail,
            subject: subject,
            html: html,
        });

        console.log(`Employer notification sent: ${notificationType} to ${employerEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending employer notification:', error);
        // Don't throw - email failure shouldn't break the application flow
        return false;
    }
};