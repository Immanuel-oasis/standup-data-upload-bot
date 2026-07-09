describe('template spec', () => {
  it('Login to stampduty and download excel data', () => {
    // delete files if any exist
    cy.deleteFilesInDownload()
    // vist the page
    cy.login('https://crpsupport.ticketsupport.com.ng/scp/login.php')
    // click the open
    cy.contains('a', 'Open')
      .click()
    // make sure all data loaded
    cy.get('.queue-count')
      .should('not.be.empty')
    cy.get('#selectAll')
      .click();
    cy.get('#queue-export')
      .click();
    cy.get('#queue-export input[type="submit"]')
      .click();
    cy.intercept('POST', 'https://crpsupport.ticketsupport.com.ng/scp/ajax.php/export/*/check').as('created')

    cy.waitForExportComplete(1, 10, 'created');
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
    cy.waitForExportComplete(1, 30, 'created');
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