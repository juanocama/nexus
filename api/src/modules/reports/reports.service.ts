import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private mailerService: MailerService,
  ) {}

  async create(userId: string, dto: CreateReportDto): Promise<{ report: Report; emailSent: boolean }> {
    const report = this.reportsRepository.create({
      ...dto,
      device_info: dto.device_info || null,
      app_version: dto.app_version || null,
      user: { id: userId },
      user_id: userId,
    });

    const savedReport = await this.reportsRepository.save(report);
    const emailSent = await this.sendReportEmail(userId, savedReport);

    return {
      report: savedReport,
      emailSent,
    };
  }

  async findAll(): Promise<Report[]> {
    return this.reportsRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  private async sendReportEmail(userId: string, report: Report): Promise<boolean> {
    const to = process.env.SUPPORT_EMAIL;

    if (!to) {
      this.logger.warn('SUPPORT_EMAIL is not configured. Report email was skipped.');
      return false;
    }

    const fields = [
      ['Report ID', report.id],
      ['User ID', userId],
      ['Type', report.type],
      ['Title', report.title],
      ['Description', report.description],
      ['Device info', report.device_info || 'Not provided'],
      ['App version', report.app_version || 'Not provided'],
      ['Status', report.status],
      ['Created at', report.created_at.toISOString()],
    ];

    const text = fields.map(([label, value]) => `${label}: ${value}`).join('\n');
    const rows = fields
      .map(([label, value]) => `
        <tr>
          <th style="text-align:left;padding:10px;border:1px solid #e2e8f0;background:#f8fafc;">${this.escapeHtml(label)}</th>
          <td style="padding:10px;border:1px solid #e2e8f0;">${this.escapeHtml(value)}</td>
        </tr>
      `)
      .join('');

    try {
      await this.mailerService.sendMail({
        to,
        subject: `[NEXUS Report] ${report.type.toUpperCase()}: ${report.title}`,
        text,
        html: `
          <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
            <h2 style="margin:0 0 16px;">Nuevo reporte NEXUS</h2>
            <table style="border-collapse:collapse;width:100%;max-width:720px;">
              <tbody>${rows}</tbody>
            </table>
          </div>
        `,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to send report email', error instanceof Error ? error.stack : String(error));
      return false;
    }
  }

  private escapeHtml(value: string): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
