import { analyzeStreaks } from './streak-analyzer';
import { trackPoolBalance } from './pool-tracker';
import { analyzeUserActivity } from './user-activity';

async function generateDashboard() {
  console.log("=".repeat(70));
  console.log("AHHBITTRACKER ANALYTICS DASHBOARD");
  console.log("=".repeat(70));
  console.log();
  
  // Pool balance
  console.log("📊 FORFEITED POOL");
  console.log("-".repeat(70));
  await trackPoolBalance();
  console.log();
  
  // User activity
  console.log("👥 USER ACTIVITY (7 DAYS)");
  console.log("-".repeat(70));
  await analyzeUserActivity(7);
  console.log();
  
  // Sample streak analysis (habits 1-10)
  console.log("🔥 STREAK ANALYSIS");
  console.log("-".repeat(70));
  const habitIds = Array.from({ length: 10 }, (_, i) => i + 1);
  await analyzeStreaks(habitIds);
  
  console.log("=".repeat(70));
  console.log("Dashboard generated successfully");
  console.log("=".repeat(70));
}

generateDashboard().catch(console.error);
