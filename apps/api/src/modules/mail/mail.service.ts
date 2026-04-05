import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly brevoApiKey: string | undefined;
    private readonly fromEmail: string;
    private readonly fromName: string;
    private readonly adminUrl: string;

    constructor(private configService: ConfigService) {
        this.brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
        this.adminUrl = this.configService.get<string>(
            'ADMIN_URL',
            'http://localhost:5173',
        );

        const fromRaw = this.configService.get<string>(
            'MAIL_FROM',
            'GPS Tours <tuandatpcanh@gmail.com>',
        );
        const match = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
        if (match) {
            this.fromName = match[1].trim();
            this.fromEmail = match[2].trim();
        } else {
            this.fromName = 'GPS Tours';
            this.fromEmail = fromRaw.trim();
        }

        if (this.brevoApiKey) {
            this.logger.log('Brevo API configured — emails will be sent via Brevo');
        } else {
            this.logger.warn(
                'BREVO_API_KEY not configured — emails will be logged to console only',
            );
        }
    }

    async sendPasswordResetEmail(
        to: string,
        fullName: string,
        token: string,
    ): Promise<void> {
        const resetLink = `${this.adminUrl}/reset-password?token=${token}`;

        const subject = 'GPS Tours — Đặt lại mật khẩu';
        const html = this.buildResetEmailHtml(fullName, resetLink);

        if (this.brevoApiKey) {
            await this.sendViaBrevo({ to, subject, html });
        } else {
            this.logger.warn(
                `[DEV] Password reset email for ${to}:\n  Reset link: ${resetLink}\n  Token: ${token}`,
            );
        }
    }

    private async sendViaBrevo(params: {
        to: string;
        subject: string;
        html: string;
    }): Promise<void> {
        const { to, subject, html } = params;

        const body = {
            sender: { name: this.fromName, email: this.fromEmail },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': this.brevoApiKey!,
            },
            body: JSON.stringify({ body }),
        });

        if (!response.ok) {
            const error = await response.text();
            this.logger.error(
                `Brevo API error (${response.status}): ${error}`,
            );
            throw new Error(`Brevo API error: ${response.status}`);
        }

        this.logger.log(`Password reset email sent to ${to} via Brevo`);
    }

    private buildResetEmailHtml(fullName: string, resetLink: string): string {
        return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
  <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid #e2e8f0;">
    <h1 style="color: #0c4a6e; margin: 0; font-size: 24px;">GPS Tours</h1>
  </div>

  <div style="padding: 32px 0;">
    <p>Xin chào <strong>${fullName}</strong>,</p>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
    <p>Nhấn nút bên dưới để đặt lại mật khẩu. Liên kết có hiệu lực trong <strong>1 giờ</strong>.</p>

    <div style="text-align: center; padding: 24px 0;">
      <a href="${resetLink}"
         style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Đặt lại mật khẩu
      </a>
    </div>

    <p style="font-size: 14px; color: #64748b;">
      Nếu nút không hoạt động, sao chép và dán liên kết sau vào trình duyệt:<br/>
      <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
    </p>

    <p style="font-size: 14px; color: #64748b;">
      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
    </p>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
    <p>&copy; 2026 GPS Tours &amp; Phố Ẩm thực Vĩnh Khánh. All rights reserved.</p>
  </div>
</body>
</html>`;
    }
}
