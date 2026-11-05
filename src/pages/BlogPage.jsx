import { useEffect, useState } from 'react'
import SectionHead from '../SectionHead'
import { blogPosts } from '../data'
import { usePage } from '../usePage'

function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function PostModal({ post, onClose }) {
  useEffect(() => {
    if (!post) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [post, onClose])
  if (!post) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Close">✕</button>
        <img src={post.image} alt="" />
        <div className="modal-body">
          <div className="post-meta">
            <span className="tag">{post.tag}</span>
            <span>{formatDate(post.date)}</span>
            <span>· {post.readTime}</span>
          </div>
          <h2>{post.title}</h2>
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    </div>
  )
}

export default function BlogPage() {
  usePage('Blog')
  const [openPost, setOpenPost] = useState(null)
  const [featured, ...rest] = blogPosts
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          kicker="Blog"
          title="Notes from Room 1317"
          sub="Thoughts on teaching, math, and the occasional classroom disaster."
        />
        <article className="card featured-post reveal" onClick={() => setOpenPost(featured)}>
          <img src={featured.image} alt="" />
          <div className="featured-body">
            <div className="post-meta">
              <span className="tag">{featured.tag}</span>
              <span>{formatDate(featured.date)}</span>
              <span>· {featured.readTime}</span>
            </div>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <span className="read-more">Read post →</span>
          </div>
        </article>
        <div className="post-grid">
          {rest.map((post) => (
            <article key={post.slug} className="card post reveal" onClick={() => setOpenPost(post)}>
              <img src={post.image} alt="" />
              <div className="post-body">
                <div className="post-meta">
                  <span className="tag">{post.tag}</span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="read-more">Read post →</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <PostModal post={openPost} onClose={() => setOpenPost(null)} />
    </section>
  )
}
