/**
 * Safe parser for student-entered coordinate rules such as "x + 3", "-y",
 * "2x", "0.5(x - 1)", or "y^2". Never uses eval/Function.
 *
 * Grammar (implicit multiplication binds like *):
 *   expr    := term (('+' | '-') term)*
 *   term    := unary (('*' | '/' | <implicit>) unary)*
 *   unary   := ('+' | '-') unary | power
 *   power   := primary ('^' unary)?
 *   primary := number | 'x' | 'y' | '(' expr ')'
 */

const VARIABLES = new Set(['x', 'y']);

function normalize(input) {
  return input
    .replace(/[−–—]/g, '-') // unicode minus / dashes
    .replace(/[×⋅·]/g, '*') // × ⋅ ·
    .replace(/÷/g, '/') // ÷
    .replace(/[′’]/g, "'") // prime marks
    .toLowerCase()
    .trim()
    // Allow students to type the left-hand side, e.g. "x' = x + 3".
    .replace(/^[xy]'*\s*=\s*/, '');
}

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i += 1;
    } else if (/[0-9.]/.test(ch)) {
      const match = /^(\d+\.?\d*|\.\d+)/.exec(src.slice(i));
      if (!match) throw new Error(`"${ch}" is not a valid number.`);
      tokens.push({ type: 'num', value: Number(match[0]), pos: i });
      i += match[0].length;
    } else if (VARIABLES.has(ch)) {
      tokens.push({ type: 'var', value: ch, pos: i });
      i += 1;
    } else if ('+-*/^()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch, pos: i });
      i += 1;
    } else {
      throw new Error(`"${ch}" isn't allowed. Use numbers, x, y, + - * / ^ and parentheses.`);
    }
  }
  return tokens;
}

function parseTokens(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (tok, value) => tok && tok.type === 'op' && tok.value === value;

  function expr() {
    let node = term();
    while (isOp(peek(), '+') || isOp(peek(), '-')) {
      const op = tokens[pos++].value;
      node = { type: 'bin', op, left: node, right: term() };
    }
    return node;
  }

  function term() {
    let node = unary();
    for (;;) {
      const tok = peek();
      if (isOp(tok, '*') || isOp(tok, '/')) {
        pos += 1;
        node = { type: 'bin', op: tok.value, left: node, right: unary() };
      } else if (tok && (tok.type === 'var' || isOp(tok, '('))) {
        // Implicit multiplication: 2x, 3(x + 1), x(y), (x)(y)
        node = { type: 'bin', op: '*', left: node, right: unary() };
      } else {
        return node;
      }
    }
  }

  function unary() {
    if (isOp(peek(), '-')) {
      pos += 1;
      return { type: 'neg', arg: unary() };
    }
    if (isOp(peek(), '+')) {
      pos += 1;
      return unary();
    }
    return power();
  }

  function power() {
    const base = primary();
    if (isOp(peek(), '^')) {
      pos += 1;
      return { type: 'bin', op: '^', left: base, right: unary() };
    }
    return base;
  }

  function primary() {
    const tok = peek();
    if (!tok) throw new Error('The rule ends too early. Is something missing?');
    if (tok.type === 'num') {
      pos += 1;
      return { type: 'num', value: tok.value };
    }
    if (tok.type === 'var') {
      pos += 1;
      return { type: 'var', name: tok.value };
    }
    if (isOp(tok, '(')) {
      pos += 1;
      const inner = expr();
      if (!isOp(peek(), ')')) throw new Error('A "(" is missing its closing ")".');
      pos += 1;
      return inner;
    }
    if (isOp(tok, ')')) throw new Error('There is an extra ")".');
    throw new Error(`"${tok.value}" is in an unexpected place.`);
  }

  const tree = expr();
  if (pos < tokens.length) {
    const tok = tokens[pos];
    if (isOp(tok, ')')) throw new Error('There is an extra ")".');
    throw new Error(`"${tok.value}" is in an unexpected place.`);
  }
  return tree;
}

function evaluate(node, vars) {
  switch (node.type) {
    case 'num':
      return node.value;
    case 'var':
      return vars[node.name];
    case 'neg':
      return -evaluate(node.arg, vars);
    case 'bin': {
      const a = evaluate(node.left, vars);
      const b = evaluate(node.right, vars);
      switch (node.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        case '^': return a ** b;
        default: throw new Error(`Unknown operator ${node.op}`);
      }
    }
    default:
      throw new Error('Unknown expression');
  }
}

/**
 * Parse a rule string.
 * @returns {{ ok: true, evaluate: (vars: {x:number, y:number}) => number }
 *         | { ok: false, error: string }}
 */
export function parseRule(input) {
  const src = normalize(String(input ?? ''));
  if (src === '') return { ok: false, error: 'Enter a rule.' };
  try {
    const tree = parseTokens(tokenize(src));
    return { ok: true, evaluate: (vars) => evaluate(tree, vars) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
