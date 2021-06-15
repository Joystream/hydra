export interface ArrayData {
  data: Buffer
}
export interface EventParam {
  name: string
  type: string
  value: string

  arrayData: ArrayData[]
}

export interface SystemEvent {
  params: EventParam
}
