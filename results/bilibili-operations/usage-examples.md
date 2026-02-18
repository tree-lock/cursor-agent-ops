---
title: B站操作使用示例（精简）
---

# B站操作使用示例（精简版）

为了避免文档里出现大量不可直接复用的代码片段，这里只保留**可复制的流程**。具体实现请参考：

- `quick-reference.md`（最推荐）
- `bilibili-operations-template.js`（可复用模板）

## 示例 1：验证页面跳转（避免重复打开）

- click 链接
- `sleep(2-3)`
- `list_pages()` 查是否开了新标签页
- 若无新页：`evaluate_script(() => window.location.href)` 检查当前 URL
- 仍未跳转：再等 1-2 秒；`new_page` 仅最后手段

## 示例 2：点赞（含验证）

- `take_snapshot({verbose:true})`
- 搜索 `"点赞（Q）"` 找到 uid
- click → `sleep(1-2)`
- `take_snapshot()` 对比点赞状态（数值/按钮状态）

## 示例 3：收藏到指定文件夹（含验证）

- `take_snapshot({verbose:true})`
- 搜索 `"收藏（E）"` 找到 uid
- click → `sleep(2)` 等对话框
- 在对话框快照里搜索文件夹名（如“学习”）并点击
- `sleep(1)` → 确认按钮可用 → 点击确定
- `sleep(1-2)` → `take_snapshot()` 验证对话框关闭

// 步骤 3: 点击收藏按钮
click({uid: "9_461"});

// 步骤 4: 等待对话框打开
sleep(2);

// 步骤 5: 获取对话框快照
take_snapshot({verbose: true});

// 步骤 6: 查找"学习"文件夹
// grep: "学习"
// 找到 listitem: uid = "11_1519"

// 步骤 7: 点击文件夹
click({uid: "11_1519"});

// 步骤 8: 等待选择
sleep(1);

// 步骤 9: 检查确定按钮是否可用
take_snapshot();
// grep: "确定"
// 检查是否 disabled

// 步骤 10: 点击确定按钮
click({uid: "10_27"});

// 步骤 11: 等待操作完成
sleep(2);

// 步骤 12: 验证对话框是否关闭
take_snapshot();
// 检查是否还有 "添加到收藏夹" 文本
```

## 示例 5：使用 Python 解析快照文件

```bash
# 解析快照文件，查找点赞按钮
python results/snapshot-parser.py snapshot.txt "点赞"

# 输出示例：
# 找到 3 个匹配元素:
#   uid=6_457, type=generic, text=点赞（Q）
#   uid=5_76, type=StaticText, text=1.4万
#   ...
```

## 最佳实践

### 1. 元素查找优先级

1. **优先使用快照 + grep**：最可靠的方法
2. **辅助函数作为补充**：用于复杂查找或验证
3. **避免依赖固定 uid**：每次操作前重新获取快照

### 2. 页面跳转验证流程

```
点击链接
  ↓
sleep(2-3)  ← 必须等待！
  ↓
list_pages()  ← 检查新页面
  ↓
如果有新页面 → select_page(新页面) → 继续操作
  ↓
如果没有新页面 → evaluate_script(检查URL)
  ↓
如果 URL 已变化 → 继续操作
  ↓
如果 URL 未变化 → sleep(2) → 再次检查
  ↓
如果仍未变化 → new_page(最后手段)
```

### 3. 操作验证

- **点赞**：检查数字变化（如 "1.4万" → "1.5万"）
- **收藏**：检查对话框是否关闭（更可靠）
- **页面跳转**：检查 URL 和页面标题

### 4. 错误处理

```javascript
// 操作失败时的处理流程
try {
  click({uid: "element_uid"});
  sleep(1.5);
  const verify = take_snapshot();
  // 验证操作是否成功
  if (!verify.success) {
    // 重新获取快照
    take_snapshot({verbose: true});
    // 重新查找元素
    // 重试操作
  }
} catch (error) {
  // 记录错误
  // 重新获取快照
  // 尝试恢复
}
```

## 性能优化建议

1. **快照使用**：
   - 普通快照用于简单查找
   - Verbose 模式用于复杂结构（较慢）

2. **等待时间**：
   - 页面跳转：2-3 秒
   - 对话框打开：2 秒
   - 操作响应：1-1.5 秒

3. **批量操作**：
   - 独立操作可以并行执行
   - 相互依赖的操作必须顺序执行

## 常见问题

### Q: 为什么不能直接使用辅助函数点击元素？

A: MCP 工具的 `evaluate_script` 只能返回 JSON 可序列化的值，不能直接操作 DOM。需要通过返回的 uid 使用 `click` 工具。

### Q: 如何加载外部 JavaScript 文件？

A: 目前 MCP 工具不支持直接加载外部文件。需要将函数代码作为字符串传递给 `evaluate_script`。

### Q: 辅助函数和快照方法哪个更好？

A: 两者结合使用最好：
- 快照方法：最可靠，用于查找元素 uid
- 辅助函数：用于验证、检查状态等
