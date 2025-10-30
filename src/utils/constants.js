export const CUSTOMER_TYPES = {
  POSTPAID: 'POSTPAID',
  PREPAID: 'PREPAID',
  ALL: 'ALL',
};

export const DUNNING_STATUS = {
  ACTIVE: 'ACTIVE',
  NOTIFIED: 'NOTIFIED',
  RESTRICTED: 'RESTRICTED',
  BARRED: 'BARRED',
  CURED: 'CURED',
};

export const ACTION_TYPES = {
  NOTIFY: 'NOTIFY',
  THROTTLE: 'THROTTLE',
  BAR_OUTGOING: 'BAR_OUTGOING',
  DEACTIVATE: 'DEACTIVATE',
};

export const NOTIFICATION_CHANNELS = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  APP: 'APP',
  ALL: 'ALL',
};

export const STATUS_COLORS = {
  ACTIVE: '#4caf50',
  NOTIFIED: '#ff9800',
  RESTRICTED: '#ff5722',
  BARRED: '#f44336',
  CURED: '#2196f3',
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#757575';
};
