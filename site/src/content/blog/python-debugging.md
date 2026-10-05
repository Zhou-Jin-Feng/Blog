---
title: "Python 调试技巧：从错误现象到根因修复"
description: "以一个学生管理脚本为案例，整理可重复的排错流程、调试工具的选择、8 类典型 Bug 的根因与修复，以及防复发策略。"
publishDate: "2026-08-26"
tags: ["Python", "调试"]
aiAssisted: true
template: false
---

> 以 `student_manager.py` 为案例，保留最实用的调试方法、8 类典型 Bug、工具命令和防复发策略。

---

## 📌 阅读优先级

> 调试能力贯穿模型调用、异步任务、数据处理和线上排障。优先学习可重复的诊断流程，再补充具体工具。

| 标记 | 学习要求 | 常见使用位置 |
| --- | --- | --- |
| 🔥 重点掌握 | 能按步骤复现、定位、验证并补回归测试 | API 报错、模型输出异常、异步失败、数据边界问题 |
| 🧩 补充掌握 | 能按需选工具并识别 Python 常见陷阱 | 复杂回归、性能诊断、共享状态与日志治理 |
| 👀 了解即可 | 作为速查材料保留，需要时再翻阅 | 命令速查和案例附件 |

### 🔥 重点掌握

1. **证据驱动的调试流程（第 1～2 章）**：明确期望、最小复现、读 Traceback、验证假设、修根因和补测试。
2. **常用调试工具（第 3.1、3.2、3.4 节）**：短期验证用 `print()`，长期诊断用日志，复杂状态用断点。
3. **典型错误模式（第 4 章）**：重点学习空值、缺字段、重复键、排序方向和连锁失败背后的共性。
4. **复杂问题定位（第 6 章）**：二分定位、正常/异常对比和 `git bisect` 对回归问题很常用。
5. **异常、日志与检查清单（第 8～9 章）**：避免吞异常、滥用断言，并形成上线前自检习惯。

### 🧩 补充掌握

1. **变量、调用栈和异常速查（第 5 章）**：能提高现场排障速度。
2. **Python 常见陷阱（第 7 章）**：可变默认参数、浅拷贝、闭包晚绑定和真假值混淆很容易制造隐蔽问题。
3. **`pdb` 与性能分析（第 3.3、6.5 节）**：远程环境或性能瓶颈出现时再重点使用。
4. **一页速记（第 10 章）**：适合作为复习入口。

### 👀 了解即可

1. **附录案例代码**：知道位置即可，需要复现案例时再打开。

---

## 1. 调试的核心：用证据缩小问题范围 ★★★★★

> 🔥 **学习优先级：重点掌握**

调试不是“不断改代码直到能跑”，而是一个可验证的推理过程：

```text
明确期望
→ 稳定复现
→ 阅读错误与调用栈
→ 提出一个假设
→ 用最小实验验证
→ 修复根因
→ 增加回归测试
```

每次只验证一个假设。例如程序计算平均分时报错，不要同时修改文件读取、排序和异常处理；先确认参与除法的数据到底是什么。

### 1.1 科学方法与正确心态

可以把调试看成一次小型科学实验：

1. **观察现象**：记录输入、期望结果、实际结果和异常信息；
2. **提出假设**：把“可能有问题”改写成可验证的原因，例如“`scores` 为空”；
3. **设计实验**：只增加一条打印、一个断点或一个最小测试；
4. **收集证据**：运行实验，观察值、类型、长度和调用栈；
5. **分析结果**：判断假设成立还是被证伪；
6. **修复并验证**：修改根因，再运行失败样例和回归测试。

调试时要保持耐心和可重复性：相信错误信息提供的线索，不要一次改动很多地方，也不要因为“现在能跑了”就跳过测试。记录“现象、证据、结论”还能避免下一次重新走同一条弯路。

### 1.2 三类 Bug

| 类型 | 表现 | 优先线索 |
|---|---|---|
| 语法错误 | 程序无法启动，如缺少冒号、括号不匹配 | Python 指出的文件、行号和 `SyntaxError` |
| 运行时错误 | 执行途中抛出异常，如 `KeyError`、`TypeError` | Traceback 最后一行和最底部业务栈帧 |
| 逻辑错误 | 不报错但结果不符合预期，如排名方向相反 | 期望结果、实际结果和中间状态对比 |

### 1.3 最容易浪费时间的做法

- 一次修改很多地方，最后不知道哪项改动有效；
- 只看异常最后一句，不看调用栈；
- 用宽泛 `except Exception` 把系统错误伪装成正常结果；
- 看到空值就随意返回 `0`，混淆“没有数据”和“数据确实为零”；
- 修完当前样例却不补测试，导致问题再次出现。

---

## 2. 一套可重复使用的排错流程 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 第 1 步：写清楚期望和实际结果

不要只记录“程序坏了”，而要写成可比较的陈述：

```text
输入：一个尚未录入成绩的学生
期望：平均分显示“暂无成绩”
实际：抛出 ZeroDivisionError
```

### 第 2 步：创建最小复现

只保留触发问题所需的最少代码：

```python
def reproduce_empty_scores() -> None:
    student = Student("001", "测试学生", 18, "高一")
    print(student.get_average_score())


reproduce_empty_scores()
```

最小复现应当：

- 运行快；
- 结果稳定；
- 不依赖无关页面或操作步骤；
- 能在修复前失败、修复后通过。

### 第 3 步：从下往上读 Traceback

```text
Traceback (most recent call last):
  File "student_manager.py", line 196, in main
    avg = student.get_average_score()
  File "student_manager.py", line 29, in get_average_score
    average = total / len(self.scores)
ZeroDivisionError: division by zero
```

阅读顺序：

1. 最后一行：异常类型和直接原因；
2. 最靠近底部的业务代码：真正失败的位置；
3. 向上回溯：错误输入从哪个调用者传来。

这段 Traceback 已经告诉我们：`get_average_score()` 中的除数为零。下一步应检查 `self.scores`，而不是先改报告格式。

### 第 4 步：提出可证伪的假设

不好的假设：

> 平均分函数可能有问题。

更好的假设：

> `self.scores` 为空，导致 `len(self.scores) == 0`。

后者可以通过断点或一条打印立即验证。

### 第 5 步：选择最小工具验证

```python
print({
    "scores": self.scores,
    "count": len(self.scores),
})
```

如果问题涉及循环中某一个特定对象，则使用条件断点：

```python
len(self.scores) == 0
```

### 第 6 步：修复根因并明确函数契约

“无成绩”与“平均分为 0”不是同一个状态。更清晰的契约是返回 `None`：

```python
def get_average_score(self) -> float | None:
    """返回平均分；尚无成绩时返回 None。"""
    if not self.scores:
        return None
    return sum(self.scores.values()) / len(self.scores)
```

展示层再决定如何显示：

```python
average = student.get_average_score()
if average is None:
    print("平均分: 暂无成绩")
else:
    print(f"平均分: {average:.2f}")
```

### 第 7 步：增加回归测试

```python
def test_empty_scores_have_no_average() -> None:
    student = Student("001", "测试学生", 18, "高一")
    assert student.get_average_score() is None
```

测试不是修复后的附属品，而是“这个 Bug 不应再次出现”的可执行记录。

---

## 3. 调试工具怎么选 ★★★★★

> 🔥 **学习优先级：重点掌握**

| 场景 | 首选工具 | 原因 |
|---|---|---|
| 小函数、一次性确认变量 | `print()` / `repr()` | 快速直接 |
| 多模块或长期运行服务 | `logging` | 可分级、筛选、持久化 |
| 需要逐行观察状态变化 | `breakpoint()` / `pdb` | 可暂停、单步、查看栈 |
| 本地复杂对象和循环 | VSCode 调试器 | 变量面板、条件断点、调用栈更直观 |
| 只在异常发生后检查现场 | post-mortem 调试 | 直接停在失败现场 |
| 不知道哪个提交引入问题 | `git bisect` | 二分定位回归提交 |
| 代码慢但不报错 | `timeit` / profiler | 用数据定位瓶颈 |

### 3.1 `print()`：适合快速验证假设

```python
print(f"student_id={student_id!r}")
print(f"scores={scores!r}, type={type(scores).__name__}")
print(">>> entered calculate_class_average")
```

`!r` 使用 `repr()`，可以区分空字符串、空格、换行等不容易肉眼识别的值。

限制：大量 `print()` 难以筛选，也容易遗留在生产代码中。问题跨越多个请求或模块时，应切换到日志或调试器。

### 3.2 `logging`：适合可重复诊断

```python
import logging

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.DEBUG,
    format=(
        "%(asctime)s %(levelname)s "
        "%(name)s [%(filename)s:%(lineno)d] %(message)s"
    ),
)

logger.debug("calculating average: subject=%s", subject)
logger.info("student added: id=%s", student_id)
logger.warning("duplicate student: id=%s", student_id)
logger.exception("failed to load student data")
```

日志级别：

| 级别 | 用途 |
|---|---|
| `DEBUG` | 详细诊断信息，通常只在开发或排障时开启 |
| `INFO` | 正常的重要业务事件 |
| `WARNING` | 异常情况，但功能仍可继续 |
| `ERROR` | 当前功能失败 |
| `CRITICAL` | 系统级严重故障，可能无法继续服务 |

生产注意事项：

- 不记录密码、Token、完整隐私数据；
- 不用 f-string 提前拼接大量未启用的 DEBUG 日志；
- 避免重复添加 Handler，导致每条日志输出多次；
- Web 服务优先记录稳定字段，如 `request_id`、操作名、状态和耗时。

#### 同时写入文件和控制台

需要长期复现问题时，可以让详细日志写入文件，只把重要日志显示在控制台：

```python
logger = logging.getLogger("StudentManager")
logger.setLevel(logging.DEBUG)
logger.propagate = False

file_handler = logging.FileHandler(
    "student_manager.log",
    encoding="utf-8",
)
file_handler.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)

logger.debug("这条只写入文件")
logger.info("这条同时显示在控制台和文件")
```

如果初始化代码可能被执行多次，应先检查 `logger.handlers`，否则每条日志会重复输出。

### 3.3 `pdb` 与 `breakpoint()`

Python 3.7+ 推荐直接写：

```python
def get_average_score(self) -> float | None:
    breakpoint()
    ...
```

常用命令：

| 命令 | 作用 |
|---|---|
| `l` | 显示附近代码 |
| `n` | 执行下一行，不进入函数 |
| `s` | 进入当前行调用的函数 |
| `r` | 执行完当前函数并返回调用处 |
| `c` | 继续到下一个断点 |
| `p expr` / `pp expr` | 查看表达式，后者格式更友好 |
| `w` | 查看调用栈 |
| `u` / `d` | 在调用栈中上移/下移 |
| `b 29` | 在第 29 行设置断点 |
| `b 29, condition` | 设置条件断点 |
| `cl 1` | 删除编号为 1 的断点 |
| `q` | 退出调试器 |

命令行启动：

```bash
python -m pdb student_manager.py
```

异常发生后进入现场：

```bash
python -m pdb -c continue student_manager.py
```

### 3.4 VSCode 调试器

核心操作：

| 操作 | Windows/Linux | 说明 |
|---|---|---|
| 启动/继续 | F5 | 运行到断点 |
| 切换断点 | F9 | 在当前行添加或移除断点 |
| Step Over | F10 | 执行当前行，不进入函数 |
| Step Into | F11 | 进入函数内部 |
| Step Out | Shift+F11 | 执行完当前函数 |
| 重启 | Ctrl+Shift+F5 | 重新开始调试 |

推荐使用：

- **条件断点**：仅当 `student_id == "2024001"` 时暂停；
- **异常断点**：异常抛出时立即暂停；
- **日志点**：不暂停程序，只输出表达式；
- **监视表达式**：持续观察 `len(self.scores)`、`subject in student.scores`；
- **调用栈**：查看谁调用了当前函数，以及每一层的局部变量。

现代 Python 扩展通常可直接调试当前文件；只有需要固定参数、环境变量或工作目录时才配置 `.vscode/launch.json`。示例：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: 当前文件",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "justMyCode": true
    }
  ]
}
```

在 VSCode 中的基本流程是：打开要运行的 Python 文件，点击行号左侧设置红点，按 F5 启动；程序停下后观察“变量”“监视”“调用堆栈”面板，用 F10/F11/Shift+F11 单步执行。遇到只在特定数据出现的问题，右键断点选择“编辑条件”，例如 `student_id == "2024001"`；想在异常抛出瞬间停下，则在“运行和调试”面板启用 Python 异常断点。

---

## 4. 8 个典型 Bug：根因、修复与防复发 ★★★★★

> 🔥 **学习优先级：重点掌握**

| Bug | 表面现象 | 根因 | 推荐契约/修复 | 防复发测试 |
|---|---|---|---|---|
| 1. 空成绩求平均 | `ZeroDivisionError` | `len(scores) == 0` | 无数据返回 `None`，不要伪装成 0 分 | 空成绩学生 |
| 2. JSON 缺少 `scores` | `KeyError: 'scores'` | 输入数据不完整或旧版本字段缺失 | 可选字段使用默认值；必填字段显式校验 | 缺字段、错类型、损坏 JSON |
| 3. 重复学号 | 原学生被静默覆盖 | 字典相同键会替换旧值 | 添加前检查唯一性，抛领域异常 | 连续添加相同 ID |
| 4. 查询不存在学生 | `KeyError` | 函数没有定义“找不到”行为 | 返回 `Student | None` 或抛 `StudentNotFoundError` | 未知 ID |
| 5. 学生缺少某科成绩 | `KeyError: subject` | 直接访问不存在的科目键 | 只统计有该科成绩的学生 | 部分学生缺科目 |
| 6. 空班级/无人有该科成绩 | `ZeroDivisionError` | 统计数量为 0 | 返回 `None`，由展示层显示“暂无数据” | 空班级、未知科目 |
| 7. Top N 顺序相反 | 最低分排第一 | `sorted()` 默认升序 | `reverse=True`，测试完整顺序 | `[95, 78, 90] → [95, 90, 78]` |
| 8. 报告生成失败 | 报告调用平均分时崩溃 | Bug 1 沿调用链传播 | 在平均分函数修复根因，展示层处理 `None` | 报告含无成绩学生 |

下面每个案例都按同一条学习链路展开：先看会失败的代码，再稳定复现，接着用打印、日志、`pdb` 或 VSCode 找证据，最后修根因并补回归测试。这样你学到的是“怎么定位”，而不只是“最后应该怎么写”。

### 4.1 Bug 1：空成绩列表导致平均分除零

#### 问题代码

```python
def get_average_score(self):
    """计算学生平均分"""
    total = sum(self.scores.values())
    # Bug：没有处理 scores 为空的情况
    return total / len(self.scores)
```

#### 现象：先记录期望和实际

```text
输入：刚创建、尚未录入成绩的学生“赵六”
期望：显示“暂无成绩”
实际：ZeroDivisionError: division by zero
```

最小复现：

```python
student = Student("001", "赵六", 18, "高一")
print(student.get_average_score())
```

#### 调试证据

Traceback 的关键部分：

```text
File "student_manager.py", line 29, in get_average_score
    average = total / len(self.scores)
ZeroDivisionError: division by zero
```

用 `print` 验证假设，而不是直接猜：

```python
def get_average_score(self):
    print(f"[DEBUG] scores = {self.scores!r}")
    print(f"[DEBUG] len(scores) = {len(self.scores)}")
    total = sum(self.scores.values())
    return total / len(self.scores)
```

输出：

```text
[DEBUG] scores = {}
[DEBUG] len(scores) = 0
```

根因已经确定：空字典没有任何成绩，除数为零。这里不要继续修改报告格式或文件读取代码。

#### 修复：明确“无数据”的函数契约

无成绩和 0 分不是一回事。推荐返回 `None`，由展示层决定文案：

```python
def get_average_score(self) -> float | None:
    """返回平均分；没有任何成绩时返回 None。"""
    if not self.scores:
        return None
    return sum(self.scores.values()) / len(self.scores)
```

调用方：

```python
average = student.get_average_score()
if average is None:
    print("平均分：暂无成绩")
else:
    print(f"平均分：{average:.2f}")
```

`if not self.scores` 已经覆盖空字典，不需要再写 `or len(self.scores) == 0`。

#### 回归测试与预防

```python
def test_empty_scores_have_no_average():
    student = Student("001", "测试学生", 18, "高一")
    assert student.get_average_score() is None


def test_average_score_uses_all_subjects():
    student = Student("002", "测试学生", 18, "高一")
    student.scores = {"数学": 90, "英语": 80}
    assert student.get_average_score() == 85
```

以后遇到平均分问题，优先检查集合是否为空、统计数量是否正确，以及函数是否明确约定空集合的返回值。

### 4.2 Bug 2：JSON 缺少 `scores` 字段导致 `KeyError`

#### 问题代码

```python
def load_data(self):
    if os.path.exists(self.data_file):
        with open(self.data_file, "r", encoding="utf-8") as file:
            data = json.load(file)
            for student_data in data:
                student = Student(
                    student_data["student_id"],
                    student_data["name"],
                    student_data["age"],
                    student_data["grade"],
                )
                # Bug：scores 字段可能不存在
                student.scores = student_data["scores"]
                self.students[student.student_id] = student
```

#### 现象：先检查真实输入

旧数据或手工编辑的 JSON 可能是：

```json
[
  {
    "student_id": "2024001",
    "name": "张三",
    "age": 18,
    "grade": "高一"
  }
]
```

运行时：

```text
KeyError: 'scores'
```

注意：JSON 标准不允许注释；如果你在 JSON 示例中写 `// 没有 scores`，那份文件本身也会触发 `JSONDecodeError`。

#### 调试证据：在出错行前停下

```python
for student_data in data:
    breakpoint()
    student.scores = student_data["scores"]
```

调试会话：

```text
(Pdb) p student_data
{'student_id': '2024001', 'name': '张三', 'age': 18, 'grade': '高一'}
(Pdb) p 'scores' in student_data
False
(Pdb) p student_data.get('scores')
None
```

证据说明：不是 `scores` 的值错误，而是这个键根本不存在。

#### 修复：默认值只用于真正可选的字段

如果业务允许新学生暂时没有成绩，可以这样兼容旧数据：

```python
student.scores = student_data.get("scores", {})
```

完整写法：

```python
def load_student(student_data: dict) -> Student:
    student = Student(
        student_data["student_id"],
        student_data["name"],
        student_data["age"],
        student_data["grade"],
    )
    student.scores = student_data.get("scores", {})
    return student
```

`student_id`、`name` 等必填字段不应一律使用默认值，否则坏数据会被静默掩盖。真实项目可以用 Pydantic 或 JSON Schema 校验必填字段、类型和范围。

#### 回归测试与预防

```python
def test_load_student_without_optional_scores():
    student = load_student({
        "student_id": "001",
        "name": "张三",
        "age": 18,
        "grade": "高一",
    })
    assert student.scores == {}


def test_load_student_without_required_id_fails():
    try:
        load_student({"name": "张三", "age": 18, "grade": "高一"})
    except KeyError as exc:
        assert exc.args[0] == "student_id"
    else:
        raise AssertionError("缺少必填字段时应该失败")
```

### 4.3 Bug 3：重复学号静默覆盖旧学生

#### 问题代码

```python
def add_student(self, student_id, name, age, grade):
    # Bug：没有检查学号是否已经存在
    student = Student(student_id, name, age, grade)
    self.students[student_id] = student
    print(f"成功添加学生：{name}")
    return student
```

#### 现象

```text
【第一次添加】成功添加学生：张三
【第二次添加同一学号】成功添加学生：重复学生
结果：张三被重复学生覆盖
```

程序不报错，所以这属于数据完整性问题，往往比直接崩溃更危险。

#### 调试证据：用日志观察写入前后的键

```python
logger.debug("尝试添加学生：id=%s, name=%s", student_id, name)
logger.debug("当前学生 ID：%s", list(self.students))

student = Student(student_id, name, age, grade)
self.students[student_id] = student
```

第二次调用时：

```text
DEBUG 当前学生 ID：['2024001']
```

根因是 Python 字典的规则：给已有键赋值会替换旧值。问题不在 `Student` 构造函数，而在写入前缺少唯一性检查。

#### 修复

推荐用领域异常让调用方明确处理：

```python
class DuplicateStudentError(ValueError):
    pass


def add_student(
    self,
    student_id: str,
    name: str,
    age: int,
    grade: str,
) -> Student:
    if student_id in self.students:
        raise DuplicateStudentError(
            f"学号 {student_id} 已存在"
        )

    student = Student(student_id, name, age, grade)
    self.students[student_id] = student
    return student
```

简单脚本也可以返回 `None`，但要在函数文档和类型提示中写清楚；不要一边打印错误，一边返回看似成功的对象。

#### 回归测试与预防

```python
def test_duplicate_student_id_is_rejected():
    manager = StudentManager()
    manager.add_student("001", "张三", 18, "高一")

    try:
        manager.add_student("001", "重复学生", 18, "高一")
    except DuplicateStudentError:
        pass
    else:
        raise AssertionError("重复学号应该被拒绝")

    assert manager.students["001"].name == "张三"
```

### 4.4 Bug 4：查询不存在的学生

#### 问题代码与现象

```python
def get_student(self, student_id):
    # Bug：直接访问未知键
    return self.students[student_id]
```

```text
查询学号 9999999
KeyError: '9999999'
```

#### 调试证据

在 VSCode 第 3 行设置断点，变量面板可能显示：

```text
student_id: "9999999"
self.students: {"2024001": <Student>, "2024002": <Student>}
student_id in self.students: False
```

用 Python 交互验证字典行为：

```python
d = {"a": 1}
d["b"]          # KeyError
d.get("b")       # None
d.get("b", "不存在")  # "不存在"
```

#### 修复：先选择清楚函数契约

如果“找不到”是正常业务结果，返回可选值：

```python
def get_student(self, student_id: str) -> Student | None:
    return self.students.get(student_id)
```

如果调用方必须拿到学生，则使用明确的领域异常：

```python
class StudentNotFoundError(LookupError):
    pass


def require_student(self, student_id: str) -> Student:
    try:
        return self.students[student_id]
    except KeyError as exc:
        raise StudentNotFoundError(
            f"学号 {student_id} 不存在"
        ) from exc
```

不要让调用方猜测函数会返回 `None`、打印警告还是抛异常。三种做法都可以，但必须固定一种契约。

#### 回归测试

```python
def test_unknown_student_returns_none():
    manager = StudentManager()
    assert manager.get_student("9999999") is None
```

### 4.5 Bug 5：学生缺少科目成绩导致 `KeyError`

#### 问题代码

```python
def calculate_class_average(self, subject):
    total = 0
    count = 0
    for student in self.students.values():
        # Bug：假设每个学生都有该科成绩
        total += student.scores[subject]
        count += 1
    return total / count
```

#### 现象

```text
张三：{'数学': 95, '英语': 88, '物理': 92}
李四：{'数学': 78, '英语': 85}
计算物理平均分
KeyError: '物理'
```

#### 调试证据：日志定位到具体学生

```python
for student in self.students.values():
    logger.debug("检查学生 %s：%r", student.name, student.scores)
    total += student.scores[subject]
```

随后用 `pdb` 停在循环内部：

```text
(Pdb) p student.name
'李四'
(Pdb) p subject
'物理'
(Pdb) p student.scores
{'数学': 78, '英语': 85}
(Pdb) p subject in student.scores
False
```

根因不是科目名称拼写，而是统计代码没有定义“缺少该科成绩”的处理规则。

#### 修复：只统计实际有该科成绩的学生

```python
def calculate_class_average(
    self,
    subject: str,
) -> float | None:
    scores = [
        student.scores[subject]
        for student in self.students.values()
        if subject in student.scores
    ]
    if not scores:
        return None
    return sum(scores) / len(scores)
```

这里的统计口径是“只统计已录入成绩的学生”。如果业务要求缺考按 0 分处理，应把规则写进需求、代码和测试，不能让 `dict.get(subject, 0)` 偷偷决定业务含义。

#### 回归测试

```python
def test_class_average_ignores_missing_subject_scores():
    manager = StudentManager()
    first = manager.add_student("001", "张三", 18, "高一")
    second = manager.add_student("002", "李四", 18, "高一")
    first.scores = {"物理": 92}
    second.scores = {"数学": 78}
    assert manager.calculate_class_average("物理") == 92
```

### 4.6 Bug 6：空班级或无人有该科成绩导致除零

Bug 5 的修复解决了缺科目问题，但还必须单独测试 `scores` 集合最终为空的场景。

#### 问题与复现

```python
manager = StudentManager()
manager.calculate_class_average("数学")  # ZeroDivisionError

manager.add_student("001", "张三", 18, "高一")
# 学生存在，但没有任何数学成绩
manager.calculate_class_average("数学")  # 仍然是 ZeroDivisionError
```

#### 调试证据

在返回语句前查看两个统计变量：

```python
print({"total": total, "count": count})
```

输出：

```text
{'total': 0, 'count': 0}
```

这说明循环没有收集到任何有效成绩，真正的除数是 `count`，不是某个学生的分数。

#### 修复与边界测试

统一返回 `None`，让展示层显示“暂无数据”：

```python
if count == 0:
    return None
return total / count
```

测试至少覆盖：空班级、学生存在但没有该科成绩、正常有一条成绩、多个学生部分缺科目。

```python
def test_empty_class_has_no_average():
    manager = StudentManager()
    assert manager.calculate_class_average("数学") is None


def test_class_with_no_scores_has_no_average():
    manager = StudentManager()
    manager.add_student("001", "张三", 18, "高一")
    assert manager.calculate_class_average("数学") is None
```

开发阶段可以用断言帮助发现违反内部假设的情况，但不要用断言代替对外部输入的正常处理，详见第 8 节。

### 4.7 Bug 7：Top N 排序方向相反

#### 问题代码

```python
def get_top_students(self, subject, n=3):
    students_with_scores = [
        student
        for student in self.students.values()
        if subject in student.scores
    ]
    # Bug：sorted 默认升序
    sorted_students = sorted(
        students_with_scores,
        key=lambda student: student.scores[subject],
    )
    return sorted_students[:n]
```

#### 现象

```text
输入成绩：[95, 78, 90]
期望排名：[95, 90, 78]
实际排名：[78, 90, 95]
```

#### 调试证据

先验证 `sorted` 默认行为：

```python
>>> sorted([3, 1, 4])
[1, 3, 4]
>>> sorted([3, 1, 4], reverse=True)
[4, 3, 1]
```

再分别打印排序前后的成绩，确认筛选阶段没有丢数据，错误只出在排序方向：

```python
print("排序前：", [s.scores[subject] for s in students_with_scores])
print("排序后：", [s.scores[subject] for s in sorted_students])
```

#### 修复与回归测试

```python
def get_top_students(
    self,
    subject: str,
    n: int = 3,
) -> list[Student]:
    candidates = [
        student
        for student in self.students.values()
        if subject in student.scores
    ]
    return sorted(
        candidates,
        key=lambda student: student.scores[subject],
        reverse=True,
    )[:n]
```

```python
def test_top_students_order():
    # 构造 95、78、90 三个成绩
    top = manager.get_top_students("数学", 3)
    scores = [student.scores["数学"] for student in top]
    assert scores == [95, 90, 78]
```

只断言“第一名是 95”不够，因为后两名仍可能顺序错误。排序类 Bug 要检查完整序列、`n` 大于人数、`n` 为 0 等边界。

### 4.8 Bug 8：生成报告时的连锁除零

#### 问题代码

```python
def generate_report(self):
    for student_id, student in self.students.items():
        print(f"学号：{student_id}")
        for subject, score in student.scores.items():
            print(f"  {subject}: {score} 分")

        # Bug：无成绩学生会在这里触发 Bug 1
        average = student.get_average_score()
        print(f"平均分：{average:.2f}")
```

#### 现象与调用链

当报告包含没有成绩的“赵六”时，错误表面上出现在报告生成，但调用链是：

```text
main()
└─ generate_report()
   └─ get_average_score()
      └─ 空 scores 导致除零
```

这是一个连锁 Bug：报告层调用了一个对空数据没有明确契约的底层函数。不要看到报告崩溃，就在每个报告分支里复制一套 `try/except ZeroDivisionError`。

#### 调试证据：异常现场与调用者状态

可以使用 post-mortem 调试停在失败现场：

```python
import pdb
import sys


def debug_excepthook(exc_type, exc_value, traceback):
    pdb.post_mortem(traceback)


sys.excepthook = debug_excepthook
```

在调试器中查看：

```text
(Pdb) p student.name
'赵六'
(Pdb) p student.scores
{}
(Pdb) w
```

证据表明根因仍然是 `get_average_score()` 的空集合处理，而不是报告的字符串格式。

#### 修复：底层修契约，展示层处理 `None`

```python
def generate_report(self):
    for student_id, student in self.students.items():
        print(f"\n学号：{student_id}")
        print(f"姓名：{student.name}")

        if not student.scores:
            print("成绩：暂无")
            print("平均分：暂无")
            continue

        print("成绩：")
        for subject, score in student.scores.items():
            print(f"  {subject}: {score} 分")

        average = student.get_average_score()
        if average is None:
            print("平均分：暂无")
        else:
            print(f"平均分：{average:.2f}")
```

由于 `get_average_score()` 已经修复，报告层不应捕获同一个 `ZeroDivisionError` 来掩盖根因。只有在边界层确实知道如何处理异常时，才捕获具体异常并记录完整上下文。

#### 回归测试

```python
def test_report_includes_student_without_scores(capsys):
    manager = StudentManager()
    manager.add_student("001", "赵六", 18, "高一")
    manager.generate_report()
    output = capsys.readouterr().out
    assert "成绩：暂无" in output
    assert "平均分：暂无" in output
```

### 4.9 八个案例的共同模式

这 8 个 Bug 看起来不同，但都可以用同一套问题拆解：

1. 数据是否为空、缺字段、缺键或类型不对？
2. 函数是否明确约定了边界输入的结果？
3. Traceback 指向的行是否只是“最后爆炸点”，真正的错误状态是否更早产生？
4. 修复是否改变了错误语义，例如把缺失数据伪装成 `0`？
5. 是否增加了最小回归测试，证明这个场景不会再次失败？

---

## 5. 断点、变量和调用栈速查 ★★★

> 🧩 **学习优先级：补充掌握**

### 5.1 断点类型

- 普通断点：执行到该行时暂停；
- 条件断点：条件为真时暂停；
- 日志点：不暂停，只输出表达式；
- 异常断点：指定异常抛出时暂停；
- 函数断点：进入指定函数时暂停。

条件示例：

```python
student_id == "2024001"
subject not in student.scores
len(self.scores) == 0
```

### 5.2 查看变量时优先检查什么

1. 实际值：是否与假设相同；
2. 类型：`"18"` 与 `18` 完全不同；
3. 长度：容器是否为空；
4. 成员关系：键或元素是否存在；
5. 对象标识：两个变量是否引用同一可变对象；
6. 上一层调用者传入了什么。

常用表达式：

```python
type(value)
repr(value)
len(items)
key in mapping
vars(obj)
id(obj)
```

### 5.3 调用栈怎么读

Traceback 的最后一层通常是失败点，但根因也可能来自更上层传入的错误状态。使用 `w` 查看栈，再用 `u`、`d` 切换栈帧，检查每层局部变量。

例如报告生成失败时：

```text
main()
└─ generate_report()
   └─ get_average_score()
      └─ ZeroDivisionError
```

失败发生在最底层；“为什么会传入无成绩学生”则可能需要到 `generate_report()` 或数据加载层检查。

### 5.4 常见异常速查

| 异常 | 常见原因 | 首要检查 |
|---|---|---|
| `NameError` | 变量未定义或作用域不对 | 拼写、定义顺序、作用域 |
| `TypeError` | 运算或调用的类型不兼容 | `type()`、函数签名 |
| `ValueError` | 类型可接受，但值非法 | 原始输入和范围 |
| `KeyError` | 字典键不存在 | `key in mapping`、数据版本 |
| `IndexError` | 序列索引越界 | `len(sequence)`、循环边界 |
| `AttributeError` | 对象没有该属性 | 实际对象类型、属性名 |
| `ZeroDivisionError` | 除数为零 | 数据集合是否为空、计数逻辑 |
| `FileNotFoundError` | 路径错误或文件缺失 | 当前工作目录、绝对路径 |
| `JSONDecodeError` | JSON 格式损坏 | 文件内容、编码、非法注释/逗号 |

---

## 6. 高效定位复杂问题 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 6.1 二分定位

当流程很长但不知道从哪一步开始错误时，在中点检查一次：

```python
step1()
step2()
check_state("after step2")
step3()
step4()
check_state("after step4")
step5()
```

如果 `step2` 后正确、`step4` 后错误，问题范围已经从五步缩小到两步。继续二分，而不是每一行都打印。

### 6.2 对比正确与错误输入

同时准备一个正常样例和一个失败样例，对比：

- 输入值和类型；
- 容器长度；
- 配置和环境变量；
- 进入关键函数前的状态；
- 外部依赖返回值。

这比只盯着失败样例更容易发现“失败样例缺了什么”。

### 6.3 用 `git diff` 和 `git bisect` 查回归

先看最近改动：

```bash
git diff
git log --oneline -10
```

已知一个好提交和一个坏提交时：

```bash
git bisect start
git bisect bad
git bisect good v1.0

# 每次测试当前提交后标记：
git bisect good
# 或
git bisect bad

git bisect reset
```

若有稳定测试命令，可自动二分：

```bash
git bisect run python -m unittest tests.test_average
```

开始前确保工作区修改已妥善保存，避免切换提交时混入未提交变更。

### 6.4 解释代码

把代码逐步解释给同学或写成文字：

```text
先收集成绩
→ 再计算长度
→ 如果长度为零……
```

当你无法清晰解释某一步的输入、输出和前置条件时，那里往往就是值得检查的地方。

### 6.5 性能问题要测量

小表达式可用 `timeit`：

```python
import timeit

elapsed = timeit.timeit(
    "sum(range(1000))",
    number=10_000,
)
print(f"总耗时: {elapsed:.6f}s")
```

完整程序应使用 `cProfile` 等 profiler：

```bash
python -m cProfile -s cumulative student_manager.py
```

不要根据一次 `print(time.time())` 就断言性能瓶颈。性能测试应多次运行，并区分 CPU、I/O、网络和初始化开销。

---

## 7. 五个常见 Python 陷阱 ★★★

> 🧩 **学习优先级：补充掌握**

### 7.1 可变默认参数

默认参数只在函数定义时创建一次，因此多个调用会共享同一个字典：

```python
# 错误
def normalize_scores(scores={}):
    scores["数学"] = 95
    return scores
```

正确方式：

```python
def normalize_scores(
    scores: dict[str, float] | None = None,
) -> dict[str, float]:
    if scores is None:
        scores = {}
    scores["数学"] = 95
    return scores
```

### 7.2 浅拷贝与深拷贝

```python
import copy

original = {"scores": {"数学": 95}}

shallow = original.copy()
shallow["scores"]["数学"] = 100
print(original)  # 内层字典也变成 100

deep = copy.deepcopy(original)
deep["scores"]["数学"] = 60
print(original)  # 不受这次修改影响
```

浅拷贝只创建第一层容器，嵌套可变对象仍被共享。深拷贝也不是永远正确：大型对象可能很昂贵，文件句柄、连接等资源也不适合随意复制。

### 7.3 循环中的闭包晚绑定

```python
functions = []
for index in range(3):
    functions.append(lambda: index)

print([func() for func in functions])  # [2, 2, 2]
```

闭包在调用时读取变量 `index`，循环结束后它已经是 2。可在定义时绑定当前值：

```python
functions = [
    (lambda value=index: value)
    for index in range(3)
]
```

或使用 `functools.partial`。

### 7.4 字符串与数字

```python
data = json.loads('{"age": "18"}')
age = data["age"]
print(repr(age), type(age))  # '18' <class 'str'>
```

不要在业务深处到处 `int(...)`；更好的方式是在输入边界集中校验和转换，并对非法值返回明确错误。

### 7.5 `None`、`False`、`0` 和空容器

它们都可能在布尔判断中为假，但业务含义不同：

```python
score = get_score("001")

if score is None:
    print("学生或成绩不存在")
elif score == 0:
    print("成绩确实为 0 分")
```

当 `0`、`False` 或空字符串是合法值时，不要用笼统的 `if not value` 判断“缺失”。

---

## 8. 断言、异常和日志不要混用 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 8.1 `assert` 用于内部不变量

```python
def calculate_average(scores: list[float]) -> float:
    if not scores:
        raise ValueError("scores 不能为空")
    if not all(0 <= score <= 100 for score in scores):
        raise ValueError("分数必须在 0～100 之间")

    average = sum(scores) / len(scores)
    assert 0 <= average <= 100
    return average
```

- 外部输入错误：显式抛 `ValueError` 或领域异常；
- 理论上不可能被破坏的内部不变量：可使用 `assert`；
- 正常但值得记录的事件：使用日志。

Python 使用优化选项运行时可能移除 `assert`，因此不能依赖它执行安全、权限或用户输入校验。

### 8.2 不要捕获后只打印

```python
# 不推荐
try:
    load_data()
except Exception as exc:
    print(exc)
```

这会丢失调用栈，还可能让程序带着不完整状态继续运行。边界层需要记录未知异常时：

```python
try:
    load_data()
except (OSError, json.JSONDecodeError):
    logger.exception("failed to load data")
    raise
```

只捕获你知道如何处理或如何转换的具体异常。

### 8.3 用装饰器自动记录函数调用

当多个函数都需要记录“谁被调用、传入什么、返回什么”时，可以用装饰器减少重复日志代码：

```python
import functools
import logging


def debug_log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logging.debug(
            "调用 %s，参数：args=%r, kwargs=%r",
            func.__name__,
            args,
            kwargs,
        )
        result = func(*args, **kwargs)
        logging.debug(
            "%s 返回：%r",
            func.__name__,
            result,
        )
        return result

    return wrapper
```

使用方式：

```python
@debug_log
def add(a: int, b: int) -> int:
    return a + b
```

这个装饰器适合开发和排障阶段。生产环境要注意脱敏，避免把密码、Token 或完整用户数据写入日志；如果函数会抛异常，也可以在装饰器中用 `logger.exception()` 记录后重新抛出。

---

## 9. 调试检查清单 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 复现与证据

- [ ] 写清输入、期望和实际结果；
- [ ] 能稳定复现，最好有最小测试；
- [ ] 完整阅读异常类型、失败行和调用栈；
- [ ] 检查最近改动：`git diff`、配置、依赖和数据版本；
- [ ] 用打印、日志或断点验证假设，而不是凭感觉修改。

### 边界与状态

- [ ] 检查 `None`、空容器、0、负数、最大值、重复值；
- [ ] 检查实际类型、编码、路径和当前工作目录；
- [ ] 检查字典键、列表边界和对象是否共享可变状态；
- [ ] 检查循环第一次、最后一次和零次执行；
- [ ] 检查错误是当前函数产生，还是由上游输入传入。

### 修复与验证

- [ ] 一次只改一个原因；
- [ ] 修复根因，不在每个调用处重复兜底；
- [ ] 明确“找不到”“没有数据”“值为 0”的不同语义；
- [ ] 运行原失败样例、正常样例和相邻边界样例；
- [ ] 增加回归测试；
- [ ] 删除临时断点和无用打印；
- [ ] 检查日志没有泄露敏感数据。

---

## 10. 一页速记 ★★★

> 🧩 **学习优先级：补充掌握**

```text
1. 先复现，不要先修改。
2. Traceback 从最后一行开始读，再沿调用栈向上找输入来源。
3. 把猜测写成可验证假设。
4. 小问题用 print，大流程用 logging，状态变化用断点。
5. 检查值、类型、长度、成员关系和对象引用。
6. 空值、0、False、None 是不同业务状态。
7. 修复函数契约和根因，不要在所有调用方重复捕获。
8. 修复后增加回归测试。
9. 性能问题用 profiler，不靠感觉。
10. 不要用 assert 校验外部输入，不要用宽泛 except 隐藏错误。
```

调试能力的提升路径：

- 初级：会读 Traceback，用最小打印定位值；
- 中级：会用条件断点、调用栈、日志和最小复现；
- 进阶：能通过测试、类型契约、可观测性和代码设计预防 Bug。

---
