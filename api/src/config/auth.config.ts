import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('No JWT_SECRET configured');
  }

  return {
    jwtSecret,
  };
});
