"use client";

import { useEffect, useMemo, useState } from "react";
import rawCatalog from "./jd-products.json";

type RawProduct = {
  id: number;
  sku: string;
  title: string;
  url: string;
  image: string;
  variants: Array<{ label: string; image: string }>;
};

type Product = {
  id: string;
  sku: string;
  title: string;
  character: string;
  variant: string;
  brand: string;
  ip: string;
  category: "手办" | "拼装模型";
  image: string;
  url: string;
};

const JD_STORE_URL = "https://mall.jd.com/index-86567558.html?from=pc&cid=0";

const ipPatterns: Array<[string, RegExp]> = [
  ["海贼王", /海贼王|海贼船/],
  ["Re:从零开始的异世界生活", /Re:\s*从零|从零开始|异世界生活|RE0/i],
  ["咒术回战", /咒术回战/],
  ["魔女之旅", /魔女之旅/],
  ["七龙珠", /七龙珠|龙珠/],
  ["宝可梦", /宝可梦|神奇宝贝|宠物小精灵/],
  ["鬼灭之刃", /鬼灭之刃/],
  ["五等分的花嫁", /五等分/],
  ["进击的巨人", /进击的巨人/],
  ["新世纪福音战士", /福音战士|\bEVA\b/i],
  ["赛马娘", /赛马娘/],
  ["辉夜大小姐", /辉夜大小姐/],
  ["初音未来", /初音未来|重音|世界计划|缤纷舞台/],
  ["更衣人偶坠入爱河", /更衣人偶/],
  ["命运石之门", /命运石之门/],
  ["洛天依", /洛天依/],
  ["全职猎人", /全职猎人/],
  ["青春猪头少年", /青春猪头|青春期笨蛋/],
  ["为美好的世界献上祝福", /美好的世界/],
  ["明日方舟", /明日方舟/],
  ["电锯人", /电锯人|链锯人/],
  ["排球少年", /排球少年/],
  ["蔚蓝档案", /蔚蓝档案/],
  ["孤独摇滚", /孤独摇滚/],
  ["火影忍者", /火影忍者/],
  ["魔卡少女樱", /魔卡少女樱/],
  ["间谍过家家", /间谍过家家/],
  ["Fate / FGO", /\bFate\b|\bFGO\b|命运冠位/i],
  ["漫威", /漫威|复仇者联盟|蜘蛛侠/],
  ["东京复仇者", /东京复仇者/],
  ["JOJO的奇妙冒险", /JOJO/i],
  ["死神", /死神/],
  ["刃牙", /刃牙/],
  ["葬送的芙莉莲", /葬送的芙莉莲/],
  ["约会大作战", /约会大作战/],
  ["转生史莱姆", /转生变成史莱姆/],
  ["邻座的艾莉同学", /邻座的艾莉/],
  ["胜利女神", /胜利女神/],
  ["哈利·波特", /哈利[·・]?波特/],
  ["哭泣少女乐队", /哭泣少女/],
  ["假面骑士", /假面骑士/],
  ["名侦探柯南", /名侦探柯南/],
  ["神椿市建设中", /神椿市/],
  ["圣斗士星矢", /圣斗士/],
  ["路人女主的养成方法", /路人女主/],
  ["怪兽8号", /怪兽8号/],
  ["银魂", /银魂/],
  ["无职转生", /无职转生/],
  ["蓝色监狱", /蓝色监狱|蓝锁/],
  ["美少女战士", /美少女战士/],
  ["三国创杰传", /三国创杰传/],
  ["游戏人生", /游戏人生/],
  ["OVERLORD", /OVERLORD/i],
  ["刀剑神域", /刀剑神域/],
  ["胆大党", /当哒当|胆大党/],
  ["蜡笔小新", /蜡笔小新/],
  ["游戏王", /游戏王/],
  ["我推的孩子", /我推的孩子/],
  ["莉可丽丝", /莉可丽丝/],
  ["坂本日常", /坂本日常/],
  ["四月是你的谎言", /四月是你的谎言/],
  ["来自深渊", /来自深渊/],
  ["绯染天空", /绯染天空/],
  ["黄金神威", /黄金神威/],
  ["摇曳露营", /摇曳露营/],
  ["2.5次元的诱惑", /2\.5次元/],
  ["幽游白书", /幽游白书/],
  ["魔法少女小圆", /魔法少女/],
  ["偶像大师", /偶像大师/],
  ["黑子的篮球", /黑子的篮球/],
  ["药屋少女的呢喃", /药屋少女/],
  ["莱莎的炼金工房", /莱莎的炼金工房/],
  ["一拳超人", /一拳超人/],
  ["福星小子", /福星小子/],
  ["数码宝贝", /数码宝贝/],
  ["物理魔法使马修", /物理魔法使马修/],
  ["LoveLive!", /LoveLive/i],
  ["通灵王", /通灵王/],
  ["地狱乐", /地狱乐/],
  ["超级索尼子", /超级索尼子/],
  ["废渊战鬼", /废渊战鬼/],
  ["机动战士高达", /高达|境界战机/],
];

const characterNames: Record<string, string[]> = {
  "海贼王": ["蒙奇·D·路飞", "克洛克达尔", "汉库克", "佩罗娜", "蕾贝卡", "白星公主", "杰克逊号", "路飞", "索隆", "娜美", "山治", "罗杰", "路奇", "艾斯", "萨博", "巴基", "女帝", "布鲁克", "乌索普", "乌塔", "沙鳄", "大熊", "小菊", "罗"],
  "咒术回战": ["五条悟", "虎杖悠仁", "乙骨忧太", "钉崎野蔷薇", "禅院真希", "狗卷棘", "伏黑惠", "熊猫"],
  "七龙珠": ["自在极意功孙悟空", "孙悟空", "小悟空", "孙悟天", "贝吉塔", "弗利萨", "沙鲁", "短笛"],
  "鬼灭之刃": ["灶门炭治郎", "灶门祢豆子", "栗花落香奈乎", "炼狱杏寿郎", "宇髄天元", "我妻善逸", "富冈义勇", "蝴蝶忍", "伊之助", "无惨", "祢豆子", "音柱"],
  "火影忍者": ["宇智波带土", "漩涡鸣人", "千手扉间", "千手柱间", "春野樱", "卡卡西", "日向雏田", "秋道丁次", "九喇嘛", "雏田"],
  "葬送的芙莉莲": ["芙莉莲", "菲伦", "辛美尔", "阿乌拉"],
  "Re:从零开始的异世界生活": ["碧翠丝", "爱蜜莉雅", "蕾姆", "拉姆"],
  "五等分的花嫁": ["中野一花", "中野二乃", "中野三玖", "中野四叶", "中野五月", "一花", "二乃", "三玖", "四叶", "五月"],
  "宝可梦": ["MEGA喷火龙X", "喷火龙X", "暗黑酋雷姆", "阿尔宙斯", "超梦", "伊布"],
  "初音未来": ["初音未来", "重音", "花里实乃里"],
  "机动战士高达": ["RX-78-2", "巴巴托斯", "独角兽高达", "强袭高达", "能天使", "沙扎比", "量子00Q", "高达"],
  "进击的巨人": ["艾伦", "三笠", "利威尔"],
  "魔女之旅": ["伊蕾娜"],
  "新世纪福音战士": ["明日香", "绫波丽", "初号机", "零号机"],
  "孤独摇滚": ["后藤一里", "喜多郁代", "伊地知虹夏", "山田凉"],
  "蓝色监狱": ["洁世一", "千切豹马", "凪诚士郎", "蜂乐回"],
  "OVERLORD": ["雅儿贝德", "安兹"],
  "我推的孩子": ["有马加奈", "星野爱", "露比", "阿库亚"],
  "莉可丽丝": ["锦木千束", "井之上泷奈"],
};

function detectIp(title: string) {
  return ipPatterns.find(([, pattern]) => pattern.test(title))?.[0] || "其他作品";
}

function detectBrand(title: string) {
  if (/万代|BANDAI|banpresto|眼镜厂/i.test(title)) return "BANDAI / BANPRESTO";
  if (/世嘉|SEGA/i.test(title)) return "SEGA";
  if (/TAITO/i.test(title)) return "TAITO";
  if (/FURYU|FuRyu/i.test(title)) return "FURYU";
  if (/GSC|GoodSmile|良笑/i.test(title)) return "GOOD SMILE";
  if (/ANIPLEX/i.test(title)) return "ANIPLEX";
  return "正版授权";
}

function selectedStyle(title: string) {
  const imported = title.match(/【[^】]+】\s*(.+)$/);
  if (imported?.[1]) return imported[1].trim();
  const tail = title.match(/(?:礼物|雕像|装饰)\s+(.{2,55})$/);
  return (tail?.[1] || title.slice(-42)).trim();
}

function detectCharacter(ip: string, label: string, title: string) {
  const names = [...(characterNames[ip] || [])].sort((a, b) => b.length - a.length);
  const fromLabel = names.find((name) => label.replace(/\s+/g, "").includes(name.replace(/\s+/g, "")));
  if (fromLabel) return fromLabel;
  const fromTitle = names.find((name) => title.replace(/\s+/g, "").includes(name.replace(/\s+/g, "")));
  if (fromTitle) return fromTitle;

  const cleaned = label
    .replace(/【[^】]+】/g, " ")
    .replace(/\b(?:BANDAI|BANPRESTO|SEGA|TAITO|FURYU|GSC|DXF|ROS|KOA|SPM|FES|BWFC|Q\s*posket|Luminasta|Yumemirize|Coreful|Aerial|ESP|TTI|HG|MG|RG)\b/gi, " ")
    .replace(/眼镜厂|万代|世嘉|日本进口|日版进口|原装进口|特别版|限定版|原色|异色版|礼服|泳装|兔女郎|泡面压|坐姿|小坐|战斗版|改进版|高配色|特别配色|特别色|A款|B款|白色|黑色|浅色/g, " ")
    .replace(/[-—]\s*\d+(?:\.\d+)?\s*CM\b.*$/i, " ")
    .replace(/\b\d+(?:\.\d+)?\s*CM\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const candidates = cleaned.match(/[\u3400-\u9fff·・]{2,10}/g) || [];
  return candidates.find((item) => !/^(和之国|未来岛|历史盒子|英姿人偶|人气排名|全新正品|世界计划|超级赛亚人)$/.test(item)) || cleaned.slice(0, 18) || "其他角色";
}

const catalogCollections = (rawCatalog as RawProduct[]).filter((item) => !/^运费差价/.test(item.title));

const products: Product[] = catalogCollections.flatMap((item) => {
  const ip = detectIp(item.title);
  const baseStyle = selectedStyle(item.title);
  const options = item.variants.length ? item.variants : [{ label: baseStyle, image: item.image }];
  return options.map((option, index) => {
    const variant = (option.label || baseStyle).trim();
    return {
      id: `${item.sku}-${index}`,
      sku: item.sku,
      title: item.title,
      character: detectCharacter(ip, variant, item.title),
      variant,
      brand: detectBrand(item.title),
      ip,
      category: /高达|拼装|30MS|境界战机|甲虫机娘/i.test(item.title) ? "拼装模型" : "手办",
      image: option.image || item.image,
      url: item.url,
    };
  });
});

const categories = ["全部", "手办", "拼装模型"] as const;

export default function Home() {
  const [category, setCategory] = useState<(typeof categories)[number]>("全部");
  const [selectedIp, setSelectedIp] = useState("海贼王");
  const [selectedCharacter, setSelectedCharacter] = useState("全部角色");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState(36);
  const [toast, setToast] = useState("");

  const ipGroups = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.ip))).map((ip) => {
      const scoped = products.filter((product) => product.ip === ip);
      return { ip, characterCount: new Set(scoped.map((product) => product.character)).size, styleCount: scoped.length };
    }).sort((a, b) => b.styleCount - a.styleCount || a.ip.localeCompare(b.ip, "zh-CN"));
  }, []);

  const charactersForIp = useMemo(() => {
    if (selectedIp === "全部IP") return [];
    const scoped = products.filter((product) => product.ip === selectedIp);
    return Array.from(new Set(scoped.map((product) => product.character))).map((character) => {
      const styles = scoped.filter((product) => product.character === character);
      return { character, styleCount: styles.length, image: styles[0].image };
    }).sort((a, b) => b.styleCount - a.styleCount || a.character.localeCompare(b.character, "zh-CN"));
  }, [selectedIp]);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = category === "全部" || product.category === category;
      const ipMatch = selectedIp === "全部IP" || product.ip === selectedIp;
      const characterMatch = selectedCharacter === "全部角色" || product.character === selectedCharacter;
      const queryMatch = !normalized || `${product.title}${product.variant}${product.character}${product.brand}${product.ip}`.toLowerCase().includes(normalized);
      return categoryMatch && ipMatch && characterMatch && queryMatch;
    });
  }, [category, query, selectedCharacter, selectedIp]);

  const displayedProducts = visibleProducts.slice(0, displayLimit);
  const heroProduct = products[0];

  useEffect(() => {
    document.body.style.overflow = searchOpen || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen, menuOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function browseCategory(nextCategory: (typeof categories)[number]) {
    setCategory(nextCategory);
    setSelectedIp("全部IP");
    setSelectedCharacter("全部角色");
    setDisplayLimit(36);
    setMenuOpen(false);
    document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseIp(nextIp: string) {
    setSelectedIp(nextIp);
    setSelectedCharacter("全部角色");
    setCategory("全部");
    setQuery("");
    setDisplayLimit(36);
  }

  function chooseCharacter(character: string) {
    setSelectedCharacter(character);
    setCategory("全部");
    setQuery("");
    setDisplayLimit(36);
    document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <div className="announcement">
        <span>已同步京东店铺公开商品</span>
        <span className="announcement-center">203 个商品合集 · {products.length} 个可见款式</span>
        <span>价格与库存以京东为准</span>
      </div>

      <header className="site-header">
        <button className="mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="打开菜单">菜单</button>
        <a className="brand" href="#top" aria-label="ORIGI 原界首页"><span className="brand-mark">ORIGI</span><span className="brand-cn">原界</span></a>
        <nav className="desktop-nav" aria-label="主导航">
          <a href="#catalog">按 IP 选购</a>
          <button onClick={() => browseCategory("手办")}>手办</button>
          <button onClick={() => browseCategory("拼装模型")}>拼装模型</button>
          <a href={JD_STORE_URL} target="_blank" rel="noreferrer">京东原店 ↗</a>
        </nav>
        <div className="header-actions">
          <button onClick={() => setSearchOpen(true)} aria-label="搜索商品">搜索</button>
          <button className="favorite-header" onClick={() => setToast(`已收藏 ${favorites.length} 个款式`)} aria-label={`收藏 ${favorites.length} 件`}>收藏 <span>{favorites.length}</span></button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">AUTHENTIC FIGURE ARCHIVE</p>
          <h1>按作品，找到你爱的角色。</h1>
          <p className="hero-description">京东店铺商品已完整整理为<br />IP、角色、款式三级目录。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>开始选购 <span>→</span></button>
            <a href={JD_STORE_URL} target="_blank" rel="noreferrer">查看京东原店 <span>↗</span></a>
          </div>
          <div className="hero-footnote"><span>LIVE</span> 商品价格与库存请以京东详情页为准</div>
        </div>
        <div className="hero-media">
          <img src={heroProduct.image} alt={heroProduct.title} />
          <div className="hero-product-card">
            <div><span>JD STORE PICK</span><strong>{heroProduct.variant}</strong></div>
            <div className="hero-price">实时价</div>
            <a href={heroProduct.url} target="_blank" rel="noreferrer" aria-label="查看京东商品">↗</a>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-label="目录说明">
        <div><span>203</span><strong>商品合集</strong><small>来自京东店铺全部商品页</small></div>
        <div><span>{products.length}</span><strong>可见款式</strong><small>包含商品缩略款式</small></div>
        <div><span>{ipGroups.length}</span><strong>IP 作品</strong><small>自动整理作品归属</small></div>
        <div><span>↗</span><strong>京东详情</strong><small>每款保留原商品链接</small></div>
      </section>

      <section className="collection-browser" id="catalog">
        <div className="collection-heading">
          <div><p className="eyebrow">IP → CHARACTER → STYLE</p><h2>先选作品，再选角色。</h2></div>
          <p>例如选择「海贼王」，再选择路飞、索隆或娜美，即可集中查看该角色在店铺里的多个实际款式。</p>
        </div>

        <div className="catalog-steps" aria-label="商品分类层级">
          <span className="active"><b>01</b> 选择 IP</span>
          <span className={selectedIp !== "全部IP" ? "active" : ""}><b>02</b> 选择角色</span>
          <span className={selectedCharacter !== "全部角色" ? "active" : ""}><b>03</b> 浏览款式</span>
        </div>

        <div className="catalog-label-row"><strong>IP 作品馆</strong><small>{ipGroups.length} 个作品系列</small></div>
        <div className="ip-selector" role="group" aria-label="选择IP作品">
          <button className={selectedIp === "全部IP" ? "active" : ""} onClick={() => chooseIp("全部IP")}><span>全部 IP</span><small>{products.length} 个款式</small></button>
          {ipGroups.map((group) => <button key={group.ip} className={selectedIp === group.ip ? "active" : ""} onClick={() => chooseIp(group.ip)}><span>{group.ip}</span><small>{group.characterCount} 个角色 · {group.styleCount} 款</small></button>)}
        </div>

        <div className="catalog-label-row"><strong>角色档案</strong><small>{selectedIp === "全部IP" ? "选择一个 IP 后查看角色" : `${selectedIp} · ${charactersForIp.length} 个角色`}</small></div>
        <div className="character-selector" role="group" aria-label="选择角色">
          {selectedIp === "全部IP" ? (
            <button className="active" onClick={() => chooseCharacter("全部角色")}><span className="character-monogram">ALL</span><span><strong>全部角色</strong><small>{products.length} 款</small></span></button>
          ) : (
            <>
              <button className={selectedCharacter === "全部角色" ? "active" : ""} onClick={() => chooseCharacter("全部角色")}><span className="character-monogram">ALL</span><span><strong>全部角色</strong><small>{products.filter((product) => product.ip === selectedIp).length} 款</small></span></button>
              {charactersForIp.map((item) => <button key={item.character} className={selectedCharacter === item.character ? "active" : ""} onClick={() => chooseCharacter(item.character)}><img src={item.image} alt="" loading="lazy" /><span><strong>{item.character}</strong><small>{item.styleCount} 个款式</small></span></button>)}
            </>
          )}
        </div>

        <div className="catalog-path" aria-live="polite"><span>当前位置</span><strong>{selectedIp}</strong><i>→</i><strong>{selectedCharacter}</strong><i>→</i><b>{visibleProducts.length} 个款式</b></div>
      </section>

      <section className="product-section" id="new-arrivals">
        <div className="section-heading">
          <div><p className="eyebrow">JD STORE CATALOG</p><h2>{selectedCharacter === "全部角色" ? (selectedIp === "全部IP" ? "全部商品款式" : `${selectedIp} · 全部角色`) : `${selectedCharacter} · 全部款式`}</h2></div>
          <p>标题、款式图片和商品链接来自所提供的京东店铺。本站不虚构价格，点击商品可查看京东实时价格和库存。</p>
        </div>

        <div className="product-toolbar">
          <div className="category-tabs" role="group" aria-label="商品分类">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => { setCategory(item); setDisplayLimit(36); }}>{item}</button>)}</div>
          <button className="inline-search" onClick={() => setSearchOpen(true)}>搜索商品 <span>⌕</span></button>
        </div>

        <div className="product-grid">
          {displayedProducts.map((product, index) => (
            <article className={`product-card ${index < 2 ? "product-card-featured" : ""}`} key={product.id}>
              <div className="product-image-wrap">
                <span className="product-badge">京东店铺同款</span>
                <button className={`favorite-button ${favorites.includes(product.id) ? "active" : ""}`} onClick={() => toggleFavorite(product.id)} aria-label={favorites.includes(product.id) ? `取消收藏 ${product.variant}` : `收藏 ${product.variant}`}>♡</button>
                <img src={product.image} alt={`${product.ip} ${product.character} ${product.variant}`} loading={index > 5 ? "lazy" : "eager"} referrerPolicy="no-referrer" />
                <a className="quick-add" href={product.url} target="_blank" rel="noreferrer">查看京东商品 <span>↗</span></a>
              </div>
              <div className="product-meta">
                <p>{product.ip} · {product.character} · {product.brand}</p>
                <div className="product-title-row"><h3>{product.variant}</h3><strong>实时价</strong></div>
                <p className="product-source-title" title={product.title}>京东商品号 {product.sku} · {product.title}</p>
              </div>
            </article>
          ))}
        </div>

        {visibleProducts.length > displayedProducts.length && <div className="load-more"><button onClick={() => setDisplayLimit((current) => current + 36)}>加载更多 <span>{displayedProducts.length} / {visibleProducts.length}</span></button></div>}
        {visibleProducts.length === 0 && <div className="empty-state"><h3>没有找到相关商品</h3><p>换个关键词，或浏览全部商品。</p><button onClick={() => { setQuery(""); setCategory("全部"); setSelectedIp("全部IP"); setSelectedCharacter("全部角色"); setDisplayLimit(36); }}>查看全部</button></div>}
      </section>

      <section className="provenance" id="provenance">
        <div className="provenance-image"><img src={products.find((item) => item.ip === "葬送的芙莉莲")?.image || heroProduct.image} alt="京东店铺正版手办商品" referrerPolicy="no-referrer" /></div>
        <div className="provenance-copy">
          <p className="eyebrow">CATALOG SOURCE</p><h2>真实商品，<br />清楚分类。</h2>
          <p>当前目录取自你提供的京东店铺公开商品页，已排除“运费差价”等非商品条目。每个款式均保留原商品号和详情链接；成交价格、库存、版本与售后政策以京东商品页为准。</p>
          <div className="proof-list"><div><span>01</span><strong>真实标题</strong><small>保留京东商品名称</small></div><div><span>02</span><strong>真实图片</strong><small>使用店铺商品图</small></div><div><span>03</span><strong>原页可查</strong><small>直达京东商品详情</small></div></div>
        </div>
      </section>

      <section className="brand-section" id="brands"><p className="eyebrow">MAKERS IN CATALOG</p><h2>店铺收录品牌</h2><div className="brand-list" aria-label="品牌列表"><span>BANDAI</span><span>BANPRESTO</span><span>SEGA</span><span>TAITO</span><span>FURYU</span><span>GOOD SMILE</span></div></section>

      <footer><div className="footer-brand"><strong>ORIGI</strong><span>原界 · 正版潮玩手办目录</span></div><div className="footer-links"><a href="#catalog">按 IP 选购</a><a href="#new-arrivals">全部商品</a><a href={JD_STORE_URL} target="_blank" rel="noreferrer">京东原店</a></div><div className="footer-note">© 2026 ORIGI 原界。商品信息来源于所提供的京东店铺公开页面，价格与库存以京东为准。</div></footer>

      {menuOpen && <div className="overlay mobile-menu" role="dialog" aria-modal="true" aria-label="移动端菜单"><button className="overlay-close" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">关闭</button><div className="mobile-menu-brand">ORIGI <span>原界</span></div><nav><button onClick={() => { setMenuOpen(false); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}>按 IP / 角色选购 <span>01</span></button><button onClick={() => browseCategory("手办")}>手办 <span>02</span></button><button onClick={() => browseCategory("拼装模型")}>拼装模型 <span>03</span></button></nav></div>}

      {searchOpen && <div className="overlay search-overlay" role="dialog" aria-modal="true" aria-label="搜索商品"><button className="overlay-close" onClick={() => setSearchOpen(false)} aria-label="关闭搜索">关闭</button><div className="search-panel"><p className="eyebrow">SEARCH THE CATALOG</p><label htmlFor="site-search">想找哪一个角色？</label><div className="search-input-row"><input id="site-search" autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setDisplayLimit(36); }} placeholder="输入角色、IP、品牌或商品号" /><button onClick={() => { setSelectedIp("全部IP"); setSelectedCharacter("全部角色"); setDisplayLimit(36); setSearchOpen(false); document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" }); }}>搜索</button></div><div className="search-suggestions"><span>热门：</span>{["海贼王", "路飞", "咒术回战", "鬼灭之刃", "初音未来"].map((item) => <button key={item} onClick={() => { setQuery(item); setSelectedIp("全部IP"); setSelectedCharacter("全部角色"); setDisplayLimit(36); }}>{item}</button>)}</div></div></div>}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
