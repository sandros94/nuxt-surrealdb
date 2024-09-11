import type { ComputedRef, Ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface User {}

export interface UserSession {
  user?: User
}

export interface UserSessionRequired extends UserSession {
  user: User
}

export interface UserSessionComposable {
  loggedIn: ComputedRef<boolean>
  user: ComputedRef<User | null>
  session: Ref<UserSession>
  fetch: () => Promise<void>
  clear: () => Promise<void>
}
