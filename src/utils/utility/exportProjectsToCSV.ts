export const exportProjectsToCSV = (projects: any[]) => {
  if (!projects.length) return
  const headers = Object.keys(projects[0])
  const csvRows = [headers.join(',')]
  for (const project of projects) {
    csvRows.push(headers.map(h => JSON.stringify(project[h] ?? '')).join(','))
  }
  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'projects.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}
