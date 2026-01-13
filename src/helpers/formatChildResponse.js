export const formatChildResponse = (child, invite = null, strict = null) => {
  // Xử lý Strict Rules: parse JSON nếu là string, hoặc dùng mảng rỗng
  const parseJsonProp = (prop) => {
    if (!prop) return [];
    try {
      return typeof prop === 'string' ? JSON.parse(prop) : prop;
    } catch (e) {
      return [];
    }
  };

  // Nếu strict được include trong child (eager loading)
  const strictData = strict || child.stricts || {};
  // Nếu invite được include trong child
  const inviteData =
    invite || (child.receivedInvites && child.receivedInvites[0]) || null;

  return {
    id: child.id,
    username: child.username,
    firstName: child.first_name,
    lastName: child.last_name,
    displayName: child.display_name,
    dob: child.dob,
    gender: child.gender,
    parentId: child.parent_id,
    avatarUrl: child.avatar_url || null,

    // Flatten (làm phẳng) object settings để FE dễ gọi: user.settings.timeLimit
    settings: {
      timeLimit: strictData.time_limit_minutes || null,
      blockedKeywords: parseJsonProp(strictData.blocked_keyword),
      blockedCategories: parseJsonProp(strictData.blocked_category),
      blockedFeatures: parseJsonProp(strictData.blocked_feature),
    },

    // Invite info
    invite: {
      code: inviteData?.code || null,
      isUsed: inviteData?.used || false,
      isExpired: inviteData?.expires_at
        ? new Date(inviteData.expires_at) < new Date()
        : false,
    },
  };
};
