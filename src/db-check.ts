import { prisma } from "./lib/prisma";

async function main() {
  try {
    console.log("Checking DB connection...");
    const userCount = await prisma.user.count();
    console.log(`Connection successful. User count: ${userCount}`);
    
    // Check if we can reach the Account table
    const accountCount = await prisma.account.count();
    console.log(`Account count: ${accountCount}`);
  } catch (err) {
    console.error("DB Diagnostic Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
