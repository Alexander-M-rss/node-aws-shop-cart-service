import { Injectable } from '@nestjs/common';
import { User } from '../models';
import pgClient from '../../db';

@Injectable()
export class UsersService {

  async findOne(userName: string): Promise<User> {
    const user = await pgClient('users')
    .where('name', userName)
    .first();

    return user;
  }

  async createOne({ name, password }: User): Promise<User> {
    const newUser = await pgClient('users')
      .insert({ name, password })
      .returning('*') as any as User;

    return newUser;
  }

}
