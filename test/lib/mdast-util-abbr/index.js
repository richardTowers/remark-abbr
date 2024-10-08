import assert from 'node:assert/strict'
import test from 'node:test'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {
  micromarkAbbr as abbr,
  mdastUtilAbbrFromMarkdown as abbrFromMarkdown,
  mdastUtilAbbrToMarkdown as abbrToMarkdown,
} from '@richardtowers/remark-abbr'
import {removePosition} from 'unist-util-remove-position'

test('abbrFromMarkdown', async function (t) {
  await t.test('should support an abbreviation definition', async function () {
    const actual = fromMarkdown('*[HTML]: Hyper Text Markup Language', {
      extensions: [abbr],
      mdastExtensions: [abbrFromMarkdown()],
    })
    const expected = {
      type: 'root',
      children: [
        {
          type: 'abbrDefinition',
          identifier: 'HTML',
          value: 'Hyper Text Markup Language',
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 36, offset: 35},
          },
        },
      ],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 36, offset: 35},
      },
    }
    assert.deepEqual(actual, expected)
  })

  await t.test(
    'should support an abbreviation definition with a complex label',
    async function () {
      const actual = fromMarkdown(
        '*[MV(VSL) (E&W)]: Motor Vehicles (Variation of Speed Limits) (England & Wales) Regulations',
        {
          extensions: [abbr],
          mdastExtensions: [abbrFromMarkdown()],
        },
      )
      const expected = {
        type: 'root',
        children: [
          {
            type: 'abbrDefinition',
            identifier: 'MV(VSL) (E&W)',
            value:
              'Motor Vehicles (Variation of Speed Limits) (England & Wales) Regulations',
            position: {
              start: {line: 1, column: 1, offset: 0},
              end: {line: 1, column: 91, offset: 90},
            },
          },
        ],
        position: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 1, column: 91, offset: 90},
        },
      }
      assert.deepEqual(actual, expected)
    },
  )

  await t.test('should support abbreviation calls', async function () {
    const actual = fromMarkdown(
      'I like to use HTML because it is cool\n\n*[HTML]: Hyper Text Markup Language',
      {
        extensions: [abbr],
        mdastExtensions: [abbrFromMarkdown()],
      },
    )
    const expected = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'I like to use ',
              position: {
                start: {line: 1, column: 1, offset: 0},
                end: {line: 1, column: 15, offset: 14},
              },
            },
            {
              type: 'abbr',
              identifier: 'HTML',
              value: 'Hyper Text Markup Language',
              data: {
                hName: 'abbr',
                hProperties: {
                  title: 'Hyper Text Markup Language',
                },
                hChildren: [{type: 'text', value: 'HTML'}],
              },
              position: {
                start: {line: 1, column: 15, offset: 14},
                end: {line: 1, column: 19, offset: 18},
              },
            },
            {
              type: 'text',
              value: ' because it is cool',
              position: {
                start: {line: 1, column: 19, offset: 18},
                end: {line: 1, column: 38, offset: 37},
              },
            },
          ],
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 38, offset: 37},
          },
        },
        {
          type: 'abbrDefinition',
          identifier: 'HTML',
          value: 'Hyper Text Markup Language',
          position: {
            start: {line: 3, column: 1, offset: 39},
            end: {line: 3, column: 36, offset: 74},
          },
        },
      ],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 3, column: 36, offset: 74},
      },
    }
    assert.deepEqual(actual, expected)
  })

  await t.test(
    'should support abbreviation calls without positional information',
    async function () {
      const actual = fromMarkdown(
        'I like to use HTML because it is cool\n\n*[HTML]: Hyper Text Markup Language',
        {
          extensions: [abbr],
          mdastExtensions: [
            {
              transforms: [(tree) => removePosition(tree)],
            },
            abbrFromMarkdown(),
          ],
        },
      )
      const expected = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'I like to use ',
                position: undefined,
              },
              {
                type: 'abbr',
                identifier: 'HTML',
                value: 'Hyper Text Markup Language',
                data: {
                  hName: 'abbr',
                  hProperties: {
                    title: 'Hyper Text Markup Language',
                  },
                  hChildren: [{type: 'text', value: 'HTML'}],
                },
                position: undefined,
              },
              {
                type: 'text',
                value: ' because it is cool',
                position: undefined,
              },
            ],
            position: undefined,
          },
          {
            type: 'abbrDefinition',
            identifier: 'HTML',
            value: 'Hyper Text Markup Language',
            position: undefined,
          },
        ],
        position: undefined,
      }
      assert.deepEqual(actual, expected)
    },
  )

  await t.test(
    'should support abbreviation calls with duplicate labels - last label wins',
    async function () {
      const actual = fromMarkdown(
        'I like to use HTML because it is cool\n\n*[HTML]: Hootin Tootin Magic Lingo\n\n*[HTML]: Hyper Text Markup Language',
        {
          extensions: [abbr],
          mdastExtensions: [abbrFromMarkdown()],
        },
      )
      const expected = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'I like to use ',
                position: {
                  start: {line: 1, column: 1, offset: 0},
                  end: {line: 1, column: 15, offset: 14},
                },
              },
              {
                type: 'abbr',
                identifier: 'HTML',
                value: 'Hyper Text Markup Language',
                data: {
                  hName: 'abbr',
                  hProperties: {
                    title: 'Hyper Text Markup Language',
                  },
                  hChildren: [{type: 'text', value: 'HTML'}],
                },
                position: {
                  start: {line: 1, column: 15, offset: 14},
                  end: {line: 1, column: 19, offset: 18},
                },
              },
              {
                type: 'text',
                value: ' because it is cool',
                position: {
                  start: {line: 1, column: 19, offset: 18},
                  end: {line: 1, column: 38, offset: 37},
                },
              },
            ],
            position: {
              start: {line: 1, column: 1, offset: 0},
              end: {line: 1, column: 38, offset: 37},
            },
          },
          {
            type: 'abbrDefinition',
            identifier: 'HTML',
            value: 'Hootin Tootin Magic Lingo',
            position: {
              start: {line: 3, column: 1, offset: 39},
              end: {line: 3, column: 35, offset: 73},
            },
          },
          {
            type: 'abbrDefinition',
            identifier: 'HTML',
            value: 'Hyper Text Markup Language',
            position: {
              start: {line: 5, column: 1, offset: 75},
              end: {line: 5, column: 36, offset: 110},
            },
          },
        ],
        position: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 5, column: 36, offset: 110},
        },
      }
      assert.deepEqual(actual, expected)
    },
  )

  await t.test('should support rendering back to markdown', async function () {
    const originalMarkdown =
      'I like to use HTML because it is cool\n\n*[HTML]: Hootin Tootin Magic Lingo\n\n*[HTML]: Hyper Text Markup Language\n'

    const ast = fromMarkdown(originalMarkdown, {
      extensions: [abbr],
      mdastExtensions: [abbrFromMarkdown()],
    })
    const result = toMarkdown(ast, {
      extensions: [abbrToMarkdown()],
    })

    assert.equal(result, originalMarkdown)
  })
})
