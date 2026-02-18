# B站操作辅助代码库

这是一个独立的 B站操作辅助代码库，包含用于 B站操作的辅助函数、工具和文档。

## 📁 文件结构

```
bilibili-operations/
├── README.md                          # 本文件，使用说明
├── bilibili-helpers.js                # 基础辅助函数集合
├── bilibili-page-navigation.js        # 页面跳转验证辅助函数
├── bilibili-operations-template.js    # 完整操作模板脚本
├── snapshot-parser.py                 # 快照文件解析工具（Python）
├── usage-examples.md                  # 使用示例文档
└── quick-reference.md                 # 快速参考手册
```

## 🎯 用途

这些代码和工具用于：
- 通过 MCP 工具的 `evaluate_script` 调用，辅助浏览器自动化操作
- 快速查找页面元素（点赞按钮、收藏按钮等）
- 验证页面跳转，避免重复打开页面
- 执行完整的操作流程（点赞、收藏等）
- 解析快照文件，快速定位元素

## 🚀 快速开始（精简版）

### 推荐阅读顺序

1. `quick-reference.md`：一页速查（流程/等待时间/定位技巧）
2. `usage-examples.md`：完整示例（按步骤走）
3. `bilibili-operations-template.js`：可复用操作模板

### 核心思路

- **跳转验证**：点击链接后先 `sleep(2-3)`，再 `list_pages` / `evaluate_script`，`new_page` 仅最后手段  
- **定位元素**：先 `take_snapshot`，再按描述/文本搜索（如 `"点赞（Q）"`, `"收藏（E）"`）  
- **操作必验证**：操作后等待 1-2 秒，再快照对比状态变化

### 4. 快照解析工具

**文件**：`snapshot-parser.py`

**使用方法**：
```bash
# 解析快照文件
python snapshot-parser.py snapshot.txt

# 搜索特定文本
python snapshot-parser.py snapshot.txt "点赞"

# 查找点赞按钮
python snapshot-parser.py snapshot.txt | grep "点赞按钮"
```

## 📖 详细文档

- **使用示例**：查看 `usage-examples.md` 了解详细的使用示例
- **快速参考**：查看 `quick-reference.md` 获取快速参考信息

## 🔧 集成到 MCP 工具

这些函数可以通过 Chrome DevTools MCP 的 `evaluate_script` 工具调用：

```javascript
call_mcp_tool({
  server: "user-chrome-devtools",
  toolName: "evaluate_script",
  arguments: {
    function: "function() { /* 函数代码 */ }",
    args: []
  }
})
```

## ⚠️ 注意事项

1. **函数代码注入**：使用 `evaluate_script` 时，需要将函数代码作为字符串传递
2. **返回值限制**：`evaluate_script` 只能返回 JSON 可序列化的值
3. **异步操作**：某些操作（如等待元素）可能需要多次调用
4. **错误处理**：函数应该返回包含 `success` 字段的对象，便于判断操作是否成功

## 🎓 使用场景

### 场景 1：快速查找元素
```javascript
// 查找点赞按钮
const likeBtn = evaluate_script({
  function: findLikeButton,
  args: []
});

if (likeBtn && likeBtn.element) {
  // 使用快照中的 uid 进行操作
  click({uid: likeBtn.element.uid});
}
```

### 场景 2：验证页面跳转（避免重复打开）
```javascript
// 点击链接后验证跳转
click({uid: "2_24"}); // 点击视频链接
sleep(3);

const result = evaluate_script({
  function: verifyPageNavigation,
  args: ["BV1WBG9zgECp"]
});

if (result.needsNewPage) {
  // 使用 new_page 作为备用方案
  new_page({url: "https://www.bilibili.com/video/BV1WBG9zgECp"});
}
```

### 场景 3：执行完整操作
```javascript
// 执行点赞操作
const likeResult = evaluate_script({
  function: performLikeOperation,
  args: []
});

if (likeResult.success) {
  sleep(1.5);
  // 验证点赞是否成功
  const verifyResult = evaluate_script({
    function: verifyLikeSuccess,
    args: [likeResult.previousCount]
  });
}
```

## 📝 最佳实践

1. **元素查找优先级**：
   - 优先使用快照 + grep（最可靠）
   - 辅助函数作为补充（用于复杂查找或验证）
   - 避免依赖固定 uid（每次操作前重新获取快照）

2. **页面跳转验证流程**：
   ```
   点击链接 → sleep(2-3) → list_pages() → 检查新页面
   → 如果有新页面：select_page(新页面)
   → 如果没有新页面：evaluate_script(检查URL)
   → 如果 URL 已变化：继续操作
   → 如果 URL 未变化：sleep(2) → 再次检查
   → 如果仍未变化：new_page(最后手段)
   ```

3. **操作验证**：
   - 点赞：检查数字变化（如 "1.4万" → "1.5万"）
   - 收藏：检查对话框是否关闭（更可靠）
   - 页面跳转：检查 URL 和页面标题

## 🔄 更新日志

- **2025-02-18**: 初始版本
  - 创建基础辅助函数
  - 添加页面跳转验证功能
  - 添加完整操作模板
  - 创建快照解析工具
  - 添加使用文档和示例

## 📚 相关文档

- **操作规则**：`.cursor/rules/operations/bilibili-operations.mdc` - 包含操作最佳实践和常见问题解决方案，**执行操作前请先参考此规则文件**
- **操作总结**：`docs/bilibili-operation-summary.md` - 详细的操作记录和问题分析

## 🔗 与规则文件的关联

本代码库与 `.cursor/rules/operations/bilibili-operations.mdc` 规则文件配合使用：

- **规则文件**：提供操作流程、最佳实践、问题解决方案和注意事项
- **本代码库**：提供可直接使用的代码函数和工具，加速操作执行

**建议工作流程**：
1. 先阅读规则文件了解操作流程和注意事项
2. 参考本代码库中的函数和模板
3. 使用 `evaluate_script` 调用相关函数执行操作

## 💡 扩展建议

1. **添加更多操作**：如关注、投币、分享等
2. **错误处理增强**：添加更详细的错误信息和恢复机制
3. **性能优化**：缓存常用元素，减少 DOM 查询
4. **类型定义**：添加 TypeScript 类型定义文件
