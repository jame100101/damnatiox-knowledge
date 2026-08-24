# 截图、DOM、动作日志与 Browser Agent 评测

## 1. 三类证据

- **截图**：保留视觉布局、弹窗、图标和画布状态；
- **DOM/可访问性树**：保留文本、角色、属性和可定位结构；
- **动作日志**：记录动作、参数、时间、结果和状态变化。

三者互补。只有截图难以自动检索，只有 DOM 又会丢失 canvas、视觉层级和遮挡。

## 2. 每步日志

```json
{
  "step": 7,
  "url_before": "...",
  "observation_ref": "dom-007",
  "screenshot_ref": "shot-007.png",
  "action": {
    "type": "click",
    "locator": { "role": "button", "name": "保存" }
  },
  "result": {
    "ok": true,
    "url_after": "...",
    "changed": ["toast:保存成功"]
  },
  "duration_ms": 432
}
```

## 3. 数据控制

- 截图前遮盖密码、支付和个人信息字段；
- 日志不保存 cookie、token；
- 下载文件按任务隔离；
- 证据设置保留期限；
- 外部网页内容作为不可信数据；
- 记录来源 URL 和抓取时间。

## 4. 评测维度

- task success；
- step efficiency；
- invalid action rate；
- recovery success；
- element grounding accuracy；
- side-effect correctness；
- evidence completeness；
- latency/cost；
- 页面变化鲁棒性。

固定 benchmark 应包含弹窗、延迟、同名元素、iframe、分页、表单验证和页面改版。

## 5. 视觉与 DOM 选择

- 语义表单优先 DOM/可访问性树；
- canvas、图表、远程桌面需要视觉；
- 复杂场景将截图与候选交互节点共同提供；
- 视觉模型选择动作后仍由运行时做坐标边界和页面状态验证。

## 参考资料

- [Playwright](https://playwright.dev/docs/intro)
- [WebArena](https://arxiv.org/abs/2307.13854)
- [VisualWebArena](https://arxiv.org/abs/2401.13649)
