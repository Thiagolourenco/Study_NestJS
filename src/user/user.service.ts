import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email;
    const password = createUserDto.password;

    const saltOrRounds = 10;

    const userExists = await this.userModel.findOne({ email: email });

    if (userExists) {
      throw new Error('Usuário já existente');
    }

    createUserDto.password = await bcrypt.hash(password, saltOrRounds);

    const user = new this.userModel(createUserDto);

    return user.save();
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne(id: string) {
    return await this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExists = await this.userModel.findById(id);

    if (!userExists) {
      throw new Error('Usuário não existe');
    }

    return await this.userModel
      .findByIdAndUpdate({ _id: id }, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    const userExists = await this.userModel.findById(id);

    if (!userExists) {
      throw new Error('Usuário Não Existe');
    }

    return await this.userModel.findByIdAndRemove({ _id: id }).exec();
  }

  async login(auth: AuthUserDto) {
    const user = await this.authService.validateUser(auth.email, auth.password);
    console.log('USER => ', user);

    if (!user) {
      throw new BadRequestException('Email or Passowrd invalid');
    } else {
      return await this.authService.generateUserCredentials(user);
    }
  }
}
