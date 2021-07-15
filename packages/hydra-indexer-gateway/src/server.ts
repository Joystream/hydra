import 'reflect-metadata'
import { BaseContext, Server } from 'warthog'
import { Logger } from './logger'

import WebSocket from 'ws'
import { ConnectionContext } from 'subscriptions-transport-ws'

// TODO: add authentication
export interface Context extends BaseContext {
  user?: {
    email: string
    id: string
    permissions: string
  }
}

export function getServer(appOptions = {}, dbOptions = {}): Server<Context> {
  console.log('sstaaarting server')
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



      apolloConfig: {
        subscriptions: {
          path: '/mytestsubscription',
          //keepAlive?: number
          //onConnect: (connectionParams: Object, websocket: WebSocket, context: ConnectionContext) => {
          onConnect: (connectionParams, websocket, context) => {
            console.log('hurrayy! it seems subscriptions started!!')
            console.log(connectionParams, websocket, context)
          },
          //onDisconnect: (websocket: WebSocket, context: ConnectionContext) => {
          onDisconnect: (websocket, context) => {
            console.log('aaa subscriptions disconnected!!')
          },
        }
      }
    },
    dbOptions
  )
}
