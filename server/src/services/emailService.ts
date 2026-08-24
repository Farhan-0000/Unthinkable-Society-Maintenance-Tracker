import { Resend } from 'resend';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

// Dummy sender, ideally configured in .env
const FROM_EMAIL = 'onboarding@resend.dev'; // Resend's testing email domain

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export const emailService = {
  /**
   * Internal method to actually send email and log it
   */
  async sendEmail(params: SendEmailParams, existingLogId?: string) {
    const toArray = Array.isArray(params.to) ? params.to : [params.to];
    
    // Create log if it doesn't exist
    let logId = existingLogId;
    if (!logId) {
      const log = await prisma.emailLog.create({
        data: {
          to: toArray.join(', '),
          subject: params.subject,
          body: params.html,
          status: 'PENDING',
        }
      });
      logId = log.id;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: `Society Tracker <${FROM_EMAIL}>`,
        to: toArray,
        subject: params.subject,
        html: params.html,
      });

      if (error) {
        throw new Error(error.message);
      }

      await prisma.emailLog.update({
        where: { id: logId },
        data: { status: 'SENT', error: null }
      });
      
      return data;
    } catch (error: any) {
      console.error('Email sending failed:', error);
      await prisma.emailLog.update({
        where: { id: logId },
        data: { 
          status: 'FAILED', 
          error: error.message || 'Unknown error',
          retryCount: { increment: existingLogId ? 1 : 0 }
        }
      });
      return false; // Return false so callers don't crash, but it is logged
    }
  },

  /**
   * Retry a failed email by log ID
   */
  async retryFailedEmail(logId: string) {
    const log = await prisma.emailLog.findUnique({ where: { id: logId } });
    if (!log) throw new Error('Email log not found');
    
    // Convert back to array (comma separated)
    const toArray = log.to.split(',').map(e => e.trim());
    
    return this.sendEmail({
      to: toArray,
      subject: log.subject,
      html: log.body
    }, log.id);
  },

  /**
   * Send notification for Complaint Status/Priority change
   */
  async sendComplaintUpdateNotification(
    residentEmail: string, 
    residentName: string,
    complaintId: string, 
    category: string, 
    status: string,
    priority: string
  ) {
    const subject = `Update on your complaint: ${category}`;
    
    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Complaint Update</h2>
        <p>Hello ${residentName},</p>
        <p>There has been an update to your recent complaint regarding <strong>${category}</strong>.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
          <p style="margin: 5px 0;"><strong>Priority:</strong> ${priority}</p>
        </div>
        
        <p>You can view the full details on your Resident Dashboard.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">This is an automated message from your Society Maintenance Tracker.</p>
      </div>
    `;

    return this.sendEmail({ to: residentEmail, subject, html });
  },

  /**
   * Broadcast Important Notice to all residents
   */
  async broadcastImportantNotice(title: string, content: string) {
    // 1. Fetch all resident emails
    const residents = await prisma.user.findMany({
      where: { role: 'RESIDENT' },
      select: { email: true }
    });

    if (residents.length === 0) return;

    // Resend allows up to 50 recipients per batch, but for simplicity in this setup
    // and given "testing" restrictions, we might just loop or send in small chunks.
    // However, sending individually creates better logs per user.
    
    const subject = `🚨 IMPORTANT NOTICE: ${title}`;
    const formattedContent = content.replace(/\n/g, '<br/>'); // basic rich text mapping
    
    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; border-top: 4px solid #8b5cf6;">
        <h2 style="color: #8b5cf6;">Important Society Announcement</h2>
        <h3 style="margin-top: 0;">${title}</h3>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; color: #333; line-height: 1.6;">
          ${formattedContent}
        </div>
        
        <p>Please check the Notice Board on your dashboard for more information.</p>
      </div>
    `;

    // For production with thousands of users, use Resend Batch API. 
    // Here we'll map through them (or just pass the array if < 50).
    const emails = residents.map(r => r.email);
    
    // We will send one bulk email for the sake of the log viewer simplicity, 
    // but in real life we'd batch.
    return this.sendEmail({ to: emails, subject, html });
  }
};
