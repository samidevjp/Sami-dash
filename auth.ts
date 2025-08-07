import NextAuth from 'next-auth';
import authConfig from './auth.config';

export const { auth, handlers, signOut, signIn } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' }
  // logger: {
  //   error: (error: Error) => {
  //     console.error(error);
  //   },
  //   warn: (code: any) => {
  //     console.warn(code);
  //   },
  // debug: (code: any, metadata: any) => {
  //   console.debug(code, metadata);
  // }
});
