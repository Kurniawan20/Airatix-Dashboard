// Import the PrismaClient constructor from the @prisma/client module
import { PrismaClient } from '@prisma/client'

// Instantiate PrismaClient
const prisma = new PrismaClient()

// Export the instantiated client for reuse throughout the app
export default prisma
