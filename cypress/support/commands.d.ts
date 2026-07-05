declare global {
    namespace Cypress {
        interface Chainable {
            login(url: string): Chainable<void>;
        }
    }
}
export {};
//# sourceMappingURL=commands.d.ts.map