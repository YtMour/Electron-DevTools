// TOML 示例数据
export const tomlExample = `# TOML 示例文件
title = "TOML 示例"
subtitle = "通用配置文件格式"

[owner]
name = "Tom Preston-Werner"
organization = "GitHub"
bio = """
GitHub 联合创始人 & CEO
Gravatar 发明者
等等
"""
dob = 1979-05-27T07:32:00Z # 第一类日期时间

[database]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5000
enabled = true

[servers]

  # 缩进（制表符和/或空格）是允许的但不是必要的
  [servers.alpha]
  ip = "10.0.0.1"
  dc = "eqdc10"

  [servers.beta]
  ip = "10.0.0.2"
  dc = "eqdc10"
  country = "中国"

[clients]
data = [ ["gamma", "delta"], [1, 2] ]

# 数组中的换行符可以在相同的行中
hosts = [
  "alpha",
  "omega"
]

# 产品介绍
[[products]]
name = "锤子"
sku = 738594937

[[products]]  # 数组中的空白符是可以的
name = "钉子"
sku = 284758393

color = "灰色"
`

// 压缩后的 TOML 示例
export const compressedTomlExample = `title="TOML 示例"subtitle="通用配置文件格式"[owner]name="Tom Preston-Werner"organization="GitHub"bio="""GitHub 联合创始人 & CEO\nGravatar 发明者\n等等\n"""dob=1979-05-27T07:32:00Z[database]server="192.168.1.1"ports=[8001,8001,8002]connection_max=5000enabled=true[servers][servers.alpha]ip="10.0.0.1"dc="eqdc10"[servers.beta]ip="10.0.0.2"dc="eqdc10"country="中国"[clients]data=[["gamma","delta"],[1,2]]hosts=["alpha","omega"][[products]]name="锤子"sku=738594937[[products]]name="钉子"sku=284758393color="灰色"`

// JSON 示例 (用于 TOML 转换)
export const jsonForTomlExample = {
  title: "TOML 示例",
  subtitle: "通用配置文件格式",
  owner: {
    name: "Tom Preston-Werner",
    organization: "GitHub",
    bio: "GitHub 联合创始人 & CEO\nGravatar 发明者\n等等",
    dob: "1979-05-27T07:32:00Z"
  },
  database: {
    server: "192.168.1.1",
    ports: [8001, 8001, 8002],
    connection_max: 5000,
    enabled: true
  },
  servers: {
    alpha: {
      ip: "10.0.0.1",
      dc: "eqdc10"
    },
    beta: {
      ip: "10.0.0.2",
      dc: "eqdc10",
      country: "中国"
    }
  },
  clients: {
    data: [["gamma", "delta"], [1, 2]],
    hosts: ["alpha", "omega"]
  },
  products: [
    {
      name: "锤子",
      sku: 738594937
    },
    {
      name: "钉子",
      sku: 284758393,
      color: "灰色"
    }
  ]
}

// YAML 示例 (用于 TOML 转换)
export const yamlForTomlExample = `title: TOML 示例
subtitle: 通用配置文件格式
owner:
  name: Tom Preston-Werner
  organization: GitHub
  bio: |-
    GitHub 联合创始人 & CEO
    Gravatar 发明者
    等等
  dob: 1979-05-27T07:32:00Z
database:
  server: 192.168.1.1
  ports:
    - 8001
    - 8001
    - 8002
  connection_max: 5000
  enabled: true
servers:
  alpha:
    ip: 10.0.0.1
    dc: eqdc10
  beta:
    ip: 10.0.0.2
    dc: eqdc10
    country: 中国
clients:
  data:
    - - gamma
      - delta
    - - 1
      - 2
  hosts:
    - alpha
    - omega
products:
  - name: 锤子
    sku: 738594937
  - name: 钉子
    sku: 284758393
    color: 灰色` 