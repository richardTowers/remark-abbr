import {preprocess, parse, postprocess, micromark} from 'micromark'

import assert from 'node:assert/strict'
import test from 'node:test'

import {abbr} from 'micromark-extension-abbr-definition-syntax'

await test('micromark-extension-abbr', async () => {
  await test('parses definitions', async () => {
    const input = `*[HTML]: Hyper Text Markup Language`
    const events = postprocess(
      parse({ extensions: [abbr] }).document().write(preprocess()(input, null, true))
    )
    const entry = events.find(event => event[0] === 'enter' && event[1].type === 'abbrDefinition')
    const exit  = events.find(event => event[0] === 'exit' && event[1].type === 'abbrDefinition')
    assert(entry)
    assert(exit)
  })
})
