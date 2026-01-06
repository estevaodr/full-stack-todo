/**
 * Database Seeding Script
 * 
 * This script populates the database with initial/sample data.
 * It uses TypeORM's DataSource to connect to the database directly,
 * similar to how the NestJS application does it.
 * 
 * Usage:
 *   npm run seed
 *   or
 *   npx ts-node --project scripts/tsconfig.json scripts/seed.ts
 */

import { DataSource } from 'typeorm';
import { ToDoEntitySchema } from '@full-stack-todo/server/data-access-todo';
import { ITodo } from '@full-stack-todo/shared';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Get the database path from environment variable or use default
 */
function getDatabasePath(): string {
  const envPath = process.env.DATABASE_PATH;
  if (envPath) {
    return path.resolve(envPath);
  }
  // Default path as defined in app.module.ts
  return path.resolve(process.cwd(), 'tmp', 'db.sqlite');
}

/**
 * Sample todo data to seed the database
 */
const sampleTodos: Omit<ITodo, 'id'>[] = [
  {
    title: 'Welcome to Full Stack Todo!',
    description: 'This is your first todo item. You can edit, complete, or delete it.',
    completed: false,
  },
  {
    title: 'Add a route to create todo items!',
    description: 'Yes, this is foreshadowing a POST route introduction',
    completed: false,
  },
  {
    title: 'Learn TypeORM',
    description: 'Understand how TypeORM works with NestJS and SQLite',
    completed: true,
  },
  {
    title: 'Implement database seeding',
    description: 'Create a script to populate the database with initial data',
    completed: true,
  },
  {
    title: 'Build amazing features',
    description: 'Use this todo app as a foundation for your next project',
    completed: false,
  },
];

/**
 * Main seeding function
 */
async function seed() {
  const databasePath = getDatabasePath();
  
  console.log(`🌱 Starting database seed...`);
  console.log(`📁 Database path: ${databasePath}`);

  // Ensure the database directory exists
  const dbDir = path.dirname(databasePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`📂 Created database directory: ${dbDir}`);
  }

  // Create DataSource connection
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: databasePath,
    entities: [ToDoEntitySchema],
    synchronize: true, // Create/update schema automatically (safe for seeding script)
    logging: false,
  });

  try {
    // Initialize the connection
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Get repository
    const todoRepository = dataSource.getRepository(ToDoEntitySchema);

    // Check if database already has data
    const existingCount = await todoRepository.count();
    console.log(`📊 Existing todos in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log('⚠️  Database already contains data.');
      console.log('   To reseed, delete the database file first or clear existing todos.');
      console.log(`   Database file: ${databasePath}`);
      return;
    }

    // Insert sample todos
    console.log(`📝 Inserting ${sampleTodos.length} sample todos...`);
    
    for (const todo of sampleTodos) {
      const saved = await todoRepository.save(todo);
      console.log(`   ✓ Created: "${saved.title}"`);
    }

    // Verify the seed
    const finalCount = await todoRepository.count();
    console.log(`\n✨ Seeding complete!`);
    console.log(`📊 Total todos in database: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('🎉 Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });

