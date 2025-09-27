export function generateBarChartExample(labels: string[], data: number[]): Promise<Buffer>;
export function generateBarChart(labels: string[], data: number[]): Promise<Buffer>;
export function generatePDF(chartImage: Buffer): Promise<Uint8Array>;