'use strict'
const { Link, LinkDTO, initDB } = require('./utils')


module.exports = async (event, context) => {
  console.log("Request", JSON.stringify(event));
  const SORT_DIRECTION = ['asc', 'desc']
  const queryParams = event.query || {}
  const page = queryParams.page || 1
  const pageSize = queryParams.limit || 10
  const sortByDirection = queryParams.sort && SORT_DIRECTION.includes(queryParams.sort) ? queryParams.sort : 'desc'
  const search = queryParams.search || null
  const type = queryParams.type || null

  const db = initDB()
  if (!db) {
    return context
      .headers(
        {
          'Content-type': 'application/json',
          "Access-Control-Allow-Origin": "*"
        }
      )
      .status(500)
      .succeed({ errorCode: 'INTERNAL_SERVER_ERROR', errorDetail: "Failed to connect to DB" })
  }
  const options = {
    page,
    limit: pageSize,
    sort: { createdAt: sortByDirection }
  }
  let filter = search
    ? { "url": { "$regex": search, "$options": "i" } }
    : {}
  if (type) {
    filter = { ...filter, "type": type }
  }
  console.log("DB options", filter, options)
  const result = await Link.paginate(filter, options)
  const { docs, hasNextPage, hasPrevPage } = result
  const response = {
    assets: docs.map(link => LinkDTO(link)),
    hasNextPage,
    hasPrevPage
  }
  return context
    .headers(
      {
        'Content-type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      }
    )
    .status(200)
    .succeed(response)
}
