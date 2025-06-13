import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WhoisInfo from '@/views/network/unified-lookup/whois-info.vue'
import type { WhoisInfo as WhoisInfoType } from '@/utils/network/domain-info'

// Mock Element Plus components
const mockComponents = {
  'el-empty': { template: '<div class="el-empty"><slot /></div>' },
  'el-icon': { template: '<span class="el-icon"><slot /></span>' },
  'el-tag': { template: '<span class="el-tag"><slot /></span>' },
  'el-button': { template: '<button class="el-button"><slot /></button>' },
  'el-alert': { template: '<div class="el-alert"><slot /></div>' }
}

const mockWhoisData: WhoisInfoType = {
  domainName: 'example.com',
  registrar: 'Example Registrar',
  creationDate: '2020-01-01T00:00:00Z',
  expirationDate: '2025-01-01T00:00:00Z',
  updatedDate: '2023-01-01T00:00:00Z',
  whoisServer: 'whois.example.com',
  status: ['clientTransferProhibited', 'clientUpdateProhibited'],
  nameServers: ['ns1.example.com', 'ns2.example.com'],
  registrantName: 'John Doe',
  registrantOrganization: 'Example Corp',
  registrantEmail: 'john@example.com'
}

describe('WhoisInfo Component', () => {
  it('renders empty state when no whois data provided', () => {
    const wrapper = mount(WhoisInfo, {
      props: { whois: undefined },
      global: {
        components: mockComponents
      }
    })

    expect(wrapper.find('.el-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('未找到 Whois 信息')
  })

  it('renders whois data correctly', () => {
    const wrapper = mount(WhoisInfo, {
      props: { whois: mockWhoisData },
      global: {
        components: mockComponents
      }
    })

    expect(wrapper.find('.whois-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('example.com')
    expect(wrapper.text()).toContain('Example Registrar')
  })

  it('displays domain status correctly', () => {
    const wrapper = mount(WhoisInfo, {
      props: { whois: mockWhoisData },
      global: {
        components: mockComponents
      }
    })

    const statusSection = wrapper.find('.status-tags')
    expect(statusSection.exists()).toBe(true)
    expect(wrapper.text()).toContain('TransferProhibited')
    expect(wrapper.text()).toContain('UpdateProhibited')
  })

  it('displays nameservers correctly', () => {
    const wrapper = mount(WhoisInfo, {
      props: { whois: mockWhoisData },
      global: {
        components: mockComponents
      }
    })

    expect(wrapper.text()).toContain('ns1.example.com')
    expect(wrapper.text()).toContain('ns2.example.com')
  })

  it('shows registrant information when available', () => {
    const wrapper = mount(WhoisInfo, {
      props: { whois: mockWhoisData },
      global: {
        components: mockComponents
      }
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('Example Corp')
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('detects expired domains', () => {
    const expiredWhois = {
      ...mockWhoisData,
      expirationDate: '2020-01-01T00:00:00Z' // Past date
    }

    const wrapper = mount(WhoisInfo, {
      props: { whois: expiredWhois },
      global: {
        components: mockComponents
      }
    })

    expect(wrapper.text()).toContain('已过期')
  })

  it('detects expiring soon domains', () => {
    const expiringSoonDate = new Date()
    expiringSoonDate.setDate(expiringSoonDate.getDate() + 15) // 15 days from now

    const expiringSoonWhois = {
      ...mockWhoisData,
      expirationDate: expiringSoonDate.toISOString()
    }

    const wrapper = mount(WhoisInfo, {
      props: { whois: expiringSoonWhois },
      global: {
        components: mockComponents
      }
    })

    expect(wrapper.text()).toContain('即将过期')
  })

  it('detects privacy protected information', () => {
    const privacyProtectedWhois = {
      ...mockWhoisData,
      registrantEmail: 'privacy@whoisguard.com'
    }

    const wrapper = mount(WhoisInfo, {
      props: { whois: privacyProtectedWhois },
      global: {
        components: mockComponents
      }
    })

    expect(wrapper.text()).toContain('隐私保护')
  })

  it('handles missing optional fields gracefully', () => {
    const minimalWhois: WhoisInfoType = {
      domainName: 'minimal.com'
    }

    const wrapper = mount(WhoisInfo, {
      props: { whois: minimalWhois },
      global: {
        components: mockComponents
      }
    })

    expect(wrapper.find('.whois-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('minimal.com')
    // Should not crash with missing fields
  })
})
