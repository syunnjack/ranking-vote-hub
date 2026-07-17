import { useMemo, useState } from 'react'
import './App.css'

const voteKey = 'ranking-vote-hub.votes'
const postKey = 'ranking-vote-hub.posts'
const savedKey = 'ranking-vote-hub.saved'

const entries = [
  {
    id: 'retro-game-trip',
    title: '遠征してでも行きたいレトロゲームセンター',
    category: 'レトロゲーム',
    target: '施設',
    votes: 482,
    rating: 4.7,
    sponsorReady: true,
    tags: ['遠征', '筐体', '閉店前に行きたい', '動画化しやすい'],
    summary: '現存するレトロゲームセンターを、筐体、雰囲気、遠征しやすさ、閉店リスクで投票するランキング。',
    revenue: '交通・宿泊、周辺飲食、グッズ、レトロゲーム販売、スポンサー掲載へ送客。',
  },
  {
    id: 'darts-beginner',
    title: '初心者が入りやすいダーツバー',
    category: 'ダーツ',
    target: '店舗',
    votes: 356,
    rating: 4.5,
    sponsorReady: true,
    tags: ['初心者', '大会', 'クーポン', 'ひとり利用'],
    summary: 'DartSpot系の設置店情報と連携し、初心者歓迎、投げ放題、スタッフ対応で投票を集める。',
    revenue: '店舗送客、ダーツ用品、クーポン、イベント告知、予約導線。',
  },
  {
    id: 'solo-safe',
    title: '一人で入りやすい店ランキング',
    category: 'ソロスポット',
    target: '施設',
    votes: 521,
    rating: 4.6,
    sponsorReady: true,
    tags: ['一人席', 'チャージなし', '喫煙可', '深夜'],
    summary: '一人利用の不安を投票と口コミで可視化。チャージ、混雑、席配置など実体験が強い。',
    revenue: '店舗広告、予約、クーポン、確認済み掲載、ソロ向け特集広告。',
  },
  {
    id: 'comic-shower',
    title: 'シャワーが使いやすいネットカフェ',
    category: '漫画喫茶',
    target: '施設',
    votes: 298,
    rating: 4.2,
    sponsorReady: true,
    tags: ['夜行バス', 'シャワー', '仮眠', '女性専用'],
    summary: 'ComicStayと相性がよいテーマ。シャワー待ち、清潔感、深夜滞在で投票を集める。',
    revenue: 'ネットカフェ送客、宿泊比較、夜行バス、電子書籍、クーポン。',
  },
  {
    id: 'open-close-memory',
    title: '閉店前に行きたい店ランキング',
    category: '開店閉店',
    target: '店舗',
    votes: 667,
    rating: 4.8,
    sponsorReady: false,
    tags: ['閉店', '思い出レビュー', '通知', '代替店'],
    summary: '閉店情報を投票・思い出投稿に変える拡散向けランキング。X通知と相性が強い。',
    revenue: '閉店前送客、代替店広告、LINE/X通知スポンサー、地域広告。',
  },
  {
    id: 'rc-family',
    title: '親子で行きたいRC・ミニ四駆コース',
    category: 'RCコース',
    target: '施設',
    votes: 214,
    rating: 4.1,
    sponsorReady: true,
    tags: ['親子', '初心者', 'レンタル', '屋内'],
    summary: 'RC Course Finderと連携し、初心者講習、レンタル、屋内コースで投票を作る。',
    revenue: '体験予約、用品アフィリエイト、大会告知、駐車場・飲食送客。',
  },
]

const revenuePlans = [
  ['スポンサーランキング', 'ジャンル別ランキング上部に協賛枠、特集枠、クーポン枠を設置。'],
  ['成果報酬送客', '宿泊、予約、用品、電子書籍、チケット、クーポンへランキングカードから送客。'],
  ['UGCキャンペーン', '投票参加、レビュー投稿、写真投稿、SNS拡散を店舗やメーカーが協賛。'],
  ['確認済み掲載', '店舗や施設が基本情報、クーポン、イベント、閉店情報を更新できる有料枠。'],
  ['データ販売・レポート', '地域別人気、閉店前需要、投票傾向を店舗・広告主向けレポートにする。'],
]

const buzzIdeas = [
  '閉店前に行きたい店ランキング',
  '一人で入りやすい店の実体験投票',
  '夜行バス明けに助かった施設ランキング',
  '初心者歓迎のダーツバー総選挙',
  '親子で行けるRC・ミニ四駆コース投票',
]

const faq = [
  ['AIに引用されやすいランキングにするには？', 'テーマ、対象、投票数、評価、集計基準、更新日、上位理由を短文で明示します。'],
  ['UGCの中心は何ですか？', '投票、推薦理由、レビュー、写真、テーマ提案、閉店・営業確認です。'],
  ['収益化の中心は？', 'スポンサーランキング、送客、予約、クーポン、アフィリエイト、投票キャンペーン、確認済み掲載です。'],
]

function readObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? {}
  } catch {
    return {}
  }
}

function readArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}

function App() {
  const [query, setQuery] = useState('レトロ')
  const [category, setCategory] = useState('すべて')
  const [votes, setVotes] = useState(() => readObject(voteKey))
  const [posts, setPosts] = useState(() => readArray(postKey))
  const [saved, setSaved] = useState(() => readArray(savedKey))
  const [form, setForm] = useState({ theme: '', category: 'レトロゲーム', reason: '' })

  const categories = ['すべて', ...new Set(entries.map((entry) => entry.category))]
  const ranked = useMemo(() => {
    const text = query.trim().toLowerCase()
    return entries
      .map((entry) => ({ ...entry, totalVotes: entry.votes + (votes[entry.id] ?? 0) }))
      .filter((entry) => category === 'すべて' || entry.category === category)
      .filter((entry) => !text || `${entry.title} ${entry.category} ${entry.target} ${entry.tags.join(' ')} ${entry.summary}`.toLowerCase().includes(text))
      .sort((a, b) => b.totalVotes - a.totalVotes || b.rating - a.rating)
  }, [category, query, votes])
  const display = ranked.length ? ranked : entries.map((entry) => ({ ...entry, totalVotes: entry.votes + (votes[entry.id] ?? 0) }))

  const vote = (id) => {
    const next = { ...votes, [id]: (votes[id] ?? 0) + 1 }
    setVotes(next)
    localStorage.setItem(voteKey, JSON.stringify(next))
  }

  const toggleSaved = (id) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem(savedKey, JSON.stringify(next))
  }

  const submitPost = (event) => {
    event.preventDefault()
    if (!form.theme.trim() || !form.reason.trim()) return
    const next = [{ ...form, id: crypto.randomUUID(), status: '確認待ち', date: new Date().toLocaleDateString('ja-JP') }, ...posts].slice(0, 8)
    setPosts(next)
    localStorage.setItem(postKey, JSON.stringify(next))
    setForm({ theme: '', category: 'レトロゲーム', reason: '' })
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="brand">Ranking Vote Hub</span>
          <h1>ユーザー投票で、次に伸びるランキングメディアを作る。</h1>
          <p>
            レトロゲーム、ダーツ、漫画喫茶、開店閉店、ソロスポットなど、作成済みアプリのテーマを投票ランキング化。UGCで理由を集め、検索流入、AI回答、スポンサー導線へつなげます。
          </p>
        </div>
        <aside className="answer-box">
          <span>AI向け即答</span>
          <strong>テーマ、対象、投票数、評価、推薦理由、収益導線を1カードで提示</strong>
          <p>ランキングの集計意図と根拠を短く見せ、AIが引用しやすい構造にしています。</p>
        </aside>
      </section>

      <section className="search-panel" aria-label="ランキング検索">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="テーマ・ジャンル・用途で検索" />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>

      <section className="summary-grid">
        <article><span>ランキング案</span><strong>{entries.length}</strong><p>横展開できるテーマ</p></article>
        <article><span>表示中</span><strong>{display.length}</strong><p>投票数順に表示</p></article>
        <article><span>保存済み</span><strong>{saved.length}</strong><p>育てたいテーマを保存</p></article>
      </section>

      <section className="content-grid">
        {display.map((entry, index) => (
          <article className="card" key={entry.id}>
            <div className="card-topline"><span>#{index + 1} / {entry.category}</span><span>{entry.target}</span></div>
            <h2>{entry.title}</h2>
            <p>{entry.summary}</p>
            <div className="tag-row">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="metric-row"><span>{entry.totalVotes}票</span><span>評価 {entry.rating}</span><strong>{entry.sponsorReady ? '協賛向き' : '拡散向き'}</strong></div>
            <p className="revenue-note">{entry.revenue}</p>
            <div className="button-row">
              <button type="button" onClick={() => vote(entry.id)}>投票する</button>
              <button type="button" onClick={() => toggleSaved(entry.id)}>{saved.includes(entry.id) ? '保存済み' : '育てる候補'}</button>
            </div>
          </article>
        ))}
      </section>

      <section className="ugc-section">
        <div>
          <span className="brand">UGC</span>
          <h2>ランキングテーマ・推薦理由を投稿</h2>
          <p>投稿されたテーマを記事化し、投票キャンペーン、スポンサー枠、既存アプリへの送客へ展開します。</p>
        </div>
        <form className="ugc-form" onSubmit={submitPost}>
          <input value={form.theme} onChange={(event) => setForm({ ...form, theme: event.target.value })} placeholder="ランキングテーマ" />
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {categories.filter((item) => item !== 'すべて').map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="推薦理由・集計したい条件" />
          <button type="submit">投稿する</button>
        </form>
        <div className="post-grid">
          {posts.length === 0 && <p className="empty-text">まだ投稿はありません。最初のランキング案を投稿できます。</p>}
          {posts.map((post) => <article key={post.id}><span>{post.category} / {post.status}</span><h3>{post.theme}</h3><p>{post.reason}</p><small>{post.date}</small></article>)}
        </div>
      </section>

      <section className="growth-grid">
        <div className="revenue-panel"><h2>収益導線</h2>{revenuePlans.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}</div>
        <div className="buzz-panel"><h2>バズ施策</h2><ul>{buzzIdeas.map((idea) => <li key={idea}>{idea}</li>)}</ul></div>
      </section>

      <section className="seo-section">
        <div className="answer-box">
          <span className="brand">SEO / AIO / LLMO</span>
          <h2>投票ランキングは、テーマ、投票数、推薦理由、更新日、上位理由を明確にすると検索とAI回答に強くなります。</h2>
          <p>ユーザー投稿をランキングテーマ案として蓄積し、十分な投票が集まったものから個別SEOページ化する想定です。</p>
        </div>
        <div className="faq-grid">{faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
      </section>
    </main>
  )
}

export default App
