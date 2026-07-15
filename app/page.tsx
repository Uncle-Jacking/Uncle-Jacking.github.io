"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  brand: string;
  ip: string;
  category: string;
  price: number;
  size: string;
  image: string;
  badge?: string;
};

const products: Product[] = [
  { id: 1, name: "路飞 五档", brand: "BANDAI", ip: "海贼王", category: "日系手办", price: 329, size: "18CM", image: "/products/luffy.png", badge: "本周精选" },
  { id: 2, name: "芙莉莲 行李箱", brand: "TAITO", ip: "葬送的芙莉莲", category: "日系手办", price: 269, size: "17CM", image: "/products/frieren.png", badge: "日本进口" },
  { id: 3, name: "艾伦 ROS", brand: "BANDAI", ip: "进击的巨人", category: "日系手办", price: 399, size: "26CM", image: "/products/eren.png", badge: "限量" },
  { id: 4, name: "MEGA 喷火龙X", brand: "BANDAI", ip: "宝可梦", category: "模型拼装", price: 299, size: "17CM", image: "/products/charizard.png", badge: "热卖" },
  { id: 5, name: "野原新之助", brand: "BANDAI", ip: "蜡笔小新", category: "日系手办", price: 239, size: "11CM", image: "/products/shinchan.png" },
  { id: 6, name: "阿米娅 报童", brand: "FURYU", ip: "明日方舟", category: "预售", price: 359, size: "16CM", image: "/products/amiya.png", badge: "预售" },
  { id: 7, name: "孙悟空 历史盒子2", brand: "BANDAI", ip: "七龙珠", category: "日系手办", price: 289, size: "13CM", image: "/products/goku.png", badge: "新品" },
  { id: 8, name: "宇智波带土 VS", brand: "BANDAI", ip: "火影忍者", category: "日系手办", price: 319, size: "15CM", image: "/products/obito.png" },
  { id: 9, name: "碧翠丝", brand: "SEGA", ip: "Re:从零开始", category: "日系手办", price: 279, size: "16CM", image: "/products/beatrice.jpg", badge: "日本进口" },
  { id: 10, name: "伊蕾娜 泳装", brand: "TAITO", ip: "魔女之旅", category: "日系手办", price: 299, size: "20CM", image: "/products/elaina.png" },
  { id: 11, name: "初音未来 波斯菊仙子", brand: "FURYU", ip: "初音未来", category: "预售", price: 309, size: "15CM", image: "/products/miku.png", badge: "预售" },
  { id: 12, name: "元祖高达 Ver. 3.0", brand: "BANDAI", ip: "机动战士高达", category: "模型拼装", price: 459, size: "18CM", image: "/products/gundam.png", badge: "进口现货" },
];

const categories = ["全部", "日系手办", "模型拼装", "预售"];

export default function Home() {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [toast, setToast] = useState("");

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = category === "全部" || product.category === category;
      const queryMatch = !normalized || `${product.name}${product.brand}${product.ip}`.toLowerCase().includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

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
    setMenuOpen(false);
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
          <button onClick={() => browseCategory("全部")}>新品</button>
          <button onClick={() => browseCategory("日系手办")}>日系手办</button>
          <button onClick={() => browseCategory("模型拼装")}>模型拼装</button>
          <button onClick={() => browseCategory("预售")}>预售</button>
          <a href="#brands">品牌</a>
        </nav>
        <div className="header-actions">
          <button onClick={() => setSearchOpen(true)} aria-label="搜索商品">搜索</button>
          <button className="favorite-header" onClick={() => { setQuery(""); setCategory("全部"); document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" }); }} aria-label={`收藏 ${favorites.length} 件`}>
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

      <section className="product-section" id="new-arrivals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED THIS WEEK</p>
            <h2>本周新到</h2>
          </div>
          <p>来自日漫社买手店的正版手办精选。展示价格以上线时商品详情为准。</p>
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
                <p>{product.brand} · {product.ip}</p>
                <div className="product-title-row"><h3>{product.name} <span>{product.size}</span></h3><strong>¥{product.price}</strong></div>
              </div>
            </article>
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <div className="empty-state"><h3>没有找到相关藏品</h3><p>换个关键词，或浏览全部商品。</p><button onClick={() => { setQuery(""); setCategory("全部"); }}>查看全部</button></div>
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
            <button onClick={() => browseCategory("全部")}>新品 <span>01</span></button>
            <button onClick={() => browseCategory("日系手办")}>日系手办 <span>02</span></button>
            <button onClick={() => browseCategory("模型拼装")}>模型拼装 <span>03</span></button>
            <button onClick={() => browseCategory("预售")}>预售 <span>04</span></button>
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
              <button onClick={() => { setSearchOpen(false); document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" }); }}>搜索</button>
            </div>
            <div className="search-suggestions"><span>热门：</span>{["海贼王", "芙莉莲", "BANDAI", "初音未来"].map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
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
                  <div className="cart-item-copy"><small>{product.brand} · {product.ip}</small><strong>{product.name} {product.size}</strong><span>¥{product.price}</span><div className="quantity"><button onClick={() => updateQuantity(product.id, -1)} aria-label={`减少 ${product.name} 数量`}>−</button><span>{cart[product.id]}</span><button onClick={() => updateQuantity(product.id, 1)} aria-label={`增加 ${product.name} 数量`}>＋</button></div></div>
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
