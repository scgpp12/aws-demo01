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

      cc1_h: "① S3 是什么?三个必记的词:桶、对象、键",
      cc1_analogy: "还记得开头那个「永远装不满的储物间」吗?你往里放东西,得先有个箱子,东西还得有名字,这样以后才找得到。S3 就是这么个存文件的地方,全靠这三样东西运转。",
      cc1_aws: '在 S3 里:① <span class="term" data-term="bucket">桶 Bucket</span> 是装文件的大箱子;② <span class="term" data-term="object">对象 Object</span> 就是你放进去的每个文件(比如一张照片);③ <span class="term" data-term="key">键 Key</span> 是这个文件的完整名字,你靠键把文件找出来。一句话:<b>桶里放对象,对象用键来命名</b>。',
      cc1_folder: '⚠️ 一个常见误会:S3 里看到的「文件夹」其实是假的!S3 底层是<b>扁平</b>的,根本没有真正的文件夹。当你把照片命名为 <code>2026/alice.jpg</code> 时,控制台只是把斜杠 <code>/</code> 前面的 <span class="term" data-term="prefix">前缀</span> 显示成一个文件夹的样子,方便你看。真实存在的,只有「键 = 2026/alice.jpg」这一串名字而已。',
      cc1_ex: '👉 回到我们的照片网站:建一个桶 <code>school-photos-2026</code>,Alice 的照片对象键叫 <code>2026/alice.jpg</code>,Bob 的叫 <code>2026/bob.jpg</code>。看起来像放在 2026 文件夹里,其实只是键名前缀相同罢了。',

      cc2_h: "② 为什么说「丢不了」:超高持久性 + 高可用",
      cc2_analogy: "想象你把同一张照片自动复印了很多份,分别锁进同一座城市里好几栋不同的大楼。就算有一栋楼出了事,其它楼里还有副本,照片照样在。S3 默默替你做的就是这件事。",
      cc2_aws: 'S3 会把你的每个对象<b>自动存成多份副本</b>,分散放在一个区域内的多个机房里(冗余存储)。它的 <span class="term" data-term="durability">持久性</span> 高达「11 个 9」(99.999999999%)——通俗说就是:你存 1000 万个文件,平均要等上千万年才可能丢 1 个。同时它的 <span class="term" data-term="availability">可用性</span> 也很高,意思是你几乎随时都能取到文件。',
      cc2_ex: "👉 对照片网站来说:学员上传的毕业合影,不用你自己再备份到别的硬盘,S3 已经替你多地冗余保存,除了「手滑删除」,几乎不可能丢。",

      cc3_h: "③ 桶的两条铁律:名字全球唯一 + 绑定区域",
      cc3_analogy: "桶名就像网站域名或手机号——<b>全世界不能重复</b>,别人注册过的你就不能再用。而桶建在哪个城市的机房,一旦定了就属于那个城市,搬不走。",
      cc3_aws: '第一,<span class="term" data-term="bucket">桶</span> 的名字是<b>全球唯一</b>的(不是你账号内唯一,是全 AWS 唯一),所以要起得够独特,而且只能用小写字母、数字和短横线。第二,每个桶都<b>绑定在一个 <span class="term" data-term="region">区域 Region</span></b>(还记得「开始之前」讲的区域吗?),桶里的数据就实实在在放在那个区域,不会自己跑到别的区域去。',
      cc3_ex: '👉 我们给照片网站起名 <code>school-photos-2026</code> 万一被人用了,就改成 <code>school-photos-2026-tokyo-a1</code> 这种更独特的;并且统一建在老师指定的东京区域,全班资源都在一起,好找。',

      cc4_h: "④ 谁能看、谁能传:访问控制(下节课的引子)",
      cc4_analogy: "储物间再安全,也得管好「谁有钥匙」。默认情况下,你的箱子只有你自己能开;想让别人进,就得专门发钥匙,或者贴一张规则说明「谁可以来拿什么」。",
      cc4_aws: 'S3 默认<b>禁止一切公开访问</b>(<span class="term" data-term="publicaccess">Block Public Access</span>),保护你的数据不被乱看。要控制访问,有两种常用方式:① 给桶贴一张 <span class="term" data-term="bucketpolicy">桶策略</span>,写明「谁、能对哪些文件、做什么操作」;② 让你的程序用 <span class="term" data-term="iamrole">IAM 角色</span> 来访问,而<b>不要把密钥写死在代码里</b>(硬编码密钥极不安全)。这套「谁能做什么」的权限管理,正是下一课 IAM 的主题。',
      cc4_ex: "👉 我们的照片网站:首页图片想让所有人看,就用桶策略只开放「读取」这一类文件;而后台「上传照片」的功能,则让服务器用 IAM 角色去写入,既安全又不用在代码里塞密码。",

      cc5_h: "⑤ 省钱之道:存储类别与生命周期",
      cc5_analogy: "家里东西也分「常用的放手边、很少用的塞进储藏室深处」。放手边拿得快但占地方,塞深处便宜但拿出来慢。云存储也一样,按你多久用一次,挑不同档位更省钱。",
      cc5_aws: 'S3 有多种 <span class="term" data-term="storageclass">存储类别</span>:经常访问的用 <b>Standard</b>(标准,取用快);很久才看一次的归档数据放 <span class="term" data-term="glacier">S3 Glacier</span>(便宜很多,取用稍慢)。你还能设一条 <span class="term" data-term="lifecycle">生命周期</span> 规则,让旧文件<b>自动</b>从贵的档位转到便宜的档位;懒得操心的话,用 <span class="term" data-term="inteltiering">Intelligent-Tiering</span>,它会根据访问情况<b>自动</b>帮你优化成本。',
      cc5_ex: "👉 照片网站:今年的活动照放 Standard,大家常翻;三年前的旧照很少有人看,用生命周期规则自动转进 Glacier 归档,存储费立省一大截。",

      cc6_h: "⑥ S3 能干嘛:不只是存照片",
      cc6_analogy: "别把 S3 只当一个相册。它更像一个万能仓库 + 发货中心:能存货、能直接对外「发货」(让人下载、访问)、还能当原料库供别的系统加工。",
      cc6_aws: 'S3 的常见用途:① <span class="term" data-term="statichosting">静态网站托管</span>——可以直接把网页放在 S3 上对外访问,不用额外的服务器;② 备份与灾难恢复——重要数据的安全副本;③ <span class="term" data-term="datalake">数据湖</span> / 大数据分析——海量原始数据集中存放,供分析使用;④ 配合 <span class="term" data-term="cloudfront">CloudFront</span> 做全球加速分发,让世界各地的人都打开得飞快。',
      cc6_ex: "👉 重点预告:我们照片网站的<b>首页其实可以直接托管在 S3 上</b>!这就是为什么第一课先学 S3——它既是存照片的仓库,也能直接当网站的「门面」。后面我们会把更复杂的部分交给 EC2,但简单页面 S3 自己就能扛。",

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

      handson_title: "动手操作预告",
      handson_intro: "下面是今天上课会亲手做的事。现在先扫一眼有个印象,正式操作跟着老师一步步来。每步后面的「检查点」告诉你:做对了应该看到什么。",
      hs_1_t: "确认区域选对",
      hs_1_d: "看控制台右上角,确保是老师指定的区域(比如东京)。",
      hs_1_c: "右上角显示的城市名 = 老师说的那个,就对了。",
      hs_2_t: "创建一个桶",
      hs_2_d: '进入 S3 →「Create bucket」→ 给桶起一个全球唯一的名字(可以在名字后面加上自己名字或数字),其它选项暂时保持默认。',
      hs_2_c: "桶列表里出现了你刚起名字的那个桶。",
      hs_3_t: "上传一张照片",
      hs_3_d: "点进你的桶 →「Upload」→ 选一张本地照片 → 确认上传。",
      hs_3_c: "桶里出现了这张照片,显示为一个对象,大小不为 0。",
      hs_4_t: "(进阶)让照片能被打开",
      hs_4_d: "默认情况下别人打不开这张照片。老师会演示如何安全地开放访问,你能拿到一个可以点开的图片链接。",
      hs_4_c: "把图片链接发给同桌,对方能在浏览器里看到这张照片。",

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
          q: "下面哪个比喻最贴近 Amazon S3?",
          options: [
            "一台需要你自己开机关机的电脑",
            "一个几乎装不满、按用量付费的云端储物间",
            "一张控制谁能进门的门禁卡",
            "一段连接两地的网线"
          ],
          answer: 1,
          explain: "S3 是用来「存文件」的云存储,容量近乎无限、按实际用量付费,就像一个永远有空位的储物间。",
          review: "concept-s3"
        },
        {
          q: "在 S3 里,你必须先创建什么,才能往里面放文件?",
          options: ["一台服务器", "一个区域", "一个桶 Bucket", "一张门禁卡"],
          answer: 2,
          explain: "桶(Bucket)就像储物间里的大箱子,任何文件都要先有桶才能存进去。",
          review: "concept-bucket"
        },
        {
          q: "关于「区域 Region」,下面说法正确的是?",
          options: [
            "区域随便选,反正资源到处都能看到",
            "区域就是桶的名字",
            "资源属于你创建它时所选的那个区域,换了区域就看不到了",
            "区域是用来登录的密码"
          ],
          answer: 2,
          explain: "资源是「分区域」存放的。新手常因为右上角区域被切换,就以为自己的桶不见了。",
          review: "concept-region"
        },
        {
          q: "你上传了一张照片,把链接发给同学却显示「Access Denied」,最可能的原因是?",
          options: [
            "照片太大了",
            "S3 默认阻止公开访问,还没开放读取权限",
            "区域选成了东京",
            "桶的名字太短"
          ],
          answer: 1,
          explain: "S3 默认「Block Public Access」开着,保护你的数据。要别人能看,需要专门开放访问权限。",
          review: "pitfalls"
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

      cc1_h: "① S3 とは?必ず覚える 3 語:バケット・オブジェクト・キー",
      cc1_analogy: "冒頭の「いっぱいにならない収納庫」を思い出してください。物を入れるにはまず箱が必要で、物には名前が要る。そうして初めて取り出せます。S3 はまさにそんなファイル置き場で、3 つの要素で動いています。",
      cc1_aws: 'S3 では:① <span class="term" data-term="bucket">バケット Bucket</span> が物を入れる大きな箱;② <span class="term" data-term="object">オブジェクト Object</span> が入れる 1 つひとつのファイル(写真など);③ <span class="term" data-term="key">キー Key</span> がそのファイルのフルネームで、これで取り出します。ひとことで:<b>バケットにオブジェクトを入れ、キーで名前を付ける</b>。',
      cc1_folder: '⚠️ よくある誤解:S3 で見える「フォルダ」は実は偽物!S3 の中身は<b>フラット(平ら)</b>で、本当のフォルダはありません。写真を <code>2026/alice.jpg</code> と名付けると、コンソールがスラッシュ <code>/</code> の前の <span class="term" data-term="prefix">プレフィックス</span> をフォルダ風に見せているだけ。実在するのは「キー = 2026/alice.jpg」という名前だけです。',
      cc1_ex: '👉 フォト共有サイトに戻ると:バケット <code>school-photos-2026</code> を作り、Alice の写真のキーは <code>2026/alice.jpg</code>、Bob は <code>2026/bob.jpg</code>。2026 フォルダに入っているように見えて、実はキーのプレフィックスが同じなだけです。',

      cc2_h: "② なぜ「無くならない」?高い耐久性と可用性",
      cc2_analogy: "同じ写真を自動でたくさんコピーし、同じ都市の複数のビルに分けて保管するイメージ。1 棟で何かあっても、別のビルにコピーがあるので写真は無事。S3 は裏でこれをやってくれます。",
      cc2_aws: 'S3 は各オブジェクトを<b>自動で複数コピー</b>し、リージョン内の複数のデータセンターに分散保存します(冗長化)。その <span class="term" data-term="durability">耐久性</span> は「9 が 11 個」(99.999999999%)——たとえば 1000 万ファイル預けて、平均で数千万年に 1 個失うかどうか、という水準。<span class="term" data-term="availability">可用性</span> も高く、ほぼいつでも取り出せます。',
      cc2_ex: "👉 フォトサイトなら:生徒がアップした卒業写真を、自分で別のディスクにバックアップしなくても、S3 が多拠点で冗長保存済み。「うっかり削除」以外でまず失われません。",

      cc3_h: "③ バケットの 2 つの鉄則:名前は世界で一意 + リージョンに固定",
      cc3_analogy: "バケット名はドメイン名や電話番号のようなもの——<b>世界で重複不可</b>、誰かが取った名前は使えません。そしてどの都市のデータセンターに作るかは、一度決めたらその都市のもの。引っ越しはできません。",
      cc3_aws: '第一に、<span class="term" data-term="bucket">バケット</span> 名は<b>世界で一意</b>(アカウント内ではなく AWS 全体で一意)。十分ユニークにし、小文字・数字・ハイフンのみ使えます。第二に、各バケットは<b>1 つの <span class="term" data-term="region">リージョン Region</span> に固定</b>(「はじめに」のリージョンの話を覚えていますか?)。データはそのリージョンに実際に置かれ、勝手に他へ移りません。',
      cc3_ex: '👉 サイト名 <code>school-photos-2026</code> が使われていたら <code>school-photos-2026-tokyo-a1</code> のように、よりユニークに。そして全員、先生指定の東京リージョンに作れば、クラスのリソースが一箇所に揃って探しやすいです。',

      cc4_h: "④ 誰が見られる・誰が送れる:アクセス制御(次回への布石)",
      cc4_analogy: "収納庫が頑丈でも、「鍵を誰が持つか」の管理は必要。初期状態では自分の箱は自分しか開けられず、他人を入れるには鍵を渡すか、「誰が何を取って良いか」のルールを貼る必要があります。",
      cc4_aws: 'S3 は初期状態で<b>あらゆる公開アクセスを禁止</b>(<span class="term" data-term="publicaccess">Block Public Access</span>)し、データを守ります。アクセス制御の代表的な方法は 2 つ:① バケットに <span class="term" data-term="bucketpolicy">バケットポリシー</span> を貼り、「誰が・どのファイルに・何をできるか」を定める;② プログラムは <span class="term" data-term="iamrole">IAM ロール</span> で S3 にアクセスし、<b>コードに鍵を直書きしない</b>(ハードコードは非常に危険)。この「誰が何をできるか」の管理が、まさに次回 IAM のテーマです。',
      cc4_ex: "👉 フォトサイト:トップ画像は全員に見せたいので、バケットポリシーで「読み取り」だけ公開;裏側の「アップロード」機能はサーバーが IAM ロールで書き込み、安全かつコードにパスワード不要です。",

      cc5_h: "⑤ 節約のコツ:ストレージクラスとライフサイクル",
      cc5_analogy: "家の物も「よく使う物は手元、めったに使わない物は押し入れの奥」。手元は取り出しが速いが場所を取り、奥は安いが取り出しに手間。クラウドも、使う頻度で段階を選ぶとお得です。",
      cc5_aws: 'S3 には複数の <span class="term" data-term="storageclass">ストレージクラス</span> があります:よく使うものは <b>Standard</b>(標準・取り出し速い)、めったに見ない長期保管は <span class="term" data-term="glacier">S3 Glacier</span>(ずっと安い・取り出しは遅め)。<span class="term" data-term="lifecycle">ライフサイクル</span> ルールを設定すれば、古いファイルを<b>自動で</b>安いクラスへ移動。面倒なら <span class="term" data-term="inteltiering">Intelligent-Tiering</span> が、アクセス状況に応じて<b>自動で</b>コストを最適化してくれます。',
      cc5_ex: "👉 フォトサイト:今年のイベント写真は Standard でサクサク閲覧;3 年前の古い写真はライフサイクルで自動的に Glacier へ移し、保管費を大きく節約できます。",

      cc6_h: "⑥ S3 で何ができる?写真置き場だけじゃない",
      cc6_analogy: "S3 をただのアルバムと思わないで。むしろ万能倉庫 + 出荷センター:在庫を保管し、そのまま外へ「出荷」(ダウンロード・閲覧)もでき、他システムの材料庫にもなります。",
      cc6_aws: 'S3 の代表的な用途:① <span class="term" data-term="statichosting">静的ウェブサイトホスティング</span>——ウェブページを S3 に置いてそのまま公開、サーバー不要;② バックアップと災害復旧——重要データの安全な複製;③ <span class="term" data-term="datalake">データレイク</span> / ビッグデータ分析——大量の生データを集約して分析に活用;④ <span class="term" data-term="cloudfront">CloudFront</span> と組み合わせて世界中へ高速配信。',
      cc6_ex: "👉 重要予告:私たちのフォトサイトの<b>トップページは、実は S3 に直接ホスティングできます</b>!だから第 1 回でまず S3 を学ぶのです——写真の倉庫であり、サイトの「顔」にもなる。複雑な部分は後で EC2 に任せますが、シンプルなページは S3 だけで十分こなせます。",

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

      handson_title: "ハンズオンの予告",
      handson_intro: "今日、実際に手を動かす内容です。まずは一通り眺めてイメージを掴みましょう。本番は先生と一緒に一歩ずつ。各ステップの「チェックポイント」は、正しくできたら何が見えるかを教えてくれます。",
      hs_1_t: "リージョンの確認",
      hs_1_d: "コンソール右上を見て、先生が指定したリージョン(例:東京)になっているか確認。",
      hs_1_c: "右上に表示された都市名 = 先生が言った場所、なら OK。",
      hs_2_t: "バケットを作成",
      hs_2_d: 'S3 →「Create bucket」→ 世界で一意の名前を付ける(名前の後ろに自分の名前や数字を足すと良い)。他の項目は一旦そのまま。',
      hs_2_c: "バケット一覧に、今付けた名前のバケットが現れる。",
      hs_3_t: "写真をアップロード",
      hs_3_d: "自分のバケットを開く →「Upload」→ ローカルの写真を選ぶ → アップロードを確定。",
      hs_3_c: "バケット内に写真が 1 つのオブジェクトとして現れ、サイズが 0 ではない。",
      hs_4_t: "(発展)写真を開けるようにする",
      hs_4_d: "初期状態では他の人はこの写真を開けません。先生が安全に公開する方法を実演し、クリックで開ける画像 URL を手に入れます。",
      hs_4_c: "画像 URL を隣の人に送ると、相手がブラウザでこの写真を見られる。",

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
          q: "Amazon S3 に一番近いたとえはどれ?",
          options: [
            "自分で電源を入れたり切ったりするコンピュータ",
            "ほぼ満杯にならず、使った分だけ払うクラウドの収納庫",
            "誰が入れるかを管理する入館カード",
            "二地点をつなぐ LAN ケーブル"
          ],
          answer: 1,
          explain: "S3 は「ファイルを保存する」クラウドストレージ。容量はほぼ無限、実際の使用量で課金。いつでも空きのある収納庫のようなものです。",
          review: "concept-s3"
        },
        {
          q: "S3 でファイルを入れる前に、まず何を作る必要がある?",
          options: ["サーバー", "リージョン", "バケット Bucket", "入館カード"],
          answer: 2,
          explain: "バケット(Bucket)は収納庫の大きな箱。どんなファイルも、まずバケットがないと保存できません。",
          review: "concept-bucket"
        },
        {
          q: "「リージョン Region」について正しいのは?",
          options: [
            "どこを選んでも、リソースはどこからでも見える",
            "リージョンはバケットの名前のこと",
            "リソースは作成時に選んだリージョンに属し、別リージョンでは見えない",
            "リージョンはログイン用のパスワード"
          ],
          answer: 2,
          explain: "リソースはリージョンごとに保存されます。右上のリージョンが切り替わって、バケットが消えたと勘違いするのが初心者あるある。",
          review: "concept-region"
        },
        {
          q: "写真をアップしてリンクを送ったら「Access Denied」。最も考えられる原因は?",
          options: [
            "写真が大きすぎる",
            "S3 が初期状態で公開アクセスをブロックし、読み取り許可がまだ",
            "リージョンを東京にした",
            "バケット名が短すぎる"
          ],
          answer: 1,
          explain: "S3 は初期状態で「Block Public Access」が有効でデータを保護します。見せるには公開アクセスの許可が必要です。",
          review: "pitfalls"
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

/* 一键替换的问卷链接(老师自行填入) */
const SURVEY_URL_LESSON1 = "https://example.com/survey/lesson1";
const SURVEY_URL_LESSON2 = "https://example.com/survey/lesson2";
const SURVEY_URL_LESSON3 = "https://example.com/survey/lesson3";
const SURVEY_URL_LESSON4 = "https://example.com/survey/lesson4";
