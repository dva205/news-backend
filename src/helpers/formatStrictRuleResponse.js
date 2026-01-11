export const formatStrictRuleResponse = (rule) => {
    const parseJsonProp = (prop) => {
        if (!prop) return [];
        try {
            return typeof prop === 'string' ? JSON.parse(prop) : prop;
        } catch (e) {
            return [];
        }
    };

    if (rule === null) {
        return {
        timeLimit:  null,
        blockedKeywords: [],
        blockedCategories: [],
        blockedFeatures: [],
    }
    }

    return {
        timeLimit: rule.time_limit_minutes || null,
        blockedKeywords: parseJsonProp(rule.blocked_keyword),
        blockedCategories: parseJsonProp(rule.blocked_category),
        blockedFeatures: parseJsonProp(rule.blocked_feature),
    }
}