# Joystream Query Node

Joystream query node generated with `hydra-cli` v1.

## Getting Started

First, install:

```bash
yarn
```

Generate with hydra-cli a folder named `generated` and put everthing inside it.

```text
yarn hydra-cli codegen
```

Start the database:

```bash
docker-compose up -d db
```

Run migrations and install the schema:

```bash
yarn db:prepare 
yarn db:migrate
```

Start processor running against a [Joystream Indexer](http://hydra-1.joystream.org:4000/graphql) in a separate terminal:

```bash
yarn processor:start
```

This will run the mappings in the `mappings` folder and populate the database

Start graphql server:

```bash
yarn server:start:dev
```

Open the GraphQL playground at `http://localhost:4000/graphql` and query the Joystream memebers:

```gql
query {
  members(limit: 5) {
   about
   handle
   avatarUri
  }
}
```

## Add a new mapping for Joystream `members.memberRegistered` event

1. Every mapping function get a parameter `DatabaseManager` type and `SubstrateEvent` with the event data. 

2. Define the event handler function following the naming convention: `${event.module}_${event.name}`. 
For example, a mapping from `members.memberRegistered` event will look like

```typescript
export async function memebers_MemberRegistered(db: DatabaseManager, event: SubstrateEvent) {}
```

3. Create a new instance of the entity in the mapping and fill properties with event data.

```typescript
// Get event data
const [{ value: MemberId }, { value: AccountId }] = event.params
const member = new Member()
member.registeredAtBlock = new BN(event.blockNumber)
member.memberId = new BN(MemberId.toString())
member.rootAccount = Buffer.from(AccountId.toString())
// other fields
```

4. Call `db.save()` method to save data on database

```typescript
// Save to database.
await db.save<Member>(member);
```

## Update an existing record

Modify the existing records by first loading it from the database and then saving again. For example, on `members.MemberUpdatedAboutText` we first locate the member by `id`:

```typescript
const [{ value: MemberId }] = event.params
  const member = await db.get(Member, {
    where: { memberId: MemberId.toString() },
  })
```

and then update and save:

```typescript
member.about = ...// extracted data from the event and extrinsic args

await db.save<Member>(member)
```

See the full code in `mappings/memebers.ts`.

## Query Node Constructs Explained

1. `schema.graphql` is where you define types for graphql server. Graphql server use these types to generate db models, db tables, graphql resolvers.

Below you can find a type defination example:

```graphql
type Membership {
  # Member's root account id
  accountId: String!

  # Member's id
  memberId: Int!

  # The unique handle chosen by member
  handle: String

  # A Url to member's Avatar image
  avatarUri: String

  # Short text chosen by member to share information about themselves
  about: String
}
```

Database connections options are defined in `.env`:

```text
DB_NAME=joystream-query-node
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
GRAPHQL_SERVER_PORT=4000
```

