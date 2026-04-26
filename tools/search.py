#!/usr/bin/env python3
"""
LLM Wiki Search — CLI search engine over wiki markdown pages.

Usage:
    python tools/search.py "deck building codes frost depth"
    python tools/search.py --json "competitor pricing SaaS"

Scoring: TF-IDF with title boost. No external dependencies.
"""

import argparse
import json
import math
import os
import re
import sys
from collections import Counter
from pathlib import Path

WIKI_DIR = Path(__file__).resolve().parent.parent / "wiki"
TITLE_BOOST = 3.0
TOP_K = 10


def tokenize(text: str) -> list[str]:
    """Lowercase tokenization, strip punctuation."""
    return re.findall(r"[a-z0-9]+", text.lower())


def extract_title(content: str, filepath: Path) -> str:
    """Extract first markdown heading or use filename."""
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return filepath.stem.replace("-", " ").title()


def find_excerpt(content: str, query_tokens: set[str], context_chars: int = 200) -> str:
    """Find the best excerpt around query term matches."""
    lines = content.splitlines()
    best_line_idx = 0
    best_score = 0

    for i, line in enumerate(lines):
        line_tokens = set(tokenize(line))
        score = len(query_tokens & line_tokens)
        if score > best_score:
            best_score = score
            best_line_idx = i

    # Return 2 lines around the best match
    start = max(0, best_line_idx)
    end = min(len(lines), best_line_idx + 2)
    excerpt = " ".join(lines[start:end]).strip()

    # Trim to context_chars
    if len(excerpt) > context_chars:
        excerpt = excerpt[:context_chars].rsplit(" ", 1)[0] + "..."

    # Skip frontmatter lines
    if excerpt.startswith("---"):
        excerpt = "(frontmatter — see page for details)"

    return excerpt


def build_corpus(wiki_dir: Path) -> list[dict]:
    """Read all .md files under wiki/ into a corpus."""
    corpus = []
    for md_file in sorted(wiki_dir.rglob("*.md")):
        try:
            content = md_file.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        title = extract_title(content, md_file)
        rel_path = str(md_file.relative_to(wiki_dir.parent))
        tokens = tokenize(content)
        title_tokens = tokenize(title)

        corpus.append({
            "path": rel_path,
            "title": title,
            "content": content,
            "tokens": tokens,
            "title_tokens": title_tokens,
        })

    return corpus


def tfidf_search(corpus: list[dict], query: str, top_k: int = TOP_K) -> list[dict]:
    """TF-IDF scoring with title boost."""
    query_tokens = tokenize(query)
    query_token_set = set(query_tokens)

    if not query_tokens or not corpus:
        return []

    # Document frequency
    N = len(corpus)
    df = Counter()
    for doc in corpus:
        unique_tokens = set(doc["tokens"]) | set(doc["title_tokens"])
        for token in unique_tokens:
            df[token] += 1

    # IDF
    idf = {}
    for token in query_tokens:
        if df[token] > 0:
            idf[token] = math.log((N + 1) / (df[token] + 1)) + 1
        else:
            idf[token] = math.log(N + 1) + 1

    # Score each document
    results = []
    for doc in corpus:
        # TF in body
        body_tf = Counter(doc["tokens"])
        body_len = max(len(doc["tokens"]), 1)

        # TF in title (boosted)
        title_tf = Counter(doc["title_tokens"])
        title_len = max(len(doc["title_tokens"]), 1)

        score = 0.0
        for token in query_tokens:
            body_score = (body_tf[token] / body_len) * idf.get(token, 0)
            title_score = (title_tf[token] / title_len) * idf.get(token, 0) * TITLE_BOOST
            score += body_score + title_score

        if score > 0:
            excerpt = find_excerpt(doc["content"], query_token_set)
            results.append({
                "path": doc["path"],
                "title": doc["title"],
                "score": round(score, 4),
                "excerpt": excerpt,
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


def main():
    parser = argparse.ArgumentParser(description="Search the LLM Wiki")
    parser.add_argument("query", help="Search query string")
    parser.add_argument("--json", action="store_true", help="Output as JSON for LLM tool use")
    parser.add_argument("--top", type=int, default=TOP_K, help=f"Number of results (default: {TOP_K})")
    args = parser.parse_args()

    if not WIKI_DIR.exists():
        print(f"Error: wiki directory not found at {WIKI_DIR}", file=sys.stderr)
        sys.exit(1)

    corpus = build_corpus(WIKI_DIR)
    results = tfidf_search(corpus, args.query, top_k=args.top)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        if not results:
            print(f"No results for: {args.query}")
            print(f"(Searched {len(corpus)} pages in {WIKI_DIR})")
            return

        print(f"Results for: {args.query}")
        print(f"({len(corpus)} pages searched)\n")

        for i, r in enumerate(results, 1):
            print(f"  {i}. [{r['score']:.4f}] {r['title']}")
            print(f"     {r['path']}")
            print(f"     {r['excerpt']}")
            print()


if __name__ == "__main__":
    main()
