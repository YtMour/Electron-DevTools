/**
 * TOML 示例数据 - 格式化版本
 */
export const tomlExample = `# 个人信息
[person]
name = "张三"
age = 28
isEmployed = true

# 地址信息
[person.address]
city = "北京"
district = "朝阳区"
zipCode = "100000"

# 技能列表
person.skills = ["JavaScript", "TypeScript", "Vue", "React"]

# 教育经历
[[person.education]]
degree = "学士"
major = "计算机科学"
university = "北京大学"
year = 2018

[[person.education]]
degree = "硕士"
major = "软件工程"
university = "清华大学"
year = 2021

# 联系方式
[person.contact]
email = "zhangsan@example.com"
phone = "13800138000"

[person.contact.social]
weixin = "zhangsan_wx"
weibo = "zhangsan_wb"

# 公司信息
[company]
name = "科技有限公司"
founded = 2010
employees = 100
departments = ["研发", "设计", "市场", "销售", "人力资源"]

[company.location]
country = "中国"
city = "北京"

# 项目信息
[[projects]]
id = 1001
name = "网站重构"
status = "进行中"
deadline = "2023-12-31"
members = ["张三", "李四", "王五"]

[[projects]]
id = 1002
name = "移动应用开发"
status = "计划中"
deadline = "2024-06-30"
members = ["张三", "赵六"]

# 元数据
[metadata]
lastUpdated = "2023-10-15T08:30:00Z"
version = "1.0.0"
author = "系统管理员"`;

/**
 * TOML 示例数据 - 压缩版本
 */
export const compressedTomlExample = tomlExample.replace(/\n\n/g, '\n').replace(/# .*\n/g, '');

/**
 * JSON 示例数据 - 用于TOML转JSON示例
 */
export const jsonForTomlExample = {
  "person": {
    "name": "张三",
    "age": 28,
    "isEmployed": true,
    "address": {
      "city": "北京",
      "district": "朝阳区",
      "zipCode": "100000"
    },
    "skills": ["JavaScript", "TypeScript", "Vue", "React"],
    "education": [
      {
        "degree": "学士",
        "major": "计算机科学",
        "university": "北京大学",
        "year": 2018
      },
      {
        "degree": "硕士",
        "major": "软件工程",
        "university": "清华大学",
        "year": 2021
      }
    ],
    "contact": {
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "social": {
        "weixin": "zhangsan_wx",
        "weibo": "zhangsan_wb"
      }
    }
  },
  "company": {
    "name": "科技有限公司",
    "founded": 2010,
    "employees": 100,
    "departments": ["研发", "设计", "市场", "销售", "人力资源"],
    "location": {
      "country": "中国",
      "city": "北京"
    }
  },
  "projects": [
    {
      "id": 1001,
      "name": "网站重构",
      "status": "进行中",
      "deadline": "2023-12-31",
      "members": ["张三", "李四", "王五"]
    },
    {
      "id": 1002,
      "name": "移动应用开发",
      "status": "计划中",
      "deadline": "2024-06-30",
      "members": ["张三", "赵六"]
    }
  ],
  "metadata": {
    "lastUpdated": "2023-10-15T08:30:00Z",
    "version": "1.0.0",
    "author": "系统管理员"
  }
};

/**
 * YAML 示例数据 - 用于TOML转YAML示例
 */
export const yamlForTomlExample = `person:
  name: 张三
  age: 28
  isEmployed: true
  address:
    city: 北京
    district: 朝阳区
    zipCode: '100000'
  skills:
    - JavaScript
    - TypeScript
    - Vue
    - React
  education:
    - degree: 学士
      major: 计算机科学
      university: 北京大学
      year: 2018
    - degree: 硕士
      major: 软件工程
      university: 清华大学
      year: 2021
  contact:
    email: zhangsan@example.com
    phone: '13800138000'
    social:
      weixin: zhangsan_wx
      weibo: zhangsan_wb

company:
  name: 科技有限公司
  founded: 2010
  employees: 100
  departments:
    - 研发
    - 设计
    - 市场
    - 销售
    - 人力资源
  location:
    country: 中国
    city: 北京

projects:
  - id: 1001
    name: 网站重构
    status: 进行中
    deadline: '2023-12-31'
    members:
      - 张三
      - 李四
      - 王五
  - id: 1002
    name: 移动应用开发
    status: 计划中
    deadline: '2024-06-30'
    members:
      - 张三
      - 赵六

metadata:
  lastUpdated: '2023-10-15T08:30:00Z'
  version: 1.0.0
  author: 系统管理员`; 