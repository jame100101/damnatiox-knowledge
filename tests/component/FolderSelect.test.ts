import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FolderSelect from '~/components/admin/FolderSelect.vue'
import { demoFolders } from '~/data/demo'

describe('FolderSelect', () => {
  it('renders full nested paths and emits selected id', async () => {
    const wrapper = mount(FolderSelect, {
      props: { modelValue: null, folders: demoFolders },
    })
    expect(wrapper.text()).toContain('Java 后端 / Spring / Spring Boot')
    await wrapper.find('select').setValue('f-spring-boot')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['f-spring-boot'])
  })

  it('excludes a folder and all cycle-producing descendants', () => {
    const wrapper = mount(FolderSelect, {
      props: {
        modelValue: null,
        folders: demoFolders,
        excludeId: 'f-java',
      },
    })
    expect(wrapper.text()).not.toContain('Spring Boot')
    expect(wrapper.text()).toContain('Agent 开发')
  })
})
