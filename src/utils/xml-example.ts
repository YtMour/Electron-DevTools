/**
 * XML 示例数据 - 格式化版本
 */
export const xmlExample = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <person>
    <name>张三</name>
    <age>28</age>
    <isEmployed>true</isEmployed>
    <address>
      <city>北京</city>
      <district>朝阳区</district>
      <zipCode>100000</zipCode>
    </address>
    <skills>
      <skill>JavaScript</skill>
      <skill>TypeScript</skill>
      <skill>Vue</skill>
      <skill>React</skill>
    </skills>
    <education>
      <degree>
        <type>学士</type>
        <major>计算机科学</major>
        <university>北京大学</university>
        <year>2018</year>
      </degree>
      <degree>
        <type>硕士</type>
        <major>软件工程</major>
        <university>清华大学</university>
        <year>2021</year>
      </degree>
    </education>
    <contact>
      <email>zhangsan@example.com</email>
      <phone>13800138000</phone>
      <social>
        <weixin>zhangsan_wx</weixin>
        <weibo>zhangsan_wb</weibo>
      </social>
    </contact>
  </person>
  <company>
    <name>科技有限公司</name>
    <founded>2010</founded>
    <employees>100</employees>
    <departments>
      <department>研发</department>
      <department>设计</department>
      <department>市场</department>
      <department>销售</department>
      <department>人力资源</department>
    </departments>
    <location>
      <country>中国</country>
      <city>北京</city>
    </location>
  </company>
  <projects>
    <project>
      <id>1001</id>
      <name>网站重构</name>
      <status>进行中</status>
      <deadline>2023-12-31</deadline>
      <members>
        <member>张三</member>
        <member>李四</member>
        <member>王五</member>
      </members>
    </project>
    <project>
      <id>1002</id>
      <name>移动应用开发</name>
      <status>计划中</status>
      <deadline>2024-06-30</deadline>
      <members>
        <member>张三</member>
        <member>赵六</member>
      </members>
    </project>
  </projects>
  <metadata>
    <lastUpdated>2023-10-15T08:30:00Z</lastUpdated>
    <version>1.0.0</version>
    <author>系统管理员</author>
  </metadata>
</root>`;

/**
 * XML 示例数据 - 压缩版本
 */
export const compressedXmlExample = xmlExample.replace(/>\s+</g, '><').replace(/\s+</g, '<').replace(/>\s+/g, '>').trim();

/**
 * JSON 示例数据 - 用于XML转JSON示例
 */
export const jsonForXmlExample = {
  "root": {
    "person": {
      "name": "张三",
      "age": "28",
      "isEmployed": "true",
      "address": {
        "city": "北京",
        "district": "朝阳区",
        "zipCode": "100000"
      },
      "skills": {
        "skill": ["JavaScript", "TypeScript", "Vue", "React"]
      },
      "education": {
        "degree": [
          {
            "type": "学士",
            "major": "计算机科学",
            "university": "北京大学",
            "year": "2018"
          },
          {
            "type": "硕士",
            "major": "软件工程",
            "university": "清华大学",
            "year": "2021"
          }
        ]
      },
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
      "founded": "2010",
      "employees": "100",
      "departments": {
        "department": ["研发", "设计", "市场", "销售", "人力资源"]
      },
      "location": {
        "country": "中国",
        "city": "北京"
      }
    },
    "projects": {
      "project": [
        {
          "id": "1001",
          "name": "网站重构",
          "status": "进行中",
          "deadline": "2023-12-31",
          "members": {
            "member": ["张三", "李四", "王五"]
          }
        },
        {
          "id": "1002",
          "name": "移动应用开发",
          "status": "计划中",
          "deadline": "2024-06-30",
          "members": {
            "member": ["张三", "赵六"]
          }
        }
      ]
    },
    "metadata": {
      "lastUpdated": "2023-10-15T08:30:00Z",
      "version": "1.0.0",
      "author": "系统管理员"
    }
  }
}; 