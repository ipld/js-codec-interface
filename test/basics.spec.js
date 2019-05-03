'use strict'
const _codec = require('../')
const CID = require('cids')
const { it } = require('mocha')
const assert = require('assert')
const tsame = require('tsame')

const same = (...args) => assert.ok(tsame(...args))
const test = it

/* very bad dag codec for testing */
const encode = async obj => {
  for (let key of Object.keys(obj)) {
    if (key.startsWith('link:')) {
      obj[key] = obj[key].toBaseEncodedString()
    }
  }
  let str = JSON.stringify(obj)
  return Buffer.from(str)
}
const decode = async buffer => {
  let obj = JSON.parse(buffer.toString())
  for (let key of Object.keys(obj)) {
    if (key.startsWith('link:')) {
      obj[key] = new CID(obj[key])
    }
  }
  return obj
}

const create = () => _codec.create(encode, decode, 'terrible-dag')

test('test create', async () => {
  create()
})

test('test encode/decode', async () => {
  let codec = create()
  let buffer = await codec.encode({ hello: 'world' })
  let obj = await codec.decode(buffer)
  same(obj, { hello: 'world' })
})

test('test codec property', async () => {
  let codec = create()
  same(codec.codec, 'terrible-dag')
  let threw = false
  try {
    codec.codec = 'blah'
  } catch (e) {
    same(e.message, 'Read-only property')
    threw = true
  }
  assert(threw)
})
