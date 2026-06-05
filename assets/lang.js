/* ============================================================
   语言包(双语文案的唯一来源 Single Source of Truth)
   结构:LANG_PACK = { zh: {...}, ja: {...} }
   - ui    : 全站通用界面文字(导航/按钮/标签…)
   - l1    : 第1课内容(其余课程将以 l0/l2/l3/l4 同构追加)
   - terms : 术语字典,按 key 复用,正文任意位置点击即查
   规则:
   - 页面元素用 data-i18n="l1.title" 读取纯文本;
     用 data-i18n-html="l1.xxx" 读取可含 <span class="term"> 的富文本。
   - 富文本里的术语写成:
       <span class="term" data-term="bucket">桶 Bucket</span>
     显示词可按语言自然书写,解释统一从 terms[key] 取。
   - AWS 服务名(S3/EC2/IAM/VPC)与必要英文术语两种语言都保留英文原词。
   ============================================================ */

const LANG_PACK = {
  /* ================= 中文 ================= */
  zh: {
    ui: {
      siteTitle: "AWS 入门教学讲义",
      brand: "AWS 入门课",
      langToggle: "日本語",
      langName: "中文",

      nav_title: "课程导航",
      nav_intro: "开篇 · 认识 AWS",
      nav_l1: "第1课 · Amazon S3",
      nav_l2: "第2课 · AWS IAM",
      nav_l3: "第3课 · Amazon EC2",
      nav_l4: "第4课 · Amazon VPC",
      nav_results: "我的结业成果",
      nav_glossary: "术语表",

      theme_toggle: "深色模式",
      font_toggle: "大字号",
      print: "打印 / 存 PDF",
      glossary: "术语表",

      badge_read: "概念理解",
      badge_read_hint: "跟着读懂就行,不用动手",
      badge_do: "动手操作",
      badge_do_hint: "上课时要亲手在控制台做",

      analogy_label: "打个比方",
      inaws_label: "在 AWS 里",

      console_disclaimer: "提示:AWS 控制台界面会不定期更新,下面的按钮名称、位置可能与你看到的略有不同,请以实际界面为准,抓住「要做什么」即可。",

      checkpoint_label: "检查点",
      pitfall_label: "常见踩坑",
      cost_free: "免费套餐内",
      cost_paid: "会产生费用,务必清理",

      copy: "复制",
      copied: "已复制!",

      review_link: "↻ 复习这个知识点",
      quiz_submit_hint: "点选项即可,马上告诉你对不对",
      quiz_correct: "答对了!",
      quiz_wrong: "再想想~",
      quiz_score: "本课得分",
      quiz_score_of: "共",
      quiz_retry: "重做本题",

      survey_btn: "课后问卷",
      survey_qr: "(扫码或点击按钮)\n问卷二维码占位",
      survey_open: "打开问卷",

      mark_done: "我已完成本课",
      mark_done_hint: "勾选后会记录到「我的结业成果」",

      glossary_title: "术语表",
      glossary_search: "搜索术语,如:桶 / bucket / 区域…",
      glossary_empty: "没找到相关术语,换个词试试~",
      close: "关闭",

      term_tap_hint: "点一下查看解释",
      skip_link: "跳到正文",
      celebrate_done_title: "🎉 太棒了,本课完成!",
      celebrate_perfect_title: "💯 满分通过,厉害!",
      celebrate_perfect_sub: "随堂测验全部答对啦~",
      celebrate_lab6_title: "🎉 你的照片墙网页上线了!",
      celebrate_lab_all_title: "🏆 全部 7 个阶段完成,太强了!",
      lab_goal: "目标",
      lab_done: "完成",
      prev_lesson: "上一节",
      next_lesson: "下一节",
      foot: "AWS 入门教学讲义 · 公司内部培训用 · 可截图留念",
    },

    l1: {
      badge: "第 1 课",
      title: "Amazon S3:云端存储",
      subtitle: "把照片放到「永远装不满的云端储物柜」里",

      storyline: '<span class="tag">我们的项目主线 🏫</span> 这门课我们要一起做一个「语言学校学员照片分享网站」。<b>今天是第一块积木:</b>先用 <span class="term" data-term="s3">Amazon S3</span> 这个云存储,把大家上传的照片稳稳地存起来。有了存照片的地方,后面几课才能继续搭。',

      goals_title: "本课学习目标",
      goal_1: "用大白话说清楚:S3 到底是个什么东西。",
      goal_2: "搞懂三个关键词:桶(Bucket)、对象(Object)、区域(Region)。",
      goal_3: "亲手创建一个属于自己的桶,并上传一张照片。",
      goal_4: "知道怎么让照片能被别人看到,以及为什么默认不让看。",

      concept_title: "核心概念:边打比方边认识 S3",

      cc1_h: "① S3 是什么?三大核心概念:桶、对象、键",
      cc1_time: "约 5 分钟",
      cc1_analogy: "还记得开头那个「永远装不满的储物间」吗?你往里放东西,得先有个箱子,东西还得有名字,这样以后才找得到。S3 就是这么个存文件的地方,全靠这三样东西运转。",
      cc1_aws: '在 S3 里:① <span class="term" data-term="bucket">桶 Bucket</span> 是装文件的大箱子;② <span class="term" data-term="object">对象 Object</span> 就是你放进去的每个文件(比如一张照片);③ <span class="term" data-term="key">键 Key</span> 是这个文件的完整名字,你靠键把文件找出来。一句话:<b>桶里放对象,对象用键来命名</b>。',
      cc1_folder: '⚠️ 一个常见误会:S3 里看到的「文件夹」其实是假的!S3 底层是<b>扁平</b>的,根本没有真正的文件夹。当你把照片命名为 <code>2026/alice.jpg</code> 时,控制台只是把斜杠 <code>/</code> 前面的 <span class="term" data-term="prefix">前缀</span> 显示成一个文件夹的样子,方便你看。真实存在的,只有「键 = 2026/alice.jpg」这一串名字而已。',
      cc1_ex: '👉 回到我们的照片网站:建一个桶 <code>school-photos-2026</code>,Alice 的照片对象键叫 <code>2026/alice.jpg</code>,Bob 的叫 <code>2026/bob.jpg</code>。看起来像放在 2026 文件夹里,其实只是键名前缀相同罢了。',

      cc2_h: "② 为什么说「丢不了」:持久性与可用性",
      cc2_time: "约 4 分钟",
      cc2_analogy: "想象你把同一张照片自动复印了很多份,分别锁进同一区域里好几栋不同的大楼(机房)。就算有一栋楼出了事,其它楼里还有副本,照片照样在。S3 默默替你做的就是这件事。",
      cc2_aws: 'S3 会把你的每个对象<b>自动存成多份副本</b>,分散放在一个区域内的<b>多个设施(机房)</b>里(冗余存储)。它的 <span class="term" data-term="durability">持久性</span> 高达「11 个 9」(99.999999999%)——通俗说:你存 1000 万个文件,平均要等上千万年才可能丢 1 个。同时它的 <span class="term" data-term="availability">可用性</span> 也很高,几乎随时都能取到文件;而且容量<b>虚拟无限</b>,不用你预先买硬盘、扩容量。',
      cc2_ex: "👉 这就是为什么 S3 是<b>企业级基础设施,而不是普通网盘</b>:学员上传的毕业合影,不用你自己再备份到别的硬盘,S3 已替你跨多设施冗余保存,除了「手滑删除」几乎不可能丢;就算全校照片暴涨到几百万张,也不用担心存不下。",

      cc3_h: "③ 桶的两个铁律:名字全球唯一 + 绑定 Region",
      cc3_time: "约 4 分钟",
      cc3_analogy: "桶名就像网站域名或手机号——<b>全世界不能重复</b>,别人注册过的你就不能再用。而桶建在哪个城市的机房,一旦定了就属于那个城市,搬不走。",
      cc3_aws: '第一,<span class="term" data-term="bucket">桶</span> 的名字是<b>全球唯一</b>的(不是你账号内唯一,是全 AWS 唯一),所以要起得够独特,且只能用小写字母、数字和短横线。第二,每个桶都<b>绑定在一个 <span class="term" data-term="region">区域 Region</span></b>(还记得「开始之前」讲的区域吗?),数据就实实在在放在那个区域,不会自己跑去别处。',
      cc3_ex: '👉 这两条正是<b>动手建桶时最常见的报错来源</b>:名字被占用 → 提示「already exists」,换更独特的如 <code>school-photos-2026-tokyo-a1</code>;区域选错 → 建完「找不到桶」,其实是右上角区域被切走了。全班统一建在老师指定的东京区域,资源都在一起好找。',

      cc4_h: "④ 权限与访问控制(本课重点之一)",
      cc4_time: "约 12–15 分钟",
      cc4_analogy: "把桶想成一栋公寓楼。安全靠四道关卡:① 大楼总闸(一拉闸,整栋谁都进不来);② 给每个住户发的门禁卡(规定这个人能去哪);③ 贴在某个房间门口的规则牌(规定这个房间谁能进);④ 房间里某件物品上的小标签(老式、少用)。S3 的访问控制就是这四层叠在一起。",
      cc4_aws: 'S3 的四层访问控制,从粗到细:① <span class="term" data-term="publicaccess">Block Public Access</span>——总开关,默认全开,一票否决任何公开访问(最强保险);② <span class="term" data-term="iampolicy">IAM 策略</span>——绑在「人/程序」身上,规定这个身份能对哪些 AWS 资源做什么;③ <span class="term" data-term="bucketpolicy">桶策略 Bucket Policy</span>——绑在「桶」身上的一段 JSON 规则,规定谁能对这个桶做什么;④ <span class="term" data-term="acl">ACL</span>——很老的对象级开关,如今基本不推荐用。<b>记住:只要总开关挡着,后面写得再开放也没用——这是 S3 防数据泄露的护城河。</b>',
      cc4_json_intro: '光说太抽象。下面是一段<b>真实的桶策略</b>,我们一行行拆开看。点下方每个字段,左边对应的代码行会高亮:',
      policy1_title: "例 1:允许「所有人」读取图片(公开网站常用)",
      policy2_title: "例 2:只有「管理员」能上传(写入受限)",
      cc4_policy2_note: '对比例 1:这里 <code>Principal</code> 不再是 <code>*</code>(所有人),而是<b>指定的某个管理员身份</b>;<code>Action</code> 也从「读」<code>s3:GetObject</code> 换成了「写」<code>s3:PutObject</code>。同一个桶,读和写可以分别授权给不同的人。',
      cc4_leastpriv: '🔑 <b>最小权限原则</b>:永远只授予「完成任务所必需」的最小权限。能只给「读」就别给「写」,能只对一个桶就别对全部。例 1 之所以安全,是因为它只放开了「读图片」这一件事,别人删不了、改不了你的照片。',
      cc4_ex: '👉 我们照片网站的落地方案:首页要展示的图片,用<b>例 1</b> 的桶策略对所有人开放「读」;学员私下上传照片,则不直接开公开写入,而是由后台用 <span class="term" data-term="iamrole">IAM 角色</span> 写入,或发一个有时效的 <span class="term" data-term="presignedurl">预签名 URL</span> 让前端临时上传——既方便又不把大门敞开。',

      cc5_h: "⑤ 存储类型 Storage Classes(本课重点之二)",
      cc5_time: "约 6 分钟",
      cc5_analogy: "家里东西分「常用的放手边、很少用的塞进储藏室深处」。放手边拿得快但占地方(贵),塞深处便宜但拿出来慢。云存储一模一样:按你<b>多久用一次</b>,挑不同档位,省下大笔钱。",
      cc5_aws: 'S3 的常见 <span class="term" data-term="storageclass">存储类型</span>:① <span class="term" data-term="standard">S3 Standard</span>——经常访问,取用最快,单价最高;② <span class="term" data-term="standardia">Standard-IA</span>(不频繁访问)——偶尔才看,存得更便宜,但每次取用要付一点读取费;③ <span class="term" data-term="glacier">Glacier 系列</span>(归档)——极少访问的长期归档,价格极低,取回要等几分钟到几小时。<b>越「冷」的数据,放越深的档位越省钱。</b>',
      cc5_ex: "👉 照片网站:今年迎新、毕业典礼的照片大家天天翻,放 Standard;去年的活动照偶尔回顾,转 Standard-IA;五年前老照片几乎没人看,沉到 Glacier 归档。这正是 S3 帮企业<b>省存储成本的核心价值</b>——同样的数据,放对档位能省一大半。",

      cc6_h: "⑥ 生命周期管理 Lifecycle(本课重点之三)",
      cc6_time: "约 5 分钟",
      cc6_analogy: "总不能让你天天手动搬箱子。最好定个规矩:「东西放满 90 天没人动,就自动搬进储藏室;放满一年,自动当废品处理掉。」S3 就能照这种规矩自动执行,不用你操心。",
      cc6_aws: '承接上一节:<span class="term" data-term="lifecycle">生命周期 Lifecycle</span> 就是给桶设一组<b>自动规则</b>,让对象随时间<b>自动</b>从贵档位转到便宜档位(如 Standard → Standard-IA → Glacier),或到期<b>自动删除</b>。如果你懒得规划,直接用 <span class="term" data-term="inteltiering">Intelligent-Tiering</span>,它会监控访问情况、<b>自动</b>把数据放到最划算的层级。这就是企业<b>自动化控制存储成本</b>的手段。',
      cc6_ex: "👉 照片网站设一条规则:每张照片<b>上传满 90 天</b>自动转入归档档位,<b>满 3 年</b>自动删除(或转更深的归档)。设一次,以后所有新照片都照办,省钱又省心,再也不用人工清理。",

      cc7_h: "⑦ 版本控制 Versioning:给文件自动留底",
      cc7_time: "约 4 分钟",
      cc7_analogy: "就像写文档时的「历史版本」:每次改动、覆盖,系统都自动留一份旧的。哪天改错了、删错了,随时翻回上一版。",
      cc7_aws: '给桶开启 <span class="term" data-term="versioning">版本控制 Versioning</span> 后,同名对象的每次覆盖或删除,S3 都会<b>保留旧版本</b>而不是真抹掉。误删?其实只是加了个「删除标记」,撤掉就回来了;误覆盖?旧版本还在,可恢复到任意历史版本。<b>这是防「手滑」的关键保险。</b>',
      cc7_ex: "👉 照片网站:学员把 <code>alice.jpg</code> 传错成了别人的照片,覆盖了原图——开了版本控制就不慌,后台一键恢复到上一个版本,原照片立刻回来。没开的话,原图就真的没了。",

      cc8_h: "⑧ 数据保护与加密(简版)",
      cc8_time: "约 3 分钟",
      cc8_analogy: "寄贵重物品:路上用密封防拆的箱子(别人中途拆不开),到了仓库再锁进保险柜(就算有人翻仓库也看不到里面)。数据也是这两道锁。",
      cc8_aws: '两个概念用大白话理解:① <b>传输中加密</b>——数据在你和 S3 之间走网络时,用 <b>HTTPS</b> 加密,防止半路被偷看;② <span class="term" data-term="encryption">静态加密</span>——数据存进 S3 时<b>自动加密</b>保存(现在默认就开),硬盘就算被人拿走也读不出内容。这对企业<b>合规要求</b>(如 ISO 27001、等保)很重要。密钥怎么管是更深的话题,今天点到为止。',
      cc8_ex: "👉 照片网站存的是学员的肖像照,属于个人信息。有了传输加密 + 静态加密,既保护学员隐私,也让公司更容易通过安全合规审查。",

      cc9_h: "⑨ S3 的真实用途:不只是存照片",
      cc9_time: "约 3 分钟",
      cc9_analogy: "别把 S3 只当一个相册。它更像万能仓库 + 发货中心:能存货、能直接对外「发货」(让人访问下载)、还能当原料库供别的系统加工。",
      cc9_aws: 'S3 的代表用途:① <span class="term" data-term="statichosting">静态网站托管</span>——把网页直接放 S3 上对外访问,<b>不用额外服务器</b>;② 备份与灾难恢复——重要数据的安全副本;③ <span class="term" data-term="datalake">数据湖</span> / 大数据分析——海量原始数据集中存放供分析;④ 配合 <span class="term" data-term="cloudfront">CloudFront</span> 全球加速分发,让世界各地的人都打开得飞快。',
      cc9_ex: "👉 收束全课、承上启下:我们照片网站的<b>首页其实可以直接托管在 S3 上</b>!这就是为什么第一课先学 S3——它既是存照片的仓库,也能直接当网站的「门面」。更复杂的动态功能,我们后面交给 EC2,但简单页面 S3 自己就能扛。",

      concept_total_time: "本课核心概念共 9 节,讲解约 50 分钟(各节时长见标题旁标注,方便控场)",
      concept_click_hint: "点字段查看讲解,对应代码行会高亮 👇",
      pf_version: '<span class="pf-k">Version</span>:策略语法的版本号,固定写 <code>2012-10-17</code> 即可,照抄。',
      pf_statement: '<span class="pf-k">Statement</span>:规则主体,是一个数组,可以放多条规则。一条规则 = 一个「谁能对什么做什么」。',
      pf_sid: '<span class="pf-k">Sid</span>:这条规则的备注名(可选),方便你自己看,随便起。',
      pf_effect: '<span class="pf-k">Effect</span>:效果。<code>Allow</code> = 允许,<code>Deny</code> = 拒绝。这里是允许。',
      pf_principal: '<span class="pf-k">Principal</span>:作用于「谁」。<code>"*"</code> 表示<b>所有人</b>(任何人)。要限定某个身份就写它的标识。',
      pf_action: '<span class="pf-k">Action</span>:允许做的<b>操作</b>。<code>s3:GetObject</code> = 读取/下载对象(看图片)。',
      pf_resource: '<span class="pf-k">Resource</span>:作用在<b>哪些对象</b>上。结尾 <code>/*</code> 表示这个桶里的<b>所有</b>对象。',

      c_s3_h: "① Amazon S3 是什么?",
      c_s3_analogy: "想象楼下有一家「永远装不满」的自助储物间:你有多少东西都能放进去,按月只为「实际放了多少」付一点点钱,而且东西放进去几乎不会丢。你不用关心储物间是怎么盖的、有多大,反正你要存东西,它永远有位置。",
      c_s3_aws: '在 AWS 里,这个储物间就叫 <span class="term" data-term="s3">Amazon S3</span>(全称 Simple Storage Service,简单存储服务)。它专门用来存「文件」——照片、视频、网页、备份,什么都行,容量你可以当成是无限的。我们网站上学员的照片,就都存在这里。',
      c_s3_where: '在控制台从哪进:登录后,在顶部搜索框输入 <b>S3</b>,点进去就是 S3 的主页面。',

      c_bucket_h: "② 桶 Bucket 是什么?",
      c_bucket_analogy: "储物间里不能把所有东西堆成一团,你得先租一个「大箱子」,再往箱子里放东西。这个大箱子,就是桶。每个箱子有一个全世界独一无二的名字(像门牌号),别人取过的名字你就不能再用了。",
      c_bucket_aws: '在 S3 里,这个大箱子叫 <span class="term" data-term="bucket">Bucket(桶)</span>。你存任何文件之前,都要先建一个桶。我们会给项目建一个桶,专门放学员照片,比如取名 <code>school-photos-2026</code>。',
      c_bucket_where: '在控制台从哪进:S3 主页面 →「Buckets(桶列表)」→ 点橙色按钮「Create bucket(创建桶)」。',

      c_object_h: "③ 对象 Object 是什么?",
      c_object_analogy: "放进箱子里的每一样东西——一张照片、一个文件——就是一个「对象」。每样东西都贴着一张标签写着它的名字,你靠这个名字找到它。",
      c_object_aws: '在 S3 里,你上传的每个文件就是一个 <span class="term" data-term="object">Object(对象)</span>,它的名字(含路径)叫 <span class="term" data-term="key">Object Key(对象键)</span>。比如 <code>2026/alice.jpg</code> 就是一个对象键。一张照片 = 一个对象,简单理解就行。',
      c_object_where: "在控制台从哪进:点进某个桶,里面列出的每一行文件就是一个对象,点「Upload(上传)」就能往里放。",

      c_region_h: "④ 区域 Region 是什么?(很重要)",
      c_region_analogy: "AWS 在全世界很多城市都盖了机房,比如东京、新加坡、弗吉尼亚。你建桶时要选「在哪个城市的机房里建」。就像你在不同城市各租了一个储物间——你在东京租的箱子,跑去大阪的储物间是找不到的。",
      c_region_aws: '这个「机房所在地」在 AWS 里叫 <span class="term" data-term="region">Region(区域)</span>。<b>关键提醒:</b>全班一开始要统一选同一个区域(比如东京 <code>ap-northeast-1</code>),否则你建的资源,在别的区域里会「凭空消失」找不到,这是新手最常见的迷惑。',
      c_region_where: "在控制台从哪进:看右上角你的名字旁边,会显示当前区域(如「东京」),点它可以切换。先确认它是老师指定的区域,再开始操作。",

      diagram_title: "我们的网站现在长这样",
      diagram_caption: "第 1 课完成后:学员的照片被存进了 S3 的桶里。橙色高亮是今天新加的部件。后面几课会在这张图上继续添砖加瓦。",
      diagram_alt: "架构示意图:用户(学员)通过浏览器把照片上传到位于某个区域内的 Amazon S3 桶,桶里装着一个个照片对象。S3 部分用橙色高亮,表示这是第一课新增的部件。",
      dg_user: "学员(浏览器)",
      dg_upload: "上传照片",
      dg_region: "区域 Region(如:东京)",
      dg_s3: "Amazon S3",
      dg_bucket: "桶 Bucket:school-photos",
      dg_obj1: "alice.jpg",
      dg_obj2: "bob.jpg",
      dg_obj3: "…",
      dg_legend_new: "本课新增",
      dg_s3_sub: "简单存储服务",

      roadmap_title: "课程服务路线图",
      roadmap_hint: "这门课会用到 4 个 AWS 服务,像搭积木一样逐课加入。下面高亮的是本课主角,其余将在后续课程登场。",

      handson_title: "动手操作:亲手搭一个照片网站",
      lab_total_time: "完整实验共 7 个阶段,总计约 60 分钟。每个阶段做完后勾选「完成」,进度会自动保存,下次打开还在。",
      lab_intro: "下面这条实验链,会带你从零创建桶,一路做到把网页发布上线。跟着老师一步步来,每个阶段最后都有「检查点」告诉你做对了该看到什么。涉及按钮名称的地方以实际控制台为准。",
      lab_progress_label: "实验进度",

      lab1_title: "阶段 1 · 创建桶",
      lab1_time: "约 5 分钟",
      lab1_goal: "创建本课要用的桶,亲身体验「桶名全球唯一」和「统一 Region」。",
      lab1_steps: '<ol class="steps"><li>在控制台顶部搜索框输入 <b>S3</b> 进入,点橙色按钮「Create bucket(创建桶)」。</li><li>在 <b>Bucket name</b> 里输入一个独特的名字,建议格式:school-photos-你的名字-日期。<div class="copybox"><code>school-photos-alice-0605</code><button class="copybtn" data-copy="school-photos-alice-0605">复制</button></div></li><li>在 <b>Region(区域)</b> 处,选择老师指定的同一个区域(如 Asia Pacific (Tokyo) ap-northeast-1)。</li><li>其它选项暂时保持默认,拉到底点「Create bucket」。</li></ol>',
      lab1_check: "桶列表里出现了你刚创建的桶,Region 显示为老师指定的区域。若提示「name already exists」,换个更独特的名字重试——这就是「全球唯一」。",

      lab2_title: "阶段 2 · 上传对象",
      lab2_time: "约 7 分钟",
      lab2_goal: "上传几张照片,理解 Object 与 Key,并亲眼看到「文件夹」只是键名前缀。",
      lab2_steps: '<ol class="steps"><li>点进你刚建的桶,点「Upload(上传)」→「Add files」选 2–3 张本地图片。</li><li>(可选)先点「Create folder(创建文件夹)」建一个名为 <code>2026</code> 的文件夹,再进去上传,观察控制台怎么显示。</li><li>点「Upload」确认,等待状态显示 <b>Succeeded</b>。</li><li>点开其中一张图片,查看它的 <b>Key(键)</b> 和详细信息。</li></ol>',
      lab2_check: "桶里出现了你上传的图片,每张是一个 Object;若用了文件夹,图片的 Key 会显示成 2026/xxx.jpg——这个 2026/ 只是键的前缀,不是真目录。",

      lab3_title: "阶段 3 · 配置 Bucket Policy",
      lab3_time: "约 15 分钟",
      lab3_goal: "亲手关闭公开访问总开关,并写一段桶策略让图片可被公开读取;再对照「仅特定身份可上传」。",
      lab3_steps: '<ol class="steps"><li>进入桶的「Permissions(权限)」标签。</li><li>找到「Block public access(阻止公开访问)」点 <b>Edit</b>,取消勾选总开关,保存并按提示输入 <code>confirm</code> 确认。⚠️ 这一步是把大门打开,务必只对练习桶做。</li><li>在同一页找到「Bucket policy(桶策略)」点 <b>Edit</b>,把下面这段 JSON 粘进去,并把 Resource 里的桶名改成你自己的。</li><li>点 <b>Save changes</b> 保存。</li><li>回到对象列表,打开一张图片,复制它的 <b>Object URL</b>,在新标签页粘贴访问。</li><li>逐字段回顾:Effect=Allow、Principal=*、Action=s3:GetObject、Resource=…/*。</li></ol>',
      lab3_check: "用 Object URL 在浏览器里能直接打开图片,就说明公开读取生效了。若仍 Access Denied,多半是 Block Public Access 没关干净。",
      lab3_contrast: "对照下面这段「仅管理员可上传」的策略:Principal 不再是 *,而是某个具体身份;Action 也从读(s3:GetObject)换成了写(s3:PutObject)。同一个桶,读和写可以分别授权给不同的人。",

      lab4_title: "阶段 4 · 版本控制实验",
      lab4_time: "约 8 分钟",
      lab4_goal: "开启版本控制,制造一次「误覆盖」,再恢复旧版本,亲眼见证防误删。",
      lab4_steps: '<ol class="steps"><li>进入桶的「Properties(属性)」标签,找到「Bucket Versioning」点 <b>Edit</b>,选 <b>Enable</b> 启用。</li><li>准备另一张不同的图片,把它重命名成和已上传的某张<b>完全相同</b>的文件名(如都叫 alice.jpg)。</li><li>上传这张同名图片,覆盖原来的。</li><li>回到对象列表,打开「Show versions(显示版本)」开关,你会看到同一个 Key 下有多个版本。</li><li>删除最新版本(或下载较早版本),让原图重新成为当前版本。</li></ol>',
      lab4_check: "同一文件名下能看到多个版本,并能找回被覆盖前的原图。如果当初没开版本控制,原图就真的没了。",

      lab5_title: "阶段 5 · 存储类型与生命周期",
      lab5_time: "约 8 分钟",
      lab5_goal: "查看并切换对象的存储类型,创建一条生命周期规则实现自动转档与过期删除。",
      lab5_steps: '<ol class="steps"><li>打开任意一张图片的详情,查看当前 <b>Storage class</b>(默认 Standard);可点「Edit storage class」体验切换到 Standard-IA。</li><li>回到桶,进入「Management(管理)」标签,点「Create lifecycle rule(创建生命周期规则)」。</li><li>给规则起名(如 archive-old-photos),作用范围选整个桶。</li><li>勾选「Transition current versions(转换当前版本)」,按下面这组示范参数设置:<b>30 天</b>后转 Standard-IA、<b>90 天</b>后转 Glacier 归档。</li><li>再勾选「Expire(过期删除)」,设置 <b>365 天</b>后删除对象,保存规则。</li></ol>',
      lab5_check: "管理标签下出现了你创建的生命周期规则,显示 30 天转 IA、90 天转归档、365 天过期。规则会在未来自动执行,无需人工。",
      lab5_note: "示范参数含义:照片上传满 30 天(开始变冷)→ 转入更便宜的 Standard-IA;满 90 天(基本没人看)→ 转入最便宜的 Glacier 归档;满 365 天(确定不再需要)→ 自动删除。提示:存储类型转换和归档取回会产生少量费用(超出免费套餐时),本练习设好规则即可,无需等它真正触发。",

      lab6_title: "阶段 6 · 静态网站托管(高潮)",
      lab6_time: "约 12 分钟",
      lab6_goal: "把一个 index.html 放上 S3 并开启静态网站托管,用 S3 给的网址直接打开你的照片墙网页——本课高潮!",
      lab6_steps: '<ol class="steps"><li>先确认桶里已经上传了 <code>alice.jpg</code>、<code>bob.jpg</code> 两张图片(就用阶段 2 上传的;文件名要和网页里写的<b>完全一致,含大小写</b>)。</li><li>在电脑上新建一个 <code>index.html</code>,内容直接用下面这段「标准首页代码」(复制后保存为 index.html)。</li><li>把 index.html 上传到你桶的<b>根目录</b>(和图片同一层)。</li><li>进入桶「Properties」→ 最下方「Static website hosting」点 <b>Edit</b> → 选 <b>Enable</b>,Index document 填 <code>index.html</code>,保存。</li><li>确认 Block Public Access 已关、且桶策略允许公开读取(沿用阶段 3)。</li><li>回到「Static website hosting」,复制它给出的 <b>Bucket website endpoint</b> 网址,在新标签打开。</li></ol>',
      lab6_check: "用那个 website endpoint 网址,能在浏览器里看到你的照片墙(标题 + 两张图片)。恭喜——你照片网站的「门面」上线了!若图片裂开,多半是 img 的 src 文件名和实际文件对不上(含大小写);若整页 403,检查公开访问与桶策略。",
      lab6_codenote: "下面是阶段 6 要用的标准首页代码。img 的 src 文件名必须与你上传的图片完全一致(含大小写)。",

      lab7_title: "阶段 7 · 清理资源",
      lab7_time: "约 5 分钟",
      lab7_goal: "删除本课创建的对象、版本和桶,避免持续扣费。",
      lab7_steps: '<ol class="steps"><li>进入桶,打开「Show versions」,全选所有对象与历史版本,点 <b>Delete</b> 删除(开了版本控制必须连版本一起删),按提示输入 <code>permanently delete</code> 确认。</li><li>生命周期规则、静态托管设置无需单独删,删桶时会一并消失。</li><li>回到桶列表,选中你的桶,点 <b>Delete</b>,按提示输入桶名确认删除。</li><li>确认桶列表里已看不到这个桶。</li></ol>',
      lab7_check: "桶列表里你的桶消失了,说明对象、版本、桶都已清理干净,不会再扣费。",
      lab7_why: "为什么必须清理:AWS 按使用量收费。开了版本控制后,旧版本也占空间、也计费,所以删对象时一定要连历史版本一起删,否则桶删不掉、还会悄悄扣费。",

      code_replace_note: "⚠️ 务必把示例里的 <code>school-photos-2026</code> 换成你自己的、全球唯一的桶名;对照示例里的 <code>your-account-id</code> 换成你的 12 位账号 ID。",
      ih_intro: "点下面的说明,可高亮代码中对应的行 👇",
      ih_row1: '<span class="pf-k">第 6 行 &lt;title&gt;</span>:浏览器标签页上显示的标题,可自由修改。',
      ih_row2: '<span class="pf-k">第 24–25 行 &lt;img src&gt;</span>:这里的文件名必须与你上传到桶里的图片<b>完全一致(含大小写)</b>,否则图片会裂开。',
      ih_row3: '<span class="pf-k">第 7–16 行 &lt;style&gt;</span>:页面样式(配色、网格布局),想美化可改,不改也能正常显示。',

      pitfalls_title: "常见踩坑",
      pf_1_q: "上传完照片,把链接发给别人却打不开 / 显示 Access Denied?",
      pf_1_a: "这是正常的!S3 默认禁止一切公开访问,是为了保护你的数据安全。要别人能看,需要专门去关掉「Block Public Access(阻止公开访问)」并设置允许读取——这一步老师会带着做,别自己乱开。",
      pf_2_q: "创建桶时一直提示名字已存在 / 不合法?",
      pf_2_a: "桶名是全球唯一的,而且只能用小写字母、数字和短横线。换一个更独特的名字,比如在后面加上自己名字和今天日期。",
      pf_3_q: "建好的桶 / 照片,过一会儿就「找不到」了?",
      pf_3_a: "多半是区域换了!看右上角区域是不是变了,切回老师指定的那个区域,你的桶就又出现了。",

      cleanup_title: "课后清理资源",
      cleanup_why: "为什么一定要清理?AWS 是按使用量收费的。虽然今天的操作几乎都在免费套餐里,但养成「用完即删」的习惯非常重要,免得日后忘记的资源悄悄扣费。",
      cl_1_t: "先清空桶里的照片",
      cl_1_d: "进入你的桶 → 全选里面的对象 →「Delete(删除)」,桶必须先变空才能删掉。",
      cl_2_t: "再删除桶本身",
      cl_2_d: "回到桶列表 → 选中你的桶 →「Delete」→ 按提示输入桶名确认删除。",
      cl_3_t: "确认已清空",
      cl_3_d: "桶列表里看不到你今天建的桶了,就清理干净了。",

      quiz_title: "随堂小测验",
      quiz: [
        {
          q: "下面哪句话最准确地描述 Amazon S3?",
          options: [
            "一台需要你开机、能跑程序的云服务器",
            "一个存放文件的对象存储服务,容量近乎无限、按用量付费",
            "一个管理谁能登录、谁有权限的服务",
            "一个把多台机器连起来的虚拟网络"
          ],
          answer: 1,
          explain: "S3 是对象存储,专门用来存文件。选 A 把它当成了能跑程序的 EC2、选 C 当成了管权限的 IAM、选 D 当成了管网络的 VPC——这正是初学者最容易把四个服务搞混的地方。",
          review: "concept-s3"
        },
        {
          q: "你在控制台看到照片像放在 2026/ 这个「文件夹」里。关于 S3 的存储结构,正确的是?",
          options: [
            "S3 内部用真实的目录树(文件夹)来组织文件",
            "S3 底层是扁平的,文件夹只是键名前缀的视觉模拟",
            "每个文件夹其实是一个独立的桶",
            "文件夹是真实存在的,删除整个文件夹会更快"
          ],
          answer: 1,
          explain: "S3 底层是扁平的,真正存在的只有「键」这串完整名字;2026/alice.jpg 里的 2026/ 只是键的前缀,被控制台显示成文件夹。选 A 是最常见的误解——以为 S3 像电脑硬盘一样有真目录树;选 C 混淆了「桶」和「前缀」。",
          review: "concept-s3"
        },
        {
          q: "建桶时一直报错「名称已存在」,过会儿又发现昨天建的桶「不见了」。正确的解释是?",
          options: [
            "桶名只要账号内唯一即可;桶不见是被系统自动删了",
            "桶名要全球唯一,换更独特的名字;桶「不见」通常是右上角 Region 被切换了",
            "桶名可以随便重复;桶不见是因为没付费",
            "桶名必须用大写字母;桶不见是浏览器缓存问题"
          ],
          answer: 1,
          explain: "桶名是「全球唯一」(整个 AWS 唯一),不是账号内唯一——这是报错主因;资源又绑定 Region,切了区域当然看不到。选 A 把「全球唯一」误记成「账号内唯一」,正是建桶最常见的两个坑。(另:桶名只能用小写。)",
          review: "concept-region"
        },
        {
          q: "S3 标准存储宣称「11 个 9」的持久性(99.999999999%)。下面理解正确的是?",
          options: [
            "意思是 S3 保证 99.999999999% 的时间都能访问、不会宕机",
            "意思是数据极不容易丢失;但它防的是硬件故障,防不了你自己手滑删除",
            "意思是数据 100% 永不丢失,删了也能自动找回",
            "意思是它的单价便宜了大约 11 倍"
          ],
          answer: 1,
          explain: "11 个 9 说的是「持久性」(数据不丢),不是「可用性」(随时能访问)——选 A 把两者搞混了。它靠多副本冗余防硬件故障,但你主动删除照样会没,所以选 C 也错;要防手滑得靠版本控制。",
          review: "concept-durability"
        },
        {
          q: "你写了一段 Bucket Policy 允许所有人读图片,但链接还是打不开(Access Denied)。最可能的原因?",
          options: [
            "Bucket Policy 没用,必须改用 ACL 才能公开",
            "桶的 Block Public Access(公开访问总开关)还开着,优先级最高,把策略挡住了",
            "S3 不支持公开访问,必须先套一层 CloudFront",
            "图片太大,超过了免费套餐限制"
          ],
          answer: 1,
          explain: "Block Public Access 是「总闸」,优先级最高:只要它开着,Bucket Policy 写得再开放也无效,得先关掉它。选 A 误以为必须用过时的 ACL;选 C 把「加速分发」的 CloudFront 当成了公开访问的前提。",
          review: "concept-access"
        },
        {
          q: "一段 Bucket Policy 里写着 \"Principal\": \"*\" 和 \"Action\": \"s3:GetObject\"。它的含义是?",
          options: [
            "只有管理员(* 代表 admin)能读取对象",
            "允许任何人读取(下载)指定范围内的对象",
            "允许任何人上传和删除对象",
            "拒绝所有人访问对象"
          ],
          answer: 1,
          explain: "Principal \"*\" 表示「所有人」(不是管理员),Action s3:GetObject 表示「读取/下载」。选 A 把 * 误读成管理员;选 C 把「读」(GetObject)当成了「写」(PutObject);选 D 忽略了 Effect 其实是 Allow(允许)。",
          review: "concept-access"
        },
        {
          q: "学校五年前的活动照几乎没人看,但偶尔合规审计要调取。为省钱,最合适的做法是?",
          options: [
            "继续留在 S3 Standard,反正随时能看就行",
            "转入 Glacier 归档:单价极低,需要时能取回(等几分钟到几小时)",
            "直接删掉,要用时再让大家重新上传",
            "全部下载到某位员工的笔记本里保存"
          ],
          answer: 1,
          explain: "极少访问、又必须留存的数据最适合 Glacier 归档:存得极便宜,偶尔取回也能接受延迟。选 A 没省到钱;选 C、D 牺牲了可靠性——审计时找不到或丢了就麻烦。",
          review: "concept-storageclass"
        },
        {
          q: "你想让「每张照片上传 90 天后自动转入归档,3 年后自动删除」,又不想每次手动操作。该用什么?",
          options: [
            "设个手机闹钟,自己定期手动转移和删除",
            "配置一条生命周期(Lifecycle)规则,让 S3 按时间自动执行",
            "开启版本控制,它会自动帮你转档和删除",
            "升级到更贵的存储类型,系统就会自动清理"
          ],
          answer: 1,
          explain: "生命周期规则就是为「按时间自动转档/到期删除」而生,设一次永久生效。选 C 把「版本控制」(留历史版本)和「生命周期」(按时间搬或删)搞混了——这是两个完全不同的功能。",
          review: "concept-lifecycle"
        },
        {
          q: "学员不小心用一张错图覆盖了原来的 alice.jpg。想找回原图,事先应该开启什么?",
          options: [
            "静态加密(Encryption),加密过的文件能自动还原",
            "版本控制(Versioning):它会保留被覆盖的旧版本,可一键恢复",
            "Block Public Access,它能锁住文件不被修改",
            "Standard-IA 存储类型,低频访问的文件不会被覆盖"
          ],
          answer: 1,
          explain: "版本控制会把每次覆盖/删除前的旧版本留底,所以能恢复,这是防手滑的关键。选 A 混淆了「加密」(防别人看)和「恢复」(防丢失),两者无关;选 C、D 都不具备保留历史版本的能力。",
          review: "concept-versioning"
        },
        {
          q: "你写好一个 index.html,想让它通过一个网址在浏览器里直接打开。最简单的做法是?",
          options: [
            "必须先买一台 EC2 服务器来运行它",
            "在 S3 上开启「静态网站托管」,用它给的网址访问即可",
            "把文件名改成 public.html 就会自动有网址",
            "不行,S3 只能存图片,网页得放到别的服务上"
          ],
          answer: 1,
          explain: "简单的静态页面(HTML/CSS/图片)用 S3 的「静态网站托管」就能直接对外访问,不必动用 EC2——这正是我们网站首页的方案。选 A 是新手常见的过度复杂化;选 D 误以为 S3 只能存图片。",
          review: "concept-usecase"
        }
      ],

      summary_title: "本课小结",
      summary_text: "今天我们给「照片分享网站」搭好了第一块积木:用 Amazon S3 创建了一个桶,把照片作为对象存了进去,还知道了区域为什么不能乱选、为什么默认不能公开访问。下一课我们要解决一个新问题——<b>怎么管「谁能往桶里上传照片」</b>,那就要用到 IAM 了。",
      keepsake_title: "📸 留个纪念",
      keepsake_text: "可以截图保存你的桶列表和本课测验得分,作为学习成果留念。也别忘了——完成本课,和同学一起拍张合影吧!",

      survey_title: "课后问卷",
      survey_desc: "花 1 分钟告诉我们这节课讲得怎么样,帮助我们把课程做得更好。",
    },

    terms: {
      aws: { name: "AWS", desc: "亚马逊云科技(Amazon Web Services)。可以理解成一家「出租电脑、存储、网络」的超大云服务商,你按需租用,用多少付多少。" },
      cloud: { name: "云计算 Cloud", desc: "不用自己买电脑和机房,而是通过网络「租用」别人建好的计算和存储资源,用多少付多少,随时可加可减。" },
      s3: { name: "Amazon S3", desc: "AWS 的云存储服务(Simple Storage Service)。专门用来存放文件(照片、视频、备份等),容量近乎无限,按实际用量付费。" },
      bucket: { name: "Bucket(桶)", desc: "S3 里存放文件的「大箱子」。存任何文件前都要先建一个桶,每个桶有一个全球唯一的名字。" },
      object: { name: "Object(对象)", desc: "存进 S3 桶里的每一个文件就叫一个对象。一张照片 = 一个对象。" },
      key: { name: "Object Key(对象键)", desc: "对象在桶里的「完整名字」(可以含路径),靠它来定位文件,例如 2026/alice.jpg。" },
      region: { name: "Region(区域)", desc: "AWS 机房所在的地理位置(如东京、新加坡)。资源属于创建时所选的区域,换了区域就看不到原来的资源。" },
      console: { name: "管理控制台 Console", desc: "AWS 的网页操作后台。登录后可以用鼠标点点点来创建和管理各种云资源。" },
      publicaccess: { name: "公开访问 Public Access", desc: "指允许任何人通过链接访问你的文件。S3 默认是「阻止公开访问」(Block Public Access),以保护数据安全。" },
      freetier: { name: "免费套餐 Free Tier", desc: "AWS 给新用户的免费额度,在一定用量内不收费。超出额度或忘记删除资源仍可能产生费用。" },
      prefix: { name: "前缀 Prefix", desc: "S3 键名中斜杠 / 前面的部分。S3 底层是扁平结构,所谓「文件夹」只是按前缀分组的视觉显示而已。" },
      durability: { name: "持久性 Durability", desc: "数据不丢失的可靠程度。S3 标准存储达「11 个 9」(99.999999999%),靠多副本冗余实现。" },
      availability: { name: "可用性 Availability", desc: "需要时能否正常访问到数据的程度。可用性高 = 几乎随时都取得到。" },
      bucketpolicy: { name: "桶策略 Bucket Policy", desc: "附加在桶上的一段规则,规定谁能对桶里哪些对象做哪些操作(读、写等)。" },
      iamrole: { name: "IAM Role(角色)", desc: "一套可被临时「借用」的权限。让程序或服务用角色访问 AWS,而不必在代码里写死密钥,更安全。" },
      storageclass: { name: "存储类别 Storage Class", desc: "S3 提供的不同存储档位,按访问频率和成本取舍,如 Standard、Glacier 等。" },
      glacier: { name: "S3 Glacier", desc: "S3 的归档存储类别,价格很低,适合很少访问的长期归档数据,取回稍慢。" },
      lifecycle: { name: "生命周期 Lifecycle", desc: "一组自动规则,让对象在一定时间后自动转到更便宜的存储类别,或自动删除。" },
      inteltiering: { name: "Intelligent-Tiering(智能分层)", desc: "S3 的自动优化档位,根据访问情况自动在不同层级间移动数据,帮你省钱、无需手动管理。" },
      statichosting: { name: "静态网站托管 Static Website Hosting", desc: "把 HTML、CSS、图片等静态网页直接放在 S3 上对外访问,无需自己运维服务器。" },
      cloudfront: { name: "Amazon CloudFront", desc: "AWS 的全球内容分发网络(CDN),把内容缓存到离用户最近的节点,加快访问速度。" },
      datalake: { name: "数据湖 Data Lake", desc: "集中存放海量原始数据(各种格式)的存储库,常以 S3 为基础,供后续大数据分析使用。" },
      iampolicy: { name: "IAM 策略 IAM Policy", desc: "绑定在「人或程序」身份上的权限规则,规定这个身份能对哪些 AWS 资源做哪些操作。下一课详细讲。" },
      acl: { name: "ACL(访问控制列表)", desc: "一种很老的、对象级别的访问开关。如今 AWS 基本不推荐使用,优先用桶策略和 IAM。" },
      effect: { name: "Effect(效果)", desc: "策略里的字段。Allow = 允许,Deny = 拒绝。决定这条规则是放行还是挡住。" },
      principal: { name: "Principal(主体)", desc: "策略里的字段,指这条规则作用于「谁」。* 表示所有人;也可指定某个具体身份。" },
      action: { name: "Action(操作)", desc: "策略里的字段,指允许或拒绝的具体操作。如 s3:GetObject(读取对象)、s3:PutObject(上传对象)。" },
      resource: { name: "Resource(资源)", desc: "策略里的字段,指规则作用在哪些对象上。用 ARN 表示,结尾 /* 表示桶里所有对象。" },
      leastprivilege: { name: "最小权限原则 Least Privilege", desc: "安全基本原则:只授予完成任务所必需的最小权限,能少给就不多给,降低风险。" },
      standard: { name: "S3 Standard(标准)", desc: "默认存储类型,适合经常访问的数据,取用最快,单价最高。" },
      standardia: { name: "S3 Standard-IA(不频繁访问)", desc: "适合偶尔访问的数据,存储单价比 Standard 低,但每次取用要付一点读取费。" },
      versioning: { name: "版本控制 Versioning", desc: "桶级开关。开启后,同名对象的每次覆盖或删除都会保留旧版本,可恢复,防误删误改。" },
      encryption: { name: "加密 Encryption", desc: "把数据变成别人读不懂的密文。分传输中加密(HTTPS)和静态加密(存储时自动加密)。" },
      presignedurl: { name: "预签名 URL Presigned URL", desc: "一个带时效的临时链接,持有它的人可在限定时间内上传或下载某个对象,无需额外账号或公开桶。" },
    },

    /* 各 AWS 服务的全称/简称/所在课次(跨页复用,配合官方风格图标) */
    svc: {
      s3_name: "Amazon S3",  s3_sub: "简单存储服务",  s3_lesson: "第1课",
      iam_name: "AWS IAM",   iam_sub: "身份与权限",   iam_lesson: "第2课",
      ec2_name: "Amazon EC2", ec2_sub: "云服务器",    ec2_lesson: "第3课",
      vpc_name: "Amazon VPC", vpc_sub: "云网络",      vpc_lesson: "第4课",
    }
  },

  /* ================= 日本語 ================= */
  ja: {
    ui: {
      siteTitle: "AWS 入門講座テキスト",
      brand: "AWS 入門講座",
      langToggle: "中文",
      langName: "日本語",

      nav_title: "目次",
      nav_intro: "はじめに · AWS とは",
      nav_l1: "第1回 · Amazon S3",
      nav_l2: "第2回 · AWS IAM",
      nav_l3: "第3回 · Amazon EC2",
      nav_l4: "第4回 · Amazon VPC",
      nav_results: "修了の記録",
      nav_glossary: "用語集",

      theme_toggle: "ダークモード",
      font_toggle: "文字を大きく",
      print: "印刷 / PDF 保存",
      glossary: "用語集",

      badge_read: "知識の理解",
      badge_read_hint: "読んで理解すれば OK、操作は不要",
      badge_do: "ハンズオン",
      badge_do_hint: "授業中にコンソールで実際に手を動かします",

      analogy_label: "たとえると",
      inaws_label: "AWS では",

      console_disclaimer: "ご注意:AWS コンソールの画面は随時更新されます。下記のボタン名や位置は実際の画面と少し違う場合があります。「何をするか」を押さえれば大丈夫です。実際の画面を優先してください。",

      checkpoint_label: "チェックポイント",
      pitfall_label: "よくあるつまずき",
      cost_free: "無料利用枠内",
      cost_paid: "料金が発生・必ず削除",

      copy: "コピー",
      copied: "コピーしました!",

      review_link: "↻ この項目を復習する",
      quiz_submit_hint: "選択肢を押すと、すぐ正解かどうか分かります",
      quiz_correct: "正解!",
      quiz_wrong: "もう一度考えてみよう~",
      quiz_score: "今回のスコア",
      quiz_score_of: "/",
      quiz_retry: "この問題をやり直す",

      survey_btn: "課後アンケート",
      survey_qr: "(QR を読み取るかボタンを押す)\nアンケート QR プレースホルダー",
      survey_open: "アンケートを開く",

      mark_done: "この回を修了しました",
      mark_done_hint: "チェックすると「修了の記録」に保存されます",

      glossary_title: "用語集",
      glossary_search: "用語を検索:バケット / bucket / リージョン…",
      glossary_empty: "見つかりませんでした。別の言葉で試してください~",
      close: "閉じる",

      term_tap_hint: "タップで説明を表示",
      skip_link: "本文へスキップ",
      celebrate_done_title: "🎉 お疲れさまでした!本回修了!",
      celebrate_perfect_title: "💯 満点合格、すごい!",
      celebrate_perfect_sub: "確認クイズ全問正解です~",
      celebrate_lab6_title: "🎉 フォトウォールが公開されました!",
      celebrate_lab_all_title: "🏆 全 7 ステージ完了、お見事!",
      lab_goal: "目標",
      lab_done: "完了",
      prev_lesson: "前へ",
      next_lesson: "次へ",
      foot: "AWS 入門講座テキスト · 社内研修用 · スクリーンショットで記念に",
    },

    l1: {
      badge: "第 1 回",
      title: "Amazon S3:クラウドストレージ",
      subtitle: "写真を「いっぱいにならないクラウドの収納庫」に入れよう",

      storyline: '<span class="tag">プロジェクトの軸 🏫</span> この講座では、みんなで「語学学校の生徒フォト共有サイト」を作っていきます。<b>今日は最初の 1 ピース:</b>まずクラウドストレージの <span class="term" data-term="s3">Amazon S3</span> を使って、アップロードされた写真をしっかり保存します。写真を置く場所ができて、はじめて次回以降の組み立てができます。',

      goals_title: "今回の学習目標",
      goal_1: "やさしい言葉で言えるようになる:S3 とは何か。",
      goal_2: "3 つのキーワードを理解する:バケット(Bucket)・オブジェクト(Object)・リージョン(Region)。",
      goal_3: "自分専用のバケットを作り、写真を 1 枚アップロードする。",
      goal_4: "写真を他の人に見せる方法と、なぜ初期状態では見せない設定なのかを知る。",

      concept_title: "コア概念:たとえ話で S3 を理解する",

      cc1_h: "① S3 とは?3 つのコア概念:バケット・オブジェクト・キー",
      cc1_time: "約 5 分",
      cc1_analogy: "冒頭の「いっぱいにならない収納庫」を思い出してください。物を入れるにはまず箱が必要で、物には名前が要る。そうして初めて取り出せます。S3 はまさにそんなファイル置き場で、3 つの要素で動いています。",
      cc1_aws: 'S3 では:① <span class="term" data-term="bucket">バケット Bucket</span> が物を入れる大きな箱;② <span class="term" data-term="object">オブジェクト Object</span> が入れる 1 つひとつのファイル(写真など);③ <span class="term" data-term="key">キー Key</span> がそのファイルのフルネームで、これで取り出します。ひとことで:<b>バケットにオブジェクトを入れ、キーで名前を付ける</b>。',
      cc1_folder: '⚠️ よくある誤解:S3 で見える「フォルダ」は実は偽物!S3 の中身は<b>フラット(平ら)</b>で、本当のフォルダはありません。写真を <code>2026/alice.jpg</code> と名付けると、コンソールがスラッシュ <code>/</code> の前の <span class="term" data-term="prefix">プレフィックス</span> をフォルダ風に見せているだけ。実在するのは「キー = 2026/alice.jpg」という名前だけです。',
      cc1_ex: '👉 フォト共有サイトに戻ると:バケット <code>school-photos-2026</code> を作り、Alice の写真のキーは <code>2026/alice.jpg</code>、Bob は <code>2026/bob.jpg</code>。2026 フォルダに入っているように見えて、実はキーのプレフィックスが同じなだけです。',

      cc2_h: "② なぜ「無くならない」?耐久性と可用性",
      cc2_time: "約 4 分",
      cc2_analogy: "同じ写真を自動でたくさんコピーし、同じリージョン内の複数のビル(データセンター)に分けて保管するイメージ。1 棟で何かあっても、別のビルにコピーがあるので写真は無事。S3 は裏でこれをやってくれます。",
      cc2_aws: 'S3 は各オブジェクトを<b>自動で複数コピー</b>し、リージョン内の<b>複数の施設(データセンター)</b>に分散保存します(冗長化)。その <span class="term" data-term="durability">耐久性</span> は「9 が 11 個」(99.999999999%)——1000 万ファイル預けて、平均で数千万年に 1 個失うかどうか、という水準。<span class="term" data-term="availability">可用性</span> も高くほぼいつでも取り出せ、容量は<b>実質無限</b>で、事前にディスクを買う必要もありません。',
      cc2_ex: "👉 だから S3 は<b>普通のオンラインストレージではなく、企業級インフラ</b>です:生徒がアップした卒業写真を自分で別のディスクにバックアップしなくても、S3 が多拠点で冗長保存済み。「うっかり削除」以外でまず失われず、全校の写真が数百万枚に増えても容量の心配は不要です。",

      cc3_h: "③ バケットの 2 つの鉄則:名前は世界で一意 + リージョン固定",
      cc3_time: "約 4 分",
      cc3_analogy: "バケット名はドメイン名や電話番号のようなもの——<b>世界で重複不可</b>、誰かが取った名前は使えません。そしてどの都市のデータセンターに作るかは、一度決めたらその都市のもの。引っ越しはできません。",
      cc3_aws: '第一に、<span class="term" data-term="bucket">バケット</span> 名は<b>世界で一意</b>(アカウント内ではなく AWS 全体で一意)。十分ユニークにし、小文字・数字・ハイフンのみ。第二に、各バケットは<b>1 つの <span class="term" data-term="region">リージョン Region</span> に固定</b>(「はじめに」のリージョンの話を覚えていますか?)。データはそのリージョンに実際に置かれ、勝手に他へ移りません。',
      cc3_ex: '👉 この 2 つこそ<b>バケット作成時に一番多いエラーの原因</b>です:名前が使用済み → 「already exists」、より独自な <code>school-photos-2026-tokyo-a1</code> に変更;リージョン違い → 作ったのに「見つからない」、実は右上のリージョンが切り替わっているだけ。全員、先生指定の東京リージョンに作ればリソースが揃って探しやすいです。',

      cc4_h: "④ 権限とアクセス制御(本回の重点 1)",
      cc4_time: "約 12〜15 分",
      cc4_analogy: "バケットをマンションと考えてください。安全は 4 つの関門で守られます:① 建物の大元のブレーカー(落とせば誰も入れない);② 各住人に配る入館カード(その人がどこへ行けるか);② ある部屋のドアに貼る注意書き(その部屋に誰が入れるか);④ 部屋の中の物に付いた小さなタグ(古くてあまり使わない)。S3 のアクセス制御はこの 4 層の重なりです。",
      cc4_aws: 'S3 の 4 層アクセス制御(粗→細):① <span class="term" data-term="publicaccess">Block Public Access</span>——大元のスイッチ。既定で全 ON、あらゆる公開アクセスを一括拒否(最強の保険);② <span class="term" data-term="iampolicy">IAM ポリシー</span>——「人/プログラム」に紐づき、その ID が何の AWS リソースに何をできるかを定める;③ <span class="term" data-term="bucketpolicy">バケットポリシー Bucket Policy</span>——「バケット」に紐づく JSON ルール、誰がこのバケットに何をできるかを定める;④ <span class="term" data-term="acl">ACL</span>——とても古いオブジェクト単位の設定、今はほぼ非推奨。<b>覚えておくこと:大元のスイッチが塞いでいれば、後ろをいくら開放しても無効——これが S3 の情報漏えい防止の堀です。</b>',
      cc4_json_intro: '言葉だけでは抽象的。下は<b>実際のバケットポリシー</b>です。1 行ずつ分解します。下の各フィールドを押すと、左の該当コード行がハイライトされます:',
      policy1_title: "例 1:「全員」に画像の読み取りを許可(公開サイトで定番)",
      policy2_title: "例 2:「管理者」だけアップロード可(書き込み制限)",
      cc4_policy2_note: '例 1 との違い:ここでは <code>Principal</code> が <code>*</code>(全員)ではなく<b>特定の管理者 ID</b>;<code>Action</code> も「読み」<code>s3:GetObject</code> から「書き」<code>s3:PutObject</code> に。同じバケットでも、読みと書きを別々の相手に与えられます。',
      cc4_leastpriv: '🔑 <b>最小権限の原則</b>:常に「タスクに必要な最小限」だけ与えます。読みだけで済むなら書きは与えない、1 つのバケットで済むなら全部には広げない。例 1 が安全なのは「画像の読み取り」だけを開放しており、他人が削除も変更もできないからです。',
      cc4_ex: '👉 フォトサイトの実装方針:トップに出す画像は<b>例 1</b> のポリシーで全員に「読み」を開放;生徒のアップロードは公開書き込みにせず、裏側が <span class="term" data-term="iamrole">IAM ロール</span> で書き込むか、時間制限付きの <span class="term" data-term="presignedurl">署名付き URL(Presigned URL)</span> を発行してフロントから一時的にアップさせます——便利かつ門は開けっ放しにしない。',

      cc5_h: "⑤ ストレージクラス Storage Classes(本回の重点 2)",
      cc5_time: "約 6 分",
      cc5_analogy: "家の物も「よく使う物は手元、めったに使わない物は押し入れの奥」。手元は取り出しが速いが場所を取る(高い)、奥は安いが取り出しに手間。クラウドも同じ:<b>使う頻度</b>で段階を選び、大きく節約します。",
      cc5_aws: 'S3 の代表的な <span class="term" data-term="storageclass">ストレージクラス</span>:① <span class="term" data-term="standard">S3 Standard</span>——よくアクセス、取り出し最速、単価は最高;② <span class="term" data-term="standardia">Standard-IA</span>(低頻度アクセス)——たまに見る、保管は安いが取り出しに少し料金;③ <span class="term" data-term="glacier">Glacier 系</span>(アーカイブ)——ほぼ見ない長期保管、激安だが取り出しに数分〜数時間。<b>「冷たい」データほど深い段に置くと安くなります。</b>',
      cc5_ex: "👉 フォトサイト:今年の新歓・卒業式の写真は毎日見るので Standard;昨年のイベント写真はたまに振り返るので Standard-IA;5 年前の古い写真はほぼ誰も見ないので Glacier へ。これが S3 の<b>ストレージコスト削減の核心的価値</b>——同じデータでも置き場所で半分以下にできます。",

      cc6_h: "⑥ ライフサイクル管理 Lifecycle(本回の重点 3)",
      cc6_time: "約 5 分",
      cc6_analogy: "毎日手で箱を運ぶのは大変。ルールを決めましょう:「置いて 90 日動かなければ自動で押し入れへ;1 年経ったら自動で処分」。S3 はこのルールどおり自動実行してくれます。",
      cc6_aws: '前節を受けて:<span class="term" data-term="lifecycle">ライフサイクル Lifecycle</span> はバケットに<b>自動ルール</b>を設定し、オブジェクトを時間とともに<b>自動で</b>安いクラスへ移し(Standard → Standard-IA → Glacier)、期限が来たら<b>自動削除</b>します。設計が面倒なら <span class="term" data-term="inteltiering">Intelligent-Tiering</span> がアクセス状況を監視し、<b>自動で</b>最適な層に配置。これが企業の<b>ストレージコスト自動管理</b>の手段です。',
      cc6_ex: "👉 フォトサイトに 1 つルールを設定:各写真は<b>アップロードから 90 日</b>で自動的にアーカイブへ、<b>3 年</b>で自動削除(またはより深いアーカイブへ)。一度設定すれば以降の新しい写真も全部その通り。節約かつ手間いらず、人手の整理は不要です。",

      cc7_h: "⑦ バージョニング Versioning:自動で履歴を残す",
      cc7_time: "約 4 分",
      cc7_analogy: "文書作成の「履歴」と同じ:変更・上書きのたびにシステムが古い版を自動保存。間違えても、削除しても、いつでも前の版に戻せます。",
      cc7_aws: 'バケットで <span class="term" data-term="versioning">バージョニング Versioning</span> を有効にすると、同名オブジェクトの上書きや削除のたびに、S3 は古い版を<b>消さずに保持</b>します。誤削除?実は「削除マーク」が付いただけで、外せば戻る;誤上書き?古い版が残っており任意の履歴に復元可能。<b>「うっかり」対策の重要な保険です。</b>',
      cc7_ex: "👉 フォトサイト:生徒が <code>alice.jpg</code> を別人の写真で上書きしてしまった——バージョニングが有効なら慌てず、裏側でワンクリックで前の版に復元、元の写真がすぐ戻ります。無効だと元写真は本当に消えてしまいます。",

      cc8_h: "⑧ データ保護と暗号化(簡易版)",
      cc8_time: "約 3 分",
      cc8_analogy: "貴重品を送るとき:途中は開封防止の密封箱(誰も中身を開けない)、倉庫に着いたら金庫に施錠(倉庫を漁られても中は見えない)。データもこの 2 つの鍵です。",
      cc8_aws: '2 つの概念をやさしく:① <b>転送中の暗号化</b>——あなたと S3 の間をデータが通るとき <b>HTTPS</b> で暗号化し、途中の盗み見を防ぐ;② <span class="term" data-term="encryption">保存時の暗号化(静的暗号化)</span>——S3 に保存する際に<b>自動で暗号化</b>(現在は既定で有効)。ディスクを盗まれても中身は読めません。これは企業の<b>コンプライアンス要件</b>(ISO 27001 など)で重要。鍵の管理はさらに深い話なので今日はここまで。',
      cc8_ex: "👉 フォトサイトが保存するのは生徒の肖像写真=個人情報。転送中 + 保存時の暗号化で、生徒のプライバシーを守り、会社のセキュリティ監査も通りやすくなります。",

      cc9_h: "⑨ S3 の実際の用途:写真置き場だけじゃない",
      cc9_time: "約 3 分",
      cc9_analogy: "S3 をただのアルバムと思わないで。むしろ万能倉庫 + 出荷センター:在庫を保管し、そのまま外へ「出荷」(閲覧・ダウンロード)もでき、他システムの材料庫にもなります。",
      cc9_aws: 'S3 の代表的な用途:① <span class="term" data-term="statichosting">静的ウェブサイトホスティング</span>——ウェブページを S3 に置いてそのまま公開、<b>サーバー不要</b>;② バックアップと災害復旧——重要データの安全な複製;③ <span class="term" data-term="datalake">データレイク</span> / ビッグデータ分析——大量の生データを集約して分析;④ <span class="term" data-term="cloudfront">CloudFront</span> と組み合わせ世界中へ高速配信。',
      cc9_ex: "👉 全体のまとめ・次への橋渡し:私たちのフォトサイトの<b>トップページは、実は S3 に直接ホスティングできます</b>!だから第 1 回でまず S3 を学ぶのです——写真の倉庫であり、サイトの「顔」にもなる。複雑な動的機能は後で EC2 に任せますが、シンプルなページは S3 だけで十分こなせます。",

      concept_total_time: "本回のコア概念は全 9 節、解説は約 50 分(各節の所要時間は見出し横に表示、進行管理に便利)",
      concept_click_hint: "フィールドを押すと解説が出て、該当コード行がハイライトされます 👇",
      pf_version: '<span class="pf-k">Version</span>:ポリシー構文のバージョン。<code>2012-10-17</code> 固定でそのまま書けば OK。',
      pf_statement: '<span class="pf-k">Statement</span>:ルール本体。配列で複数ルールを入れられます。1 ルール = 「誰が何に何をできるか」。',
      pf_sid: '<span class="pf-k">Sid</span>:このルールのメモ名(任意)。自分が分かれば何でも OK。',
      pf_effect: '<span class="pf-k">Effect</span>:効果。<code>Allow</code>=許可、<code>Deny</code>=拒否。ここは許可。',
      pf_principal: '<span class="pf-k">Principal</span>:作用する「相手」。<code>"*"</code> は<b>全員</b>(誰でも)。特定 ID に絞るならその識別子を書く。',
      pf_action: '<span class="pf-k">Action</span>:許可する<b>操作</b>。<code>s3:GetObject</code> = オブジェクトの読み取り/ダウンロード(画像閲覧)。',
      pf_resource: '<span class="pf-k">Resource</span>:作用する<b>対象</b>。末尾 <code>/*</code> はこのバケット内の<b>全</b>オブジェクト。',

      c_s3_h: "① Amazon S3 とは?",
      c_s3_analogy: "「いっぱいにならない」セルフ収納スペースを想像してください。どれだけ物を入れても収まり、料金は「実際に入れた分」だけ毎月少し払う。しかも入れた物はほぼ無くなりません。倉庫がどう建っているか、どれくらい広いかは気にしなくて大丈夫。とにかく入れたい時、いつでも空きがあります。",
      c_s3_aws: 'AWS では、この収納スペースを <span class="term" data-term="s3">Amazon S3</span>(正式名 Simple Storage Service)と呼びます。写真・動画・ウェブページ・バックアップなど「ファイル」を入れる専用で、容量は実質無限と考えて OK。サイトに集まる生徒の写真は、すべてここに保存します。',
      c_s3_where: 'コンソールでの入口:ログイン後、上部の検索ボックスに <b>S3</b> と入力して開くと、S3 のメイン画面です。',

      c_bucket_h: "② バケット Bucket とは?",
      c_bucket_analogy: "収納スペースに物をそのまま山積みにはできません。まず「大きな箱」を借りて、その中に物を入れます。この大きな箱がバケットです。箱ごとに世界で一つだけの名前(番地のようなもの)があり、誰かが使った名前は使えません。",
      c_bucket_aws: 'S3 では、この大きな箱を <span class="term" data-term="bucket">Bucket(バケット)</span>と呼びます。ファイルを保存する前に、まずバケットを 1 つ作ります。今回はプロジェクト用に、生徒の写真を入れるバケットを <code>school-photos-2026</code> のような名前で作ります。',
      c_bucket_where: 'コンソールでの入口:S3 メイン画面 →「Buckets(バケット一覧)」→ オレンジのボタン「Create bucket(バケットを作成)」。',

      c_object_h: "③ オブジェクト Object とは?",
      c_object_analogy: "箱に入れた一つひとつ——1 枚の写真、1 つのファイル——が「オブジェクト」です。それぞれに名前のラベルが貼られていて、その名前で取り出します。",
      c_object_aws: 'S3 では、アップロードした各ファイルが <span class="term" data-term="object">Object(オブジェクト)</span>で、その名前(パスを含む)を <span class="term" data-term="key">Object Key(オブジェクトキー)</span>と呼びます。例えば <code>2026/alice.jpg</code> がオブジェクトキーです。写真 1 枚 = オブジェクト 1 つ、と覚えれば十分です。',
      c_object_where: "コンソールでの入口:あるバケットを開くと、並んでいる 1 行ずつがオブジェクトです。「Upload(アップロード)」で中に入れられます。",

      c_region_h: "④ リージョン Region とは?(とても重要)",
      c_region_analogy: "AWS は世界の多くの都市にデータセンターを建てています(東京・シンガポール・バージニアなど)。バケットを作る時に「どの都市のデータセンターに作るか」を選びます。各都市に収納庫を借りるようなもので、東京で借りた箱は、大阪の収納庫を見ても見つかりません。",
      c_region_aws: 'この「データセンターの所在地」を AWS では <span class="term" data-term="region">Region(リージョン)</span>と呼びます。<b>重要な注意:</b>クラスは最初に全員同じリージョン(例:東京 <code>ap-northeast-1</code>)に揃えます。違うと、作ったリソースが別のリージョンでは「消えたように」見つからず、初心者が一番戸惑うポイントです。',
      c_region_where: "コンソールでの入口:右上のお名前の横に現在のリージョン(例:「東京」)が表示されます。クリックで切り替え可能。先生が指定したリージョンになっているか確認してから操作を始めましょう。",

      diagram_title: "今のサイトの形",
      diagram_caption: "第 1 回が終わった時点:生徒の写真が S3 のバケットに保存されました。オレンジのハイライトが今日追加した部品です。次回以降、この図にどんどん組み上げていきます。",
      diagram_alt: "アーキテクチャ図:利用者(生徒)がブラウザから写真を、あるリージョン内の Amazon S3 バケットへアップロードし、バケットの中に写真オブジェクトが入っている。S3 の部分はオレンジでハイライトされ、第1回で追加した部品を示す。",
      dg_user: "生徒(ブラウザ)",
      dg_upload: "写真をアップロード",
      dg_region: "リージョン(例:東京)",
      dg_s3: "Amazon S3",
      dg_bucket: "バケット:school-photos",
      dg_obj1: "alice.jpg",
      dg_obj2: "bob.jpg",
      dg_obj3: "…",
      dg_legend_new: "今回の追加",
      dg_s3_sub: "シンプルストレージサービス",

      roadmap_title: "コースのサービス・ロードマップ",
      roadmap_hint: "この講座では 4 つの AWS サービスを、積み木のように毎回 1 つずつ追加していきます。ハイライトが今回の主役、他は次回以降に登場します。",

      handson_title: "ハンズオン:フォトサイトを自分で作る",
      lab_total_time: "実験は全 7 ステージ、合計約 60 分。各ステージを終えたら「完了」にチェック。進捗は自動保存され、次回もそのまま残ります。",
      lab_intro: "この一連の実験で、ゼロからバケットを作り、最後はウェブページを公開するところまで進みます。先生と一歩ずつ。各ステージ末尾の「チェックポイント」が、正しくできたら何が見えるかを教えてくれます。ボタン名などは実際のコンソールに合わせてください(画面は説明と少し違う場合があります)。",
      lab_progress_label: "実験の進捗",

      lab1_title: "ステージ 1 · バケット作成",
      lab1_time: "約 5 分",
      lab1_goal: "今回使うバケットを作成し、「名前は世界で一意」「リージョンを揃える」を体験する。",
      lab1_steps: '<ol class="steps"><li>コンソール上部の検索に <b>S3</b> と入れて開き、オレンジの「Create bucket(バケットを作成)」を押す。</li><li><b>Bucket name</b> に独自の名前を入力。おすすめ形式:school-photos-自分の名前-日付。<div class="copybox"><code>school-photos-alice-0605</code><button class="copybtn" data-copy="school-photos-alice-0605">コピー</button></div></li><li><b>Region(リージョン)</b> で、先生指定の同じリージョン(例:Asia Pacific (Tokyo) ap-northeast-1)を選ぶ。</li><li>他の項目は一旦そのまま、一番下の「Create bucket」を押す。</li></ol>',
      lab1_check: "バケット一覧に作成したバケットが現れ、Region が指定どおり。「name already exists」と出たら、より独自な名前で再試行——これが「世界で一意」です。",

      lab2_title: "ステージ 2 · オブジェクトのアップロード",
      lab2_time: "約 7 分",
      lab2_goal: "写真を数枚アップし、Object と Key を理解、「フォルダ」がキーのプレフィックスにすぎないことを確認する。",
      lab2_steps: '<ol class="steps"><li>作ったバケットを開き、「Upload(アップロード)」→「Add files」でローカル画像を 2〜3 枚選ぶ。</li><li>(任意)先に「Create folder(フォルダ作成)」で <code>2026</code> を作り、その中にアップして表示を観察。</li><li>「Upload」で確定し、状態が <b>Succeeded</b> になるまで待つ。</li><li>画像を 1 枚開き、その <b>Key(キー)</b> と詳細を確認する。</li></ol>',
      lab2_check: "アップした画像がバケットに現れ、各 1 枚が 1 オブジェクト。フォルダを使うと Key が 2026/xxx.jpg と表示——この 2026/ はキーのプレフィックスで、本物のディレクトリではありません。",

      lab3_title: "ステージ 3 · バケットポリシーの設定",
      lab3_time: "約 15 分",
      lab3_goal: "公開アクセスの大元スイッチを外し、画像を公開読み取りできるポリシーを書く。さらに「管理者だけアップ可」と対比する。",
      lab3_steps: '<ol class="steps"><li>バケットの「Permissions(アクセス許可)」タブを開く。</li><li>「Block public access(公開アクセスのブロック)」で <b>Edit</b>、大元スイッチのチェックを外し、保存して指示どおり <code>confirm</code> と入力して確定。⚠️ これは門を開ける操作。練習用バケットだけに行うこと。</li><li>同じページの「Bucket policy(バケットポリシー)」で <b>Edit</b>、下の JSON を貼り付け、Resource のバケット名を自分のものに変更。</li><li><b>Save changes</b> で保存。</li><li>オブジェクト一覧で画像を開き、<b>Object URL</b> をコピーして新しいタブで開く。</li><li>各フィールドを復習:Effect=Allow、Principal=*、Action=s3:GetObject、Resource=…/*。</li></ol>',
      lab3_check: "Object URL でブラウザから画像を直接開ければ公開読み取り成功。まだ Access Denied なら、たいてい Block Public Access を外し切れていません。",
      lab3_contrast: "下の「管理者だけアップ可」ポリシーと対比:Principal が * ではなく特定の ID に、Action も読み(s3:GetObject)から書き(s3:PutObject)に。同じバケットでも、読みと書きを別々の相手に与えられます。",

      lab4_title: "ステージ 4 · バージョニング実験",
      lab4_time: "約 8 分",
      lab4_goal: "バージョニングを有効化し、わざと「誤上書き」を起こして旧版を復元、誤削除防止を体感する。",
      lab4_steps: '<ol class="steps"><li>バケットの「Properties(プロパティ)」タブで「Bucket Versioning」を <b>Edit</b>、<b>Enable</b> を選んで有効化。</li><li>別の画像を用意し、既にアップ済みのどれかと<b>完全に同じ</b>ファイル名(例:alice.jpg)にリネーム。</li><li>その同名画像をアップして元を上書き。</li><li>オブジェクト一覧で「Show versions(バージョンを表示)」を ON、同じ Key の下に複数バージョンが見える。</li><li>最新バージョンを削除(または古い版をダウンロード)し、元の画像を現行に戻す。</li></ol>',
      lab4_check: "同じファイル名の下に複数バージョンが見え、上書き前の元画像を取り戻せる。もし有効化していなければ、元画像は本当に失われていました。",

      lab5_title: "ステージ 5 · ストレージクラスとライフサイクル",
      lab5_time: "約 8 分",
      lab5_goal: "オブジェクトのストレージクラスを確認/切替し、自動移動と期限削除のライフサイクルルールを作る。",
      lab5_steps: '<ol class="steps"><li>画像の詳細を開き現在の <b>Storage class</b>(既定 Standard)を確認;「Edit storage class」で Standard-IA への切替も体験できる。</li><li>バケットの「Management(管理)」タブで「Create lifecycle rule(ライフサイクルルール作成)」。</li><li>名前(例:archive-old-photos)を付け、対象はバケット全体。</li><li>「Transition current versions(現行バージョンの移行)」で、下の示範パラメータを設定:<b>30 日</b>後に Standard-IA、<b>90 日</b>後に Glacier アーカイブ。</li><li>「Expire(期限切れ削除)」で <b>365 日</b>後に削除を設定し、ルールを保存。</li></ol>',
      lab5_check: "管理タブに作成したルールが表示され、30 日で IA、90 日でアーカイブ、365 日で期限切れ。ルールは今後自動で実行され、手作業は不要です。",
      lab5_note: "示範パラメータの意味:アップから 30 日(冷え始め)→ 安い Standard-IA へ;90 日(ほぼ見ない)→ 最安の Glacier アーカイブへ;365 日(もう不要)→ 自動削除。注意:クラス移行やアーカイブ取り出しには少額の料金が発生する場合があります(無料枠超過時)。本練習はルール設定までで OK、実際の発火を待つ必要はありません。",

      lab6_title: "ステージ 6 · 静的ウェブサイトホスティング(クライマックス)",
      lab6_time: "約 12 分",
      lab6_goal: "index.html を S3 に置いて静的ホスティングを有効化し、S3 の URL でフォトウォールのページを開く——今回のクライマックス!",
      lab6_steps: '<ol class="steps"><li>まずバケットに <code>alice.jpg</code>、<code>bob.jpg</code> の 2 枚があることを確認(ステージ 2 のものでOK;ファイル名はページ内の記述と<b>完全一致・大文字小文字も</b>)。</li><li>PC で <code>index.html</code> を新規作成。中身は下の「標準トップページコード」をそのまま使用(コピーして index.html として保存)。</li><li>index.html をバケットの<b>ルート直下</b>(画像と同じ階層)にアップ。</li><li>バケット「Properties」→ 最下部「Static website hosting」で <b>Edit</b> → <b>Enable</b>、Index document に <code>index.html</code> を入力して保存。</li><li>Block Public Access が外れ、バケットポリシーが公開読み取りを許可していることを確認(ステージ 3 を踏襲)。</li><li>「Static website hosting」に戻り、表示された <b>Bucket website endpoint</b> をコピーして新しいタブで開く。</li></ol>',
      lab6_check: "その website endpoint URL で、自分のフォトウォール(タイトル + 画像 2 枚)がブラウザに表示される。おめでとう——サイトの「顔」が公開されました!画像が崩れるなら img の src とファイル名(大文字小文字含む)の不一致が原因;ページ全体が 403 なら公開設定とポリシーを確認。",
      lab6_codenote: "下はステージ 6 で使う標準トップページコードです。img の src のファイル名は、アップした画像と完全一致(大文字小文字含む)させてください。",

      lab7_title: "ステージ 7 · リソースの削除",
      lab7_time: "約 5 分",
      lab7_goal: "今回作ったオブジェクト・バージョン・バケットを削除し、課金が続くのを防ぐ。",
      lab7_steps: '<ol class="steps"><li>バケットで「Show versions」を ON、全オブジェクトと履歴バージョンを全選択して <b>Delete</b>(バージョニング有効時は版も一緒に削除必須)、指示どおり <code>permanently delete</code> と入力して確定。</li><li>ライフサイクルや静的ホスティングの設定は個別削除不要、バケット削除時に一緒に消えます。</li><li>バケット一覧に戻り、自分のバケットを選んで <b>Delete</b>、指示どおりバケット名を入力して確定。</li><li>一覧からそのバケットが消えたことを確認。</li></ol>',
      lab7_check: "一覧から自分のバケットが消えれば、オブジェクト・バージョン・バケットの片付け完了。これ以上課金されません。",
      lab7_why: "なぜ必ず消すか:AWS は使った分だけ課金。バージョニングを有効にすると旧版も容量を使い課金対象です。だからオブジェクト削除時は履歴版も一緒に消すこと——でないとバケットを消せず、こっそり課金が続きます。",

      code_replace_note: "⚠️ 例の <code>school-photos-2026</code> は必ず自分の世界で一意のバケット名に、対比例の <code>your-account-id</code> は自分の 12 桁アカウント ID に置き換えてください。",
      ih_intro: "下の説明を押すと、コードの該当行がハイライトされます 👇",
      ih_row1: '<span class="pf-k">6 行目 &lt;title&gt;</span>:ブラウザのタブに表示されるタイトル。自由に変更可。',
      ih_row2: '<span class="pf-k">24〜25 行目 &lt;img src&gt;</span>:ここのファイル名はバケットにアップした画像と<b>完全一致(大文字小文字も)</b>させること。違うと画像が崩れます。',
      ih_row3: '<span class="pf-k">7〜16 行目 &lt;style&gt;</span>:ページの見た目(配色・グリッド)。変えても変えなくても表示されます。',

      pitfalls_title: "よくあるつまずき",
      pf_1_q: "アップロード後、リンクを送っても開けない / Access Denied が出る?",
      pf_1_a: "それは正常です!S3 は初期状態で公開アクセスをすべてブロックし、データを守ります。見せるには「Block Public Access(公開アクセスのブロック)」を外して読み取りを許可する必要があります——ここは先生と一緒にやるので、勝手に開けないように。",
      pf_2_q: "バケット作成時に「名前が既に存在 / 不正」と言われ続ける?",
      pf_2_a: "バケット名は世界で一意で、使えるのは小文字・数字・ハイフンだけ。もっと個性的な名前に変えましょう(自分の名前+今日の日付など)。",
      pf_3_q: "作ったバケット / 写真が、しばらくすると「見つからない」?",
      pf_3_a: "たいていリージョンが変わっています!右上のリージョンを確認し、先生指定のリージョンに戻せば、バケットがまた現れます。",

      cleanup_title: "授業後のリソース削除",
      cleanup_why: "なぜ必ず消すの?AWS は使った分だけ課金されます。今日の操作はほぼ無料利用枠内ですが、「使い終わったら消す」習慣はとても大切。忘れたリソースがこっそり課金されるのを防ぎます。",
      cl_1_t: "まずバケットの中身を空にする",
      cl_1_d: "自分のバケットを開く → 中のオブジェクトを全選択 →「Delete(削除)」。バケットは空にしてからでないと消せません。",
      cl_2_t: "次にバケット本体を削除",
      cl_2_d: "バケット一覧に戻る → 自分のバケットを選択 →「Delete」→ 指示に従ってバケット名を入力して確定。",
      cl_3_t: "空になったか確認",
      cl_3_d: "バケット一覧から今日作ったバケットが消えていれば、片付け完了です。",

      quiz_title: "確認クイズ",
      quiz: [
        {
          q: "Amazon S3 を最も正確に説明しているのは?",
          options: [
            "電源を入れてプログラムを動かすクラウドサーバー",
            "ファイルを保存するオブジェクトストレージ。容量ほぼ無限・使った分だけ課金",
            "誰がログインでき、どんな権限を持つかを管理するサービス",
            "複数のマシンをつなぐ仮想ネットワーク"
          ],
          answer: 1,
          explain: "S3 はオブジェクトストレージで、ファイル保存専用。A はプログラムを動かす EC2、C は権限を管理する IAM、D はネットワークの VPC と取り違え——初心者が 4 サービスを混同しがちな点です。",
          review: "concept-s3"
        },
        {
          q: "コンソールで写真が 2026/ という「フォルダ」に入って見えます。S3 の構造として正しいのは?",
          options: [
            "S3 は内部で本物のディレクトリツリー(フォルダ)で管理している",
            "S3 の中身はフラットで、フォルダはキー名プレフィックスの見た目上の表現にすぎない",
            "各フォルダは実は独立したバケットである",
            "フォルダは実在し、フォルダごと削除する方が速い"
          ],
          answer: 1,
          explain: "S3 はフラット構造で、実在するのは「キー」というフルネームだけ。2026/alice.jpg の 2026/ はキーのプレフィックスで、コンソールがフォルダ風に見せています。A は最も多い誤解(PC のような本物のツリーがあると思い込む)、C はバケットとプレフィックスの混同。",
          review: "concept-s3"
        },
        {
          q: "作成時に「名前が既に存在」と出続け、昨日のバケットが「消えた」。正しい説明は?",
          options: [
            "名前はアカウント内で一意ならよい;消えたのはシステムが自動削除したから",
            "名前は世界で一意。より独自な名前に。消えたのは右上のリージョンが切り替わったから",
            "名前は重複可;消えたのは未払いだから",
            "名前は大文字必須;消えたのはブラウザキャッシュのせい"
          ],
          answer: 1,
          explain: "バケット名は「世界で一意」(AWS 全体)でアカウント内一意ではない——これがエラーの主因。リソースはリージョンに紐づくので、切り替えれば当然見えません。A は「世界で一意」を「アカウント内一意」と誤記。(名前は小文字のみ。)",
          review: "concept-region"
        },
        {
          q: "S3 標準の「9 が 11 個」(99.999999999%)の耐久性。正しい理解は?",
          options: [
            "99.999999999% の時間アクセスでき、停止しないという意味",
            "データがほぼ失われないという意味;守るのはハード故障で、自分の誤削除は防げない",
            "データは 100% 永遠に失われず、削除しても自動で戻る",
            "単価がおよそ 11 分の 1 に安くなるという意味"
          ],
          answer: 1,
          explain: "11 個の 9 は「耐久性」(データが失われない)であって「可用性」(いつでもアクセス)ではない——A は両者を混同。複数コピーでハード故障に備えますが、自分で削除すれば消えるので C も誤り。誤操作対策はバージョニングです。",
          review: "concept-durability"
        },
        {
          q: "全員に読み取りを許可する Bucket Policy を書いたのに、リンクが開けない(Access Denied)。最も考えられる原因は?",
          options: [
            "Bucket Policy は無効で、公開には ACL が必須",
            "バケットの Block Public Access(公開の大元スイッチ)がまだ ON で、最優先でポリシーを塞いでいる",
            "S3 は公開非対応で、先に CloudFront を被せる必要がある",
            "画像が大きすぎて無料枠を超えた"
          ],
          answer: 1,
          explain: "Block Public Access は「大元のスイッチ」で最優先:ON の間はポリシーをいくら開放しても無効、まず外す必要があります。A は古い ACL が必須という誤解、C は高速配信用の CloudFront を公開の前提と取り違え。",
          review: "concept-access"
        },
        {
          q: "ある Bucket Policy に \"Principal\": \"*\" と \"Action\": \"s3:GetObject\" とあります。意味は?",
          options: [
            "管理者(* は admin)だけが読み取れる",
            "誰でも指定範囲のオブジェクトを読み取り(ダウンロード)できる",
            "誰でもアップロードと削除ができる",
            "全員のアクセスを拒否する"
          ],
          answer: 1,
          explain: "Principal \"*\" は「全員」(管理者ではない)、Action s3:GetObject は「読み取り/ダウンロード」。A は * を管理者と誤読、C は「読み」(GetObject)を「書き」(PutObject)と混同、D は Effect が Allow(許可)であることを見落とし。",
          review: "concept-access"
        },
        {
          q: "5 年前のイベント写真はほぼ見ないが、たまに監査で取り出す。節約のため最適なのは?",
          options: [
            "S3 Standard のまま。いつでも見られれば良い",
            "Glacier アーカイブへ移す:激安で、必要時に取り出せる(数分〜数時間)",
            "削除して、必要になったら皆に再アップしてもらう",
            "社員のノート PC に全部ダウンロードして保管"
          ],
          answer: 1,
          explain: "ほぼ見ないが残すデータは Glacier アーカイブが最適:激安で、たまの取り出し遅延も許容範囲。A は節約にならず、C・D は信頼性を犠牲にし、監査時に見つからない・失う恐れ。",
          review: "concept-storageclass"
        },
        {
          q: "「各写真はアップ 90 日後に自動でアーカイブ、3 年後に自動削除」を、毎回手作業せずに実現したい。使うべきは?",
          options: [
            "スマホのアラームで、定期的に自分で移動・削除する",
            "ライフサイクル(Lifecycle)ルールを設定し、S3 に時間で自動実行させる",
            "バージョニングを有効化すれば、自動で移動・削除してくれる",
            "より高いストレージクラスに上げれば、システムが自動で片付ける"
          ],
          answer: 1,
          explain: "ライフサイクルは「時間で自動移動/期限削除」のための機能で、一度設定すれば恒久的に効きます。C は「バージョニング」(履歴を残す)と「ライフサイクル」(時間で移動・削除)の混同——まったく別の機能です。",
          review: "concept-lifecycle"
        },
        {
          q: "生徒が誤って別の画像で alice.jpg を上書きしました。元の画像を取り戻すには、事前に何を有効化?",
          options: [
            "静的暗号化(Encryption)。暗号化したファイルは自動で復元される",
            "バージョニング(Versioning):上書き前の旧版を保持し、ワンクリックで復元できる",
            "Block Public Access。ファイルをロックして変更させない",
            "Standard-IA。低頻度アクセスのファイルは上書きされない"
          ],
          answer: 1,
          explain: "バージョニングは上書き/削除前の旧版を残すので復元可能——誤操作対策の要。A は「暗号化」(盗み見防止)と「復元」(消失防止)の混同で無関係、C・D は履歴保持の機能を持ちません。",
          review: "concept-versioning"
        },
        {
          q: "用意した index.html を、ブラウザの URL で直接開けるようにしたい。最も簡単な方法は?",
          options: [
            "まず EC2 サーバーを 1 台買って動かす必要がある",
            "S3 の「静的ウェブサイトホスティング」を有効化し、発行された URL で開く",
            "ファイル名を public.html に変えれば自動で URL が付く",
            "無理。S3 は画像専用で、ウェブページは別サービスに置く"
          ],
          answer: 1,
          explain: "シンプルな静的ページ(HTML/CSS/画像)は S3 の「静的ウェブサイトホスティング」でそのまま公開でき、EC2 は不要——これが私たちのサイトのトップの方式です。A は初心者にありがちな過剰な複雑化、D は S3 が画像専用という誤解。",
          review: "concept-usecase"
        }
      ],

      summary_title: "今回のまとめ",
      summary_text: "今日は「フォト共有サイト」の最初の 1 ピースを作りました:Amazon S3 でバケットを作り、写真をオブジェクトとして保存。さらに、なぜリージョンを適当に選んではいけないか、なぜ初期状態では公開できないかも学びました。次回は新しい課題——<b>「誰がバケットに写真をアップできるか」をどう管理するか</b>。そこで IAM の登場です。",
      keepsake_title: "📸 記念に",
      keepsake_text: "自分のバケット一覧と今回のクイズのスコアをスクリーンショットで残し、学習の成果として記念にしましょう。そして——今回を終えたら、ぜひ仲間と一緒に記念写真を!",

      survey_title: "課後アンケート",
      survey_desc: "1 分だけ、今回の授業はどうだったか教えてください。今後の改善に役立てます。",
    },

    terms: {
      aws: { name: "AWS", desc: "アマゾン ウェブ サービス(Amazon Web Services)。「コンピュータ・ストレージ・ネットワークを貸し出す」巨大なクラウド事業者。必要な分だけ借り、使った分だけ払います。" },
      cloud: { name: "クラウド Cloud", desc: "自分でコンピュータや設備を買わず、ネット経由で他社が用意した計算・保存リソースを「借りる」仕組み。使った分だけ払い、いつでも増減できます。" },
      s3: { name: "Amazon S3", desc: "AWS のクラウドストレージ(Simple Storage Service)。写真・動画・バックアップなどファイルの保存専用。容量はほぼ無限、使用量で課金。" },
      bucket: { name: "Bucket(バケット)", desc: "S3 でファイルを入れる「大きな箱」。保存前に必ず 1 つ作る必要があり、名前は世界で一意です。" },
      object: { name: "Object(オブジェクト)", desc: "S3 のバケットに入れた 1 つひとつのファイル。写真 1 枚 = オブジェクト 1 つ。" },
      key: { name: "Object Key(オブジェクトキー)", desc: "バケット内でのオブジェクトの「フルネーム」(パスを含む)。これでファイルを特定します。例:2026/alice.jpg。" },
      region: { name: "Region(リージョン)", desc: "AWS のデータセンターがある地理的な場所(東京・シンガポールなど)。リソースは作成時のリージョンに属し、別リージョンでは見えません。" },
      console: { name: "マネジメントコンソール Console", desc: "AWS のウェブ操作画面。ログインして、マウス操作で各種クラウドリソースを作成・管理できます。" },
      publicaccess: { name: "パブリックアクセス Public Access", desc: "誰でもリンク経由でファイルにアクセスできる状態。S3 は初期状態で「ブロック」(Block Public Access)され、データを保護します。" },
      freetier: { name: "無料利用枠 Free Tier", desc: "AWS が新規ユーザーに提供する無料枠。一定の使用量までは無料。枠を超えたり、削除し忘れると料金が発生することがあります。" },
      prefix: { name: "プレフィックス Prefix", desc: "S3 のキー名でスラッシュ / の前の部分。S3 の内部はフラット構造で、「フォルダ」はプレフィックスごとの見た目上の表示にすぎません。" },
      durability: { name: "耐久性 Durability", desc: "データが失われない信頼度。S3 標準は 9 が 11 個(99.999999999%)。複数コピーの冗長化で実現します。" },
      availability: { name: "可用性 Availability", desc: "必要なときにデータへ正常にアクセスできる度合い。高い = ほぼいつでも取り出せる。" },
      bucketpolicy: { name: "バケットポリシー Bucket Policy", desc: "バケットに付けるルール。誰がバケット内のどのオブジェクトに何の操作(読み・書きなど)をできるかを定めます。" },
      iamrole: { name: "IAM ロール Role", desc: "一時的に「借りられる」権限のまとまり。プログラムやサービスがロールで AWS にアクセスし、コードに鍵を直書きせずに済みます。" },
      storageclass: { name: "ストレージクラス Storage Class", desc: "S3 のストレージ段階。アクセス頻度とコストに応じて選びます(Standard、Glacier など)。" },
      glacier: { name: "S3 Glacier", desc: "S3 のアーカイブ用クラス。非常に低価格で、めったにアクセスしない長期保管向け。取り出しはやや遅い。" },
      lifecycle: { name: "ライフサイクル Lifecycle", desc: "一定期間後にオブジェクトを自動で安いクラスへ移動、または自動削除する一連のルール。" },
      inteltiering: { name: "Intelligent-Tiering(インテリジェント階層化)", desc: "S3 の自動最適化クラス。アクセス状況に応じて自動で階層間を移動し、手間なくコストを節約します。" },
      statichosting: { name: "静的ウェブサイトホスティング", desc: "HTML・CSS・画像などの静的ページを S3 に置いてそのまま公開する機能。サーバー運用は不要です。" },
      cloudfront: { name: "Amazon CloudFront", desc: "AWS のグローバル CDN。コンテンツを利用者に近い拠点にキャッシュし、表示を高速化します。" },
      datalake: { name: "データレイク Data Lake", desc: "大量の生データ(多様な形式)を集約する保存基盤。多くは S3 を土台に、後続のビッグデータ分析に使います。" },
      iampolicy: { name: "IAM ポリシー IAM Policy", desc: "「人やプログラム」の ID に紐づく権限ルール。その ID が何の AWS リソースに何をできるかを定めます。次回で詳しく。" },
      acl: { name: "ACL(アクセスコントロールリスト)", desc: "とても古いオブジェクト単位のアクセス設定。今の AWS ではほぼ非推奨で、バケットポリシーや IAM を優先します。" },
      effect: { name: "Effect(効果)", desc: "ポリシーのフィールド。Allow=許可、Deny=拒否。そのルールが通すか塞ぐかを決めます。" },
      principal: { name: "Principal(プリンシパル)", desc: "ポリシーのフィールド。ルールが作用する「相手」。* は全員、特定の ID を指定も可能。" },
      action: { name: "Action(アクション)", desc: "ポリシーのフィールド。許可/拒否する具体操作。例:s3:GetObject(読み取り)、s3:PutObject(アップロード)。" },
      resource: { name: "Resource(リソース)", desc: "ポリシーのフィールド。ルールが作用する対象。ARN で表し、末尾 /* はバケット内の全オブジェクト。" },
      leastprivilege: { name: "最小権限の原則 Least Privilege", desc: "セキュリティの基本:タスクに必要な最小限の権限だけ与える。与えすぎないことでリスクを下げます。" },
      standard: { name: "S3 Standard(標準)", desc: "既定のストレージクラス。よくアクセスするデータ向けで、取り出し最速・単価は最高。" },
      standardia: { name: "S3 Standard-IA(低頻度アクセス)", desc: "たまにアクセスするデータ向け。保管単価は Standard より安いが、取り出しに少し料金がかかります。" },
      versioning: { name: "バージョニング Versioning", desc: "バケット単位の設定。有効にすると同名オブジェクトの上書き・削除のたびに旧版を保持、復元でき、誤操作を防ぎます。" },
      encryption: { name: "暗号化 Encryption", desc: "データを第三者に読めない暗号文にすること。転送中の暗号化(HTTPS)と保存時の暗号化(静的暗号化)があります。" },
      presignedurl: { name: "署名付き URL Presigned URL", desc: "時間制限付きの一時リンク。持つ人は限られた時間だけ特定オブジェクトをアップ/ダウンロードでき、別アカウントや公開バケットは不要。" },
    },

    /* 各 AWS サービスの正式名/略称/登場回(ページ間で再利用、公式風アイコンと併用) */
    svc: {
      s3_name: "Amazon S3",  s3_sub: "シンプルストレージサービス", s3_lesson: "第1回",
      iam_name: "AWS IAM",   iam_sub: "認証とアクセス権限",      iam_lesson: "第2回",
      ec2_name: "Amazon EC2", ec2_sub: "クラウドサーバー",       ec2_lesson: "第3回",
      vpc_name: "Amazon VPC", vpc_sub: "クラウドネットワーク",   vpc_lesson: "第4回",
    }
  }
};

/* 代码示例(语言无关,中日共用;在页面里做语法高亮 + 逐行高亮 + 一键复制) */
const CODE_SAMPLES = {
  policyPublicRead:
`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForPhotos",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::school-photos-2026/*"
    }
  ]
}`,
  policyAdminUpload:
`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "OnlyAdminCanUpload",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::your-account-id:user/admin" },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::school-photos-2026/*"
    }
  ]
}`,
  indexHtml:
`<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>语言学校 · 照片分享墙</title>
  <style>
    body { font-family: sans-serif; margin: 0; background: #f4f6f8; color: #222; }
    header { background: #232f3e; color: #fff; padding: 24px; text-align: center; }
    header h1 { margin: 0; font-size: 22px; }
    header p { margin: 8px 0 0; color: #ff9900; }
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
               gap: 12px; padding: 20px; max-width: 900px; margin: 0 auto; }
    .gallery img { width: 100%; border-radius: 8px; display: block; }
    footer { text-align: center; padding: 20px; color: #888; font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <h1>📸 语言学校 · 学员照片分享墙</h1>
    <p>由 Amazon S3 静态网站托管驱动</p>
  </header>
  <div class="gallery">
    <img src="alice.jpg" alt="学员照片 1">
    <img src="bob.jpg" alt="学员照片 2">
  </div>
  <footer>本页托管在 Amazon S3 · AWS 入门课作品</footer>
</body>
</html>`
};

/* 一键替换的问卷链接(老师自行填入) */
const SURVEY_URL_LESSON1 = "https://example.com/survey/lesson1";
const SURVEY_URL_LESSON2 = "https://example.com/survey/lesson2";
const SURVEY_URL_LESSON3 = "https://example.com/survey/lesson3";
const SURVEY_URL_LESSON4 = "https://example.com/survey/lesson4";
