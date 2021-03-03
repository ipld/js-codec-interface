'use strict'
/* globals it */
const _codec = require('../')
const CID = require('cids')
const assert = require('assert')
const { Buffer } = require('buffer')
const { expect } = require('aegir/utils/chai')

const test = it

/* very bad dag codec for testing */
const encode = obj => {
  for (const key of Object.keys(obj)) {
    if (key.startsWith('link:')) {
      obj[key] = obj[key].toBaseEncodedString()
    }
  }
  const str = JSON.stringify(obj)
  return Buffer.from(str)
}
const decode = buffer => {
  const obj = JSON.parse(buffer.toString())
  for (const key of Object.keys(obj)) {
    if (key.startsWith('link:')) {
      obj[key] = new CID(obj[key])
    }
  }
  return obj
}

const create = () => _codec.create(encode, decode, 'terrible-dag')

test('test create', () => {
  create()
})

test('test encode/decode', () => {
  const codec = create()
  const buffer = codec.encode({ hello: 'world' })
  const obj = codec.decode(buffer)
  expect(obj).to.deep.equal({ hello: 'world' })
})

test('test codec property', () => {
  const codec = create()
  expect(codec).to.have.property('codec', 'terrible-dag')
  let threw = false
  try {
    codec.codec = 'blah'
  } catch (e) {
    expect(e).to.have.property('message', 'Read-only property')
    threw = true
  }
  assert(threw)
})
