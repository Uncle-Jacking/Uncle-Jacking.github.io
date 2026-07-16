"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  character: string;
  variant: string;
  brand: string;
  ip: string;
  category: string;
  price: number;
  size: string;
  image: string;
  badge?: string;
};

const products: Product[] = [
  { id: 1, name: "路飞 五档", character: "路飞", variant: "五档觉醒", brand: "BANDAI", ip: "海贼王", category: "日系手办", price: 329, size: "18CM", image: "/products/luffy.png", badge: "本周精选" },
  { id: 13, name: "路飞 五档战斗版", character: "路飞", variant: "五档觉醒 · 战斗版", brand: "BANDAI", ip: "海贼王", category: "日系手办", price: 369, size: "19CM", image: "/products/luffy.png", badge: "场景款" },
  { id: 14, name: "路飞 五档限定版", character: "路飞", variant: "五档觉醒 · 限定版", brand: "BANDAI", ip: "海贼王", category: "预售", price: 429, size: "18CM", image: "/products/luffy.png", badge: "限定" },
  { id: 2, name: "芙莉莲 行李箱", character: "芙莉莲", variant: "行李箱", brand: "TAITO", ip: "葬送的芙莉莲", category: "日系手办", price: 269, size: "17CM", image: "/products/frieren.png", badge: "日本进口" },
  { id: 3, name: "艾伦 ROS", character: "艾伦", variant: "ROS 战斗姿态", brand: "BANDAI", ip: "进击的巨人", category: "日系手办", price: 399, size: "26CM", image: "/products/eren.png", badge: "限量" },
  { id: 4, name: "MEGA 喷火龙X", character: "喷火龙X", variant: "MEGA 拼装版", brand: "BANDAI", ip: "宝可梦", category: "模型拼装", price: 299, size: "17CM", image: "/products/charizard.png", badge: "热卖" },
  { id: 5, name: "野原新之助", character: "野原新之助", variant: "经典日常服", brand: "BANDAI", ip: "蜡笔小新", category: "日系手办", price: 239, size: "11CM", image: "/products/shinchan.png" },
  { id: 6, name: "阿米娅 报童", character: "阿米娅", variant: "报童装", brand: "FURYU", ip: "明日方舟", category: "预售", price: 359, size: "16CM", image: "/products/amiya.png", badge: "预售" },
  { id: 7, name: "孙悟空 历史盒子2", character: "孙悟空", variant: "历史盒子 2", brand: "BANDAI", ip: "七龙珠", category: "日系手办", price: 289, size: "13CM", image: "/products/goku.png", badge: "新品" },
  { id: 19, name: "孙悟空 历史盒子战斗版", character: "孙悟空", variant: "历史盒子 2 · 战斗版", brand: "BANDAI", ip: "七龙珠", category: "日系手办", price: 329, size: "15CM", image: "/products/goku.png", badge: "战斗版" },
  { id: 20, name: "孙悟空 历史盒子特典版", character: "孙悟空", variant: "历史盒子 2 · 特典版", brand: "BANDAI", ip: "七龙珠", category: "预售", price: 369, size: "15CM", image: "/products/goku.png", badge: "特典" },
  { id: 8, name: "宇智波带土 VS", character: "宇智波带土", variant: "VS 对战版", brand: "BANDAI", ip: "火影忍者", category: "日系手办", price: 319, size: "15CM", image: "/products/obito.png" },
  { id: 15, name: "宇智波带土 神威", character: "宇智波带土", variant: "神威场景版", brand: "BANDAI", ip: "火影忍者", category: "日系手办", price: 369, size: "17CM", image: "/products/obito.png", badge: "场景款" },
  { id: 16, name: "宇智波带土 白面具", character: "宇智波带土", variant: "白面具限定版", brand: "BANDAI", ip: "火影忍者", category: "预售", price: 419, size: "18CM", image: "/products/obito.png", badge: "限定" },
  { id: 9, name: "碧翠丝", character: "碧翠丝", variant: "经典礼服", brand: "SEGA", ip: "Re:从零开始", category: "日系手办", price: 279, size: "16CM", image: "/products/beatrice.jpg", badge: "日本进口" },
  { id: 10, name: "伊蕾娜 泳装", character: "伊蕾娜", variant: "夏日泳装", brand: "TAITO", ip: "魔女之旅", category: "日系手办", price: 299, size: "20CM", image: "/products/elaina.png" },
  { id: 11, name: "初音未来 波斯菊仙子", character: "初音未来", variant: "波斯菊仙子", brand: "FURYU", ip: "初音未来", category: "预售", price: 309, size: "15CM", image: "/products/miku.png", badge: "预售" },
  { id: 17, name: "初音未来 波斯菊特典色", character: "初音未来", variant: "波斯菊仙子 · 特典色", brand: "FURYU", ip: "初音未来", category: "预售", price: 349, size: "15CM", image: "/products/miku.png", badge: "特典色" },
  { id: 18, name: "初音未来 波斯菊典藏版", character: "初音未来", variant: "波斯菊仙子 · 典藏版", brand: "FURYU", ip: "初音未来", category: "预售", price: 389, size: "16CM", image: "/products/miku.png", badge: "典藏" },
  { id: 12, name: "元祖高达 Ver. 3.0", character: "RX-78-2", variant: "Ver. 3.0", brand: "BANDAI", ip: "机动战士高达", category: "模型拼装", price: 459, size: "18CM", image: "/products/gundam.png", badge: "进口现货" },
];

const categories = ["全部", "日系手办", "模型拼装", "预售"];

export default function Home() {
  const [category, setCategory] = useState("全部");
  const [selectedIp, setSelectedIp] = useState("海贼王");
  const [selectedCharacter, setSelectedCharacter] = useState("路飞");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [toast, setToast] = useState("");

  const ipGroups = useMemo(() => {
    const groups = Array.from(new Set(products.map((product) => product.ip))).map((ip) => {
      const ipProducts = products.filter((product) => product.ip === ip);
      return {
        ip,
        characterCount: new Set(ipProducts.map((product) => product.character)).size,
        styleCount: ipProducts.length,
      };
    });
    return groups.sort((a, b) => b.styleCount - a.styleCount || a.ip.localeCompare(b.ip, "zh-CN"));
  }, []);

  const charactersForIp = useMemo(() => {
    const scoped = selectedIp === "全部IP" ? products : products.filter((product) => product.ip === selectedIp);
    return Array.from(new Set(scoped.map((product) => product.character))).map((character) => {
      const characterProducts = scoped.filter((product) => product.character === character);
      return { character, styleCount: characterProducts.length, image: characterProducts[0].image };
    });
  }, [selectedIp]);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = category === "全部" || product.category === category;
      const ipMatch = selectedIp === "全部IP" || product.ip === selectedIp;
      const characterMatch = selectedCharacter === "全部角色" || product.character === selectedCharacter;
      const queryMatch = !normalized || `${product.name}${product.variant}${product.character}${product.brand}${product.ip}`.toLowerCase().includes(normalized);
      return categoryMatch && ipMatch && characterMatch && queryMatch;
    });
  }, [category, query, selectedCharacter, selectedIp]);

  const cartItems = products.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  useEffect(() => {
    document.body.style.overflow = searchOpen || cartOpen || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen, cartOpen, menuOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function addToCart(product: Product) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
    setToast(`${product.name} 已加入购物袋`);
  }

  function updateQuantity(id: number, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      const updated = { ...current };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  }

  function toggleFavorite(id: number) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function browseCategory(nextCategory: string) {
    setCategory(nextCategory);
    setSelectedIp("全部IP");
    setSelectedCharacter("全部角色");
    setMenuOpen(false);
    document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseIp(nextIp: string) {
    setSelectedIp(nextIp);
    setCategory("全部");
    setQuery("");
    if (nextIp === "全部IP") {
      setSelectedCharacter("全部角色");
    } else {
      setSelectedCharacter(products.find((product) => product.ip === nextIp)?.character || "全部角色");
    }
  }

  function chooseCharacter(character: string) {
    setSelectedCharacter(character);
    setCategory("全部");
    setQuery("");
    document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <div className="announcement">
        <span>全场满 ¥399 顺丰包邮</span>
        <span className="announcement-center">每件藏品均支持正品溯源</span>
        <span>新会员首单减 ¥30</span>
      </div>

      <header className="site-header">
        <button className="mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="打开菜单">菜单</button>
        <a className="brand" href="#top" aria-label="ORIGI 原界首页">
          <span className="brand-mark">ORIGI</span>
          <span className="brand-cn">原界</span>
        </a>
        <nav className="desktop-nav" aria-label="主导航">
          <a href="#catalog">按IP选购</a>
          <button onClick={() => browseCategory("全部")}>新品</button>
          <button onClick={() => browseCategory("日系手办")}>日系手办</button>
          <button onClick={() => browseCategory("模型拼装")}>模型拼装</button>
          <button onClick={() => browseCategory("预售")}>预售</button>
        </nav>
        <div className="header-actions">
          <button onClick={() => setSearchOpen(true)} aria-label="搜索商品">搜索</button>
          <button className="favorite-header" onClick={() => { setQuery(""); setCategory("全部"); setSelectedIp("全部IP"); setSelectedCharacter("全部角色"); document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" }); }} aria-label={`收藏 ${favorites.length} 件`}>
            收藏 <span>{favorites.length}</span>
          </button>
          <button onClick={() => setCartOpen(true)} aria-label={`购物袋 ${cartCount} 件`}>
            购物袋 <span>{cartCount}</span>
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">WEEKLY SELECTION · 07</p>
          <h1>收藏，从真品开始。</h1>
          <p className="hero-description">严选官方授权与日本原装进口手办，<br />每一件热爱都有来处。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => browseCategory("全部")}>探索本周上新 <span>→</span></button>
            <a href="#provenance">了解原界选品 <span>↘</span></a>
          </div>
          <div className="hero-footnote"><span>01</span> 现货 48 小时内发出</div>
        </div>
        <div className="hero-media">
          <img src="/products/luffy.png" alt="万代 海贼王 路飞五档正版手办与原装包装" />
          <div className="hero-product-card">
            <div>
              <span>WEEKLY PICK</span>
              <strong>万代 路飞五档 18CM</strong>
            </div>
            <div className="hero-price">¥329</div>
            <button onClick={() => addToCart(products[0])} aria-label="将路飞五档加入购物袋">＋</button>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-label="购物保障">
        <div><span>✓</span><strong>正品溯源</strong><small>渠道凭证可查</small></div>
        <div><span>原</span><strong>原装进口</strong><small>同步海外新品</small></div>
        <div><span>稳</span><strong>专业防震包装</strong><small>收藏级运输标准</small></div>
        <div><span>心</span><strong>售后无忧</strong><small>破损包赔</small></div>
      </section>

      <section className="collection-browser" id="catalog">
        <div className="collection-heading">
          <div>
            <p className="eyebrow">IP → CHARACTER → STYLE</p>
            <h2>先选作品，再选角色。</h2>
          </div>
          <p>商品按照 IP、角色和具体款式三级归档。同一角色的景品、限定版与预售款会集中展示，查找更快。</p>
        </div>

        <div className="catalog-steps" aria-label="商品分类层级">
          <span className="active"><b>01</b> 选择 IP</span>
          <span className={selectedIp !== "全部IP" ? "active" : ""}><b>02</b> 选择角色</span>
          <span className={selectedCharacter !== "全部角色" ? "active" : ""}><b>03</b> 浏览款式</span>
        </div>

        <div className="catalog-label-row"><strong>IP 作品馆</strong><small>{ipGroups.length} 个作品系列</small></div>
        <div className="ip-selector" role="group" aria-label="选择IP作品">
          <button className={selectedIp === "全部IP" ? "active" : ""} onClick={() => chooseIp("全部IP")}>
            <span>全部 IP</span><small>{products.length} 款藏品</small>
          </button>
          {ipGroups.map((group) => (
            <button key={group.ip} className={selectedIp === group.ip ? "active" : ""} onClick={() => chooseIp(group.ip)}>
              <span>{group.ip}</span><small>{group.characterCount} 个角色 · {group.styleCount} 款</small>
            </button>
          ))}
        </div>

        <div className="catalog-label-row"><strong>角色档案</strong><small>{selectedIp === "全部IP" ? "先选择一个 IP 查看角色" : `${selectedIp} · ${charactersForIp.length} 个角色`}</small></div>
        <div className="character-selector" role="group" aria-label="选择角色">
          {selectedIp === "全部IP" && (
            <button className={selectedCharacter === "全部角色" ? "active" : ""} onClick={() => chooseCharacter("全部角色")}>
              <span className="character-monogram">ALL</span><span><strong>全部角色</strong><small>{products.length} 款</small></span>
            </button>
          )}
          {charactersForIp.map((item) => (
            <button key={item.character} className={selectedCharacter === item.character ? "active" : ""} onClick={() => chooseCharacter(item.character)}>
              <img src={item.image} alt="" /><span><strong>{item.character}</strong><small>{item.styleCount} 个款式</small></span>
            </button>
          ))}
        </div>

        <div className="catalog-path" aria-live="polite">
          <span>当前位置</span>
          <strong>{selectedIp}</strong><i>→</i><strong>{selectedCharacter}</strong><i>→</i><b>{visibleProducts.length} 个款式</b>
        </div>
      </section>

      <section className="product-section" id="new-arrivals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SELECTED STYLES</p>
            <h2>{selectedCharacter === "全部角色" ? "全部角色款式" : `${selectedCharacter} · 全部款式`}</h2>
          </div>
          <p>{selectedIp === "全部IP" ? "浏览全部 IP 与角色的正版手办精选。" : `正在浏览「${selectedIp}」角色系列。`} 展示价格以上线时商品详情为准。</p>
        </div>

        <div className="product-toolbar">
          <div className="category-tabs" role="group" aria-label="商品分类">
            {categories.map((item) => (
              <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
          <button className="inline-search" onClick={() => setSearchOpen(true)}>搜索藏品 <span>⌕</span></button>
        </div>

        <div className="product-grid">
          {visibleProducts.map((product, index) => (
            <article className={`product-card ${index < 2 ? "product-card-featured" : ""}`} key={product.id}>
              <div className="product-image-wrap">
                {product.badge && <span className="product-badge">{product.badge}</span>}
                <button
                  className={`favorite-button ${favorites.includes(product.id) ? "active" : ""}`}
                  onClick={() => toggleFavorite(product.id)}
                  aria-label={favorites.includes(product.id) ? `取消收藏 ${product.name}` : `收藏 ${product.name}`}
                >♡</button>
                <img src={product.image} alt={`${product.brand} ${product.ip} ${product.name} ${product.size} 正版手办`} loading={index > 3 ? "lazy" : "eager"} />
                <button className="quick-add" onClick={() => addToCart(product)}>加入购物袋 <span>＋</span></button>
              </div>
              <div className="product-meta">
                <p>{product.ip} · {product.character} · {product.brand}</p>
                <div className="product-title-row"><h3>{product.variant} <span>{product.size}</span></h3><strong>¥{product.price}</strong></div>
              </div>
            </article>
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <div className="empty-state"><h3>没有找到相关藏品</h3><p>换个关键词，或浏览全部商品。</p><button onClick={() => { setQuery(""); setCategory("全部"); setSelectedIp("全部IP"); setSelectedCharacter("全部角色"); }}>查看全部</button></div>
        )}
      </section>

      <section className="provenance" id="provenance">
        <div className="provenance-image"><img src="/products/frieren.png" alt="TAITO 芙莉莲正版手办、包装与收藏场景" /></div>
        <div className="provenance-copy">
          <p className="eyebrow">PROVENANCE MATTERS</p>
          <h2>不只看角色，<br />也看它从哪里来。</h2>
          <p>原界只从可验证的品牌渠道和进口链路选品。外盒、标识、版本与包装状态都纳入验收，让“正版”成为可以被看见的标准。</p>
          <div className="proof-list">
            <div><span>01</span><strong>渠道凭证</strong><small>来源记录可追溯</small></div>
            <div><span>02</span><strong>入库验收</strong><small>盒况与涂装复核</small></div>
            <div><span>03</span><strong>收藏包装</strong><small>四角加固防震发出</small></div>
          </div>
        </div>
      </section>

      <section className="brand-section" id="brands">
        <p className="eyebrow">SELECTED MAKERS</p>
        <h2>我们长期关注的品牌</h2>
        <div className="brand-list" aria-label="品牌列表">
          <span>BANDAI</span><span>SEGA</span><span>TAITO</span><span>FURYU</span><span>ANIPLEX</span><span>BANPRESTO</span>
        </div>
      </section>

      <section className="membership">
        <div>
          <p className="eyebrow">ORIGI INNER CIRCLE</p>
          <h2>新到、补款、稀有再贩，<br />第一时间告诉你。</h2>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); setToast("订阅成功，欢迎加入原界"); }}>
          <label htmlFor="email">订阅原界通信</label>
          <div><input id="email" type="email" required placeholder="你的邮箱地址" aria-label="邮箱地址" /><button type="submit">订阅 <span>→</span></button></div>
          <small>订阅即代表你同意接收新品与补货通知，可随时退订。</small>
        </form>
      </section>

      <footer>
        <div className="footer-brand"><strong>ORIGI</strong><span>原界 · 正版手办精选商店</span></div>
        <div className="footer-links"><a href="#new-arrivals">选购藏品</a><a href="#provenance">正品保障</a><a href="#brands">品牌目录</a><a href="mailto:service@origi.example">联系我们</a></div>
        <div className="footer-note">© 2026 ORIGI 原界。本站为品牌商城展示版本。</div>
      </footer>

      {menuOpen && (
        <div className="overlay mobile-menu" role="dialog" aria-modal="true" aria-label="移动端菜单">
          <button className="overlay-close" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">关闭</button>
          <div className="mobile-menu-brand">ORIGI <span>原界</span></div>
          <nav>
            <button onClick={() => { setMenuOpen(false); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}>按 IP / 角色选购 <span>01</span></button>
            <button onClick={() => browseCategory("全部")}>新品 <span>02</span></button>
            <button onClick={() => browseCategory("日系手办")}>日系手办 <span>03</span></button>
            <button onClick={() => browseCategory("模型拼装")}>模型拼装 <span>04</span></button>
            <button onClick={() => browseCategory("预售")}>预售 <span>05</span></button>
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="overlay search-overlay" role="dialog" aria-modal="true" aria-label="搜索商品">
          <button className="overlay-close" onClick={() => setSearchOpen(false)} aria-label="关闭搜索">关闭</button>
          <div className="search-panel">
            <p className="eyebrow">SEARCH THE ARCHIVE</p>
            <label htmlFor="site-search">想找哪一件藏品？</label>
            <div className="search-input-row">
              <input id="site-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入角色、IP 或品牌" />
              <button onClick={() => { setSelectedIp("全部IP"); setSelectedCharacter("全部角色"); setSearchOpen(false); document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" }); }}>搜索</button>
            </div>
            <div className="search-suggestions"><span>热门：</span>{["海贼王", "路飞", "火影忍者", "初音未来"].map((item) => <button key={item} onClick={() => { setQuery(item); setSelectedIp("全部IP"); setSelectedCharacter("全部角色"); }}>{item}</button>)}</div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="drawer-backdrop" role="presentation" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="购物袋" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-heading"><div><p className="eyebrow">YOUR SELECTION</p><h2>购物袋 <span>{cartCount}</span></h2></div><button onClick={() => setCartOpen(false)} aria-label="关闭购物袋">关闭</button></div>
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <div className="cart-empty"><p>购物袋还是空的。</p><button onClick={() => { setCartOpen(false); browseCategory("全部"); }}>去选一件藏品</button></div>
              ) : cartItems.map((product) => (
                <div className="cart-item" key={product.id}>
                  <img src={product.image} alt={product.name} />
                  <div className="cart-item-copy"><small>{product.ip} · {product.character} · {product.brand}</small><strong>{product.variant} {product.size}</strong><span>¥{product.price}</span><div className="quantity"><button onClick={() => updateQuantity(product.id, -1)} aria-label={`减少 ${product.name} 数量`}>−</button><span>{cart[product.id]}</span><button onClick={() => updateQuantity(product.id, 1)} aria-label={`增加 ${product.name} 数量`}>＋</button></div></div>
                </div>
              ))}
            </div>
            {cartItems.length > 0 && <div className="cart-summary"><div><span>商品小计</span><strong>¥{cartTotal}</strong></div><small>{cartTotal >= 399 ? "已享顺丰包邮" : `再选 ¥${399 - cartTotal} 即享顺丰包邮`}</small><button onClick={() => setToast("展示站暂未接入支付，可继续体验选购流程")}>前往结算 <span>→</span></button></div>}
          </aside>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
