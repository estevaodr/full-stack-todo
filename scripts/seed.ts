/**
 * Database Seeding Script
 * 
 * This script populates the database with initial/sample data from seed-data.yaml.
 * It creates users with hashed passwords and their associated todos.
 * It uses TypeORM's DataSource to connect to the database directly,
 * similar to how the NestJS application does it.
 * 
 * Usage:
 *   npm run seed
 *   or
 *   npx ts-node --project scripts/tsconfig.json --require tsconfig-paths/register scripts/seed.ts
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Explicitly load .env file from project root
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Also try .env.development as fallback (common in development)
const envDevelopmentPath = path.resolve(process.cwd(), '.env.development');
if (!process.env.DATABASE_URL && fs.existsSync(envDevelopmentPath)) {
  dotenv.config({ path: envDevelopmentPath });
}

import { DataSource } from 'typeorm';
import { ToDoEntitySchema, UserEntitySchema } from '@full-stack-todo/server/data-access-todo';
import { ITodo, IUser } from '@full-stack-todo/shared/domain';
import * as yaml from 'js-yaml';
import * as bcrypt from 'bcrypt';

/**
 * Interface for seed data structure from YAML
 */
interface SeedUser {
  email: string;
  password: string;
  todos: Array<{
    title: string;
    description?: string;
    completed: boolean;
  }>;
}

interface SeedData {
  users: SeedUser[];
}

/**
 * Get the database URL from environment variable
 */
function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
      'Please set it in your .env file.\n' +
      'Example: DATABASE_URL=postgresql://user:password@host:port/database'
  // checkov:skip=CKV_SECRET_4: ADD REASON
    );
  }
  return envUrl;
}

/**
 * Load seed data from YAML file
 */
function loadSeedData(): SeedData {
  const seedDataPath = path.join(__dirname, 'seed-data.yaml');
  
  if (!fs.existsSync(seedDataPath)) {
    throw new Error(`Seed data file not found: ${seedDataPath}`);
  }

  try {
    const fileContents = fs.readFileSync(seedDataPath, 'utf-8');
    const data = yaml.load(fileContents) as SeedData;
    
    if (!data || !data.users || !Array.isArray(data.users)) {
      throw new Error('Invalid seed data structure. Expected "users" array.');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load seed data: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seed() {
  const databaseUrl = getDatabaseUrl();
  
  console.log(`🌱 Starting database seed...`);
  console.log(`🔗 Database URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs

  // Load seed data from YAML
  console.log(`📄 Loading seed data from YAML...`);
  const seedData = loadSeedData();
  console.log(`   Found ${seedData.users.length} user(s) to seed`);

  // Create DataSource connection with both User and Todo entities
  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [UserEntitySchema, ToDoEntitySchema],
    synchronize: true, // Create/update schema automatically (safe for seeding script)
    logging: false,
  });

  try {
    // Initialize the connection
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Get repositories
    const userRepository = dataSource.getRepository(UserEntitySchema);
    const todoRepository = dataSource.getRepository(ToDoEntitySchema);

    // Check if database already has data
    const existingUserCount = await userRepository.count();
    const existingTodoCount = await todoRepository.count();
    console.log(`📊 Existing data in database: ${existingUserCount} user(s), ${existingTodoCount} todo(s)`);

    if (existingUserCount > 0 || existingTodoCount > 0) {
      console.log('⚠️  Database already contains data.');
      console.log('   To reseed, clear existing data from the database first.');
      return;
    }

    // Process each user from seed data
    for (const seedUser of seedData.users) {
      console.log(`\n👤 Creating user: ${seedUser.email}`);
      
      // Hash the password using bcrypt (same as in ServerFeatureUserService)
      const hashedPassword = await bcrypt.hash(seedUser.password, 10);
      
      // Create user
      const user = await userRepository.save({
        email: seedUser.email,
        password: hashedPassword,
        todos: [], // Will be populated after todos are created
      } as Omit<IUser, 'id'>);
      
      console.log(`   ✓ User created with ID: ${user.id}`);

      // Create todos for this user
      if (seedUser.todos && seedUser.todos.length > 0) {
        console.log(`   📝 Creating ${seedUser.todos.length} todo(s) for ${seedUser.email}...`);
        
        for (const seedTodo of seedUser.todos) {
          const todo = await todoRepository.save({
            title: seedTodo.title,
            description: seedTodo.description || '',
            completed: seedTodo.completed || false,
            user_id: user.id,
          } as Omit<ITodo, 'id'>);
          
          console.log(`      ✓ Created: "${todo.title}" (${todo.completed ? 'completed' : 'pending'})`);
        }
      }
    }

    // Verify the seed
    const finalUserCount = await userRepository.count();
    const finalTodoCount = await todoRepository.count();
    
    console.log(`\n✨ Seeding complete!`);
    console.log(`📊 Total users in database: ${finalUserCount}`);
    console.log(`📊 Total todos in database: ${finalTodoCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        console.error('   💡 Make sure PostgreSQL is running (docker-compose up -d)');
      }
    }
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
