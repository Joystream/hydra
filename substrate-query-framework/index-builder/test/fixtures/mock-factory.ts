import { QueryEventBlock, QueryEvent } from "../../src";
import { Phase, Event, EventRecord } from '@polkadot/types/interfaces';
import { BlockPayload } from "../../src/indexer";
import { withTs } from "../../src/utils/stringify";

export function blockPayload(height: number): BlockPayload {
  return withTs({
    height
  }) as unknown as BlockPayload
}

export function queryEventBlock(block = 0): QueryEventBlock {
  const gen = queryEvent(block);
  return {
    block_number: block,
    query_events: [gen.next().value as QueryEvent, 
      gen.next().value as QueryEvent, 
      gen.next().value as QueryEvent]
  }
}

export function * queryEvent(block = 0): Generator<QueryEvent, void, QueryEvent> {
  // TODO: use faker
  let i = 0;
  do {  
    yield {
          event_record: {
            phase: {
              toJSON: () => { return {} }
            } as unknown as Phase,
            event: {
              method: 'fake.method',
              section: 'fake.section',
              data: []
            } as unknown as Event
          } as unknown as EventRecord,
          block_number: block,
          indexInBlock: i,
          event_name: 'fake.event',
          event_method: 'fake.method',
          event_params: {},
          index: i
    }
    i++;
  } while (i < 100)
}