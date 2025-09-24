export enum NotificationType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    TELEGRAM = 'TELEGRAM',
    WHATSAPP = 'WHATSAPP',
    PUSH = 'PUSH',
    IN_APP = 'IN_APP',
}

export enum NotificationStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
    DELIVERED = 'DELIVERED',
    READ = 'READ',
}

export enum Priority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}
