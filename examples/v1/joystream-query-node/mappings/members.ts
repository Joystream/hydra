import BN from 'bn.js'
import { Member } from '../generated/graphql-server/src/modules/member/member.model'
import { SubstrateEvent, AnyJsonField, ExtrinsicArg } from '@joystream/hydra-common'
import { DatabaseManager } from '@joystream/hydra-db-utils'

interface CheckedUserInfo {
  handle: string
  avatar_uri: string
  about: string
}

export async function members_MemberRegistered(
  db: DatabaseManager,
  event: SubstrateEvent
) {
  const [{ value: MemberId }, { value: AccountId }] = event.params

  if (event.extrinsic === undefined) {
    throw new Error(`Extrinsic is undefined`)
  }

  // Not safe type casting!
  const userInfo = (fromArgArrayToObject(
    event.extrinsic.args
  ) as unknown) as CheckedUserInfo

  const member = new Member()
  member.registeredAtBlock = new BN(event.blockNumber)
  member.memberId = new BN(MemberId.toString())
  member.rootAccount = Buffer.from(AccountId.toString())
  member.controllerAccount = Buffer.from(AccountId.toString())
  member.handle = fromHexString(userInfo.handle)
  member.avatarUri = fromHexString(userInfo.avatar_uri)
  member.about = fromHexString(userInfo.about)

  await db.save<Member>(member)
}

export async function members_MemberUpdatedAboutText(
  db: DatabaseManager,
  event: SubstrateEvent
) {
  const [{ value: MemberId }] = event.params
  const member = await db.get(Member, {
    where: { memberId: MemberId.toString() },
  })

  if (member === undefined) {
    // If we can't find a member, it typically means it was created at genesis
    console.log(
      `WARNING: Can't find member ${MemberId}. Was it loaded at genesis?`
    )
    return
  }

  if (event.extrinsic === undefined) {
    throw new Error(`Extrinsic is undefined`)
  }

  // Not safe type casting!
  const userInfo = (fromArgArrayToObject(
    event.extrinsic.args
  ) as unknown) as CheckedUserInfo
  member.about = fromHexString(userInfo.about)

  await db.save<Member>(member)
}

export async function members_MemberUpdatedAvatar(
  db: DatabaseManager,
  event: SubstrateEvent
) {
  const [{ value: MemberId }] = event.params
  const member = await db.get(Member, {
    where: { memberId: MemberId.toString() },
  })

  if (member === undefined) {
    // If we can't find a member, it typically means it was created at genesis
    console.log(
      `WARNING: Can't find member ${MemberId}. Was it loaded at genesis?`
    )
    return
  }

  if (event.extrinsic === undefined) {
    throw new Error(`Extrinsic is undefined`)
  }

  // Not safe type casting!
  const userInfo = (fromArgArrayToObject(
    event.extrinsic.args
  ) as unknown) as CheckedUserInfo
  member.avatarUri = fromHexString(userInfo.avatar_uri)

  await db.save<Member>(member)
}

export async function members_MemberUpdatedHandle(
  db: DatabaseManager,
  event: SubstrateEvent
) {
  const [{ value: MemberId }] = event.params
  const member = await db.get(Member, {
    where: { memberId: MemberId.toString() },
  })

  if (member === undefined) {
    // If we can't find a member, it typically means it was created at genesis
    console.log(
      `WARNING: Can't find member ${MemberId}. Was it loaded at genesis?`
    )
    return
  }

  if (event.extrinsic === undefined) {
    throw new Error(`Extrinsic is undefined`)
  }

  // Not safe type casting!
  const userInfo = (fromArgArrayToObject(
    event.extrinsic.args
  ) as unknown) as CheckedUserInfo
  member.handle = fromHexString(userInfo.handle)

  await db.save<Member>(member)
}

export async function members_MemberSetRootAccount(
  db: DatabaseManager,
  event: SubstrateEvent
) {
  const [{ value: MemberId }, { value: AccountId }] = event.params
  const member = await db.get(Member, {
    where: { memberId: MemberId.toString() },
  })

  if (member === undefined) {
    // If we can't find a member, it typically means it was created at genesis
    console.log(
      `WARNING: Can't find member ${MemberId}. Was it loaded at genesis?`
    )
    return
  }

  member.rootAccount = Buffer.from(AccountId.toString())
  await db.save<Member>(member)
}

export async function members_MemberSetControllerAccount(
  db: DatabaseManager,
  event: SubstrateEvent
) {
  const [{ value: MemberId }, { value: AccountId }] = event.params
  const member = await db.get(Member, {
    where: { memberId: MemberId.toString() },
  })

  if (member === undefined) {
    // If we can't find a member, it typically means it was created at genesis
    console.log(
      `WARNING: Can't find member ${MemberId}. Was it loaded at genesis?`
    )
    return
  }

  member.controllerAccount = Buffer.from(AccountId.toString())
  await db.save<Member>(member)
}

/**
 * convert an array [ { name: 'x', value: 'y',}, ...]  into an object: { 'x': 'y', ... }
 */
function fromArgArrayToObject(
  args: ExtrinsicArg[]
): Record<string, AnyJsonField> {
  return args.reduce((acc, arg) => {
    acc[arg.name] = arg.value
    return acc
  }, {} as Record<string, AnyJsonField>)
}

/**
 *
 * @param value hex-encoded string in the form '0x....'
 * @returns decoded utf-8 string
 */
function fromHexString(value: string): string {
  return Buffer.from(value.replace(/0x/g, ''), 'hex').toString()
}
