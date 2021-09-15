// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema



const validator = {
	"book_id": {
		"rules": [{
				"required": true
			},
			{
				"format": "string"
			}
		],
		"label": "图书id"
	},
	"book_name": {
		"rules": [{
				"required": true
			},
			{
				"format": "string"
			}
		],
		"label": "图书名"
	},
	"author": {
		"rules": [{
			"format": "string"
		}],
		"label": "作者"
	},
	"publisher": {
		"rules": [{
			"format": "string"
		}],
		"label": "出版社"
	},
	"price": {
		"rules": [{
			"format": "int"
		}],
		"label": "价格"
	},
	"type": {
		"rules": [{
			"format": "string"
		}],
		"label": "类型"
	},
	"introduction": {
		"rules": [{
			"format": "string"
		}],
		"label": "简介"
	},
	"has_num": {
		"rules": [{
				"required": true
			},
			{
				"format": "int"
			},
			{
				"minimum": 1
			}
		],
		"label": "馆藏数"
	},
	"lend_num": {
		"rules": [{
			"format": "int"
		}, {
			"minimum": 0
		}],
		"label": "借出数"
	},
	"lend_total": {
		"rules": [{
			"format": "int"
		}],
		"label": "总借阅数"
	}
}

const enumConverter = {}

export {
	validator,
	enumConverter
}
