/**
 * Calculate stake amounts in STX and microSTX
 */

function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1000000);
}

function microStxToStx(microStx: number): number {
  return microStx / 1000000;
}

// CLI usage
const input = process.argv[2];
const type = process.argv[3] || 'stx';

if (!input) {
  console.log('Usage: ts-node calculate-stake.ts <amount> [stx|microstx]');
  console.log('Example: ts-node calculate-stake.ts 0.5 stx');
  process.exit(1);
}

const amount = parseFloat(input);

if (type === 'stx') {
  const microStx = stxToMicroStx(amount);
  console.log(`${amount} STX = ${microStx} microSTX`);
} else {
  const stx = microStxToStx(amount);
  console.log(`${amount} microSTX = ${stx} STX`);
}

export { stxToMicroStx, microStxToStx };
