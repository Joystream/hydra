import { SubstrateEvent, DB } from '../generated/hydra-processor'
import { Post } from '../generated/graphql-server/src/modules/post/post.model'

export async function posts_PostCreated(db: DB, event: SubstrateEvent) {
  const [account, id] = event.params
  const post = new Post()
  post.author = Buffer.from(account.value as string)
  post.id = id.value as string
  if (event.extrinsic === undefined) {
    throw new Error(`No extrinsic has been provided`)
  }
  post.content = event.extrinsic.args[2].value as string
  await db.save<Post>(post)
}

