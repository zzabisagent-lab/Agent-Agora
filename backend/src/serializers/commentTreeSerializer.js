function serializeComment(c, includeContent = true) {
  if (c.is_deleted) {
    return {
      _id: c._id,
      post: c.post,
      parent: c.parent || null,
      depth: c.depth,
      author_type: null,
      author_name: '[deleted]',
      content: null,
      upvotes: c.upvotes,
      downvotes: c.downvotes,
      score: c.score,
      is_deleted: true,
      verification_status: c.verification_status,
      created_at: c.created_at,
      updated_at: c.updated_at,
    };
  }
  return {
    _id: c._id,
    post: c.post,
    parent: c.parent || null,
    depth: c.depth,
    author_type: c.author_type,
    author_name: c.author_name,
    content: c.content,
    upvotes: c.upvotes,
    downvotes: c.downvotes,
    score: c.score,
    is_deleted: false,
    verification_status: c.verification_status,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

function buildTree(comments) {
  const map = new Map();
  const roots = [];

  for (const c of comments) {
    map.set(c._id.toString(), { ...serializeComment(c), children: [] });
  }

  for (const c of comments) {
    const node = map.get(c._id.toString());
    if (c.parent) {
      const parentNode = map.get(c.parent.toString());
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

module.exports = { buildTree, serializeComment };
