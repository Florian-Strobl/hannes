import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      address: string;
      image?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    address: string;
  }
}
