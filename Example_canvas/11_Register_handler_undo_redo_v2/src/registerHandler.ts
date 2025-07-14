export class RegisterHandler {
    public logAction(action: any): void {
        if (!action) return;
        console.log("Hey, an action happened:", action);
    }
}