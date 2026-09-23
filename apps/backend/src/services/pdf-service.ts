import PDFDocument from 'pdfkit';
import type { EnhancedReport } from '../agents/reporter.js';

const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  text: '#1e293b',
  muted: '#94a3b8',
};

const LEVEL_COLORS: Record<string, string> = {
  L1: '#ef4444',
  L2: '#f59e0b',
  L3: '#eab308',
  L4: '#22c55e',
  L5: '#10b981',
};

export function generatePdf(report: EnhancedReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Agent Ready Report - ${report.meta.repo}`,
        Author: 'Agent Ready Scanner',
        Subject: 'Repository Agent Readiness Assessment',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    renderHeader(doc, report);

    // Executive Summary
    renderExecutiveSummary(doc, report);

    // Pillar Analysis
    doc.addPage();
    renderPillarAnalysis(doc, report);

    // Improvement Roadmap
    if (hasRoadmapItems(report)) {
      doc.addPage();
      renderRoadmap(doc, report);
    }

    // Footer on all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      renderFooter(doc, report, i + 1, pages.count);
    }

    doc.end();
  });
}

function renderHeader(doc: PDFKit.PDFDocument, report: EnhancedReport) {
  const { meta, executive_summary } = report;

  // Title
  doc.fontSize(28).fillColor(COLORS.primary).text('Agent Ready Report', { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(14).fillColor(COLORS.secondary).text(meta.repo, { align: 'center' });

  doc.moveDown(2);

  // Level badge
  const level = executive_summary.level || 'N/A';
  const levelColor = LEVEL_COLORS[level] || COLORS.muted;

  doc.roundedRect(doc.page.width / 2 - 60, doc.y, 120, 50, 8).fill(levelColor);

  doc
    .fontSize(24)
    .fillColor('white')
    .text(level, doc.page.width / 2 - 60, doc.y - 40, {
      width: 120,
      align: 'center',
    });

  doc.y += 20;
  doc.moveDown(1);

  // Score
  doc
    .fontSize(18)
    .fillColor(COLORS.text)
    .text(`Overall Score: ${executive_summary.score}%`, { align: 'center' });

  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .fillColor(COLORS.secondary)
    .text(executive_summary.headline, { align: 'center' });

  doc.moveDown(2);

  // Meta info
  doc.fontSize(10).fillColor(COLORS.muted);
  doc.text(`Commit: ${meta.commit.slice(0, 7)}`, { continued: true });
  doc.text(`  |  Scanned: ${new Date(meta.timestamp).toLocaleDateString()}`, { continued: true });
  doc.text(`  |  Duration: ${meta.scan_duration_ms}ms`);

  doc.moveDown(2);
}

function renderExecutiveSummary(doc: PDFKit.PDFDocument, report: EnhancedReport) {
  const { executive_summary } = report;

  doc.fontSize(16).fillColor(COLORS.primary).text('Executive Summary');
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(COLORS.primary);
  doc.moveDown(1);

  // Key Strengths
  if (executive_summary.key_strengths.length > 0) {
    doc.fontSize(12).fillColor(COLORS.success).text('Key Strengths');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor(COLORS.text);
    for (const strength of executive_summary.key_strengths.slice(0, 5)) {
      doc.text(`  + ${strength}`);
    }
    doc.moveDown(1);
  }

  // Critical Gaps
  if (executive_summary.critical_gaps.length > 0) {
    doc.fontSize(12).fillColor(COLORS.danger).text('Critical Gaps');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor(COLORS.text);
    for (const gap of executive_summary.critical_gaps.slice(0, 5)) {
      doc.text(`  - ${gap}`);
    }
    doc.moveDown(1);
  }

  // Next Steps
  if (executive_summary.next_steps.length > 0) {
    doc.fontSize(12).fillColor(COLORS.primary).text('Recommended Next Steps');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor(COLORS.text);
    for (const step of executive_summary.next_steps) {
      doc.text(`  ${step}`);
    }
  }
}

function renderPillarAnalysis(doc: PDFKit.PDFDocument, report: EnhancedReport) {
  const { detailed_analysis } = report;

  doc.fontSize(16).fillColor(COLORS.primary).text('9 Pillars Analysis');
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(COLORS.primary);
  doc.moveDown(1);

  const pillars = detailed_analysis.pillars;
  const tableTop = doc.y;
  const colWidths = [150, 80, 80, 100, 85];

  // Table header
  doc.fontSize(10).fillColor(COLORS.secondary);
  doc.text('Pillar', 50, tableTop, { width: colWidths[0] });
  doc.text('Level', 200, tableTop, { width: colWidths[1] });
  doc.text('Score', 280, tableTop, { width: colWidths[2] });
  doc.text('Checks', 360, tableTop, { width: colWidths[3] });
  doc.text('Status', 460, tableTop, { width: colWidths[4] });

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(COLORS.muted);
  doc.moveDown(0.5);

  // Table rows
  for (const pillar of pillars) {
    const y = doc.y;
    const levelColor = LEVEL_COLORS[pillar.level_achieved || ''] || COLORS.muted;
    const statusIcon = pillar.score >= 80 ? 'PASS' : pillar.score >= 50 ? 'WARN' : 'FAIL';
    const statusColor =
      pillar.score >= 80 ? COLORS.success : pillar.score >= 50 ? COLORS.warning : COLORS.danger;

    doc.fontSize(10).fillColor(COLORS.text);
    doc.text(`${pillar.icon} ${pillar.name}`, 50, y, { width: colWidths[0] });
    doc.fillColor(levelColor).text(pillar.level_achieved || '-', 200, y, { width: colWidths[1] });
    doc.fillColor(COLORS.text).text(`${pillar.score}%`, 280, y, { width: colWidths[2] });
    doc.text(`${pillar.checks_passed}/${pillar.checks_total}`, 360, y, { width: colWidths[3] });
    doc.fillColor(statusColor).text(statusIcon, 460, y, { width: colWidths[4] });

    doc.moveDown(0.8);

    // Check for page overflow
    if (doc.y > 750) {
      doc.addPage();
    }
  }

  doc.moveDown(1);

  // Tech Debt Score
  doc
    .fontSize(12)
    .fillColor(COLORS.secondary)
    .text(`Tech Debt Score: ${detailed_analysis.tech_debt_score}%`);
}

function renderRoadmap(doc: PDFKit.PDFDocument, report: EnhancedReport) {
  const { improvement_roadmap } = report;

  doc.fontSize(16).fillColor(COLORS.primary).text('Improvement Roadmap');
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(COLORS.primary);
  doc.moveDown(1);

  const sections = [
    { title: 'Quick Wins (Critical)', items: improvement_roadmap.quick_wins, color: COLORS.danger },
    { title: 'Short Term', items: improvement_roadmap.short_term, color: COLORS.warning },
    { title: 'Medium Term', items: improvement_roadmap.medium_term, color: COLORS.primary },
    { title: 'Long Term', items: improvement_roadmap.long_term, color: COLORS.secondary },
  ];

  for (const section of sections) {
    if (section.items.length === 0) continue;

    doc.fontSize(12).fillColor(section.color).text(section.title);
    doc.moveDown(0.3);

    doc.fontSize(10).fillColor(COLORS.text);
    for (const item of section.items) {
      const levelTag = `[${item.level}]`;
      doc.text(`  ${levelTag} ${item.action}`);

      // Check for page overflow
      if (doc.y > 750) {
        doc.addPage();
      }
    }

    doc.moveDown(1);
  }
}

function renderFooter(
  doc: PDFKit.PDFDocument,
  report: EnhancedReport,
  page: number,
  total: number
) {
  const bottom = doc.page.height - 30;

  doc.fontSize(8).fillColor(COLORS.muted);
  doc.text(
    `Generated by Agent Ready Scanner | ${report.meta.profile} v${report.meta.profile_version}`,
    50,
    bottom,
    {
      width: 300,
    }
  );
  doc.text(`Page ${page} of ${total}`, 450, bottom, { width: 100, align: 'right' });
}

function hasRoadmapItems(report: EnhancedReport): boolean {
  const { improvement_roadmap } = report;
  return (
    improvement_roadmap.quick_wins.length > 0 ||
    improvement_roadmap.short_term.length > 0 ||
    improvement_roadmap.medium_term.length > 0 ||
    improvement_roadmap.long_term.length > 0
  );
}
