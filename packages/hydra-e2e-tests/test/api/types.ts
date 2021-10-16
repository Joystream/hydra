export interface SystemEvent {
  params: EventParam
}

export interface EventParam {
  name: string
  type: string
  value: string
  additionalData: AdditionalData[]
}

export interface AdditionalData {
  data: Buffer
}

export interface Transfer {
  value: string
  from: string
  to: string
  block: number
  fromAccount?: { hex: string }
  toAccount?: { hex: string }
}
