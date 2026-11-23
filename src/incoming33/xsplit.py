"""xsplit.py - lazy program groups for T.O X (used by patch_v3.py, last step before the html is written).

The main script is ONE strict-mode IIFE, so a group cannot be a separate <script> (it would not see the closure).
Instead, the top-level function declarations of a group's chunks are MOVED into
  <script type="text/plain" data-xg="name"> ... </script>
and each one leaves a one-line stub in place:  function f(){return XG('name','f',this,arguments)}
XG() evaluates the block once, inside the closure (direct eval, as demo_stub.js already does), on the first call.
Everything else in the chunk (state objects, XCMD / XDESC / ribbon registration, wrappers) stays where it was and
still runs at start, so commands and buttons stay registered.

A function is NOT moved (it stays eager, unchanged) when moving it could change behaviour:
  dup      declared more than once in the script (a later chunk overrides it)
  assign   the name is assigned somewhere (wrapper pattern  f=function(){..old..})
  prop     used as an object (f.x, f[..], new f): identity / prototype / .length matter
  mixed    used as a value (callback, listener) both inside its own lazy text and outside it (two identities)
  hot      listed in xg_hot.json: called during start-up (measured), moving it would load the group at start
  nomatch  its text is not found exactly once at the top level of the assembled script
"""
import re, json

RUNTIME = ("\n/* lazy program groups (xsplit.py): XG evaluates a data-xg text block once, inside this closure */\n"
 "function XG(__g,__n,__t,__a){ let __m=XG.m[__g]; if(!__m){ const __e=document.querySelector('script[data-xg=\"'+__g+'\"]'); "
 "if(!__e)throw new Error('T.O X: part \"'+__g+'\" is missing from this build'); const __t0=performance.now(); __m=XG.m[__g]=eval(__e.text); __e.remove(); "
 "(window.__xgRan=window.__xgRan||[]).push([__g,__n,+(performance.now()-__t0).toFixed(1),Math.round(performance.now())]); } "
 "if(window.__xgHot&&!window.__xgHot.done)window.__xgHot.n[__g+'/'+__n]=1; return __m[__n].apply(__t,__a); }\nXG.m={};\n")

_TOK = re.compile(r"""(?P<ws>\s+)|(?P<lc>//[^\n]*)|(?P<bc>/\*.*?\*/)|(?P<id>[A-Za-z_$][\w$]*)|(?P<num>\.?\d[\w.]*)|(?P<s1>'(?:[^'\\\n]|\\.)*')|(?P<s2>"(?:[^"\\\n]|\\.)*")|(?P<p>=>|\.\.\.|[{}()\[\];,.<>+\-*%&|^!~?:=/`@#\\])""", re.S)
_RX_PREV_WORDS = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'void', 'delete', 'throw', 'new', 'instanceof', 'yield', 'await'}
_KW_NOT_VALUE = {'function', 'async'}


def scan(src):
    """Tokenise JS. Returns (ids, decls): ids = [(pos, name, prev, next_char)], decls = top-level (depth 0)
    function declarations [(name, start, end)]. Strings, comments and regex literals are skipped; ${} in templates is code."""
    n = len(src); i = 0; stack = []; ids = []; decls = []
    prev = ''          # previous significant token text
    pend = None        # pending top-level function declaration: [name, start, state]
    while i < n:
        m = _TOK.match(src, i)
        if not m:
            raise ValueError('xsplit: cannot tokenise at %d: %r' % (i, src[i:i + 40]))
        k = m.lastgroup; t = m.group(); j = m.end()
        if k in ('ws', 'lc', 'bc'):
            i = j; continue
        if k == 'p' and t == '/':
            # regex literal or division
            if prev == '' or prev in _RX_PREV_WORDS or (len(prev) <= 3 and prev[-1] in '([{,;=:!&|?+-*%<>~^}' ) or prev == '=>':
                q = i + 1; cls = False
                while q < n:
                    c = src[q]
                    if c == '\\': q += 2; continue
                    if c == '\n': raise ValueError('xsplit: newline in regex at %d: %r' % (i, src[i:i + 60]))
                    if cls:
                        if c == ']': cls = False
                    elif c == '[': cls = True
                    elif c == '/': break
                    q += 1
                q += 1
                while q < n and (src[q].isalnum()): q += 1
                prev = '/re/'; i = q; continue
        if k == 'p' and t == '`':
            stack.append('`'); i = _tpl(src, j, stack); prev = '`s`' if not (stack and stack[-1] == '${') else '${'
            continue
        if k == 'p':
            if t in '({[':
                if pend and pend[2] == 'body' and t == '{' and len(stack) == 0: pend[2] = 'in'
                stack.append(t)
            elif t in ')}]':
                if stack and stack[-1] == '${' and t == '}':
                    stack.pop(); i = _tpl(src, j, stack); prev = '`s`' if not (stack and stack[-1] == '${') else '${'
                    continue
                if not stack: raise ValueError('xsplit: unbalanced %s at %d' % (t, i))
                stack.pop()
                if pend and len(stack) == 0:
                    if pend[2] == 'args' and t == ')': pend[2] = 'body'
                    elif pend[2] == 'in' and t == '}': decls.append((pend[0], pend[1], j)); pend = None
        elif k == 'id':
            if t == 'function' and len(stack) == 0 and pend is None and (prev in ('', ';', '}', 'async', '`s`', '/re/', ')') or prev[-1:].isalnum() or prev[-1:] in '\'"$_') and prev not in _RX_PREV_WORDS and prev != '=':
                m2 = re.compile(r'\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(').match(src, j)
                if m2:
                    st = i
                    if prev == 'async':
                        st = src.rindex('async', 0, i)
                    pend = [m2.group(1), st, 'args']
            nx = _TOK.match(src, j); q = j
            while nx and nx.lastgroup in ('ws', 'lc', 'bc'):
                q = nx.end(); nx = _TOK.match(src, q)
            ids.append((i, t, prev, src[q:q + 1] if q < n else ''))
        prev = t; i = j
    if stack: raise ValueError('xsplit: unbalanced at end: %r' % stack[-3:])
    return ids, decls


def _tpl(src, i, stack):
    """inside a template literal from i; returns the index after its end or after a '${' (then '${' is on the stack)."""
    n = len(src)
    while i < n:
        c = src[i]
        if c == '\\': i += 2; continue
        if c == '`':
            assert stack.pop() == '`'; return i + 1
        if c == '$' and src[i + 1:i + 2] == '{':
            stack.append('${'); return i + 2
        i += 1
    raise ValueError('xsplit: open template literal')


def apply(html, groups, rd, hot=(), log=print):
    """html: assembled page. groups: {name: [chunk files]}. rd: reads a chunk. Returns the new html."""
    MS = "<script>\n(function(){\n'use strict';"
    assert html.count(MS) == 1
    a = html.index(MS) + len(MS); b = html.index('</script>', a)
    js = html[a:b]
    # top level of the IIFE = depth 0 once the wrapper is cut off
    end = js.rindex('})'); body = js[:end]
    ids, decls = scan(body)
    top = {}
    for nm, s0, e0 in decls: top.setdefault(nm, []).append((s0, e0))
    ndecl = {}
    for m in re.finditer(r'function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(', body): ndecl[m.group(1)] = ndecl.get(m.group(1), 0) + 1
    uses = {}
    for u in ids: uses.setdefault(u[1], []).append(u)
    hot = set(hot); cand = {}; why = {}
    for g, files in groups.items():
        for f in files:
            _, d = scan(rd(f))
            for nm, _s, _e in d:
                key = g + '/' + nm
                if nm in cand: why[key] = 'dup'; why[cand[nm][0] + '/' + nm] = 'dup'; continue
                if nm not in top or len(top[nm]) != 1: why[key] = 'nomatch'; continue
                if ndecl.get(nm, 0) != 1: why[key] = 'dup'; continue
                cand[nm] = (g, top[nm][0])
    for nm in list(cand):
        g, (s0, e0) = cand[nm]; key = g + '/' + nm
        if key in why: del cand[nm]; continue
        if key in hot: why[key] = 'hot'; del cand[nm]; continue
        for pos, _n, prev, nx in uses.get(nm, []):
            if s0 <= pos < s0 + 40 and prev in ('function', '*'): continue   # its own declaration
            if prev == '.': continue                                        # a property called the same, not this binding
            if prev == 'new' or nx in ('.', '['): why[key] = 'prop'; break
            if nx == '=' and body[pos:pos + len(nm) + 12].replace(' ', '')[len(nm):len(nm) + 2] not in ('==', '=>'): why[key] = 'assign'; break
        if key in why: del cand[nm]
    # value identity: fixpoint
    changed = True
    while changed:
        changed = False
        spans = {}
        for nm, (g, sp) in cand.items(): spans.setdefault(g, []).append(sp)
        for nm in list(cand):
            g, (s0, e0) = cand[nm]; inside = outside = 0
            for pos, _n, prev, nx in uses.get(nm, []):
                if prev == '.' or nx == '(' or (s0 <= pos < s0 + 40 and prev in ('function', '*')): continue
                if any(x <= pos < y for x, y in spans[g]): inside += 1
                else: outside += 1
            if inside and outside:
                why[g + '/' + nm] = 'mixed'; del cand[nm]; changed = True
    # rewrite, back to front
    blocks = {g: [] for g in groups}; out = body; stat = {g: [0, 0] for g in groups}
    for nm, (g, (s0, e0)) in sorted(cand.items(), key=lambda kv: -kv[1][1][0]):
        txt = body[s0:e0]; head = txt[:txt.index('(')]
        assert '</script' not in txt.lower() and '<!--' not in txt
        out = out[:s0] + head + "(){return XG('%s','%s',this,arguments)}" % (g, nm) + out[e0:]
        blocks[g].append((s0, nm, txt)); stat[g][0] += 1; stat[g][1] += len(txt)
    pre = ''
    for g in groups:
        if not blocks[g]: continue
        fs = sorted(blocks[g])
        pre += '<script type="text/plain" data-xg="%s">\n%s\n;({%s})\n//# sourceURL=xg-%s.js\n</script>\n' % (g, '\n'.join(t for _s, _n, t in fs), ','.join(n for _s, n, _t in fs), g)
        log('xsplit %-6s %4d functions lazy, %5d KB moved' % (g, stat[g][0], stat[g][1] // 1024))
    kept = {}
    for k, v in why.items(): kept.setdefault(v, []).append(k)
    log('xsplit kept eager: ' + ', '.join('%s=%d' % (k, len(v)) for k, v in sorted(kept.items())))
    apply.report = {'moved': {g: {'n': stat[g][0], 'bytes': stat[g][1]} for g in groups}, 'kept': kept}
    i0 = html.index(MS)
    return html[:i0] + pre + MS + RUNTIME + out + js[end:] + html[b:]


if __name__ == '__main__':   # self-check
    t = "const a=/x\\/[/]y/g, s='function q(){', u=`a${ {b:1}.b }c`;\nfunction f(a,b){ return a/b/2; }\nasync function g(){ const h=function k(){}; }\nx.f2=function f3(){};\nfunction* gen(){ yield 1 }\n"
    ids, d = scan(t)
    assert [x[0] for x in d] == ['f', 'g', 'gen'], d
    assert t[d[1][1]:d[1][2]].startswith('async function g') and t[d[0][1]:d[0][2]].endswith('a/b/2; }')
    print('xsplit self-check ok')
