export interface AdditionalData {
  data: Buffer
}
export interface EventParam {
  name: string
  type: string
  value: string

  additionalData: AdditionalData[]
}

export interface SystemEvent {
  params: EventParam
}
