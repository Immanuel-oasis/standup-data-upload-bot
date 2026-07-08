describe('template spec', () => {
  const aliases: string[] = []
  it('Login to stampduty and download excel data', () => {
    // delete files if any exist
    cy.deleteFilesInDownload()
    // vist the page
    cy.login('https://stampduty.ticketsupport.com.ng/scp/login.php')
    // click the open
    cy.contains('a', 'Open')
      .click()
    // wait for open tickets to fully load
    cy.get('#queue-count-bucket', { timeout: 100000 })
      .should('be.visible')
    // click the select all
    cy.get('#selectAll')
      .click();
    cy.get('#queue-export')
      .click();
    cy.get('#queue-export input[type="submit"]')
      .click();
    let alias = Date.now().toString()
    cy.intercept('POST', 'https://stampduty.ticketsupport.com.ng/scp/ajax.php/export/*/check').as(alias)
    // waits for file to be created and saved
    cy.waitForExportComplete(1, 30, alias);
    // click the closed tickets
    cy.contains('a', 'Closed')
      .click()
    cy.get('#selectAll')
      .click();
    cy.get('#queue-export')
      .click();
    cy.get('#queue-export input[type="submit"]')
      .click();
    // waits for file to be created and saved
    cy.waitForExportComplete(1, 30, alias);
    // wait a bit to ensure data is totally downloaded
    cy.waitIndefinitelyForSpecificFileAction();
    // merge files
    cy.mergeCsvFiles('cypress/downloads')
    // upload all the csv to a google sheet
    cy.uploadCsvToGoogleSheet()
    // visit instructions view
    cy.visit('messages/instructions.html')
  })
})