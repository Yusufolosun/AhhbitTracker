/**
 * Utility to validate habit names before submission
 */

function validateHabitName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Habit name cannot be empty' };
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Habit name too long (max 50 characters)' };
  }
  
  return { valid: true };
}

// CLI usage
const habitName = process.argv[2];

if (!habitName) {
  console.log('Usage: ts-node validate-habit-name.ts "Habit Name"');
  process.exit(1);
}

const result = validateHabitName(habitName);

if (result.valid) {
  console.log('✅ Valid habit name');
} else {
  console.log(`❌ Invalid: ${result.error}`);
  process.exit(1);
}

export { validateHabitName };
