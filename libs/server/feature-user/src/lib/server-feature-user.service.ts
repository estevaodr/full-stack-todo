import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IUser, ICreateUser } from '@full-stack-todo/shared/domain';
import { UserEntitySchema } from '@full-stack-todo/server/data-access-todo';

/**
 * Service for managing User entities.
 * 
 * This service uses the Repository Pattern with TypeORM to interact with the database.
 * The repository is injected using @InjectRepository decorator, which provides easy,
 * intuitive access to the type of queries you'd normally see in a SQL transaction.
 * 
 * Password Security:
 * - Passwords are hashed using bcrypt with 10 rounds before storage
 * - The actual password is never stored in plain text
 * - Only hashed passwords are stored in the database
 */
@Injectable()
export class ServerFeatureUserService {
  /**
   * TypeORM repository for user entities.
   * Injected via @InjectRepository decorator, providing database access methods.
   */
  constructor(
    @InjectRepository(UserEntitySchema)
    private userRepository: Repository<IUser>
  ) {}

  /**
   * Retrieves a single user by its ID from the database
   * @param id - The unique identifier of the user
   * @returns Promise that resolves to the user with the specified ID
   * @throws NotFoundException if the user is not found
   */
  async getOne(id: string): Promise<IUser> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User could not be found!`);
    }
    return user;
  }

  /**
   * Retrieves a single user by email from the database
   * @param email - The email address of the user
   * @returns Promise that resolves to the user with the specified email, or null if not found
   */
  async getOneByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findOneBy({ email });
  }

  /**
   * Creates a new user in the database
   * The password is hashed using bcrypt with 10 rounds before storage
   * TypeORM automatically generates a UUID for the ID
   * @param user - User data containing email and password
   * @returns Promise that resolves to the newly created user with generated UUID
   */
  async create(user: ICreateUser): Promise<IUser> {
    // Hash the password using bcrypt with 10 rounds
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    // Create the user with the hashed password
    const newUser = await this.userRepository.save({
      ...user,
      password: hashedPassword,
      todos: [], // New users start with an empty todos array
    });
    
    return newUser;
  }
}
