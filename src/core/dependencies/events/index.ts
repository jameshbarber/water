interface EventBus {
    emit(eventName: string, data: any): void;
    on(eventName: string, callback: (data: any) => void): void;
}