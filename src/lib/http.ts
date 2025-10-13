export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? '20')))
  const skip = (page - 1) * pageSize
  const take = pageSize
  return { page, pageSize, skip, take }
}

export function getPaginationMeta(page: number, pageSize: number, total: number) {
  const totalPages = Math.ceil(total / pageSize)
  const hasNext = page < totalPages
  const hasPrev = page > 1
  return { page, pageSize, total, totalPages, hasNext, hasPrev }
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

export function serverError(message = 'Internal Server Error') {
  return Response.json({ error: message }, { status: 500 })
}


