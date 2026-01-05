import { format } from 'date-fns'

export const generateICS = (
  title: string,
  description: string,
  date: Date,
  url?: string,
) => {
  const formattedDate = format(date, "yyyyMMdd'T'HHmmss")
  const endDate = format(
    new Date(date.getTime() + 60 * 60 * 1000),
    "yyyyMMdd'T'HHmmss",
  ) // 1 hour duration
  const now = format(new Date(), "yyyyMMdd'T'HHmmss")

  const fullDescription = `${description}${url ? `\n\nLink: ${url}` : ''}`

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StratManager//NONSGML v1.0//EN',
    'BEGIN:VEVENT',
    `UID:${now}-${title.replace(/\s/g, '-')}@stratmanager.com`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${formattedDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:Deadline: ${title}`,
    `DESCRIPTION:${fullDescription.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')

  return icsContent
}

export const downloadICS = (
  title: string,
  description: string,
  date: string | Date,
  url?: string,
) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const icsContent = generateICS(title, description, dateObj, url)

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}_deadline.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
