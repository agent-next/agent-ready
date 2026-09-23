import type { FastifyInstance } from 'fastify';
import { db } from '../services/db-service.js';
import { generatePdf } from '../services/pdf-service.js';
import type { EnhancedReport } from '../agents/reporter.js';

export async function reportRoutes(app: FastifyInstance) {
  // Get report by scan ID (UUID)
  app.get<{ Params: { id: string } }>('/report/:id', async (request, reply) => {
    const { id } = request.params;

    // Try to find by commit SHA first (frontend uses commit), then by UUID
    let scan = await db.getScanByCommit(id);
    if (!scan) {
      scan = await db.getScan(id);
    }

    if (!scan) {
      reply.status(404);
      return { error: 'Report not found' };
    }

    if (scan.status !== 'completed' || !scan.result) {
      reply.status(400);
      return { error: 'Scan not completed or has no result' };
    }

    return scan.result;
  });

  // Generate PDF report
  app.get<{ Params: { id: string } }>('/report/:id/pdf', async (request, reply) => {
    const { id } = request.params;

    // Try to find by commit SHA first (frontend uses commit), then by UUID
    let scan = await db.getScanByCommit(id);
    if (!scan) {
      scan = await db.getScan(id);
    }

    if (!scan) {
      reply.status(404);
      return { error: 'Report not found' };
    }

    if (scan.status !== 'completed' || !scan.result) {
      reply.status(400);
      return { error: 'Scan not completed or has no result' };
    }

    const report = scan.result as EnhancedReport;
    const pdfBuffer = await generatePdf(report);

    const filename = `agent-ready-${report.meta.repo.replace('/', '-')}-${report.meta.commit.slice(0, 7)}.pdf`;

    reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .header('Content-Length', pdfBuffer.length);

    return reply.send(pdfBuffer);
  });
}
