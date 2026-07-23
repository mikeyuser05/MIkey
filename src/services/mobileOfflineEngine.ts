/**
 * PR10.7: Mobile and Offline Operations Engine
 * Handles offline queueing, local cache persistence, and delta sync replay.
 */

export interface QueuedOfflineAction {
    actionId: string;
    type: "RECORD_VITALS" | "UPDATE_PREFERENCES" | "LOG_EVENT";
    payload: any;
    timestamp: number;
}

export class MobileOfflineEngine {
    private actionQueue: QueuedOfflineAction[] = [];

    public enqueueAction(type: QueuedOfflineAction["type"], payload: any): QueuedOfflineAction {
        const action: QueuedOfflineAction = {
            actionId: `OFFLINE_ACT_${Date.now()}_${this.actionQueue.length + 1}`,
            type,
            payload,
            timestamp: Date.now()
        };
        this.actionQueue.push(action);
        return action;
    }

    public getQueueLength(): number {
        return this.actionQueue.length;
    }

    public flushAndReplayQueue(processCallback: (action: QueuedOfflineAction) => boolean): { replayed: number; failed: number } {
        let replayed = 0;
        let failed = 0;

        const remainingQueue: QueuedOfflineAction[] = [];

        for (const action of this.actionQueue) {
            const success = processCallback(action);
            if (success) {
                replayed++;
            } else {
                failed++;
                remainingQueue.push(action);
            }
        }

        this.actionQueue = remainingQueue;
        return { replayed, failed };
    }
}
