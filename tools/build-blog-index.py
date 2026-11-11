#!/usr/bin/env python3
"""Rebuilds the blog card grid in blog.html (all posts) and index.html (newest 4; the 4th is the mobile-only card)
from tools/posts.json, sorted by date, newest first.
To publish a new post: create blog-xxx.html, add an entry to tools/posts.json, run:  python3 tools/build-blog-index.py"""
import json, html, re, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
MON = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"]
def hd(d): y, m, dd = d.split('-'); return f"{int(dd)} ב{MON[int(m)-1]} {y}"
ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg>'
posts = sorted(json.load(open('tools/posts.json', encoding='utf-8')), key=lambda p: p['date'], reverse=True)
e = lambda s: html.escape(s, quote=False)
def blog_card(i, p):
    return f'''      <a class="bcard" href="{p['href']}">
        <span class="bcard__frame"><span class="bcard__num">{i:02d}</span><span class="bcard__thumb"><img src="{p['thumb']}" alt="" loading="lazy" onerror="this.remove()"></span></span>
        <span class="bcard__info">
          <span class="bcard__meta">{hd(p['date'])}</span>
          <h2 class="bcard__title">{e(p['title'])}</h2>
          <p class="bcard__desc">{e(p['desc'])}</p>
          <span class="bcard__more">לקריאה {ARROW}</span>
        </span>
      </a>
'''
def home_card(i, p):
    cls = 'bcard bcard--m4' if i == 4 else 'bcard'
    return f'''        <a class="{cls}" href="{p['href']}">
        <span class="bcard__frame"><span class="bcard__thumb"><img src="{p['thumb']}" alt="" loading="lazy" onerror="this.remove()"></span></span>
        <span class="bcard__info">
          <span class="bcard__meta">{hd(p['date'])}</span>
          <h2 class="bcard__title">{e(p['title'])}</h2>
          <span class="bcard__more">לקריאה {ARROW}</span>
        </span>
      </a>
'''
def sub(path, start, end, new):
    s = open(path, encoding='utf-8').read()
    a = s.index(start) + len(start); b = s.index(end, a)
    open(path, 'w', encoding='utf-8').write(s[:a] + '\n' + new + s[b:])
sub('blog.html', '<div class="blog__grid">', '    </div>\n  </main>', ''.join(blog_card(i+1, p) for i, p in enumerate(posts)))
sub('index.html', '<div class="hb__grid">', '      </div>\n      <div class="gallery__more"><a class="btn btn--primary magnetic" href="blog.html">', ''.join(home_card(i+1, p) for i, p in enumerate(posts[:4])))
print('ok:', len(posts), 'posts; home =', [p['href'] for p in posts[:4]])
