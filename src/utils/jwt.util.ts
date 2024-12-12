import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

class JWT {
  private readonly JWT_SEC: string;

  constructor(JWT_SEC: string) {
    this.JWT_SEC = JWT_SEC;
  }

  public createToken(
    payload: { [key: string]: any },
    expiresIn: string = '2d',
  ) {
    const token = jwt.sign(payload, this.JWT_SEC, { expiresIn });
    return token;
  }

  public verifyToken(token: string) {
    return jwt.verify(token, this.JWT_SEC);
  }
}

export default new JWT(process.env.JWT_SEC || 'default_secret_key');
