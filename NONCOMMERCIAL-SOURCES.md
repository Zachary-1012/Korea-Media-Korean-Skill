# Korean Media Study｜非商业教育资源与词库版权清单

> Korean Media Study 是免费开放、非商业的韩语自学产品。免费使用是产品定位，不代表它或其作者自动取得任何第三方资料的无条件再授权。

## 1. 数据来源与许可

| 来源 | 本次使用 | 权限边界 |
| --- | --- | --- |
| Koko AI · *Koko Korean 5K — Multilingual Vocabulary Dataset* | 本机下载 `words.zh-TW.jsonl` 原始 5,000 行，去重与质量筛选，生成 4,704 个可搜索词头 | 数据集作者声明 CC BY 4.0；复用时必须署名、指明变更并链接许可证。 |
| OpenCC-JS 1.4.2 | 构建期间将部分繁体中文释义与分类转为简体中文 | 开源软件 MIT AND Apache-2.0；只用于构建，最终网页版无在线付费转换。 |
| 韩国国立国语院《韩国语基础词典》 | 提供直达官方词典入口；不复制其音频或官方词库 | 官方开放 API 需认证密钥；目前没有确认产品持有并可合法使用的密钥，不声称已接入全部官方词汇。 |
| Korea.net 与国立国语院的语言和礼仪公开介绍 | 事实参考，为 18 个原创韩语情境与语用练习提供背景 | 仅做知识性整理，不复制其图片、音频、视频、完整文章。文化习惯因人而异。 |
| Korean Media Study 原有 52 单元、48 节课程 | 原有学习课程与创作材料保留 | 原项目版权与用户既有非商业使用条款不变。 |

**Koko 数据集版权署名**

- 名称：Koko Korean 5K — Multilingual Vocabulary Dataset
- 原作者：Koko AI / https://kokoai.im
- 原始发布：https://huggingface.co/datasets/jaylee8864/korean-vocabulary-5000
- 许可证：https://creativecommons.org/licenses/by/4.0/ （CC BY 4.0）
- 本项目修改：韩文词头去重、移除明显模板化例句、删除不完整词项、用 OpenCC-JS 转换可用繁体中文释义为简体中文、保留原始繁体释义字段，并增加本地词卡复习交互。**原始 5,000 行并非 5,000 个不同词汇。**
- 词义来源未经过本项目逐条真人审校，不能称为正式词典，词义不应直接作为能力等级认证或权威语言结论。

原始文件位置：`data/third-party/koko-zh-TW-original.jsonl`。公开词库：`data/noncommercial-korean-extended.json`。构建：`node scripts/prepare-noncommercial-vocabulary.mjs`。

## 2. 质量事实

- 原数据：5,000 行；不保证每一条均可用于教学。
- 处理后：4,704 个独立韩语词头（不是整个韩语的全部词汇）。
- 其中部分仍为英文释义，前端逐条明示，不自动冒充简体中文。
- 自动规则剔除显而易见的「这是一个关于 XX 的例句」式模板句，但不代表剩余例句已取得真人审校。
- 用户可以从扩展词库选择自己的学习词条，通过复习、韩语回忆和例句接触辅助学习。词卡正确 **不等于真实韩语表达合格**。

## 3. 韩国文化与礼仪：尊重差异，拒绝刻板印象

原创学习场景包括敬语 -요/-습니다、반말、称谓、教授邮件、初见问候、道别、递物、筷子、餐桌礼仪、拒绝饮酒、拜访住宅、职场道歉与协商等。

参考资源：

- Korea.net 问候与敬语：https://www.korea.net/Events/Overseas/view?articleId=9189
- 国立国语院 존댓말：https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=24607
- Korea.net 餐桌礼仪：https://www.korea.net/NewsFocus/Society/view?articleId=175173
- Korea.net 韩国生活指南：https://www.korea.net/koreanet/fileDownload?fileUrl=FILE%2FPDF%2Fgeneral%2F201209_liveinkorea_en.pdf

**不把文化刻板印象当教学规则**：用语与行为会随年龄、职级、关系、组织、地区、残障和个人偏好变化；允许婉拒饮酒；礼貌不等于牺牲自己的边界。

## 4. 无密钥情况下官方词典连接状态

- 官网：https://krdict.korean.go.kr/chn/mainAction
- 官方 API 文档：https://krdict.korean.go.kr/chn/openApi/openApiInfo
- 密钥申请：https://krdict.korean.go.kr/eng/openApi/openApiRegister
- 当前：**API KEY NOT VERIFIED；官方批量词库 NOT INTEGRATED**。
- 任何未来密钥只允许由用户授权后，在安全服务端保存。不得放在 GitHub Pages 静态 JS 或公开仓库。

## 5. 教育结果与本轮验收分层

- 自动化遍历 52 单元仅证明产品可操作及文本结构完整；模拟输入没有能力代表真人韩语口语和写作。
- 产品是否能让真实初学者达到 B1/B2，需要真人学习者的入学基线、持续学习与至少第 7 天和第 30 天的无提示情境测试、可追溯的独立教师评分。这些条件缺一不可。
- 未获得真实学习者与评估者证据时，即使所有程序检查通过，仍应标为 **USER OUTCOME NOT VERIFIED**。

**本项目不因第三方 CC BY 数据加入而擅自更改原有项目版权、品牌及商业授权归属。**
