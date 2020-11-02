import { IProcessorState } from "./IProcessorState";

export interface IProcessorStateHandler {
  persist(state: IProcessorState): Promise<void>
  init(fromBlock?: number): Promise<IProcessorState>
}
