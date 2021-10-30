import 'reflect-metadata'
import { BaseContext, Server } from '@joystream/warthog'
import { Logger } from './logger'

// TODO: add authentication
export interface Context extends BaseContext {
  user?: {
    email: string
    id: string
    permissions: string
  }
}

export function getServer(appOptions = {}, dbOptions = {}): Server<Context> {
  return new Server<Context>(
    {
      // Inject a fake user.  In a real app you'd parse a JWT to add the user
      context: (request: any) => {
        const userId = JSON.stringify(request.headers).length.toString()

        return {
          user: {
            id: `user:${userId}`,
          },
        }
      },
      introspection: true,
      logger: Logger,
      ...appOptions,
    },
    dbOptions
  )
}
