/*
 * Configuration settings for the spaced repetition system. This module
 * centralizes tunable parameters such as the maximum number of new cards a
 * user can be introduced to in a single day. When migrating to SQL or
 * building user preferences, this can be expanded to include per-user
 * settings or environment-based overrides.
 */
export const SRS_CONFIG = {
  /**
   * The maximum number of cards that a user can be introduced to for the
   * first time in a single review day. Cards with repetitionCount === 0
   * are considered "new". If a user has more unseen cards than this
   * limit, only the first N by creation date will be shown in a session.
   */
  DAILY_NEW_CARD_LIMIT: 10,
};