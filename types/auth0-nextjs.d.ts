declare module '@auth0/nextjs-auth0' {
  // Minimal type declarations to satisfy TypeScript in this project.
  // Expand as needed if you use additional exports from the package.

  export type SessionUser = {
    sub?: string
    email?: string
    [key: string]: any
  }

  export type Session = {
    user?: SessionUser
    [key: string]: any
  }

  export function getSession(): Promise<Session | undefined>
  export function getAccessToken(): Promise<string | undefined>
  export function withApiAuthRequired(handler: any): any
  export function handleAuth(req: any, res: any, options?: any): any
}

declare module '@auth0/nextjs-auth0/client' {
  import { PropsWithChildren } from 'react'

  export function UserProvider(props: PropsWithChildren<{}>): JSX.Element
  export default UserProvider

  // useUser hook - minimal typing
  export function useUser(): {
    user: any | null
    isLoading: boolean
    error?: any
    invalidate: () => Promise<any>
  }
  // For compatibility, allow default export of useUser as well
  declare const useUserDefault: () => {
    user: any | null
    isLoading: boolean
    error?: any
    invalidate: () => Promise<any>
  }
  export default useUserDefault
}
