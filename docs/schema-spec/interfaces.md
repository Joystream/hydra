---
description: Extract interfaces and query multiple types in a single query
---

# Interfaces

## Introduction

Interfaces are useful when several entity types share some set of properties and one would like to have an aggregated result when such a common property is queried.

This is achieved through the natively supported GraphQL [interface](https://graphql.org/learn/schema/#interfaces) type and [inline fragments](https://graphql.org/learn/queries/#inline-fragments) in the output schema. For example, let us define the following input schema:

```graphql
interface Profile @entity {
  about: String!
}

type Member implements Profile @entity {
  about: String!
  handle: String!
}

type Account implements Profile @entity {
  about: String!
  accountId: Bytes
}
```

Note that interfaces should be decorated with `@entity` and all the subclasses must explicitly define the inherited fields \(otherwise an error will be thrown during the codegen\).

The output schema will support a query by `about` which puts together `Member` and `Account` types. Note that `orderBy` is also supported for the inherited properties as well as OpenCRUD.

```graphql
query {
  profiles(
    limit: 5
    offset: 5
    orderBy: about_ASC
    where: { about_eq: "joystreamer" }
  ) {
    about
    __typename
    ... on Member {
      handle
    }
    ... on Account {
      accountId
    }
  }
}
```

## Entity Relations

Interfaces can have fields that are type of other entities.

```graphql
type Event @entity {
  id: ID!
  inBlock: Int!
}

interface MembershipEvent @entity {
  event: Event!
}

type MembershipBoughtEvent implements MembershipEvent @entity {
  id: ID!
  event: Event!
}

type MemberInvitedEvent implements MembershipEvent @entity {
  id: ID!
  event: Event!
}
```

Fetch the relations:

```graphql
query {
  membershipEvents {
    ... on MembershipBoughtEvent {
      event {
        inBlock
      }
    }
  }
}
```

## Filtering Results By Implementer Type

Hydra-cli generates an enum for each interface defined in the user's input schema. It allows users to filter results by fetching only data of interest:

```graphql
query {
  membershipEvents(where: { type_in: [MemberInvitedEvent] }) {
    ... on MembershipBoughtEvent {
      event {
        inBlock
      }
    }
  }
}
```

If you look at the `generated/graphql-server/src/enums/enums.ts` file you will find an enum defination for the `MembershipEvent` like below:

```ts
enum MembershipEventTypeOptions {
  MembershipBoughtEvent = 'MembershipBoughtEvent',
  MemberInvitedEvent = 'MemberInvitedEvent',
}
```

Note only **`_in`, `_eq`** are available to filter results by enums and the field name is `type` by default.
