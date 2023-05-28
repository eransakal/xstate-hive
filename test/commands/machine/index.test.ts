import {expect, test} from '@oclif/test'

describe('machine', () => {
  test
  .stdout()
  .command(['machine', 'create', './playground/tests', 'test'])
  .it('create a machine', ctx => {
    expect(ctx.stdout).to.contain('machine \'test\' created')
  })
})
