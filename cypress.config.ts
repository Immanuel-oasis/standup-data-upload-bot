import { defineConfig } from "cypress";
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  allowCypressEnv: false,
  execTimeout: 60000,
  defaultCommandTimeout: 60000,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        mergeCsvFiles({ dir }: { dir: string; general: string }) {
          const generalPath = path.join(dir, 'allTickets.csv')
          const files = fs.readdirSync(dir)

          const closedFile = files.find(f => f.startsWith('Closed Tickets - ') && f.endsWith('.csv'))
          const openFile = files.find(f => f.startsWith('Open Tickets - ') && f.endsWith('.csv'))

          fs.writeFileSync(generalPath, '')

          if (closedFile) {
            const closedPath = path.join(dir, closedFile)
            fs.appendFileSync(generalPath, fs.readFileSync(closedPath, 'utf-8'))
            fs.unlinkSync(closedPath)
            console.log(`Deleted: ${closedPath}, exists after delete: ${fs.existsSync(closedPath)}`)

          }

          if (openFile) {
            const openPath = path.join(dir, openFile)
            fs.appendFileSync(generalPath, fs.readFileSync(openPath, 'utf-8'))
            fs.unlinkSync(openPath)
            console.log(`Deleted: ${openPath}, exists after delete: ${fs.existsSync(openPath)}`)

          }

          return null
        }

      })

      on('task', {
        async uploadCsvToGoogleSheet() {
          const csv = fs.readFileSync('cypress/downloads/allTickets.csv', 'utf-8')

          const response = await fetch('https://script.google.com/macros/s/AKfycbwVcmKlqyGiwC9-ag03yg6Lp-lHTIG_FoCPzcGGCMLR_VDttbH-r2GDtArv3Yhog2-f/exec', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({ csv: csv }).toString()
          })

          const result = await response.json()

          return result;
        }
      })

    },
  },
});
