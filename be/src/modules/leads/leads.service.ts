import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { SettingsService } from '../settings/settings.service';

interface LeadData {
  fullName: string;
  address: string;
  phone: string;
  content: string;
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly mail: MailService,
    private readonly settings: SettingsService,
  ) {}

  async submit(data: LeadData): Promise<void> {
    const emails = await this.settings.getLeadRecipients();
    if (emails.length === 0) return;

    const subject = `[NUEDU] Đăng ký tư vấn — ${data.fullName}`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#00341c">Đăng ký tư vấn khóa học nghề PT Gym</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr>
            <td style="padding:10px 12px;background:#f7faf8;font-weight:600;width:140px;border:1px solid #e2e8e4">Họ tên</td>
            <td style="padding:10px 12px;border:1px solid #e2e8e4">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;background:#f7faf8;font-weight:600;border:1px solid #e2e8e4">Địa chỉ</td>
            <td style="padding:10px 12px;border:1px solid #e2e8e4">${data.address}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;background:#f7faf8;font-weight:600;border:1px solid #e2e8e4">Điện thoại</td>
            <td style="padding:10px 12px;border:1px solid #e2e8e4">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;background:#f7faf8;font-weight:600;border:1px solid #e2e8e4">Nội dung</td>
            <td style="padding:10px 12px;border:1px solid #e2e8e4">${data.content}</td>
          </tr>
        </table>
        <p style="margin-top:20px;color:#666;font-size:13px">Email này được gửi tự động từ hệ thống NUEDU.</p>
      </div>
    `;

    await this.mail.send(emails, subject, html);
  }
}
