import { DatabaseManager } from '@joystream/hydra-db-utils'
import { Post } from '../generated/graphql-server/src/modules/post/post.model'

import { Posts } from './generated/types'

export async function postCreated(
  db: DatabaseManager,
  event: Posts.PostCreatedEvent
) {
  const post = new Post()
  post.author = event.data.accountId.toHex()
  post.id = event.data.postId.toString()
  if (event.ctx.extrinsic === undefined) {
    throw new Error(`No extrinsic has been provided`)
  }
  // get type-safe call data out of the untyped extrinsic data
  const call = new Posts.CreatePostCall(event.ctx)
  post.content = call.args.content.toString()
  await db.save<Post>(post)
}
