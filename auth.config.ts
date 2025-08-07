import NextAuth from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import axios from 'axios';
import { stripe } from './lib/utils';
import { PermissionChecker } from './lib/permissionChecker';

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  widget_token: string;
  stripeAccount: string;
  logo: string;
  tutorial_step: number;
  tutorial_complete: number;
}

const authConfig = {
  trustHost: true,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    CredentialProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req): Promise<User | null> {
        try {
          let logoUrl = '';
          const { email, password } = credentials;
          // const apiBase = 'https://staging-api.wabify.com/api/';
          const apiBase = process.env.NEXT_PUBLIC_API_URL;
          // const apiBase = 'http://127.0.0.1:8000/api/';
          const response = await axios.post(
            `${apiBase}auth`,
            {
              email,
              password,
              device_name: 'WebWabi'
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          console.log(response.data.data, 'adgadgadg');

          const businessProfile = await axios.post(
            `${apiBase}get_business_profile`,
            {},
            { headers: { Authorization: `Bearer ${response.data.data.token}` } }
          );
          console.log('businessProfile', businessProfile.data.data);
          // console.log(
          //   'businessProfile',
          //   businessProfile?.data.data.business_profile.stripe_account_id
          //     .connected_account_id
          // );

          // const shifts = await axios.post(
          //   `${process.env.NEXT_PUBLIC_API_URL}get_shifts`,
          //   {},
          //   { headers: { Authorization: `Bearer ${response.data.data.token}` } }
          // );
          // console.log('shifts', shifts.data.data.shifts);

          // console.log('employees', employees.data.data.employees);
          const stripeAccountId = businessProfile?.data.data.business_profile
            .stripe_account_id
            ? businessProfile?.data.data.business_profile.stripe_account_id
                .connected_account_id
            : '';

          if (stripeAccountId !== '') {
            try {
              const response2 = await stripe.accounts.retrieve(stripeAccountId);
              const response3 = await stripe.fileLinks.create(
                {
                  // @ts-ignore
                  file: response2.settings?.branding.logo
                }
                // { stripeAccount: stripeAccountId }
              );
              logoUrl = response3.url ? response3.url! : '';
            } catch (err) {
              console.log('Error stripe', err);
            }
          }
          console.log(response, 'response from auth');
          const user = {
            id: response.data.data.id,
            name:
              businessProfile.data?.data?.business_profile?.business_name || '',
            email: email as string,
            token: response.data.data.token,
            widget_token: response.data.data.widget_token,
            stripeAccount:
              businessProfile.data?.data?.business_profile?.stripe_account_id
                ?.connected_account_id || '',
            logo: logoUrl !== '' ? logoUrl : '',
            tutorial_step: response.data.data.tutorial_step,
            tutorial_complete: response.data.data.tutorial_complete
          };

          return user || null;
        } catch (error) {
          console.error(
            'Detailed auth error:',
            (error as any)?.response?.data || error
          );
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/'
  },
  // debug: true,
  callbacks: {
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.token = user.token;
        token.stripeAccount = user.stripeAccount;
        token.logo = user.logo;
        token.widget_token = user.widget_token;
        token.tutorial_step = user.tutorial_step;
        token.tutorial_complete = user.tutorial_complete;
      }
      if (trigger === 'update') {
        console.log('user', user);
        console.log('token', token);
        return { token: null };
      }
      return token;
    },
    async session({ session, token, trigger }: any) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.token = token.token;
      session.user.stripeAccount = token.stripeAccount;
      session.user.logo = token.logo;
      session.user.widget_token = token.widget_token;
      session.user.tutorial_step = token.tutorial_step;
      session.user.tutorial_complete = token.tutorial_complete;
      if (trigger === 'update') {
        console.log('session', session);
        return { session: null };
      }
      return session;
    }
  }
};

export default authConfig;
