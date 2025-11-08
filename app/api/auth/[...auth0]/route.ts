import { handleAuth, handleLogin, handleCallback, handleLogout } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email',
    },
    returnTo: '/dashboard',
  }),
  callback: handleCallback({
    afterCallback: async (req, res, session) => {
      // Sync user to Supabase database
      if (session?.user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              auth0Id: session.user.sub,
              email: session.user.email,
              name: session.user.name,
              picture: session.user.picture,
              nickname: session.user.nickname,
            }),
          })

          if (!response.ok) {
            console.error('Failed to sync user to database')
          }
        } catch (error) {
          console.error('Error syncing user:', error)
        }
      }

      return session
    },
  }),
  logout: handleLogout({
    returnTo: '/',
  }),
})

