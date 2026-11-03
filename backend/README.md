# 暖萌学生记账本后端

基于 Spring Boot 2.7、MyBatis-Plus 3.5 和 MySQL 的学生记账 REST API。

## 技术栈

- Java 8+
- Spring Boot 2.7.18
- MyBatis-Plus 3.5.5
- MySQL 8+
- Bean Validation
- H2（仅集成测试）

## 启动

1. 创建数据库和表：

```bash
mysql -uroot -p < sql/schema.sql
mysql -uroot -p < sql/sample-data.sql
```

2. 按实际数据库账号启动：

```powershell
notepad src/main/resources/application-local.yml
mvn spring-boot:run
```

默认地址：`http://localhost:8080`

项目默认启用 `local` Profile。打开 `application-local.yml`，
把 `password: ""` 修改成你的本地 MySQL 密码即可。该文件已经加入
`.gitignore`，不会被提交到 Git。

也可以在 `backend` 目录直接运行 [run-local.cmd](run-local.cmd)，
或者双击 IntelliJ 提供的 `暖萌账本后端 (Maven)` 运行配置。
不要使用普通 `Application` 配置运行 `WarmLedgerApplication`，
否则 IDE 未导入 Maven 依赖时会提示“程序包不存在”。

也可以先打包再运行：

```powershell
mvn package
java -jar target/warm-ledger-backend-1.0.0.jar
```

其他可用环境变量：

- `DB_URL`：JDBC 地址
- `DB_USERNAME`：MySQL 用户名
- `DB_PASSWORD`：MySQL 密码
- `SERVER_PORT`：服务端口

## 统一响应

成功：

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2026-10-30T12:00:00Z"
}
```

失败时 HTTP 状态码和 `code` 保持一致：

```json
{
  "code": 400,
  "message": "分类与收支类型不匹配",
  "data": null,
  "timestamp": "2026-10-30T12:00:00Z"
}
```

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/bills` | 新增账单 |
| GET | `/api/bills/{id}` | 查询账单详情 |
| GET | `/api/bills?month=2026-10&page=1&size=20` | 分页查询账单 |
| PUT | `/api/bills/{id}` | 修改账单 |
| DELETE | `/api/bills/{id}` | 逻辑删除账单 |
| GET | `/api/statistics/monthly?month=2026-10` | 当月收支汇总 |
| GET | `/api/statistics/categories?month=2026-10&type=expense` | 分类统计 |
| GET | `/api/statistics/overview?month=2026-10` | 首页聚合数据 |
| GET | `/api/categories?type=expense` | 获取分类配置 |

新增和修改请求：

```json
{
  "type": "expense",
  "category": "餐饮",
  "amount": 18.5,
  "date": "2026-10-30",
  "time": "12:30",
  "note": "午餐"
}
```

`type` 支持 `expense` 和 `income`。`time` 和 `note` 可以省略。

## 小程序 Axios 示例

```javascript
import axios from 'axios-miniprogram'

const http = axios.create({
  baseURL: 'http://127.0.0.1:8080/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body.code !== 200) {
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return body.data
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  },
)

export const getOverview = (month) =>
  http.get('/statistics/overview', { params: { month } })

export const createBill = (bill) => http.post('/bills', bill)
```

后端已配置 `/api/**` 的 CORS 和 `OPTIONS` 预检请求。正式发布小程序时，请将 `baseURL` 换成已在小程序后台配置的 HTTPS 合法域名。

## 测试

```bash
mvn test
```

测试使用 H2 内存数据库，不会修改本地 MySQL 数据。
