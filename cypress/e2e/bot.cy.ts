describe('template spec', () => {
  it('Login to stampduty and download excel data', () => {
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
    cy.wait(60000);
    // merge files
    cy.mergeCsvFiles('cypress/downloads')
    // upload all the csv to a google sheet
    cy.uploadCsvToGoogleSheet()
  })
})