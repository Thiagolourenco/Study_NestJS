import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schema/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtTokenService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email: email });

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        delete user.password;
        return user;
      }
    }

    return user;
  }

  async generateUserCredentials(user: UserDocument) {
    const payload = { ...user, sub: user._id };
    const dataUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    return {
      user: dataUser,
      access_token: this.jwtTokenService.sign(payload),
    };
  }
}
