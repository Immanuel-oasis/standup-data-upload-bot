import { defineConfig } from "cypress";
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  allowCypressEnv: false,
  execTimeout: 180000,
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
            let closedContent = fs.readFileSync(closedPath, 'utf-8')

            // make sure there's a trailing newline so the open rows don't
            // get glued onto the last closed row
            if (closedContent.length && !closedContent.endsWith('\n')) {
              closedContent += '\n'
            }

            fs.appendFileSync(generalPath, closedContent)
            fs.unlinkSync(closedPath)
            console.log(`Deleted: ${closedPath}, exists after delete: ${fs.existsSync(closedPath)}`)
          }

          if (openFile) {
            const openPath = path.join(dir, openFile)
            const openContent = fs.readFileSync(openPath, 'utf-8')

            // strip the header row (first line) before appending
            const newlineIndex = openContent.indexOf('\n')
            const openContentNoHeader = newlineIndex !== -1
              ? openContent.slice(newlineIndex + 1)
              : ''

            fs.appendFileSync(generalPath, openContentNoHeader)
            fs.unlinkSync(openPath)
            console.log(`Deleted: ${openPath}, exists after delete: ${fs.existsSync(openPath)}`)
          }

          return null
        }
      })

      on('task', {
        async uploadCsvToGoogleSheet() {
          try {
            const csv = fs.readFileSync('cypress/downloads/allTickets.csv', 'utf-8')

            const response = await fetch('https://script.google.com/macros/s/AKfycbwVcmKlqyGiwC9-ag03yg6Lp-lHTIG_FoCPzcGGCMLR_VDttbH-r2GDtArv3Yhog2-f/exec', {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' }, // see note below
              body: JSON.stringify({ csv }),

            })

            const text = await response.text()
            console.log('Apps Script raw response:', text)

            return JSON.parse(text)
          } catch (err) {
            console.error('uploadCsvToGoogleSheet failed:', err)
            throw err
          }
        }
      })

      on('task', {
        waitIndefinitelyForSpecificFileAction() {
          function check(attempt = 0): Promise<null> {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                const files = fs.readdirSync('cypress/downloads')
                const closedPath = files.find(f => f.startsWith('Closed Tickets -') && f.endsWith('.csv'))
                const openPath = files.find(f => f.startsWith('Open Tickets -') && f.endsWith('.csv'))

                if (closedPath && openPath) {
                  resolve(null)
                } else if (attempt >= 30) { // 30 seconds max
                  reject(new Error('Timed out waiting for Open/Closed Tickets CSV files'))
                } else {
                  resolve(check(attempt + 1))
                }
              }, 5000)
            })
          }

          return check()
        }
      })

      on('task', {
        deleteFilesInDownload() {
          const files = fs.readdirSync('cypress/downloads')
          if (files.length > 0) {
            files.forEach((file) => {
              fs.unlinkSync(path.join('cypress/downloads', file));
            })
          }
          return null;
        }
      })

    },
  },
});
