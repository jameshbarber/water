class SimpleEventBus implements EventBus {
    private events: { [key: string]: ((data: any) => void)[] } = {};

    emit<T>(eventName: string, data: T) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].forEach(callback => callback(data));
    }

    on<T>(eventName: string, callback: (data: T) => void) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback as (data: any) => void);
    }
}

export default SimpleEventBus;