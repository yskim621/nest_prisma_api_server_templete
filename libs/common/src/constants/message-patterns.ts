export const AUTH_PATTERNS = {
  LOGIN: 'auth.login',
  VALIDATE_TOKEN: 'auth.validate_token',
  REFRESH_TOKEN: 'auth.refresh_token',
  HASH_PASSWORD: 'auth.hash_password',
};

export const CORE_PATTERNS = {
  // User
  USER_FIND_ALL: 'core.user.find_all',
  USER_FIND_BY_ID: 'core.user.find_by_id',
  USER_CREATE: 'core.user.create',
  USER_UPDATE: 'core.user.update',
  USER_DELETE: 'core.user.delete',
  USER_FIND_BY_EMAIL: 'core.user.find_by_email',
  // UserGroup
  USER_GROUP_FIND_ALL: 'core.user_group.find_all',
  USER_GROUP_FIND_BY_ID: 'core.user_group.find_by_id',
  USER_GROUP_CREATE: 'core.user_group.create',
  USER_GROUP_UPDATE: 'core.user_group.update',
  USER_GROUP_DELETE: 'core.user_group.delete',
  USER_GROUP_GET_PERMISSIONS: 'core.user_group.get_permissions',
  USER_GROUP_UPDATE_PERMISSIONS: 'core.user_group.update_permissions',
  USER_GROUP_GET_USERS: 'core.user_group.get_users',
  // Permission
  PERMISSION_FIND_ALL: 'core.permission.find_all',
  PERMISSION_FIND_BY_ID: 'core.permission.find_by_id',
  PERMISSION_CREATE: 'core.permission.create',
  PERMISSION_UPDATE: 'core.permission.update',
  PERMISSION_DELETE: 'core.permission.delete',
  PERMISSION_GET_USER_PERMISSIONS: 'core.permission.get_user_permissions',
  PERMISSION_GET_GROUP_PERMISSIONS: 'core.permission.get_group_permissions',
  PERMISSION_UPDATE_USER_PERMISSIONS: 'core.permission.update_user_permissions',
  PERMISSION_UPDATE_GROUP_PERMISSIONS: 'core.permission.update_group_permissions',
  PERMISSION_GET_OWNED: 'core.permission.get_owned',
  PERMISSION_GET_PAGE_ACTIONS: 'core.permission.get_page_actions',
  // Menu
  MENU_FIND_ALL: 'core.menu.find_all',
  MENU_FIND_BY_ID: 'core.menu.find_by_id',
  MENU_CREATE: 'core.menu.create',
  MENU_UPDATE: 'core.menu.update',
  MENU_DELETE: 'core.menu.delete',
  MENU_GET_TREE: 'core.menu.get_tree',
  MENU_GET_TREE_BY_USER: 'core.menu.get_tree_by_user',
  MENU_UPSERT_TRANSLATION: 'core.menu.upsert_translation',
  MENU_DELETE_TRANSLATION: 'core.menu.delete_translation',
  MENU_TOGGLE_FAVORITE: 'core.menu.toggle_favorite',
  // Board
  BOARD_FIND_ALL: 'core.board.find_all',
  BOARD_FIND_BY_ID: 'core.board.find_by_id',
  BOARD_CREATE: 'core.board.create',
  BOARD_UPDATE: 'core.board.update',
  BOARD_DELETE: 'core.board.delete',
  BOARD_FIND_BY_USER: 'core.board.find_by_user',
  BOARD_BULK_CREATE: 'core.board.bulk_create',
  // Sample Transaction
  SAMPLE_TX_CREATE_WITH_CHECK: 'core.sample_tx.create_with_check',
  SAMPLE_TX_BULK_CREATE: 'core.sample_tx.bulk_create',
  SAMPLE_TX_TRANSFER: 'core.sample_tx.transfer',
  SAMPLE_TX_GET_ALL: 'core.sample_tx.get_all',
  SAMPLE_TX_STRATEGY_PROCESS: 'core.sample_tx.strategy_process',
  SAMPLE_TX_STRATEGY_LIST: 'core.sample_tx.strategy_list',
  // BullMQ Sample
  BULL_ADD_JOB: 'core.bull.add_job',
  BULL_GET_JOB_STATUS: 'core.bull.get_job_status',
  BULL_GET_QUEUE_STATUS: 'core.bull.get_queue_status',
  BULL_REMOVE_JOB: 'core.bull.remove_job',
  BULL_RETRY_FAILED: 'core.bull.retry_failed',
  // RabbitMQ Sample
  RABBIT_PUBLISH: 'core.rabbit.publish',
  RABBIT_GET_STATUS: 'core.rabbit.get_status',
  RABBIT_CLEAR: 'core.rabbit.clear',
};

export const HEALTH_PATTERNS = {
  AUTH_PING: 'health.auth.ping',
  CORE_PING: 'health.core.ping',
};
