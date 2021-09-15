
// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema



const validator = {
  "book_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ]
  },
  "book_name": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "lend_uid": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ]
  },
  "lend_user": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "end_date": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "timestamp"
      }
    ]
  },
  "status": {
    "rules": [
      {
        "format": "bool"
      }
    ]
  }
}

const enumConverter = {}

export { validator, enumConverter }
