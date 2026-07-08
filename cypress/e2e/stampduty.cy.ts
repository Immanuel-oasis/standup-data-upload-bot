describe('template spec', () => {
  it('Login to stampduty and download excel data', () => {
    // delete files if any exist
    cy.deleteFilesInDownload()
    // vist the page
    cy.login('https://stampduty.ticketsupport.com.ng/scp/login.php')
    // click the closed tickets
    cy.contains('a', 'Closed')
      .click()
    cy.get('#selectAll')
      .click();
    cy.get('#queue-export')
      .click();
    cy.get('#queue-export input[type="submit"]')
      .click();
    cy.intercept('POST', 'https://stampduty.ticketsupport.com.ng/scp/ajax.php/export/*/check').as('created')
    // waits for file to be created and saved
    cy.waitForExportComplete(1, 30);
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
    cy.intercept('POST', 'https://stampduty.ticketsupport.com.ng/scp/ajax.php/export/*/check').as('created')
    // waits for file to be created and saved
    cy.waitForExportComplete(1, 30);
    // wait a bit to ensure data is totally downloaded
    cy.waitIndefinitelyForSpecificFileAction();
    // merge files
    cy.mergeCsvFiles('cypress/downloads')
    // upload all the csv to a google sheet
    cy.uploadCsvToGoogleSheet()
  })
})