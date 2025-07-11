export class ActionLogger {
    logAction(action) {
        if (!action)
            return;
        console.log("Hey, an action happened:", action);
    }
}
