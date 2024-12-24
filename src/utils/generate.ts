import JWT from './jwt.util';

export class Generate {
  public static randomString(
    type: 'alphabet' | 'alphanumeric',
    length: number,
  ): string {
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVQXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '1234567890';
    const allChars =
      type === 'alphabet'
        ? alphabets
        : type === 'alphanumeric'
          ? alphabets + numbers
          : '';

    let result = '';

    for (let index = 0; index < length; index++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      result += allChars[randomIndex];
    }

    return result;
  }

  public static token(payload: Record<string, any>, expriresIn: string = '1d') {
    const token = JWT.createToken(payload, expriresIn);
    return token;
  }
}
