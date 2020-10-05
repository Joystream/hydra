import { makeDatabaseManager, SubstrateEvent } from '..';
import Debug from 'debug';
import { doInTransaction } from '../db/helper';
import { numberEnv } from '../utils/env-flags';
import { ProcessorOptions } from '../node';
import { Inject, Service } from 'typedi';
import { IProcessorSource, GraphQLSource, HandlerLookupService } from '.'; 
import { QueryRunner } from 'typeorm';
import { logError } from '../utils/errors';
import { IProcessorState, ProcessorStateHandler } from './ProcessorStateHandler';
import { EventFilter } from './IProcessorSource';
import { waitFor } from '../utils/wait-for';
import { SubstrateEventEntity } from '../entities';

const debug = Debug('index-builder:processor');

const DEFAULT_PROCESSOR_NAME = 'hydra';
const BLOCK_WINDOW = 100000;
const BATCH_SIZE = numberEnv('PROCESSOR_BATCH_SIZE') || 10;
// Interval at which the processor pulls new blocks from the database
// The interval is reasonably large by default. The trade-off is the latency 
// between the updates and the load to the database
const PROCESSOR_BLOCKS_POLL_INTERVAL = numberEnv('PROCESSOR_BLOCKS_POLL_INTERVAL') || 10000; // 10 seconds

@Service('MappingsProcessor')
export class MappingsProcessor {
  
  //private _lastEventIndex: string | undefined;
  private state!: IProcessorState;
  private _started = false;
  private currentFilter!: EventFilter;
  private indexerHead!: number; // current indexer head we are aware of

  private _name = DEFAULT_PROCESSOR_NAME;

  constructor(
    @Inject('ProcessorOptions') protected options: ProcessorOptions,
    @Inject('ProcessorSource') protected  eventsSource: IProcessorSource = new GraphQLSource(options),
    @Inject() protected handlerLookup = new HandlerLookupService(options),
    @Inject('ProcessorStateHandler') protected stateHandler = new ProcessorStateHandler(options.name || DEFAULT_PROCESSOR_NAME) 
  ) {
    // TODO: uncomment this block when eventSource will emit
    // this.eventsSource.on('NewIndexerHead', (h: number) => { 
    //   debug(`New Indexer Head: ${h}`)
    //   this.indexerHead = h 
    // });
    // For now, simply update indexerHead regularly
    setInterval(() => {
      this.eventsSource.indexerHead()
        .then((h) => { 
          debug(`New indexer head: ${h}`)
          this.indexerHead = h 
        })
        .catch((e) => debug(`Error fetching new indexer head: ${logError(e)}`));
    }, 60 * 1000) // every minute 
  }


  async start(): Promise<void> { 
    debug('Spawned the processor');
  
    this.state = await this.stateHandler.init(this.options.atBlock)
    this.indexerHead = await this.eventsSource.indexerHead();
    
    this.currentFilter = {
      afterID: this.state.lastProcessedEvent,
      fromBlock: this.state.lastScannedBlock,
      toBlock: Math.min(this.state.lastScannedBlock + BLOCK_WINDOW - 1, this.indexerHead),
      names: this.handlerLookup.eventsToHandle()
    }

    this._started = true;
    await this.processingLoop();
  }

  public stop(): void {
    this._started = false;
  }


  private async nextFilter(): Promise<EventFilter> {
    
    debug(`Indexer Head: ${this.indexerHead} Last Scanned Block: ${this.state.lastScannedBlock}`);

    // here we should eventually listen only to the events
    await waitFor(
      () => (this.indexerHead - this.state.lastScannedBlock) > 2,
      () => !this._started)

    this.currentFilter.fromBlock = this.state.lastScannedBlock;
    this.currentFilter.toBlock = Math.min(this.currentFilter.fromBlock + BLOCK_WINDOW - 1, this.indexerHead);
    this.currentFilter.afterID = this.state.lastProcessedEvent;
    
    debug(`Next filter: ${JSON.stringify(this.currentFilter, null, 2)}`);
    return this.currentFilter;
  }

  // Long running loop where events are fetched and the mappings are applied
  async processingLoop(): Promise<void> {
    while (this._started) {
      try {
        const nextFilter = await this.nextFilter();

        const events = await this.eventsSource.nextBatch(nextFilter,  BATCH_SIZE);
        debug(`Processing new batch of events of size: ${events.length}`);
        if (events.length > 0) {
          await this.processEventBlock(events);
        } else {
          // If there is nothing to process, wait and update the indexer head
          // TODO: we should really subsribe to new indexer heads here and update accordingly
          this.state.lastScannedBlock = this.currentFilter.toBlock - 1;
          this.state.lastProcessedEvent = this.state.lastProcessedEvent || SubstrateEventEntity.formatId(0, 0);
          await this.stateHandler.persist(this.state);
        }

      } catch (e) {
        console.error(`Stopping the proccessor due to errors: ${logError(e)}`);
        this.stop();
        throw new Error(e);
      }
    }
    debug(`The processor has been stopped`);
  }

  async processEventBlock(query_event_block: SubstrateEvent[]): Promise<void> {
    for (const event of query_event_block) {
      await doInTransaction(async (queryRunner: QueryRunner) => {

        debug(`Processing event ${event.name}, 
          id: ${event.id}`)

        debug(`JSON: ${JSON.stringify(event, null, 2)}`);  
        
        const handler = this.handlerLookup.lookupHandler(event.name);
        await handler(makeDatabaseManager(queryRunner.manager), event);

        this.state.lastProcessedEvent = event.id;
        this.state.lastScannedBlock = event.blockNumber;

        await this.stateHandler.persist(this.state);

        debug(`Event ${event.id} done`)
      
      });
      
    }
  }

}
