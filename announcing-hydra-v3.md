# Announcing Hydra v3

Hydra v3 is already in the works. Here are the main features planned:

* Support for filtering by relations
* Define block ranges for any mapping, i.e. specify that your mapping X should be run only from block 5 to block 7
* Import all model files from a single library.  Instead of the cumbersome 

```typescript
import { MyEntity1 }  from '../generated/graphql-server/my-entity2/my-entity2.model' 
import { MyEntity2 }  from '../generated/graphql-server/my-entity2/my-entity2.model' 

```

write

```typescript
import { MyEntity1, MyEntity2 } from '../generated/graphql-server/model'
```



