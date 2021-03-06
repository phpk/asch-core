const crypto = require('crypto')
const base58check = require('./base58check')

const NORMAL_PREFIX = 'A'
const CHAIN_PREFIX = 'C'
const GROUP_PREFIX = 'G'
const LOCK_PREFIX = 'L'
const CONTRACT_PREFIX = 'S'

const VALID_PREFIX = [
  NORMAL_PREFIX,
  CHAIN_PREFIX,
  GROUP_PREFIX,
  LOCK_PREFIX,
  CONTRACT_PREFIX,
]

const TYPE = {
  NONE: 0,
  NORMAL: 1,
  CHAIN: 2,
  GROUP: 3,
  LOCK: 4,
  CONTRACT: 5,
}

const PREFIX_MAP = {}
PREFIX_MAP[NORMAL_PREFIX] = TYPE.NORMAL
PREFIX_MAP[CHAIN_PREFIX] = TYPE.CHAIN
PREFIX_MAP[GROUP_PREFIX] = TYPE.GROUP
PREFIX_MAP[LOCK_PREFIX] = TYPE.LOCK
PREFIX_MAP[CONTRACT_PREFIX] = TYPE.CONTRACT

function generateRawBase58CheckAddress(hashes) {
  if (!hashes || !hashes.length) throw new Error('Invalid hashes')
  let h1 = null
  for (let h of hashes) {
    if (typeof h === 'string') {
      h = Buffer.from(h, 'hex')
    }
    h1 = crypto.createHash('sha256').update(h)
  }
  const h2 = crypto.createHash('ripemd160').update(h1.digest()).digest()
  return base58check.encode(h2)
}

module.exports = {
  TYPE,
  getType(address) {
    const prefix = address[0]
    if (PREFIX_MAP[prefix]) {
      return PREFIX_MAP[prefix]
    }
    return TYPE.NONE
  },
  isAddress(address) {
    if (typeof address !== 'string') {
      return false
    }
    if (!/^[0-9]{1,20}$/g.test(address)) {
      if (!base58check.decodeUnsafe(address.slice(1))) {
        return false
      }
      if (VALID_PREFIX.indexOf(address[0]) === -1) {
        return false
      }
    }
    return true
  },

  isBase58CheckAddress(address) {
    if (typeof address !== 'string') {
      return false
    }
    if (!base58check.decodeUnsafe(address.slice(1))) {
      return false
    }
    if (VALID_PREFIX.indexOf(address[0]) === -1) {
      return false
    }
    return true
  },

  isNormalAddress(address) {
    const result = (this.isBase58CheckAddress(address) && address[0] === NORMAL_PREFIX)
                  || (this.isBase58CheckAddress(address) && address[0] === LOCK_PREFIX)
    return result
  },

  isGroupAddress(address) {
    return this.isBase58CheckAddress(address) && address[0] === GROUP_PREFIX
  },

  isContractAddress(address) {
    return this.isBase58CheckAddress(address) && address[0] === CONTRACT_PREFIX
  },

  generateNormalAddress(publicKey) {
    return NORMAL_PREFIX + generateRawBase58CheckAddress([publicKey])
  },

  generateChainAddress(hash) {
    return CHAIN_PREFIX + generateRawBase58CheckAddress([hash])
  },

  generateGroupAddress(name) {
    const hash = crypto.createHash('sha256').update(name).digest()
    return GROUP_PREFIX + generateRawBase58CheckAddress([hash])
  },

  generateLockedAddress(address) {
    return `${LOCK_PREFIX}${address.slice(1, address.length)}`
  },

  generateContractAddress(info) {
    const hash = crypto.createHash('sha256').update(info).digest()
    return CONTRACT_PREFIX + generateRawBase58CheckAddress([hash])
  },
}
