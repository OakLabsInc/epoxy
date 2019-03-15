const {URL, format} = require('url')

module.exports = (str) => {
  if (typeof str !== 'string') return str
  if (str.startsWith('//')) str = 'http:' + str
  if (!str.startsWith('http')) str = 'http://' + str

  const url = new URL(str)
  return format(url)
}
