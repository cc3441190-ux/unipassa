# 🚀 UniPass 部署指南

## ⚡ 快速部署 (5分钟)

### 第 1 步：环境配置（2 分钟）

1. **检查 `.env.local` 文件**
   ```bash
   # 确保包含以下变量：
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   OPENAI_API_KEY=xxx
   OPENAI_BASE_URL=https://api.deepseek.com/v1
   AI_MODEL=deepseek-chat
   ```

2. **验证 Supabase 连接**
   ```bash
   # 进入 Supabase 控制台，复制 Project URL 和 Anon Key
   # 保存到 .env.local
   ```

### 第 2 步：数据库迁移（2 分钟）

在 Supabase SQL Editor 中，按顺序执行以下文件：

1. **打开文件**: `supabase/sql/feeds_schema_upgrade.sql`
   - 点击 SQL Editor → 新建查询
   - 复制文件内容 → 粘贴 → 运行

2. **打开文件**: `supabase/sql/app_guest_data.sql`
   - 复制内容 → 粘贴 → 运行

3. **打开文件**: `supabase/sql/feeds_seed_cq_hz_sz_bj.sql`
   - 复制内容 → 粘贴 → 运行

4. **打开文件**: `supabase/sql/feeds_seed_bigtech_boost.sql`
   - 复制内容 → 粘贴 → 运行

### 第 3 步：项目启动（1 分钟）

```bash
# 安装依赖
npm install

# 运行开发服务
npm run dev

# 或构建生产版本
npm run build
npm start
```

### 第 4 步：验证（1 分钟）

打开浏览器访问 `http://localhost:3000`：
- [ ] 看到欢迎设置页面
- [ ] 进入主页后看到场景列表
- [ ] 切换到圈子标签，看到 feed 列表
- [ ] feed 下方有 AI 提示

---

## 📋 完整检查清单

### 部署前

- [ ] 克隆/下载项目到本地
- [ ] 复制 `.env.local.example` → `.env.local`
- [ ] 填入正确的 API Key 和 URL
- [ ] 运行 `npm install` 安装依赖

### 数据库迁移

- [ ] 执行 `feeds_schema_upgrade.sql`
  - [ ] 验证 feeds 表新增字段
  - [ ] 验证 feed_comments 表已创建
  - [ ] 验证 feed_likes 表已创建

- [ ] 执行 `app_guest_data.sql`
  - [ ] 验证 app_guest_data 表已创建

- [ ] 执行 `feeds_seed_cq_hz_sz_bj.sql`
  - [ ] 运行查询统计行数: `SELECT COUNT(*) FROM feeds WHERE city IS NOT NULL`
  - [ ] 验证至少 96 条数据

- [ ] 执行 `feeds_seed_bigtech_boost.sql`
  - [ ] 运行查询统计: `SELECT COUNT(*) FROM feeds WHERE company IS NOT NULL`
  - [ ] 验证公司相关数据已插入

### 应用启动

- [ ] `npm run dev` 启动成功，无错误
- [ ] 浏览器打开 http://localhost:3000
- [ ] 无任何 console 错误

### 功能验证

- [ ] 首次进入显示设置流程
- [ ] 填写信息后进入主页
- [ ] 主页显示场景列表
- [ ] 圈子显示 feed 列表
- [ ] 每条 feed 有 AI 提示
- [ ] 可以发布新 feed
- [ ] 可以点赞和评论

### 生产部署

- [ ] 运行 `npm run build`
- [ ] 构建成功，无错误
- [ ] 部署到 Vercel/自托管
- [ ] 配置生产环境变量
- [ ] 验证 API 端点可访问

---

## 🔧 故障排查

### 问题 1: "Cannot find module '@/lib/supabase'"

**症状**: 编译失败，模块导入错误  
**解决**:
```bash
# 清理和重装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2: "SUPABASE_URL is not set"

**症状**: 应用崩溃，环境变量错误  
**解决**:
1. 检查 `.env.local` 文件是否存在
2. 确保包含所有必需变量
3. 重启开发服务: `npm run dev`

### 问题 3: "Feed 列表为空"

**症状**: 圈子标签页没有内容  
**解决**:
1. 在 Supabase 验证种子数据是否插入
   ```sql
   SELECT COUNT(*) FROM feeds;
   ```
2. 如果为 0，执行 `feeds_seed_*.sql` 文件
3. 刷新页面

### 问题 4: "AI 功能不工作"

**症状**: AI 摘要显示默认文本，AI 聊天无响应  
**解决**:
1. 检查 `.env.local` 中的 API Key
2. 测试 API 连接:
   ```bash
   curl -X POST https://api.deepseek.com/v1/chat/completions \
     -H "Authorization: Bearer YOUR_KEY" \
     -H "Content-Type: application/json"
   ```
3. 检查 API 配额是否已用尽
4. 查看浏览器控制台的错误日志

### 问题 5: "部分功能在移动端不工作"

**症状**: 按钮无法点击，布局混乱  
**解决**:
1. 清除浏览器缓存
2. 禁用浏览器缓存后重新加载
3. 在手机上测试（Chrome DevTools 模拟可能不够准确）

### 问题 6: "Supabase 表权限错误 (42501)"

**症状**: 写入数据时报错 "permission denied"  
**解决**:
1. 检查 Supabase RLS 策略
2. 运行以下命令禁用 RLS (开发环境):
   ```sql
   ALTER TABLE app_guest_data DISABLE ROW LEVEL SECURITY;
   GRANT SELECT, INSERT, UPDATE, DELETE ON app_guest_data TO anon, authenticated;
   ```

---

## 🔐 安全建议

### 生产环境配置

1. **API Key 管理**
   - ✅ 不要在代码中硬编码 API Key
   - ✅ 使用环境变量 (`.env.local`, `.env.production`)
   - ✅ 定期轮换 API Key
   - ✅ 限制 API Key 的权限和使用量

2. **数据库安全**
   - ✅ 启用 Supabase RLS 策略
   - ✅ 为不同用户设置不同权限
   - ✅ 定期备份数据库
   - ✅ 监控异常活动

3. **API 速率限制**
   - ✅ 为 AI 调用设置速率限制
   - ✅ 监控 API 使用成本
   - ✅ 实施用户配额

---

## 📊 监控和维护

### 定期检查项目

```bash
# 每周
- 检查 Supabase 数据库连接
- 验证 AI API 额度
- 查看 server logs

# 每月
- 分析用户行为数据
- 优化数据库性能
- 更新依赖库
- 备份关键数据

# 每季度
- 性能审计
- 安全审查
- 功能评估
- 用户反馈分析
```

### 常用命令

```bash
# 查看日志
npm run dev -- --debug

# 检查依赖更新
npm outdated

# 安全审计
npm audit

# 性能分析
npm run build -- --analyze

# 执行测试
npm test
```

---

## 🎯 优化建议

### 性能优化
- 启用 CDN 加速
- 配置图片优化 (Next.js Image)
- 使用分析工具 (Vercel Analytics)
- 监控关键指标

### 成本优化
- 合理设置 Supabase 连接池
- 使用 API 缓存减少调用
- 监控 AI API 成本
- 考虑自托管 LLM

### 用户体验优化
- A/B 测试新功能
- 收集用户反馈
- 定期更新内容
- 优化冷启动体验

---

## 📞 获取帮助

### 常用资源

- **Supabase 文档**: https://supabase.com/docs
- **Next.js 文档**: https://nextjs.org/docs
- **DeepSeek API**: https://platform.deepseek.com
- **Vercel 部署**: https://vercel.com/docs

### 提交问题

遇到问题时，请收集以下信息：
1. 完整错误信息和堆栈跟踪
2. 重现问题的步骤
3. 浏览器和设备信息
4. 网络状态 (在线/离线)
5. 相关日志输出

---

**部署检查**: ✅ 已就绪  
**最后更新**: 2026-04-28  
**版本**: 1.0.0

祝部署顺利！🚀
