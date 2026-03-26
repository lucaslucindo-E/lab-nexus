export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  correlationCoef: number;
  meanX: number;
  meanY: number;
  ssX: number;
  ssY: number;
  ssXY: number;
  residuals: number[];
  predictedY: number[];
}

export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let ssX = 0, ssY = 0, ssXY = 0;
  for (let i = 0; i < n; i++) {
    ssX += (x[i] - meanX) ** 2;
    ssY += (y[i] - meanY) ** 2;
    ssXY += (x[i] - meanX) * (y[i] - meanY);
  }

  const slope = ssXY / ssX;
  const intercept = meanY - slope * meanX;
  const rSquared = (ssXY ** 2) / (ssX * ssY);
  const correlationCoef = ssXY / Math.sqrt(ssX * ssY);

  const predictedY = x.map(xi => slope * xi + intercept);
  const residuals = y.map((yi, i) => yi - predictedY[i]);

  return { slope, intercept, rSquared, correlationCoef, meanX, meanY, ssX, ssY, ssXY, residuals, predictedY };
}

export function formatNumber(num: number, decimals = 4): string {
  return num.toFixed(decimals);
}
