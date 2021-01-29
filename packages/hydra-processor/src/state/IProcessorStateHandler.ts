import { IProcessorState } from './IProcessorState'

export interface IProcessorStateHandler {
  persist(state: IProcessorState): Promise<void>
  init(fromBlock?: number): Promise<IProcessorState>
  /**
   * Explicity expose 'on' method from EventEmitter to ensure listeners can listen to events
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this
}
