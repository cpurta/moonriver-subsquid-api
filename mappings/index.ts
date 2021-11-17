import BN from 'bn.js'
import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common'
import { TokenBurn, TokenMint } from '../generated/model'
import { Balances } from '../chain'

const zeroAddress = '0x0000000000000000000000000000000000000000'

export async function balancesTransfer({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {

  const [from, to, value] = new Balances.TransferEvent(event).params
  const tip = extrinsic ? new BN(extrinsic.tip.toString(10)) : new BN(0)

  if (to.toHex() === zeroAddress) {
    const tokenBurn = await getOrCreate(store, TokenBurn, from.toHex())
    tokenBurn.account = from.toHuman()
    tokenBurn.amount = value
    tokenBurn.timestamp = new BN(block.timestamp)
    await store.save(tokenBurn)
  }

  if (from.toHex() === zeroAddress) {
    const tokenMint = await getOrCreate(store, TokenMint, to.toHex())
    tokenMint.account = to.toHuman()
    tokenMint.amount = value
    tokenMint.timestamp = new BN(block.timestamp)
    await store.save(tokenMint)
  }
}


async function getOrCreate<T extends {id: string}>(
  store: DatabaseManager,
  entityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {

  let e = await store.get(entityConstructor, {
    where: { id },
  })

  if (e == null) {
    e = new entityConstructor()
    e.id = id
  }

  return e
}


type EntityConstructor<T> = {
  new (...args: any[]): T
}