import BN from 'bn.js'
import { ValueTransformer } from 'typeorm'

export class NumericTransformer implements ValueTransformer {
  /**
   * Used to marshal data when writing to the database.
   */
  to(value: BN): string | null {
    return value ? value.toString(10) : null
  }

  /**
   * Used to unmarshal data when reading from the database.
   */
  from(value: string): BN | null {
    return value ? new BN(value, 10) : null
  }
}
