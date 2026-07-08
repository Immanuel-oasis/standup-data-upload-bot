/// <reference types="cypress" />

import { Interception } from "cypress/types/net-stubbing"

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
    namespace Cypress {
        interface Chainable {
            login(url: string): Chainable<void>
            waitForExportComplete(attempt: number, maxAttempts: number): Chainable<void>
            mergeCsvFiles(dir: string): Cypress.Chainable<Interception<any, any>>
            uploadCsvToGoogleSheet(): Chainable<any>
            waitIndefinitelyForSpecificFileAction(): Chainable<void>
            deleteFilesInDownload(): Chainable<void>
        }
    }
}

const credentials = {
    username: 'esosanya',
    password: 'sosanya'
}

Cypress.Commands.add('login', (url: string) => {
    cy.visit(url)
    // enter username
    cy.get('#name')
        .type(credentials.username)
    cy.get('#pass')
        .type(credentials.password)
    cy.contains('button', 'Log In')
        .click()
    cy.url({ timeout: 60000 }).should('include', '/index.php')
})

Cypress.Commands.add('waitForExportComplete', (attempt = 1, maxAttempts = 30): any => {
    return cy.wait('@created', { timeout: 180000 }).then((req) => {
        const status = req.response?.statusCode

        if (status === 201) {
            // done — export completed successfully
            return
        }

        if (status === 200 && attempt < maxAttempts) {
            // still processing, poll again
            return cy.waitForExportComplete(attempt + 1, maxAttempts)
        } else if (status === 200) {
            throw new Error(`Export did not complete after ${maxAttempts} polls (last status: ${status})`)
        }

    })
})

// mergeCsvFiles({ dir, general, closed, open }: { dir: string; general: string; closed: string; open: string }) 
Cypress.Commands.add('mergeCsvFiles', (dir) => {
    cy.task('mergeCsvFiles', { dir })
})

Cypress.Commands.add('uploadCsvToGoogleSheet', () => {
    cy.task('uploadCsvToGoogleSheet', null, { timeout: 180000 })
})

Cypress.Commands.add('waitIndefinitelyForSpecificFileAction', () => {
    cy.task('waitIndefinitelyForSpecificFileAction', null, { timeout: 180000 })
})

Cypress.Commands.add('deleteFilesInDownload', () => {
    cy.task('deleteFilesInDownload', null)
})