# Playwright 可靠操作与失败恢复

## 1. 浏览器会话

明确 context、page、storage state 和下载目录。不同任务使用隔离 context；只有确实需要时加载已有登录状态。运行结束清理临时数据并保存必要证据。

## 2. 失败分类

- element_not_found；
- multiple_matches；
- not_visible/not_enabled；
- detached/stale；
- navigation_timeout；
- dialog_blocked；
- frame_not_found；
- auth_required；
- rate_limited；
- page_changed；
- download_failed。

不同错误使用不同恢复，而不是统一重试点击。

## 3. 恢复策略

- 重新抓取 DOM/截图；
- 关闭或处理弹窗；
- 切换 frame；
- 滚动到元素；
- 改用 role/label 定位；
- 等待明确条件；
- 回到已知 URL；
- 刷新后从检查点恢复；
- 页面结构变更时重新规划。

每次恢复有上限，并记录旧 locator、错误和新策略。

## 4. 副作用

表单提交、发布、删除、购买等动作在最后一步前分成：

```text
prepare -> preview -> confirm -> execute -> verify
```

执行前展示精确目标和参数；执行后通过页面与后端状态验证。重试提交按钮前先确认上一请求是否已经成功。

## 5. Playwright 示例

```python group=multi-cdba4d212afd label=Python
button = page.get_by_role("button", name="保存")
await expect(button).to_be_visible()
await expect(button).to_be_enabled()
await button.click()
await expect(page.get_by_text("保存成功")).to_be_visible()
```

```rust group=multi-cdba4d212afd label=Rust
let button = driver
    .query(By::XPath("//button[normalize-space()='保存']"))
    .first()
    .await?;
assert!(button.is_displayed().await?);
assert!(button.is_enabled().await?);
button.click().await?;
driver
    .query(By::XPath("//*[contains(text(),'保存成功')]"))
    .first()
    .await?;
```

```javascript group=multi-cdba4d212afd label=JavaScript
const button = page.getByRole('button', { name: '保存' })
await expect(button).toBeVisible()
await expect(button).toBeEnabled()
await button.click()
await expect(page.getByText('保存成功')).toBeVisible()
```

```typescript group=multi-cdba4d212afd label=TypeScript
const button = page.getByRole('button', { name: '保存' })
await expect(button).toBeVisible()
await expect(button).toBeEnabled()
await button.click()
await expect(page.getByText('保存成功')).toBeVisible()
```

实际 Harness 应把 locator、超时、截图和 trace 封装进工具，避免模型直接生成任意脚本。

## 6. 测试

- 元素名称相同的两个按钮；
- 迟到 3 秒的弹窗；
- iframe 表单；
- 点击后接口成功但 toast 丢失；
- 双击导致重复提交；
- 页面局部刷新；
- 下载文件名变化；
- 浏览器进程中断后恢复。
