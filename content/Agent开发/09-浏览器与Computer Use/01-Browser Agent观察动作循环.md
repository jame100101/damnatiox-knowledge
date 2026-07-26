# Browser Agent 的观察—动作循环

Browser Agent 与普通 API Tool 的差别在于：网页是动态、部分可观察、受异步加载影响的环境。动作通常依赖当前 DOM、视觉状态、URL、frame 和登录状态。

## 1. 观察

可用观察包括：

- URL、标题和导航历史；
- DOM/可访问性树；
- 可交互元素及稳定定位；
- 截图；
- 网络/控制台错误；
- frame、dialog、下载；
- 上一步动作结果。

不要每轮把完整 HTML 塞给模型。先提取可交互节点、相关文本和页面状态摘要，需要视觉判断时再加入截图。

## 2. 动作空间

- navigate；
- click；
- fill/type；
- select；
- scroll；
- hover；
- upload/download；
- wait；
- extract；
- screenshot；
- back/forward。

每个动作要返回结构化结果：目标 locator、动作前后 URL、页面变化、错误和截图/DOM 证据。

## 3. 定位策略

优先顺序：

1. role + accessible name；
2. label；
3. stable test id；
4. 文本；
5. CSS/XPath 作为最后选择。

记录候选数量，避免 locator 模糊时点击第一个。页面变化后重新观察，不复用失效 element handle。

## 4. 动作验证

点击成功不等于目标完成。根据动作验证：

- URL 或路由变化；
- 目标元素出现；
- 表单字段值；
- toast/状态文本；
- 网络响应；
- 文件下载存在；
- 后端状态查询。

## 5. 动态页面

避免固定 `sleep(5000)`；使用条件等待：

- DOMContentLoaded/networkidle 适用时；
- 元素可见且 enabled；
- 响应完成；
- 特定状态文本；
- 动画结束。

对 SPA，URL 不变也可能页面状态改变，应联合 DOM 与应用状态判断。
