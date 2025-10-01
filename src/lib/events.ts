class EventBus {
    private events: { [key: string]: ((data: any) => void)[] } = {};

    emit(eventName: string, data: any) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].forEach(callback => callback(data));
    }

    on(eventName: string, callback: (data: any) => void) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
}

export const eventBus = new EventBus();



eventBus.emit("test", "Hello, world!");
